import { randomUUID } from "node:crypto";
import { requireSession } from "../lib/auth.mjs";
import { json, body, sameOrigin, fail, HttpError } from "../lib/http.mjs";
import { readData, appendCards, updateCard, deleteCard } from "../lib/sheets.mjs";
import { validateCard, createCard, normalize, schedule, validateImport } from "../public/shared/model.js";
import { withGoogleIdentity } from '../lib/google-session.mjs';

const validId = id => typeof id === "string" && /^[a-zA-Z0-9_-]{1,80}$/.test(id);
export default async function handler(req, res) {
  return withGoogleIdentity(req,async () => {
  try {
    requireSession(req);
    if (req.method === "GET") {
      const { cards, reviews } = await readData();
      return json(res, 200, { cards, reviews });
    }
    if (req.method !== "POST") { res.setHeader("Allow", "GET, POST"); throw new HttpError(405, "Phương thức không được hỗ trợ."); }
    sameOrigin(req);
    const data = await body(req);
    if (!data || typeof data !== "object") throw new HttpError(400, "Dữ liệu không hợp lệ.");
    const store = await readData();
    if (data.action === "import") {
      let imported;
      try { imported = validateImport(data.data); } catch (e) { throw new HttpError(400, e.message); }
      const seenIds = new Set(store.cards.map(c => c.id));
      const seenQuestions = new Set(store.cards.map(c => normalize(c.question)));
      const unique = imported.cards.filter(c => {
        const question = normalize(c.question);
        if (seenIds.has(c.id) || seenQuestions.has(question)) return false;
        seenIds.add(c.id); seenQuestions.add(question); return true;
      });
      if (unique.length > 300) throw new HttpError(400, "Mỗi lần nhập tối đa 300 thẻ mới.");
      // Import card content as new learning material; current cloud progress always wins.
      const added = unique.map(c => createCard(c, c.id));
      await appendCards(added, store.map);
      return json(res, 200, { imported: added.length, cards: [...store.cards, ...added], reviews: store.reviews });
    }
    if (!validId(data.id)) throw new HttpError(400, "ID thẻ không hợp lệ.");
    const record = store.records.find(r => r.card.id === data.id);
    if (data.action === "create") {
      if (record) return json(res, 200, { card: record.card }); // Retried request.
      let card;
      try { card = createCard(data.card, data.id); } catch (e) { throw new HttpError(400, e.message); }
      if (!data.allowDuplicate && store.cards.some(c => normalize(c.question) === normalize(card.question))) throw new HttpError(409, "Câu hỏi này đã tồn tại. Mở thẻ cũ hoặc chọn vẫn tạo mới.");
      await appendCards([card], store.map);
      return json(res, 201, { card });
    }
    if (!record) throw new HttpError(404, "Thẻ đã bị xóa hoặc không tồn tại.");
    if (data.action === "review") {
      if (!validId(data.reviewId)) throw new HttpError(400, "ID lượt ôn không hợp lệ.");
      const previous = store.reviews.find(r => r.id === data.reviewId);
      if (previous) return json(res, 200, { card: record.card, review: previous });
    }
    if (data.expectedVersion !== record.card.updatedAt) throw new HttpError(409, "Thẻ đã thay đổi ở nơi khác. Tải lại dữ liệu trước khi lưu.");
    if (data.action === "delete") {
      await deleteCard(record, store.map);
      return json(res, 200, { ok: true });
    }
    let card, review;
    if (data.action === "update") {
      try { card = { ...record.card, ...validateCard(data.card), updatedAt: new Date().toISOString() }; } catch (e) { throw new HttpError(400, e.message); }
      if (!data.allowDuplicate && store.cards.some(c => c.id !== card.id && normalize(c.question) === normalize(card.question))) throw new HttpError(409, "Câu hỏi này đã tồn tại.");
    } else if (data.action === "review") {
      try { card = schedule(record.card, data.rating); } catch (e) { throw new HttpError(400, e.message); }
      review = { id: data.reviewId || randomUUID(), cardId: card.id, rating: data.rating, at: card.lastReviewedAt };
    } else throw new HttpError(400, "Thao tác không hợp lệ.");
    await updateCard(card, record, store.map, review);
    return json(res, 200, { card, ...(review ? { review } : {}) });
  } catch (error) { fail(res, error); }
  });
}
