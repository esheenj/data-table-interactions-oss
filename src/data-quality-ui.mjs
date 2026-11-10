import {inspectDataQuality} from "./data-quality.mjs";
const field=id=>document.getElementById(id);
const fixture=[
 {id:"fictional-a",label:"Imaginary Alpha",score:88,observedDaysAgo:3},
 {id:"fictional-a",label:"",score:null,observedDaysAgo:45},
 {id:"",label:"Unnamed fictional row",score:110,observedDaysAgo:7}
];
field("input").value=JSON.stringify(fixture,null,2);
function render(){
 field("rows").replaceChildren();
 field("output").hidden=true;
 const raw=field("input").value;
 if(new TextEncoder().encode(raw).length>16384){
  field("status").textContent="Rejected: fictional JSON is larger than 16 KiB.";return;
 }
 let report;
 try{report=inspectDataQuality(JSON.parse(raw));}
 catch(_){field("status").textContent="Rejected: check row shape, score type, age and JSON syntax.";return;}
 field("status").textContent=report.inspectedRows+" fictional records reviewed · "+report.issueCount+" findings.";
 field("summary").textContent=report.cleanRows+" example rows without heuristic flags. Analysis readiness: "+(report.readyForAnalysis?"illustrative only":"not ready")+".";
 for(const row of report.findings){
  const li=document.createElement("li");
  const title=document.createElement("strong");
  title.textContent="Row "+row.ordinal+" · "+(row.id||"missing ID");
  const label=document.createElement("p");
  label.textContent="Label: "+(row.label||"not supplied");
  const flags=document.createElement("p");
  flags.textContent=row.issues.length?row.issues.join(" · "):"No modeled flags; not proof of trustworthy data.";
  li.append(title,label,flags);field("rows").append(li);
 }
 field("output").hidden=false;
}
field("inspect").addEventListener("click",render);
field("reset").addEventListener("click",()=>{
 field("input").value=JSON.stringify(fixture,null,2);render();field("input").focus();
});
render();
