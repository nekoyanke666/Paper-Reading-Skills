/* File persistence and saved-version navigation for the fixed map viewer. */
const History=PaperMapHistory;
let historyBook=null,historyFile=null,diskChecksum=null,historyBusy=false,historyImported=false,historyExportStatus='initial',cacheTimer=null;
let savedSourceFingerprint='',historyHandleEpoch=0;
let dirtyMemo=null;
function sourceFingerprint(){return BOOT.artifact?.snapshotSha256||History.hash(History.pack(BOOT));}
function workspaceKey(){return 'paper-map-workspace-v1:'+BOOT.paper.id;}
function currentModel(){return History.pack(state,customPositions,{edgeMode,detailMode:typeof detailMode==='undefined'?'high':detailMode,activeTree});}
function contentSignature(model){const m=History.copy(model);delete m.preferences;return History.stable(m);}
function workspaceDirty(){if(!historyBook)return false;if(nodeDrag?.started)return true;const key=JSON.stringify([localDraftRevision,customPositions,state.paper.id,state.revision]);if(dirtyMemo?.book===historyBook.checksum&&dirtyMemo.key===key)return dirtyMemo.value;const value=contentSignature(currentModel())!==contentSignature(History.materialize(historyBook));dirtyMemo={book:historyBook.checksum,key,value};return value;}
function cacheWorkspace(){
 if(!historyBook)return;
 try{localStorage.setItem(workspaceKey(),JSON.stringify({format:1,sourceFingerprint:savedSourceFingerprint,history:historyBook,working:currentModel(),diskChecksum,exportStatus:historyExportStatus,imported:historyImported}));}
 catch(_){/* File saves remain authoritative when browser storage is unavailable. */}
}
function scheduleWorkspaceCache(){clearTimeout(cacheTimer);cacheTimer=setTimeout(cacheWorkspace,160);}
function handleDatabase(action,value){return new Promise((resolve,reject)=>{
 if(typeof indexedDB==='undefined'){resolve(null);return;}const request=indexedDB.open('paper-map-files',1);
 request.onupgradeneeded=()=>request.result.createObjectStore('handles');request.onerror=()=>reject(request.error);
 request.onsuccess=()=>{const db=request.result,tx=db.transaction('handles',action==='get'?'readonly':'readwrite'),store=tx.objectStore('handles');const op=action==='get'?store.get(workspaceKey()):store.put(value,workspaceKey());op.onsuccess=()=>resolve(op.result);op.onerror=()=>reject(op.error);tx.oncomplete=()=>db.close();};
 });}
function useModel(model){
 const next=History.unpack(model);validate(next);state=next;customPositions={};savedPositions={};edgeMode=savedEdgeMode=model.preferences.edgeMode;
 if(typeof detailMode!=='undefined')detailMode=model.preferences.detailMode;
 activeTree=model.preferences.activeTree;detailCacheKey='';canonicalRevision=next.revision;localDraftRevision=0;selected=null;query='';$('search').value='';manualZoom=false;routeCacheKey='';newIds.clear();changedIds.clear();$('app').classList.remove('open');
}
function initializeWorkspace(){
 savedSourceFingerprint=sourceFingerprint();historyBook=History.create(currentModel());let restored=false;
 try{const cached=JSON.parse(localStorage.getItem(workspaceKey())||'null');
  if(cached?.format===1&&cached.sourceFingerprint===savedSourceFingerprint){History.verify(cached.history);History.validateModel(cached.working);historyBook=cached.history;diskChecksum=cached.diskChecksum||null;historyExportStatus=cached.exportStatus||'initial';historyImported=!!cached.imported;useModel(cached.working);restored=true;}
 }catch(_){notice(ui('historyCacheRejected'));}
 if(!restored)try{const legacy=JSON.parse(localStorage.getItem(storageKey)||'null');if(legacy?.baseRevision===BOOT.revision&&legacy.draftRevision>0&&legacy.draftState?.paper?.id===BOOT.paper.id){const model=History.pack(legacySnapshot(legacy.draftState),customPositions,{edgeMode,detailMode,activeTree});useModel(model);localDraftRevision=legacy.draftRevision;notice(ui('historyLegacyRecovered'));}}catch(_){/* Leave an incompatible legacy copy untouched. */}
 const epoch=historyHandleEpoch;handleDatabase('get').then(record=>{if(record?.sourceFingerprint===savedSourceFingerprint&&epoch===historyHandleEpoch&&!historyFile)historyFile=record.handle;}).catch(()=>{});
}
function historyVersion(delta){
 if(historyBusy)return false;if(workspaceDirty()){notice(ui('historySaveFirst'));return false;}
 const next=historyBook.cursor+delta;if(next<0||next>historyBook.commits.length)return false;
 const candidate=History.navigate(historyBook,next),model=History.materialize(candidate);History.validateModel(model);useModel(model);historyBook=candidate;layoutOpen=true;render();requestAnimationFrame(fit);cacheWorkspace();return true;
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
 const writableHandle=raw.format===History.FORMAT?handle:null;
 useModel(model);historyBook=book;historyFile=writableHandle;historyHandleEpoch++;diskChecksum=raw.format===History.FORMAT?History.sha256(text):null;historyImported=true;historyExportStatus=writableHandle?'file':'imported';sourceUnavailable=true;
 if(writableHandle)handleDatabase('put',{sourceFingerprint:savedSourceFingerprint,handle:writableHandle}).catch(()=>{});
 layoutOpen=true;render();requestAnimationFrame(fit);cacheWorkspace();notice(ui('historyImported'));return true;
}
function selectHistoryFile(){if(historyBusy)return;if(workspaceDirty()){notice(ui('historySaveFirst'));return;}$('history-file').click();}
function downloadHistory(text){const blob=new Blob([text],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=archiveFilename();document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
function archiveFilename(){return state.paper.id.replace(/[^\w.-]+/g,'-')+'.paper-map-history.json';}
async function saveHistory(copyFile=false,downloadOnly=false){
 if(historyBusy)return false;
 let handle=copyFile?null:historyFile;
 // Open a picker directly from the click, before hashing or other asynchronous work.
 let picker=null;try{if(!downloadOnly&&!handle&&typeof window.showSaveFilePicker==='function')picker=window.showSaveFilePicker({suggestedName:archiveFilename(),types:[{description:'Paper map history',accept:{'application/json':['.json']}}]});}catch(error){notice(ui('historySaveFailed')+' '+error.message);return false;}
 historyBusy=true;renderLayout();
 try{
  if(picker)handle=await picker;
  const candidate=History.commit(historyBook,currentModel()),text=History.stringify(candidate);
  if(handle){
   const file=await handle.getFile();if(file.size&&History.sha256(await file.text())!==diskChecksum)throw Error(ui('historyFileChanged'));
   const stream=await handle.createWritable();try{await stream.write(text);await stream.close();}catch(error){try{await stream.abort();}catch(_){}throw error;}
   historyFile=handle;historyHandleEpoch++;diskChecksum=History.sha256(text);historyExportStatus='file';
   handleDatabase('put',{sourceFingerprint:savedSourceFingerprint,handle}).catch(()=>{});
  }else{downloadHistory(text);historyExportStatus='download';}
  historyBook=candidate;localDraftRevision=0;sourceUnavailable=true;cacheWorkspace();layoutOpen=true;notice(ui(handle?'historyFileSaved':'historyDownloadRequested'));return true;
 }catch(error){if(error.name!=='AbortError')notice(ui('historySaveFailed')+' '+error.message);return false;}
 finally{historyBusy=false;renderLayout();}
}
function renderHistoryControls(){
 if(!historyBook)return;
 $('save-layout').textContent=ui('historySave');$('save-layout').disabled=historyBusy;
 $('previous-save').textContent=ui('historyPrevious');$('next-save').textContent=ui('historyNext');
 $('previous-save').disabled=historyBusy||workspaceDirty()||historyBook.cursor===0;$('next-save').disabled=historyBusy||workspaceDirty()||historyBook.cursor===historyBook.commits.length;
 $('import-history').textContent=ui('historyImport');$('import-history').disabled=historyBusy;
 $('save-copy').textContent=ui('historyCopy');$('download-history').textContent=ui('historyDownload');
 $('save-copy').disabled=historyBusy;$('download-history').disabled=historyBusy;
 const version=ui('historyVersion',{current:historyBook.cursor+1,total:historyBook.commits.length+1});
 $('layout-state').textContent=version+' · '+ui(workspaceDirty()?'historyUnsaved':historyExportStatus==='file'?'historyDiskState':historyExportStatus==='download'?'historyDownloadState':'historyReady');
}
