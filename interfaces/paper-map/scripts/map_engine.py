"""Canonical paper-map identity, lifecycle, localization, geometry and quality gates."""
from __future__ import annotations

import argparse
from collections import Counter
import copy
import hashlib
import importlib.util
import json
import math
from pathlib import Path
import re
import unicodedata

ASSETS = Path(__file__).resolve().parents[1] / 'assets'
WIDTH, HEIGHT = 170, 116
STATUS = {'supported', 'hypothesis', 'unresolved', 'inferred', 'design', 'disputed', 'user'}


class MapError(ValueError):
    pass


def detail_module():
    spec=importlib.util.spec_from_file_location('paper_detail_views',Path(__file__).with_name('detail_views.py'))
    result=importlib.util.module_from_spec(spec);spec.loader.exec_module(result);return result


DETAIL=detail_module()


def stable_json(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':'), allow_nan=False)


def digest(value):
    return hashlib.sha256(stable_json(value).encode('utf-8')).hexdigest()


def key(text):
    return re.sub(r'[\s_-]+', '', unicodedata.normalize('NFKC', str(text)).casefold())


def units(text):
    return sum(1 if unicodedata.east_asian_width(c) in 'WF' else .56 for c in str(text))


def unique(items):
    return [json.loads(s) for s in sorted({stable_json(x) for x in items})]


def qualifiers(value):
    if value is None:
        return {}
    if not isinstance(value, dict):
        raise MapError('qualifiers must be structured objects, not free prose')
    def clean(v):
        if isinstance(v, dict):
            return {k: clean(v[k]) for k in sorted(v) if v[k] not in (None, '', [], {})}
        if isinstance(v, list):
            return unique([clean(x) for x in v])
        if isinstance(v, str):
            return unicodedata.normalize('NFC', v.strip())
        if isinstance(v, (bool, int, float)):
            return v
        raise MapError('invalid qualifier value')
    return clean(value)


def identity(node):
    data = node.get('identity')
    if not isinstance(data, dict) or not all(data.get(k) for k in ('kind', 'scope', 'referent')):
        raise MapError(f"node {node.get('id', '?')} needs identity.kind/scope/referent")
    return qualifiers(data)


def node_id(node):
    return 'node_' + digest(identity(node))[:16]


def semantic_key(link):
    return stable_json([link['from'], link['to'], link['relationType'], qualifiers(link.get('qualifiers'))])


class Registry:
    def __init__(self, assets=ASSETS, extensions=None):
        self.assets = Path(assets)
        source = json.loads((self.assets / 'relation-registry.json').read_text(encoding='utf-8'))
        self.version = source['version']
        self.definitions = {}
        self.aliases = {}
        for definition in source['relations']:
            self.register(definition)
        for definition in extensions or []:
            if not definition.get('id', '').startswith('x:'):
                raise MapError('custom relation IDs must use the x: namespace')
            if not definition.get('reason') or not definition.get('examples'):
                raise MapError('a custom relation needs a reuse/split review reason and examples')
            for old in self.definitions.values():
                if key(old['definition']) == key(definition.get('definition')):
                    raise MapError('same relation definition already exists; reuse its ID')
            self.register(definition)

    def register(self, definition):
        d = copy.deepcopy(definition)
        if not all(d.get(k) for k in ('id', 'label', 'family', 'definition')):
            raise MapError('relation definition is incomplete')
        if d['id'] in self.definitions:
            raise MapError('cannot redefine an existing relation ID')
        if units(d['label']) > 8:
            raise MapError('relation label must be concise; move conditions to qualifiers')
        self.definitions[d['id']] = d
        entries = [(d['id'], False), (d['label'], False)]
        entries += [(a, False) for a in d.get('aliases', [])]
        entries += [(a, True) for a in d.get('inverseAliases', [])]
        for alias, reverse in entries:
            token = key(alias)
            value = (d['id'], reverse)
            if token in self.aliases and self.aliases[token] != value:
                raise MapError(f'conflicting relation alias: {alias}')
            self.aliases[token] = value

    def resolve(self, token):
        result = self.aliases.get(key(token))
        if result is None:
            raise MapError(f'unknown relation {token!r}; select a registered meaning before adding a type')
        return result

    def normalize(self, raw):
        e = copy.deepcopy(raw)
        token = e.get('relationType') or e.get('label')
        relation, reverse = self.resolve(token)
        definition = self.definitions[relation]
        if raw.get('relationType') and raw.get('label'):
            label_relation, label_reverse = self.resolve(raw['label'])
            if (label_relation, label_reverse) != (relation, reverse):
                raise MapError('relation ID, label or direction disagree; do not hide a semantic change')
        old_labels = e.get('originalLabels', [])
        if e.get('label') and e['label'] != definition['label']:
            old_labels = unique(old_labels + [e['label']])
        if reverse:
            e['from'], e['to'] = e['to'], e['from']
        if definition.get('symmetric') and e['from'] > e['to']:
            e['from'], e['to'] = e['to'], e['from']
        e['relationType'], e['label'] = relation, definition['label']
        e['qualifiers'] = qualifiers(e.get('qualifiers'))
        e['originalLabels'] = old_labels
        e['sourceRefs'] = unique(e.get('sourceRefs', []))
        e['semanticKey'] = semantic_key(e)
        e.setdefault('id', 'edge_' + digest(e['semanticKey'])[:16])
        e.setdefault('primary', True)
        return e

    def viewer_definition(self, relation):
        d = self.definitions[relation]
        return {'id': relation, 'label': d['label'], 'family': d['family'],
                'familyLabel': d['family'],
                'definition': d['definition'], 'directed': not d.get('symmetric', False),
                'marker': d.get('marker', 'arrow'),
                'caveat': 'Meaning and evidence state are separate; support, sequence, and association do not establish causality.'}


def locale_for(state, assets=ASSETS):
    settings=state.get('settings') or {}
    language=(settings.get('interactionLanguage') or {}).get('tag')
    if settings.get('status')!='confirmed' or not language:
        raise MapError('confirm and persist the session language before producing a map')
    assets=Path(assets)
    default=json.loads((assets/'locale-en.json').read_text(encoding='utf-8'))
    lock=json.loads((assets/'template-lock.json').read_text(encoding='utf-8'))
    if hashlib.sha256((assets/'locale-en.json').read_bytes()).hexdigest()!=lock['localeSha256']:
        raise MapError('default locale differs from the locked asset')
    g=state['graph'];raw=g.get('locale')
    if raw is None:
        if language.split('-')[0].lower()!='en':
            raise MapError('provide complete saved UI and relationship translations for the selected language')
        raw=copy.deepcopy(default);raw['languageTag']=language
        raw['nodeTypes'].update(g.get('nodeTypes',{}))
        for d in g.get('relationExtensions',[]):
            raw['relationLabels'][d['id']]=d['label'];raw['relationDefinitions'][d['id']]=d['definition']
    if raw.get('languageTag')!=language:
        raise MapError('map locale must match the confirmed interaction language')
    if language.split('-')[0].lower()=='en':
        merged=copy.deepcopy(default)
        for field,value in raw.items():
            if isinstance(value,dict) and isinstance(merged.get(field),dict):merged[field].update(value)
            else:merged[field]=copy.deepcopy(value)
        merged['ui'].update(default['ui'])
        raw=merged
    required_relations={'note'}|{e['relationType'] for e in g['links']}
    required={'ui':set(default['ui']),'statuses':STATUS,
              'nodeTypes':{n['type'] for n in g['nodes']},
              'families':{Registry(assets,g.get('relationExtensions')).definitions[r]['family'] for r in required_relations},
              'relationLabels':required_relations,'relationDefinitions':required_relations}
    for field,keys in required.items():
        values=raw.get(field)
        if not isinstance(values,dict) or any(not isinstance(values.get(k),str) or not values[k].strip() for k in keys):
            raise MapError('incomplete selected-language locale field: '+field)
    labels=[key(raw['relationLabels'][r]) for r in required_relations]
    if len(set(labels))!=len(labels):
        raise MapError('different predicates cannot silently share one ambiguous localized label')
    return copy.deepcopy(raw)


def normalize(state, assets=ASSETS):
    s = copy.deepcopy(state)
    if not isinstance(s.get('graph'), dict):
        raise MapError('graph is absent; create a scoped main tree first')
    g = s['graph']
    shapes=json.loads((Path(assets)/'node-shapes.json').read_text(encoding='utf-8'))
    lock=json.loads((Path(assets)/'template-lock.json').read_text(encoding='utf-8'))
    if g.get('layoutVersion')!=lock['layoutVersion']:
        for view in g['trees']:view['routes']={}
    g['nodeShapes']=shapes
    registry = Registry(assets, g.get('relationExtensions'))
    g.setdefault('retiredNodes', [])
    g.setdefault('retiredLinks', [])
    g.setdefault('redirects', {})
    g.setdefault('linkRedirects', {})
    for n in g['nodes']:
        identity(n)
        n.setdefault('visualRole',shapes['typeRoles'].get(n['type'],'concept'))
        n.setdefault('id', node_id(n))
        n['label'] = unicodedata.normalize('NFC', n['label'].strip())
        n['aliases'] = unique(n.get('aliases', []))
        n['sourceRefs'] = unique(n.get('sourceRefs', []))
    g['nodes'].sort(key=lambda n:n['id'])
    entries, redirects, by_semantics = [], {}, {}
    for raw in sorted(g['links'], key=lambda e: (e.get('createdRevision', 0), e.get('id', ''))):
        edge = registry.normalize(raw)
        previous = by_semantics.get(edge['semanticKey'])
        if previous:
            if previous.get('status') != edge.get('status'):
                raise MapError('duplicate relation has different evidence states; review rather than silently merge')
            previous['sourceRefs'] = unique(previous['sourceRefs'] + edge['sourceRefs'])
            previous['originalLabels'] = unique(previous['originalLabels'] + edge['originalLabels'])
            redirects[edge['id']] = previous['id']
        else:
            by_semantics[edge['semanticKey']] = edge
            entries.append(edge)
    g['links'] = sorted(entries, key=lambda e: e['id'])
    g['linkRedirects'].update(redirects)
    for t in g['trees']:
        t.setdefault('kind','narrative')
        if t['kind']=='catalog':t.setdefault('rootId',None)
        t['nodeIds'] = sorted(set(t['nodeIds']),key=lambda i:(i!=t['rootId'],i))
        t['linkIds'] = sorted(set(redirects.get(i, i) for i in t['linkIds']))
        t.setdefault('positions', {})
        t['positions']={i:p for i,p in t['positions'].items() if i in t['nodeIds']}
        t.setdefault('routes', {})
        old_routes=t['routes'];t['routes']={}
        for i in sorted(old_routes,key=lambda i:(i in redirects,i)):
            if redirects.get(i,i) in t['linkIds']:t['routes'].setdefault(redirects.get(i,i),old_routes[i])
        if t['id'] == 'main':
            t['title'] = s['paper']['title']
    g['trees'].sort(key=lambda t:(t['id']!='main',t['id']))
    g['registryVersion'] = registry.version
    lock = json.loads((Path(assets) / 'template-lock.json').read_text(encoding='utf-8'))
    g['layoutVersion'], g['templateVersion'] = lock['layoutVersion'], lock['version']
    g['relationTypes'] = {i: registry.viewer_definition(i) for i in sorted({'note'} | {e['relationType'] for e in entries})}
    g['locale']=locale_for(s,assets)
    for e in g['links']:
        e['displayLabel']=g['locale']['relationLabels'][e['relationType']]
        e['displayStatusSuffix']=g['locale']['ui'].get(e['status']+'Suffix','')
    return s


def rectangle(p, padding=0):
    return (p['x'] - padding, p['y'] - padding, p['x'] + WIDTH + padding, p['y'] + HEIGHT + padding)


def intersects(a, b):
    return a[0] < b[2] and a[2] > b[0] and a[1] < b[3] and a[3] > b[1]


def inside(point, r):
    return r[0] < point[0] < r[2] and r[1] < point[1] < r[3]


def point_near_segment(p, a, b, margin=8):
    dx, dy = b[0] - a[0], b[1] - a[1]
    if dx == 0 and dy == 0:
        return math.dist(p, a) < margin
    t = max(0, min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)))
    return math.dist(p, (a[0] + t * dx, a[1] + t * dy)) < margin


def path_hits_rect(points, r):
    for a, b in zip(points, points[1:]):
        for i in range(max(2, int(math.dist(a, b) / 5) + 1)):
            p = (a[0] + (b[0] - a[0]) * i / max(1, int(math.dist(a, b) / 5)),
                 a[1] + (b[1] - a[1]) * i / max(1, int(math.dist(a, b) / 5)))
            if inside(p, r):
                return True
    return False


def display_label(e):
    return e.get('displayLabel',e['label'])+e.get('displayStatusSuffix','')


def label_box(e, x, y, padding=0):
    # Match the fixed browser renderer's conservative width calculation.
    w = max(42, len(display_label(e)) * 11 + 14)
    return (x - w / 2 - padding, y - 12 - padding, x + w / 2 + padding, y + 12 + padding)


def find_spot(tree, node_id, anchor_id=None):
    positions = tree['positions']
    if tree.get('kind')=='catalog':
        occupied=[rectangle(p,18) for p in positions.values()]
        for index in range(len(positions)*4+12):
            p={'x':40+(index%4)*230,'y':60+(index//4)*160}
            if not any(intersects(rectangle(p,18),r) for r in occupied):return p
        return {'x':40,'y':max(p['y'] for p in positions.values())+160}
    if not positions:
        return {'x': 400, 'y': 100}
    base = positions.get(anchor_id or tree['rootId'], next(iter(positions.values())))
    occupied = [rectangle(p, 18) for p in positions.values()]
    old_routes = list(tree.get('routes', {}).values())
    angles = [0, .65, -.65, 1.3, -1.3, math.pi, math.pi + .65, math.pi - .65]
    for radius in range(310, 2500, 130):
        for angle in angles:
            p = {'x': round((base['x'] + math.cos(angle) * radius) / 10) * 10,
                 'y': round((base['y'] + math.sin(angle) * radius) / 10) * 10}
            if p['x'] < 40 or p['y'] < 45:
                continue
            box = rectangle(p, 18)
            if any(intersects(box, r) for r in occupied):
                continue
            if any(intersects(box, tuple(r.get('labelBox', (0, 0, 0, 0)))) or
                   path_hits_rect(r.get('points', []), box) for r in old_routes):
                continue
            return p
    return {'x': max(p['x'] for p in positions.values()) + 340, 'y': base['y']}


def bezier(a, c1, c2, b, t):
    return tuple((1-t)**3*a[i] + 3*(1-t)**2*t*c1[i] + 3*(1-t)*t*t*c2[i] + t**3*b[i] for i in (0, 1))


def node_profile(n, shapes):
    role=n.get('visualRole') or shapes['typeRoles'].get(n['type'],'concept')
    return shapes['roles'][role]


def shape_anchor(n, p, toward, shapes):
    profile=node_profile(n,shapes)
    cx,cy=p['x']+WIDTH/2,p['y']+HEIGHT/2
    dx,dy=toward[0]-cx,toward[1]-cy
    if not dx and not dy:dx=1
    a,b=profile['width']/2,profile['height']/2
    if profile['shape'] in ('ellipse','circle'):
        t=1/math.sqrt(dx*dx/(a*a)+dy*dy/(b*b))
    else:
        vertices=([(-a+20,-b),(a-20,-b),(a,0),(a-20,b),(-a+20,b),(-a,0)]
                  if profile['shape']=='hexagon' else [(-a,-b),(a,-b),(a,b),(-a,b)])
        t=math.inf
        for i,v in enumerate(vertices):
            w=vertices[(i+1)%len(vertices)];ex,ey=w[0]-v[0],w[1]-v[1]
            den=dx*ey-dy*ex
            if abs(den)<1e-8:continue
            ray=(v[0]*ey-v[1]*ex)/den;u=(v[0]*dy-v[1]*dx)/den
            if ray>=0 and 0<=u<=1:t=min(t,ray)
        if not math.isfinite(t):t=1
    return cx+dx*t,cy+dy*t


def shape_signature(e,nodes,shapes):
    return digest([nodes[e['from']]['visualRole'],nodes[e['to']]['visualRole'],shapes])


def curve_route(e, tree, edges, nodes, shapes, choice=0):
    a,b=tree['positions'][e['from']],tree['positions'][e['to']]
    ac=(a['x']+WIDTH/2,a['y']+HEIGHT/2);bc=(b['x']+WIDTH/2,b['y']+HEIGHT/2)
    dx,dy=bc[0]-ac[0],bc[1]-ac[1];length=max(1,math.hypot(dx,dy));normal=(-dy/length,dx/length)
    reverse=any(x['from']==e['to'] and x['to']==e['from'] and x['id']!=e['id'] for x in edges)
    if e['from']==e['to']:
        c1=(ac[0]+150+choice*25,ac[1]-110);c2=(ac[0]-150-choice*25,ac[1]-110)
    elif choice<13:
        offsets=([90,150,230,310,410,520,650,800,960,1120,1280,1450,1620]
                 if reverse else [0,70,-70,140,-140,230,-230,340,-340,500,-500,720,-720])
        offset=offsets[choice]
        tx,ty=(dx*.45,0) if abs(dx)>=abs(dy) else (0,dy*.45)
        c1=(ac[0]+tx+normal[0]*offset,ac[1]+ty+normal[1]*offset)
        c2=(bc[0]-tx+normal[0]*offset,bc[1]-ty+normal[1]*offset)
    else:
        side=(choice-13)%4;tier=(choice-13)//4
        positions=tree['positions'].values();margin=90+tier*110
        if side==0:
            y=max(p['y'] for p in positions)+HEIGHT+margin;c1=(ac[0],y);c2=(bc[0],y)
        elif side==1:
            x=max(p['x'] for p in positions)+WIDTH+margin;c1=(x,ac[1]);c2=(x,bc[1])
        elif side==2:
            y=min(p['y'] for p in positions)-margin;c1=(ac[0],y);c2=(bc[0],y)
        else:
            x=min(p['x'] for p in positions)-margin;c1=(x,ac[1]);c2=(x,bc[1])
    start=shape_anchor(nodes[e['from']],a,c1,shapes);end=shape_anchor(nodes[e['to']],b,c2,shapes)
    points=[bezier(start,c1,c2,end,i/80) for i in range(81)]
    def fmt(p):return f'{p[0]:.2f} {p[1]:.2f}'
    return {'d':f'M{fmt(start)} C{fmt(c1)} {fmt(c2)} {fmt(end)}','points':points}


def finish_route(route, edge, tree, already):
    positions = tree['positions']
    points = route['points']
    if any(path_hits_rect(points[2:-2] if len(points)>10 else points, rectangle(p, 6))
           for ident,p in positions.items() if ident not in (edge['from'],edge['to'])):
        return None
    candidates = []
    # Prefer the previous prototype's midpoint, then other positions on the same curve.
    for fraction in (.5,.35,.65,.25,.75,.15,.85):
        if len(points) > 20:
            candidates.append(points[round((len(points)-1)*fraction)])
    for a,b in sorted(zip(points,points[1:]), key=lambda pair: -math.dist(*pair)):
        if math.dist(a,b) >= 26:
            candidates += [(a[0]+(b[0]-a[0])*f, a[1]+(b[1]-a[1])*f) for f in (.5,.3,.7)]
    node_boxes = [rectangle(p, 8) for p in positions.values()]
    for x,y in candidates:
        box = label_box(edge,x,y,4)
        if any(intersects(box,r) for r in node_boxes):
            continue
        if any(intersects(box,r['labelBox']) or path_hits_rect(r['points'],box) for r in already):
            continue
        result = copy.deepcopy(route)
        result.update(x=round(x,2), y=round(y,2), labelBox=[round(v,2) for v in box],
                      labelKey=display_label(edge), format='stable-local-1',
                      endpointSignature=digest([edge['from'],positions[edge['from']],edge['to'],positions[edge['to']]]))
        result['points'] = [[round(v,2) for v in p] for p in points]
        result['bounds'] = {'maxX': round(max([p[0] for p in points]+[box[2]])+24,2),
                            'maxY': round(max([p[1] for p in points]+[box[3]])+24,2)}
        return result
    return None


def layout(state, assets=ASSETS, repair=False):
    s = copy.deepcopy(state)
    edges = {e['id']: e for e in s['graph']['links']}
    nodes={n['id']:n for n in s['graph']['nodes']};shapes=s['graph']['nodeShapes']
    for tree in s['graph']['trees']:
        for ident in sorted(tree['nodeIds'], key=lambda n:(n != tree['rootId'],n)):
            if ident not in tree['positions']:
                linked = next((e['from'] if e['from']!=ident else e['to'] for e in edges.values()
                               if ident in (e['from'],e['to']) and
                               (e['from'] if e['from']!=ident else e['to']) in tree['positions']), None)
                tree['positions'][ident] = find_spot(tree,ident,linked)
        if tree.get('detailViews'):
            tree['routes']={};continue
        existing = tree.get('routes', {})
        routes, used = {}, []
        view_edges = [edges[i] for i in tree['linkIds']]
        order = sorted(view_edges, key=lambda e:(e['id'] not in existing,e['id']))
        for e in order:
            old = existing.get(e['id'])
            route = None
            signature=digest([e['from'],tree['positions'][e['from']],e['to'],tree['positions'][e['to']]])
            if old and old.get('format')=='stable-local-1' and old.get('labelKey')==display_label(e) and old.get('endpointSignature')==signature and old.get('shapeSignature')==shape_signature(e,nodes,shapes) and not repair:
                if not any(intersects(tuple(old['labelBox']),rectangle(p,8)) for p in tree['positions'].values()):
                    route = copy.deepcopy(old)
            if route is None:
                for choice in range(45):
                    candidate=curve_route(e,tree,view_edges,nodes,shapes,choice)
                    route=finish_route(candidate,e,tree,used)
                    if route:
                        break
            if route is None:
                raise MapError(f"no readable route/label for {e['id']}; split the tree or explicitly repair layout")
            route['shapeSignature']=shape_signature(e,nodes,shapes)
            routes[e['id']] = route
            used.append(route)
        tree['routes'] = routes
    return s


def check_route_geometry(t,ids,link_ids,edges,nodes,shapes):
        for index,i in enumerate(ids):
            for j in ids[index+1:]:
                if intersects(rectangle(t['positions'][i],12),rectangle(t['positions'][j],12)):raise MapError('overlapping detail nodes')
        label_boxes=[]
        for i in link_ids:
            route=t.get('routes',{}).get(i)
            if not route or route.get('format')!='stable-local-1' or not route.get('points'):
                raise MapError('each visible edge needs a validated stable route')
            link=edges[i]
            signature=digest([link['from'],t['positions'][link['from']],link['to'],t['positions'][link['to']]])
            if route.get('endpointSignature')!=signature:
                raise MapError('route endpoints do not match the current nodes and positions')
            if route.get('shapeSignature')!=shape_signature(edges[i],nodes,shapes):
                raise MapError('route does not match the current semantic shapes')
            if re.findall('[A-Za-z]',route.get('d','')) not in (['M','C'],['M','L']):
                raise MapError('connections must be smooth cubic curves or single straight lines')
            box=tuple(route['labelBox'])
            if any(intersects(box,rectangle(t['positions'][n],6)) for n in ids):
                raise MapError('edge label overlaps a node')
            if any(intersects(box,old) for old in label_boxes):
                raise MapError('edge labels overlap')
            if any(path_hits_rect(route['points'],rectangle(t['positions'][n],4))
                   for n in ids if n not in (edges[i]['from'],edges[i]['to'])):
                raise MapError('edge crosses an unrelated node')
            label_boxes.append(box)


def check(state, assets=ASSETS, geometry=True):
    if state.get('schemaVersion') != 2 or not state.get('paper',{}).get('id'):
        raise MapError('identified paper session with schemaVersion 2 is required')
    g = state.get('graph')
    if not isinstance(g,dict) or not g.get('nodes') or not g.get('trees'):
        raise MapError('active graph cannot be empty')
    registry = Registry(assets,g.get('relationExtensions'))
    lock = json.loads((Path(assets)/'template-lock.json').read_text(encoding='utf-8'))
    registry_bytes=(Path(assets)/'relation-registry.json').read_bytes()
    if hashlib.sha256(registry_bytes).hexdigest()!=lock['registrySha256'] or registry.version!=lock['registryVersion']:
        raise MapError('relation registry differs from the locked version; explicit semantic migration is required')
    shapes_path=Path(assets)/'node-shapes.json'
    if hashlib.sha256(shapes_path.read_bytes()).hexdigest()!=lock['shapesSha256']:
        raise MapError('node shapes differ from the locked presentation')
    shapes=json.loads(shapes_path.read_text(encoding='utf-8'))
    if g.get('nodeShapes')!=shapes:
        raise MapError('normalize the shaped-map presentation before rendering')
    locale=locale_for(state,assets)
    if g.get('locale')!=locale:
        raise MapError('normalize and save the complete map locale before rendering')
    nodes, edges = {n['id']:n for n in g['nodes']},{e['id']:e for e in g['links']}
    if len(nodes)!=len(g['nodes']) or len(edges)!=len(g['links']):
        raise MapError('duplicate active IDs')
    source_ids = {s['id'] for s in state.get('sources',[])}
    terms={t['id']:t for t in state.get('glossary',[])}
    if len(terms)!=len(state.get('glossary',[])):raise MapError('glossary IDs must be unique')
    if len(source_ids)!=len(state.get('sources',[])):
        raise MapError('source IDs must be unique')
    identities = {}
    warnings = []
    for ident,n in nodes.items():
        k = stable_json(identity(n))
        if k in identities:
            raise MapError('duplicate semantic node identity; merge or correct its scope')
        identities[k] = ident
        if not n.get('label') or not n.get('title') or not n.get('detail') or not n.get('type'):
            raise MapError('nodes need concise labels and explanatory detail')
        if n['type'] not in lock['nodeTypes'] and not isinstance(g.get('nodeTypes',{}).get(n['type']),str):
            raise MapError('unknown node type needs an explicit graph.nodeTypes display definition')
        if units(n['label']) > lock['nodeLabelMaxUnits']:
            raise MapError(f'node label too long: {ident}; put explanation in the sidebar')
        if n.get('visualRole') not in shapes['roles']:
            raise MapError('node visualRole must be one registered semantic presentation role')
        if units(n['label']) > lock['nodeLabelPreferredUnits']:
            warnings.append({'code':'long-label','id':ident})
        if not isinstance(n.get('aliases',[]),list):
            raise MapError('node aliases must be a list')
        if any(i not in terms for i in n.get('termIds',[])):
            raise MapError('node termIds must reference the shared glossary')
        for ref in n.get('sourceRefs',[]):
            if ref.get('sourceId') not in source_ids or not ref.get('location'):
                raise MapError('node source is missing or unlocatable')
    keys = set()
    for ident,e in edges.items():
        if e['from'] not in nodes or e['to'] not in nodes:
            raise MapError('dangling edge endpoint')
        d = registry.definitions.get(e.get('relationType'))
        if not d or e.get('label')!=d['label'] or e.get('semanticKey')!=semantic_key(e):
            raise MapError('edge must use the canonical registered ID, label and semantic key')
        if e.get('displayLabel')!=locale['relationLabels'][e['relationType']] or e.get('displayStatusSuffix')!=locale['ui'].get(e['status']+'Suffix',''):
            raise MapError('localized edge text must come from the one saved predicate/status dictionary')
        if e['semanticKey'] in keys:
            raise MapError('duplicate semantic edge')
        keys.add(e['semanticKey'])
        if e['from']==e['to'] and not d.get('allowSelf'):
            raise MapError('self relation is not meaningful for this predicate')
        if e.get('status') not in STATUS or not e.get('meaning'):
            raise MapError('edge explanation and evidence state are required')
        if d['family'] in ('causal','logic') and e['status']=='unresolved':
            raise MapError('use an explicit hypothesis or unresolved question, not an unqualified causal/logical assertion')
        if d['family'] in ('causal','logic','association','interaction') and e['status']=='design' and not state['paper'].get('isFictional'):
            raise MapError('design is not an evidence status for a scientific assertion; choose a justified state')
        if e['status'] in ('supported','inferred','disputed') and not e.get('sourceRefs'):
            raise MapError('an evidential assertion needs traceable source references')
        if d.get('requiredSupportedField') and e['status']=='supported' and not e.get(d['requiredSupportedField']):
            raise MapError(f"supported {d['id']} needs {d['requiredSupportedField']}")
        for ref in e.get('sourceRefs',[]):
            if ref.get('sourceId') not in source_ids or not ref.get('location'):
                raise MapError('edge source is missing or unlocatable')
    if sum(t['id']=='main' for t in g['trees'])!=1 or len({t['id'] for t in g['trees']})!=len(g['trees']):
        raise MapError('exactly one main tree and unique tree IDs are required')
    membership, edge_membership = Counter(),Counter()
    for t in g['trees']:
        ids,link_ids=t['nodeIds'],t['linkIds']
        kind=t.get('kind','narrative')
        if kind not in ('narrative','catalog'):raise MapError('unknown tree kind')
        if not ids or not t.get('title'):raise MapError('a view needs a title and visible members')
        if kind=='catalog':
            if t['id']=='main' or t.get('rootId') is not None or not t.get('topicDescription'):
                raise MapError('a topic catalog is secondary, rootless, and needs a topic description')
            for ident in ids:
                if not nodes[ident].get('termIds') or any(not terms[i].get('definition') for i in nodes[ident]['termIds']):
                    raise MapError('catalog members need a defined shared glossary term')
                for term in (terms[i] for i in nodes[ident]['termIds']):
                    basis=term.get('sourceRefs') or term.get('sources') or nodes[ident].get('sourceRefs')
                    if not basis or any(r.get('sourceId') not in source_ids or not (r.get('location') or r.get('locator')) for r in basis):
                        raise MapError('catalog definitions need a traceable source basis')
                    for facet in term.get('facets',[]):
                        if not facet.get('label') or not facet.get('value') or not facet.get('sourceRefs'):
                            raise MapError('term properties need a label, value, and traceable basis')
                        if any(r.get('sourceId') not in source_ids or not r.get('location') for r in facet['sourceRefs']):
                            raise MapError('term property source is missing or unlocatable')
        elif not t.get('focusQuestion') or t.get('rootId') not in ids:
            raise MapError('narrative tree needs a focus question and visible root')
        if t['id']!='main' and t['title']==state['paper']['title']:
            raise MapError('name a secondary tree by its question, not the paper title')
        if len(ids)!=len(set(ids)) or len(link_ids)!=len(set(link_ids)):
            raise MapError('duplicate tree membership')
        if any(i not in nodes for i in ids) or any(i not in edges for i in link_ids):
            raise MapError('tree references inactive objects')
        if any(edges[i]['from'] not in ids or edges[i]['to'] not in ids for i in link_ids):
            raise MapError('tree links must connect visible members')
        for primary_only in (() if kind=='catalog' or t.get('detailViews') else (False,True)):
            seen={t['rootId']}
            while True:
                before=len(seen)
                for ident in link_ids:
                    link=edges[ident]
                    if primary_only and link.get('primary') is False:continue
                    if link['from'] in seen or link['to'] in seen:seen.update((link['from'],link['to']))
                if len(seen)==before:break
            if seen!=set(ids):
                raise MapError('every visible node needs a readable path from the root, including the initial primary view')
        kinds={edges[i]['relationType'] for i in link_ids}
        if not t.get('detailViews') and len(kinds)>lock['maxRelationTypesPerTree']:
            raise MapError(f"tree {t['id']} has {len(kinds)} relation types; split by a meaningful question before rendering")
        if len(ids)>lock['warnNodesPerTree']:
            if not t.get('densityReview',{}).get('reason'):
                raise MapError('large tree needs an explicit readability/split review')
            warnings.append({'code':'large-tree-reviewed','id':t['id']})
        if kind=='narrative' and t['id']!='main' and not any(set(ids)&set(v['nodeIds']) for v in g['trees'] if v['id']!=t['id'] and v.get('kind','narrative')=='narrative'):
            raise MapError('secondary tree needs a visible shared-node connection')
        membership.update(ids)
        edge_membership.update(link_ids)
        for i in ids:
            p=t['positions'].get(i)
            if not p or any(not isinstance(p.get(k),(int,float)) or not math.isfinite(p[k]) or abs(p[k])>1e7 for k in ('x','y')):
                raise MapError('invalid node position')
        for index,i in enumerate([] if t.get('detailViews') else ids):
            for j in ids[index+1:]:
                if intersects(rectangle(t['positions'][i],12),rectangle(t['positions'][j],12)):
                    raise MapError(f'overlapping nodes: {i}, {j}')
        try:DETAIL.validate(t,g)
        except ValueError as error:raise MapError(str(error)) from error
        if geometry:
            if not t.get('detailViews'):check_route_geometry(t,ids,link_ids,edges,nodes,shapes)
            if t.get('detailViews'):
                for level in DETAIL.LEVELS:
                    plan,level_edges=DETAIL.project(t,g,level)
                    view={**t,'positions':plan['positions'],'routes':t.get('detailRoutes',{}).get(level,{})}
                    check_route_geometry(view,plan['nodeIds'],plan['linkIds'],{e['id']:e for e in level_edges},nodes,shapes)
    if any(not membership[i] for i in nodes) or any(not edge_membership[i] for i in edges):
        raise MapError('active objects need a visible tree; keep unshown material in the evidence index instead')
    return {'passed':True,'warnings':warnings,'nodes':len(nodes),'links':len(edges),'trees':len(g['trees']),
            'registryVersion':registry.version,'templateVersion':lock['version'],
            'browserVisualQA':'not performed by this checker','semanticSourceReview':'requires the selected expert'}


def prepare(state, assets=ASSETS, repair=False):
    result=normalize(state,assets)
    # Structure checks before geometry are useful, but missing positions are deliberately laid out first.
    result=layout(result,assets,repair=repair)
    try:result=DETAIL.geometry(result,layout,assets,repair=repair)
    except ValueError as error:raise MapError(str(error)) from error
    report=check(result,assets)
    return result,report


def plan(state, patch, assets=ASSETS):
    if patch.get('expectedRevision')!=state['revision'] or not patch.get('reason','').strip():
        raise MapError('patch needs the current expectedRevision and a concrete reason')
    if patch.get('roleVersion')!=(state.get('roleProfile') or {}).get('version'):
        raise MapError('restore the saved expert role before making map decisions')
    if patch.get('settingsVersion')!=(state.get('settings') or {}).get('version'):
        raise MapError('restore the saved language/preferences before making map decisions')
    if not patch.get('importance') or not set(patch['importance']) <= {'core_concept','evidence_change','relation_change','correction','unresolved_question'}:
        raise MapError('record why this update matters; routine repetition does not require a map change')
    review=patch.get('semanticReview',{})
    if not all(isinstance(review.get(k),str) and review[k].strip() for k in ('identity','relation','scope')):
        raise MapError('record concise public review notes for identity, relation meaning and source scope')
    current,_=prepare(state,assets)
    s=copy.deepcopy(current)
    g=s['graph']
    refs={}
    def resolve(i):
        return refs.get(i[1:],i) if isinstance(i,str) and i.startswith('$') else i
    def n(i):
        found=next((n for n in g['nodes'] if n['id']==resolve(i)),None)
        if found is None: raise MapError(f'unknown node {i}')
        return found
    def e(i):
        found=next((e for e in g['links'] if e['id']==resolve(i)),None)
        if found is None: raise MapError(f'unknown link {i}')
        return found
    def t(i):
        found=next((t for t in g['trees'] if t['id']==i),None)
        if found is None: raise MapError(f'unknown tree {i}')
        return found
    for op in patch.get('operations',[]):
        operation=op['op']
        if operation=='upsert_term':
            data=copy.deepcopy(op['term'])
            if not data.get('id') or not data.get('definition') or not op.get('reason'):
                raise MapError('a glossary term needs an ID, definition, and update reason')
            if not any(data.get(k) for k in ('targetTerm','target','sourceTerm','original','english','en')):
                raise MapError('a glossary term needs a recognizable name')
            old=next((v for v in s['glossary'] if v['id']==data['id']),None)
            if old:
                renamed=[old[k] for k in ('targetTerm','target','sourceTerm','original','english','en') if k in data and old.get(k) and data[k]!=old[k]]
                data['aliases']=unique(old.get('aliases',[])+data.get('aliases',[])+renamed)
                old.update(data)
            else:s['glossary'].append(data)
        elif operation=='add_node':
            data=copy.deepcopy(op['node']); identity(data)
            same=next((old for old in g['nodes'] if identity(old)==identity(data)),None)
            if same:
                ident=same['id']
            else:
                data.setdefault('id',node_id(data));ident=data['id']
                if any(old['id']==ident for old in g['nodes']):raise MapError('node ID collision')
                data.setdefault('createdRevision',state['revision']+1)
                g['nodes'].append(data)
            if op.get('ref'):refs[op['ref']]=ident
            view=t(op['treeId'])
            if ident not in view['nodeIds']:
                view['nodeIds'].append(ident)
                view['positions'][ident]=op.get('position') or find_spot(view,ident,resolve(op.get('anchorId')))
        elif operation=='update_node':
            data=n(op['id']); updates=copy.deepcopy(op['changes'])
            allowed={'label','title','detail','aliases','termIds','sourceRefs','limits','status','statusReason','claimIds'}
            if set(updates)-allowed:raise MapError('node identity/type changes need a new node or explicit merge')
            if updates.get('label') and updates['label']!=data['label']:
                updates['aliases']=unique(data.get('aliases',[])+updates.get('aliases',[])+[data['label']])
            data.update(updates)
        elif operation=='reclassify_node':
            data=n(op['id'])
            if not op.get('newType') or not op.get('identityUnchangedEvidence') or not op.get('reason'):
                raise MapError('classification changes need an explanation that the underlying referent is unchanged')
            data['type']=op['newType']
            data['visualRole']=g['nodeShapes']['typeRoles'].get(op['newType'],'concept')
        elif operation=='set_visual_role':
            data=n(op['id'])
            if op.get('visualRole') not in g['nodeShapes']['roles'] or not op.get('reason'):
                raise MapError('a semantic visual-role assignment needs a registered role and reason')
            data['visualRole']=op['visualRole']
        elif operation=='add_link':
            data=copy.deepcopy(op['link']);data['from']=resolve(data['from']);data['to']=resolve(data['to'])
            data.setdefault('createdRevision',state['revision']+1)
            canonical=Registry(assets,g.get('relationExtensions')).normalize(data)
            old=next((old for old in g['links'] if old['semanticKey']==canonical['semanticKey']),None)
            if old:
                if old['status']!=canonical['status']:raise MapError('use update_link to change evidence status')
                old['sourceRefs']=unique(old.get('sourceRefs',[])+canonical.get('sourceRefs',[]));ident=old['id']
            else:g['links'].append(canonical);ident=canonical['id']
            if op.get('ref'):refs[op['ref']]=ident
            view=t(op['treeId'])
            if ident not in view['linkIds']:view['linkIds'].append(ident)
        elif operation=='update_link':
            data=e(op['id']);updates=copy.deepcopy(op['changes'])
            allowed={'meaning','status','sourceRefs','causalBasis','proofBasis','inferenceBasis','primary'}
            if set(updates)-allowed:raise MapError('semantic relation changes require retiring the old link and adding a new one')
            data.update(updates)
        elif operation=='set_detail_views':
            if not op.get('reason'):raise MapError('detail plans need an explicit coverage and abstraction reason')
            view=t(op['treeId']);levels=copy.deepcopy(op['levels'])
            view['detailViews']=levels;view.pop('detailRoutes',None)
        elif operation=='add_tree':
            view=copy.deepcopy(op['tree']);view.setdefault('kind','narrative')
            if view['kind']=='catalog':view.setdefault('rootId',None);view.setdefault('nodeIds',[])
            else:
                view['rootId']=resolve(view['rootId']);n(view['rootId']);view.setdefault('nodeIds',[view['rootId']])
            view['nodeIds']=[resolve(i) for i in view['nodeIds']]
            view.setdefault('linkIds',[]);view.setdefault('positions',{});view.setdefault('routes',{})
            if any(old['id']==view['id'] for old in g['trees']):raise MapError('tree ID already exists')
            g['trees'].append(view)
        elif operation=='update_tree':
            view=t(op['id']);updates=copy.deepcopy(op['changes'])
            if set(updates)-{'title','focusQuestion','rootId','densityReview','kind','topicDescription'} or not op.get('reason'):
                raise MapError('tree updates need a reason and cannot silently replace membership or identity')
            if 'rootId' in updates:updates['rootId']=resolve(updates['rootId'])
            view.update(updates)
        elif operation=='archive_tree':
            view=t(op['id'])
            if view['id']=='main' or not op.get('reason'):raise MapError('the main tree cannot be archived; a reason is required')
            g.setdefault('retiredTrees',[]).append({'item':copy.deepcopy(view),'reason':op['reason'],'atRevision':state['revision']+1})
            g['trees']=[v for v in g['trees'] if v['id']!=view['id']]
        elif operation=='attach_node':
            data=n(op['nodeId']);view=t(op['treeId'])
            if data['id'] not in view['nodeIds']:
                view['nodeIds'].append(data['id']);view['positions'][data['id']]=op.get('position') or find_spot(view,data['id'],resolve(op.get('anchorId')))
        elif operation=='attach_link':
            data=e(op['linkId']);view=t(op['treeId'])
            if data['id'] not in view['linkIds']:view['linkIds'].append(data['id'])
        elif operation=='remove_from_tree':
            ident=n(op['nodeId'])['id'];view=t(op['treeId'])
            if ident==view['rootId']:
                if not op.get('replacementRootId'):raise MapError('removing a root needs an explicit replacement')
                view['rootId']=resolve(op['replacementRootId'])
            view['nodeIds']=[i for i in view['nodeIds'] if i!=ident]
            view['positions'].pop(ident,None)
            view['linkIds']=[i for i in view['linkIds'] if ident not in (e(i)['from'],e(i)['to'])]
        elif operation=='detach_link':
            view=t(op['treeId']);ident=e(op['linkId'])['id'];view['linkIds']=[i for i in view['linkIds'] if i!=ident]
        elif operation=='retire_link':
            data=e(op['id'])
            if not op.get('reason'):raise MapError('retirement reason required')
            g['retiredLinks'].append({'item':copy.deepcopy(data),'reason':op['reason'],'atRevision':state['revision']+1})
            g['links']=[i for i in g['links'] if i['id']!=data['id']]
            for view in g['trees']:view['linkIds']=[i for i in view['linkIds'] if i!=data['id']]
        elif operation=='retire_node':
            data=n(op['id'])
            if op.get('kind') not in ('artifact_error','out_of_scope') or not op.get('reason'):
                raise MapError('use merge for duplicates; refuted claims are retained with corrected status')
            if any(data['id'] in (link['from'],link['to']) for link in g['links']):
                raise MapError('explicitly retire/reassign incident links before retiring a node')
            if any(view['rootId']==data['id'] for view in g['trees']):raise MapError('replace tree roots first')
            g['retiredNodes'].append({'item':copy.deepcopy(data),'reason':op['reason'],'kind':op['kind'],'atRevision':state['revision']+1})
            g['nodes']=[i for i in g['nodes'] if i['id']!=data['id']]
            for view in g['trees']:
                view['nodeIds']=[i for i in view['nodeIds'] if i!=data['id']];view['positions'].pop(data['id'],None)
        elif operation=='restore_node':
            old=next((x for x in reversed(g['retiredNodes']) if x['item']['id']==op['id']),None)
            if not old or old.get('kind')=='merged' or not op.get('reason'):
                raise MapError('restore needs a retired non-merged node and a reason')
            if any(x['id']==op['id'] for x in g['nodes']):raise MapError('node is already active')
            data=copy.deepcopy(old['item']);g['nodes'].append(data);view=t(op['treeId'])
            view['nodeIds'].append(data['id']);view['positions'][data['id']]=find_spot(view,data['id'],resolve(op.get('anchorId')))
            old['restoredAtRevision']=state['revision']+1
        elif operation=='restore_link':
            old=next((x for x in reversed(g['retiredLinks']) if x['item']['id']==op['id']),None)
            if not old or not op.get('reason'):raise MapError('restore needs a retired link and a reason')
            if any(x['id']==op['id'] for x in g['links']):raise MapError('link is already active')
            g['links'].append(copy.deepcopy(old['item']));t(op['treeId'])['linkIds'].append(op['id']);old['restoredAtRevision']=state['revision']+1
        elif operation=='merge_nodes':
            source,target=n(op['sourceId']),n(op['targetId'])
            if source['id']==target['id']:continue
            if not op.get('reason') or (identity(source)!=identity(target) and not op.get('identityEvidence')):
                raise MapError('merging distinct node identities needs explicit same-referent evidence')
            source_id,target_id=source['id'],target['id']
            target['aliases']=unique(target.get('aliases',[])+source.get('aliases',[])+[source['label']])
            target['sourceRefs']=unique(target.get('sourceRefs',[])+source.get('sourceRefs',[]))
            g['redirects'][source_id]=target_id
            g['retiredNodes'].append({'item':copy.deepcopy(source),'reason':op['reason'],'kind':'merged','redirect':target_id,'atRevision':state['revision']+1})
            g['nodes']=[i for i in g['nodes'] if i['id']!=source_id]
            for link in g['links']:
                if link['from']==source_id:link['from']=target_id
                if link['to']==source_id:link['to']=target_id
                link['semanticKey']=semantic_key(link)
            for view in g['trees']:
                view['nodeIds']=[target_id if i==source_id else i for i in view['nodeIds']]
                if view['rootId']==source_id:view['rootId']=target_id
                if source_id in view['positions']:
                    view['positions'].setdefault(target_id,view['positions'][source_id]);view['positions'].pop(source_id)
                view['routes']={}
        elif operation=='move_node':
            if not patch.get('allowLayoutRepair') or not op.get('reason'):raise MapError('existing node moves need explicit repair intent and reason')
            view=t(op['treeId']);ident=n(op['id'])['id'];view['positions'][ident]={'x':op['x'],'y':op['y']};view['routes']={}
        else:
            raise MapError(f'unknown operation: {operation}')
    result,report=prepare(s,assets,repair=bool(patch.get('allowLayoutRepair')))
    report['glossaryChanged']=stable_json(result.get('glossary',[]))!=stable_json(current.get('glossary',[]))
    report['changed']=stable_json(result['graph'])!=stable_json(current['graph']) or report['glossaryChanged']
    report['refs']=refs
    report['reason']=patch['reason']
    return result,report


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command',choices=('normalize','check','plan'))
    parser.add_argument('--session',type=Path,required=True)
    parser.add_argument('--patch',type=Path)
    parser.add_argument('--output',type=Path)
    parser.add_argument('--assets',type=Path,default=ASSETS)
    args=parser.parse_args()
    state=json.loads(args.session.read_text(encoding='utf-8'))
    if args.command=='check':report=check(state,args.assets);result=state
    elif args.command=='plan':
        if args.patch is None:parser.error('--patch is required')
        result,report=plan(state,json.loads(args.patch.read_text(encoding='utf-8')),args.assets)
    else:result,report=prepare(state,args.assets)
    if args.output:
        args.output.parent.mkdir(parents=True,exist_ok=True)
        args.output.write_text(json.dumps(result,ensure_ascii=False,sort_keys=True,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report,ensure_ascii=True,indent=2))


if __name__=='__main__':main()
