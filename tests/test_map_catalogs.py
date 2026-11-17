from pathlib import Path
import copy,importlib.util,json,unittest,subprocess,sys,tempfile
ROOT=Path(__file__).resolve().parents[1]
sp=importlib.util.spec_from_file_location('catalog_engine',ROOT/'interfaces/paper-map/scripts/map_engine.py')
E=importlib.util.module_from_spec(sp);sp.loader.exec_module(E)
STATE=json.loads((ROOT/'examples/terminology.example.json').read_text(encoding='utf-8'))
def view(s,ident):return next(t for t in s['graph']['trees'] if t['id']==ident)
def patch(ops):return dict(expectedRevision=STATE['revision'],roleVersion=STATE['roleProfile']['version'],settingsVersion=STATE['settings']['version'],reason='Fictional catalog behavior check',importance=['core_concept'],semanticReview=dict(identity='same defined fixture terms',relation='registered meanings only',scope='fictional terminology'),operations=ops)

class CatalogTests(unittest.TestCase):
    def test_rootless_catalog_and_catalog_only_nodes(self):
        self.assertTrue(E.check(STATE)['passed'])
        v=view(STATE,'concept-terms');self.assertIsNone(v['rootId']);self.assertEqual(v['linkIds'],[])
        self.assertEqual([t['id'] for t in STATE['graph']['trees'] if 'recall' in t['nodeIds']],['evaluation-terms'])

    def test_sparse_disconnected_catalog_is_valid(self):
        v=view(STATE,'proof-terms');self.assertEqual(len(v['nodeIds']),3);self.assertEqual(len(v['linkIds']),1)
        self.assertTrue(E.check(STATE)['passed'])

    def test_narrative_connectivity_not_relaxed(self):
        s=copy.deepcopy(STATE);v=view(s,'proof-terms');v.update(kind='narrative',rootId='lemma',focusQuestion='How does the argument work?')
        with self.assertRaisesRegex(E.MapError,'readable path'):E.prepare(s)

    def test_main_cannot_be_catalog(self):
        s=copy.deepcopy(STATE);view(s,'main').update(kind='catalog',rootId=None,topicDescription='Invalid replacement')
        with self.assertRaisesRegex(E.MapError,'secondary'):E.prepare(s)

    def test_catalog_needs_definition_and_source(self):
        s=copy.deepcopy(STATE);next(t for t in s['glossary'] if t['id']=='recall-term')['definition']=''
        with self.assertRaisesRegex(E.MapError,'defined shared'):E.prepare(s)
        s=copy.deepcopy(STATE);next(t for t in s['glossary'] if t['id']=='recall-term')['sourceRefs']=[dict(sourceId='missing',location='no')]
        with self.assertRaisesRegex(E.MapError,'source basis'):E.prepare(s)

    def test_property_provenance(self):
        s=copy.deepcopy(STATE);next(t for t in s['glossary'] if t['id']=='precision-term')['facets'][0]['sourceRefs']=[]
        with self.assertRaisesRegex(E.MapError,'traceable basis'):E.prepare(s)

    def test_shared_definition_update_preserves_ids_and_positions(self):
        term=copy.deepcopy(next(t for t in STATE['glossary'] if t['id']=='condition-a'));term['studyRole']='A clarified same-referent premise.'
        operations=[dict(op='upsert_term',term=term,reason='clarify use without changing referent')]
        s,report=E.plan(STATE,patch(operations));self.assertTrue(report['changed']);self.assertTrue(report['glossaryChanged'])
        _,again=E.plan(s,patch(operations));self.assertFalse(again['changed'])
        self.assertEqual(len(s['glossary']),len(STATE['glossary']))
        for v in STATE['graph']['trees']:self.assertEqual(v['positions'],view(s,v['id'])['positions'])

    def test_glossary_only_apply_commits_and_renders(self):
        term=copy.deepcopy(next(t for t in STATE['glossary'] if t['id']=='condition-a'));term['studyRole']='Verified glossary-only update fixture.'
        with tempfile.TemporaryDirectory() as tmp:
            folder=Path(tmp);session=folder/'paper-session.json';update=folder/'patch.json'
            session.write_text(json.dumps(STATE),encoding='utf-8');update.write_text(json.dumps(patch([dict(op='upsert_term',term=term,reason='clarify a shared definition')])),encoding='utf-8')
            subprocess.run([sys.executable,'-B',str(ROOT/'interfaces/paper-map/scripts/map_ctl.py'),'apply','--session',str(session),'--patch',str(update),'--output',str(folder/'map')],check=True,capture_output=True)
            saved=json.loads(session.read_text(encoding='utf-8'));self.assertEqual(saved['revision'],STATE['revision']+1)
            rendered=json.loads((folder/'map/paper-state.json').read_text(encoding='utf-8'));self.assertEqual(next(t for t in rendered['glossary'] if t['id']=='condition-a')['studyRole'],term['studyRole'])

    def test_incremental_catalog_placement_and_membership(self):
        ops=[dict(op='add_tree',tree=dict(id='lookup',kind='catalog',rootId=None,title='Named objects',topicDescription='Named objects from the fictional example.',nodeIds=[],linkIds=[])),dict(op='attach_node',nodeId='input',treeId='lookup')]
        s,_=E.plan(STATE,patch(ops));self.assertEqual(view(s,'lookup')['positions']['input'],dict(x=40,y=60))
        self.assertIsNone(view(s,'lookup')['rootId']);self.assertEqual(view(s,'lookup')['linkIds'],[])

    def test_same_term_rename_retains_search_alias(self):
        term=copy.deepcopy(next(t for t in STATE['glossary'] if t['id']=='condition-a'));term['target']='Assumption A'
        s,_=E.plan(STATE,patch([dict(op='upsert_term',term=term,reason='clearer name for the same referent')]))
        updated=next(t for t in s['glossary'] if t['id']=='condition-a')
        self.assertIn('Condition A',updated['aliases']);self.assertEqual(updated['id'],term['id'])

    def test_independent_new_catalog_preserves_old_views_and_global_definitions(self):
        ops=[dict(op='add_tree',tree=dict(id='new-lookup',kind='catalog',rootId=None,title='Metric lookup',topicDescription='Requested independent lookup',nodeIds=[],linkIds=[])),dict(op='attach_node',nodeId='precision',treeId='new-lookup')]
        s,_=E.plan(STATE,patch(ops))
        self.assertEqual(s['graph']['nodes'],STATE['graph']['nodes'])
        self.assertEqual(s['glossary'],STATE['glossary'])
        for old in STATE['graph']['trees']:self.assertEqual(view(s,old['id']),old)
        self.assertEqual(view(s,'new-lookup')['nodeIds'],['precision'])
        self.assertEqual(view(s,'new-lookup')['linkIds'],[])

    def test_integration_only_changes_the_selected_existing_view(self):
        ops=[dict(op='add_tree',tree=dict(id='new-lookup',kind='catalog',rootId=None,title='Metric lookup',topicDescription='Requested lookup',nodeIds=[],linkIds=[])),dict(op='attach_node',nodeId='precision',treeId='new-lookup'),dict(op='attach_node',nodeId='precision',treeId='concept-terms')]
        s,_=E.plan(STATE,patch(ops))
        self.assertIn('precision',view(s,'new-lookup')['nodeIds'])
        target=view(s,'concept-terms');self.assertIn('precision',target['nodeIds'])
        for ident,pos in view(STATE,'concept-terms')['positions'].items():self.assertEqual(target['positions'][ident],pos)
        for old in STATE['graph']['trees']:
            if old['id']!='concept-terms':self.assertEqual(view(s,old['id']),old)
        self.assertEqual(len(s['graph']['nodes']),len(STATE['graph']['nodes']))

    def independent_narrative(self):
        s=copy.deepcopy(STATE);v=copy.deepcopy(view(s,'evaluation-terms'))
        v.update(id='metric-explanation',kind='narrative',title='How are the metrics related?',focusQuestion='What does error balance compare?',rootId='error-balance',standalone=True,standaloneReason='Independent topic with no existing narrative anchor.')
        s['graph']['trees'].append(v)
        return s,v

    def test_standalone_narrative_needs_explicit_reason_but_no_fake_anchor(self):
        s,v=self.independent_narrative();prepared,_=E.prepare(s);self.assertTrue(E.check(prepared)['passed'])
        for value in ('',None,True):
            s,v=self.independent_narrative();v['standaloneReason']=value
            with self.assertRaisesRegex(E.MapError,'nonempty reason'):E.prepare(s)
        s,v=self.independent_narrative();v.pop('standalone')
        with self.assertRaisesRegex(E.MapError,'shared-node'):E.prepare(s)
        s,v=self.independent_narrative();v['standalone']='true'
        with self.assertRaisesRegex(E.MapError,'boolean'):E.prepare(s)

    def test_standalone_does_not_relax_connectivity_or_main_rules(self):
        s,v=self.independent_narrative();v['linkIds']=[]
        with self.assertRaisesRegex(E.MapError,'readable path'):E.prepare(s)
        s=copy.deepcopy(STATE);view(s,'main').update(standalone=True,standaloneReason='Not allowed')
        with self.assertRaisesRegex(E.MapError,'cannot be the main'):E.prepare(s)

    def test_one_to_many_has_independent_edges(self):
        v=view(STATE,'evaluation-terms');edges=[e for e in STATE['graph']['links'] if e['id'] in v['linkIds']]
        self.assertEqual({e['from'] for e in edges},{'error-balance'});self.assertEqual({e['to'] for e in edges},{'precision','recall'})
        self.assertEqual(len(v['routes']),2);self.assertTrue(all(e['meaning'] and e['sourceRefs'] for e in edges))

if __name__=='__main__':unittest.main()
