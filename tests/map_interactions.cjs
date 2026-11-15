const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'examples/feedback-map/index.html'), 'utf8');
const bootstrap = JSON.parse(html.match(/<script id="bootstrap" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const code = [...html.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)].at(-1)[1];

function harness(store = new Map()) {
  const elements = new Map(), listeners = new Map();
  function el(id) {
    if (!elements.has(id)) elements.set(id, { id, value:'', textContent:'', innerHTML:'', style:{}, dataset:{},
      scrollLeft:0,scrollTop:0,clientWidth:1200,clientHeight:760,disabled:false,
      classList:{add(){},remove(){},toggle(){}},setAttribute(){},addEventListener(){},
      focus(){},scrollIntoView(){},scrollBy(){},captures:0,setPointerCapture(){this.captures++;},releasePointerCapture(){},
      getBoundingClientRect(){return {left:0,top:0,width:1200,height:760};} });
    return elements.get(id);
  }
  el('bootstrap').textContent=JSON.stringify(bootstrap);
  const sandbox={document:{getElementById:el,documentElement:{lang:'en'},querySelectorAll:()=>[],querySelector:()=>null,addEventListener(){}},
    localStorage:{getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value),removeItem:key=>store.delete(key)},
    location:{protocol:'file:'},crypto:require('node:crypto'),CSS:{escape:value=>value},
    setTimeout(){return 0;},clearTimeout(){},setInterval(){},requestAnimationFrame:fn=>fn(),
    ResizeObserver:class{observe(){}},matchMedia:()=>({matches:true}),
    addEventListener:(name,fn)=>listeners.set(name,fn)};
  sandbox.window=sandbox;vm.createContext(sandbox);vm.runInContext(code,sandbox,{timeout:5000});
  return {run:text=>vm.runInContext(text,sandbox,{timeout:5000}),el,sandbox,store,listeners};
}
function plain(h,expression){return JSON.parse(h.run('JSON.stringify('+expression+')'));}
function drag(h,dx,dy,id='r',cancel=false){
  h.run(`zoom=1; manualZoom=true; beginNodeDrag({button:0,pointerId:7,clientX:100,clientY:100,stopPropagation(){}},${JSON.stringify(id)});`);
  h.run(`moveNodeDrag({pointerId:7,clientX:${100+dx},clientY:${100+dy}});`);
  h.run(`endNodeDrag({pointerId:7},${cancel});`);
}
let h=harness();
h.run('beginNodeDrag({button:0,pointerId:1,clientX:10,clientY:10,stopPropagation(){}},"r"); endNodeDrag({pointerId:1});');
assert.equal(h.el('map').captures,0);
const baseline=plain(h,'position("r")');
const canonical=plain(h,'state.graph.trees.find(t=>t.id==="main").positions.r');
const oldRoute=h.run('route(edge("r-response")).d');
assert.equal(h.run('profile(node("r")).shape'),'circle');
assert.equal(h.run('profile(node("q")).shape'),'hexagon');
assert.equal(h.run('Math.round(outline("r",center("response")).x-center("r").x)'),54);
drag(h,120,180);
assert.equal(h.el('map').captures,1);
assert.deepEqual(plain(h,'position("r")'),{x:baseline.x+120,y:baseline.y+180});
assert.deepEqual(plain(h,'state.graph.trees.find(t=>t.id==="main").positions.r'),canonical);
assert.equal(h.run('layoutDirty()'),true);
assert.notEqual(h.run('route(edge("r-response")).d'),oldRoute);
assert.deepEqual(h.run('route(edge("r-response")).d.match(/[A-Za-z]/g)').join(','),'M,C');
assert.equal(h.run('saveLayout()'),true);
assert.equal(h.run('layoutDirty()'),false);
const store=h.store;
h=harness(store);
assert.deepEqual(plain(h,'position("r")'),{x:baseline.x+120,y:baseline.y+180});
const saved=plain(h,'position("r")');
drag(h,45,40,'r',true);
assert.deepEqual(plain(h,'position("r")'),saved);
assert.equal(h.run('layoutDirty()'),false);
const m=plain(h,'position("m")');
drag(h,m.x-saved.x,m.y-saved.y);
assert.deepEqual(plain(h,'position("r")'),saved);
assert.equal(h.run('layoutDirty()'),false);
h.run('setEdgeMode("straight")');
assert.deepEqual(h.run('route(edge("r-response")).d.match(/[A-Za-z]/g)').join(','),'M,L');
h.run('saveLayout(); changeTree("feedback","r")');
assert.deepEqual(plain(h,'position("r")'),{x:170,y:260});
drag(h,0,140);
h.run('saveLayout(); defaultLayout()');
assert.deepEqual(plain(h,'position("r")'),{x:170,y:260});
h.run('changeTree("main","r")');
assert.deepEqual(plain(h,'position("r")'),saved);
assert.equal(h.run('edgeMode'),'straight');
// Self-relations must remain visible in either line mode.
h.run('const loopRoute=dynamicRoute({id:"self-test",from:"r",to:"r",relationType:"note",label:"note",status:"user"},[]);');
assert.equal(h.run('loopRoute.d.match(/[A-Za-z]/g).join(",")'),'M,C');
assert.ok(h.run('Math.abs(loopRoute.points[0].x-loopRoute.points.at(-1).x)>10'));
const next=JSON.parse(JSON.stringify(bootstrap));next.revision+=1;next.graph.nodes.find(n=>n.id==='r').detail+=' Updated source-backed detail.';
h.sandbox.next=next;
assert.equal(h.run('window.updatePaperMap(next)'),true);
assert.deepEqual(plain(h,'position("r")'),saved);
assert.deepEqual(plain(h,'state.graph.trees.find(t=>t.id==="main").positions.r'),canonical);
drag(h,20,30);
const goodSetter=h.sandbox.localStorage.setItem;
h.sandbox.localStorage.setItem=()=>{throw Error('unavailable');};
assert.equal(h.run('saveLayout()'),false);
assert.equal(h.run('layoutDirty()'),true);
h.sandbox.localStorage.setItem=goodSetter;
assert.ok(h.listeners.has('pointermove')&&h.listeners.has('pointerup')&&h.listeners.has('pointercancel'));
assert.ok(h.listeners.has('beforeunload')&&h.listeners.has('storage'));
const result={testKind:'Minimal-DOM JavaScript runtime, not browser rendering',
  shapeAwareEndpoints:true,dragLiveRerouting:true,canonicalFactsUnchanged:true,
  explicitSaveAndReload:true,escapeCancellation:true,collisionRollback:true,
  curveOrStraightOnly:true,viewScopedDefault:true,sharedViewLayoutsIndependent:true,
  sourceUpdatesPreserveSavedPositions:true,storageFailureStaysUnsaved:true};
process.stdout.write(JSON.stringify(result,null,2)+'\n');
