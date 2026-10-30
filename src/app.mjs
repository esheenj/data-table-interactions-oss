import {sampleRows} from "../examples/data.mjs";
import {deriveTable} from "./table.mjs";
const $=s=>document.querySelector(s);
let settings={search:"",category:"all",sortBy:"name",direction:"asc",page:1,pageSize:4};
const cell=(row,text)=>{const el=document.createElement("td");el.textContent=String(text);row.append(el);};
function render(){
 const x=deriveTable(sampleRows,settings);
 settings.page=x.page;
 const body=$("#table-body");body.replaceChildren();
 for(const item of x.rows){
   const tr=document.createElement("tr");
   cell(tr,item.name);cell(tr,item.category);cell(tr,item.score+"/100");
   body.append(tr);
 }
 $("#empty").hidden=x.total!==0;
 $("#pager").textContent=x.total?x.start+"–"+x.end+" of "+x.total:"0 matching records";
 $("#page").textContent="Page "+x.page+" of "+x.pageCount;
 $("#prev").disabled=!x.hasPrevious;$("#next").disabled=!x.hasNext;
 for(const button of document.querySelectorAll("[data-sort]")){
   const name=button.dataset.sort;
   const active=name===settings.sortBy;
   button.textContent=(name==="name"?"Name":name==="category"?"Category":"Score")+(active?(settings.direction==="asc"?" ↑":" ↓"):" ↕");
   button.closest("th").setAttribute("aria-sort",active?(settings.direction==="asc"?"ascending":"descending"):"none");
 }
}
$("#query").addEventListener("input",event=>{settings={...settings,search:event.target.value,page:1};render();});
$("#category").addEventListener("change",event=>{settings={...settings,category:event.target.value,page:1};render();});
$("#page-size").addEventListener("change",event=>{settings={...settings,pageSize:Number(event.target.value),page:1};render();});
document.querySelectorAll("[data-sort]").forEach(button=>button.addEventListener("click",()=>{
 const sortBy=button.dataset.sort;
 const direction=settings.sortBy===sortBy&&settings.direction==="asc"?"desc":"asc";
 settings={...settings,sortBy,direction,page:1};render();button.focus();
}));
$("#prev").addEventListener("click",()=>{settings={...settings,page:settings.page-1};render();});
$("#next").addEventListener("click",()=>{settings={...settings,page:settings.page+1};render();});
$("#clear").addEventListener("click",()=>{settings={search:"",category:"all",sortBy:"name",direction:"asc",page:1,pageSize:4};
 $("#query").value="";$("#category").value="all";$("#page-size").value="4";render();$("#query").focus();});
render();


