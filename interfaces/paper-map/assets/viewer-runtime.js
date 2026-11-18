'use strict';
const $ = id => document.getElementById(id);
const clone = value => JSON.parse(JSON.stringify(value));
const BOOT = JSON.parse($('bootstrap').textContent);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state = clone(BOOT), canonicalRevision = BOOT.revision, activeTree = 'main';
let detailMode = 'high', query = '', selected = null, zoom = 1, manualZoom = false;
let newIds = new Set(), changedIds = new Set(), localDraftRevision = 0;
let pan = null, nodeDrag = null, suppressClickUntil = 0, noticeTimer, sourceUnavailable = false;
let layoutOpen = false, customPositions = {}, savedPositions = {}, edgeMode = 'curve', savedEdgeMode = 'curve';
let routeCache = new Map(), routeCacheKey = '', dragFrame = null;
let detailCache = null, detailCacheKey = '';
const Detail = PaperMapDetail;
const storageKey = 'paper-map-session:' + state.paper.id;
const layoutKey = 'paper-map-layout:' + state.paper.id;
const node = id => state.graph.nodes.find(n => n.id === id);
const edge = id => state.graph.links.find(e => e.id === id) || detailView().links.find(e => e.id === id);
const masterTree = () => state.graph.trees.find(t => t.id === activeTree) || state.graph.trees[0];
const tree = () => {const base=masterTree(),view=detailView();return {...base,...view,routes:base.detailRoutes?.[detailMode]||base.routes};};
const memberships = id => state.graph.trees.flatMap(t=>t.detailViews?Detail.LEVELS.filter(level=>t.detailViews[level].nodeIds.includes(id)).map(level=>({...t,detailMode:level,title:t.title+' · '+ui('detail'+level[0].toUpperCase()+level.slice(1))})):t.nodeIds.includes(id)?[t]:[]);
const position = id => customPositions[viewKey()]?.[id] || tree().positions[id];
const role = n => n.visualRole || state.graph.nodeShapes.typeRoles[n.type] || 'concept';
const profile = n => state.graph.nodeShapes.roles[role(n)];
const slot = () => state.graph.nodeShapes.slot;

function detailView(){
 const key=JSON.stringify([activeTree,detailMode,canonicalRevision,localDraftRevision]);if(key===detailCacheKey&&detailCache)return detailCache;
 detailCache=Detail.view(masterTree(),state.graph,detailMode);detailCacheKey=key;return detailCache;
}
function relationStyle(e){return state.graph.relationTypes[e.relationType];}
function viewKey(){return JSON.stringify([masterTree().id,masterTree().detailViews?detailMode:null]);}
function chooseDetailForNode(id){if(detailView().nodeIds.includes(id))return;const level=[detailMode,'high','medium','low'].find(l=>Detail.selected(masterTree(),l).nodeIds.includes(id));if(level){detailMode=level;detailCacheKey='';routeCacheKey='';}}
function setDetailMode(level){if(!Detail.LEVELS.includes(level))return;resetFocusView();detailMode=level;detailCacheKey='';routeCacheKey='';if(selected?.kind==='node'&&!detailView().nodeIds.includes(selected.id)){selected=null;$('app').classList.remove('open');}manualZoom=false;render();cameraAfterLayout(()=>{centerView();if(selected?.kind==='node'){rememberFocusView();centerNode(selected.id);}});cacheWorkspace();if(!masterTree().detailViews)notice(ui('detailUnreviewed'));}
function ui(key, args = {}) {
  const text = BOOT.graph.locale.ui[key];
  if (typeof text !== 'string') throw Error('Missing locale key: ' + key);
  return text.replace(/\{(\w+)\}/g, (_, k) => args[k] ?? '{' + k + '}');
}
function validate(s) {
  if (!s || s.schemaVersion !== 2 || !s.paper || !s.graph?.nodeShapes || !s.graph.locale) throw Error('Incomplete shaped-map session');
  const ids = new Set(), edges = new Set();
  for (const n of s.graph.nodes) {
    if (!n.id || ids.has(n.id) || !n.label || !n.title || !s.graph.nodeShapes.roles[n.visualRole || s.graph.nodeShapes.typeRoles[n.type] || 'concept']) throw Error('Invalid node');
    ids.add(n.id);
  }
  for (const e of s.graph.links) {
    if (!e.id || edges.has(e.id) || !ids.has(e.from) || !ids.has(e.to) || !s.graph.relationTypes[e.relationType] || !s.graph.locale.statuses[e.status]) throw Error('Invalid edge');
    edges.add(e.id);
  }
  for (const t of s.graph.trees) {
    const kind=t.kind||'narrative';
    if (!['narrative','catalog'].includes(kind)||!t.nodeIds.length || (kind==='catalog'?(t.id==='main'||t.rootId!=null||!t.topicDescription):!t.nodeIds.includes(t.rootId)) || t.nodeIds.some(id => !ids.has(id)) || t.linkIds.some(id => !edges.has(id))) throw Error('Invalid view');
    for (const id of t.nodeIds) {
      const p = t.positions[id];
      if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y) || Math.abs(p.x)>1e7 || Math.abs(p.y)>1e7) throw Error('Invalid position');
    }
    Detail.validate(t,s.graph);
    for (const id of t.linkIds) if (!t.nodeIds.includes(s.graph.links.find(e => e.id === id).from) || !t.nodeIds.includes(s.graph.links.find(e => e.id === id).to)) throw Error('Edge outside view');
  }
  return true;
}
function notice(message) {
  $('notice').textContent = message;
  $('notice').classList.remove('hidden');
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => $('notice').classList.add('hidden'), 3200);
}
function persist(){scheduleWorkspaceCache();}
function cleanPositions(raw){
 const clean={};if(!raw||typeof raw!=='object'||Array.isArray(raw))return clean;
 for(const [key,values] of Object.entries(raw)){let pair;try{pair=JSON.parse(key);}catch(_){pair=[key,null];}if(!Array.isArray(pair)||pair.length!==2)continue;const base=state.graph.trees.find(t=>t.id===pair[0]);if(!base)continue;const level=base.detailViews?(pair[1]||'high'):null;if(level&&!Detail.LEVELS.includes(level))continue;const ids=level?base.detailViews[level].nodeIds:base.nodeIds,target=JSON.stringify([base.id,level]);for(const id of ids){const p=values?.[id];if(p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&Math.abs(p.x)<=1e7&&Math.abs(p.y)<=1e7)(clean[target]||={})[id]={x:p.x,y:p.y};}}
 return clean;
}
function restoreLayout() {
  try {
    const stored = JSON.parse(localStorage.getItem(layoutKey) || 'null');
    if (stored?.paperId === state.paper.id && stored.schemaVersion === 1) {
      savedPositions = cleanPositions(stored.positions);
      customPositions = clone(savedPositions);
      edgeMode = savedEdgeMode = stored.edgeMode === 'straight' ? 'straight' : 'curve';
    }
  } catch (_) { /* Invalid display preferences cannot replace canonical paper state. */ }
}
function layoutDirty(){return workspaceDirty();}
function saveLayout(){return saveHistory();}
function setEdgeMode(mode) {
  if (!['curve','straight'].includes(mode)) return;
  edgeMode = mode; routeCacheKey = ''; render();
}
function renderLayout() {
  $('layout-toggle').textContent = ui('historyMenu');
  $('layout-toggle').classList.toggle('unsaved', layoutDirty());
  $('layout-toggle').setAttribute('aria-expanded', String(layoutOpen));
  $('layout-panel').classList.toggle('hidden', !layoutOpen);
  renderHistoryControls();
  $('curve-mode').textContent = ui('curveMode'); $('straight-mode').textContent = ui('straightMode');
  $('curve-mode').setAttribute('aria-pressed', String(edgeMode === 'curve'));
  $('straight-mode').setAttribute('aria-pressed', String(edgeMode === 'straight'));
}
function applyLocale() {
  if (document.documentElement) document.documentElement.lang = state.graph.locale.languageTag;
  $('search').placeholder = ui('search');
  $('detail-controls').setAttribute('aria-label',ui('detailLevel'));for(const level of Detail.LEVELS){$('detail-'+level).textContent=ui('detail'+level[0].toUpperCase()+level.slice(1));$('detail-'+level).setAttribute('aria-pressed',String(detailMode===level));}
  for (const [id,key] of [['search-results','searchResults'],['map','mapLabel'],['edges','edgeLabel'],['details','detailLabel'],['layout-panel','layout']]) $(id).setAttribute('aria-label',ui(key));
  document.querySelectorAll('label[for="tree"]').forEach(el => el.textContent = ui('selectTree'));
  document.querySelectorAll('label[for="search"]').forEach(el => el.textContent = ui('search'));
  for(const [id,key] of [['zoom-in','zoomIn'],['zoom-out','zoomOut'],['center-map','centerMap']]){$(id).setAttribute('aria-label',ui(key));$(id).setAttribute('title',ui(key));}
  $('center-map').textContent=ui('centerMap');$('map').setAttribute('title',ui('canvasHint'));
  renderLayout();
}
function matches() {
  const q = query.trim().toLocaleLowerCase();
  if (!q) return [];
  return state.graph.nodes.filter(n => memberships(n.id).length && [n.label,n.title,...(n.aliases||[]),n.detail||'',...termsFor(n).flatMap(t=>[termTarget(t),termOriginal(t),...(t.aliases||[]),t.definition||'',t.studyRole||'',...(t.facets||[]).flatMap(f=>[f.label,f.value])])].join(' ').toLocaleLowerCase().includes(q));
}
function termsFor(n){return (state.glossary||[]).filter(t=>(n.termIds||[]).includes(t.id));}
function termTarget(t){return t.targetTerm||t.target||t.term||t.en||t.english||t.original||t.sourceTerm||'';}
function termOriginal(t){return t.sourceTerm||t.original||t.english||t.en||'';}
function nodeSources(n){
  const groups=new Map();
  function add(refs,scope=''){for(const r of refs||[]){const key=JSON.stringify([r.sourceId,r.location||r.locator||'']);if(!groups.has(key))groups.set(key,{...r,scopes:new Set(),excerpts:new Set()});const g=groups.get(key);if(scope)g.scopes.add(scope);if(r.excerpt)g.excerpts.add(r.excerpt);}}
  add(n.sourceRefs);for(const t of termsFor(n)){add(t.sourceRefs||t.sources,termTarget(t)+' · '+ui('definitions'));for(const f of t.facets||[])add(f.sourceRefs,termTarget(t)+' · '+f.label);}
  return [...groups.values()].map(({scopes,excerpts,...r})=>({...r,excerpt:[...scopes,...excerpts].join(' · ')}));
}
function termDetails(t){return `<div class="section"><h3>${esc(termTarget(t))}${termOriginal(t)&&termOriginal(t)!==termTarget(t)?' · '+esc(termOriginal(t)):''}</h3><p>${esc(t.definition||'')}</p>${t.studyRole?`<p><b>${esc(ui('termStudyRole'))}</b><br>${esc(t.studyRole)}</p>`:''}${(t.facets||[]).length?`<h3>${esc(ui('termProperties'))}</h3>${t.facets.map(f=>`<p><b>${esc(f.label)}</b><br>${esc(f.value)}</p>`).join('')}`:''}</div>`;}
function searchResults() {
  $('search-results').classList.toggle('hidden', !query.trim());
  if (!query.trim()) return;
  const list = matches();
  $('search-results').innerHTML = list.length ? list.map(n => `<button class="search-result" data-search-node="${esc(n.id)}"><b>${esc(n.label)}</b><span>${memberships(n.id).map(t => esc(t.detailMode?t.title:t.id==='main'?ui('mainTree'):t.title)).join(' · ')}</span></button>`).join('') : `<div class="empty-result">${esc(ui('noResults'))}</div>`;
  document.querySelectorAll('[data-search-node]').forEach(el => el.onclick = () => locate(el.dataset.searchNode));
}
function displayLabel(e) {

  return (e.displayLabel || state.graph.locale.relationLabels[e.relationType] || e.label) + (e.displayStatusSuffix ?? ({hypothesis:ui('hypothesisSuffix'),user:ui('userSuffix'),disputed:ui('disputedSuffix')}[e.status] || ''));
}
function glyph(n) {
  const p = profile(n), cx = slot().width/2, cy = slot().height/2, x = cx-p.width/2, y = cy-p.height/2;
  let shape;
  if (p.shape === 'rectangle') shape = `<rect x="${x}" y="${y}" width="${p.width}" height="${p.height}" rx="9"/>`;
  else if (p.shape === 'hexagon') shape = `<polygon points="${x+20},${y} ${x+p.width-20},${y} ${x+p.width},${cy} ${x+p.width-20},${y+p.height} ${x+20},${y+p.height} ${x},${cy}"/>`;
  else shape = `<ellipse cx="${cx}" cy="${cy}" rx="${p.width/2}" ry="${p.height/2}"/>`;
  return `<svg class="node-glyph" viewBox="0 0 ${slot().width} ${slot().height}" aria-hidden="true">${shape}</svg>`;
}
function center(id) { const p=position(id); return {x:p.x+slot().width/2,y:p.y+slot().height/2}; }
function outline(id, toward) {
  const c = center(id), p = profile(node(id));
  let dx=toward.x-c.x, dy=toward.y-c.y;
  if (!dx && !dy) dx=1;
  const a=p.width/2,b=p.height/2;
  let t;
  if (p.shape==='ellipse'||p.shape==='circle') t=1/Math.sqrt(dx*dx/(a*a)+dy*dy/(b*b));
  else {
    const vertices=p.shape==='hexagon'?[[-a+20,-b],[a-20,-b],[a,0],[a-20,b],[-a+20,b],[-a,0]]:[[-a,-b],[a,-b],[a,b],[-a,b]];
    t=Infinity;
    for(let i=0;i<vertices.length;i++) {
      const v=vertices[i],w=vertices[(i+1)%vertices.length],ex=w[0]-v[0],ey=w[1]-v[1],den=dx*ey-dy*ex;
      if(Math.abs(den)<1e-8)continue;
      const ray=(v[0]*ey-v[1]*ex)/den,u=(v[0]*dy-v[1]*dx)/den;
      if(ray>=0&&u>=0&&u<=1)t=Math.min(t,ray);
    }
    if(!Number.isFinite(t))t=1;
  }
  return {x:c.x+dx*t,y:c.y+dy*t};
}
function cubic(a,c1,c2,b,t) { const u=1-t;return {x:u*u*u*a.x+3*u*u*t*c1.x+3*u*t*t*c2.x+t*t*t*b.x,y:u*u*u*a.y+3*u*u*t*c1.y+3*u*t*t*c2.y+t*t*t*b.y}; }
function insideBox(p,id,pad=5) { const q=position(id);return p.x>q.x-pad&&p.x<q.x+slot().width+pad&&p.y>q.y-pad&&p.y<q.y+slot().height+pad; }
function dynamicRoute(e, used) {
  const a=center(e.from),b=center(e.to),dx=b.x-a.x,dy=b.y-a.y,len=Math.max(1,Math.hypot(dx,dy)),normal={x:-dy/len,y:dx/len};
  const reverse=tree().linkIds.map(edge).some(x=>x.from===e.to&&x.to===e.from&&x.id!==e.id);
  let start,end,c1,c2,points,d;
  if(e.from===e.to) {
    // A self-relation needs a visible loop even when other edges are straight.
    c1={x:a.x+155,y:a.y+150};c2={x:a.x-155,y:a.y+150};
    start=outline(e.from,c1);end=outline(e.to,c2);
    points=Array.from({length:49},(_,i)=>cubic(start,c1,c2,end,i/48));
    d=`M${start.x} ${start.y} C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${end.x} ${end.y}`;
  } else if(edgeMode==='straight') {
    const off=reverse?22:0;
    start=outline(e.from,{x:b.x+normal.x*off,y:b.y+normal.y*off});
    end=outline(e.to,{x:a.x+normal.x*off,y:a.y+normal.y*off});
    points=Array.from({length:33},(_,i)=>({x:start.x+(end.x-start.x)*i/32,y:start.y+(end.y-start.y)*i/32}));
    d=`M${start.x} ${start.y} L${end.x} ${end.y}`;
  } else {
    const attempts=reverse?[100,180,260,340,420]:[0,70,-70,140,-140,230,-230,340,-340];
    let best=null;
    for(const offset of attempts) {
      const horizontal=Math.abs(dx)>=Math.abs(dy);
      const tangent=horizontal?{x:dx*.45,y:0}:{x:0,y:dy*.45};
      c1={x:a.x+tangent.x+normal.x*offset,y:a.y+tangent.y+normal.y*offset};
      c2={x:b.x-tangent.x+normal.x*offset,y:b.y-tangent.y+normal.y*offset};
      start=outline(e.from,c1);end=outline(e.to,c2);
      const sampled=Array.from({length:49},(_,i)=>cubic(start,c1,c2,end,i/48));
      const collisions=sampled.filter(p=>tree().nodeIds.some(id=>id!==e.from&&id!==e.to&&insideBox(p,id))).length;
      if(!best||collisions<best.collisions)best={start,end,c1,c2,points:sampled,collisions};
      if(!collisions)break;
    }
    ({start,end,c1,c2,points}=best);
    d=`M${start.x} ${start.y} C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${end.x} ${end.y}`;
  }
  const width=Math.max(42,displayLabel(e).length*11+14);
  let label=points[Math.floor(points.length/2)];
  for(const f of [.5,.35,.65,.25,.75,.15,.85]) {
    const q=points[Math.round((points.length-1)*f)],box={x:q.x-width/2,y:q.y-12,w:width,h:24};
    const overlaps=tree().nodeIds.some(id=>{const p=position(id);return box.x<p.x+slot().width+5&&box.x+box.w>p.x-5&&box.y<p.y+slot().height+5&&box.y+box.h>p.y-5;});
    if(!overlaps&&!used.some(r=>Math.abs(q.y-r.y)<28&&Math.abs(q.x-r.x)<(width+r.labelWidth)/2+6)){label=q;break;}
  }
  return {d,x:label.x,y:label.y,labelWidth:width,points,bounds:{maxX:Math.max(...points.map(p=>p.x),label.x+width/2)+24,maxY:Math.max(...points.map(p=>p.y),label.y+14)+24}};
}
function prepareRoutes() {
  const key=JSON.stringify([activeTree,edgeMode,tree().nodeIds.map(id=>[id,position(id)]),tree().linkIds,canonicalRevision,localDraftRevision]);
  if(key===routeCacheKey)return;
  routeCacheKey=key;routeCache=new Map();const used=[];
  const defaults=!Object.keys(customPositions[viewKey()]||{}).length&&edgeMode==='curve';
  for(const e of tree().linkIds.map(edge)) {
    const saved=defaults?tree().routes?.[e.id]:null;
    const r=saved&&/^[^LQ]*$/.test(saved.d)?{...saved,labelWidth:Math.max(42,displayLabel(e).length*11+14)}:dynamicRoute(e,used);
    routeCache.set(e.id,r);used.push(r);
  }
}
function route(e) { prepareRoutes();return routeCache.get(e.id); }
function render() {
  applyLocale();const t=tree(),match=query.trim()?new Set(matches().map(n=>n.id)):null;
  const context=focusContext(),related=context.related;
  $('map').classList.toggle('node-focus',!!context.id);
  $('paper-title').textContent=t.detailMode?t.title:t.id==='main'?state.paper.title:t.title;document.title=$('paper-title').textContent;
  $('tree').innerHTML=state.graph.trees.map(v=>`<option value="${esc(v.id)}" ${v.id===t.id?'selected':''}>${esc(v.id==='main'?ui('mainTree'):v.title)}</option>`).join('');
  $('tree').classList.remove('hidden');
  $('nodes').innerHTML=t.nodeIds.map(id=>{const n=node(id),p=position(id),views=memberships(id),kind=role(n);return `<article class="node role-${kind} ${id===t.rootId?'root':''} ${selected?.kind==='node'&&selected.id===id?'selected':''} ${context.id?!related.has(id)?'dim':'':match&&!match.has(id)?'dim':''} ${related.has(id)?'neighbor':''} ${context.neighbors.has(id)?'direction-'+context.neighbors.get(id):''} ${nodeDrag?.id===id&&nodeDrag.started?'node-dragging':''} ${nodeDrag?.id===id&&collides(id,p)?'node-collision':''} ${newIds.has(id)?'new-node':''} ${changedIds.has(id)?'revised':''}" style="left:${p.x}px;top:${p.y}px" data-card="${esc(id)}" data-direction="${esc(context.neighbors.get(id)||'')}">${glyph(n)}<button class="node-main" data-node="${esc(id)}" aria-label="${esc(n.label+' · '+(state.graph.locale.nodeTypes[n.type]||n.type))}" title="${esc(ui('dragHint'))}"><span style="max-width:${profile(n).labelWidth}px">${esc(n.label)}</span></button>${views.length>1?`<button class="shared" data-shared="${esc(id)}" aria-label="${esc(ui('sharedCount',{name:n.label,count:views.length}))}">↗ ${views.length}</button>`:''}</article>`;}).join('');
  prepareRoutes();
  $('edge-layer').innerHTML=t.linkIds.map(edge).sort((a,b)=>Number(!!directionFor(a,context.id))-Number(!!directionFor(b,context.id))).map(e=>renderEdge(e,context,match)).join('');
  document.querySelectorAll('[data-node]').forEach(el=>{el.onclick=()=>{if(Date.now()>suppressClickUntil)select('node',el.dataset.node);};el.onpointerdown=e=>beginNodeDrag(e,el.dataset.node);el.onkeydown=e=>keyboardMove(e,el.dataset.node);});
  document.querySelectorAll('[data-shared]').forEach(el=>el.onclick=()=>{select('node',el.dataset.shared);$('other-trees')?.scrollIntoView({block:'nearest'});});
  document.querySelectorAll('[data-edge]').forEach(el=>{el.onclick=()=>select('edge',el.dataset.edge);el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select('edge',el.dataset.edge);}};});
  if(selected)details();resize();
}

/* Sidebar rendering is shared with the previous version; content and source IDs remain intact. */
function sources(refs){return refs?.length?refs.map(r=>{const s=state.sources.find(s=>s.id===r.sourceId);return `<div class="source"><b>${esc(s?.label||r.sourceId)} · ${esc(r.location||r.locator||'')}</b><p>${esc(r.excerpt||s?.note||'')}</p></div>`}).join(''):`<p>${esc(ui('noEvidence'))}</p>`}
function details(){if(!selected)return;let html='';if(selected.kind==='node'){const n=node(selected.id);if(!n){close();return}const links=tree().linkIds.map(edge).filter(e=>e.from===n.id||e.to===n.id),views=memberships(n.id).filter(t=>t.id!==activeTree||t.detailMode&&t.detailMode!==detailMode),terms=termsFor(n);html=`<div class="detail-top"><span class="kind">${esc(state.graph.locale.nodeTypes[n.type]||n.type)}</span><button class="close" id="close" aria-label="${esc(ui('close'))}">×</button></div><h2>${esc(n.label)}</h2><p class="summary">${esc(n.detail||n.title)}</p>${connectionGroups(n,links)}${terms.length?`<div class="section"><h3>${esc(ui('definitions'))}</h3>${terms.map(termDetails).join('')}</div>`:''}${views.length?`<div class="section" id="other-trees"><h3>${esc(ui('sharedHeading'))}</h3>${views.map(t=>`<button class="tree-link" data-tree-link="${esc(t.id)}" data-shared-id="${esc(n.id)}" data-detail-mode="${esc(t.detailMode||'')}">${esc(t.detailMode?t.title:t.id==='main'?state.paper.title:t.title)}</button>`).join('')}</div>`:''}<div class="section"><h3>${esc(ui('sources'))}</h3>${sources(nodeSources(n))}</div><div class="section"><h3>${esc(ui('nodeRole'))}</h3><p>${esc(ui('role'+role(n)[0].toUpperCase()+role(n).slice(1)))}</p></div>${n.limits?`<div class="section"><h3>${esc(ui('limits'))}</h3><div class="limit">${esc(n.limits)}</div></div>`:''}<div class="actions"><button class="action" id="extend">${esc(ui('extend'))}</button><button class="action" id="new-tree">${esc(ui('newTree'))}</button></div><div id="editor"></div>`}
else{const e=edge(selected.id);if(!e){close();return}const r=relationStyle(e),conditions=e.context||JSON.stringify(e.qualifiers||{});html=`<div class="detail-top"><span class="kind">${esc(state.graph.locale.families[r.family]||r.family)}</span><button class="close" id="close" aria-label="${esc(ui('close'))}">×</button></div><h2>${esc(displayLabel(e))}</h2><p class="summary">${esc(e.meaning)}</p><div class="state">${esc(state.graph.locale.statuses[e.status])}</div><div class="section"><h3>${esc(ui('relationDefinition'))}</h3><p>${esc(state.graph.locale.relationDefinitions[e.relationType])}</p><p>${esc(ui(r.directed===false?'undirected':'directed'))}</p></div>${conditions&&conditions!=='{}'?`<div class="section"><h3>${esc(ui('conditions'))}</h3><p>${esc(conditions)}</p></div>`:''}<div class="section"><h3>${esc(ui('connectedNodes'))}</h3><button class="related" data-node-link="${esc(e.from)}"><small>${esc(ui('sourceNode'))}</small>${esc(node(e.from).label)}</button><button class="related" data-node-link="${esc(e.to)}"><small>${esc(ui('targetNode'))}</small>${esc(node(e.to).label)}</button></div><div class="section"><h3>${esc(ui('basis'))}</h3>${sources(e.sourceRefs)}</div><div class="section"><h3>${esc(ui('caution'))}</h3><div class="limit">${esc(ui('relationCaveat'))}</div></div>`}
$('details').innerHTML=html;$('close').onclick=close;document.querySelectorAll('[data-related]').forEach(el=>el.onclick=()=>select('edge',el.dataset.related));document.querySelectorAll('[data-node-link]').forEach(el=>el.onclick=()=>locate(el.dataset.nodeLink));document.querySelectorAll('[data-tree-link]').forEach(el=>el.onclick=()=>changeTree(el.dataset.treeLink,el.dataset.sharedId,el.dataset.detailMode||undefined));if($('extend'))$('extend').onclick=()=>editor('extend');if($('new-tree'))$('new-tree').onclick=()=>editor('tree')}


function select(kind,id){rememberFocusView();if(kind==='node')chooseDetailForNode(id);if(kind==='edge'&&!detailView().linkIds.includes(id)){const level=['high','medium','low'].find(l=>Detail.selected(masterTree(),l).linkIds.includes(id));if(level){detailMode=level;detailCacheKey='';routeCacheKey='';}}selected={kind,id};layoutOpen=false;$('app').classList.add('open');render();cameraAfterLayout(()=>{if(kind==='node')centerNode(id);});}
function close(){selected=null;$('app').classList.remove('open');restoreFocusView();render();}
function changeTree(id,sharedId,mode){if(sharedId)rememberFocusView();else resetFocusView();activeTree=id;if(mode)detailMode=mode;detailCacheKey='';if(sharedId)chooseDetailForNode(sharedId);manualZoom=false;selected=sharedId?{kind:'node',id:sharedId}:null;routeCacheKey='';$('app').classList.toggle('open',!!selected);render();cameraAfterLayout(()=>{if(sharedId)centerNode(sharedId);else centerView();});}
function locate(id){const views=memberships(id),target=views.find(t=>t.id===activeTree&&(!t.detailMode||t.detailMode===detailMode))||views.find(t=>t.id==='main')||views[0];if(!target)return;rememberFocusView();activeTree=target.id;if(target.detailMode)detailMode=target.detailMode;detailCacheKey='';chooseDetailForNode(id);selected={kind:'node',id};$('app').classList.add('open');$('search-results').classList.add('hidden');manualZoom=false;routeCacheKey='';render();cameraAfterLayout(()=>{centerNode(id);const el=document.querySelector(`[data-card="${CSS.escape(id)}"]`);el?.classList.add('located');});}
function centerNode(id){const p=position(id);if(!p)return;camera={x:$('map').clientWidth/2-(p.x+slot().width/2)*zoom,y:$('map').clientHeight/2-(p.y+slot().height/2)*zoom};manualZoom=true;resize();}
function geometry(){
 prepareRoutes();const points=tree().nodeIds.flatMap(id=>{const p=position(id);return [p,{x:p.x+slot().width,y:p.y+slot().height}];});
 for(const r of routeCache.values()){for(const p of r.points||[])points.push(Array.isArray(p)?{x:p[0],y:p[1]}:p);points.push({x:r.x-(r.labelWidth||80)/2,y:r.y-14},{x:r.x+(r.labelWidth||80)/2,y:r.y+14});}
 const minX=Math.min(...points.map(p=>p.x)),maxX=Math.max(...points.map(p=>p.x)),minY=Math.min(...points.map(p=>p.y)),maxY=Math.max(...points.map(p=>p.y));return {minX,maxX,minY,maxY,width:Math.max(1,maxX-minX),height:Math.max(1,maxY-minY)};
}
function resize(){$('board').style.width='1px';$('board').style.height='1px';$('edges').setAttribute('width',1);$('edges').setAttribute('height',1);renderCamera();}
function centerView(){if(nodeDrag?.started||pan)return;const g=geometry(),m=$('map');camera={x:m.clientWidth/2-(g.minX+g.maxX)/2*zoom,y:m.clientHeight/2-(g.minY+g.maxY)/2*zoom};resize();}
function freeSpot(id){const base=position(id),occupied=tree().nodeIds.map(position),angles=[0,.65,-.65,1.3,-1.3,Math.PI,.65+Math.PI,-.65+Math.PI];for(let radius=310;radius<2200;radius+=150)for(const angle of angles){const p={x:Math.round(base.x+Math.cos(angle)*radius),y:Math.round(base.y+Math.sin(angle)*radius)};if(Math.abs(p.x)>1e7||Math.abs(p.y)>1e7)continue;if(occupied.every(q=>Math.abs(q.x-p.x)>210||Math.abs(q.y-p.y)>slot().height+30))return p;}return {x:base.x+220,y:Math.max(...occupied.map(p=>p.y))+slot().height+70};}
function editor(mode){const root=node(selected.id);$('editor').innerHTML=`<form class="editor" id="edit-form"><label for="new-label">${esc(ui(mode==='tree'?'newTreeName':'newNodeName'))}</label><input id="new-label" required maxlength="80" value="${mode==='tree'?esc(ui('extendedContext',{name:root.label})):''}">${mode==='extend'?`<label for="new-type">${esc(ui('nodeKind'))}</label><select id="new-type">${['concept','method','term','question','claim','observation','limit'].map(type=>`<option value="${type}">${esc(state.graph.locale.nodeTypes[type])}</option>`).join('')}</select><label for="new-relation">${esc(ui('relation'))}</label><input id="new-relation" required value="${esc(state.graph.locale.relationLabels.requires_concept||state.graph.locale.relationLabels.note)}"><label for="new-detail">${esc(ui('detail'))}</label><textarea id="new-detail"></textarea>`:''}<button class="action" type="submit">${esc(ui(mode==='tree'?'create':'connect'))}</button><button class="action" type="button" id="cancel">${esc(ui('cancel'))}</button></form>`;$('new-label').focus();$('cancel').onclick=()=>$('editor').innerHTML='';$('edit-form').onsubmit=e=>{e.preventDefault();const text=$('new-label').value.trim();if(!text)return;const id=(crypto.randomUUID?.()||Date.now().toString()).replaceAll('-','');if(mode==='tree'){const v={id:'tree-'+id,title:text,focusQuestion:text,rootId:root.id,nodeIds:[root.id],linkIds:[],positions:{[root.id]:{x:400,y:220}},routes:{}};state.graph.trees.push(v);localDraftRevision++;persist();changeTree(v.id,root.id)}else{const relation=$('new-relation').value.trim(),detail=$('new-detail').value.trim();if(!relation)return;const newType=$('new-type').value||'concept';const n={id:'node-'+id,label:text,title:text,type:newType,visualRole:state.graph.nodeShapes.typeRoles[newType]||'concept',detail:detail||ui('draftDetail'),limits:ui('draftLimits'),sourceRefs:[],termIds:[],aliases:[],provenance:'user-note'},p=freeSpot(root.id),link={id:'link-'+id,from:root.id,to:n.id,relationType:'note',label:'note',meaning:root.label+' → '+relation+' → '+text,originalLabels:[relation],status:'user',primary:true,sourceRefs:[]};state.graph.nodes.push(n);state.graph.links.push(link);masterTree().nodeIds.push(n.id);masterTree().linkIds.push(link.id);masterTree().positions[n.id]=p;if(masterTree().detailViews){const v=masterTree().detailViews[detailMode];v.nodeIds.push(n.id);v.linkIds.push(link.id);v.positions[n.id]=p;}localDraftRevision++;newIds=new Set([n.id]);persist();query='';$('search').value='';locate(n.id)}notice(ui(mode==='tree'?'treeCreated':'nodeAdded'))}}


function collides(id,p){const size=profile(node(id)),box={x:p.x+(slot().width-size.width)/2,y:p.y+(slot().height-size.height)/2,w:size.width,h:size.height};return tree().nodeIds.some(other=>{if(other===id)return false;const q=position(other),otherSize=profile(node(other)),x=q.x+(slot().width-otherSize.width)/2,y=q.y+(slot().height-otherSize.height)/2;return box.x<x+otherSize.width+8&&box.x+box.w>x-8&&box.y<y+otherSize.height+8&&box.y+box.h>y-8;});}
function beginNodeDrag(e,id){if(e.button!==0||pan||nodeDrag)return;e.stopPropagation();nodeDrag={id,treeId:viewKey(),pointerId:e.pointerId,x:e.clientX,y:e.clientY,scrollLeft:$('map').scrollLeft,scrollTop:$('map').scrollTop,start:clone(position(id)),previous:clone(customPositions[viewKey()]?.[id]||null),scale:zoom,started:false};}
function moveNodeDrag(e){if(!nodeDrag||e.pointerId!==nodeDrag.pointerId)return;const dx=(e.clientX-nodeDrag.x+$('map').scrollLeft-nodeDrag.scrollLeft)/nodeDrag.scale,dy=(e.clientY-nodeDrag.y+$('map').scrollTop-nodeDrag.scrollTop)/nodeDrag.scale;if(!nodeDrag.started&&Math.hypot(dx,dy)<4)return;if(!nodeDrag.started)$('map').setPointerCapture?.(e.pointerId);nodeDrag.started=true;manualZoom=true;selected={kind:'node',id:nodeDrag.id};(customPositions[nodeDrag.treeId]||={})[nodeDrag.id]={x:Math.max(-1e7,Math.min(1e7,Math.round(nodeDrag.start.x+dx))),y:Math.max(-1e7,Math.min(1e7,Math.round(nodeDrag.start.y+dy)))};routeCacheKey='';render();}
function endNodeDrag(e,cancel=false){if(!nodeDrag||e.pointerId!==nodeDrag.pointerId)return;const drag=nodeDrag,collision=drag.started&&collides(drag.id,position(drag.id));nodeDrag=null;$('map').releasePointerCapture?.(e.pointerId);if(!drag.started)return;if(cancel||collision){if(drag.previous)(customPositions[drag.treeId]||={})[drag.id]=drag.previous;else{delete customPositions[drag.treeId]?.[drag.id];if(!Object.keys(customPositions[drag.treeId]||{}).length)delete customPositions[drag.treeId];}if(collision&&!cancel)notice(ui('layoutCollision'));}else{layoutOpen=true;notice(ui('layoutUnsaved'));}suppressClickUntil=Date.now()+300;routeCacheKey='';render();scheduleWorkspaceCache();if(cameraResizePending)resizeCamera();}
function keyboardMove(e,id){if(!e.altKey||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const p=position(id),step=e.shiftKey?5:20,dx=e.key==='ArrowLeft'?-step:e.key==='ArrowRight'?step:0,dy=e.key==='ArrowUp'?-step:e.key==='ArrowDown'?step:0,next={x:Math.max(-1e7,Math.min(1e7,p.x+dx)),y:Math.max(-1e7,Math.min(1e7,p.y+dy))};if(collides(id,next)){notice(ui('layoutCollision'));return;}(customPositions[viewKey()]||={})[id]=next;manualZoom=true;layoutOpen=true;routeCacheKey='';render();document.querySelector(`[data-node="${CSS.escape(id)}"]`)?.focus();scheduleWorkspaceCache();}

$('layout-toggle').onclick=()=>{layoutOpen=!layoutOpen;renderLayout();};
$('save-layout').onclick=()=>saveHistory();$('previous-save').onclick=()=>historyVersion(-1);$('next-save').onclick=()=>historyVersion(1);$('import-history').onclick=selectHistoryFile;$('save-copy').onclick=()=>saveHistory(true);
$('history-file').onchange=async e=>{const file=e.target.files?.[0];try{if(file){if(file.size>History.MAX_BYTES)throw Error('History file too large');importHistoryText(await file.text());}}catch(error){notice(ui('historyImportFailed')+' '+error.message);}finally{e.target.value='';}};
$('curve-mode').onclick=()=>setEdgeMode('curve');$('straight-mode').onclick=()=>setEdgeMode('straight');
$('tree').onchange=e=>changeTree(e.target.value);for(const level of Detail.LEVELS)$('detail-'+level).onclick=()=>setDetailMode(level);
$('search').oninput=e=>{query=e.target.value;render();searchResults();};$('search').onfocus=searchResults;
$('search').onkeydown=e=>{if(e.key==='Enter'){const found=matches()[0];if(found){e.preventDefault();locate(found.id);}}};
document.addEventListener('click',e=>{if(!e.target.closest('.search-wrap'))$('search-results').classList.add('hidden');});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(nodeDrag)endNodeDrag({pointerId:nodeDrag.pointerId},true);if(pan)endPan({pointerId:pan.pointerId},true);layoutOpen=false;$('search-results').classList.add('hidden');close();}});
$('zoom-in').onclick=()=>zoomAt(zoom*1.2);$('zoom-out').onclick=()=>zoomAt(zoom/1.2);$('center-map').onclick=centerGraph;
$('map').addEventListener('pointerdown',beginPan);
window.addEventListener('pointermove',e=>{if(nodeDrag)moveNodeDrag(e);else movePan(e);});
window.addEventListener('pointerup',e=>{if(nodeDrag)endNodeDrag(e);else endPan(e);});
window.addEventListener('pointercancel',e=>{if(nodeDrag)endNodeDrag(e,true);else endPan(e,true);});
window.addEventListener('beforeunload',e=>{if(layoutDirty()){e.preventDefault();e.returnValue='';}});
$('map').addEventListener('wheel',e=>{e.preventDefault();const r=$('map').getBoundingClientRect();zoomAt(zoom*Math.exp(-Math.max(-100,Math.min(100,e.deltaY))*.002),e.clientX-r.left,e.clientY-r.top);},{passive:false});
$('map').addEventListener('keydown',e=>{if(e.target!==$('map')||nodeDrag||pan)return;if(e.key==='Home'){e.preventDefault();centerGraph();}else if(['+','=','-','_'].includes(e.key)){e.preventDefault();zoomAt(zoom*(e.key==='-'||e.key==='_'?1/1.2:1.2));}else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();manualZoom=true;const step=e.shiftKey?120:40;camera.x+=e.key==='ArrowLeft'?step:e.key==='ArrowRight'?-step:0;camera.y+=e.key==='ArrowUp'?step:e.key==='ArrowDown'?-step:0;renderCamera();}});
window.getPaperMapCamera=()=>({x:camera.x,y:camera.y,zoom});

window.getPaperMapState=()=>clone(state);
window.getPaperMapLayout=()=>({paperId:state.paper.id,positions:clone(customPositions),edgeMode,dirty:layoutDirty()});
window.updatePaperMap=function(next){validate(next);if(next.artifact&&BOOT.artifact&&next.artifact.templateSha256!==BOOT.artifact.templateSha256){notice(ui('templateMismatch'));return false;}if(next.paper.id!==state.paper.id||next.revision<=canonicalRevision)return false;if(nodeDrag)return false;if(historyImported||historyExportStatus==='managed'||workspaceDirty()){sourceUnavailable=true;notice(ui('historySourceHeld'));return false;}if(localDraftRevision){persist();notice(ui('draftSaved'));}const old=new Map(state.graph.nodes.map(n=>[n.id,JSON.stringify([n,termsFor(n)])]));newIds=new Set(next.graph.nodes.filter(n=>!old.has(n.id)).map(n=>n.id));changedIds=new Set(next.graph.nodes.filter(n=>old.has(n.id)&&JSON.stringify([n,(next.glossary||[]).filter(t=>(n.termIds||[]).includes(t.id))])!==old.get(n.id)).map(n=>n.id));if(selected){const redirects=selected.kind==='node'?next.graph.redirects:next.graph.linkRedirects,seen=new Set();while(redirects?.[selected.id]&&!seen.has(selected.id)){seen.add(selected.id);selected.id=redirects[selected.id];}}state=clone(next);canonicalRevision=next.revision;localDraftRevision=0;customPositions=cleanPositions(customPositions);savedPositions=cleanPositions(savedPositions);if(!state.graph.trees.some(t=>t.id===activeTree))activeTree='main';routeCacheKey='';detailCacheKey='';historyBook=History.commit(historyBook,currentModel(),new Date().toISOString(),'source-update');cacheWorkspace();render();setTimeout(()=>{newIds.clear();changedIds.clear();document.querySelectorAll('.new-node,.revised').forEach(el=>el.classList.remove('new-node','revised'));},1900);return true;};
async function refresh(){if(!/^https?:$/.test(location.protocol)||sourceUnavailable)return;try{const response=await fetch('paper-state.json',{cache:'no-store'});if(!response.ok){sourceUnavailable=true;return;}const next=await response.json();if(next.revision>canonicalRevision)window.updatePaperMap(next);}catch(_){sourceUnavailable=true;}}
validate(state);restoreLayout();initializeWorkspace();render();cameraAfterLayout(centerView);
new ResizeObserver(resizeCamera).observe($('map'));
refresh();setInterval(refresh,2000);
