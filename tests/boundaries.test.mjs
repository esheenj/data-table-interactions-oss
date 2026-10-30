import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveTable, TableError } from '../src/table.mjs';
import { sampleRows } from '../examples/data.mjs';

test('malformed queries fail with the documented error class', () => {
  for(const query of [null,[],false,42,'score',{page:NaN},{page:Infinity},
    {direction:'sideways'},{category:'private'},{pageSize:51}]) {
    assert.throws(() => deriveTable(sampleRows,query), TableError);
  }
});
test('filtering does not mutate frozen source and ties remain stable descending', () => {
  const rows=Object.freeze(sampleRows.map(row=>Object.freeze({...row,score:10})));
  const result=deriveTable(rows,{sortBy:'score',direction:'desc',pageSize:50});
  assert.deepEqual(result.rows.map(row=>row.id),rows.map(row=>row.id));
  assert.equal(deriveTable([]).end,0);
  assert.throws(() => deriveTable(Array(1001).fill(sampleRows[0])),TableError);
});

