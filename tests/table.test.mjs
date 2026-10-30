import test from "node:test";
import assert from "node:assert/strict";
import {assertRows,deriveTable,TableError} from "../src/table.mjs";
import {sampleRows} from "../examples/data.mjs";
test("page 1/2 and row count are consistent",()=>{
 const first=deriveTable(sampleRows,{pageSize:4});
 const second=deriveTable(sampleRows,{page:2,pageSize:4});
 assert.equal(first.total,8);assert.equal(first.pageCount,2);
 assert.equal(first.rows.length,4);assert.equal(second.rows.length,4);
 assert.equal(first.hasPrevious,false);assert.equal(second.hasNext,false);
});
test("case-insensitive filter and category combine",()=>{
 const x=deriveTable(sampleRows,{search:"fictional",category:"design"});
 assert.deepEqual(x.rows.map(y=>y.id),["a1"]);
});
test("numeric sort and stable duplicate comparison",()=>{
 const x=deriveTable(sampleRows,{sortBy:"score",direction:"desc",pageSize:20});
 assert.deepEqual(x.rows.map(z=>z.score),[98,91,87,84,76,74,68,62]);
 const same=[{id:"x",name:"Same",category:"design",score:1},{id:"y",name:"Same",category:"design",score:1}];
 assert.deepEqual(deriveTable(same).rows.map(r=>r.id),["x","y"]);
});
test("empty results and excessive page resolve without skipping results",()=>{
 const empty=deriveTable(sampleRows,{search:"absent"});
 assert.equal(empty.total,0);assert.equal(empty.start,0);assert.equal(empty.page,1);
 const end=deriveTable(sampleRows,{page:100,pageSize:4});
 assert.equal(end.page,2);assert.equal(end.rows.length,4);
});
test("rejects invalid sort or page and duplicate IDs",()=>{
 assert.throws(()=>deriveTable(sampleRows,{sortBy:"prototype"}),TableError);
 assert.throws(()=>deriveTable(sampleRows,{pageSize:0}),TableError);
 assert.throws(()=>assertRows([...sampleRows,sampleRows[0]]),/Duplicate/);
 assert.throws(()=>deriveTable(sampleRows,{search:null}),TableError);
});


