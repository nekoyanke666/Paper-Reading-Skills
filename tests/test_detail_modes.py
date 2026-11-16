from pathlib import Path
import copy,importlib.util,json,unittest
ROOT=Path(__file__).resolve().parents[1];sp=importlib.util.spec_from_file_location('detail_test_engine',ROOT/'interfaces/paper-map/scripts/map_engine.py');E=importlib.util.module_from_spec(sp);sp.loader.exec_module(E)
STATE=json.loads((ROOT/'examples/detail.example.json').read_text(encoding='utf-8'))
class DetailTests(unittest.TestCase):
    def test_three_independent_views(self):
        t=STATE['graph']['trees'][0];p=[E.DETAIL.selected(t,l) for l in E.DETAIL.LEVELS]
        self.assertEqual([len(v['nodeIds']) for v in p],[3,5,8]);self.assertNotIn('q',p[2]['nodeIds']);self.assertTrue(E.check(STATE)['passed'])
    def test_shared_global_node_has_one_definition(self):
        self.assertEqual(sum(n['id']=='f' for n in STATE['graph']['nodes']),1)
        self.assertTrue(all('f' in E.DETAIL.selected(STATE['graph']['trees'][0],l)['nodeIds'] for l in E.DETAIL.LEVELS))
    def test_no_generated_path_shortcuts(self):
        ids={e['id'] for e in STATE['graph']['links']}
        for l in E.DETAIL.LEVELS:self.assertTrue(set(E.DETAIL.selected(STATE['graph']['trees'][0],l)['linkIds'])<=ids)
    def test_each_view_needs_valid_endpoints_and_root(self):
        s=copy.deepcopy(STATE);s['graph']['trees'][0]['detailViews']['low']['nodeIds'].remove('q')
        with self.assertRaises(E.MapError):E.prepare(s)
    def test_views_keep_independent_positions(self):
        t=STATE['graph']['trees'][0];self.assertNotEqual(t['detailViews']['low']['positions']['f'],t['detailViews']['high']['positions']['f'])
        s,_=E.prepare(STATE);self.assertEqual(t['detailViews']['low']['positions'],s['graph']['trees'][0]['detailViews']['low']['positions'])
    def test_detail_geometry_checked(self):
        s=copy.deepcopy(STATE);s['graph']['trees'][0]['detailRoutes']['low']['approach-question']['d']='M0 0 L1 1 L2 2'
        with self.assertRaisesRegex(E.MapError,'single straight'):E.check(s)
    def test_signed_world_coordinates_survive_preparation(self):
        s=copy.deepcopy(STATE);t=s['graph']['trees'][0]
        for records in [t['positions']]+[v['positions'] for v in t['detailViews'].values()]:
            for xy in records.values():xy['x']-=2000;xy['y']-=2000
        t['routes']={};t['detailRoutes']={}
        result,_=E.prepare(s)
        self.assertEqual(result['graph']['trees'][0]['detailViews']['high']['positions'],t['detailViews']['high']['positions'])
        self.assertTrue(E.check(result)['passed'])
    def test_view_only_configuration_is_idempotent(self):
        p=dict(expectedRevision=STATE['revision'],roleVersion=STATE['roleProfile']['version'],settingsVersion=STATE['settings']['version'],reason='Reaffirm the three curated trees',importance=['core_concept'],semanticReview=dict(identity='same global records',relation='source-backed relationships only',scope='fictional fixture'),operations=[dict(op='set_detail_views',treeId='main',levels=STATE['graph']['trees'][0]['detailViews'],reason='three independent levels of explanation')])
        result,report=E.plan(STATE,p);self.assertEqual(result['graph']['nodes'],STATE['graph']['nodes']);self.assertFalse(report['changed'])
if __name__=='__main__':unittest.main()
