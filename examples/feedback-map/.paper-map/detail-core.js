/* Three independent views of globally shared node/relationship records. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PaperMapDetail=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const LEVELS=['low','medium','high'],table=items=>Array.isArray(items)?Object.fromEntries(items.map(v=>[v.id,v])):items;
function selected(tree,level){
 const p=tree.detailViews?.[level]||tree;
 return {nodeIds:[...p.nodeIds],linkIds:[...p.linkIds],rootId:p.rootId??tree.rootId,focusQuestion:p.focusQuestion||tree.focusQuestion,positions:{...Object.fromEntries(p.nodeIds.map(id=>[id,tree.positions[id]])),...(p.positions||{})}};
}
function validate(tree,graph){
 if(!tree.detailViews)return true;
 const links=table(graph.links),seenNodes=new Set(),seenLinks=new Set();
 for(const level of LEVELS){if(!tree.detailViews[level])throw Error('Each detail mode needs its own view');const p=selected(tree,level);
  if(!p.nodeIds.length||new Set(p.nodeIds).size!==p.nodeIds.length||new Set(p.linkIds).size!==p.linkIds.length||p.nodeIds.some(id=>!tree.nodeIds.includes(id))||p.linkIds.some(id=>!tree.linkIds.includes(id)))throw Error('Detail views must reference globally shared records');
  const edges=p.linkIds.map(id=>links[id]);for(const e of edges)if(!e||!p.nodeIds.includes(e.from)||!p.nodeIds.includes(e.to))throw Error('A detail relationship endpoint is absent');
  for(const id of p.nodeIds){const xy=p.positions[id];if(!xy||!Number.isFinite(xy.x)||!Number.isFinite(xy.y)||Math.abs(xy.x)>1e7||Math.abs(xy.y)>1e7)throw Error('Invalid detail position');seenNodes.add(id);}p.linkIds.forEach(id=>seenLinks.add(id));
  if((tree.kind||'narrative')==='narrative'){if(!p.nodeIds.includes(p.rootId))throw Error('Detail view needs its own visible reading start');const seen=new Set([p.rootId]);for(let pass=0;pass<p.nodeIds.length;pass++)for(const e of edges)if(seen.has(e.from)||seen.has(e.to)){seen.add(e.from);seen.add(e.to);}if(p.nodeIds.some(id=>!seen.has(id)))throw Error('Detail view breaks the research path');}
 }
 if(tree.nodeIds.some(id=>!seenNodes.has(id))||tree.linkIds.some(id=>!seenLinks.has(id)))throw Error('An active record is absent from every detail view');return true;
}
function view(tree,graph,level){if(!LEVELS.includes(level))throw Error('Unknown detail mode');validate(tree,graph);const p=selected(tree,level),links=table(graph.links);return {...p,links:p.linkIds.map(id=>links[id]),reviewed:!!tree.detailViews};}
return {LEVELS,selected,validate,view};
});
