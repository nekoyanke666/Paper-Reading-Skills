"""Plan, validate, apply and render a reasoned paper-map update."""
import argparse
import importlib.util
import json
from pathlib import Path

SKILL=Path(__file__).resolve().parents[1]


def load(name,path):
    spec=importlib.util.spec_from_file_location(name,path)
    result=importlib.util.module_from_spec(spec);spec.loader.exec_module(result);return result


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command',choices=('relation','normalize','check','plan','apply','render'))
    parser.add_argument('--token')
    parser.add_argument('--session',type=Path)
    parser.add_argument('--patch',type=Path)
    parser.add_argument('--output',type=Path,help='candidate JSON for normalize/plan, site directory for apply/render')
    args=parser.parse_args()
    engine=load('map_engine',SKILL/'scripts/map_engine.py')
    if args.command=='relation':
        if not args.token:parser.error('--token is required')
        registry=engine.Registry();ident,reverse=registry.resolve(args.token)
        print(json.dumps({'id':ident,'reverseEndpoints':reverse,**registry.definitions[ident]},ensure_ascii=True,indent=2));return
    if not args.session:parser.error('--session is required')
    state=json.loads(args.session.read_text(encoding='utf-8'))
    if args.command=='check':
        result=engine.check(state)
    elif args.command=='normalize':
        candidate,result=engine.prepare(state)
        if not args.output:parser.error('--output candidate JSON is required')
        args.output.parent.mkdir(parents=True,exist_ok=True)
        args.output.write_text(json.dumps(candidate,ensure_ascii=False,sort_keys=True,indent=2)+'\n',encoding='utf-8')
    elif args.command in ('plan','apply'):
        if not args.patch:parser.error('--patch is required')
        patch=json.loads(args.patch.read_text(encoding='utf-8'))
        candidate,result=engine.plan(state,patch)
        if args.command=='plan':
            if args.output:
                args.output.parent.mkdir(parents=True,exist_ok=True)
                args.output.write_text(json.dumps(candidate,ensure_ascii=False,sort_keys=True,indent=2)+'\n',encoding='utf-8')
        elif result['changed']:
            if not args.output:parser.error('--output site directory is required for apply')
            renderer=load('paper_map_renderer',SKILL/'scripts/render_map.py')
            renderer.preflight(candidate)
            store=load('paper_memory_store',SKILL.parent/'paper-memory/scripts/session_store.py')
            # Strict semantic/geometry checks have already succeeded; only now commit the canonical session.
            committed=store.checkpoint(args.session,candidate,patch['expectedRevision'],patch['reason'])
            try:
                result['artifact']=renderer.render(committed,args.output)
            except Exception as exc:
                renderer.atomic_write(args.output/'render-pending.json',json.dumps({'revision':committed['revision'],'error':str(exc),'recovery':'render the saved session again'},ensure_ascii=False,indent=2)+'\n')
                raise RuntimeError('session committed; artifact generation pending; retry render with the saved revision') from exc
            result['revision']=committed['revision']
        else:
            result['revision']=state['revision']
            result['artifact']='unchanged: no new revision or rewrite'
    else:
        if not args.output:parser.error('--output site directory is required')
        renderer=load('paper_map_renderer',SKILL/'scripts/render_map.py')
        result=renderer.render(state,args.output)
    print(json.dumps(result,ensure_ascii=True,indent=2))


if __name__=='__main__':main()
