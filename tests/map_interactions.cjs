const assert=require('node:assert/strict'),{createHarness,drag}=require('./viewer_harness.cjs');
(async()=>{
 let h=createHarness();h.run('beginNodeDrag({button:0,pointerId:1,clientX:10,clientY:10,stopPropagation(){}},"r");endNodeDrag({pointerId:1});');assert.equal(h.el('map').captures,0);
 const baseline=h.plain('position("r")'),sourcePosition=h.plain('BOOT.graph.trees.find(t=>t.id==="main").positions.r'),oldRoute=h.run('route(edge("r-response")).d');
 assert.equal(h.run('profile(node("r")).shape'),'circle');assert.equal(h.run('profile(node("q")).shape'),'hexagon');assert.equal(h.run('Math.round(outline("r",center("response")).x-center("r").x)'),54);
 drag(h,120,180);assert.equal(h.el('map').captures,1);assert.deepEqual(h.plain('position("r")'),{x:baseline.x+120,y:baseline.y+180});assert.deepEqual(h.plain('BOOT.graph.trees.find(t=>t.id==="main").positions.r'),sourcePosition);assert.equal(h.run('layoutDirty()'),true);assert.notEqual(h.run('route(edge("r-response")).d'),oldRoute);assert.equal(h.run('route(edge("r-response")).d.match(/[A-Za-z]/g).join(",")'),'M,C');
 assert.equal(await h.run('saveLayout()'),true);const store=h.store,file=h.file;h=createHarness({store,file});const saved=h.plain('position("r")');assert.deepEqual(saved,{x:baseline.x+120,y:baseline.y+180});
 drag(h,45,40,'r',true);assert.deepEqual(h.plain('position("r")'),saved);assert.equal(h.run('layoutDirty()'),false);
 const m=h.plain('position("m")');drag(h,m.x-saved.x,m.y-saved.y);assert.deepEqual(h.plain('position("r")'),saved);assert.equal(h.run('layoutDirty()'),false);
 h.run('setEdgeMode("straight")');assert.equal(h.run('route(edge("r-response")).d.match(/[A-Za-z]/g).join(",")'),'M,L');await h.run('saveLayout()');h.run('changeTree("feedback","r")');assert.deepEqual(h.plain('position("r")'),{x:170,y:260});
 drag(h,0,140);await h.run('saveLayout()');assert.deepEqual(h.plain('position("r")'),{x:170,y:400});h.run('changeTree("main","r")');assert.deepEqual(h.plain('position("r")'),saved);
 h.run('const loopRoute=dynamicRoute({id:"self-test",from:"r",to:"r",relationType:"note",label:"note",status:"user"},[]);');assert.equal(h.run('loopRoute.d.match(/[A-Za-z]/g).join(",")'),'M,C');assert.ok(h.run('Math.abs(loopRoute.points[0].x-loopRoute.points.at(-1).x)>10'));
 drag(h,20,30);file.failWrite=true;assert.equal(await h.run('saveLayout()'),false);assert.equal(h.run('layoutDirty()'),true);assert.ok(h.listeners.has('pointermove')&&h.listeners.has('pointerup')&&h.listeners.has('pointercancel')&&h.listeners.has('beforeunload'));
 console.log(JSON.stringify({testKind:'Minimal-DOM runtime, not browser rendering',shapeAwareEndpoints:true,dragThresholdAndLiveRerouting:true,originalSnapshotUnchanged:true,fullFileSaveAndReload:true,escapeCancellation:true,collisionRollback:true,curveOrStraightOnly:true,sharedViewPositionsIndependent:true,writeFailureRetainsDraft:true}));
})().catch(error=>{console.error(error);process.exitCode=1;});
