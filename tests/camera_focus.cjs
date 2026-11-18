const assert=require('node:assert/strict');
const {createHarness}=require('./viewer_harness.cjs');
const h=createHarness({fixture:'detail-map'});
const view=()=>h.plain('({camera:{...camera},zoom,activeTree,detailMode,manualZoom})');

// Exercise the actual select/close path from an intentionally off-center browsing view.
h.run('zoom=1.7;camera={x:-821.25,y:436.5};manualZoom=true;renderCamera();');
const before=view(),checksum=h.run('historyBook.checksum');
h.run('select("node","a");');
assert.notDeepEqual(view().camera,before.camera,'Selecting the node should temporarily center it');
for(const width of [1100,950,850]){h.el('map').clientWidth=width;h.run('resizeCamera();');}
h.el('close').onclick();
assert.deepEqual(view(),before,'Closing node focus must restore the exact previous viewport, not the whole-tree center');
for(const width of [950,1100,1200]){h.el('map').clientWidth=width;h.run('resizeCamera();');}
assert.deepEqual(view(),before,'Sidebar ResizeObserver callbacks must not overwrite the restored viewport');

// Switching among inspected nodes keeps the first browsing return point.
h.run('select("node","a");select("node","f");zoomAt(2.4);close();');
assert.deepEqual(view(),before,'Leaving a sequence of inspections restores its original position and scale');

// Search navigation is a temporary inspection, too.
h.run('locate("f");close();');
assert.deepEqual(view(),before,'Closing a searched node restores the browsing viewport');
h.run('select("node","a");');
for(const listener of h.documentListeners.get('keydown'))listener({key:'Escape'});
assert.deepEqual(view(),before,'The actual Escape handler restores the browsing camera');
h.run('select("node","a");beginPan({button:0,pointerId:27,clientX:20,clientY:30,target:{closest(){return null;}}});endPan({pointerId:27});');
assert.deepEqual(view(),before,'A blank-canvas pointer click restores the browsing camera');
h.run('select("node","a");select("edge",tree().linkIds[0]);close();close();');
assert.deepEqual(view(),before,'Following a relationship and repeated close preserve the inspection origin');
assert.equal(h.run('historyBook.checksum'),checksum,'Camera focus is not a saved content edit');
assert.equal(h.run('workspaceDirty()'),false);

// Follow a node into another tree/mode, then return to the original browsing context.
const other=createHarness({fixture:'terminology-map'});
other.run('zoom=.7;camera={x:194.5,y:-259.25};manualZoom=false;');
const origin=other.plain('({camera,zoom,activeTree,detailMode,manualZoom})');
other.run('locate("recall");');assert.equal(other.run('activeTree'),'evaluation-terms');
other.run('close();');assert.deepEqual(other.plain('({camera,zoom,activeTree,detailMode,manualZoom})'),origin);
other.run('select("node","a");changeTree("proof-detail","a");close();');
assert.deepEqual(other.plain('({camera,zoom,activeTree,detailMode,manualZoom})'),origin);
other.run('select("node","a");changeTree("proof-detail");');
const navigated=other.plain('({camera,zoom,activeTree,detailMode,manualZoom})');
other.run('select("node","lemma");close();');
assert.deepEqual(other.plain('({camera,zoom,activeTree,detailMode,manualZoom})'),navigated,'An explicit tree switch establishes a new browsing context');

// A queued centering callback must not move the camera after selection has already closed.
const queued=createHarness({fixture:'detail-map',deferFrames:true});queued.flushFrames();
queued.run('zoom=1.3;camera={x:-309.5,y:719.25};manualZoom=true;');
const queuedOrigin=queued.plain('({camera,zoom,activeTree,detailMode,manualZoom})');
queued.run('select("node","a");select("node","f");close();');queued.flushFrames();
assert.deepEqual(queued.plain('({camera,zoom,activeTree,detailMode,manualZoom})'),queuedOrigin);
queued.run('locate("f");close();');queued.flushFrames();
assert.deepEqual(queued.plain('({camera,zoom,activeTree,detailMode,manualZoom})'),queuedOrigin);
queued.run('importHistoryText(History.stringify(historyBook));zoom=1.3;camera={x:-309.5,y:719.25};manualZoom=true;select("node","a");close();');queued.flushFrames();
assert.deepEqual(queued.plain('({camera,zoom,activeTree,detailMode,manualZoom})'),queuedOrigin,'A superseded import-centering frame cannot overwrite a later focus return');
console.log(JSON.stringify({testKind:'Minimal-DOM selection/search/close/resize paths',nodeExitRestoresViewport:true,resizeRetainsReturnView:true,chainedFocusKeepsOrigin:true,focusedZoomRestoresOrigin:true,searchExitRestoresViewport:true,crossTreeInspectionReturnsOrigin:true,explicitNavigationResetsOrigin:true,staleAnimationCannotRecenter:true,focusIsNotContentEdit:true}));
