// Dependency-free table view model. No network/persistence or synthetic data mutation.
export class TableError extends Error {constructor(message){super(message);this.name="TableError";}}
const sortable=new Set(["name","category","score"]);
const types=new Set(["design","research","engineering"]);
export function assertRows(rows) {
 if(!Array.isArray(rows)||rows.length>1000)throw new TableError("Expected up to 1000 fabricated rows.");
 const ids=new Set();
 for(const row of rows){
   if(!row || typeof row!=="object" || Array.isArray(row) ||
     typeof row.id!=="string" || !/^[a-z0-9-]{1,48}$/.test(row.id) ||
     typeof row.name!=="string" || !row.name.trim() || row.name.length>80 ||
     !types.has(row.category) || !Number.isSafeInteger(row.score) || row.score<0 || row.score>100)
       throw new TableError("Invalid row structure.");
   if(ids.has(row.id))throw new TableError("Duplicate row ID: "+row.id);
   ids.add(row.id);
 }
 return true;
}
export function deriveTable(rows,opts={}){
 assertRows(rows);
 if(!opts || typeof opts!=="object" || Array.isArray(opts))
   throw new TableError("Expected a table query object.");
 const {search="",category="all",sortBy="name",direction="asc",page=1,pageSize=5}=opts;
 if(typeof search!=="string" || search.length>100 || !(category==="all"||types.has(category)) ||
    !sortable.has(sortBy) || !["asc","desc"].includes(direction) ||
    !Number.isSafeInteger(page) || page<1 || !Number.isSafeInteger(pageSize) || pageSize<1 || pageSize>50)
   throw new TableError("Invalid table query (search, category, sort, direction or page).");
 const query=search.trim().toLocaleLowerCase("en");
 const filtered=rows.filter(r=>(category==="all"||r.category===category)&&r.name.toLocaleLowerCase("en").includes(query));
 const ordered=filtered.map((row,index)=>({row,index})).sort((a,b)=>{
   const av=a.row[sortBy],bv=b.row[sortBy];
   const cmp=typeof av==="number"?av-bv:av.localeCompare(bv,"en",{sensitivity:"base"});
   return (direction==="asc"?cmp:-cmp)||a.index-b.index;
 }).map(x=>x.row);
 const pageCount=Math.max(1,Math.ceil(ordered.length/pageSize));
 const currentPage=Math.min(page,pageCount);
 const start=(currentPage-1)*pageSize;
 return {rows:ordered.slice(start,start+pageSize),total:ordered.length,page:currentPage,pageCount,pageSize,
   start:ordered.length?start+1:0,end:Math.min(start+pageSize,ordered.length),
   hasPrevious:currentPage>1,hasNext:currentPage<pageCount};
}


