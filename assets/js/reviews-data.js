// assets/js/reviews-data.js
// Google reviews shown on the home page (#reviews). They live in a static file committed in this
// repo, assets/data/reviews.json, maintained by a weekly Claude routine after the owner approves
// each review. Format:
//   { "reviews": [ { "id": "<stable id>", "name": "<first name or empty>", "stars": 1-5,
//                    "text": "<English>", "textEs": "<Spanish>", "lang": "en|es|nl|", "at": "YYYY-MM-DD",
//                    "publishedAt": "YYYY-MM-DD" } ],
//     "skipped": [ "<id>", ... ] }
// text is shown on the English page and textEs on the Spanish one (falls back to text when missing).
// lang = language the client originally wrote in (informational).
// skipped = ids of reviews the owner rejected, so the routine never asks again; the site ignores
// it. at = date of the review. Entries without text, with stars outside 1-5 or with an invalid date
// are dropped. Only the first name is shown; an empty name is allowed (card without a name line).
// Newest first by at, at most MAX_REVIEWS. The page text is always set with textContent, so a
// review can never inject HTML. If the file is missing, empty or fails, the section stays hidden.
export const REVIEWS_URL = 'assets/data/reviews.json';
export const MAX_REVIEWS = 6;
const MAX_TEXT = 1500;
const LANGS = new Set(['en', 'es', 'nl']);

// A real calendar date written as YYYY-MM-DD (2026-02-31 is rejected).
function isoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return '';
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value ? value : '';
}

function parseReview(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const name = String(entry.name ?? '').trim().split(/\s+/)[0] || '';
  const text = String(entry.text ?? '').trim().slice(0, MAX_TEXT);
  const textEs = String(entry.textEs ?? '').trim().slice(0, MAX_TEXT) || text;
  const stars = entry.stars;
  const at = isoDate(entry.at);
  if (!text) return null;
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) return null;
  if (!at) return null;
  const lang = LANGS.has(entry.lang) ? entry.lang : '';
  return { name, stars, text, textEs, lang, at };
}

// Text for the page language: Spanish page shows textEs, any other shows text.
export function reviewText(item, pageLang) {
  return pageLang === 'es' ? item.textEs : item.text;
}

// Valid reviews only, newest first, at most MAX_REVIEWS, with the allowed fields only.
export function reviewItems(json) {
  const items = [];
  for (const entry of Array.isArray(json?.reviews) ? json.reviews : []) {
    const review = parseReview(entry);
    if (review) items.push(review);
  }
  return items.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0)).slice(0, MAX_REVIEWS);
}
