const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function fileStore(){return {content:'',failWrite:false,failClose:false,aborted:false,pickerCount:0};}
function createHarness(options={}){
 const fixture=options.fixture||'feedback-map',html=fs.readFileSync(path.join(__dirname,'../examples',fixture,'index.html'),'utf8');
 const boot=options.boot||JSON.parse(html.match(/<script id="bootstrap" type="application\/json">([\s\S]*?)<\/script>/)[1]);
 const code=[...html.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)].at(-1)[1];
 const elements=new Map(),listeners=new Map(),store=options.store||new Map(),file=options.file||fileStore(),downloads=[],blobs=new Map();
 function el(id){if(!elements.has(id))elements.set(id,{id,value:'',textContent:'',innerHTML:'',style:{},dataset:{},disabled:false,scrollLeft:0,scrollTop:0,clientWidth:1200,clientHeight:760,captures:0,
  classList:{values:new Set(),add(...a){a.forEach(v=>this.values.add(v));},remove(...a){a.forEach(v=>this.values.delete(v));},toggle(k,b){if(b===undefined)b=!this.values.has(k);if(b)this.values.add(k);else this.values.delete(k);}},
  setAttribute(){},addEventListener(){},focus(){},scrollIntoView(){},scrollBy(){},click(){},setPointerCapture(){this.captures++;},releasePointerCapture(){},getBoundingClientRect(){return {left:0,top:0,width:1200,height:760};}});return elements.get(id);}
 el('bootstrap').textContent=JSON.stringify(boot);
 const handle={name:'test.paper-map-history.json',getFile:async()=>({size:Buffer.byteLength(file.content),text:async()=>file.content}),createWritable:async()=>{let pending='';return {write:async text=>{if(file.failWrite)throw Error('write denied');pending=text;},close:async()=>{if(file.failClose)throw Error('close denied');file.content=pending;},abort:async()=>{file.aborted=true;}};}};
 const sandbox={document:{getElementById:el,documentElement:{lang:'en'},querySelectorAll:()=>[],querySelector:()=>null,addEventListener(){},body:{appendChild(){}},createElement:()=>({href:'',download:'',click(){downloads.push({filename:this.download,blob:blobs.get(this.href)});},remove(){}})},
  localStorage:{getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value),removeItem:key=>store.delete(key)},location:{protocol:'file:'},crypto:require('node:crypto'),CSS:{escape:v=>v},Blob,
  URL:{createObjectURL:blob=>{const id='blob:'+blobs.size;blobs.set(id,blob);return id;},revokeObjectURL(){}},setTimeout(){return 0;},clearTimeout(){},setInterval(){},requestAnimationFrame:f=>f(),ResizeObserver:class{observe(){}},matchMedia:()=>({matches:true}),addEventListener:(name,fn)=>listeners.set(name,fn)};
 if(options.fileAccess!==false)sandbox.showSaveFilePicker=async()=>{file.pickerCount++;if(file.cancelPicker)throw Object.assign(Error('cancel'),{name:'AbortError'});return handle;};
 sandbox.window=sandbox;vm.createContext(sandbox);vm.runInContext(code,sandbox,{timeout:10000});
 return {run:code=>vm.runInContext(code,sandbox,{timeout:10000}),plain:expr=>JSON.parse(vm.runInContext('JSON.stringify('+expr+')',sandbox)),sandbox,el,store,file,handle,listeners,downloads,boot};
}
function drag(h,dx,dy,id='r',cancel=false){h.run(`zoom=1;manualZoom=true;beginNodeDrag({button:0,pointerId:7,clientX:100,clientY:100,stopPropagation(){}},${JSON.stringify(id)});moveNodeDrag({pointerId:7,clientX:${100+dx},clientY:${100+dy}});endNodeDrag({pointerId:7},${cancel});`);}
module.exports={createHarness,fileStore,drag};
