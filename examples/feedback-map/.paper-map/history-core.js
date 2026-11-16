/* Portable data/history contract. No DOM, storage, renderer, or network dependencies. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PaperMapHistory=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const FORMAT='paper-map-history',VERSION=1,MAX_BYTES=64*1024*1024;
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const copy=v=>JSON.parse(JSON.stringify(v));
function set(o,k,v){Object.defineProperty(o,k,{value:v,writable:true,enumerable:true,configurable:true});}
function stable(v){if(v===null||typeof v!=='object')return JSON.stringify(v);if(Array.isArray(v))return '['+v.map(stable).join(',')+']';return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}';}
function utf8(text){if(typeof TextEncoder!=='undefined')return new TextEncoder().encode(text);const out=[];for(const c of text){const n=c.codePointAt(0);if(n<128)out.push(n);else if(n<2048)out.push(192|(n>>6),128|(n&63));else if(n<65536)out.push(224|(n>>12),128|((n>>6)&63),128|(n&63));else out.push(240|(n>>18),128|((n>>12)&63),128|((n>>6)&63),128|(n&63));}return new Uint8Array(out);}
function sha256(text){
 const src=utf8(text),data=new Uint8Array(Math.ceil((src.length+9)/64)*64);data.set(src);data[src.length]=128;
 const dv=new DataView(data.buffer);dv.setUint32(data.length-8,Math.floor(src.length/0x20000000));dv.setUint32(data.length-4,(src.length*8)>>>0);
 const k=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
 let h=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];const rr=(x,n)=>(x>>>n)|(x<<(32-n)),w=new Uint32Array(64);
 for(let offset=0;offset<data.length;offset+=64){for(let i=0;i<16;i++)w[i]=dv.getUint32(offset+i*4);for(let i=16;i<64;i++){const a=w[i-15],b=w[i-2];w[i]=(w[i-16]+(rr(a,7)^rr(a,18)^(a>>>3))+w[i-7]+(rr(b,17)^rr(b,19)^(b>>>10)))>>>0;}
  let [a,b,c,d,e,f,g,j]=h;for(let i=0;i<64;i++){const t1=(j+(rr(e,6)^rr(e,11)^rr(e,25))+((e&f)^(~e&g))+k[i]+w[i])>>>0,t2=((rr(a,2)^rr(a,13)^rr(a,22))+((a&b)^(a&c)^(b&c)))>>>0;j=g;g=f;f=e;e=(d+t1)>>>0;d=c;c=b;b=a;a=(t1+t2)>>>0;}h=h.map((v,i)=>(v+[a,b,c,d,e,f,g,j][i])>>>0);
 }
 return h.map(x=>x.toString(16).padStart(8,'0')).join('');
}
const hash=v=>sha256(stable(v));
function indexed(items){const out={};for(const item of items||[]){if(!item||typeof item.id!=='string'||!item.id||own(out,item.id))throw Error('Invalid or duplicate record ID');set(out,item.id,copy(item));}return out;}
function pack(snapshot,positions={},preferences={}){
 const m={};for(const k of ['schemaVersion','revision','paper','settings','sources','glossary','graph'])if(own(snapshot,k))set(m,k,copy(snapshot[k]));
 for(const key of ['sources','glossary'])m[key]=indexed(m[key]||[]);
 const original=m.graph;if(!original)throw Error('Missing graph');const g={};for(const k of ['nodes','links','trees','relationTypes','nodeTypes','nodeShapes','locale','redirects','linkRedirects','relationExtensions'])if(own(original,k))set(g,k,original[k]);m.graph=g;g.treeOrder=g.trees.map(t=>t.id);
 for(const t of g.trees){delete t.routes;delete t.detailRoutes;
  for(const [key,values] of Object.entries(positions)){let pair;try{pair=JSON.parse(key);}catch(_){pair=[key,null];}if(!Array.isArray(pair)||pair[0]!==t.id)continue;const target=pair[1]&&t.detailViews?.[pair[1]]||t;target.positions||=Object.fromEntries(target.nodeIds.map(id=>[id,copy(t.positions[id])]));for(const [id,p] of Object.entries(values||{}))if(target.nodeIds.includes(id))target.positions[id]=copy(p);}
 }
 for(const e of g.links){delete e.semanticKey;delete e.displayLabel;delete e.displayStatusSuffix;}
 for(const key of ['nodes','links','trees'])g[key]=indexed(g[key]);
 m.preferences={edgeMode:'curve',detailMode:'high',activeTree:'main',...preferences};validateModel(m);return m;
}
function unpack(model){
 validateModel(model);const s=copy(model);delete s.preferences;
 for(const key of ['sources','glossary'])s[key]=Object.values(s[key]);const order=s.graph.treeOrder;delete s.graph.treeOrder;
 s.graph.nodes=Object.values(s.graph.nodes);s.graph.links=Object.values(s.graph.links);s.graph.trees=order.map(id=>({...s.graph.trees[id],routes:{}}));return s;
}
function validateModel(m){
 if(!m||m.schemaVersion!==2||typeof m.paper?.id!=='string'||typeof m.paper.title!=='string'||!m.paper.title||!m.graph)throw Error('Invalid map model');
 const g=m.graph;if(!g.nodes||!g.links||!g.trees||!Array.isArray(g.treeOrder)||!own(g.trees,'main')||new Set(g.treeOrder).size!==g.treeOrder.length||g.treeOrder.length!==Object.keys(g.trees).length)throw Error('Invalid view collection');
 if(!g.locale?.ui||!g.relationTypes||!g.nodeShapes?.roles||!g.nodeShapes.slot)throw Error('Missing map definitions');
 const roles=['concept','method','entity','proposition'];if(g.nodeShapes.slot.width!==170||g.nodeShapes.slot.height!==116)throw Error('Unsupported shape slot');
 for(const role of roles){const p=g.nodeShapes.roles[role];if(!p||!['rectangle','ellipse','circle','hexagon'].includes(p.shape)||['width','height','labelWidth'].some(k=>!Number.isFinite(p[k])||p[k]<=0||p[k]>1000))throw Error('Invalid shape profile');}
 for(const value of Object.values(g.nodeShapes.typeRoles||{}))if(!roles.includes(value))throw Error('Invalid shape role');
 for(const [id,n] of Object.entries(g.nodes)){if(n.id!==id||typeof n.label!=='string'||!n.label||typeof n.title!=='string'||!n.title||typeof n.type!=='string'||!roles.includes(n.visualRole||g.nodeShapes.typeRoles[n.type]||'concept'))throw Error('Invalid node');for(const tid of n.termIds||[])if(!own(m.glossary,tid))throw Error('Missing glossary term');}
 for(const [id,e] of Object.entries(g.links))if(e.id!==id||typeof e.from!=='string'||typeof e.to!=='string'||typeof e.relationType!=='string'||!own(g.nodes,e.from)||!own(g.nodes,e.to)||!own(g.relationTypes,e.relationType)||!g.locale.statuses?.[e.status])throw Error('Invalid relationship');
 for(const id of g.treeOrder){const t=g.trees[id];if(!t||t.id!==id||!t.title||!Array.isArray(t.nodeIds)||!t.nodeIds.length||!Array.isArray(t.linkIds)||new Set(t.nodeIds).size!==t.nodeIds.length||new Set(t.linkIds).size!==t.linkIds.length)throw Error('Invalid view');
  if((t.kind||'narrative')==='catalog'){if(id==='main'||t.rootId!=null||!t.topicDescription)throw Error('Invalid catalog');}else if(!t.nodeIds.includes(t.rootId))throw Error('Missing view root');
  for(const n of t.nodeIds){if(typeof n!=='string'||!own(g.nodes,n))throw Error('Missing view node');const p=t.positions?.[n];if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y)||Math.abs(p.x)>1e7||Math.abs(p.y)>1e7)throw Error('Invalid position');}
  for(const e of t.linkIds){const link=g.links[e];if(typeof e!=='string'||!link||!t.nodeIds.includes(link.from)||!t.nodeIds.includes(link.to))throw Error('Relationship outside view');}
  if(t.detailViews){const detail=typeof PaperMapDetail!=='undefined'?PaperMapDetail:typeof require==='function'?require('./detail-core.js'):null;if(!detail)throw Error('This reader lacks the fixed detail-view capability');detail.validate(t,g);}
 }
 if(!['curve','straight'].includes(m.preferences?.edgeMode)||!['low','medium','high'].includes(m.preferences?.detailMode)||!own(g.trees,m.preferences.activeTree))throw Error('Invalid view preferences');return true;
}
function diff(a,b,path=[],ops=[]){
 if(stable(a)===stable(b))return ops;
 const objects=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
 if(objects(a)&&objects(b)){for(const k of Object.keys(a).sort())if(!own(b,k))ops.push({op:'remove',path:[...path,k]});for(const k of Object.keys(b).sort()){if(!own(a,k))ops.push({op:'set',path:[...path,k],value:copy(b[k])});else diff(a[k],b[k],[...path,k],ops);}}
 else ops.push({op:'set',path,value:copy(b)});return ops;
}
function apply(model,ops){
 let value=copy(model);if(!Array.isArray(ops)||ops.length>200000)throw Error('Invalid patch');
 for(const op of ops){if(!['set','remove'].includes(op.op)||!Array.isArray(op.path)||op.path.some(k=>typeof k!=='string'))throw Error('Invalid patch operation');
  if(!op.path.length){if(op.op!=='set')throw Error('Cannot remove model');value=copy(op.value);continue;}
  let target=value;for(const k of op.path.slice(0,-1)){if(!target||typeof target!=='object'||!own(target,k)||Array.isArray(target))throw Error('Invalid patch path');target=target[k];}
  const key=op.path.at(-1);if(!target||typeof target!=='object'||Array.isArray(target))throw Error('Invalid patch target');if(op.op==='remove'){if(!own(target,key))throw Error('Missing patch target');delete target[key];}else set(target,key,copy(op.value));
 }return value;
}
function seal(h){const out=copy(h);delete out.checksum;out.checksum=hash(out);return out;}
function create(model){validateModel(model);return seal({format:FORMAT,formatVersion:VERSION,modelVersion:1,base:copy(model),baseHash:hash(model),commits:[],cursor:0});}
function materialize(h,index=h.cursor){
 if(!Number.isInteger(index)||index<0||index>h.commits.length)throw Error('Invalid saved version');let m=copy(h.base);for(let i=0;i<index;i++)m=apply(m,h.commits[i].patch);return m;
}
function commit(history,model,at=new Date().toISOString(),kind='user-save'){
 validateModel(model);const h=copy(history),latest=materialize(h,h.commits.length),patch=diff(latest,model);
 if(patch.length){const c={id:h.commits.length+1,at,hash:hash(model),patch};if(h.cursor!==h.commits.length)c.origin=h.cursor;if(kind!=='user-save')c.kind=kind;h.commits.push(c);}
 h.cursor=h.commits.length;return seal(h);
}
function navigate(h,index){materialize(h,index);return seal({...copy(h),cursor:index});}
function verify(h){
 if(!h||h.format!==FORMAT||h.formatVersion!==VERSION||h.modelVersion!==1)throw Error('Unsupported history format/version');
 if(!Array.isArray(h.commits)||h.commits.length>100000||!Number.isInteger(h.cursor)||h.cursor<0||h.cursor>h.commits.length)throw Error('Invalid history index');
 const content=copy(h);delete content.checksum;if(hash(content)!==h.checksum||hash(h.base)!==h.baseHash)throw Error('History checksum mismatch');validateModel(h.base);let model=copy(h.base);
 for(let i=0;i<h.commits.length;i++){const c=h.commits[i],origin=c.origin??i;if(c.id!==i+1||!Number.isInteger(origin)||origin<0||origin>i||typeof c.at!=='string')throw Error('Invalid version chain');model=apply(model,c.patch);validateModel(model);if(c.hash!==hash(model))throw Error('Saved version checksum mismatch');}
 return true;
}
function stringify(h){verify(h);const text=stable(h);if(text.length>MAX_BYTES||utf8(text).length>MAX_BYTES)throw Error('History file exceeds supported size; no versions were removed');return text;}
function parse(text){if(typeof text!=='string'||text.length>MAX_BYTES||utf8(text).length>MAX_BYTES)throw Error('History file exceeds supported size');const h=JSON.parse(text);verify(h);return h;}
return {FORMAT,VERSION,MAX_BYTES,stable,hash,sha256,copy,pack,unpack,validateModel,diff,apply,create,commit,navigate,materialize,verify,stringify,parse};
});
