const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),HistoryLib=require('../interfaces/paper-map/assets/history-core.js');
function fileStore(){return {content:'',failWrite:false,failClose:false,aborted:false,pickerCount:0};}
function createHarness(options={}){
 const fixture=options.fixture||'feedback-map',html=fs.readFileSync(path.join(__dirname,'../examples',fixture,'index.html'),'utf8');
 const boot=options.boot||JSON.parse(html.match(/<script id="bootstrap" type="application\/json">([\s\S]*?)<\/script>/)[1]);
 const code=[...html.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)].at(-1)[1];
 const elements=new Map(),listeners=new Map(),documentListeners=new Map(),store=options.store||new Map(),file=options.file||fileStore(),backup=options.backup||fileStore(),downloads=[],blobs=new Map(),frames=[];
 function el(id){if(!elements.has(id))elements.set(id,{id,value:'',textContent:'',innerHTML:'',style:{setProperty(k,v){this[k]=v;}},dataset:{},disabled:false,scrollLeft:0,scrollTop:0,clientWidth:1200,clientHeight:760,captures:0,
  classList:{values:new Set(),add(...a){a.forEach(v=>this.values.add(v));},remove(...a){a.forEach(v=>this.values.delete(v));},toggle(k,b){if(b===undefined)b=!this.values.has(k);if(b)this.values.add(k);else this.values.delete(k);}},
  setAttribute(k,v){(this.attributes||={})[k]=String(v);},addEventListener(){},focus(){},scrollIntoView(){},scrollBy(){},click(){},setPointerCapture(){this.captures++;},releasePointerCapture(){},getBoundingClientRect(){return {left:0,top:0,width:1200,height:760};}});return elements.get(id);}
 el('bootstrap').textContent=JSON.stringify(boot);
 if(options.managed!==false)el('managed-store').textContent=JSON.stringify({protocol:'paper-map-local-v1',rootId:options.workspaceId||'test-workspace',token:'test-token',etag:file.content?HistoryLib.sha256(file.content):'empty',archive:file.content?HistoryLib.parse(file.content):null,path:file.content?'history/test.paper-map-history.json':null});
 const handle={name:'backup.paper-map-history.json',createWritable:async()=>{let pending='';return {write:async text=>{if(backup.failWrite)throw Error('write denied');pending=text;},close:async()=>{if(backup.failClose)throw Error('close denied');backup.content=pending;},abort:async()=>{backup.aborted=true;}};}};
 const sandbox={document:{getElementById:el,documentElement:{lang:'en'},querySelectorAll:()=>[],querySelector:()=>null,addEventListener(name,fn){if(!documentListeners.has(name))documentListeners.set(name,[]);documentListeners.get(name).push(fn);},body:{appendChild(){}},createElement:()=>({href:'',download:'',click(){downloads.push({filename:this.download,blob:blobs.get(this.href)});},remove(){}})},
  localStorage:{getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value),removeItem:key=>store.delete(key)},location:{protocol:options.managed===false?'file:':'http:'},crypto:require('node:crypto'),CSS:{escape:v=>v},Blob,
  fetch:async(url,args={})=>{
   const reply=(status,result)=>({ok:status===200,status,json:async()=>result});
   if(url==='/api/recover'){(file.recoveries||=[]).push(args.body);return reply(200,{path:'history/recovery-test.paper-map-history.json'});}
   if(url!=='/api/save')return reply(404,{});
   if(file.failWrite||file.failClose){file.aborted=true;return reply(503,{error:'Disk write failed'});}
   if(args.headers['X-Paper-Map-Version']!==(file.content?HistoryLib.sha256(file.content):'empty'))return reply(409,{error:'Changed by another page'});
   HistoryLib.parse(args.body);(file.records||=[]).push(file.content);file.content=args.body;file.managedWrites=(file.managedWrites||0)+1;
   return reply(200,{protocol:'paper-map-local-v1',etag:HistoryLib.sha256(file.content),path:'history/test.paper-map-history.json'});
  },
  URL:{createObjectURL:blob=>{const id='blob:'+blobs.size;blobs.set(id,blob);return id;},revokeObjectURL(){}},setTimeout(){return 0;},clearTimeout(){},setInterval(){},requestAnimationFrame:f=>options.deferFrames?frames.push(f):f(),ResizeObserver:class{observe(){}},matchMedia:()=>({matches:true}),addEventListener:(name,fn)=>listeners.set(name,fn)};
 if(options.fileAccess!==false)sandbox.showSaveFilePicker=async()=>{backup.pickerCount++;if(backup.cancelPicker)throw Object.assign(Error('cancel'),{name:'AbortError'});return handle;};
 sandbox.window=sandbox;vm.createContext(sandbox);vm.runInContext(code,sandbox,{timeout:10000});
 return {run:code=>vm.runInContext(code,sandbox,{timeout:10000}),plain:expr=>JSON.parse(vm.runInContext('JSON.stringify('+expr+')',sandbox)),flushFrames(){while(frames.length)frames.shift()();},sandbox,el,store,file,backup,handle,listeners,documentListeners,downloads,boot};
}
function drag(h,dx,dy,id='r',cancel=false){h.run(`zoom=1;manualZoom=true;beginNodeDrag({button:0,pointerId:7,clientX:100,clientY:100,stopPropagation(){}},${JSON.stringify(id)});moveNodeDrag({pointerId:7,clientX:${100+dx},clientY:${100+dy}});endNodeDrag({pointerId:7},${cancel});`);}
module.exports={createHarness,fileStore,drag};
