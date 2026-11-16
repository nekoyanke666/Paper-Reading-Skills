const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'examples/feedback-map/index.html'), 'utf8');
const bootstrap = html.match(/<script id="bootstrap" type="application\/json">([\s\S]*?)<\/script>/)[1];
const scripts = [...html.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)];
const code = scripts.at(-1)[1];
const elements = new Map();
function element(id) {
  if (!elements.has(id)) elements.set(id, {
    id, value: '', textContent: '', innerHTML: '', style: {setProperty(k,v){this[k]=v;}}, dataset: {}, scrollLeft: 0, scrollTop: 0,
    clientWidth: 1200, clientHeight: 760,
    classList: { add() {}, remove() {}, toggle() {} },
    setAttribute() {}, addEventListener() {}, focus() {}, scrollIntoView() {}, scrollBy() {},
    getBoundingClientRect() { return { left: 0, top: 0, width: 1200, height: 760 }; }
  });
  return elements.get(id);
}
const fixture=JSON.parse(bootstrap);fixture.graph.nodes.find(n=>n.id==='r').aliases=['receptor R'];
element('bootstrap').textContent = JSON.stringify(fixture);
const poisoned=JSON.parse(bootstrap);poisoned.revision=999999;poisoned.paper.title='poisoned local cache';
const store = new Map([['paper-map-session:'+poisoned.paper.id,JSON.stringify(poisoned)]]);
const sandbox = {
  document: { getElementById: element, querySelectorAll: () => [], querySelector: () => null, addEventListener() {} },
  localStorage: { getItem: k => store.get(k) || null, setItem: (k, v) => store.set(k, v) },
  location: { protocol: 'file:' },
  crypto: require('node:crypto'), CSS: { escape: x => x },
  setInterval() {}, setTimeout() { return 0; }, clearTimeout() {},
  requestAnimationFrame: fn => fn(),
  ResizeObserver: class { observe() {} }, matchMedia: () => ({ matches: true }),
  addEventListener() {},
};
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(code, sandbox, { timeout: 5000 });
const run = code => vm.runInContext(code, sandbox, { timeout: 5000 });
assert.notEqual(run('state.paper.title'), 'poisoned local cache');
assert.equal(run('canonicalRevision'), JSON.parse(bootstrap).revision);
assert.equal(run('validate(state)'), true);
assert.equal(run("memberships('r').length"), 2);
assert.equal(run("query='receptor R'; matches()[0].id"), 'r');
assert.equal(run("changeTree('feedback','r'); locate('m'); activeTree"), 'main');
assert.equal(run('selected.id'), 'm');
assert.equal(run("state.graph.relationTypes['inhibits'].marker"), 'inhibit');
assert.ok(run("route(state.graph.links.find(e=>e.relationType==='inhibits')).d"));
const previousPositions = run('JSON.stringify(tree().positions)');
run("query=''; select('node','response')");
let lastId;
for (let i = 1; i <= 6; i++) {
  run("editor('extend')");
  element('new-label').value = `Test concept ${i}`;
  element('new-relation').value = 'requires';
  element('new-detail').value = 'Runtime fixture, not saved to deliverable data.';
  element('edit-form').onsubmit({ preventDefault() {} });
  const currentId = run('selected.id');
  assert.notEqual(currentId, lastId);
  if (lastId) assert.equal(run('state.graph.links.at(-1).from'), lastId);
  lastId = currentId;
  assert.equal(run('validate(state)'), true);
}
const oldPositions = JSON.parse(previousPositions);
const afterPositions = JSON.parse(run('JSON.stringify(tree().positions)'));
for (const id of Object.keys(oldPositions)) assert.deepEqual(afterPositions[id], oldPositions[id]);
assert.equal(run(`query='Test concept 6'; matches().length`), 1);
run("editor('tree')");
element('new-label').value = 'Test tree';
element('edit-form').onsubmit({ preventDefault() {} });
assert.equal(run('tree().rootId'), lastId);
assert.equal(run(`memberships(${JSON.stringify(lastId)}).length`), 2);
assert.equal(run('validate(state)'), true);
assert.equal(run("query='receptor R'; locate('r'); selected.id"), 'r');
assert.equal(run('canonicalRevision'), JSON.parse(bootstrap).revision);
assert.equal(run('localDraftRevision'),7);
const next = JSON.parse(bootstrap);
next.revision += 1;
next.graph.nodes.find(n => n.id === 'r').detail += 'Updated fixture explanation.';
sandbox.testNext = next;
assert.equal(run('window.updatePaperMap(testNext)'), false);
assert.ok(run(`state.graph.nodes.some(n=>n.id===${JSON.stringify(lastId)})`));
assert.equal(run('window.updatePaperMap(testNext)'), false);
const report = {
  test_kind: 'JavaScript runtime and data logic with minimal DOM stub; not a browser render test',
  shared_node_identity: 'passed', global_node_alias_search: 'passed', cross_tree_search_location: 'passed',
  causal_feedback_cycle: 'passed', extend_from_child_six_times: 'passed', preserve_existing_positions: 'passed',
  new_tree_reuses_same_node: 'passed', source_refresh_retains_user_edits: 'passed',
  browser_cache_cannot_override_canonical: 'passed', local_drafts_keep_canonical_revision: 'passed', writes_to_deliverable_data: false,
};
process.stdout.write(JSON.stringify(report, null, 2));
