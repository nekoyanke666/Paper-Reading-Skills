'use strict';
const $ = id => document.getElementById(id);
const clone = value => JSON.parse(JSON.stringify(value));
const BOOT = JSON.parse($('bootstrap').textContent);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state = clone(BOOT), canonicalRevision = BOOT.revision, activeTree = 'main';
let all = false, query = '', selected = null, zoom = 1, manualZoom = false;
let newIds = new Set(), changedIds = new Set(), localDraftRevision = 0;
let pan = null, nodeDrag = null, suppressClickUntil = 0, noticeTimer, sourceUnavailable = false;
let layoutOpen = false, customPositions = {}, savedPositions = {}, edgeMode = 'curve', savedEdgeMode = 'curve';
let routeCache = new Map(), routeCacheKey = '', dragFrame = null;
const storageKey = 'paper-map-session:' + state.paper.id;
const layoutKey = 'paper-map-layout:' + state.paper.id;
const node = id => state.graph.nodes.find(n => n.id === id);
const edge = id => state.graph.links.find(e => e.id === id);
const tree = () => state.graph.trees.find(t => t.id === activeTree) || state.graph.trees[0];
const memberships = id => state.graph.trees.filter(t => t.nodeIds.includes(id));
const position = id => customPositions[tree().id]?.[id] || tree().positions[id];
const role = n => n.visualRole || state.graph.nodeShapes.typeRoles[n.type] || 'concept';
const profile = n => state.graph.nodeShapes.roles[role(n)];
const slot = () => state.graph.nodeShapes.slot;

function ui(key, args = {}) {
  const text = state.graph.locale.ui[key];
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
      if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y) || p.x < 0 || p.y < 0) throw Error('Invalid position');
    }
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
function persist() {
  try { localStorage.setItem(storageKey, JSON.stringify({baseRevision:canonicalRevision,draftRevision:localDraftRevision,draftState:state})); }
  catch (_) { notice(ui('draftUnavailable')); }
}
function cleanPositions(raw) {
  const clean = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return clean;
  for (const t of state.graph.trees) {
    for (const id of t.nodeIds) {
      const p = raw[t.id]?.[id];
      if (p && Number.isFinite(p.x) && Number.isFinite(p.y) && p.x >= 0 && p.y >= 0) (clean[t.id] ||= {})[id] = {x:p.x,y:p.y};
    }
  }
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
function layoutDirty() { return JSON.stringify(customPositions) !== JSON.stringify(savedPositions) || edgeMode !== savedEdgeMode; }
function saveLayout() {
  try {
    localStorage.setItem(layoutKey, JSON.stringify({schemaVersion:1,paperId:state.paper.id,positions:customPositions,edgeMode}));
    savedPositions = clone(customPositions); savedEdgeMode = edgeMode;
    layoutOpen = false; renderLayout(); notice(ui('layoutSaved'));
    return true;
  } catch (_) { notice(ui('layoutSaveFailed')); return false; }
}
function defaultLayout() {
  const nextSaved=clone(savedPositions);delete customPositions[tree().id];delete nextSaved[tree().id];
  let saved=false;
  try {localStorage.setItem(layoutKey,JSON.stringify({schemaVersion:1,paperId:state.paper.id,positions:nextSaved,edgeMode:savedEdgeMode}));savedPositions=nextSaved;saved=true;}
  catch (_) { /* Keep unsaved state visible when browser persistence fails. */ }
  routeCacheKey = ''; layoutOpen = !saved; manualZoom = false;
  render(); requestAnimationFrame(fit); notice(ui(saved?'layoutDefault':'layoutSaveFailed'));
}
function setEdgeMode(mode) {
  if (!['curve','straight'].includes(mode)) return;
  edgeMode = mode; routeCacheKey = ''; render();
}
function renderLayout() {
  $('layout-toggle').textContent = ui('layout');
  $('layout-toggle').classList.toggle('unsaved', layoutDirty());
  $('layout-toggle').setAttribute('aria-expanded', String(layoutOpen));
  $('layout-panel').classList.toggle('hidden', !layoutOpen);
  $('layout-state').textContent = ui(layoutDirty() ? 'layoutUnsaved' : Object.keys(savedPositions).length ? 'layoutSavedState' : 'layoutDefaultState');
  $('save-layout').textContent = ui('saveLayout'); $('save-layout').disabled = !layoutDirty();
  $('default-layout').textContent = ui('defaultLayout');
  $('curve-mode').textContent = ui('curveMode'); $('straight-mode').textContent = ui('straightMode');
  $('curve-mode').setAttribute('aria-pressed', String(edgeMode === 'curve'));
  $('straight-mode').setAttribute('aria-pressed', String(edgeMode === 'straight'));
}
function applyLocale() {
  if (document.documentElement) document.documentElement.lang = state.graph.locale.languageTag;
  $('search').placeholder = ui('search'); $('all').textContent = ui('allRelations');
  for (const [id,key] of [['search-results','searchResults'],['map','mapLabel'],['edges','edgeLabel'],['details','detailLabel'],['layout-panel','layout']]) $(id).setAttribute('aria-label',ui(key));
  document.querySelectorAll('label[for="tree"]').forEach(el => el.textContent = ui('selectTree'));
  document.querySelectorAll('label[for="search"]').forEach(el => el.textContent = ui('search'));
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
  $('search-results').innerHTML = list.length ? list.map(n => `<button class="search-result" data-search-node="${esc(n.id)}"><b>${esc(n.label)}</b><span>${memberships(n.id).map(t => esc(t.id==='main'?ui('mainTree'):t.title)).join(' · ')}</span></button>`).join('') : `<div class="empty-result">${esc(ui('noResults'))}</div>`;
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
      const collisions=sampled.filter(p=>p.x<0||p.y<0||tree().nodeIds.some(id=>id!==e.from&&id!==e.to&&insideBox(p,id))).length;
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
  const defaults=!Object.keys(customPositions[tree().id]||{}).length&&edgeMode==='curve';
  for(const e of tree().linkIds.map(edge)) {
    const saved=defaults?tree().routes?.[e.id]:null;
    const r=saved&&/^[^LQ]*$/.test(saved.d)?{...saved,labelWidth:Math.max(42,displayLabel(e).length*11+14)}:dynamicRoute(e,used);
    routeCache.set(e.id,r);used.push(r);
  }
}
function route(e) { prepareRoutes();return routeCache.get(e.id); }
function render() {
  applyLocale();const t=tree(),match=query.trim()?new Set(matches().map(n=>n.id)):null;
  const related=new Set(selected?.kind==='node'?[selected.id]:[]);
  if(selected?.kind==='node')t.linkIds.map(edge).filter(e=>e.from===selected.id||e.to===selected.id).forEach(e=>{related.add(e.from);related.add(e.to);});
  $('paper-title').textContent=t.id==='main'?state.paper.title:t.title;document.title=$('paper-title').textContent;
  $('tree').innerHTML=state.graph.trees.map(v=>`<option value="${esc(v.id)}" ${v.id===t.id?'selected':''}>${esc(v.id==='main'?ui('mainTree'):v.title)}</option>`).join('');
  $('tree').classList.toggle('hidden',state.graph.trees.length<2);$('all').setAttribute('aria-pressed',all);$('all').classList.toggle('hidden',!t.linkIds.length);
  $('nodes').innerHTML=t.nodeIds.map(id=>{const n=node(id),p=position(id),views=memberships(id),kind=role(n);return `<article class="node role-${kind} ${id===t.rootId?'root':''} ${selected?.kind==='node'&&selected.id===id?'selected':''} ${match&&!match.has(id)?'dim':''} ${related.has(id)?'neighbor':''} ${nodeDrag?.id===id&&nodeDrag.started?'node-dragging':''} ${nodeDrag?.id===id&&collides(id,p)?'node-collision':''} ${newIds.has(id)?'new-node':''} ${changedIds.has(id)?'revised':''}" style="left:${p.x}px;top:${p.y}px" data-card="${esc(id)}">${glyph(n)}<button class="node-main" data-node="${esc(id)}" aria-label="${esc(n.label+' · '+(state.graph.locale.nodeTypes[n.type]||n.type))}" title="${esc(ui('dragHint'))}"><span style="max-width:${profile(n).labelWidth}px">${esc(n.label)}</span></button>${views.length>1?`<button class="shared" data-shared="${esc(id)}" aria-label="${esc(ui('sharedCount',{name:n.label,count:views.length}))}">↗ ${views.length}</button>`:''}</article>`;}).join('');
  prepareRoutes();
  $('edge-layer').innerHTML=t.linkIds.map(edge).filter(e=>all||e.primary!==false).map(e=>{const r=state.graph.relationTypes[e.relationType],p=route(e),text=displayLabel(e),w=Math.max(42,text.length*11+14),marker=r.directed===false?'':r.marker==='inhibit'?'inhibit':r.family==='causal'?'causal-arrow':r.family==='evidence'?'support-arrow':'arrow',style=r.family==='causal'?'causal':r.family==='evidence'?'support':['limitation','boundary'].includes(r.family)?'limitation':'',status=['hypothesis','unresolved','user'].includes(e.status)?'unconfirmed':'',focus=selected?.kind==='edge'&&selected.id===e.id||selected?.kind==='node'&&(e.from===selected.id||e.to===selected.id);return `<g class="edge-group ${focus?'selected focused':''} ${match&&(!match.has(e.from)||!match.has(e.to))?'dim':''}"><path class="edge ${style} ${status}" d="${esc(p.d)}" ${marker?`marker-end="url(#${marker})"`:''}></path><g class="edge-label" tabindex="0" role="button" data-edge="${esc(e.id)}" aria-label="${esc(ui('relationshipAria',{name:text}))}"><title>${esc(node(e.from).label+' — '+displayLabel(e)+' → '+node(e.to).label+'\n'+e.meaning)}</title><rect x="${p.x-w/2}" y="${p.y-12}" width="${w}" height="24"></rect><text x="${p.x}" y="${p.y+1}">${esc(text)}</text></g></g>`;}).join('');
  document.querySelectorAll('[data-node]').forEach(el=>{el.onclick=()=>{if(Date.now()>suppressClickUntil)select('node',el.dataset.node);};el.onpointerdown=e=>beginNodeDrag(e,el.dataset.node);el.onkeydown=e=>keyboardMove(e,el.dataset.node);});
  document.querySelectorAll('[data-shared]').forEach(el=>el.onclick=()=>{select('node',el.dataset.shared);$('other-trees')?.scrollIntoView({block:'nearest'});});
  document.querySelectorAll('[data-edge]').forEach(el=>{el.onclick=()=>select('edge',el.dataset.edge);el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select('edge',el.dataset.edge);}};});
  if(selected)details();resize();
}

/* Sidebar rendering is shared with the previous version; content and source IDs remain intact. */
function sources(refs){return refs?.length?refs.map(r=>{const s=state.sources.find(s=>s.id===r.sourceId);return `<div class="source"><b>${esc(s?.label||r.sourceId)} · ${esc(r.location||r.locator||'')}</b><p>${esc(r.excerpt||s?.note||'')}</p></div>`}).join(''):`<p>${esc(ui('noEvidence'))}</p>`}
function details(){if(!selected)return;let html='';if(selected.kind==='node'){const n=node(selected.id);if(!n){close();return}const links=tree().linkIds.map(edge).filter(e=>e.from===n.id||e.to===n.id),views=memberships(n.id).filter(t=>t.id!==activeTree),terms=termsFor(n);html=`<div class="detail-top"><span class="kind">${esc(state.graph.locale.nodeTypes[n.type]||n.type)}</span><button class="close" id="close" aria-label="${esc(ui('close'))}">×</button></div><h2>${esc(n.label)}</h2><p class="summary">${esc(n.detail||n.title)}</p>${terms.length?`<div class="section"><h3>${esc(ui('definitions'))}</h3>${terms.map(termDetails).join('')}</div>`:''}${views.length?`<div class="section" id="other-trees"><h3>${esc(ui('sharedHeading'))}</h3>${views.map(t=>`<button class="tree-link" data-tree-link="${esc(t.id)}" data-shared-id="${esc(n.id)}">${esc(t.id==='main'?state.paper.title:t.title)}</button>`).join('')}</div>`:''}<div class="section"><h3>${esc(ui('sources'))}</h3>${sources(nodeSources(n))}</div><div class="section"><h3>${esc(ui('nodeRole'))}</h3><p>${esc(ui('role'+role(n)[0].toUpperCase()+role(n).slice(1)))}</p></div>${n.limits?`<div class="section"><h3>${esc(ui('limits'))}</h3><div class="limit">${esc(n.limits)}</div></div>`:''}<div class="section"><h3>${esc(ui('connectedNodes'))}</h3>${links.map(e=>`<button class="related" data-related="${esc(e.id)}"><small>${esc(displayLabel(e))}</small>${esc(node(e.from===n.id?e.to:e.from)?.label)}</button>`).join('')}</div><div class="actions"><button class="action" id="extend">${esc(ui('extend'))}</button><button class="action" id="new-tree">${esc(ui('newTree'))}</button></div><div id="editor"></div>`}
else{const e=edge(selected.id);if(!e){close();return}const r=state.graph.relationTypes[e.relationType],conditions=e.context||JSON.stringify(e.qualifiers||{});html=`<div class="detail-top"><span class="kind">${esc(state.graph.locale.families[r.family]||r.family)}</span><button class="close" id="close" aria-label="${esc(ui('close'))}">×</button></div><h2>${esc(displayLabel(e))}</h2><p class="summary">${esc(e.meaning)}</p><div class="state">${esc(state.graph.locale.statuses[e.status])}</div><div class="section"><h3>${esc(ui('relationDefinition'))}</h3><p>${esc(state.graph.locale.relationDefinitions[e.relationType])}</p><p>${esc(ui(r.directed===false?'undirected':'directed'))}</p></div>${conditions&&conditions!=='{}'?`<div class="section"><h3>${esc(ui('conditions'))}</h3><p>${esc(conditions)}</p></div>`:''}<div class="section"><h3>${esc(ui('connectedNodes'))}</h3><button class="related" data-node-link="${esc(e.from)}"><small>${esc(ui('sourceNode'))}</small>${esc(node(e.from).label)}</button><button class="related" data-node-link="${esc(e.to)}"><small>${esc(ui('targetNode'))}</small>${esc(node(e.to).label)}</button></div><div class="section"><h3>${esc(ui('basis'))}</h3>${sources(e.sourceRefs)}</div><div class="section"><h3>${esc(ui('caution'))}</h3><div class="limit">${esc(ui('relationCaveat'))}</div></div>`}
$('details').innerHTML=html;$('close').onclick=close;document.querySelectorAll('[data-related]').forEach(el=>el.onclick=()=>select('edge',el.dataset.related));document.querySelectorAll('[data-node-link]').forEach(el=>el.onclick=()=>locate(el.dataset.nodeLink));document.querySelectorAll('[data-tree-link]').forEach(el=>el.onclick=()=>changeTree(el.dataset.treeLink,el.dataset.sharedId));if($('extend'))$('extend').onclick=()=>editor('extend');if($('new-tree'))$('new-tree').onclick=()=>editor('tree')}


function select(kind,id){selected={kind,id};layoutOpen=false;$('app').classList.add('open');render();requestAnimationFrame(()=>{if(!manualZoom)fit();if(kind==='node')centerNode(id);});}
function close(){selected=null;$('app').classList.remove('open');render();if(!manualZoom)requestAnimationFrame(fit);}
function changeTree(id,sharedId){activeTree=id;all=false;manualZoom=false;selected=sharedId?{kind:'node',id:sharedId}:null;routeCacheKey='';$('app').classList.toggle('open',!!selected);render();requestAnimationFrame(()=>{fit();if(sharedId)centerNode(sharedId);});}
function locate(id){const views=memberships(id),target=views.find(t=>t.id===activeTree)||views.find(t=>t.id==='main')||views[0];if(!target)return;activeTree=target.id;selected={kind:'node',id};$('app').classList.add('open');$('search-results').classList.add('hidden');manualZoom=false;routeCacheKey='';render();requestAnimationFrame(()=>{fit();centerNode(id);const el=document.querySelector(`[data-card="${CSS.escape(id)}"]`);el?.classList.add('located');});}
function centerNode(id){const card=document.querySelector(`[data-card="${CSS.escape(id)}"]`);if(!card)return;const r=card.getBoundingClientRect(),m=$('map').getBoundingClientRect();$('map').scrollBy({left:r.left+r.width/2-m.left-m.width/2,top:r.top+r.height/2-m.top-m.height/2,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});}
function geometry(){prepareRoutes();const ps=tree().nodeIds.map(position),rs=[...routeCache.values()];return {width:Math.max(980,...ps.map(p=>p.x+210),...rs.map(p=>p.bounds?.maxX||p.x+80)),height:Math.max(650,...ps.map(p=>p.y+slot().height+50),...rs.map(p=>p.bounds?.maxY||p.y+90))};}
function resize(){const g=geometry();$('board').style.width=g.width+'px';$('board').style.height=g.height+'px';$('board').style.transform=`scale(${zoom})`;$('edges').setAttribute('width',g.width);$('edges').setAttribute('height',g.height);$('extent').style.width=g.width*zoom+'px';$('extent').style.height=g.height*zoom+'px';}
function fit(){if(nodeDrag?.started)return;const g=geometry();zoom=Math.max(.65,Math.min(1.3,($('map').clientWidth-24)/g.width,($('map').clientHeight-28)/g.height));resize();}
function freeSpot(id){const base=position(id),occupied=tree().nodeIds.map(position),angles=[0,.65,-.65,1.3,-1.3,Math.PI,.65+Math.PI,-.65+Math.PI];for(let radius=310;radius<2200;radius+=150)for(const angle of angles){const p={x:Math.round(base.x+Math.cos(angle)*radius),y:Math.round(base.y+Math.sin(angle)*radius)};if(p.x<30||p.y<40)continue;if(occupied.every(q=>Math.abs(q.x-p.x)>210||Math.abs(q.y-p.y)>slot().height+30))return p;}return {x:base.x+220,y:Math.max(...occupied.map(p=>p.y))+slot().height+70};}
function editor(mode){const root=node(selected.id);$('editor').innerHTML=`<form class="editor" id="edit-form"><label for="new-label">${esc(ui(mode==='tree'?'newTreeName':'newNodeName'))}</label><input id="new-label" required maxlength="80" value="${mode==='tree'?esc(ui('extendedContext',{name:root.label})):''}">${mode==='extend'?`<label for="new-type">${esc(ui('nodeKind'))}</label><select id="new-type">${['concept','method','term','question','claim','observation','limit'].map(type=>`<option value="${type}">${esc(state.graph.locale.nodeTypes[type])}</option>`).join('')}</select><label for="new-relation">${esc(ui('relation'))}</label><input id="new-relation" required value="${esc(state.graph.locale.relationLabels.requires_concept||state.graph.locale.relationLabels.note)}"><label for="new-detail">${esc(ui('detail'))}</label><textarea id="new-detail"></textarea>`:''}<button class="action" type="submit">${esc(ui(mode==='tree'?'create':'connect'))}</button><button class="action" type="button" id="cancel">${esc(ui('cancel'))}</button></form>`;$('new-label').focus();$('cancel').onclick=()=>$('editor').innerHTML='';$('edit-form').onsubmit=e=>{e.preventDefault();const text=$('new-label').value.trim();if(!text)return;const id=(crypto.randomUUID?.()||Date.now().toString()).replaceAll('-','');if(mode==='tree'){const v={id:'tree-'+id,title:text,focusQuestion:text,rootId:root.id,nodeIds:[root.id],linkIds:[],positions:{[root.id]:{x:400,y:220}},routes:{}};state.graph.trees.push(v);localDraftRevision++;persist();changeTree(v.id,root.id)}else{const relation=$('new-relation').value.trim(),detail=$('new-detail').value.trim();if(!relation)return;const newType=$('new-type').value||'concept';const n={id:'node-'+id,label:text,title:text,type:newType,visualRole:state.graph.nodeShapes.typeRoles[newType]||'concept',detail:detail||ui('draftDetail'),limits:ui('draftLimits'),sourceRefs:[],termIds:[],aliases:[],provenance:'user-note'},p=freeSpot(root.id),link={id:'link-'+id,from:root.id,to:n.id,relationType:'note',label:'note',meaning:root.label+' → '+relation+' → '+text,originalLabels:[relation],status:'user',primary:true,sourceRefs:[]};state.graph.nodes.push(n);state.graph.links.push(link);tree().nodeIds.push(n.id);tree().linkIds.push(link.id);tree().positions[n.id]=p;localDraftRevision++;newIds=new Set([n.id]);persist();query='';$('search').value='';locate(n.id)}notice(ui(mode==='tree'?'treeCreated':'nodeAdded'))}}


function collides(id,p){const size=profile(node(id)),box={x:p.x+(slot().width-size.width)/2,y:p.y+(slot().height-size.height)/2,w:size.width,h:size.height};return tree().nodeIds.some(other=>{if(other===id)return false;const q=position(other),otherSize=profile(node(other)),x=q.x+(slot().width-otherSize.width)/2,y=q.y+(slot().height-otherSize.height)/2;return box.x<x+otherSize.width+8&&box.x+box.w>x-8&&box.y<y+otherSize.height+8&&box.y+box.h>y-8;});}
function beginNodeDrag(e,id){if(e.button!==0)return;e.stopPropagation();pan=null;nodeDrag={id,treeId:tree().id,pointerId:e.pointerId,x:e.clientX,y:e.clientY,scrollLeft:$('map').scrollLeft,scrollTop:$('map').scrollTop,start:clone(position(id)),previous:clone(customPositions[tree().id]?.[id]||null),scale:zoom,started:false};}
function moveNodeDrag(e){if(!nodeDrag||e.pointerId!==nodeDrag.pointerId)return;const dx=(e.clientX-nodeDrag.x+$('map').scrollLeft-nodeDrag.scrollLeft)/nodeDrag.scale,dy=(e.clientY-nodeDrag.y+$('map').scrollTop-nodeDrag.scrollTop)/nodeDrag.scale;if(!nodeDrag.started&&Math.hypot(dx,dy)<4)return;if(!nodeDrag.started)$('map').setPointerCapture?.(e.pointerId);nodeDrag.started=true;manualZoom=true;selected={kind:'node',id:nodeDrag.id};(customPositions[nodeDrag.treeId]||={})[nodeDrag.id]={x:Math.max(4,Math.round(nodeDrag.start.x+dx)),y:Math.max(4,Math.round(nodeDrag.start.y+dy))};routeCacheKey='';render();}
function endNodeDrag(e,cancel=false){if(!nodeDrag||e.pointerId!==nodeDrag.pointerId)return;const drag=nodeDrag,collision=drag.started&&collides(drag.id,position(drag.id));nodeDrag=null;$('map').releasePointerCapture?.(e.pointerId);if(!drag.started)return;if(cancel||collision){if(drag.previous)(customPositions[drag.treeId]||={})[drag.id]=drag.previous;else{delete customPositions[drag.treeId]?.[drag.id];if(!Object.keys(customPositions[drag.treeId]||{}).length)delete customPositions[drag.treeId];}if(collision&&!cancel)notice(ui('layoutCollision'));}else{layoutOpen=true;notice(ui('layoutUnsaved'));}suppressClickUntil=Date.now()+300;routeCacheKey='';render();}
function keyboardMove(e,id){if(!e.altKey||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const p=position(id),step=e.shiftKey?5:20,dx=e.key==='ArrowLeft'?-step:e.key==='ArrowRight'?step:0,dy=e.key==='ArrowUp'?-step:e.key==='ArrowDown'?step:0,next={x:Math.max(4,p.x+dx),y:Math.max(4,p.y+dy)};if(collides(id,next)){notice(ui('layoutCollision'));return;}(customPositions[tree().id]||={})[id]=next;manualZoom=true;layoutOpen=true;routeCacheKey='';render();document.querySelector(`[data-node="${CSS.escape(id)}"]`)?.focus();}

$('layout-toggle').onclick=()=>{layoutOpen=!layoutOpen;renderLayout();};
$('save-layout').onclick=saveLayout;$('default-layout').onclick=defaultLayout;
$('curve-mode').onclick=()=>setEdgeMode('curve');$('straight-mode').onclick=()=>setEdgeMode('straight');
$('tree').onchange=e=>changeTree(e.target.value);$('all').onclick=()=>{all=!all;render();};
$('search').oninput=e=>{query=e.target.value;render();searchResults();};$('search').onfocus=searchResults;
$('search').onkeydown=e=>{if(e.key==='Enter'){const found=matches()[0];if(found){e.preventDefault();locate(found.id);}}};
document.addEventListener('click',e=>{if(!e.target.closest('.search-wrap'))$('search-results').classList.add('hidden');});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(nodeDrag)endNodeDrag({pointerId:nodeDrag.pointerId},true);layoutOpen=false;$('search-results').classList.add('hidden');close();}});
$('map').addEventListener('pointerdown',e=>{if(e.target.closest('button,[data-edge],.layout-panel')||e.button!==0)return;pan={x:e.clientX,y:e.clientY,left:$('map').scrollLeft,top:$('map').scrollTop,moved:false};$('map').classList.add('dragging');});
window.addEventListener('pointermove',e=>{if(nodeDrag){moveNodeDrag(e);return;}if(!pan)return;const dx=e.clientX-pan.x,dy=e.clientY-pan.y;if(Math.abs(dx)+Math.abs(dy)>5)pan.moved=true;$('map').scrollLeft=pan.left-dx;$('map').scrollTop=pan.top-dy;});
window.addEventListener('pointerup',e=>{if(nodeDrag){endNodeDrag(e);return;}if(!pan)return;const moved=pan.moved;pan=null;$('map').classList.remove('dragging');if(!moved&&selected)close();});
window.addEventListener('pointercancel',e=>{if(nodeDrag)endNodeDrag(e,true);pan=null;$('map').classList.remove('dragging');});
window.addEventListener('beforeunload',e=>{if(layoutDirty()){e.preventDefault();e.returnValue='';}});
window.addEventListener('storage',e=>{if(e.key===layoutKey&&!nodeDrag&&!layoutDirty()){savedPositions={};customPositions={};edgeMode=savedEdgeMode='curve';restoreLayout();routeCacheKey='';render();}});
$('map').addEventListener('wheel',e=>{if(!e.ctrlKey||nodeDrag)return;e.preventDefault();manualZoom=true;const old=zoom,r=$('map').getBoundingClientRect(),px=e.clientX-r.left,py=e.clientY-r.top;zoom=Math.max(.5,Math.min(1.8,zoom*(e.deltaY<0?1.09:.92)));const ratio=zoom/old,x=($('map').scrollLeft+px)*ratio-px,y=($('map').scrollTop+py)*ratio-py;resize();$('map').scrollLeft=x;$('map').scrollTop=y;},{passive:false});

window.getPaperMapState=()=>clone(state);
window.getPaperMapLayout=()=>({paperId:state.paper.id,positions:clone(customPositions),edgeMode,dirty:layoutDirty()});
window.updatePaperMap=function(next){validate(next);if(next.artifact&&BOOT.artifact&&next.artifact.templateSha256!==BOOT.artifact.templateSha256){notice(ui('templateMismatch'));return false;}if(next.paper.id!==state.paper.id||next.revision<=canonicalRevision)return false;if(nodeDrag)return false;if(localDraftRevision){persist();notice(ui('draftSaved'));}const old=new Map(state.graph.nodes.map(n=>[n.id,JSON.stringify([n,termsFor(n)])]));newIds=new Set(next.graph.nodes.filter(n=>!old.has(n.id)).map(n=>n.id));changedIds=new Set(next.graph.nodes.filter(n=>old.has(n.id)&&JSON.stringify([n,(next.glossary||[]).filter(t=>(n.termIds||[]).includes(t.id))])!==old.get(n.id)).map(n=>n.id));if(selected){const redirects=selected.kind==='node'?next.graph.redirects:next.graph.linkRedirects,seen=new Set();while(redirects?.[selected.id]&&!seen.has(selected.id)){seen.add(selected.id);selected.id=redirects[selected.id];}}state=clone(next);canonicalRevision=next.revision;localDraftRevision=0;customPositions=cleanPositions(customPositions);savedPositions=cleanPositions(savedPositions);if(!state.graph.trees.some(t=>t.id===activeTree))activeTree='main';routeCacheKey='';render();setTimeout(()=>{newIds.clear();changedIds.clear();document.querySelectorAll('.new-node,.revised').forEach(el=>el.classList.remove('new-node','revised'));},1900);return true;};
async function refresh(){if(!/^https?:$/.test(location.protocol)||sourceUnavailable)return;try{const response=await fetch('paper-state.json',{cache:'no-store'});if(!response.ok){sourceUnavailable=true;return;}const next=await response.json();if(next.revision>canonicalRevision)window.updatePaperMap(next);}catch(_){sourceUnavailable=true;}}
validate(state);restoreLayout();render();requestAnimationFrame(fit);
new ResizeObserver(()=>{if(!manualZoom&&!nodeDrag)fit();}).observe($('map'));
refresh();setInterval(refresh,2000);
