import {SERVICES} from './catalog.js';
export {SERVICES} from './catalog.js';
export const DAY = 86400000;

export function normalize(text) {
  return String(text).normalize("NFKC").toLowerCase()
    .replace(/security\s+groups?/g, "sg").replace(/network\s+acls?/g, "nacl")
    .replace(/\bec2 instances?\b/g, "ec2").replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}

export function similarity(a, b) {
  const left = normalize(a), right = normalize(b);
  if (!left || !right) return 0;
  if (left === right) return 1;
  // Ignore common question wording so unrelated services do not look duplicated.
  const stop = new Set('và hoặc là gì như thế nào khi nên sao vì để có một các ở của với trong được khác nhau điểm dùng does what how when why is are the a an'.split(' '));
  const x = new Set(left.split(" ").filter(w => !stop.has(w))), y = new Set(right.split(" ").filter(w => !stop.has(w)));
  const intersection = [...x].filter(word => y.has(word)).length;
  return intersection / (new Set([...x, ...y]).size || 1);
}

export function duplicates(question, cards, excludeId) {
  return cards.filter(card => card.id !== excludeId)
    .map(card => ({ card, score: similarity(question, card.question) }))
    .filter(match => match.score >= 0.46).sort((a, b) => b.score - a.score).slice(0, 3);
}

export function schedule(card, rating, now = new Date()) {
  if (!["again", "hard", "good", "easy"].includes(rating)) throw new Error("Mức đánh giá không hợp lệ.");
  const interval = rating === "again" ? 0 : rating === "hard" ? Math.max(1, Math.round((card.interval || 1) * 1.2))
    : rating === "easy" ? Math.max(4, Math.round((card.interval || 1) * 3))
    : Math.max(1, Math.round((card.interval || 0) * 2.2));
  return { ...card, interval, repetitions: rating === "again" ? 0 : (card.repetitions || 0) + 1,
    dueAt: new Date(now.getTime() + (rating === "again" ? 10 * 60000 : interval * DAY)).toISOString(),
    lastReviewedAt: now.toISOString(), updatedAt: now.toISOString(),
  };
}

export function isDue(card, now = Date.now()) { return !card.dueAt || Date.parse(card.dueAt) <= now; }
export function mastery(card) { return card.repetitions >= 3 ? "Đã nhớ" : card.lastReviewedAt ? "Đang học" : "Mới"; }
export function localDate(date = new Date()) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function validateCard(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Dữ liệu thẻ không hợp lệ.");
  const text = (key, max, required = false) => {
    const v = input[key] ?? "";
    if (typeof v !== "string" || v.length > max || (required && !v.trim())) throw new Error(`Trường ${key} không hợp lệ (tối đa ${max} ký tự).`);
    return v.trim();
  };
  const source = text("source", 2048);
  if (source) {
    let url;
    try { url = new URL(source); } catch { throw new Error("Link nguồn không hợp lệ."); }
    if (!["https:", "http:"].includes(url.protocol)) throw new Error("Link nguồn phải bắt đầu bằng https:// hoặc http://.");
  }
  const service = text("service", 40, true);
  if (!SERVICES.includes(service)) throw new Error("Dịch vụ không hợp lệ.");
  if (!Array.isArray(input.tags) || input.tags.length > 8 || input.tags.some(t => typeof t !== "string" || t.length > 40)) throw new Error("Tối đa 8 nhãn, mỗi nhãn 40 ký tự.");
  return { question: text("question", 1000, true), answer: text("answer", 10000, true), explanation: text("explanation", 10000),
    service, tags: [...new Set(input.tags.map(t => t.trim()).filter(Boolean))], note: text("note", 10000), source, favorite: input.favorite === true };
}

export function createCard(data, id, now = new Date()) {
  return { ...validateCard(data), id, createdAt: now.toISOString(), updatedAt: now.toISOString(), dueAt: now.toISOString(),
    lastReviewedAt: "", interval: 0, repetitions: 0 };
}

export function validateImport(data) {
  if (!data || data.version !== 1 || !Array.isArray(data.cards) || data.cards.length > 3000 || !Array.isArray(data.reviews) || data.reviews.length > 100000) throw new Error("File sao lưu không hợp lệ hoặc quá lớn.");
  const ids = new Set();
  const cards = data.cards.map(c => {
    if (!c || typeof c.id !== "string" || !/^[a-zA-Z0-9_-]{1,80}$/.test(c.id) || ids.has(c.id)) throw new Error("ID thẻ bị trùng hoặc không hợp lệ.");
    ids.add(c.id);
    const iso = (value, optional = false) => {
      if (optional && !value) return "";
      if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) throw new Error("Ngày trong file không hợp lệ.");
      return new Date(value).toISOString();
    };
    if (!Number.isInteger(c.interval) || c.interval < 0 || c.interval > 100000 || !Number.isInteger(c.repetitions) || c.repetitions < 0) throw new Error("Tiến độ không hợp lệ.");
    return { ...validateCard(c), id: c.id, createdAt: iso(c.createdAt), updatedAt: iso(c.updatedAt), dueAt: iso(c.dueAt), lastReviewedAt: iso(c.lastReviewedAt, true), interval: c.interval, repetitions: c.repetitions };
  });
  const reviewIds = new Set();
  const reviews = data.reviews.map(r => {
    if (!r || typeof r.id !== "string" || !/^[a-zA-Z0-9_-]{1,80}$/.test(r.id) || reviewIds.has(r.id) || typeof r.cardId !== "string" || !["again", "hard", "good", "easy"].includes(r.rating) || typeof r.at !== "string" || !Number.isFinite(Date.parse(r.at))) throw new Error("Lịch sử ôn tập không hợp lệ.");
    reviewIds.add(r.id);
    return { id: r.id, cardId: r.cardId, rating: r.rating, at: new Date(r.at).toISOString() };
  });
  return { cards, reviews };
}
