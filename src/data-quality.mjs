// Original static data-quality worksheet over fictional rows; no uploads.
export class QualityFault extends Error {
 constructor(code){super(code);this.name="QualityFault";this.code=code;}
}
const FIELDS=["id","label","score","observedDaysAgo"];
export function inspectDataQuality(rows) {
 if(!Array.isArray(rows)||rows.length===0||rows.length>50)throw new QualityFault("INVALID_ROW_COUNT");
 const seen=new Set();
 let issueCount=0,cleanRows=0;
 const findings=rows.map((row,index)=>{
  if(!row||typeof row!=="object"||Array.isArray(row)||
     ![Object.prototype,null].includes(Object.getPrototypeOf(row))||
     Object.keys(row).length!==FIELDS.length||!FIELDS.every(key=>Object.hasOwn(row,key)))
     throw new QualityFault("INVALID_ROW_SHAPE");
  if(typeof row.id!=="string"||row.id.length>36||
     (row.id.length>0&&!/^[a-z][a-z0-9-]*$/.test(row.id)))
     throw new QualityFault("INVALID_ID_TYPE");
  if(typeof row.label!=="string"||row.label.length>80)
     throw new QualityFault("INVALID_LABEL_TYPE");
  if(row.score!==null&&(!Number.isInteger(row.score)||row.score< -100||row.score>200))
     throw new QualityFault("INVALID_SCORE_TYPE");
  if(!Number.isInteger(row.observedDaysAgo)||row.observedDaysAgo<0||row.observedDaysAgo>365)
     throw new QualityFault("INVALID_AGE_TYPE");
  const issues=[];
  if(!row.id)issues.push("MISSING_ID");
  else if(seen.has(row.id))issues.push("DUPLICATE_ID");
  else seen.add(row.id);
  if(!row.label.trim())issues.push("MISSING_LABEL");
  if(row.score===null)issues.push("MISSING_SCORE");
  else if(row.score<0||row.score>100)issues.push("SCORE_OUTSIDE_EXAMPLE_RANGE");
  if(row.observedDaysAgo>30)issues.push("STALE_SAMPLE_OVER_30_DAYS");
  issueCount+=issues.length;
  if(!issues.length)cleanRows+=1;
  return Object.freeze({ordinal:index+1,id:row.id,label:row.label,issues:Object.freeze(issues)});
 });
 return Object.freeze({
  schema:"fictional-data-quality-v1",inspectedRows:rows.length,
  issueCount,cleanRows,findings:Object.freeze(findings),
  readyForAnalysis:issueCount===0,productionValidated:false,
  disclaimer:"Illustrative format checks on synthetic rows only; not a source-of-truth, privacy audit or production data quality certification."
 });
}
