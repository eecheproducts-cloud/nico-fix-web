// Address suggestions for reservar.html, from PDOK Locatieserver (free Dutch government service,
// the same one coverage.js uses). Pure helpers only; the dropdown wiring lives in booking.js.
// Only the text the person typed in the address field is sent to PDOK.

const SUGGEST_URL = 'https://api.pdok.nl/bzk/locatieserver/search/v3_1/suggest';
export const MIN_CHARS = 3;
export const MAX_SUGGESTIONS = 5;

export function suggestUrl(text) {
  const params = new URLSearchParams({ q: String(text).trim(), fq: 'type:adres', rows: String(MAX_SUGGESTIONS) });
  return `${SUGGEST_URL}?${params}`;
}

export function shouldSuggest(text) {
  return String(text ?? '').trim().length >= MIN_CHARS;
}

const POSTCODE_IN_TEXT = /\b([1-9]\d{3})\s?([A-Za-z]{2})\b/;

// "Straat 12, 3117RE Schiedam" -> "3117 RE" (null when there is no postcode).
export function extractPostcode(text) {
  const m = String(text ?? '').match(POSTCODE_IN_TEXT);
  return m ? `${m[1]} ${m[2].toUpperCase()}` : null;
}

// PDOK writes "3117RE"; show "3117 RE".
export function formatAddress(weergavenaam) {
  return String(weergavenaam ?? '').replace(POSTCODE_IN_TEXT, (_, d, l) => `${d} ${l.toUpperCase()}`).trim();
}

// Reads a PDOK suggest response into [{ id, label, postcode }], at most 5.
export function parseSuggestions(json) {
  const docs = json?.response?.docs;
  if (!Array.isArray(docs)) return [];
  const out = [];
  for (const doc of docs) {
    if (typeof doc?.weergavenaam !== 'string' || !doc.weergavenaam.trim()) continue;
    out.push({ id: String(doc.id ?? doc.weergavenaam), label: formatAddress(doc.weergavenaam), postcode: extractPostcode(doc.weergavenaam) });
    if (out.length === MAX_SUGGESTIONS) break;
  }
  return out;
}

const norm = (p) => String(p ?? '').replace(/\s+/g, '').toUpperCase();

// True when both postcodes are known and differ (the slots were loaded for another postcode).
export function postcodeDiffers(chosen, forSlots) {
  const a = norm(chosen);
  const b = norm(forSlots);
  return a !== '' && b !== '' && a !== b;
}
