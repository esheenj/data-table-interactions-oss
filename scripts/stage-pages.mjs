// Source-only, reproducible public Data Table demo staging; never publishes.
import {lstat,mkdir,copyFile,writeFile,readFile,readdir,realpath,rm} from "node:fs/promises";
import {resolve,dirname,join,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {createHash} from "node:crypto";

const ROOT=fileURLToPath(new URL("../",import.meta.url));
const FILES=Object.freeze([
  "index.html","src/app.mjs","src/table.mjs","src/export.mjs","examples/data.mjs"
]);
function fail(reason){throw Error("TABLE_PAGES_STAGE_"+reason);}
async function realSource(root,path){
 let current=root;
 for(const segment of path.split("/")){
   current=join(current,segment);
   const info=await lstat(current);
   if(info.isSymbolicLink())fail("SOURCE_SYMLINK");
 }
 if(!(await lstat(current)).isFile())fail("SOURCE_NOT_FILE");
}
async function walk(folder,prefix=""){
 let paths=[];
 for(const entry of await readdir(folder,{withFileTypes:true})){
   if(entry.isSymbolicLink())fail("OUTPUT_SYMLINK");
   if(entry.isDirectory())paths.push(...await walk(join(folder,entry.name),prefix+entry.name+"/"));
   else if(entry.isFile())paths.push(prefix+entry.name);
   else fail("OUTPUT_NONREGULAR");
 }
 return paths;
}
export async function stagePages(destination){
 if(typeof destination!=="string"||!destination.trim())fail("INVALID_OUTPUT");
 const root=await realpath(ROOT),output=resolve(destination);
 const approved=join(root,"dist","pages");
 if((output===root||output.startsWith(root+sep))&&output!==approved)
   fail("SOURCE_TREE_DESTINATION");
 for(const file of FILES)await realSource(root,file);
 await mkdir(dirname(output),{recursive:true});
 await mkdir(output); // Exclusive: never merge stale files or replace symlinks.
 try{
   for(const file of FILES){
     await mkdir(dirname(join(output,file)),{recursive:true});
     await copyFile(join(root,file),join(output,file));
   }
   await writeFile(join(output,".nojekyll"),"",{flag:"wx",mode:0o600});
   const actual=(await walk(output)).sort(),expected=[".nojekyll",...FILES].sort();
   if(JSON.stringify(actual)!==JSON.stringify(expected))fail("UNEXPECTED_FILE");
   const index=await readFile(join(output,"index.html"),"utf8");
   const app=await readFile(join(output,"src/app.mjs"),"utf8");
   if(!index.includes('src="./src/app.mjs"')||
      !app.includes('from "./table.mjs"')||
      !app.includes('from "./export.mjs"')||
      !app.includes('from "../examples/data.mjs"'))fail("IMPORT_NOT_FOUND");
   const manifest=[];
   for(const file of actual){
     const data=await readFile(join(output,file));
     manifest.push({path:file,size:data.length,sha256:createHash("sha256").update(data).digest("hex")});
   }
   return {schema:"public-data-table-pages-v1",state:"STAGED_ONLY",
      publicSyntheticOnly:true,verifiedHosting:false,sourceOfTruth:"exact-checked-out-public-commit",files:manifest};
 }catch(error){await rm(output,{recursive:true,force:true});throw error;}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{console.log(JSON.stringify(await stagePages(process.argv[2]||"dist/pages"),null,2));}
 catch(error){console.error(JSON.stringify({state:"REJECTED",reason:String(error.message).slice(0,100)}));process.exitCode=2;}
}
