import {evaluateExperiment} from "./experiment.mjs";
const field=id=>document.getElementById(id);
const sample={
 version:1,errorGuardrailPct:5,
 baseline:{name:"Fictional A",exposures:120,conversions:12,errors:2},
 candidate:{name:"Fictional B",exposures:120,conversions:18,errors:4}
};
field("sheet").value=JSON.stringify(sample,null,2);
function render(){
 field("result").hidden=true;
 const raw=field("sheet").value;
 if(new TextEncoder().encode(raw).length>16384){
  field("status").textContent="Rejected: fixture exceeds the 16 KiB playground limit.";return;
 }
 let report;
 try{report=evaluateExperiment(JSON.parse(raw));}
 catch(_){field("status").textContent="Rejected: check cohort counts, percentages and the strict JSON schema.";return;}
 field("status").textContent="Computed from fictional input only. Nothing uploaded or assigned.";
 field("baseline-rate").textContent=report.baselineConversionPct.toFixed(2)+"%";
 field("candidate-rate").textContent=report.candidateConversionPct.toFixed(2)+"%";
 field("delta").textContent=(report.deltaPercentagePoints>=0?"+":"")+report.deltaPercentagePoints.toFixed(2)+" percentage points";
 field("candidate-error").textContent=report.candidateErrorPct.toFixed(2)+"%";
 field("decision").textContent=report.decision.replaceAll("_"," ");
 field("result").hidden=false;
}
field("evaluate").addEventListener("click",render);
field("reset").addEventListener("click",()=>{
 field("sheet").value=JSON.stringify(sample,null,2);render();field("sheet").focus();
});
render();
