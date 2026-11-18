/* View-only camera: screen = world * zoom + camera. No scientific coordinates change. */
let camera={x:0,y:0},cameraResizePending=false,focusReturn=null,cameraAction=0;
const CAMERA_MIN=.08,CAMERA_MAX=3;
function rememberFocusView(){
 if(!focusReturn)focusReturn={paperId:state.paper.id,activeTree,detailMode,camera:{...camera},zoom,manualZoom};
}
function resetFocusView(){focusReturn=null;cameraAction++;}
function restoreFocusView(){
 const saved=focusReturn;resetFocusView();
 if(!saved||saved.paperId!==state.paper.id||!state.graph.trees.some(t=>t.id===saved.activeTree))return false;
 activeTree=saved.activeTree;detailMode=saved.detailMode;detailCacheKey='';routeCacheKey='';
 camera={...saved.camera};zoom=saved.zoom;manualZoom=saved.manualZoom;return true;
}
function cameraAfterLayout(action){
 const current=++cameraAction;requestAnimationFrame(()=>{if(current===cameraAction)action();});
}
function screenToWorld(x,y){return {x:(x-camera.x)/zoom,y:(y-camera.y)/zoom};}
function renderCamera(){
 const dpr=typeof devicePixelRatio==='number'&&devicePixelRatio>0?devicePixelRatio:1,snap=n=>Math.round(n*dpr)/dpr;
 $('board').style.transform=`translate(${snap(camera.x)}px,${snap(camera.y)}px)`;
 $('board').style.setProperty('--map-zoom',String(zoom));
 // SVG transforms redraw vector paths; HTML labels are laid out at their actual zoomed size.
 $('edge-layer').setAttribute('transform',`scale(${zoom})`);
 document.querySelectorAll('[data-card]').forEach(card=>{
  const id=card.dataset.card,p=position(id);if(!p)return;
  card.style.left=snap(p.x*zoom)+'px';card.style.top=snap(p.y*zoom)+'px';
  card.dataset.worldX=String(p.x);card.dataset.worldY=String(p.y);
  const label=card.querySelector('.node-main>span');if(label)label.style.maxWidth=profile(node(id)).labelWidth*zoom+'px';
 });
 const grid=20*zoom*Math.pow(2,Math.max(0,Math.ceil(Math.log2(12/(20*zoom)))));
 $('map').style.backgroundSize=`${grid}px ${grid}px`;
 $('map').style.backgroundPosition=`${camera.x}px ${camera.y}px`;
 $('zoom-value').textContent=Math.round(zoom*100)+'%';
 $('zoom-out').disabled=zoom<=CAMERA_MIN;$('zoom-in').disabled=zoom>=CAMERA_MAX;
}
function zoomAt(next,x=$('map').clientWidth/2,y=$('map').clientHeight/2){
 if(nodeDrag||pan)return;
 cameraAction++;
 const anchor=screenToWorld(x,y);zoom=Math.max(CAMERA_MIN,Math.min(CAMERA_MAX,next));
 camera={x:x-anchor.x*zoom,y:y-anchor.y*zoom};manualZoom=true;renderCamera();
}
function centerGraph(){if(nodeDrag||pan)return;cameraAction++;manualZoom=false;centerView();}
function resizeCamera(){
 if(nodeDrag||pan){cameraResizePending=true;return;}
 cameraResizePending=false;
 if(selected?.kind==='node')centerNode(selected.id);else renderCamera();
}
function beginPan(e){
 if(nodeDrag||pan||e.button!==0||e.target.closest('button,input,select,textarea,[data-edge],.layout-panel'))return;
 cameraAction++;
 pan={pointerId:e.pointerId,x:e.clientX,y:e.clientY,start:{...camera},moved:false};
 $('map').setPointerCapture?.(e.pointerId);$('map').classList.add('dragging');
}
function movePan(e){
 if(!pan||e.pointerId!==pan.pointerId)return;
 const dx=e.clientX-pan.x,dy=e.clientY-pan.y;
 if(!pan.moved&&Math.hypot(dx,dy)<4)return;
 pan.moved=true;manualZoom=true;camera={x:pan.start.x+dx,y:pan.start.y+dy};renderCamera();
}
function endPan(e,cancel=false){
 if(!pan||e.pointerId!==pan.pointerId)return;
 const previous=pan;pan=null;$('map').releasePointerCapture?.(e.pointerId);$('map').classList.remove('dragging');
 if(cancel){camera=previous.start;renderCamera();}else if(!previous.moved&&selected)close();
 if(cameraResizePending)resizeCamera();
}
