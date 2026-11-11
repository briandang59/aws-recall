import test from 'node:test';
import assert from 'node:assert/strict';
import { services, categories, patterns, comparisons } from '../public/atlas-data.js';
import { keywords, connections, relationTypes } from '../public/atlas-map-data.js';

test('Atlas has unique service identities and resolvable relationships', () => {
  const ids = new Set(services.map(s => s.id));
  assert.equal(ids.size, services.length);
  const groups = new Set(categories.map(c => c[0]));
  for (const s of services) {
    assert.ok(groups.has(s.category), s.id);
    for (const field of ['definition', 'mechanics', 'use', 'caution']) assert.ok(s[field].length > 40, `${s.id}: ${field}`);
    assert.equal(new URL(s.source).hostname, 'aws.amazon.com');
    for (const id of s.related) assert.ok(ids.has(id), `${s.id} -> ${id}`);
  }
});

test('Architecture diagrams reference valid services and connect every node', () => {
  const ids = new Set(services.map(s => s.id));
  for (const p of patterns) {
    assert.equal(p.nodes.length, 6);
    for (const id of [...p.nodes, ...p.extras]) assert.ok(ids.has(id));
    const connected = new Set();
    for (const [a,b,label] of p.edges) {
      assert.ok(p.nodes[a] && p.nodes[b] && a !== b && label.length);
      connected.add(a); connected.add(b);
    }
    assert.equal(connected.size, p.nodes.length, p.id);
    assert.ok(p.tradeoff.length && p.steps.length >= 4);
  }
});

test('Comparison tables preserve header and row alignment', () => {
  for (const table of comparisons) for (const row of table.rows) {
    assert.equal(row.length, table.cols.length, table.title);
    assert.ok(row.every(cell => typeof cell === 'string' && cell.length));
  }
});

test('Every service has searchable English vocabulary and at least one explained map relationship', () => {
  const ids=new Set(services.map(s=>s.id));
  assert.deepEqual(new Set(Object.keys(keywords)),ids);
  for(const s of services){
    assert.ok(keywords[s.id].length>=4,s.id);
    assert.ok(keywords[s.id].every(word=>typeof word==='string'&&word.length>1));
    assert.ok(connections.some(c=>c.from===s.id||c.to===s.id),`No map relationship: ${s.id}`);
  }
  const unique=new Set();
  for(const c of connections){
    assert.ok(ids.has(c.from)&&ids.has(c.to)&&c.from!==c.to);
    assert.ok(relationTypes[c.type]);
    assert.ok(c.description.trim().length>40,`${c.from} → ${c.to}: missing explanation`);
    const source=new URL(c.source);
    assert.equal(source.protocol,'https:');
    assert.equal(source.hostname,'docs.aws.amazon.com');
    const key=`${c.from}:${c.to}:${c.type}`;
    assert.ok(!unique.has(key),`Duplicate relationship: ${key}`);unique.add(key);
  }
});
