from pathlib import Path
import copy,importlib.util,json,re,tempfile,unittest

ROOT=Path(__file__).resolve().parents[1]
def load(name,path):
    spec=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
S=load('settings_store',ROOT/'interfaces/paper-memory/scripts/session_store.py')
E=load('settings_engine',ROOT/'interfaces/paper-map/scripts/map_engine.py')
R=load('settings_renderer',ROOT/'interfaces/paper-map/scripts/render_map.py')
I=load('installer',ROOT/'scripts/install.py')
EXAMPLE=json.loads((ROOT/'examples/session.example.json').read_text(encoding='utf-8'))

class SettingsTests(unittest.TestCase):
    def session(self,folder):
        p=Path(folder)/'session.json'
        S.checkpoint(p,S.new_session('paper-test','Test paper'),-1,'initialize')
        return p

    def test_pending_has_no_inferred_language_and_yes_default(self):
        s=S.new_session('p','Paper')
        self.assertEqual(s['settings']['status'],'pending')
        self.assertIsNone(s['settings']['translationLanguage'])
        self.assertIsNone(s['settings']['interactionLanguage'])
        self.assertTrue(s['settings']['fullTranslation'])
        S.validate(s,ROOT)

    def test_confirm_and_restore_default_yes(self):
        with tempfile.TemporaryDirectory() as d:
            p=self.session(d);s=S.configure(p,0,'fr','French')
            reread=json.loads(p.read_text(encoding='utf-8'))
            self.assertEqual(reread['settings'],s['settings'])
            self.assertEqual(s['settings']['interactionLanguage']['tag'],'fr')
            self.assertTrue(s['settings']['fullTranslation'])
            self.assertEqual(s['settings']['fullTranslationSource'],'default')
            self.assertEqual(s['settings']['pendingFields'],[])

    def test_decline_skips_full_translation_without_losing_other_progress(self):
        with tempfile.TemporaryDirectory() as d:
            p=self.session(d);s=S.configure(p,0,'es','Spanish',False,'explicit')
            self.assertEqual(s['progress']['translation']['status'],'skipped-by-preference')
            self.assertFalse(s['settings']['fullTranslation'])
            self.assertIn('figures',s['progress']);self.assertIn('detail',s['progress'])
            resumed=S.configure(p,1,'es','Spanish',True,'explicit',reason='user enables full translation')
            self.assertEqual(resumed['settings']['version'],2)
            self.assertEqual(resumed['progress']['translation']['status'],'pending')

    def test_language_change_versions_history_and_stale_outputs(self):
        with tempfile.TemporaryDirectory() as d:
            p=self.session(d);S.configure(p,0,'en','English')
            changed=S.configure(p,1,'de','German',reason='user changes target language')
            self.assertEqual(changed['settings']['version'],2)
            self.assertEqual(set(changed['settings']['staleOutputs']),{'translation','explanations','map'})
            prior=json.loads((Path(d)/'.history/rev-000001.json').read_text(encoding='utf-8'))
            self.assertEqual(prior['settings']['translationLanguage']['tag'],'en')

    def test_explicit_separate_interaction_language(self):
        with tempfile.TemporaryDirectory() as d:
            p=self.session(d);s=S.configure(p,0,'fr','French',interaction_tag='es',interaction_name='Spanish')
            self.assertEqual(s['settings']['translationLanguage']['tag'],'fr')
            self.assertEqual(s['settings']['interactionLanguage']['tag'],'es')

    def test_missing_language_stale_and_silent_change_rejected(self):
        with tempfile.TemporaryDirectory() as d:
            p=self.session(d);before=p.read_bytes()
            with self.assertRaises(S.SessionError):S.configure(p,0,'','')
            self.assertEqual(p.read_bytes(),before)
            s=S.configure(p,0,'en','English')
            with self.assertRaises(S.SessionError):S.configure(p,0,'en','English')
            bad=copy.deepcopy(s);bad['settings']['fullTranslation']=False
            with self.assertRaises(S.SessionError):S.checkpoint(p,bad,1,'silent setting mutation')

    def test_pending_settings_cannot_render(self):
        s=copy.deepcopy(EXAMPLE);s['settings']=S.new_session('x','x')['settings']
        with self.assertRaises(E.MapError):E.prepare(s)

    def test_minimal_entry_then_extension_reuses_path_and_root(self):
        s=copy.deepcopy(EXAMPLE);g=s['graph']
        root=next(n for n in g['nodes'] if n['id']=='q')
        main=next(t for t in g['trees'] if t['id']=='main')
        position=copy.deepcopy(main['positions']['q'])
        g['nodes']=[root];g['links']=[];g['trees']=[main]
        main.update(rootId='q',nodeIds=['q'],linkIds=[],positions={'q':position},routes={})
        s,_=E.prepare(s)
        with tempfile.TemporaryDirectory() as d:
            session=Path(d)/'session.json';entry=Path(d)/'map'
            s=S.checkpoint(session,s,-1,'prepare minimal map entry')
            first=R.render(s,entry)
            self.assertTrue((entry/'index.html').is_file())
            node=dict(id='prerequisite',identity=dict(kind='concept',scope=s['paper']['id'],referent='fixture prerequisite'),
                      label='Prerequisite',title='Fixture prerequisite',detail='Fictional prerequisite for the entry test.',type='concept',aliases=[],sourceRefs=[])
            link={'from':'q','to':'prerequisite','relationType':'requires_concept','meaning':'Fictional reading prerequisite.','status':'design'}
            patch=dict(expectedRevision=s['revision'],roleVersion=s['roleProfile']['version'],settingsVersion=s['settings']['version'],
                       reason='extend the prepared entry',importance=['core_concept'],
                       semanticReview=dict(identity='new fixture concept',relation='registered prerequisite',scope='fictional test'),
                       operations=[dict(op='add_node',node=node,treeId='main',anchorId='q'),dict(op='add_link',link=link,treeId='main')])
            candidate,report=E.plan(s,patch);self.assertTrue(report['changed'])
            committed=S.checkpoint(session,candidate,s['revision'],patch['reason'])
            second=R.render(committed,entry)
            visible=json.loads((entry/'paper-state.json').read_text(encoding='utf-8'))
            self.assertEqual(visible['graph']['trees'][0]['rootId'],'q')
            self.assertEqual(visible['graph']['trees'][0]['positions']['q'],position)
            self.assertNotEqual(first['snapshotSha256'],second['snapshotSha256'])
            self.assertEqual({n['id'] for n in visible['graph']['nodes']},{'q','prerequisite'})

    def test_non_english_locale_required_not_silently_english(self):
        s=copy.deepcopy(EXAMPLE);s['settings']['interactionLanguage']={'tag':'es','name':'Spanish'}
        s['graph'].pop('locale')
        with self.assertRaisesRegex(E.MapError,'translations'):E.prepare(s)
        s['graph']['locale']={'languageTag':'es','ui':{}}
        with self.assertRaisesRegex(E.MapError,'incomplete'):E.prepare(s)

    def test_localized_labels_keep_predicates_and_identity(self):
        s=copy.deepcopy(EXAMPLE);old_nodes={n['id'] for n in s['graph']['nodes']}
        s['settings']['interactionLanguage']={'tag':'es','name':'Spanish'}
        locale=s['graph']['locale'];locale['languageTag']='es'
        # Synthetic locale tests routing, not the quality of a real Spanish translation.
        locale['ui']={k:'Localized '+v for k,v in locale['ui'].items()}
        locale['relationLabels'].update(requires_concept='requiere',depends_on='depende de',proves='demuestra',constrained_by='limitado por',entails='implica',note='nota')
        candidate,report=E.prepare(s)
        self.assertTrue(report['passed']);self.assertEqual(old_nodes,{n['id'] for n in candidate['graph']['nodes']})
        e=next(e for e in candidate['graph']['links'] if e['relationType']=='proves')
        self.assertEqual(e['label'],'proves');self.assertEqual(e['displayLabel'],'demuestra')
        with tempfile.TemporaryDirectory() as d:
            R.render(candidate,Path(d));html=(Path(d)/'index.html').read_text(encoding='utf-8')
            self.assertIn('<html lang="es">',html)

    def test_settings_version_must_match_patch(self):
        s=copy.deepcopy(EXAMPLE)
        p=dict(expectedRevision=s['revision'],roleVersion=s['roleProfile']['version'],settingsVersion=-1,
               reason='fixture',importance=['core_concept'],semanticReview=dict(identity='fixture',relation='fixture',scope='fixture'),operations=[])
        with self.assertRaisesRegex(E.MapError,'preferences'):E.plan(s,p)

    def test_same_role_title_does_not_hide_changed_expertise(self):
        with tempfile.TemporaryDirectory() as d:
            p=Path(d)/'session.json';s=S.checkpoint(p,copy.deepcopy(EXAMPLE),-1,'example')
            bad=copy.deepcopy(s);bad['roleProfile']['primaryField']='Different discipline'
            with self.assertRaises(S.SessionError):S.checkpoint(p,bad,0,'unversioned role change')

    def test_shared_paper_isolation_and_return_point(self):
        with tempfile.TemporaryDirectory() as d:
            p=Path(d)/'session.json';s=S.checkpoint(p,copy.deepcopy(EXAMPLE),-1,'example')
            s['progress'].update(activeEntry='paper-ask',returnTo={'entry':'paper-detail-explain','topic':'proof','next':'continue argument'})
            saved=S.checkpoint(p,s,0,'insert question')
            self.assertEqual(saved['progress']['returnTo']['topic'],'proof')
            bad=copy.deepcopy(saved);bad['paper']['id']='another-paper'
            with self.assertRaises(S.SessionError):S.checkpoint(p,bad,1,'wrong primary')

    def test_whole_model_cannot_claim_unread_coverage(self):
        s=copy.deepcopy(EXAMPLE);s['readingModel']['status']='verified'
        with self.assertRaises(S.SessionError):S.validate(s,ROOT)

class InstallationTests(unittest.TestCase):
    def test_only_four_entries_discovered_and_shared_links_resolve(self):
        with tempfile.TemporaryDirectory() as d:
            home=Path(d)/'codex';I.install(home)
            self.assertEqual(len(list((home/'skills').rglob('SKILL.md'))),4)
            self.assertEqual(len(list((home/'paper-reading-skills/interfaces').rglob('SKILL.md'))),13)
            for p in home.rglob('*.md'):
                for ref in re.findall(r'\]\(([^)]+)\)',p.read_text(encoding='utf-8')):
                    if '://' not in ref and not ref.startswith('#'):self.assertTrue((p.parent/ref).resolve().exists(),(p,ref))
            # A second install is an owned upgrade, not an unrelated overwrite.
            I.install(home)
            self.assertEqual(len(list((home/'skills').rglob('SKILL.md'))),4)

    def test_unrelated_destination_is_preserved(self):
        with tempfile.TemporaryDirectory() as d:
            home=Path(d);foreign=home/'skills/paper-ask';foreign.mkdir(parents=True)
            original=foreign/'user.txt';original.write_text('user content',encoding='utf-8')
            with self.assertRaises(ValueError):I.install(home)
            self.assertEqual(original.read_text(encoding='utf-8'),'user content')
            self.assertFalse((home/'paper-reading-skills').exists())

    def test_removal_boundary_rejects_other_directory(self):
        with tempfile.TemporaryDirectory() as d:
            home=Path(d);other=home/'unrelated';other.mkdir()
            with self.assertRaises(ValueError):I.remove_owned_target(other,home)
            self.assertTrue(other.is_dir())

if __name__=='__main__':unittest.main()
