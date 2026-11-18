/* Text stays Markdown/TeX in the model; only the sidebar receives rendered HTML. */
(function(root,factory){
 const api=typeof module==='object'&&module.exports?factory(require('./vendor/marked/marked.umd.js'),require('./vendor/katex/katex.min.js')):factory(root.marked,root.katex);
 if(typeof module==='object'&&module.exports)module.exports=api;else root.PaperMapRichText=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(marked,katex){
 const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function linkURL(value){
  const href=String(value||'').trim();
  if(/[\u0000-\u0020\u007f\\]/.test(href))return null;
  return /^(?:https?:\/\/[^/]+|mailto:[^@]+@[^@]+|#[\w:.-]+)$/i.test(href)||/^https?:\/\/[^/]+\/[^\s]*$/i.test(href)?href:null;
 }
 function mathHTML(tex,display,raw){
  try{return katex.renderToString(tex,{displayMode:display,output:'htmlAndMathml',throwOnError:true,trust:false,maxExpand:1000,maxSize:20,macros:{}});}
  catch(_){return '<code class="math-source">'+escape(raw)+'</code>';}
 }
 function closing(source,begin,end,multiline){
  let at=begin;
  while((at=source.indexOf(end,at))!==-1){
   let slashes=0;for(let i=at-1;i>=0&&source[i]==='\\';i--)slashes++;
   if(slashes%2){at+=end.length;continue;}
   if(!multiline&&source.slice(begin,at).includes('\n'))return -1;
   return at;
  }
  return -1;
 }
 function readMath(source,block){
  const pairs=block?[['$$','$$',true],['\\[','\\]',true]]:[['$$','$$',true],['\\[','\\]',true],['\\(','\\)',false],['$','$',false]];
  for(const [open,end,display] of pairs){
   if(!source.startsWith(open))continue;
   const at=closing(source,open.length,end,display),text=at<0?'':source.slice(open.length,at);
   if(at<0||!text.trim()||open==='$'&&(/^\s|\s$/.test(text)))return undefined;
   const raw=source.slice(0,at+end.length);
   return {type:block?'displayMath':'inlineMath',raw,text,display};
  }
 }
 const parser=new marked.Marked({gfm:true,breaks:false,async:false,renderer:{
  html(token){return escape(token.text);},
  link(token){const text=this.parser.parseInline(token.tokens),href=linkURL(token.href);return href?'<a href="'+escape(href)+'" target="_blank" rel="noopener noreferrer">'+text+'</a>':text;},
  image(token){return escape(token.text||'');},
  code(token){
   if((token.lang||'').trim().toLowerCase()==='math')return mathHTML(token.text,true,token.text)+'\n';
   return '<pre><code>'+escape(token.text)+'</code></pre>\n';
  }
 },extensions:[
  {name:'displayMath',level:'block',start:source=>source.search(/(?:^|\n)(?:\$\$|\\\[)/),tokenizer(source){return readMath(source,true);},renderer:token=>mathHTML(token.text,true,token.raw)+'\n'},
  {name:'inlineMath',level:'inline',start:source=>source.search(/\$|\\[([]/),tokenizer(source){return readMath(source,false);},renderer:token=>mathHTML(token.text,token.display,token.raw)}
 ]});
 const cache=new Map();let cachedSize=0;const CACHE_LIMIT=2*1024*1024;
 function render(value){
  const source=String(value??'');if(cache.has(source))return cache.get(source);
  let html;try{html=parser.parse(source);}catch(_){html='<p>'+escape(source).replace(/\n/g,'<br>')+'</p>';}
  const size=source.length+html.length;
  if(size<=CACHE_LIMIT){while(cache.size>=128||cachedSize+size>CACHE_LIMIT){const [key,item]=cache.entries().next().value;cachedSize-=key.length+item.length;cache.delete(key);}cache.set(source,html);cachedSize+=size;}
  return html;
 }
 return {render,linkURL};
});
