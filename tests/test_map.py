from pathlib import Path
import copy, hashlib, importlib.util, json, subprocess, sys, tempfile, unittest
sys.dont_write_bytecode=True
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT
SKILL=OUT/'interfaces/paper-map'
def load(name,path):
    spec=importlib.util.spec_from_file_location(name,path)
    m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
E=load('engine',SKILL/'scripts/map_engine.py')
R=load('renderer',SKILL/'scripts/render_map.py')
STATE=json.loads((OUT/'examples/session.example.json').read_text(encoding='utf-8'))
def patch(ops,state=None):
    s=state or STATE
    return dict(expectedRevision=s['revision'],roleVersion=s['roleProfile']['version'],settingsVersion=s['settings']['version'],
                reason='Regression fixture: same-referent and relation update.',importance=['core_concept'],
                semanticReview=dict(identity='Explicit fixture referents.',relation='Registered meaning and direction.',scope='Fictional sample only.'),operations=ops)
def new_node(ident='new'):
    return dict(id=ident,identity=dict(kind='concept',scope=STATE['paper']['id'],referent=ident),
                label='New concept',title='Test concept',detail='Explicit test fixture.',type='concept',sourceRefs=[],aliases=[])
def edge(a,b,relation='requires_concept',**kw):
    return dict(**{'from':a,'to':b},relationType=relation,meaning='Fictional regression only.',status='hypothesis',**kw)
def node(s,i):return next(n for n in s['graph']['nodes'] if n['id']==i)
def tree(s,i='main'):return next(t for t in s['graph']['trees'] if t['id']==i)
class MapTests(unittest.TestCase):
    def test_01_examples_and_cycle(self):
        self.assertTrue(E.check(STATE)['passed'])
        causal=json.loads((OUT/'examples/causal.example.json').read_text(encoding='utf-8'))
        self.assertTrue(E.check(causal)['passed'])
        self.assertTrue(any(e['relationType']=='inhibits' for e in causal['graph']['links']))
    def test_02_aliases(self):
        reg=E.Registry()
        values=[reg.normalize(edge('a','b',token)) for token in ('supports','provides support','provides evidence for')]
        self.assertEqual(len({x['semanticKey'] for x in values}),1)
        self.assertTrue(all(x['label']=='supports' for x in values))
        with self.assertRaises(E.MapError):reg.normalize(edge('a','b','supports',label='causes'))
    def test_03_inverse_symmetric_qualifiers(self):
        reg=E.Registry()
        inverse=reg.normalize(edge('a','b','contains'))
        self.assertEqual((inverse['from'],inverse['to'],inverse['relationType']),('b','a','part_of'))
        self.assertEqual(reg.normalize(edge('a','b','associated_with'))['semanticKey'],reg.normalize(edge('b','a','associated'))['semanticKey'])
        self.assertNotEqual(reg.normalize(edge('a','b','supports',qualifiers={'time':1}))['semanticKey'],reg.normalize(edge('a','b','supports',qualifiers={'time':2}))['semanticKey'])
    def test_04_extension_alias_collision(self):
        with self.assertRaises(E.MapError):
            E.Registry(extensions=[dict(id='x:custom',label='custom',family='context',definition='A distinct fixture.',aliases=['supports'],reason='test',examples=['positive','negative'])])
    def test_05_canonical_idempotence_and_order(self):
        s,_=E.prepare(STATE);again,_=E.prepare(s)
        self.assertEqual(s,again)
        permuted=copy.deepcopy(s);permuted['graph']['nodes'].reverse();permuted['graph']['links'].reverse();permuted['graph']['trees'].reverse()
        self.assertEqual(E.prepare(permuted)[0],s)
    def test_06_rename_shared_id_position(self):
        s,r=E.plan(STATE,patch([dict(op='update_node',id='a',changes={'label':'Shared condition'})]))
        self.assertTrue(r['changed']);self.assertIn(node(STATE,'a')['label'],node(s,'a')['aliases'])
        self.assertEqual(sum('a' in t['nodeIds'] for t in s['graph']['trees']),2)
        for t in STATE['graph']['trees']:self.assertEqual(tree(s,t['id'])['positions'],t['positions'])
    def test_07_extend_nonroot_repeat_deterministically(self):
        ops=[dict(op='add_node',node=new_node(),treeId='main',anchorId='proof'),dict(op='add_link',link=edge('proof','new','depends_on'),treeId='main')]
        a,r=E.plan(STATE,patch(ops));b,_=E.plan(STATE,patch(ops))
        self.assertEqual(a,b);self.assertTrue(r['changed'])
        for i,p in tree(STATE)['positions'].items():self.assertEqual(tree(a)['positions'][i],p)
    def test_08_tree_reuses_canonical_node(self):
        s,_=E.plan(STATE,patch([dict(op='add_tree',tree=dict(id='focused',title='Why is this condition needed?',focusQuestion='Why is this condition needed?',rootId='a'))]))
        self.assertEqual(tree(s,'focused')['rootId'],'a');self.assertEqual(len(s['graph']['nodes']),len(STATE['graph']['nodes']))
    def test_09_invalid_source_label_overlap_and_disconnection(self):
        for change in ({'sourceRefs':[dict(sourceId='missing',location='x')]},{'label':'LongLabel'*20}):
            with self.assertRaises(E.MapError):E.plan(STATE,patch([dict(op='update_node',id='a',changes=change)]))
        overlap=copy.deepcopy(STATE);tree(overlap)['positions']['a']=tree(overlap)['positions']['q'].copy()
        with self.assertRaises(E.MapError):E.check(overlap)
        with self.assertRaises(E.MapError):E.plan(STATE,patch([dict(op='add_node',node=new_node(),treeId='main',anchorId='proof')]))
    def test_10_stale_and_missing_review(self):
        for change in ({'expectedRevision':-1},{'roleVersion':-1},{'semanticReview':{}},{'importance':[]}):
            p=patch([]);p.update(change)
            with self.assertRaises(E.MapError):E.plan(STATE,p)
    def test_11_causal_basis(self):
        s=json.loads((OUT/'examples/causal.example.json').read_text(encoding='utf-8'))
        e=next(e for e in s['graph']['links'] if e['relationType']=='promotes');e['status']='supported'
        e['sourceRefs']=[dict(sourceId=s['sources'][0]['id'],location='fictional fixture')]
        with self.assertRaises(E.MapError):E.check(s)
    def test_12_type_count_limit(self):
        s=copy.deepcopy(STATE)
        t=tree(s); extra=E.Registry().normalize(edge('q','p','supports',id='limit-extra'))
        s['graph']['links'].append(extra);t['linkIds'].append(extra['id'])
        with self.assertRaisesRegex(E.MapError,'relation types'):E.prepare(s)
    def test_13_retire_restore(self):
        ops=[dict(op='retire_link',id='p-bound',reason='fixture scope'),dict(op='retire_node',id='boundary',kind='out_of_scope',reason='fixture scope')]
        s,_=E.plan(STATE,patch(ops));self.assertFalse(any(n['id']=='boundary' for n in s['graph']['nodes']))
        restored,_=E.plan(s,patch([dict(op='restore_node',id='boundary',treeId='main',anchorId='p',reason='fixture restored'),dict(op='restore_link',id='p-bound',treeId='main',reason='fixture restored')],s))
        self.assertTrue(any(n['id']=='boundary' for n in restored['graph']['nodes']))
    def test_14_merge_preserves_prior_edge(self):
        copied=copy.deepcopy(node(STATE,'a'));copied['id']='copy';copied['identity']['referent']='provisional-copy'
        original=copy.deepcopy(next(e for e in STATE['graph']['links'] if e['id']=='q-a'));original.pop('id');original['to']='copy'
        s,_=E.plan(STATE,patch([dict(op='add_node',node=copied,treeId='main',anchorId='q'),dict(op='add_link',link=original,treeId='main')]))
        merged,_=E.plan(s,patch([dict(op='merge_nodes',sourceId='copy',targetId='a',reason='duplicate confirmed',identityEvidence='Fixture: same underlying referent.')],s))
        self.assertEqual(merged['graph']['redirects']['copy'],'a')
        self.assertTrue(any(e['id']=='q-a' for e in merged['graph']['links']))
    def test_15_view_only_remove(self):
        ops=[dict(op='retire_link',id='q-a',reason='replace reading route'),dict(op='retire_link',id='a-proof',reason='replace reading route'),dict(op='remove_from_tree',nodeId='a',treeId='main'),dict(op='add_link',link=edge('q','proof'),treeId='main')]
        s,_=E.plan(STATE,patch(ops));self.assertNotIn('a',tree(s)['nodeIds']);self.assertIn('a',tree(s,'proof-detail')['nodeIds'])
        self.assertEqual(node(s,'a')['id'],'a')
    def test_16_reproducible_bytes_and_hashes(self):
        with tempfile.TemporaryDirectory(dir=None) as d:
            d=Path(d);a=R.render(STATE,d/'a');b=R.render(STATE,d/'b');self.assertEqual(a,b)
            for name in ('index.html','paper-state.json','artifact-manifest.json','quality-report.json'):
                self.assertEqual((d/'a'/name).read_bytes(),(d/'b'/name).read_bytes())
            for name,sha in a['files'].items():self.assertEqual(hashlib.sha256((d/'a'/name).read_bytes()).hexdigest(),sha)
    def test_17_tampered_template_rejected(self):
        import shutil
        with tempfile.TemporaryDirectory(dir=None) as d:
            dst=Path(d)/'assets';shutil.copytree(SKILL/'assets',dst)
            with (dst/'graph-viewer.html.in').open('a',encoding='utf-8') as f:f.write('changed')
            with self.assertRaisesRegex(ValueError,'locked'):R.preflight(STATE,dst)
    def test_18_apply_failures_do_not_write_and_noop(self):
        with tempfile.TemporaryDirectory(dir=None) as d:
            d=Path(d);session=d/'session.json';session.write_text(json.dumps(STATE),encoding='utf-8')
            original=session.read_bytes();p=d/'patch.json'
            invalid=patch([dict(op='update_node',id='a',changes={'label':'Z'*60})]);p.write_text(json.dumps(invalid),encoding='utf-8')
            args=[sys.executable,'-B',str(SKILL/'scripts/map_ctl.py'),'apply','--session',str(session),'--patch',str(p),'--output',str(d/'site')]
            result=subprocess.run(args,capture_output=True,text=True);self.assertNotEqual(result.returncode,0);self.assertEqual(session.read_bytes(),original)
            p.write_text(json.dumps(patch([])),encoding='utf-8');result=subprocess.run(args,capture_output=True,text=True)
            self.assertEqual(result.returncode,0,result.stderr);self.assertEqual(session.read_bytes(),original);self.assertFalse((d/'site').exists())
            p.write_text(json.dumps(patch([dict(op='update_node',id='a',changes={'detail':'Updated fixture detail.'})])),encoding='utf-8')
            result=subprocess.run(args,capture_output=True,text=True);self.assertEqual(result.returncode,0,result.stderr)
            committed=json.loads(session.read_text(encoding='utf-8'));self.assertEqual(committed['revision'],STATE['revision']+1)
            self.assertTrue((d/'site/index.html').is_file());self.assertTrue((d/'.history'/f"rev-{STATE['revision']:06d}.json").is_file())
