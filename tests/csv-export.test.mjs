import test from "node:test";
import assert from "node:assert/strict";
import {exportFilteredCSV} from "../src/export.mjs";
import {sampleRows} from "../examples/data.mjs";
import {TableError} from "../src/table.mjs";

test("CSV follows the current search/category/sort and includes all matching pages",()=>{
  const result=exportFilteredCSV(sampleRows,{
    search:"Synthetic",category:"research",sortBy:"score",direction:"desc",
    page:2,pageSize:1
  });
  assert.equal(result.rowCount,2);
  const lines=result.csv.trimEnd().split("\r\n");
  assert.equal(lines[0],'"ID","Name","Category","Score"');
  assert.equal(lines[1],'"c3","Synthetic research notes","research","87"');
  assert.equal(lines[2],'"f6","Synthetic analytics experiment","research","76"');
  assert.equal(lines.length,3);
});

test("CSV preserves quoted commas, newlines and Unicode without active formula cells",()=>{
  const rows=[
    {id:"a1",name:'  =HYPERLINK("fake://test","click"), fake',category:"design",score:1},
    {id:"b2",name:"+SUM(1,2)",category:"research",score:2},
    {id:"c3",name:"-1+2",category:"design",score:3},
    {id:"d4",name:"@fake",category:"engineering",score:4},
    {id:"e5",name:"\t=not-a-command",category:"design",score:5},
    {id:"f6",name:"Invented \r\n new line, quote \" and café",category:"research",score:6}
  ];
  const before=JSON.stringify(rows);
  const result=exportFilteredCSV(rows,{sortBy:"score",pageSize:1});
  assert.equal(result.rowCount,6);
  assert.ok(result.csv.includes('"\'  =HYPERLINK(""fake://test"",""click""), fake"'));
  assert.ok(result.csv.includes('"\'+SUM(1,2)"'));
  assert.ok(result.csv.includes('"\'-1+2"'));
  assert.ok(result.csv.includes('"\'@fake"'));
  assert.ok(result.csv.includes('"\''+"\t=not-a-command"+'"'));
  assert.ok(result.csv.includes('Invented \r\n new line, quote "" and café'));
  assert.equal(JSON.stringify(rows),before);
  assert.equal(result.csv,exportFilteredCSV(rows,{sortBy:"score",pageSize:50}).csv);
});

test("CSV supports 1,000 fabricated records without dropping pages or leaking extra fields",()=>{
  const rows=Array.from({length:1000},(_,i)=>({
    id:"r"+i,name:"Fictional row "+String(i).padStart(4,"0"),
    category:i%2?"design":"research",score:i%101,
    privateNote:"do not export this synthetic extra field"
  }));
  const result=exportFilteredCSV(rows,{category:"research",sortBy:"score",direction:"desc",page:20,pageSize:1});
  assert.equal(result.rowCount,500);
  assert.equal(result.csv.split("\r\n").length,502);
  assert.doesNotMatch(result.csv,/privateNote|do not export/);
});

test("empty filter has only the header and malformed inputs fail closed",()=>{
  const none=exportFilteredCSV(sampleRows,{search:"nobody-matches-this"});
  assert.equal(none.rowCount,0);
  assert.equal(none.csv,'"ID","Name","Category","Score"\r\n');
  assert.throws(()=>exportFilteredCSV([...sampleRows,sampleRows[0]]),TableError);
  assert.throws(()=>exportFilteredCSV(sampleRows,{sortBy:"unsafe"}),TableError);
  assert.throws(()=>exportFilteredCSV(sampleRows,{pageSize:0}),TableError);
  assert.throws(()=>exportFilteredCSV(null),TableError);
});
