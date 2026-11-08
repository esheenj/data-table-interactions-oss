import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,readFileSync,existsSync,mkdirSync,rmSync,writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {stagePages} from "../scripts/stage-pages.mjs";
test("exact public synthetic table artifact is reproducible and has no private neighbors",async()=>{
 const base=mkdtempSync(join(tmpdir(),"table-stage-"));
 try{
  const a=join(base,"first"),b=join(base,"second");
  const first=await stagePages(a),second=await stagePages(b);
  assert.equal(first.state,"STAGED_ONLY");
  assert.equal(first.verifiedHosting,false);
  assert.deepEqual(first.files,second.files);
  assert.deepEqual(first.files.map(x=>x.path),[
    ".nojekyll","examples/data.mjs","index.html","src/app.mjs","src/export.mjs","src/table.mjs"
  ]);
  for(const entry of first.files){
    assert.match(entry.sha256,/^[a-f0-9]{64}$/);
    assert.deepEqual(readFileSync(join(a,entry.path)),readFileSync(join(b,entry.path)));
  }
  assert.equal(existsSync(join(a,"AGENTS.md")),false);
  assert.equal(existsSync(join(a,".github")),false);
  assert.equal(existsSync(join(a,"tests")),false);
  assert.equal(existsSync(join(a,".git")),false);
  assert.match(readFileSync(join(a,"index.html"),"utf8"),/src\/app\.mjs/);
  await assert.rejects(stagePages(a),/EEXIST/);
 }finally{rmSync(base,{recursive:true,force:true});}
});
test("prohibit staging into source and overwriting existing files",async()=>{
 await assert.rejects(stagePages("src/forbidden"),/SOURCE_TREE_DESTINATION/);
 const base=mkdtempSync(join(tmpdir(),"table-stage-existing-"));
 try{
  const old=join(base,"already");mkdirSync(old);writeFileSync(join(old,"note"),"keep");
  await assert.rejects(stagePages(old),/EEXIST/);
  assert.equal(readFileSync(join(old,"note"),"utf8"),"keep");
 }finally{rmSync(base,{recursive:true,force:true});}
});
