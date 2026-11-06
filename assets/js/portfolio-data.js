// assets/js/portfolio-data.js
// The order of this list does not matter: sortPortfolio() groups photos of the same work together
// (alphabetically by caption in the page language) with "before" ahead of "after".
// Real photos of Nico's work. Schiedam renovation: "before" = original listing photos
// (professional, pre-purchase state); "after" = phone photos of Nico's finished work.
// Pergola: two photos of a pergola Nico assembled. Tiles/taps: tiled shower with brass shower set,
// and a brass wall-mounted tap. Also switches + dimmer, IKEA wardrobe, relocated ceiling light, shower mixer. Images live in assets/img/portfolio/.
export const portfolioItems = [
  { image: 'assets/img/portfolio/tiles-shower.jpg', roomKey: 'portfolio_room_tiles_shower', stateKey: null },
  { image: 'assets/img/portfolio/tap-wall.jpg', roomKey: 'portfolio_room_tap', stateKey: null },
  { image: 'assets/img/portfolio/pergola-1.jpg', roomKey: 'portfolio_room_pergola', stateKey: null },
  { image: 'assets/img/portfolio/pergola-2.jpg', roomKey: 'portfolio_room_pergola', stateKey: null },
  { image: 'assets/img/portfolio/kitchen-before-after.jpg', imageEn: 'assets/img/portfolio/kitchen-before-after-en.jpg', roomKey: 'portfolio_room_kitchen', stateKey: null },
  { image: 'assets/img/portfolio/bathroom-before-after.jpg', imageEn: 'assets/img/portfolio/bathroom-before-after-en.jpg', roomKey: 'portfolio_room_bathroom', stateKey: null },
  { image: 'assets/img/portfolio/switches-dimmer.jpg', roomKey: 'portfolio_room_switches', stateKey: null },
  { image: 'assets/img/portfolio/ikea-wardrobe.jpg', roomKey: 'portfolio_room_ikea', stateKey: null },
  { image: 'assets/img/portfolio/ceiling-light-moved.jpg', roomKey: 'portfolio_room_light_move', stateKey: null },
  { image: 'assets/img/portfolio/shower-thermostat.jpg', roomKey: 'portfolio_room_shower_mixer', stateKey: null },
  { image: 'assets/img/portfolio/tiles-kitchen-before.jpg', roomKey: 'portfolio_room_tiles_kitchen', stateKey: 'portfolio_before' },
  { image: 'assets/img/portfolio/tiles-kitchen-after.jpg', roomKey: 'portfolio_room_tiles_kitchen', stateKey: 'portfolio_after' },
  { image: 'assets/img/portfolio/living-before.webp', roomKey: 'portfolio_room_living', stateKey: 'portfolio_before' },
];

// imageEn (optional): English version of an image with text baked in; used when the page language is English.
const STATE_ORDER = { portfolio_before: 0, portfolio_after: 1 };

function sortableLabel(text) {
  return String(text ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

// labelFor(roomKey, item) returns the caption in the current page language.
export function sortPortfolio(items, labelFor) {
  return items
    .map((item, position) => ({ item, position, label: sortableLabel(labelFor(item.roomKey, item)) }))
    .sort((a, b) =>
      a.label.localeCompare(b.label)
      || (STATE_ORDER[a.item.stateKey] ?? 2) - (STATE_ORDER[b.item.stateKey] ?? 2)
      || a.position - b.position)
    .map(({ item }) => item);
}

// Photos posted from the Nico Fix app ("📣 Postear"): the public Firestore collection web_portfolio,
// read with the REST API (no login). Each document is { photos: [{ url, state }], captionEn,
// captionEs, at }; the caption arrives a minute later, until then the photo says "Recent work".
// Only https links to Firebase Storage are taken.
export const APP_POSTS_URL = 'https://firestore.googleapis.com/v1/projects/nico-fix-bot/databases/(default)/documents/web_portfolio?pageSize=100';
const STORAGE_PREFIX = 'https://firebasestorage.googleapis.com/';
const STATE_KEYS = { before: 'portfolio_before', after: 'portfolio_after' };

export function appPostItems(json) {
  const items = [];
  for (const document of json?.documents || []) {
    const f = document.fields || {};
    const caption = { en: f.captionEn?.stringValue || '', es: f.captionEs?.stringValue || '' };
    const id = String(document.name || '').split('/').pop();
    for (const value of f.photos?.arrayValue?.values || []) {
      const p = value.mapValue?.fields || {};
      const url = p.url?.stringValue || '';
      if (!url.startsWith(STORAGE_PREFIX)) continue;
      items.push({ image: url, roomKey: `app_${id}`, caption, stateKey: STATE_KEYS[p.state?.stringValue] || null });
    }
  }
  return items;
}

// The caption of any item: app posts carry their own, the rest use the i18n key.
export function captionOf(item, lang, t) {
  if (!item.caption) return t(lang, item.roomKey);
  return item.caption[lang] || item.caption.es || item.caption.en || t(lang, 'portfolio_recent');
}
