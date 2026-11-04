import test from 'node:test';
import assert from 'node:assert/strict';
import { createCard, normalize, duplicates, schedule, validateCard, validateImport, isDue, DAY } from '../public/shared/model.js';
import { seedCards } from '../public/shared/seed.js';

const now = new Date('2026-11-04T08:00:00Z');
const input = { question:'S3 Versioning là gì?',answer:'Lưu nhiều phiên bản object.',explanation:'',note:'',service:'S3',tags:['storage'],source:'https://docs.aws.amazon.com/',favorite:false };
test('duplicate detection handles aliases, punctuation, case, and excludes the current card',() => {
  assert.equal(normalize('Security Groups và Network ACL?'),normalize('SG và NACL!'));
  const cards = seedCards(now);
  assert.equal(duplicates(cards[0].question.toUpperCase(),cards)[0].score,1);
  assert.equal(duplicates(cards[0].question,cards,cards[0].id).length,0);
  assert.ok(duplicates('SG và NACL khác nhau thế nào?',cards).length > 0);
});
test('review intervals distinguish failure, difficulty, and consecutive successful recall',() => {
  const card = createCard(input,'test',now);
  const good = schedule(card,'good',now);
  assert.equal(Date.parse(good.dueAt),now.getTime() + DAY);
  const second = schedule(good,'good',now);
  assert.equal(second.interval,2);
  assert.equal(second.repetitions,2);
  const again = schedule(second,'again',now);
  assert.equal(again.repetitions,0);
  assert.equal(Date.parse(again.dueAt),now.getTime() + 600000);
  assert.equal(schedule(card,'easy',now).interval,4);
  assert.throws(() => schedule(card,'fake',now));
  assert.equal(isDue(card,now.getTime()),true);
  assert.equal(isDue(good,now.getTime()),false);
});
test('validation rejects executable URLs, unknown services, oversized fields and invalid tags',() => {
  assert.throws(() => validateCard({...input,source:'javascript:alert(1)'}));
  assert.throws(() => validateCard({...input,service:'invalid'}));
  assert.throws(() => validateCard({...input,question:' '}));
  assert.throws(() => validateCard({...input,tags:['x'.repeat(41)]}));
  assert.throws(() => validateCard({...input,note:'x'.repeat(10001)}));
  assert.deepEqual(validateCard({...input,tags:['a','a','b']} ).tags,['a','b']);
});
test('backup validation preserves notes and progress, rejects duplicate IDs and corrupt dates',() => {
  const cards = seedCards(now);
  const data = { version:1,cards,reviews:[] };
  assert.deepEqual(validateImport(data).cards,cards);
  assert.throws(() => validateImport({...data,cards:[cards[0],cards[0]]}));
  assert.throws(() => validateImport({...data,cards:[{...cards[0],dueAt:'nope'}]}));
  assert.throws(() => validateImport({...data,reviews:[{id:'r',cardId:cards[0].id,rating:'bad',at:now.toISOString()}]}));
});
