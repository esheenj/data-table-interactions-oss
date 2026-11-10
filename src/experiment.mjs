// Original, offline descriptive A/B experiment calculations using invented cohorts.
// No causal inference, real experiment assignment or statistical certification.
export class ExperimentFault extends Error {
 constructor(code){super(code);this.name="ExperimentFault";this.code=code;}
}
const ROW_KEYS=["name","exposures","conversions","errors"];
const own=(obj,key)=>Object.hasOwn(obj,key);
function exact(obj,keys){
 return obj!==null&&typeof obj==="object"&&!Array.isArray(obj)&&
  [Object.prototype,null].includes(Object.getPrototypeOf(obj))&&
  Object.keys(obj).length===keys.length&&keys.every(k=>own(obj,k));
}
function cohort(row) {
 if(!exact(row,ROW_KEYS))throw new ExperimentFault("INVALID_COHORT_SHAPE");
 if(typeof row.name!=="string"||row.name.trim().length<2||row.name.length>40)
  throw new ExperimentFault("INVALID_COHORT_NAME");
 for(const k of ["exposures","conversions","errors"]){
  if(!Number.isInteger(row[k])||row[k]<0||row[k]>1_000_000)
   throw new ExperimentFault("INVALID_COUNT");
 }
 if(row.exposures===0||row.conversions>row.exposures||row.errors>row.exposures)
  throw new ExperimentFault("INVALID_RATE_INPUT");
}
const rate=(part,total)=>Number((100*part/total).toFixed(2));
export function evaluateExperiment(data) {
 if(!exact(data,["version","baseline","candidate","errorGuardrailPct"])||
    data.version!==1||!Number.isInteger(data.errorGuardrailPct)||
    data.errorGuardrailPct<0||data.errorGuardrailPct>100)
  throw new ExperimentFault("INVALID_EXPERIMENT_SCHEMA");
 cohort(data.baseline);cohort(data.candidate);
 if(data.baseline.name===data.candidate.name)
  throw new ExperimentFault("COHORT_NAMES_MUST_DIFFER");
 const baselineConversion=rate(data.baseline.conversions,data.baseline.exposures);
 const candidateConversion=rate(data.candidate.conversions,data.candidate.exposures);
 const baselineError=rate(data.baseline.errors,data.baseline.exposures);
 const candidateError=rate(data.candidate.errors,data.candidate.exposures);
 const delta=Number((candidateConversion-baselineConversion).toFixed(2));
 const decision=candidateError>data.errorGuardrailPct?"HOLD_ERROR_GUARDRAIL":
  Math.min(data.baseline.exposures,data.candidate.exposures)<100?"INSUFFICIENT_SAMPLE":
  delta>0?"DESCRIPTIVE_UPLIFT_ONLY":"NO_OBSERVED_UPLIFT";
 return Object.freeze({
  schema:"synthetic-experiment-worksheet-v1",baselineConversionPct:baselineConversion,
  candidateConversionPct:candidateConversion,baselineErrorPct:baselineError,
  candidateErrorPct:candidateError,deltaPercentagePoints:delta,
  errorGuardrailPct:data.errorGuardrailPct,decision,
  verifiedCausality:false,statisticalSignificanceTested:false,
  disclaimer:"Illustrative descriptive rates only; not a real experiment or statistically valid causal claim."
 });
}
