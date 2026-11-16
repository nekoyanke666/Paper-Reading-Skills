/* View-only camera: screen = world * zoom + camera. No scientific coordinates change. */
let camera={x:0,y:0},cameraResizePending=false;
const CAMERA_MIN=.08,CAMERA_MAX=3;
function screenToWorld(x,y){return {x:(x-camera.x)/zoom,y:(y-camera.y)/zoom};}
function renderCamera(){
 $('board').style.transform=`translate(${camera.x}px,${camera.y}px) scale(${zoom})`;
 const grid=20*zoom*Math.pow(2,Math.max(0,Math.ceil(Math.log2(12/(20*zoom)))));
 $('map').style.backgroundSize=`${grid}px ${grid}px`;
 $('map').style.backgroundPosition=`${camera.x}px ${camera.y}px`;
 $('zoom-value').textContent=Math.round(zoom*100)+'%';
 $('zoom-out').disabled=zoom<=CAMERA_MIN;$('zoom-in').disabled=zoom>=CAMERA_MAX;
}
function zoomAt(next,x=$('map').clientWidth/2,y=$('map').clientHeight/2){
 if(nodeDrag||pan)return;
 const anchor=screenToWorld(x,y);zoom=Math.max(CAMERA_MIN,Math.min(CAMERA_MAX,next));
 camera={x:x-anchor.x*zoom,y:y-anchor.y*zoom};manualZoom=true;renderCamera();
}
function centerGraph(){if(nodeDrag||pan)return;manualZoom=false;fit();}
function resizeCamera(){
 if(nodeDrag||pan){cameraResizePending=true;return;}
 cameraResizePending=false;manualZoom=false;fit();
 if(selected?.kind==='node')centerNode(selected.id);
}
function beginPan(e){
 if(nodeDrag||pan||e.button!==0||e.target.closest('button,input,select,textarea,[data-edge],.layout-panel'))return;
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
