import {deriveTable} from "../src/table.mjs";
import {sampleRows} from "./data.mjs";
console.log(JSON.stringify(deriveTable(sampleRows,{category:"research",sortBy:"score",direction:"desc",pageSize:3}),null,2));


