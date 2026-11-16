"""Three independently curated detail trees backed by shared global records."""
import copy,math
LEVELS=('low','medium','high')
def table(items):return {v['id']:v for v in items} if isinstance(items,list) else items
def selected(tree,level):
    p=tree.get('detailViews',{}).get(level,tree)
    return dict(nodeIds=list(p['nodeIds']),linkIds=list(p['linkIds']),rootId=p.get('rootId',tree.get('rootId')),focusQuestion=p.get('focusQuestion',tree.get('focusQuestion')),positions={**{i:tree['positions'][i] for i in p['nodeIds']},**p.get('positions',{})})
def validate(tree,graph):
    if not tree.get('detailViews'):return True
    links=table(graph['links']);seen_nodes=set();seen_links=set()
    for level in LEVELS:
        if level not in tree['detailViews']:raise ValueError('each detail mode needs its own view')
        p=selected(tree,level);ids,edge_ids=p['nodeIds'],p['linkIds']
        if not ids or len(ids)!=len(set(ids)) or len(edge_ids)!=len(set(edge_ids)) or not set(ids)<=set(tree['nodeIds']) or not set(edge_ids)<=set(tree['linkIds']):raise ValueError('detail views must reference globally shared records')
        edges=[links[i] for i in edge_ids]
        if len({e['relationType'] for e in edges})>4:raise ValueError('a detail view has too many relationship types; split its topic')
        if any(e['from'] not in ids or e['to'] not in ids for e in edges):raise ValueError('a detail relationship endpoint is absent')
        for ident in ids:
            xy=p['positions'].get(ident)
            if not xy or any(not isinstance(xy.get(k),(int,float)) or not math.isfinite(xy[k]) or abs(xy[k])>1e7 for k in ('x','y')):raise ValueError('invalid detail position')
        seen_nodes.update(ids);seen_links.update(edge_ids)
        if tree.get('kind','narrative')=='narrative':
            if p['rootId'] not in ids:raise ValueError('detail view needs its own visible reading start')
            seen={p['rootId']}
            for _ in ids:
                for e in edges:
                    if e['from'] in seen or e['to'] in seen:seen.update((e['from'],e['to']))
            if not set(ids)<=seen:raise ValueError('detail view breaks the research path')
    if set(tree['nodeIds'])!=seen_nodes or set(tree['linkIds'])!=seen_links:raise ValueError('an active record is absent from every detail view')
    return True
def project(tree,graph,level):
    validate(tree,graph);p=selected(tree,level);links=table(graph['links']);return p,[links[i] for i in p['linkIds']]
def geometry(state,layout,assets,repair=False):
    out=copy.deepcopy(state)
    for tree in out['graph']['trees']:
        if not tree.get('detailViews'):tree.pop('detailRoutes',None);continue
        routes={}
        for level in LEVELS:
            p,edges=project(tree,out['graph'],level);shadow=copy.deepcopy(out);view=copy.deepcopy(tree);view.pop('detailViews',None)
            view.update(nodeIds=p['nodeIds'],linkIds=p['linkIds'],rootId=p['rootId'],positions=p['positions'],routes=tree.get('detailRoutes',{}).get(level,{}));shadow['graph']['trees']=[view];shadow['graph']['links']=edges
            laid_out=layout(shadow,assets,repair=repair)['graph']['trees'][0];routes[level]=laid_out['routes'];tree['detailViews'][level]['positions']=laid_out['positions']
        tree['detailRoutes']=routes
    return out
