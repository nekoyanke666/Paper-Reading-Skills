"""Deterministic locked-template renderer for canonical paper-map snapshots."""
from __future__ import annotations

import argparse
import hashlib
import html as html_escape
import importlib.util
import json
import os
from pathlib import Path
import tempfile

ROOT = Path(__file__).resolve().parents[1]


def module(name, path):
    spec=importlib.util.spec_from_file_location(name,path)
    result=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result


def engine():
    return module('paper_map_engine',ROOT/'scripts/map_engine.py')


def atomic_write(path, text):
    path.parent.mkdir(parents=True,exist_ok=True)
    tmp=None
    try:
        with tempfile.NamedTemporaryFile('w',encoding='utf-8',newline='\n',dir=path.parent,prefix=path.name+'.',suffix='.tmp',delete=False) as stream:
            tmp=Path(stream.name);stream.write(text);stream.flush();os.fsync(stream.fileno())
        os.replace(tmp,path)
    finally:
        if tmp is not None and tmp.exists():tmp.unlink()


def snapshot(state, lock):
    graph=state['graph']
    selected={k:graph[k] for k in ('nodes','links','trees','relationTypes','nodeTypes','redirects','linkRedirects','locale','nodeShapes') if k in graph}
    result={'schemaVersion':2,'revision':state['revision'],'paper':state['paper'],'settings':state['settings'],
            'sources':[{k:s[k] for k in ('id','label','note') if k in s} for s in sorted(state.get('sources',[]),key=lambda s:s['id'])],
            'glossary':sorted(state.get('glossary',[]),key=lambda s:s['id']),'graph':selected}
    basis={**result,'_renderPolicy':{k:lock[k] for k in ('version','templateSha256','registryVersion','registrySha256','localeSha256','shapesSha256','layoutVersion')}}
    encoded=json.dumps(basis,ensure_ascii=False,sort_keys=True,separators=(',',':'),allow_nan=False)
    result['artifact']={'templateVersion':lock['version'],'templateSha256':lock['templateSha256'],
                        'registryVersion':lock['registryVersion'],'registrySha256':lock['registrySha256'],'localeSha256':lock['localeSha256'],'shapesSha256':lock['shapesSha256'],'layoutVersion':lock['layoutVersion'],
                        'snapshotSha256':hashlib.sha256(encoded.encode('utf-8')).hexdigest()}
    return result


def preflight(state, assets=None):
    assets=Path(assets or ROOT/'assets')
    lock=json.loads((assets/'template-lock.json').read_text(encoding='utf-8'))
    data=(assets/'graph-viewer.html.in').read_bytes()
    template=data.decode('utf-8')
    if hashlib.sha256(data).hexdigest()!=lock['templateSha256']:
        raise ValueError('template differs from the locked approved appearance; explicit UI/version review is required')
    if template.count('__BOOTSTRAP__')!=1:raise ValueError('invalid bootstrap slot')
    qa=engine().check(state,assets)
    if engine().normalize(state,assets)['graph']!=state['graph']:
        raise ValueError('normalize and save canonical data before rendering')
    return lock,template,qa


def render(state, out, assets=None):
    lock,template,qa=preflight(state,assets)
    view=snapshot(state,lock)
    serialized=json.dumps(view,ensure_ascii=False,sort_keys=True,indent=2,allow_nan=False)+'\n'
    html=template.replace('__BOOTSTRAP__',serialized.rstrip().replace('</','<\\/'))
    html=html.replace('<html lang="en">','<html lang="'+html_escape.escape(view['graph']['locale']['languageTag'],quote=True)+'">',1)
    files={'index.html':html,'paper-state.json':serialized}
    manifest={'revision':state['revision'],**view['artifact'],
              'files':{name:hashlib.sha256(text.encode('utf-8')).hexdigest() for name,text in files.items()},
              'browserVisualQA':'not performed by the renderer'}
    files['artifact-manifest.json']=json.dumps(manifest,ensure_ascii=False,sort_keys=True,indent=2)+'\n'
    files['quality-report.json']=json.dumps(qa,ensure_ascii=False,sort_keys=True,indent=2)+'\n'
    out=Path(out)
    version=out/'revisions'/f"r{state['revision']:06d}-{view['artifact']['snapshotSha256'][:12]}"
    # Immutable version is completed first. Current files are complete snapshots, never partial graph patches.
    for name,text in files.items():
        existing=version/name
        if existing.exists() and existing.read_text(encoding='utf-8')!=text:
            raise ValueError('an immutable artifact revision cannot be overwritten with different content')
        atomic_write(existing,text)
    for name in ('paper-state.json','quality-report.json','artifact-manifest.json','index.html'):
        atomic_write(out/name,files[name])
    return manifest


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--session',type=Path,required=True)
    parser.add_argument('--out',type=Path,required=True)
    args=parser.parse_args()
    state=json.loads(args.session.read_text(encoding='utf-8'))
    print(json.dumps(render(state,args.out),ensure_ascii=False,indent=2))


if __name__=='__main__':main()
