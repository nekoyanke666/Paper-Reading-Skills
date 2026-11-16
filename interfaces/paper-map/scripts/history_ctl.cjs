/* Inspect or materialize the frozen v1 format without a browser or network. */
const fs=require('node:fs'),path=require('node:path'),H=require('../assets/history-core.js'),D=require('../assets/detail-core.js');
try{
 const [command,file,out,indexText]=process.argv.slice(2);if(!['check','materialize'].includes(command)||!file)throw Error('Usage: node history_ctl.cjs check FILE | materialize FILE OUTPUT [ZERO_BASED_VERSION]');
 const archive=H.parse(fs.readFileSync(path.resolve(file),'utf8')),index=indexText===undefined?archive.cursor:Number(indexText),model=H.materialize(archive,index);for(const tree of Object.values(model.graph.trees))D.validate(tree,model.graph);
 if(command==='materialize'){if(!out)throw Error('An output path is required');const target=path.resolve(out);if(target===path.resolve(file))throw Error('The archive cannot be overwritten by a materialized snapshot');fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,JSON.stringify(H.unpack(model),null,2)+'\n','utf8');}
 console.log(JSON.stringify({format:archive.format,formatVersion:archive.formatVersion,modelVersion:archive.modelVersion,paperId:model.paper.id,savedVersions:archive.commits.length+1,currentVersion:index+1,nodes:Object.keys(model.graph.nodes).length,trees:model.graph.treeOrder.length}));
}catch(error){console.error(error.message);process.exitCode=1;}
