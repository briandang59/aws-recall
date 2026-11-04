import test from 'node:test';
import assert from 'node:assert/strict';
import { values, parseCard, FIELDS } from '../lib/sheets.mjs';
import { seedCards } from '../public/shared/seed.js';
test('Sheets rows preserve multiline text, booleans, numeric progress, tags and notes',() => {
  const card = {...seedCards()[0],note:'Dòng 1\nDòng 2',favorite:true,repetitions:3,interval:7};
  assert.equal(values(card).length,FIELDS.length);
  assert.deepEqual(parseCard(values(card)),card);
  const textRow = values(card).map(v => typeof v === 'boolean' ? 'TRUE' : typeof v === 'number' ? String(v) : v);
  assert.deepEqual(parseCard(textRow),card);
});
test('corrupted Sheets rows do not silently erase user content',() => {
  const row = values(seedCards()[0]);
  row[FIELDS.indexOf('tags')] = '{bad json';
  assert.throws(() => parseCard(row));
});
