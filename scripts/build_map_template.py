"""Rebuild the locked map from its maintained shell/runtime without redesigning it."""
from pathlib import Path
import base64,hashlib,json,re
ROOT=Path(__file__).resolve().parents[1]


def vendor_lock(assets):
    folder=assets/'vendor';lock=json.loads((folder/'vendor-lock.json').read_text(encoding='utf-8'))
    for name,expected in lock['files'].items():
        path=(folder/name).resolve()
        if not path.is_relative_to(folder.resolve()) or hashlib.sha256(path.read_bytes()).hexdigest()!=expected:
            raise ValueError('vendored rich-text asset mismatch: '+name)
    return lock


def compile_template(assets):
    assets=Path(assets);vendor_lock(assets)
    shell=(assets/'viewer-shell.html.in').read_text(encoding='utf-8')
    libraries=[]
    for name in ('marked/marked.umd.js','katex/katex.min.js'):
        source=(assets/'vendor'/name).read_text(encoding='utf-8')
        license_text=(assets/'vendor'/name.split('/')[0]/'licenses/LICENSE').read_text(encoding='utf-8')
        source='/* Bundled third-party license\n'+license_text.replace('*/','* /')+'\n*/\n'+source
        source=re.sub(r'^//# sourceMappingURL=.*$', '',source,flags=re.M)
        source=re.sub(r'[^\x00-\x7f]',lambda m:json.dumps(m[0],ensure_ascii=True)[1:-1],source)
        libraries.append(re.sub(r'</script',r'<\\/script',source,flags=re.I))
    runtime='\n'.join(libraries+[(assets/name).read_text(encoding='utf-8') for name in ('rich-text.js','history-core.js','detail-core.js','history-viewer.js','camera-viewer.js','focus-viewer.js','viewer-runtime.js')])
    css=(assets/'vendor/katex/katex.min.css').read_text(encoding='utf-8')
    def inline_font(match):
        name=re.search(r'url\(fonts/([\w.-]+\.woff2)\)',match[0])
        if not name:raise ValueError('KaTeX font source has no WOFF2 font')
        encoded=base64.b64encode((assets/'vendor/katex/fonts'/name[1]).read_bytes()).decode('ascii')
        return 'src:url(data:font/woff2;base64,'+encoded+') format("woff2")'
    css=re.sub(r'src:[^;}]+',inline_font,css)
    if 'url(fonts/' in css:raise ValueError('math fonts were not embedded')
    css+='\n'+(assets/'rich-text.css').read_text(encoding='utf-8')
    if shell.count('__RUNTIME__')!=1 or shell.count('__BOOTSTRAP__')!=1 or shell.count('__RICH_TEXT_CSS__')!=1:
        raise ValueError('invalid fixed template slots')
    return shell.replace('__RUNTIME__',runtime).replace('__RICH_TEXT_CSS__',css)


def build():
    assets=ROOT/'interfaces/paper-map/assets'
    (assets/'graph-viewer.html.in').write_text(compile_template(assets),encoding='utf-8',newline='\n')
    lock=json.loads((assets/'template-lock.json').read_text(encoding='utf-8'))
    for name,key in [('graph-viewer.html.in','templateSha256'),('locale-en.json','localeSha256'),('node-shapes.json','shapesSha256'),('map-server.cjs','storageServiceSha256'),('vendor/vendor-lock.json','richTextVendorLockSha256')]:
        lock[key]=hashlib.sha256((assets/name).read_bytes()).hexdigest()
    (assets/'template-lock.json').write_text(json.dumps(lock,ensure_ascii=False,sort_keys=True,indent=2)+'\n',encoding='utf-8',newline='\n')
    return {'template':lock['version'],'layout':lock['layoutVersion']}


if __name__=='__main__':print(json.dumps(build()))
