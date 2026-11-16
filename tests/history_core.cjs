const assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs'),path=require('node:path');
const H=require('../interfaces/paper-map/assets/history-core.js');
for(const text of ['', 'abc', 'RNA alpha \u03b1 \ud83e\uddec'])assert.equal(H.sha256(text),crypto.createHash('sha256').update(text).digest('hex'));
const source=require('../examples/terminology-map/paper-state.json'),base=H.pack(source);
assert.ok(!H.stable(base).includes('shapeSignature'));assert.ok(!('routes' in base.graph.trees.main));
let history=H.create(base),m=H.copy(base);m.graph.trees.main.positions.a.x+=37;
history=H.commit(history,m,'2026-11-16T00:00:00.000Z');assert.equal(history.commits.length,1);assert.equal(history.commits[0].patch.length,1);
assert.deepEqual(history.commits[0].patch[0].path,['graph','trees','main','positions','a','x']);
const moved=H.materialize(history);m=H.copy(moved);m.graph.nodes.extra={id:'extra',label:'Extra term',title:'Extra term',type:'concept',visualRole:'concept',detail:'User note',aliases:[],sourceRefs:[],termIds:[],provenance:'user-note'};
m.graph.trees.saved={id:'saved',kind:'narrative',title:'User tree',focusQuestion:'User tree',rootId:'extra',nodeIds:['extra'],linkIds:[],positions:{extra:{x:40,y:60}}};m.graph.treeOrder.push('saved');
history=H.commit(history,m,'2026-11-16T00:01:00.000Z');assert.equal(history.commits.length,2);
const bytes=H.stringify(history),loaded=H.parse(bytes);assert.deepEqual(H.materialize(loaded),m);assert.equal(H.unpack(H.materialize(loaded)).graph.trees.at(-1).id,'saved');
let older=H.navigate(loaded,0);assert.deepEqual(H.materialize(older),base);older=H.navigate(older,2);assert.ok(H.materialize(older).graph.nodes.extra);
older=H.navigate(older,1);const edited=H.materialize(older);edited.graph.nodes.a.detail+=' A new note after restoring an older save.';
const appended=H.commit(older,edited,'2026-11-16T00:02:00.000Z');assert.equal(appended.commits.length,3);assert.equal(appended.commits[2].origin,1);assert.ok(H.materialize(appended,2).graph.nodes.extra);
assert.equal(H.commit(appended,edited).commits.length,3);
const corrupt=JSON.parse(bytes);corrupt.base.paper.title='Corrupt';assert.throws(()=>H.verify(corrupt),/checksum/);
const future=JSON.parse(bytes);future.formatVersion=2;assert.throws(()=>H.verify(future),/Unsupported/);
const bad=H.copy(m);bad.graph.nodeShapes.roles.concept.width='0" onload="alert(1)';assert.throws(()=>H.validateModel(bad),/shape/);
const badNode=H.copy(m);badNode.graph.nodes.a.visualRole='x" onclick="alert(1)';assert.throws(()=>H.validateModel(badNode),/node/);
const pollution=H.apply(base,[{op:'set',path:['graph','nodes','__proto__'],value:{id:'__proto__'}}]);assert.equal({}.id,undefined);assert.equal(Object.getOwnPropertyDescriptor(pollution.graph.nodes,'__proto__').value.id,'__proto__');
assert.throws(()=>H.apply(base,[{op:'set',path:['graph','missing','x'],value:1}]),/path/);
let many=H.create(base),latest=H.copy(base);for(let i=0;i<40;i++){latest.graph.trees.main.positions.a.x++;many=H.commit(many,latest,'2026-11-16T00:00:00.000Z');}
const compactSize=Buffer.byteLength(H.stringify(many)),snapshotsSize=Buffer.byteLength(JSON.stringify(source))*41;
assert.ok(compactSize<snapshotsSize*.1);H.verify(many);
const goldenPath=path.join(__dirname,'fixtures/history-v1-golden.json');assert.ok(fs.existsSync(goldenPath),'Frozen v1 compatibility fixture is required');{const golden=H.parse(fs.readFileSync(goldenPath,'utf8'));assert.equal(H.materialize(golden).paper.id,'history-format-v1-golden');}
console.log(JSON.stringify({historyCore:true,sha256KnownVectors:true,positionsNodesTreesRoundTrip:true,chronologicalUndoRedo:true,oldFutureRetained:true,corruptionRejected:true,sourceAndProvenanceRetained:true,fortySaveBytes:compactSize,repeatedSnapshotBytes:snapshotsSize}));
