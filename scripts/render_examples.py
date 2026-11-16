"""Refresh fictional previews from their maintained canonical example sessions."""
from pathlib import Path
import importlib.util,json,sys
sys.dont_write_bytecode=True
ROOT=Path(__file__).resolve().parents[1]
def load(name,path):
    spec=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
E=load('example_engine',ROOT/'interfaces/paper-map/scripts/map_engine.py')
R=load('example_render',ROOT/'interfaces/paper-map/scripts/render_map.py')
for source,target in [('session.example.json','theory-map'),('causal.example.json','feedback-map'),('terminology.example.json','terminology-map'),('detail.example.json','detail-map'),('direction.example.json','direction-map')]:
    path=ROOT/'examples'/source;s=json.loads(path.read_text(encoding='utf-8'))
    s,_=E.prepare(s)
    path.write_text(json.dumps(s,ensure_ascii=False,sort_keys=True,indent=2)+'\n',encoding='utf-8',newline='\n')
    R.render(s,ROOT/'examples'/target)
print(json.dumps({'refreshed':['theory-map','feedback-map','terminology-map','detail-map','direction-map']}))
