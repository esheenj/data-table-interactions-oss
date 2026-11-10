import test from "node:test";
import assert from "node:assert/strict";
import {evaluateExperiment,ExperimentFault} from "../src/experiment.mjs";
const fixture=()=>({
 version:1,errorGuardrailPct:5,
 baseline:{name:"Fictional A",exposures:100,conversions:10,errors:1},
 candidate:{name:"Fictional B",exposures:100,conversions:13,errors:2}
});
test("computes transparent synthetic uplift without causal claims",()=>{
 const before=fixture(),report=evaluateExperiment(before);
 assert.equal(report.baselineConversionPct,10);
 assert.equal(report.candidateConversionPct,13);
 assert.equal(report.deltaPercentagePoints,3);
 assert.equal(report.candidateErrorPct,2);
 assert.equal(report.decision,"DESCRIPTIVE_UPLIFT_ONLY");
 assert.equal(report.statisticalSignificanceTested,false);
 assert.equal(report.verifiedCausality,false);
 assert.deepEqual(before,fixture());
 assert(Object.isFrozen(report));
});
test("prioritizes error guardrails even when candidate conversion improves",()=>{
 const bad=fixture();
 bad.candidate.errors=9;
 assert.equal(evaluateExperiment(bad).decision,"HOLD_ERROR_GUARDRAIL");
 bad.candidate.errors=0;
 bad.candidate.conversions=9;
 assert.equal(evaluateExperiment(bad).decision,"NO_OBSERVED_UPLIFT");
 bad.candidate.exposures=24;
 bad.candidate.conversions=9;
 assert.equal(evaluateExperiment(bad).decision,"INSUFFICIENT_SAMPLE");
});
test("rejects impossible counts, duplicate cohorts, extra/unsafe shapes",()=>{
 const cases=[];
 for(const [path,value] of [["exposures",0],["conversions",101],["errors",-1],
   ["conversions",1.5],["errors",true],["exposures",1_000_001]]){
  const x=fixture();x.candidate[path]=value;cases.push(x);
 }
 for(const data of [
  {...fixture(),errorGuardrailPct:101},
  {...fixture(),errorGuardrailPct:NaN},
  {...fixture(),extra:"private"},
  {...fixture(),candidate:{...fixture().candidate,extra:1}},
  {...fixture(),candidate:{...fixture().candidate,name:"Fictional A"}},
  {...fixture(),candidate:Object.assign(Object.create(Date.prototype),fixture().candidate)},
 ])cases.push(data);
 for(const data of cases)assert.throws(()=>evaluateExperiment(data),ExperimentFault);
});
test("unsafe-looking text remains data and is never interpolated as markup",()=>{
 const x=fixture();
 x.baseline.name="<script>alert(1)</script>";
 const result=evaluateExperiment(x);
 assert.equal(result.decision,"DESCRIPTIVE_UPLIFT_ONLY");
});
