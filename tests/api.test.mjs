import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import cardsHandler from '../api/cards.mjs';
import sessionHandler from '../api/session.mjs';
import { signSession } from '../lib/auth.mjs';
import { seedCards } from '../public/shared/seed.js';

async function invoke(handler, method, data, cookie = '') {
  const req = { method,body:data,headers:{host:'recall.test',origin:'https://recall.test','content-type':'application/json',cookie},socket:{remoteAddress:'127.0.0.1'} };
  return new Promise((resolve,reject) => {
    const headers = {};
    const res = { statusCode:200,setHeader:(k,v) => {headers[k] = v;},end:text => resolve({status:res.statusCode,data:JSON.parse(text),headers}) };
    Promise.resolve(handler(req,res)).catch(reject);
  });
}

test('authenticated Sheets API supports CRUD, rejects stale changes, and records reviews atomically',async () => {
  const env = {...process.env}, originalFetch = globalThis.fetch;
  const {privateKey} = generateKeyPairSync('rsa',{modulusLength:2048,privateKeyEncoding:{type:'pkcs8',format:'pem'},publicKeyEncoding:{type:'spki',format:'pem'}});
  Object.assign(process.env,{GOOGLE_SHEET_ID:'test-sheet',GOOGLE_SERVICE_ACCOUNT_EMAIL:'test@example.test',GOOGLE_PRIVATE_KEY:privateKey,APP_PASSWORD:'test-password',SESSION_SECRET:'secret'.repeat(8)});
  const sheets = new Map(), rows = new Map();
  const batches = [];
  globalThis.fetch = async (address,options = {}) => {
    const url = new URL(address);
    if (url.hostname === 'oauth2.googleapis.com') return Response.json({access_token:'fake-token',expires_in:3600});
    assert.equal(url.hostname,'sheets.googleapis.com');
    assert.equal(options.headers.Authorization,'Bearer fake-token');
    if (url.pathname.endsWith('/values:batchGet')) {
      const ranges = url.searchParams.getAll('ranges');
      return Response.json({valueRanges:ranges.map(range => {
        const [name,cells] = range.split('!'), table = rows.get(sheets.get(name)) || [];
        return {values:cells.includes('1:') ? table.slice(0,1) : table.slice(1)};
      })});
    }
    if (url.pathname.endsWith(':batchUpdate')) {
      const data = JSON.parse(options.body), replies = [];
      batches.push(data.requests);
      const decode = cells => cells.map(c => Object.values(c.userEnteredValue || {})[0] ?? '');
      for (const op of data.requests) {
        if (op.addSheet) {
          const sheetId = sheets.size + 1;
          sheets.set(op.addSheet.properties.title,sheetId); rows.set(sheetId,[]);
          replies.push({addSheet:{properties:{title:op.addSheet.properties.title,sheetId}}});
        } else if (op.appendCells) {
          rows.get(op.appendCells.sheetId).push(...op.appendCells.rows.map(r => decode(r.values))); replies.push({});
        } else if (op.updateCells) {
          const opData = op.updateCells, position = opData.start || opData.range;
          rows.get(position.sheetId)[position.rowIndex ?? position.startRowIndex] = opData.rows ? decode(opData.rows[0].values) : [];
          replies.push({});
        } else assert.fail('Unexpected Google request');
      }
      return Response.json({replies});
    }
    return Response.json({sheets:[...sheets].map(([title,sheetId]) => ({properties:{title,sheetId}}))});
  };
  try {
    assert.equal((await invoke(cardsHandler,'GET')).status,401);
    const cookie = `aws_recall_session=${signSession()}`;
    const login = await invoke(sessionHandler,'POST',{password:'test-password'});
    assert.equal(login.status,200);
    assert.match(login.headers['Set-Cookie'],/HttpOnly/);
    assert.equal((await invoke(sessionHandler,'POST',{password:'wrong'})).status,401);
    const initial = await invoke(cardsHandler,'GET',undefined,cookie);
    assert.deepEqual(initial.data,{cards:[],reviews:[]});
    const sample = seedCards()[0];
    const created = await invoke(cardsHandler,'POST',{action:'create',id:'card-1',card:sample},cookie);
    assert.equal(created.status,201);
    assert.equal(created.data.card.note,sample.note);
    assert.equal((await invoke(cardsHandler,'POST',{action:'create',id:'card-1',card:sample},cookie)).status,200);
    assert.equal((await invoke(cardsHandler,'POST',{action:'create',id:'card-2',card:sample},cookie)).status,409);
    assert.equal((await invoke(cardsHandler,'POST',{action:'update',id:'card-1',card:sample,expectedVersion:'stale'},cookie)).status,409);
    const updated = await invoke(cardsHandler,'POST',{action:'update',id:'card-1',card:{...sample,note:'New note'},expectedVersion:created.data.card.updatedAt},cookie);
    assert.equal(updated.status,200);
    assert.equal(updated.data.card.note,'New note');
    const reviewed = await invoke(cardsHandler,'POST',{action:'review',id:'card-1',rating:'good',reviewId:'review-1',expectedVersion:updated.data.card.updatedAt},cookie);
    assert.equal(reviewed.status,200);
    assert.equal(reviewed.data.card.repetitions,1);
    assert.equal(batches.at(-1).length,2); // One atomic batch updates the card and appends history.
    const retried = await invoke(cardsHandler,'POST',{action:'review',id:'card-1',rating:'good',reviewId:'review-1',expectedVersion:'old'},cookie);
    assert.equal(retried.status,200);
    assert.equal(retried.data.card.repetitions,1);
    const full = await invoke(cardsHandler,'GET',undefined,cookie);
    assert.equal(full.data.reviews.length,1);
    const deleted = await invoke(cardsHandler,'POST',{action:'delete',id:'card-1',expectedVersion:reviewed.data.card.updatedAt},cookie);
    assert.equal(deleted.status,200);
    assert.equal((await invoke(cardsHandler,'GET',undefined,cookie)).data.cards.length,0);
    assert.equal((await invoke(cardsHandler,'GET',undefined,cookie)).data.reviews.length,1);
  } finally { process.env = env; globalThis.fetch = originalFetch; }
});
