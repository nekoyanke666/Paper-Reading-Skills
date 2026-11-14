"""Canonical paper-map identity, lifecycle, localization, geometry and quality gates."""
from __future__ import annotations

import argparse
from collections import Counter
import copy
import hashlib
import heapq
import importlib.util
import json
import math
from pathlib import Path
import re
import unicodedata

ASSETS = Path(__file__).resolve().parents[1] / 'assets'
WIDTH, HEIGHT = 170, 62
STATUS = {'supported', 'hypothesis', 'unresolved', 'inferred', 'design', 'disputed', 'user'}


class MapError(ValueError):
    pass


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
    registry = Registry(assets, g.get('relationExtensions'))
    g.setdefault('retiredNodes', [])
    g.setdefault('retiredLinks', [])
    g.setdefault('redirects', {})
    g.setdefault('linkRedirects', {})
    for n in g['nodes']:
        identity(n)
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


def curve_route(e, tree, edges):
    a, b = tree['positions'][e['from']], tree['positions'][e['to']]
    ax, ay, bx, by = a['x'] + 85, a['y'] + 31, b['x'] + 85, b['y'] + 31
    dx, dy = bx - ax, by - ay
    reverse = any(x['from'] == e['to'] and x['to'] == e['from'] and x['id'] != e['id'] for x in edges)
    if e['from'] == e['to']:
        start, c1, c2, end = (ax - 40, a['y']), (ax - 80, a['y'] - 100), (ax + 80, a['y'] - 100), (ax + 40, a['y'])
    elif reverse:
        side = 1 if dx >= 0 else -1
        sy, ty, offset = a['y'] + (0 if side > 0 else 62), b['y'] + (0 if side > 0 else 62), -95 if side > 0 else 95
        start, c1, c2, end = (ax, sy), (ax, sy + offset), (bx, ty + offset), (bx, ty)
    elif abs(dx) > abs(dy):
        sx, tx = a['x'] + (170 if dx >= 0 else 0), b['x'] + (0 if dx >= 0 else 170)
        mid = (sx + tx) / 2
        start, c1, c2, end = (sx, ay), (mid, ay), (mid, by), (tx, by)
    else:
        sy, ty = a['y'] + (62 if dy >= 0 else 0), b['y'] + (0 if dy >= 0 else 62)
        mid = (sy + ty) / 2
        start, c1, c2, end = (ax, sy), (ax, mid), (bx, mid), (bx, ty)
    points = [bezier(start, c1, c2, end, i/60) for i in range(61)]
    def fmt(p):
        return f'{p[0]:.2f} {p[1]:.2f}'
    return {'d': f'M{fmt(start)} C{fmt(c1)} {fmt(c2)} {fmt(end)}', 'points': points}


def astar_route(e, tree, already, choice):
    positions = tree['positions']
    a, b = positions[e['from']], positions[e['to']]
    dx, dy = b['x']-a['x'], b['y']-a['y']
    if abs(dx) >= abs(dy):
        preferred = ('E', 'W') if dx >= 0 else ('W', 'E')
    else:
        preferred = ('S', 'N') if dy >= 0 else ('N', 'S')
    options = [preferred, ('N', 'N'), ('S', 'S'), ('E', 'E'), ('W', 'W')]
    source_side, target_side = options[choice % len(options)]
    if e['from'] == e['to']:
        source_side, target_side = ('E', 'N') if choice % 2 == 0 else ('S', 'E')
    def port(p, side):
        x, y = p['x'], p['y']
        return {'E': ((x+170, y+31), (x+210, y+31)), 'W': ((x, y+31), (x-40, y+31)),
                'S': ((x+85, y+62), (x+85, y+102)), 'N': ((x+85, y), (x+85, y-40))}[side]
    start, stub = port(a, source_side)
    end, end_stub = port(b, target_side)
    if min(stub+end_stub) < 0:
        return None
    grid = 20
    begin, goal = tuple(round(v/grid) for v in stub), tuple(round(v/grid) for v in end_stub)
    boxes = [rectangle(p, 12) for p in positions.values()] + [r['labelBox'] for r in already]
    max_x = math.ceil((max(p['x'] for p in positions.values()) + 550 + choice*70) / grid)
    max_y = math.ceil((max(p['y'] for p in positions.values()) + 400 + choice*70) / grid)
    blocked_cache = {}
    def blocked(p):
        if p not in blocked_cache:
            blocked_cache[p] = any(inside((p[0]*grid, p[1]*grid), r) for r in boxes)
        return blocked_cache[p]
    if blocked(begin) or blocked(goal):
        return None
    road = set()
    for r in already:
        for p in r['points']:
            road.add((round(p[0]/grid), round(p[1]/grid)))
    queue, parent, cost = [(0, 0, begin)], {}, {begin: 0}
    serial = 0
    while queue:
        _, _, current = heapq.heappop(queue)
        if current == goal:
            path = [current]
            while current in parent:
                current = parent[current]
                path.append(current)
            pts = [start, stub] + [(x*grid, y*grid) for x, y in reversed(path)] + [end_stub, end]
            compact = []
            for p in pts:
                if compact and p == compact[-1]:
                    continue
                if len(compact) > 1 and ((compact[-2][0] == compact[-1][0] == p[0]) or
                                         (compact[-2][1] == compact[-1][1] == p[1])):
                    compact[-1] = p
                else:
                    compact.append(p)
            return {'d': rounded_path(compact), 'points': compact}
        if len(cost) > 35000:
            return None
        for off in ((1,0),(0,1),(-1,0),(0,-1)):
            nxt = (current[0]+off[0], current[1]+off[1])
            if not (0 <= nxt[0] <= max_x and 0 <= nxt[1] <= max_y) or blocked(nxt):
                continue
            score = cost[current] + 1 + (5 if nxt in road else 0)
            if score < cost.get(nxt, math.inf):
                parent[nxt], cost[nxt] = current, score
                serial += 1
                distance = abs(nxt[0]-goal[0]) + abs(nxt[1]-goal[1])
                heapq.heappush(queue, (score+distance, serial, nxt))
    return None


def rounded_path(points):
    if len(points) < 2:
        raise MapError('empty path')
    path = f'M{points[0][0]:.2f} {points[0][1]:.2f}'
    for i in range(1, len(points)-1):
        before, p, after = points[i-1], points[i], points[i+1]
        length1, length2 = math.dist(before,p), math.dist(p,after)
        radius = min(12, length1/3, length2/3)
        if length1 == 0 or length2 == 0:
            continue
        start = tuple(p[j]+(before[j]-p[j])*radius/length1 for j in (0,1))
        end = tuple(p[j]+(after[j]-p[j])*radius/length2 for j in (0,1))
        path += f' L{start[0]:.2f} {start[1]:.2f} Q{p[0]:.2f} {p[1]:.2f} {end[0]:.2f} {end[1]:.2f}'
    return path + f' L{points[-1][0]:.2f} {points[-1][1]:.2f}'


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
        if box[0] < 6 or box[1] < 6 or any(intersects(box,r) for r in node_boxes):
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
    for tree in s['graph']['trees']:
        for ident in sorted(tree['nodeIds'], key=lambda n:(n != tree['rootId'],n)):
            if ident not in tree['positions']:
                linked = next((e['from'] if e['from']!=ident else e['to'] for e in edges.values()
                               if ident in (e['from'],e['to']) and
                               (e['from'] if e['from']!=ident else e['to']) in tree['positions']), None)
                tree['positions'][ident] = find_spot(tree,ident,linked)
        existing = tree.get('routes', {})
        routes, used = {}, []
        view_edges = [edges[i] for i in tree['linkIds']]
        order = sorted(view_edges, key=lambda e:(e['id'] not in existing,e['id']))
        for e in order:
            old = existing.get(e['id'])
            route = None
            signature=digest([e['from'],tree['positions'][e['from']],e['to'],tree['positions'][e['to']]])
            if old and old.get('format')=='stable-local-1' and old.get('labelKey')==display_label(e) and old.get('endpointSignature')==signature and not repair:
                if not any(intersects(tuple(old['labelBox']),rectangle(p,8)) for p in tree['positions'].values()):
                    route = copy.deepcopy(old)
            if route is None:
                route = finish_route(curve_route(e,tree,view_edges),e,tree,used)
            if route is None:
                for choice in range(5):
                    candidate = astar_route(e,tree,used,choice)
                    if candidate:
                        route = finish_route(candidate,e,tree,used)
                    if route:
                        break
            if route is None:
                raise MapError(f"no readable route/label for {e['id']}; split the tree or explicitly repair layout")
            routes[e['id']] = route
            used.append(route)
        tree['routes'] = routes
    return s


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
    locale=locale_for(state,assets)
    if g.get('locale')!=locale:
        raise MapError('normalize and save the complete map locale before rendering')
    nodes, edges = {n['id']:n for n in g['nodes']},{e['id']:e for e in g['links']}
    if len(nodes)!=len(g['nodes']) or len(edges)!=len(g['links']):
        raise MapError('duplicate active IDs')
    source_ids = {s['id'] for s in state.get('sources',[])}
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
        if units(n['label']) > lock['nodeLabelPreferredUnits']:
            warnings.append({'code':'long-label','id':ident})
        if not isinstance(n.get('aliases',[]),list):
            raise MapError('node aliases must be a list')
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
        if not t.get('title') or not t.get('focusQuestion') or t['rootId'] not in ids:
            raise MapError('tree needs a focus question, title and visible root')
        if t['id']!='main' and t['title']==state['paper']['title']:
            raise MapError('name a secondary tree by its question, not the paper title')
        if len(ids)!=len(set(ids)) or len(link_ids)!=len(set(link_ids)):
            raise MapError('duplicate tree membership')
        if any(i not in nodes for i in ids) or any(i not in edges for i in link_ids):
            raise MapError('tree references inactive objects')
        if any(edges[i]['from'] not in ids or edges[i]['to'] not in ids for i in link_ids):
            raise MapError('tree links must connect visible members')
        for primary_only in (False,True):
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
        if len(kinds)>lock['maxRelationTypesPerTree']:
            raise MapError(f"tree {t['id']} has {len(kinds)} relation types; split by a meaningful question before rendering")
        if len(ids)>lock['warnNodesPerTree']:
            if not t.get('densityReview',{}).get('reason'):
                raise MapError('large tree needs an explicit readability/split review')
            warnings.append({'code':'large-tree-reviewed','id':t['id']})
        if t['id']!='main' and not any(set(ids)&set(v['nodeIds']) for v in g['trees'] if v['id']!=t['id']):
            raise MapError('secondary tree needs a visible shared-node connection')
        membership.update(ids)
        edge_membership.update(link_ids)
        for i in ids:
            p=t['positions'].get(i)
            if not p or any(not isinstance(p.get(k),(int,float)) or not math.isfinite(p[k]) or p[k]<0 for k in ('x','y')):
                raise MapError('invalid node position')
        for index,i in enumerate(ids):
            for j in ids[index+1:]:
                if intersects(rectangle(t['positions'][i],12),rectangle(t['positions'][j],12)):
                    raise MapError(f'overlapping nodes: {i}, {j}')
        if geometry:
            label_boxes=[]
            for i in link_ids:
                route=t.get('routes',{}).get(i)
                if not route or route.get('format')!='stable-local-1' or not route.get('points'):
                    raise MapError('each visible edge needs a validated stable route')
                link=edges[i]
                signature=digest([link['from'],t['positions'][link['from']],link['to'],t['positions'][link['to']]])
                if route.get('endpointSignature')!=signature:
                    raise MapError('route endpoints do not match the current nodes and positions')
                box=tuple(route['labelBox'])
                if any(intersects(box,rectangle(t['positions'][n],6)) for n in ids):
                    raise MapError('edge label overlaps a node')
                if any(intersects(box,old) for old in label_boxes):
                    raise MapError('edge labels overlap')
                if any(path_hits_rect(route['points'],rectangle(t['positions'][n],4))
                       for n in ids if n not in (edges[i]['from'],edges[i]['to'])):
                    raise MapError('edge crosses an unrelated node')
                label_boxes.append(box)
    if any(not membership[i] for i in nodes) or any(not edge_membership[i] for i in edges):
        raise MapError('active objects need a visible tree; keep unshown material in the evidence index instead')
    return {'passed':True,'warnings':warnings,'nodes':len(nodes),'links':len(edges),'trees':len(g['trees']),
            'registryVersion':registry.version,'templateVersion':lock['version'],
            'browserVisualQA':'not performed by this checker','semanticSourceReview':'requires the selected expert'}


def prepare(state, assets=ASSETS, repair=False):
    result=normalize(state,assets)
    # Structure checks before geometry are useful, but missing positions are deliberately laid out first.
    result=layout(result,assets,repair=repair)
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
        if operation=='add_node':
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
        elif operation=='add_tree':
            view=copy.deepcopy(op['tree']);view['rootId']=resolve(view['rootId']);n(view['rootId'])
            view.setdefault('nodeIds',[view['rootId']]);view['nodeIds']=[resolve(i) for i in view['nodeIds']]
            view.setdefault('linkIds',[]);view.setdefault('positions',{});view.setdefault('routes',{})
            if any(old['id']==view['id'] for old in g['trees']):raise MapError('tree ID already exists')
            g['trees'].append(view)
        elif operation=='update_tree':
            view=t(op['id']);updates=copy.deepcopy(op['changes'])
            if set(updates)-{'title','focusQuestion','rootId','densityReview'} or not op.get('reason'):
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
    report['changed']=stable_json(result['graph'])!=stable_json(current['graph'])
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
