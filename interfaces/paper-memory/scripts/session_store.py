"""Persist paper sessions and confirmed preferences; not a proof of understanding."""
from __future__ import annotations

import argparse
from contextlib import contextmanager
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import tempfile


class SessionError(ValueError):
    pass


def validate(state: dict, session_dir: Path) -> None:
    if state.get('schemaVersion') != 2 or not isinstance(state.get('revision'), int):
        raise SessionError('schemaVersion must be 2 and revision must be an integer')
    if not state.get('paper', {}).get('id') or not state['paper'].get('title'):
        raise SessionError('paper identity and title are required')
    settings=state.get('settings')
    if not isinstance(settings,dict) or settings.get('status') not in ('pending','confirmed'):
        raise SessionError('settings must record pending or confirmed startup choices')
    if type(settings.get('fullTranslation')) is not bool or settings.get('fullTranslationSource') not in ('default','explicit'):
        raise SessionError('fullTranslation must be a boolean with preference provenance')
    if type(settings.get('version')) is not int or settings['version']<1 or not isinstance(settings.get('pendingFields'),list):
        raise SessionError('settings version and pending fields are required')
    if settings['status']=='confirmed':
        for field in ('translationLanguage','interactionLanguage'):
            language=settings.get(field)
            if not isinstance(language,dict) or not language.get('tag') or not language.get('name'):
                raise SessionError('confirmed settings require explicit document and interaction languages')
        if settings['pendingFields'] or not settings.get('confirmedAt'):
            raise SessionError('confirmed settings cannot contain unanswered required choices')
    for key in ('sources', 'coverage', 'glossary', 'claims', 'questions', 'corrections', 'audit'):
        if not isinstance(state.get(key), list):
            raise SessionError(f'{key} must be a list')
    role = state.get('roleProfile')
    if role is not None:
        for key in ('primaryField', 'paperType', 'leadRole', 'methodsCompetence',
                    'teachingApproach', 'boundaries', 'selectionRationale', 'status', 'version'):
            if not role.get(key):
                raise SessionError(f'roleProfile.{key} is required')
        if role['status'] not in ('provisional', 'confirmed'):
            raise SessionError('invalid role status')
    model = state.get('readingModel', {})
    if model.get('status') not in ('unbuilt', 'partial', 'verified'):
        raise SessionError('invalid whole-paper reading model status')
    source_by_id = {s.get('id'): s for s in state['sources']}
    if len(source_by_id) != len(state['sources']):
        raise SessionError('duplicate source ID')
    coverage_by_id = {c.get('id'): c for c in state['coverage']}
    if len(coverage_by_id) != len(state['coverage']):
        raise SessionError('duplicate coverage ID')
    for claim in state['claims']:
        if not claim.get('id') or not claim.get('statement'):
            raise SessionError('claim ID and statement are required')
        for evidence in claim.get('evidence', []):
            if evidence.get('sourceId') not in source_by_id or not evidence.get('locator'):
                raise SessionError('claim evidence must point to an identifiable source location')
    if model['status'] == 'verified':
        if not role or role['status'] != 'confirmed':
            raise SessionError('confirm the expert profile before marking the whole-paper model verified')
        required = model.get('requiredCoverageIds', [])
        if not model.get('inventoryComplete') or not required:
            raise SessionError('a complete and nonempty coverage inventory is required')
        primary = [s for s in state['sources'] if s.get('role') == 'primary']
        if not primary or not any(s.get('fullTextAvailable') for s in primary):
            raise SessionError('full primary paper is unavailable')
        for ident in required:
            item = coverage_by_id.get(ident)
            if not item or item.get('status') != 'verified' or not item.get('locator') or not item.get('note'):
                raise SessionError(f'required source coverage is incomplete: {ident}')
            source = source_by_id.get(item.get('sourceId'))
            if not source or not source.get('path'):
                raise SessionError(f'coverage has no local source: {ident}')
            source_path = Path(source['path'])
            if not source_path.is_absolute():
                source_path = session_dir / source_path
            if not source_path.is_file():
                raise SessionError(f'source file cannot be found: {ident}')
        if not model.get('researchQuestions') or not model.get('outline') or not model.get('synthesis'):
            raise SessionError('the whole-paper model needs questions, a complete outline, and a synthesis')
        if not state['claims']:
            raise SessionError('the whole-paper model needs traceable claims')
    progress = state.get('progress', {})
    if progress.get('activeEntry') not in (None, 'paper-prepare', 'paper-figure-explain',
                                           'paper-detail-explain', 'paper-ask'):
        raise SessionError('invalid active entry')


def new_session(paper_id: str, title: str) -> dict:
    return {
        'schemaVersion': 2, 'revision': 0,
        'paper': {'id': paper_id, 'title': title, 'version': None},
        'settings': {'status':'pending','translationLanguage':None,'interactionLanguage':None,
                     'fullTranslation':True,'fullTranslationSource':'default',
                     'pendingFields':['translationLanguage','fullTranslation'],'version':1,
                     'sourceLanguages':[],'presentation':'segmented','confirmedAt':None,'changeReason':None},
        'roleProfile': None, 'sources': [], 'coverage': [], 'glossary': [],
        'claims': [], 'questions': [], 'corrections': [], 'audit': [],
        'readingModel': {'status': 'unbuilt', 'inventoryComplete': False,
                         'requiredCoverageIds': [], 'researchQuestions': [], 'outline': [],
                         'synthesis': '', 'uncertainties': []},
        'progress': {'activeEntry': 'paper-prepare', 'translation': {}, 'figures': {},
                     'detail': {}, 'returnTo': None, 'lastQuestion': None},
        'graph': None,
    }


def atomic_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp_path = None
    try:
        with tempfile.NamedTemporaryFile('w', encoding='utf-8', dir=path.parent,
                                         prefix=path.name + '.', suffix='.tmp', delete=False) as handle:
            temp_path = Path(handle.name)
            json.dump(payload, handle, ensure_ascii=False, indent=2)
            handle.write('\n')
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temp_path, path)
    finally:
        if temp_path is not None and temp_path.exists():
            temp_path.unlink()


@contextmanager
def lock_session(path: Path):
    lock = path.with_name(path.name + '.lock')
    try:
        handle = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
    except FileExistsError as exc:
        raise SessionError('another write is in progress; refresh before retrying') from exc
    try:
        os.write(handle, str(os.getpid()).encode())
        yield
    finally:
        os.close(handle)
        lock.unlink()


def checkpoint(path: Path, draft: dict, expected_revision: int, reason: str) -> dict:
    if not reason.strip():
        raise SessionError('checkpoint reason is required')
    path.parent.mkdir(parents=True, exist_ok=True)
    with lock_session(path):
        current = json.loads(path.read_text(encoding='utf-8')) if path.exists() else None
        actual_revision = current['revision'] if current else -1
        if expected_revision != actual_revision:
            raise SessionError(f'stale revision: expected {expected_revision}, actual {actual_revision}')
        if current and draft.get('paper', {}).get('id') != current['paper']['id']:
            raise SessionError('a new primary paper requires a separate session')
        previous_role = (current or {}).get('roleProfile') or {}
        next_role = draft.get('roleProfile') or {}
        role_fields=('primaryField','subfields','paperType','leadRole','supportingPerspectives','methodsCompetence','teachingApproach','boundaries')
        if previous_role.get('leadRole') and any(next_role.get(k)!=previous_role.get(k) for k in role_fields):
            if not next_role.get('changeReason') or next_role.get('version', 0) <= previous_role.get('version', 0):
                raise SessionError('a role change needs an increased version and a reason')
        previous_settings=(current or {}).get('settings') or {}
        next_settings=draft.get('settings') or {}
        setting_fields=('translationLanguage','interactionLanguage','fullTranslation','presentation')
        if previous_settings.get('status')=='confirmed' and any(previous_settings.get(k)!=next_settings.get(k) for k in setting_fields):
            if not next_settings.get('changeReason') or next_settings.get('version',0)<=previous_settings.get('version',0):
                raise SessionError('a preference change needs an increased settings version and a reason')
        result = json.loads(json.dumps(draft))
        result['revision'] = actual_revision + 1
        validate(result, path.parent)
        result['audit'].append({'revision': result['revision'], 'reason': reason,
                                'at': datetime.now(timezone.utc).isoformat()})
        if current:
            atomic_json(path.parent / '.history' / f'rev-{actual_revision:06d}.json', current)
        atomic_json(path, result)
        return result


def configure(path,expected_revision,language_tag,language_name,full_translation=True,
              preference_source='default',interaction_tag=None,interaction_name=None,reason='confirm startup settings'):
    current=json.loads(path.read_text(encoding='utf-8'))
    validate(current,path.parent)
    if not language_tag.strip() or not language_name.strip():
        raise SessionError('the user must supply or explicitly accept a target language')
    if (interaction_tag is None)!=(interaction_name is None):
        raise SessionError('provide both interaction language tag and name')
    settings=current['settings']
    document={'tag':language_tag.strip(),'name':language_name.strip()}
    interaction={'tag':interaction_tag or document['tag'],'name':interaction_name or document['name']}
    changed=any((settings.get('translationLanguage')!=document,settings.get('interactionLanguage')!=interaction,settings.get('fullTranslation')!=full_translation))
    if settings['status']=='confirmed' and changed:
        settings['version']+=1
        stale=[]
        if settings.get('translationLanguage')!=document:stale.append('translation')
        if settings.get('interactionLanguage')!=interaction:stale.extend(('explanations','map'))
        settings['staleOutputs']=stale
    settings.update(status='confirmed',translationLanguage=document,interactionLanguage=interaction,
                    fullTranslation=full_translation,fullTranslationSource=preference_source,
                    pendingFields=[],confirmedAt=datetime.now(timezone.utc).isoformat(),changeReason=reason)
    if not full_translation:
        current['progress'].setdefault('translation',{})['status']='skipped-by-preference'
    elif current['progress'].get('translation',{}).get('status')=='skipped-by-preference':
        current['progress']['translation']['status']='pending'
    return checkpoint(path,current,expected_revision,reason)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    init = sub.add_parser('init')
    init.add_argument('--session', type=Path, required=True)
    init.add_argument('--paper-id', required=True)
    init.add_argument('--title', required=True)
    read = sub.add_parser('read')
    read.add_argument('--session', type=Path, required=True)
    check = sub.add_parser('validate')
    check.add_argument('--session', type=Path, required=True)
    save = sub.add_parser('checkpoint')
    save.add_argument('--session', type=Path, required=True)
    save.add_argument('--draft', type=Path, required=True)
    save.add_argument('--expected-revision', type=int, required=True)
    save.add_argument('--reason', required=True)
    config=sub.add_parser('configure')
    config.add_argument('--session',type=Path,required=True)
    config.add_argument('--expected-revision',type=int,required=True)
    config.add_argument('--language-tag',required=True)
    config.add_argument('--language-name',required=True)
    config.add_argument('--full-translation',choices=('yes','no'),default='yes')
    config.add_argument('--preference-source',choices=('default','explicit'),default='default')
    config.add_argument('--interaction-tag')
    config.add_argument('--interaction-name')
    config.add_argument('--reason',default='confirm startup settings')
    args = parser.parse_args()
    if args.command == 'init':
        if args.session.exists():
            raise SessionError('session already exists')
        payload = checkpoint(args.session, new_session(args.paper_id, args.title), -1, 'initialize primary paper')
    elif args.command == 'configure':
        if (args.interaction_tag is None)!=(args.interaction_name is None):
            parser.error('provide both interaction language tag and name')
        source='explicit' if args.full_translation=='no' else args.preference_source
        payload=configure(args.session,args.expected_revision,args.language_tag,args.language_name,
                          args.full_translation=='yes',source,args.interaction_tag,args.interaction_name,args.reason)
    elif args.command == 'checkpoint':
        payload = checkpoint(args.session, json.loads(args.draft.read_text(encoding='utf-8')),
                             args.expected_revision, args.reason)
    else:
        payload = json.loads(args.session.read_text(encoding='utf-8'))
        validate(payload, args.session.parent)
    if args.command == 'read':
        print(json.dumps(payload, ensure_ascii=True, indent=2))
    else:
        print(json.dumps({'paperId': payload['paper']['id'], 'revision': payload['revision'],
                          'modelStatus': payload['readingModel']['status'],
                          'expertRole': (payload.get('roleProfile') or {}).get('leadRole')}, ensure_ascii=True))


if __name__ == '__main__':
    main()
