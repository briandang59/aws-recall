import { createSign, createHash } from "node:crypto";
import { HttpError } from "./http.mjs";
import { validateImport } from "../public/shared/model.js";
import { currentGoogleToken } from './google-session.mjs';

export const FIELDS = ["id", "question", "answer", "explanation", "service", "tags", "note", "source", "favorite", "createdAt", "updatedAt", "dueAt", "lastReviewedAt", "interval", "repetitions"];
let cachedToken;
let metadata;
let initPromise;

async function accessToken() {
  const refreshToken = currentGoogleToken();
  const tokenKey = createHash('sha256').update([process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,process.env.GOOGLE_PRIVATE_KEY,process.env.GOOGLE_CLIENT_ID,process.env.GOOGLE_CLIENT_SECRET,refreshToken].join('|')).digest('hex');
  if (cachedToken && cachedToken.key === tokenKey && cachedToken.expires > Date.now()) return cachedToken.value;
  let form;
  if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
  const now = Math.floor(Date.now() / 1000);
  const base64 = value => Buffer.from(JSON.stringify(value)).toString("base64url");
  const payload = `${base64({ alg: "RS256", typ: "JWT" })}.${base64({ iss: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, scope: "https://www.googleapis.com/auth/spreadsheets", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 })}`;
  const signature = createSign("RSA-SHA256").update(payload).sign(process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")).toString("base64url");
    form = new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${payload}.${signature}` });
  } else {
    form = new URLSearchParams({ grant_type:'refresh_token',client_id:process.env.GOOGLE_CLIENT_ID,client_secret:process.env.GOOGLE_CLIENT_SECRET,refresh_token:refreshToken });
  }
  const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", body: form, signal: AbortSignal.timeout(12000) });
  const data = await response.json();
  if (!response.ok || !data.access_token) {
    if (data.error === 'invalid_grant') throw new HttpError(503,'Quyền truy cập Google đã hết hạn hoặc bị thu hồi. Hãy kết nối lại Google. Nếu bạn dùng token trong môi trường, chạy lại npm run google:connect rồi cập nhật token.');
    throw new Error(`Google OAuth failed (${response.status})`);
  }
  cachedToken = { key:tokenKey,value: data.access_token, expires: Date.now() + (data.expires_in - 120) * 1000 };
  return cachedToken.value;
}

async function google(path = "", options = {}) {
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(process.env.GOOGLE_SHEET_ID)}${path}`, {
    ...options, headers: { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json" }, signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    if (response.status === 429) throw new HttpError(429, "Google Sheets đang giới hạn lượt truy cập. Vui lòng thử lại sau một phút.");
    throw new Error(`Google Sheets returned ${response.status}`);
  }
  return response.json();
}
export function values(card) {
  return FIELDS.map(key => key === "tags" ? JSON.stringify(card.tags) : card[key]);
}
export function parseCard(row) {
  const c = Object.fromEntries(FIELDS.map((field, i) => [field, row[i] ?? ""]));
  try { c.tags = JSON.parse(c.tags || "[]"); } catch { throw new HttpError(422, `Nhãn của thẻ ${c.id} trong Sheets không hợp lệ.`); }
  c.favorite = c.favorite === true || c.favorite === "TRUE" || c.favorite === "true";
  c.interval = Number(c.interval); c.repetitions = Number(c.repetitions);
  try { return validateImport({ version: 1, cards: [c], reviews: [] }).cards[0]; }
  catch { throw new HttpError(422, `Dữ liệu thẻ ${c.id} trong Sheets không hợp lệ. Kiểm tra các cột theo README.`); }
}
const cells = row => row.map(v => ({ userEnteredValue: typeof v === "boolean" ? { boolValue: v } : typeof v === "number" ? { numberValue: v } : { stringValue: String(v ?? "") } }));
const append = (sheetId, rows) => ({ appendCells: { sheetId, rows: rows.map(row => ({ values: cells(row) })), fields: "userEnteredValue" } });

async function initialize() {
  const doc = await google("?fields=sheets.properties");
  const properties = doc.sheets?.map(s => s.properties) || [];
  const missing = ["Cards", "Reviews"].filter(name => !properties.some(s => s.title === name));
  if (missing.length) {
    const result = await google(":batchUpdate", { method: "POST", body: JSON.stringify({ requests: missing.map(title => ({ addSheet: { properties: { title } } })) }) });
    for (const reply of result.replies) properties.push(reply.addSheet.properties);
  }
  const map = Object.fromEntries(properties.map(s => [s.title, s.sheetId]));
  const headers = await google("/values:batchGet?ranges=Cards!A1:O1&ranges=Reviews!A1:D1");
  const expected = [FIELDS, ["id", "cardId", "rating", "at"]];
  const requests = [];
  for (let i = 0; i < 2; i++) {
    const title = i === 0 ? "Cards" : "Reviews";
    const row = headers.valueRanges[i]?.values?.[0];
    if (!row?.length) requests.push(append(map[title], [expected[i]]));
    else if (expected[i].some((v, index) => row[index] !== v)) throw new HttpError(422, `Cột trong tab ${title} không đúng định dạng. Dùng Google Sheet trống hoặc khôi phục tiêu đề theo README.`);
  }
  if (requests.length) await google(":batchUpdate", { method: "POST", body: JSON.stringify({ requests }) });
  return map;
}
async function ensure() {
  if (metadata) return metadata;
  if (!initPromise) initPromise = initialize().then(value => { metadata = value; return value; }).finally(() => { initPromise = null; });
  return initPromise;
}
export async function readData() {
  const map = await ensure();
  const result = await google("/values:batchGet?ranges=Cards!A2:O&ranges=Reviews!A2:D");
  const rows = result.valueRanges[0]?.values || [];
  const records = rows.map((row, index) => row[0] ? { card: parseCard(row), row: index + 1 } : null).filter(Boolean);
  const reviews = (result.valueRanges[1]?.values || []).filter(row => row[0]).map(([id, cardId, rating, at]) => ({ id, cardId, rating, at }));
  return { cards: records.map(r => r.card), reviews, records, map };
}
export async function appendCards(cards, map) {
  if (!cards.length) return;
  await google(":batchUpdate", { method: "POST", body: JSON.stringify({ requests: [append(map.Cards, cards.map(values))] }) });
}
export async function updateCard(card, record, map, review) {
  const requests = [{ updateCells: { start: { sheetId: map.Cards, rowIndex: record.row, columnIndex: 0 }, rows: [{ values: cells(values(card)) }], fields: "userEnteredValue" } }];
  if (review) requests.push(append(map.Reviews, [[review.id, review.cardId, review.rating, review.at]]));
  await google(":batchUpdate", { method: "POST", body: JSON.stringify({ requests }) });
}
export async function deleteCard(record, map) {
  // Clear only this row; retaining row positions avoids shifting other card records.
  await google(":batchUpdate", { method: "POST", body: JSON.stringify({ requests: [{ updateCells: { range: { sheetId: map.Cards, startRowIndex: record.row, endRowIndex: record.row + 1, startColumnIndex: 0, endColumnIndex: FIELDS.length }, fields: "userEnteredValue" } }] }) });
}
