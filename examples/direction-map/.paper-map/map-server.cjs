/* Folder-scoped local storage. No packages, external hosting or arbitrary write paths. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),crypto=require('node:crypto'),{spawn}=require('node:child_process');
const H=require('./history-core.js');
const PROTOCOL='paper-map-local-v1',sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const RECORD=/^[a-z0-9][a-z0-9._-]{0,150}\.paper-map-history\.json$/;
function error(message,status=400){return Object.assign(Error(message),{status});}
function safeDir(root,name){const dir=path.join(root,name);if(fs.existsSync(dir)&&fs.lstatSync(dir).isSymbolicLink())throw error('Linked storage folders are not supported');fs.mkdirSync(dir,{recursive:true});if(!fs.realpathSync(dir).startsWith(root+path.sep))throw error('Storage escaped this map folder');return dir;}
function safeFile(dir,name){const file=path.join(dir,name);if(path.dirname(file)!==dir||fs.existsSync(file)&&(!fs.lstatSync(file).isFile()||fs.lstatSync(file).isSymbolicLink()))throw error('Invalid storage file');return file;}
function atomic(file,text){const tmp=file+'.'+crypto.randomUUID()+'.tmp';let fd;try{fd=fs.openSync(tmp,'wx');fs.writeFileSync(fd,text,'utf8');fs.fsyncSync(fd);fs.closeSync(fd);fd=undefined;fs.renameSync(tmp,file);}finally{if(fd!==undefined)fs.closeSync(fd);if(fs.existsSync(tmp))fs.unlinkSync(tmp);}}
function parseArchive(text){if(Buffer.byteLength(text)>H.MAX_BYTES)throw error('History exceeds the supported size',413);try{return H.parse(text);}catch(e){throw error(e.message,400);}}
function current(root){
 const dir=safeDir(root,'history'),pointer=safeFile(dir,'current.json');if(!fs.existsSync(pointer))return {etag:'empty',archive:null,file:null};
 if(fs.statSync(pointer).size>4096)throw error('Invalid managed-history pointer',503);
 const meta=JSON.parse(fs.readFileSync(pointer,'utf8'));if(meta.format!==PROTOCOL||meta.version!==1||!RECORD.test(meta.active))throw error('Invalid managed-history pointer',503);
 const file=safeFile(dir,meta.active);if(fs.statSync(file).size>H.MAX_BYTES)throw error('Managed history exceeds the supported size',503);const text=fs.readFileSync(file,'utf8'),archive=parseArchive(text);
 return {etag:sha(meta.active+'\0'+sha(text)),archive,file:meta.active};
}
function recordName(book){const model=H.materialize(book),slug=model.paper.id.toLowerCase().replace(/[^a-z0-9._-]+/g,'-').replace(/^[^a-z0-9]+/,'').slice(0,55)||'paper';return slug+'-'+crypto.randomUUID().slice(0,12)+'.paper-map-history.json';}
function writeRecord(root,text,expected,newRecord=false,recovery=false){
 const book=parseArchive(text),before=current(root);if(!recovery&&before.etag!==expected)throw error('Another page saved a newer record. Back up your edits, then reload.',409);
 if(before.archive&&before.archive.baseHash!==book.baseHash)newRecord=true;
 const dir=safeDir(root,'history'),name=recovery?'recovery-'+sha(text).slice(0,28)+'.paper-map-history.json':!newRecord&&before.file?before.file:recordName(book),file=safeFile(dir,name);
 if(!fs.existsSync(file)||fs.readFileSync(file,'utf8')!==text)atomic(file,text);
 if(!recovery&&name!==before.file)atomic(safeFile(dir,'current.json'),JSON.stringify({format:PROTOCOL,version:1,active:name}));
 if(recovery)return {path:'history/'+name};
 return {etag:sha(name+'\0'+sha(text)),path:'history/'+name};
}
async function readBody(req){const chunks=[];let bytes=0;for await(const chunk of req){bytes+=chunk.length;if(bytes>H.MAX_BYTES)throw error('History exceeds the supported size',413);chunks.push(chunk);}try{return new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat(chunks));}catch(_){throw error('History must be UTF-8');}}
function createService(folder,{port=0,recordRuntime=false}={}){
 const root=fs.realpathSync(path.resolve(folder));if(!fs.statSync(path.join(root,'index.html')).isFile())throw error('A generated map folder is required');
 const rootId=sha(root.toLowerCase()),token=crypto.randomBytes(32).toString('hex');let origin;
 const server=http.createServer(async(req,res)=>{
  const send=(status,value,type='application/json')=>{res.writeHead(status,{'Content-Type':type+'; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY'});res.end(type==='application/json'?JSON.stringify(value):value);};
  try{
   if(req.headers.host!==new URL(origin).host)throw error('Invalid local host',403);
   const url=new URL(req.url,origin);if(req.method==='GET'&&url.pathname==='/api/ping')return send(200,{protocol:PROTOCOL,rootId});
   if(req.method==='POST'){
    if(req.headers.origin!==origin||req.headers['x-paper-map-token']!==token||req.headers['sec-fetch-site']==='cross-site')throw error('This operation is restricted to the local map page',403);
    if(!['/api/save','/api/recover','/api/stop'].includes(url.pathname))throw error('Unknown operation',404);
    if(url.pathname==='/api/stop'){send(200,{stopped:true});server.close();return;}
    if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))throw error('JSON history is required',415);
    const text=await readBody(req),saved=writeRecord(root,text,req.headers['x-paper-map-version'],req.headers['x-paper-map-new-record']==='1',url.pathname==='/api/recover');return send(200,{protocol:PROTOCOL,...saved});
   }
   if(req.method!=='GET')throw error('Method not supported',405);
   if(url.pathname==='/'||url.pathname==='/index.html'){
    const stored=current(root),mount={protocol:PROTOCOL,rootId,token,etag:stored.etag,path:stored.file?'history/'+stored.file:null,archive:stored.archive};
    const slot='<script id="managed-store" type="application/json">'+JSON.stringify(mount).replace(/</g,'\\u003c')+'</script>\n';
    const html=fs.readFileSync(path.join(root,'index.html'),'utf8');return send(200,html.replace('<script id="bootstrap"',slot+'<script id="bootstrap"'),'text/html');
   }
   const names={'/paper-state.json':'paper-state.json','/artifact-manifest.json':'artifact-manifest.json','/quality-report.json':'quality-report.json'};
   if(!names[url.pathname])throw error('Not found',404);return send(200,fs.readFileSync(path.join(root,names[url.pathname]),'utf8'),'text/plain');
  }catch(e){if(!res.headersSent)send(e.status||503,{error:e.message});else res.end();}
 });
 server.requestTimeout=30000;server.headersTimeout=10000;
 const ready=new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',()=>{origin='http://127.0.0.1:'+server.address().port;const info={protocol:PROTOCOL,rootId,url:origin+'/',pid:process.pid,token};if(recordRuntime)atomic(safeFile(safeDir(root,'.paper-map'),'service.json'),JSON.stringify(info));resolve(info);});});
 return {server,ready,root};
}
function request(url,{method='GET',headers={},body}={}){return new Promise((resolve,reject)=>{const req=http.request(url,{method,headers,timeout:1500},res=>{let text='';res.on('data',c=>text+=c);res.on('end',()=>{try{const value=JSON.parse(text);if(res.statusCode!==200)throw error(value.error||'Local service error',res.statusCode);resolve(value);}catch(e){reject(e);}});});req.on('timeout',()=>req.destroy(Error('Local service timeout')));req.on('error',reject);req.end(body);});}
async function running(root){try{const p=safeFile(safeDir(root,'.paper-map'),'service.json'),r=JSON.parse(fs.readFileSync(p,'utf8')),u=new URL(r.url);if(u.protocol!=='http:'||u.hostname!=='127.0.0.1'||!u.port||r.rootId!==sha(root.toLowerCase()))return null;const ping=await request(new URL('/api/ping',u));return ping.protocol===PROTOCOL&&ping.rootId===r.rootId?r:null;}catch(_){return null;}}
async function ensureStarted(folder){const root=fs.realpathSync(path.resolve(folder));let info=await running(root);if(info)return info;const child=spawn(process.execPath,[__filename,'--root',root,'--serve'],{detached:true,stdio:'ignore',windowsHide:true});child.unref();for(let i=0;i<60;i++){await new Promise(r=>setTimeout(r,100));info=await running(root);if(info)return info;}throw Error('The local map service did not start. Check Node and folder write access.');}
async function cli(){
 const args=process.argv.slice(2),i=args.indexOf('--root'),root=fs.realpathSync(i>=0?args[i+1]:path.resolve(__dirname,'..'));
 if(args.includes('--serve')){
  const dir=safeDir(root,'.paper-map'),lock=safeFile(dir,'service.lock'),rootId=sha(root.toLowerCase()),lockText=JSON.stringify({pid:process.pid,rootId});let fd;
  try{fd=fs.openSync(lock,'wx');}catch(e){
   if(e.code!=='EEXIST')throw e;let old;try{old=JSON.parse(fs.readFileSync(lock,'utf8'));}catch(_){if(Date.now()-fs.statSync(lock).mtimeMs<2000)return;}
   let live=false;if(old?.rootId===rootId&&Number.isInteger(old.pid)&&old.pid>0)try{process.kill(old.pid,0);live=true;}catch(_){}
   if(live)return;fs.unlinkSync(lock);fd=fs.openSync(lock,'wx');
  }
  const portArg=args.indexOf('--port'),port=portArg<0?0:Number(args[portArg+1]);if(!Number.isInteger(port)||port<0||port>65535)throw Error('Invalid port');
  fs.writeFileSync(fd,lockText);fs.closeSync(fd);const service=createService(root,{recordRuntime:true,port});
  const clean=()=>{try{if(fs.readFileSync(lock,'utf8')===lockText)fs.unlinkSync(lock);}catch(_){}};service.server.on('close',()=>{clean();process.exit(0);});process.on('exit',clean);process.on('SIGTERM',()=>service.server.close());process.on('SIGINT',()=>service.server.close());const info=await service.ready;console.log(JSON.stringify({url:info.url,pid:info.pid,historyDir:path.join(root,'history')}));return;
 }
 if(args.includes('--stop')){const info=await running(root);if(info)await request(new URL('/api/stop',info.url),{method:'POST',headers:{Origin:new URL(info.url).origin,'X-Paper-Map-Token':info.token}});console.log(JSON.stringify({stopped:!!info}));return;}
 const info=await ensureStarted(root);
 if(args.includes('--open')){const url=info.url,command=process.platform==='win32'?'rundll32':process.platform==='darwin'?'open':'xdg-open',argv=process.platform==='win32'?['url.dll,FileProtocolHandler',url]:[url];spawn(command,argv,{detached:true,stdio:'ignore',windowsHide:true}).unref();}
 console.log(JSON.stringify({url:info.url,pid:info.pid,historyDir:path.join(root,'history')}));
}
module.exports={PROTOCOL,createService,ensureStarted,current,writeRecord};
if(require.main===module)cli().catch(e=>{console.error(e.message);process.exitCode=1;});
