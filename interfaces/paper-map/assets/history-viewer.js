/* File persistence and saved-version navigation for the fixed map viewer. */
const History=PaperMapHistory;
let historyBook=null,historyBusy=false,historyImported=false,historyExportStatus='initial',cacheTimer=null,managedStore=null,managedNewRecord=false;
let savedSourceFingerprint='';
let dirtyMemo=null,recoveryPending=false;
function sourceFingerprint(){return BOOT.artifact?.snapshotSha256||History.hash(History.pack(BOOT));}
function workspaceKey(){return managedStore?'paper-map-workspace-v2:'+managedStore.rootId+':'+BOOT.paper.id:'paper-map-workspace-v1:'+BOOT.paper.id;}
function currentModel(){return History.pack(state,customPositions,{edgeMode,detailMode:typeof detailMode==='undefined'?'high':detailMode,activeTree});}
function contentSignature(model){const m=History.copy(model);delete m.preferences;return History.stable(m);}
function workspaceDirty(){if(!historyBook)return false;if(nodeDrag?.started)return true;const key=JSON.stringify([localDraftRevision,customPositions,state.paper.id,state.revision]);if(dirtyMemo?.book===historyBook.checksum&&dirtyMemo.key===key)return dirtyMemo.value;const value=contentSignature(currentModel())!==contentSignature(History.materialize(historyBook));dirtyMemo={book:historyBook.checksum,key,value};return value;}
function cacheWorkspace(){
 if(!historyBook||recoveryPending)return;
 try{localStorage.setItem(workspaceKey(),JSON.stringify({format:2,sourceFingerprint:savedSourceFingerprint,history:historyBook,working:currentModel(),exportStatus:historyExportStatus,imported:historyImported,newRecord:managedNewRecord}));}
 catch(_){/* File saves remain authoritative when browser storage is unavailable. */}
}
function scheduleWorkspaceCache(){clearTimeout(cacheTimer);cacheTimer=setTimeout(cacheWorkspace,160);}
function useModel(model){
 resetFocusView();
 const next=History.unpack(model);validate(next);state=next;customPositions={};savedPositions={};edgeMode=savedEdgeMode=model.preferences.edgeMode;
 if(typeof detailMode!=='undefined')detailMode=model.preferences.detailMode;
 activeTree=model.preferences.activeTree;detailCacheKey='';canonicalRevision=next.revision;localDraftRevision=0;selected=null;query='';$('search').value='';manualZoom=false;routeCacheKey='';newIds.clear();changedIds.clear();$('app').classList.remove('open');
}
function sameTimeline(a,b){return History.hash({baseHash:a.baseHash,commits:a.commits})===History.hash({baseHash:b.baseHash,commits:b.commits});}
function compatibleCache(c){
 if(c.sourceFingerprint===savedSourceFingerprint)return true;
 const strip=m=>{m=History.copy(m);delete m.preferences;if(m.graph?.locale)delete m.graph.locale.ui;return m;};
 return History.stable(strip(c.history.base))===History.stable(strip(History.pack(BOOT)));
}
function readManagedMount(){
 try{const raw=document.getElementById('managed-store')?.textContent;if(!raw)return null;const m=JSON.parse(raw);if(m.protocol!=='paper-map-local-v1'||!/^https?:$/.test(location.protocol)||!m.rootId||!m.token||!m.etag)throw Error('Invalid managed storage');if(m.archive)History.verify(m.archive);return m;}catch(_){notice(ui('historyManagedUnavailable'));return null;}
}
async function preserveRecovery(c){
 let localKept=false;recoveryPending=true;
 try{
  const text=History.stringify(History.commit(c.history,c.working,undefined,'recovery'));
  try{localStorage.setItem(workspaceKey()+':recovery:'+History.sha256(text),JSON.stringify(c));localKept=true;}catch(_){}
  if(managedStore){const response=await fetch('/api/recover',{method:'POST',headers:{'Content-Type':'application/json','X-Paper-Map-Token':managedStore.token},body:text});const result=await response.json();if(!response.ok)throw Error(result.error);notice(ui('historyRecoveryKept',{path:result.path}));recoveryPending=false;}
  else if(localKept)recoveryPending=false;
 }catch(_){recoveryPending=!localKept;notice(ui('historyRecoveryFailed'));}
}
function initializeWorkspace(){
 savedSourceFingerprint=sourceFingerprint();historyBook=History.create(currentModel());managedStore=readManagedMount();let cached=null,restored=false;
 try{const c=JSON.parse(localStorage.getItem(workspaceKey())||'null');if([1,2].includes(c?.format)){History.verify(c.history);History.validateModel(c.working);cached=c;}}catch(_){notice(ui('historyCacheRejected'));}
 if(managedStore?.archive){
  historyBook=managedStore.archive;useModel(History.materialize(historyBook));historyExportStatus='managed';historyImported=true;sourceUnavailable=true;restored=true;
  if(cached&&compatibleCache(cached)&&(cached.newRecord||sameTimeline(cached.history,historyBook))){historyBook=cached.history;useModel(cached.working);managedNewRecord=!!cached.newRecord;}
  else if(cached&&(!sameTimeline(cached.history,historyBook)||History.stable(cached.working)!==History.stable(History.materialize(cached.history))))preserveRecovery(cached);
 }else if(cached&&compatibleCache(cached)){historyBook=cached.history;useModel(cached.working);historyImported=!!cached.imported;managedNewRecord=!!cached.newRecord;historyExportStatus='initial';restored=true;}
 else if(cached)preserveRecovery(cached);
 if(!restored&&!managedStore)try{const legacy=JSON.parse(localStorage.getItem(storageKey)||'null');if(legacy?.baseRevision===BOOT.revision&&legacy.draftRevision>0&&legacy.draftState?.paper?.id===BOOT.paper.id){const model=History.pack(legacySnapshot(legacy.draftState),customPositions,{edgeMode,detailMode,activeTree});useModel(model);localDraftRevision=legacy.draftRevision;notice(ui('historyLegacyRecovered'));}}catch(_){}
}
function historyVersion(delta){
 if(historyBusy)return false;if(workspaceDirty()){notice(ui('historySaveFirst'));return false;}
 const next=historyBook.cursor+delta;if(next<0||next>historyBook.commits.length)return false;
 const candidate=History.navigate(historyBook,next),model=History.materialize(candidate);History.validateModel(model);useModel(model);historyBook=candidate;layoutOpen=true;render();cameraAfterLayout(centerView);cacheWorkspace();return true;
}
function legacySnapshot(input){
 const s=History.copy(input);if(s.schemaVersion!==2||!s.graph||!Array.isArray(s.graph.nodes)||!Array.isArray(s.graph.trees))throw Error('Unsupported legacy map snapshot');
 s.sources||=[];s.glossary||=[];s.settings||=History.copy(BOOT.settings);
 s.graph.nodeShapes||=History.copy(BOOT.graph.nodeShapes);s.graph.locale||=History.copy(BOOT.graph.locale);s.graph.relationTypes||=History.copy(BOOT.graph.relationTypes);s.graph.redirects||={};s.graph.linkRedirects||={};
 for(const t of s.graph.trees){t.kind||='narrative';t.routes={};t.linkIds||=[];t.positions||={};}
 for(const n of s.graph.nodes){n.title||=n.label;n.visualRole||=s.graph.nodeShapes.typeRoles[n.type]||'concept';}
 for(const e of s.graph.links)e.label||=s.graph.relationTypes[e.relationType]?.label||e.relationType;
 return s;
}
function importHistoryText(text,handle=null){
 if(historyBusy)throw Error('An archive operation is active');if(workspaceDirty())throw Error(ui('historySaveFirst'));
 if(typeof text!=='string'||text.length>History.MAX_BYTES)throw Error('History file exceeds supported size');
 const raw=JSON.parse(text),book=raw.format===History.FORMAT?History.parse(text):History.create(History.pack(legacySnapshot(raw)));
 const model=History.materialize(book);validate(History.unpack(model));
 useModel(model);historyBook=book;historyImported=true;managedNewRecord=true;historyExportStatus='imported';sourceUnavailable=true;
 layoutOpen=true;render();cameraAfterLayout(centerView);cacheWorkspace();notice(ui('historyImported'));return true;
}
function selectHistoryFile(){if(historyBusy)return;if(workspaceDirty()){notice(ui('historySaveFirst'));return;}$('history-file').click();}
function downloadHistory(text){const blob=new Blob([text],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=archiveFilename();document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
function archiveFilename(){return state.paper.id.replace(/[^\w.-]+/g,'-')+'.paper-map-history.json';}
async function backupHistory(downloadOnly=false){
 if(historyBusy)return false;
 let picker;try{if(!downloadOnly&&typeof window.showSaveFilePicker==='function')picker=window.showSaveFilePicker({suggestedName:archiveFilename(),types:[{description:'Paper map backup',accept:{'application/json':['.json']}}]});}catch(error){notice(ui('historyBackupFailed')+' '+error.message);return false;}
 historyBusy=true;renderLayout();
 try{
  const handle=picker?await picker:null,text=History.stringify(History.commit(historyBook,currentModel(),undefined,'backup'));
  if(handle){const stream=await handle.createWritable();try{await stream.write(text);await stream.close();}catch(error){try{await stream.abort();}catch(_){}throw error;}notice(ui('historyBackupSaved'));}
  else{downloadHistory(text);notice(ui('historyDownloadRequested'));}
  return true;
 }catch(error){if(error.name!=='AbortError')notice(ui('historyBackupFailed')+' '+error.message);return false;}
 finally{historyBusy=false;renderLayout();}
}
async function saveHistory(copyFile=false,downloadOnly=false){
 if(copyFile||downloadOnly)return backupHistory(downloadOnly);
 if(historyBusy)return false;if(!managedStore){notice(ui('historyManagedUnavailable'));return false;}
 historyBusy=true;renderLayout();
 try{
  const candidate=History.commit(historyBook,currentModel()),text=History.stringify(candidate);
  const response=await fetch('/api/save',{method:'POST',headers:{'Content-Type':'application/json','X-Paper-Map-Token':managedStore.token,'X-Paper-Map-Version':managedStore.etag,'X-Paper-Map-New-Record':managedNewRecord?'1':'0'},body:text});
  const result=await response.json();if(!response.ok)throw Error(response.status===409?ui('historyManagedConflict'):result.error||ui('historySaveFailed'));
  if(result.protocol!=='paper-map-local-v1'||!result.etag||!result.path?.startsWith('history/'))throw Error('Invalid storage acknowledgement');
  managedStore.etag=result.etag;managedStore.path=result.path;managedStore.archive=candidate;managedNewRecord=false;
  historyBook=candidate;localDraftRevision=0;historyExportStatus='managed';sourceUnavailable=true;cacheWorkspace();layoutOpen=true;notice(ui('historyManagedSaved',{path:result.path}));return true;
 }catch(error){notice(ui('historySaveFailed')+' '+error.message);return false;}
 finally{historyBusy=false;renderLayout();}
}
function renderHistoryControls(){
 if(!historyBook)return;
 $('save-layout').textContent=ui('historySave');$('save-layout').disabled=historyBusy;
 $('previous-save').textContent=ui('historyPrevious');$('next-save').textContent=ui('historyNext');
 $('previous-save').disabled=historyBusy||workspaceDirty()||historyBook.cursor===0;$('next-save').disabled=historyBusy||workspaceDirty()||historyBook.cursor===historyBook.commits.length;
 $('import-history').textContent=ui('historyImport');$('import-history').disabled=historyBusy;
 $('save-copy').textContent=ui('historyBackup');
 $('save-copy').disabled=historyBusy;
 const version=ui('historyVersion',{current:historyBook.cursor+1,total:historyBook.commits.length+1});
 $('layout-state').textContent=version+' · '+ui(workspaceDirty()?'historyUnsaved':historyExportStatus==='managed'?'historyManagedState':managedStore?'historyReady':'historyManagedOffline');
}
