// assets/js/reviews-data.js
// Google reviews chosen by Nico Fix and published from the app: the public Firestore collection
// web_reviews, read with the REST API (no login), same as the gallery. Each document is
// { name (first name), stars (1-5), text, lang, at (ms) }. The page text is always set with
// textContent, so a review can never inject HTML.
export const REVIEWS_URL = 'https://firestore.googleapis.com/v1/projects/nico-fix-bot/databases/(default)/documents/web_reviews?pageSize=100';
export const MAX_REVIEWS = 6;
const MAX_TEXT = 1500;

function number(value) {
  if (value == null) return NaN;
  const raw = value.integerValue ?? value.doubleValue;
  return raw == null ? NaN : Number(raw);
}

function parseReview(document) {
  const f = document?.fields;
  if (!f) return null;
  const name = String(f.name?.stringValue ?? '').trim().split(/\s+/)[0] || '';
  const text = String(f.text?.stringValue ?? '').trim().slice(0, MAX_TEXT);
  const stars = number(f.stars);
  const at = number(f.at);
  // name may be '' (the app publishes an empty name when only an initial was left); still shown.
  if (!text) return null;
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) return null;
  if (!Number.isFinite(at)) return null;
  return { name, stars, text, lang: String(f.lang?.stringValue ?? ''), at };
}

// Valid reviews only, newest first, at most MAX_REVIEWS, with the allowed fields only.
export function reviewItems(json) {
  const items = [];
  for (const document of Array.isArray(json?.documents) ? json.documents : []) {
    const review = parseReview(document);
    if (review) items.push(review);
  }
  return items.sort((a, b) => b.at - a.at).slice(0, MAX_REVIEWS);
}
