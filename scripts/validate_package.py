"""Check package structure, reachable references, English defaults, and locked assets."""
from pathlib import Path
import ast,hashlib,json,re,subprocess,sys,tempfile

ROOT=Path(__file__).resolve().parents[1]
PUBLIC={'paper-prepare','paper-figure-explain','paper-detail-explain','paper-ask','paper-add-map','paper-skill-help'}


def validate(root=ROOT):
    root=Path(root).resolve();skills=list((root/'skills').glob('*/SKILL.md'));internal=list((root/'interfaces').glob('*/SKILL.md'))
    if {p.parent.name for p in skills}!=PUBLIC or len(internal)!=13:raise ValueError('expected six public entries and thirteen internal interfaces')
    all_skills=skills+internal;targets={p.resolve():0 for p in internal};references=0
    for p in all_skills:
        text=p.read_text(encoding='utf-8');parts=text.split('---',2)
        if len(parts)!=3 or parts[0].strip():raise ValueError('invalid frontmatter: '+str(p))
        lines=parts[1].strip().splitlines()
        if len(lines)!=2 or lines[0]!='name: '+p.parent.name or not lines[1].startswith('description: '):raise ValueError('invalid name/description: '+str(p))
        description=lines[1][13:].strip()
        if not description or len(description)>1024 or len(text.splitlines())>500:raise ValueError('invalid skill size or description')
        if re.search(r'^#{1,6} .*?(?:addendum|previous rules|additional work)',text,re.M|re.I):raise ValueError('historical addendum structure remains')
    for p in root.rglob('*'):
        # Generated immutable preview revisions are not shipped skill resources.
        if not p.is_file() or '.git' in p.parts or '__pycache__' in p.parts or ('examples' in p.parts and ('revisions' in p.parts or 'history' in p.parts)) or p.name in ('service.json','service.lock'):continue
        if p.suffix in ('.md','.json','.py','.html','.in','.cjs','.js'):
            text=p.read_text(encoding='utf-8')
            if any(0x3400<=ord(c)<=0x9fff for c in text):raise ValueError('untranslated CJK content remains: '+str(p))
            if p.suffix=='.py':ast.parse(text)
            if p.suffix=='.json':json.loads(text)
        if p.suffix=='.md':
            for ref in re.findall(r'\]\(([^)]+)\)',p.read_text(encoding='utf-8')):
                if '://' in ref or ref.startswith('#'):continue
                target=(p.parent/ref.split('#',1)[0]).resolve()
                if not target.is_relative_to(root) or not target.exists():raise ValueError('broken/out-of-package reference: '+str(p)+' -> '+ref)
                references+=1
                if p in all_skills and target in targets:targets[target]+=1
    if not all(targets.values()):raise ValueError('an internal interface is unreachable')
    manifest=json.loads((root/'.codex-plugin/plugin.json').read_text(encoding='utf-8'))
    if manifest['skills']!='./skills/':raise ValueError('plugin must expose only the public skills directory')
    assets=root/'interfaces/paper-map/assets';lock=json.loads((assets/'template-lock.json').read_text(encoding='utf-8'))
    for name,key in [('graph-viewer.html.in','templateSha256'),('relation-registry.json','registrySha256'),('locale-en.json','localeSha256'),('node-shapes.json','shapesSha256'),('map-server.cjs','storageServiceSha256')]:
        if hashlib.sha256((assets/name).read_bytes()).hexdigest()!=lock[key]:raise ValueError('locked asset mismatch: '+name)
    runtime='\n'.join((assets/name).read_text(encoding='utf-8') for name in ('history-core.js','detail-core.js','history-viewer.js','camera-viewer.js','focus-viewer.js','viewer-runtime.js'))
    compiled=(assets/'viewer-shell.html.in').read_text(encoding='utf-8').replace('__RUNTIME__',runtime)
    if compiled!=(assets/'graph-viewer.html.in').read_text(encoding='utf-8'):raise ValueError('compiled viewer differs from maintained source')
    subprocess.run(['node','--check',str(assets/'viewer-runtime.js')],check=True,capture_output=True)
    with tempfile.TemporaryDirectory() as tmp:
        for html in list((root/'examples').glob('*-map/index.html'))+[assets/'graph-viewer.html.in']:
            code=re.findall(r'<script(?: [^>]*)?>(.*?)</script>',html.read_text(encoding='utf-8'),re.S)[-1]
            script=Path(tmp)/'viewer.js';script.write_text(code,encoding='utf-8')
            subprocess.run(['node','--check',str(script)],check=True,capture_output=True)
    return {'passed':True,'publicEntries':len(PUBLIC),'internalInterfaces':13,'referencesChecked':references,
            'englishInstructionAndDefaultAssetScan':'passed','lockedAssets':'passed','javascriptSyntax':'passed',
            'semanticTranslationReview':'see docs/translation-review.md','realPaperTeaching':'not tested','browserVisualQA':'separate scoped record in docs/browser-qa.md'}


if __name__=='__main__':print(json.dumps(validate(),indent=2))
