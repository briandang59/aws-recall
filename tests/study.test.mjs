import test from 'node:test';
import assert from 'node:assert/strict';
import { shuffleCards, restoreStudy } from '../public/shared/study.js';

const cards = ['a','b','c'].map(id => ({id}));
const session = { ids:['c','a','b'], index:1, reviewed:1, flipped:true, startedAt:1000, requestId:null };

test('shuffle preserves every card without changing the source and selects from the full deck', () => {
  const result = shuffleCards(cards, () => 0);
  assert.deepEqual(cards.map(c => c.id), ['a','b','c']);
  assert.deepEqual(result.map(c => c.id), ['b','c','a']);
  assert.deepEqual(new Set(result), new Set(cards));
  assert.deepEqual(shuffleCards([]), []);
});

test('restore keeps shuffled order, position, and flipped state after JSON round trip', () => {
  assert.deepEqual(restoreStudy(JSON.parse(JSON.stringify(session)), cards, []), session);
});

test('restore reconciles a review saved before interruption without counting it twice', () => {
  const pending = {...session, requestId:'review-1'};
  const reviews = [{id:'review-1', cardId:'a'}];
  const restored = restoreStudy(pending, cards, reviews);
  assert.equal(restored.index, 2);
  assert.equal(restored.reviewed, 2);
  assert.equal(restored.flipped, false);
  assert.equal(restored.requestId, null);
  assert.deepEqual(restoreStudy(restored, cards, reviews), restored);
  assert.deepEqual(restoreStudy(pending, cards, []), pending);
});

test('restore skips deleted cards and rejects completed or corrupt sessions', () => {
  const restored = restoreStudy(session, cards.filter(c => c.id !== 'a'), []);
  assert.equal(restored.index, 2);
  assert.equal(restored.reviewed, 1);
  assert.equal(restored.flipped, false);
  for (const invalid of [null, {}, {...session,index:-1}, {...session,index:4}, {...session,ids:['a','a']}, {...session,reviewed:9}, {...session,startedAt:null}]) {
    assert.equal(restoreStudy(invalid,cards,[]), null);
  }
  assert.equal(restoreStudy({...session,index:3},cards,[]),null);
  assert.equal(restoreStudy(session,[],[]),null);
});
