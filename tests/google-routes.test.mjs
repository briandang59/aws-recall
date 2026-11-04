import test from 'node:test';
import assert from 'node:assert/strict';
import start from '../api/auth/google.mjs';
import callback from '../api/auth/google/callback.mjs';
import {signSession} from '../lib/auth.mjs';
import {seal,STATE_COOKIE} from '../lib/google-session.mjs';

function invoke(handler,url,cookie = '') {
  const req = {url,method:'GET',headers:{host:'recall.test',cookie}};
  return new Promise((resolve,reject) => {
    const headers = {};
    const res = {statusCode:200,setHeader:(k,v) => {headers[k] = v;},writeHead:(status,extra) => {res.statusCode = status; Object.assign(headers,extra);},end:text => resolve({status:res.statusCode,headers,data:text ? JSON.parse(text) : undefined})};
    Promise.resolve(handler(req,res)).catch(reject);
  });
}

test('Vercel file-based OAuth entry points resolve start and callback URLs',async () => {
  const env = {...process.env};
  for (const k of ['GOOGLE_SERVICE_ACCOUNT_EMAIL','GOOGLE_PRIVATE_KEY','GOOGLE_REFRESH_TOKEN']) delete process.env[k];
  Object.assign(process.env,{GOOGLE_SHEET_ID:'sheet',GOOGLE_CLIENT_ID:'client',GOOGLE_CLIENT_SECRET:'secret',GOOGLE_OAUTH_REDIRECT_URI:'https://recall.test/api/auth/google/callback',APP_PASSWORD:'owner-password',SESSION_SECRET:'r'.repeat(64)});
  try {
    const unauthorized = await invoke(start,'/api/auth/google');
    assert.equal(unauthorized.status,401);
    const authorized = await invoke(start,'/api/auth/google',`aws_recall_session=${signSession()}`);
    assert.equal(authorized.status,302);
    assert.equal(new URL(authorized.headers.Location).hostname,'accounts.google.com');
    const invalidCallback = await invoke(callback,'/api/auth/google/callback?state=missing&code=code');
    assert.equal(invalidCallback.status,400);
    const stateCookie = `${STATE_COOKIE}=${seal({state:'valid-state',verifier:'test-verifier',redirectUri:process.env.GOOGLE_OAUTH_REDIRECT_URI,expiresAt:Date.now() + 600000})}`;
    // Query parameters must survive the file-based wrapper unchanged.
    const cancelled = await invoke(callback,'/api/auth/google/callback?state=valid-state&error=access_denied',stateCookie);
    assert.equal(cancelled.status,302);
    assert.equal(cancelled.headers.Location,'/?google=cancelled');
  } finally {process.env = env;}
});
