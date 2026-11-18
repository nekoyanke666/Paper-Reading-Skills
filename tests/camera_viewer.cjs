const assert=require('node:assert/strict'),H=require('../interfaces/paper-map/assets/history-core.js'),{createHarness,drag}=require('./viewer_harness.cjs');
(async()=>{
 const h=createHarness({fixture:'detail-map'}),original=h.plain('state.graph.trees'),saved=h.run('historyBook.checksum');
 h.run('zoom=1;camera={x:200,y:100};');const anchor=h.plain('screenToWorld(350,240)');
 h.run('zoomAt(1.7,350,240)');assert.deepEqual(h.plain('screenToWorld(350,240)'),anchor);assert.equal(h.run('workspaceDirty()'),false);
 h.run('beginPan({button:0,pointerId:9,clientX:20,clientY:30,target:{closest(){return null;}}});movePan({pointerId:9,clientX:-30000,clientY:22000});endPan({pointerId:9});');assert.ok(h.run('camera.x<-20000&&camera.y>20000'));assert.equal(h.run('workspaceDirty()'),false);
 const moved=h.plain('camera');h.run('beginPan({button:0,pointerId:8,clientX:20,clientY:30,target:{closest(){return null;}}});movePan({pointerId:7,clientX:500,clientY:500});');assert.deepEqual(h.plain('camera'),moved);
 h.run('movePan({pointerId:8,clientX:500,clientY:500});endPan({pointerId:8},true);');assert.deepEqual(h.plain('camera'),moved);
 h.run('centerGraph();');assert.equal(h.run('manualZoom'),false);assert.equal(h.run('historyBook.checksum'),saved);assert.deepEqual(h.plain('state.graph.trees'),original);
 assert.ok(h.run('(()=>{const g=geometry(),m=$ ("map");return Math.abs(camera.x+(g.minX+g.maxX)/2*zoom-m.clientWidth/2)<.001&&Math.abs(camera.y+(g.minY+g.maxY)/2*zoom-m.clientHeight/2)<.001;})()'));
 const wideZoom=h.run('zoom');h.run('manualZoom=true;camera={x:-9000,y:12000};');h.el('map').clientWidth=600;h.el('map').clientHeight=400;h.run('resizeCamera();');assert.equal(h.run('zoom'),wideZoom);assert.equal(h.run('manualZoom'),true);assert.deepEqual(h.plain('camera'),{x:-9000,y:12000});assert.deepEqual(h.plain('state.graph.trees'),original);
 h.run('select("node","a");setDetailMode("low");setDetailMode("high");locate("f");close();');assert.equal(h.run('zoom'),wideZoom);
 assert.equal(h.el('board').style.transform.includes('scale'),false);assert.equal(h.el('edge-layer').attributes.transform,'scale('+wideZoom+')');assert.equal(h.el('board').style['--map-zoom'],String(wideZoom));
 h.run('beginPan({button:0,pointerId:5,clientX:30,clientY:40,target:{closest(){return null;}}});resizeCamera();');assert.equal(h.run('cameraResizePending'),true);h.run('endPan({pointerId:5});');assert.equal(h.run('cameraResizePending'),false);
 h.run('zoomAt(100);');assert.equal(h.run('zoom'),3);h.run('zoomAt(.001);');assert.equal(h.run('zoom'),.08);
 // Drag screen distance is divided by the active scale; camera translation is irrelevant.
 h.run('zoom=2;camera={x:-500,y:350};const priorA=JSON.parse(JSON.stringify(position("a")));beginNodeDrag({button:0,pointerId:7,clientX:100,clientY:100,stopPropagation(){}} ,"a");moveNodeDrag({pointerId:7,clientX:-500,clientY:-500});endNodeDrag({pointerId:7});');
 const negative=h.plain('position("a")');assert.equal(negative.x,h.run('priorA.x-300'));assert.equal(negative.y,h.run('priorA.y-300'));assert.ok(negative.x<0&&negative.y<0);
 h.run('centerGraph();');assert.deepEqual(h.plain('position("a")'),negative);assert.equal(h.run('workspaceDirty()'),true);
 assert.equal(await h.run('saveHistory()'),true);const archive=H.parse(h.file.content),model=H.materialize(archive);assert.deepEqual(model.graph.trees.main.detailViews.high.positions.a,negative);
 const savedZoom=h.run('zoom');h.run('historyVersion(-1);historyVersion(1);');assert.equal(h.run('zoom'),savedZoom);assert.deepEqual(h.plain('position("a")'),negative);
 h.run('importHistoryText(History.stringify(historyBook));');assert.equal(h.run('zoom'),savedZoom);
 console.log(JSON.stringify({testKind:'Minimal-DOM camera mathematics and history, not browser gestures',pointerAnchoredZoom:true,unboundedCameraPan:true,pointerCancellation:true,centerTranslatesWithoutZoom:true,selectionAndResizePreserveZoom:true,nativeVectorAndFontSizing:true,deferResizeDuringDrag:true,cameraIsNotContentEdit:true,scaledDragAndSignedCoordinates:true,centerPreservesLayout:true,signedCoordinatesArchiveRoundTrip:true}));
})().catch(error=>{console.error(error);process.exitCode=1;});
