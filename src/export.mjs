// Download-only CSV serialization of filtered, sorted fictional table rows.
// No network, filesystem write or spreadsheet execution. Formula-like cells
// are prefixed as text before RFC-style quoted CSV escaping.
import {assertRows, deriveTable} from "./table.mjs";

const HEADERS=["ID","Name","Category","Score"];
function cell(value) {
  let text=String(value);
  // Spreadsheet importers differ. This is a conservative mitigation, NOT a
  // security guarantee for every downstream spreadsheet or import setting.
  if (/^[\s\uFEFF]*[=+\-@]/u.test(text) || /^[\t\r\n]/.test(text))
    text="'"+text;
  return '"'+text.replaceAll('"','""')+'"';
}
export function exportFilteredCSV(rows, options={}) {
  assertRows(rows);
  // The view model is the source of truth for search, category and stable
  // sorting. Export every filtered record, irrespective of current page.
  const first=deriveTable(rows,{...options,page:1,pageSize:50});
  const records=[...first.rows];
  for(let page=2;page<=first.pageCount;page++)
    records.push(...deriveTable(rows,{...options,page,pageSize:50}).rows);
  const lines=[HEADERS.map(cell).join(",")];
  for(const row of records)
    lines.push([row.id,row.name,row.category,row.score].map(cell).join(","));
  return {rowCount:records.length,csv:lines.join("\r\n")+"\r\n"};
}
