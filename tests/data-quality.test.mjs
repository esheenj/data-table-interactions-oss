import test from "node:test";
import assert from "node:assert/strict";
import {inspectDataQuality,QualityFault} from "../src/data-quality.mjs";
const demo=()=>[
 {id:"fictional-a",label:"Imaginary Alpha",score:88,observedDaysAgo:3},
 {id:"fictional-a",label:"",score:null,observedDaysAgo:45},
 {id:"",label:"Unnamed fictional row",score:110,observedDaysAgo:7}
];
test("flags duplicate, incomplete, stale and out-of-range fictional rows",()=>{
 const rows=demo(),result=inspectDataQuality(rows);
 assert.equal(result.inspectedRows,3);
 assert.equal(result.issueCount,6);
 assert.equal(result.cleanRows,1);
 assert.equal(result.readyForAnalysis,false);
 assert.equal(result.productionValidated,false);
 assert.deepEqual(result.findings[1].issues,[
   "DUPLICATE_ID","MISSING_LABEL","MISSING_SCORE","STALE_SAMPLE_OVER_30_DAYS"
 ]);
 assert.deepEqual(result.findings[2].issues,["MISSING_ID","SCORE_OUTSIDE_EXAMPLE_RANGE"]);
 assert.deepEqual(rows,demo());
 assert(Object.isFrozen(result.findings));
});
test("clean fictional rows do not imply production validation",()=>{
 const result=inspectDataQuality([demo()[0]]);
 assert.equal(result.issueCount,0);
 assert.equal(result.cleanRows,1);
 assert.equal(result.readyForAnalysis,true);
 assert.equal(result.productionValidated,false);
});
test("rejects hostile shapes, oversized samples and invalid primitive fields",()=>{
 const source=demo()[0];
 const invalid=[
  [],Array(51).fill(source),
  [{...source,id:"../secret"}],
  [{...source,score:NaN}],
  [{...source,score:1.5}],
  [{...source,score:Infinity}],
  [{...source,observedDaysAgo:-1}],
  [{...source,observedDaysAgo:366}],
  [{...source,label:1}],
  [{...source,extra:"private"}],
  [Object.assign(Object.create(Date.prototype),source)]
 ];
 for(const rows of invalid)assert.throws(()=>inspectDataQuality(rows),QualityFault);
});
test("unsafe-looking text is inert model data",()=>{
 const rows=demo();rows[0].label="<img src=x onerror=alert(1)>";
 const report=inspectDataQuality(rows);
 assert.equal(report.findings[0].label,rows[0].label);
});
