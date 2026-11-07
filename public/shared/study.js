export function shuffleCards(cards, random = Math.random) {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function restoreStudy(raw, cards, reviews) {
  if (!raw || !Array.isArray(raw.ids) || !raw.ids.length ||
      raw.ids.some(id => typeof id !== 'string') || new Set(raw.ids).size !== raw.ids.length ||
      !Number.isInteger(raw.index) || raw.index < 0 || raw.index > raw.ids.length ||
      !Number.isInteger(raw.reviewed) || raw.reviewed < 0 || raw.reviewed > raw.index ||
      !Number.isFinite(raw.startedAt) || raw.startedAt <= 0 ||
      typeof raw.flipped !== 'boolean' ||
      (raw.requestId !== null && typeof raw.requestId !== 'string')) return null;
  const study = { ids:[...raw.ids], index:raw.index, reviewed:raw.reviewed,
    startedAt:raw.startedAt, flipped:raw.flipped, requestId:raw.requestId };
  // A request may have succeeded just before the tab closed.
  if (study.requestId && reviews.some(r => r.id === study.requestId && r.cardId === study.ids[study.index])) {
    study.index++; study.reviewed++; study.flipped = false; study.requestId = null;
  }
  const existing = new Set(cards.map(c => c.id));
  while (study.index < study.ids.length && !existing.has(study.ids[study.index])) {
    study.index++; study.flipped = false; study.requestId = null;
  }
  return study.index < study.ids.length ? study : null;
}
