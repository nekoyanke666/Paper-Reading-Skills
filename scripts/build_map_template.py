"""Rebuild the locked map from its maintained shell/runtime without redesigning it."""
from pathlib import Path
import hashlib,json
ROOT=Path(__file__).resolve().parents[1]


def build():
    assets=ROOT/'interfaces/paper-map/assets'
    shell=(assets/'viewer-shell.html.in').read_text(encoding='utf-8')
    runtime='\n'.join((assets/name).read_text(encoding='utf-8') for name in ('history-core.js','detail-core.js','history-viewer.js','camera-viewer.js','viewer-runtime.js'))
    if shell.count('__RUNTIME__')!=1 or shell.count('__BOOTSTRAP__')!=1:
        raise ValueError('invalid fixed template slots')
    (assets/'graph-viewer.html.in').write_text(shell.replace('__RUNTIME__',runtime),encoding='utf-8',newline='\n')
    lock=json.loads((assets/'template-lock.json').read_text(encoding='utf-8'))
    for name,key in [('graph-viewer.html.in','templateSha256'),('locale-en.json','localeSha256'),('node-shapes.json','shapesSha256')]:
        lock[key]=hashlib.sha256((assets/name).read_bytes()).hexdigest()
    (assets/'template-lock.json').write_text(json.dumps(lock,ensure_ascii=False,sort_keys=True,indent=2)+'\n',encoding='utf-8',newline='\n')
    return {'template':lock['version'],'layout':lock['layoutVersion']}


if __name__=='__main__':print(json.dumps(build()))
