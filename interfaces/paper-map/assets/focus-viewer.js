/* Selection colors encode direction relative to the selected node, never evidence. */
function directionFor(e,id){
 if(!id||(e.from!==id&&e.to!==id))return '';
 if(relationStyle(e).directed===false)return 'undirected';
 if(e.from===id&&e.to===id)return 'self';
 return e.to===id?'incoming':'outgoing';
}
function focusContext(){
 const id=selected?.kind==='node'?selected.id:null,roles=new Map(),related=new Set(id?[id]:[]);
 if(id)for(const e of tree().linkIds.map(edge)){
  const direction=directionFor(e,id);if(!direction)continue;
  related.add(e.from);related.add(e.to);
  const other=e.from===id?e.to:e.from;if(other===id)continue;
  if(!roles.has(other))roles.set(other,new Set());roles.get(other).add(direction);
 }
 const neighbors=new Map([...roles].map(([key,set])=>[key,set.has('incoming')&&set.has('outgoing')?'both':set.has('outgoing')?'outgoing':set.has('incoming')?'incoming':'undirected']));
 return {id,related,neighbors};
}
function endpointText(e){return node(e.from).label+(relationStyle(e).directed===false?' ↔ ':relationStyle(e).marker==='inhibit'?' ⊣ ':' → ')+node(e.to).label;}
function renderEdge(e,context,match){
 const r=relationStyle(e),p=route(e),text=displayLabel(e),w=Math.max(42,text.length*11+14),direction=directionFor(e,context.id);
 const focused=!!direction||selected?.kind==='edge'&&selected.id===e.id;
 const marker=r.directed===false?'':direction?'focus-'+direction+(r.marker==='inhibit'?'-inhibit':'-arrow'):r.marker==='inhibit'?'inhibit':r.family==='causal'?'causal-arrow':r.family==='evidence'?'support-arrow':'arrow';
 const family=r.family==='causal'?'causal':r.family==='evidence'?'support':['limitation','boundary'].includes(r.family)?'limitation':'';
 const status=['hypothesis','unresolved','user'].includes(e.status)?'unconfirmed':'';
 const dim=context.id?!direction:match&&(!match.has(e.from)||!match.has(e.to));
 const hint=ui('connectionAria',{endpoints:endpointText(e),relation:text,direction:direction?ui('direction'+direction[0].toUpperCase()+direction.slice(1)):ui(r.directed===false?'undirected':'directed')});
 return `<g class="edge-group ${focused?'selected focused':''} ${direction?'direction-'+direction:''} ${dim?'dim':''}" data-edge-group="${esc(e.id)}" data-direction="${esc(direction)}">${focused?`<path class="edge-halo" d="${esc(p.d)}" aria-hidden="true"></path>`:''}<path class="edge ${family} ${status}" data-edge-path="${esc(e.id)}" d="${esc(p.d)}" ${marker?`marker-end="url(#${marker})"`:''}></path><g class="edge-label" tabindex="0" role="button" data-edge="${esc(e.id)}" aria-label="${esc(hint)}"><title>${esc(hint+'\n'+e.meaning)}</title><rect x="${p.x-w/2}" y="${p.y-12}" width="${w}" height="24"></rect><text x="${p.x}" y="${p.y+1}">${esc(text)}</text></g></g>`;
}
function connectionGroups(n,links){
 const parts=['incoming','outgoing','self','undirected'].map(direction=>{
  const members=links.filter(e=>directionFor(e,n.id)===direction);if(!members.length)return '';
  return `<section class="connection-group direction-${direction}"><h4>${esc(ui('direction'+direction[0].toUpperCase()+direction.slice(1)))}</h4>${members.map(e=>`<button class="related" data-related="${esc(e.id)}"><small>${esc(displayLabel(e))}</small><span>${esc(endpointText(e))}</span></button>`).join('')}</section>`;
 }).join('');
 return parts?`<div class="section connection-groups"><h3>${esc(ui('connectedNodes'))}</h3>${parts}</div>`:'';
}
