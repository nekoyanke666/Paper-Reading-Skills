const assert=require('node:assert/strict'),R=require('../interfaces/paper-map/assets/rich-text.js');
const H=require('../interfaces/paper-map/assets/history-core.js'),{createHarness}=require('./viewer_harness.cjs');
const md='# Heading\n\n**Strong** and *emphasis*, ~~removed~~.\n\n- First\n- Second\n\n1. One\n2. Two\n\n> Quotation\n\n| A | B |\n|---|---|\n| 1 | 2 |\n\n[Source](https://example.com/paper?q=1#fig2)\n\n```js\nconst x = "<tag>";\n```';
const html=R.render(md);for(const tag of ['<h1>','<strong>','<em>','<del>','<ul>','<ol>','<blockquote>','<table>','<pre><code>'])assert.ok(html.includes(tag),tag);
assert.ok(html.includes('href="https://example.com/paper?q=1#fig2"'));assert.ok(html.includes('&lt;tag&gt;'));
for(const source of ['$x_i^2$','\\(x_i^2\\)','$$\\frac{a}{b}$$','\\[\\sum_{i=1}^n i\\]','```math\n\\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}\n```']){
 const rendered=R.render(source);assert.ok(rendered.includes('class="katex'),'Expected formatted math: '+source);assert.ok(rendered.includes('<math'),'Expected accessible MathML');
}
assert.ok(R.render('$$\\frac{a}{b}$$').includes('<mfrac>'));
assert.ok(R.render('\\[\\begin{aligned}a&=b+c\\\\d&=e\\end{aligned}\\]').includes('<mtable'));
assert.ok(R.render('**Metric** $x_1*x_2$ follows.').includes('<strong>Metric</strong>'));
for(const source of ['`$x$`','```text\n$$x$$\n```','\\$x\\$','The price is $5 and $10.'])assert.ok(!R.render(source).includes('class="katex'),source);
assert.ok(R.render('$\\unknowncommand{x}$').includes('class="math-source"'));
assert.ok(R.render('Plain text & symbols < >').includes('&amp;'));
for(const source of ['<script>alert(1)</script>','<img src=x onerror=alert(1)>','[x](javascript:alert%281%29)','[x](data:text/html,boom)','[x](java&#x73;cript:boom)','![x](https://example.com/image.png)','$\\href{javascript:alert(1)}{x}$','$\\includegraphics{https://example.com/x.png}$']){
 const rendered=R.render(source);assert.ok(!/<(?:script|img|iframe|object)\b/i.test(rendered),source);assert.ok(!/href=["'](?:javascript|data):/i.test(rendered),source);
}
assert.equal(R.render(md),html);assert.ok(R.render('$\\gdef\\X{a}\\X$').includes('katex'));assert.ok(R.render('$\\X$').includes('math-source'),'Macros must not leak across nodes/formulas');

// Drive the compiled viewer with real Marked/KaTeX rather than a renderer stub.
const h=createHarness({fixture:'terminology-map'}),before=h.run('historyBook.checksum');h.sandbox.richSource=md+'\n\n$$\\frac{TP}{TP+FP}$$';
h.run('node("input").detail=richSource;state.glossary.find(t=>t.id==="input-set").definition="**Defined** with $x_1$";node("input").limits="- Condition $n>0$";select("node","input");');
let sidebar=h.el('details').innerHTML;assert.ok(sidebar.includes('<strong>Strong</strong>'));assert.ok(sidebar.includes('<strong>Defined</strong>'));assert.ok(sidebar.includes('class="katex'));assert.ok(sidebar.includes('<mfrac>'));
const stored=h.run('currentModel()');assert.equal(stored.graph.nodes.input.detail,h.sandbox.richSource);assert.ok(!stored.graph.nodes.input.detail.includes('<span class="katex'));
const book=H.commit(h.run('historyBook'),stored,'2026-11-18T00:00:00.000Z'),loaded=H.parse(H.stringify(book));assert.equal(H.materialize(loaded).graph.nodes.input.detail,h.sandbox.richSource);
assert.equal(h.run('historyBook.checksum'),before,'Rendering must not modify saved history');
h.sandbox.richBook=H.stringify(book);assert.equal(h.run('importHistoryText(richBook)'),true);h.run('select("node","input");');assert.ok(h.el('details').innerHTML.includes('<strong>Strong</strong>'));
h.run('historyVersion(-1);select("node","input");');assert.ok(!h.el('details').innerHTML.includes('<strong>Strong</strong>'));
h.run('historyVersion(1);select("node","input");');assert.ok(h.el('details').innerHTML.includes('<mfrac>'));
console.log(JSON.stringify({markdown:true,inlineAndDisplayMath:true,matricesAndFractions:true,codeAndEscapedDollarsPreserved:true,unsupportedMathRetainsSource:true,rawHtmlEscaped:true,unsafeLinksAndRemoteImagesBlocked:true,mathMacrosIsolated:true,compiledSidebarIntegration:true,sourcePreservedInV1History:true,importAndPrevNext:true}));
