"""Install only the six public entries; keep shared interfaces outside discovery."""
from pathlib import Path
import argparse,json,os,shutil,stat,tempfile

ROOT=Path(__file__).resolve().parents[1]
ENTRIES=('paper-prepare','paper-figure-explain','paper-detail-explain','paper-ask','paper-add-map','paper-skill-help')
OWNER='paper-reading-skills'


def linked(path):
    try:
        return path.is_symlink() or bool(getattr(path.lstat(),'st_file_attributes',0)&getattr(stat,'FILE_ATTRIBUTE_REPARSE_POINT',0))
    except FileNotFoundError:
        return False


def remove_owned_target(target,home):
    resolved=target.resolve()
    allowed={home/'paper-reading-skills'}|{home/'skills'/name for name in ENTRIES}
    if resolved not in allowed or linked(target):
        raise ValueError('recursive removal target escaped the installation boundary')
    shutil.rmtree(target)


def install(home,source=ROOT):
    home=Path(home).resolve();source=Path(source).resolve()
    bundle=home/'paper-reading-skills'
    destinations=[bundle]+[home/'skills'/name for name in ENTRIES]
    for target in destinations:
        if not target.resolve().is_relative_to(home) or linked(target):
            raise ValueError('refusing to replace a linked target: '+str(target))
        if target.exists():
            marker=target/'installation.json'
            if not marker.is_file() or json.loads(marker.read_text(encoding='utf-8')).get('owner')!=OWNER:
                raise ValueError('destination is not owned by this installer: '+str(target))
    for name in ENTRIES:
        if not (source/'skills'/name/'SKILL.md').is_file():raise ValueError('missing public entry: '+name)
    if len(list((source/'interfaces').glob('*/SKILL.md')))!=13:raise ValueError('incomplete shared interfaces')
    with tempfile.TemporaryDirectory(prefix='paper-reading-install-') as tmp:
        stage=Path(tmp);shared=stage/'bundle';shared.mkdir()
        for name in ('interfaces','examples'):
            shutil.copytree(source/name,shared/name,ignore=shutil.ignore_patterns('__pycache__','*.pyc','revisions','history','service.json','service.lock','*.tmp'))
        version=(source/'VERSION').read_text(encoding='utf-8').strip()
        marker={'owner':OWNER,'version':version,'source':str(source),'entries':list(ENTRIES)}
        (shared/'installation.json').write_text(json.dumps(marker,indent=2)+'\n',encoding='utf-8')
        staged=[shared]
        for name in ENTRIES:
            target=stage/name;shutil.copytree(source/'skills'/name,target)
            skill=target/'SKILL.md'
            skill.write_text(skill.read_text(encoding='utf-8').replace('../../interfaces/','../../paper-reading-skills/interfaces/'),encoding='utf-8',newline='\n')
            (target/'installation.json').write_text(json.dumps(marker,indent=2)+'\n',encoding='utf-8')
            staged.append(target)
        old=[];written=[]
        try:
            for ready,target in zip(staged,destinations):
                target.parent.mkdir(parents=True,exist_ok=True)
                if target.exists():
                    backup=stage/('old-'+target.name);shutil.copytree(target,backup)
                    old.append((backup,target));remove_owned_target(target,home)
                written.append(target)
                shutil.copytree(ready,target)
        except Exception:
            for target in reversed(written):
                if target.is_dir():remove_owned_target(target,home)
            for backup,target in old:
                if target.is_dir():remove_owned_target(target,home)
                shutil.copytree(backup,target)
            raise
    return {'installed':True,'version':version,'entries':[str(p) for p in destinations[1:]],'interfaces':str(bundle/'interfaces')}


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--codex-home',type=Path,default=Path(os.environ.get('CODEX_HOME',Path.home()/'.codex')))
    args=parser.parse_args();print(json.dumps(install(args.codex_home),indent=2))


if __name__=='__main__':main()
