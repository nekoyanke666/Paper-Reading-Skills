const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const H=require('../interfaces/paper-map/assets/history-core.js'),S=require('../interfaces/paper-map/assets/map-server.cjs');
const assets=path.resolve(__dirname,'../interfaces/paper-map/assets'),fixture=path.resolve(__dirname,'../examples/direction-map');
(async()=>{
 const taskRoot=fs.mkdtempSync(path.join(os.tmpdir(),'paper-map-service-test-')),servers=[],children=[];
 const prepare=name=>{const root=path.join(taskRoot,name);fs.mkdirSync(path.join(root,'.paper-map'),{recursive:true});for(const f of ['index.html','paper-state.json'])fs.copyFileSync(path.join(fixture,f),path.join(root,f));for(const f of ['map-server.cjs','history-core.js','detail-core.js'])fs.copyFileSync(path.join(assets,f),path.join(root,'.paper-map',f));return root;};
 const start=async root=>{const s=S.createService(root),info=await s.ready;servers.push(s.server);return info;};
 const mount=async info=>{const response=await fetch(info.url),html=await response.text();assert.equal(response.status,200);return JSON.parse(html.match(/<script id="managed-store" type="application\/json">([\s\S]*?)<\/script>/)[1]);};
 const post=async(info,endpoint,body,etag='empty',extra={})=>{const response=await fetch(new URL(endpoint,info.url),{method:'POST',headers:{Origin:new URL(info.url).origin,'Content-Type':'application/json','X-Paper-Map-Token':info.token,'X-Paper-Map-Version':etag,...extra},body});return {status:response.status,body:await response.json()};};
 try{
  const root=prepare('workspace-a'),info=await start(root),initialHtml=fs.readFileSync(path.join(root,'index.html'),'utf8');let m=await mount(info);assert.equal(m.archive,null);
  const snapshot=JSON.parse(fs.readFileSync(path.join(root,'paper-state.json'),'utf8')),base=H.pack(snapshot),model=H.copy(base);model.graph.trees.main.positions.r.x+=40;let book=H.commit(H.create(base),model);const text=H.stringify(book);
  let saved=await post(info,'/api/save',text);assert.equal(saved.status,200);const firstPath=saved.body.path,firstEtag=saved.body.etag;assert.ok(firstPath.startsWith('history/'));assert.deepEqual(H.materialize(H.parse(fs.readFileSync(path.join(root,firstPath),'utf8'))),model);assert.equal(fs.readFileSync(path.join(root,'index.html'),'utf8'),initialHtml);
  m=await mount(info);assert.equal(m.etag,firstEtag);assert.deepEqual(H.materialize(m.archive),model);
  model.graph.trees.main.positions.r.y+=30;book=H.commit(book,model);saved=await post(info,'/api/save',H.stringify(book),m.etag);assert.equal(saved.status,200);assert.equal(saved.body.path,firstPath);const lastBytes=fs.readFileSync(path.join(root,firstPath),'utf8');
  assert.equal((await post(info,'/api/save',text,firstEtag)).status,409);assert.equal(fs.readFileSync(path.join(root,firstPath),'utf8'),lastBytes);
  assert.equal((await post(info,'/api/save',text,saved.body.etag,{Origin:'https://unrelated.invalid'})).status,403);assert.equal((await post(info,'/api/save',text,saved.body.etag,{'X-Paper-Map-Token':'wrong'})).status,403);
  const bad=JSON.parse(text);bad.checksum='0'.repeat(64);assert.notEqual((await post(info,'/api/save',JSON.stringify(bad),saved.body.etag)).status,200);assert.equal((await fetch(new URL('/history/current.json',info.url))).status,404);
  const foreign=H.copy(base);foreign.paper.id='../../other-paper';foreign.paper.title='Another paper';const foreignBook=H.create(foreign);let imported=await post(info,'/api/save',H.stringify(foreignBook),saved.body.etag,{'X-Paper-Map-New-Record':'1'});assert.equal(imported.status,200);assert.notEqual(imported.body.path,firstPath);assert.equal(fs.readFileSync(path.join(root,firstPath),'utf8'),lastBytes);assert.equal(path.dirname(path.resolve(root,imported.body.path)),path.join(root,'history'));
  const recovered=await post(info,'/api/recover',text);assert.equal(recovered.status,200);H.parse(fs.readFileSync(path.join(root,recovered.body.path),'utf8'));assert.equal((await mount(info)).etag,imported.body.etag);
  const second=prepare('workspace-b'),secondInfo=await start(second);assert.equal((await mount(secondInfo)).archive,null);
  const moved=path.join(taskRoot,'relocated-workspace');fs.cpSync(root,moved,{recursive:true});const movedInfo=await start(moved);assert.equal(H.materialize((await mount(movedInfo)).archive).paper.id,'../../other-paper');assert.ok(!fs.readFileSync(path.join(moved,'history/current.json'),'utf8').includes(taskRoot));
  const launched=prepare('launcher');const runtime=require(path.join(launched,'.paper-map/map-server.cjs'));
  const [one,two]=await Promise.all([runtime.ensureStarted(launched),runtime.ensureStarted(launched)]);assert.equal(one.url,two.url);children.push(one);assert.equal((await mount(one)).archive,null);
  const another=await runtime.ensureStarted(launched);assert.equal(another.url,one.url);
  assert.equal((await post(one,'/api/save',text)).status,200);
  const copiedActive=path.join(taskRoot,'copy-of-active-workspace');fs.cpSync(launched,copiedActive,{recursive:true});
  const copiedRuntime=require(path.join(copiedActive,'.paper-map/map-server.cjs')),copiedInfo=await copiedRuntime.ensureStarted(copiedActive);children.push(copiedInfo);assert.notEqual(copiedInfo.url,one.url);assert.deepEqual(H.materialize((await mount(copiedInfo)).archive),H.materialize(H.parse(text)));
  console.log(JSON.stringify({testKind:'Real loopback HTTP and filesystem integration',saveWritesBesideCurrentHtml:true,reloadReadsActualFile:true,atomicUpdatesAndVersionConflict:true,unauthorizedRequestsBlocked:true,invalidArchivesRejected:true,importRetainsFormerRecord:true,recoveryDoesNotReplaceActiveRecord:true,independentWorkspaceRoots:true,relocationPreservesHistory:true,concurrentLaunchReusesOneService:true,archiveFormatVersion:1}));
 }finally{
  for(const info of children)try{await post(info,'/api/stop','');}catch(_){}
  await Promise.all(servers.map(server=>new Promise(resolve=>{server.close(resolve);server.closeIdleConnections?.();})));
  const resolved=path.resolve(taskRoot),temp=path.resolve(os.tmpdir());assert.ok(resolved.startsWith(temp+path.sep)&&path.basename(resolved).startsWith('paper-map-service-test-'));fs.rmSync(resolved,{recursive:true,force:true});
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
