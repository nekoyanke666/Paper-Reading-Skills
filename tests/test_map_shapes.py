from pathlib import Path
import copy,importlib.util,json,re,unittest

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('shape_engine',ROOT/'interfaces/paper-map/scripts/map_engine.py')
E=importlib.util.module_from_spec(spec);spec.loader.exec_module(E)
STATE=json.loads((ROOT/'examples/session.example.json').read_text(encoding='utf-8'))

class ShapeTests(unittest.TestCase):
    def test_all_canonical_edges_are_curves_or_single_lines(self):
        for name in ('session.example.json','causal.example.json'):
            s=json.loads((ROOT/'examples'/name).read_text(encoding='utf-8'))
            for t in s['graph']['trees']:
                for r in t['routes'].values():
                    self.assertIn(re.findall('[A-Za-z]',r['d']),(['M','C'],['M','L']))

    def test_type_roles_are_semantic_and_not_all_questions(self):
        roles=STATE['graph']['nodeShapes']['typeRoles']
        self.assertEqual(roles['concept'],'concept')
        self.assertEqual(roles['method'],'method')
        self.assertEqual(roles['term'],'entity')
        self.assertEqual(roles['question'],'proposition')
        self.assertEqual(set(STATE['graph']['nodeShapes']['roles']),{'concept','method','entity','proposition'})

    def test_shape_assignment_preserves_identity_and_position(self):
        p=dict(expectedRevision=STATE['revision'],roleVersion=STATE['roleProfile']['version'],settingsVersion=STATE['settings']['version'],
               reason='render the same referent as a named object',importance=['core_concept'],
               semanticReview=dict(identity='same fixture referent',relation='unchanged',scope='fictional fixture'),
               operations=[dict(op='set_visual_role',id='a',visualRole='entity',reason='same condition presented as a named object')])
        new,report=E.plan(STATE,p)
        before=next(n for n in STATE['graph']['nodes'] if n['id']=='a');after=next(n for n in new['graph']['nodes'] if n['id']=='a')
        self.assertTrue(report['changed']);self.assertEqual(before['identity'],after['identity'])
        self.assertEqual(after['visualRole'],'entity')
        for t in STATE['graph']['trees']:
            self.assertEqual(t['positions'],next(v for v in new['graph']['trees'] if v['id']==t['id'])['positions'])

    def test_polyline_routes_are_rejected(self):
        s=copy.deepcopy(STATE);r=next(iter(s['graph']['trees'][0]['routes'].values()))
        r['d']='M0 0 L10 0 Q20 0 20 10 L30 10'
        with self.assertRaisesRegex(E.MapError,'curves or single straight'):E.check(s)

    def test_named_object_anchor_is_on_circle(self):
        s=json.loads((ROOT/'examples/causal.example.json').read_text(encoding='utf-8'))
        n=next(n for n in s['graph']['nodes'] if n['id']=='r');p={'x':100,'y':100}
        q=E.shape_anchor(n,p,(1000,158),s['graph']['nodeShapes'])
        self.assertAlmostEqual(q[0],100+85+54);self.assertAlmostEqual(q[1],158)

if __name__=='__main__':unittest.main()
