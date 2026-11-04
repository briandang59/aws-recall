import test from 'node:test';
import assert from 'node:assert/strict';
import {SERVICE_CATALOG,SERVICES,SERVICE_GROUPS,TAG_GROUPS,DEFAULT_TAGS,MAX_TAGS,getService,searchServices,parseTagInput,toggleTag,suggestedTags} from '../public/shared/catalog.js';
import {createCard,validateImport} from '../public/shared/model.js';
import {values,parseCard} from '../lib/sheets.mjs';
import {seedCards} from '../public/shared/seed.js';
import {serviceOptions,serviceResults,tagsField} from '../public/editor-fields.js';

test('expanded services round-trip through card validation, Sheets rows and backups',() => {
  assert.equal(new Set(SERVICES).size,SERVICES.length);
  assert.ok(SERVICES.length > 100);
  const base = seedCards()[0];
  for (const service of SERVICES) {
    const card = createCard({...base,service,tags:[...DEFAULT_TAGS]},'service-test');
    assert.equal(parseCard(values(card)).service,service);
    assert.equal(validateImport({version:1,cards:[card],reviews:[]}).cards[0].service,service);
    assert.ok(getService(service));
    assert.ok(SERVICE_GROUPS.some(group => group.id === getService(service).group));
  }
  for (const service of ['IAM','EC2','S3','VPC','RDS','Lambda','DynamoDB','CloudFront','SQS','CloudWatch']) assert.ok(SERVICES.includes(service));
  const legacyCards = seedCards(new Date('2026-11-04T08:00:00Z'));
  assert.deepEqual(validateImport({version:1,cards:legacyCards,reviews:[]}).cards,legacyCards);
});

test('service search supports full names, common aliases and Vietnamese categories',() => {
  const ids = query => searchServices(query).map(s => s.id);
  assert.ok(ids('ALB').includes('ELB'));
  assert.ok(ids('dns').includes('Route 53'));
  assert.ok(ids('ssm').includes('Systems Manager'));
  assert.ok(ids('Key Management').includes('KMS'));
  assert.ok(ids('luu tru').includes('EFS'));
  assert.ok(ids('LƯU TRỮ').includes('S3'));
  assert.ok(ids('postgresql').includes('RDS'));
  assert.ok(ids('Kafka').includes('MSK'));
  assert.deepEqual(ids('unmatched-service-12345'),[]);
  assert.equal(searchServices('').length,SERVICE_CATALOG.length);
});

test('all preset tags fit the persisted card format and cover the four SAA-C03 domains',() => {
  const tags = TAG_GROUPS.flatMap(group => group.tags.map(([tag]) => tag));
  assert.equal(tags.length,new Set(tags).size);
  assert.equal(TAG_GROUPS.find(g => g.id === 'domains').tags.length,4);
  assert.deepEqual(DEFAULT_TAGS,['SAA-C03']);
  const base = seedCards()[0];
  for (const tag of tags) {
    assert.ok(tag.length <= 40);
    assert.equal(createCard({...base,tags:[tag]},'tag-test').tags[0],tag);
  }
  for (const service of SERVICES) for (const tag of suggestedTags(service)) assert.ok(tags.includes(tag));
});

test('preset toggles preserve custom and legacy tags and enforce the eight-tag limit',() => {
  const legacy = ['SAA','storage','nhãn-riêng'];
  assert.deepEqual(parseTagInput('SAA, storage; nhãn-riêng, STORAGE, ,'),legacy);
  assert.deepEqual(toggleTag(legacy,'comparison'),[...legacy,'comparison']);
  assert.deepEqual(toggleTag(legacy,'STORAGE'),['SAA','nhãn-riêng']);
  assert.deepEqual(legacy,['SAA','storage','nhãn-riêng']);
  const full = Array.from({length:MAX_TAGS},(_,i) => `tag-${i}`);
  assert.throws(() => toggleTag(full,'new-tag'));
  assert.equal(toggleTag(full,'tag-0').length,7);
  assert.equal(toggleTag(toggleTag(full,'tag-0'),'new-tag').length,8);
});

test('editor fields preserve selected values and escape custom tag markup',() => {
  const options = serviceOptions('Route 53');
  assert.ok(options.includes('value="Route 53" selected'));
  assert.equal((options.match(/ selected/g) || []).length,1);
  const results = serviceResults('ELB','ALB');
  assert.ok(results.includes('data-service="ELB"'));
  assert.ok(results.includes('aria-selected="true"'));
  const malicious = '\"><img src=x onerror=alert(1)>';
  const rendered = tagsField(['SAA',malicious],'S3');
  assert.ok(!rendered.includes('<img'));
  assert.ok(rendered.includes('&lt;img'));
  assert.ok(rendered.includes('SAA'));
});
