import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { reviewItems, reviewText, MAX_REVIEWS, REVIEWS_URL } from '../assets/js/reviews-data.js';
import { t } from '../assets/js/i18n.js';

const r = (id, f = {}) => ({ id, name: 'Ana', stars: 5, text: 'Muy bien', lang: 'es', at: '2026-01-01', publishedAt: '2026-01-02', ...f });
const day = (n) => `2026-03-${String(n).padStart(2, '0')}`;

test('parses an entry into the allowed fields only', () => {
  const [item] = reviewItems({ reviews: [r('a', { secret: 'x' })], skipped: ['zzz'] });
  assert.deepEqual(item, { name: 'Ana', stars: 5, text: 'Muy bien', textEs: 'Muy bien', lang: 'es', at: '2026-01-01' });
});

test('Spanish page shows textEs, English page shows text', () => {
  const [item] = reviewItems({ reviews: [r('a', { text: 'Great', textEs: 'Genial' })] });
  assert.equal(reviewText(item, 'es'), 'Genial');
  assert.equal(reviewText(item, 'en'), 'Great');
});

test('newest first by at', () => {
  const items = reviewItems({ reviews: [r('a', { at: day(1) }), r('b', { at: day(3) }), r('c', { at: day(2) })] });
  assert.deepEqual(items.map((i) => i.at), [day(3), day(2), day(1)]);
});

test('caps at 6', () => {
  const reviews = Array.from({ length: 10 }, (_, i) => r(`d${i}`, { at: day(i + 1) }));
  const items = reviewItems({ reviews });
  assert.equal(MAX_REVIEWS, 6);
  assert.equal(items.length, 6);
  assert.equal(items[0].at, day(10));
});

test('drops invalid entries', () => {
  const reviews = [
    r('no-text', { text: undefined }),
    r('empty-text', { text: '   ' }),
    r('stars0', { stars: 0 }),
    r('stars6', { stars: 6 }),
    r('stars-string', { stars: '5' }),
    r('stars-half', { stars: 4.5 }),
    r('no-stars', { stars: undefined }),
    r('no-at', { at: undefined }),
    r('ms-at', { at: 1793954821000 }),
    r('bad-at', { at: '2026-02-31' }),
    r('garbage-at', { at: 'yesterday' }),
    r('good', { at: day(5) }),
    null,
    'x',
    {},
  ];
  assert.deepEqual(reviewItems({ reviews }).map((i) => i.at), [day(5)]);
  assert.deepEqual(reviewItems({}), []);
  assert.deepEqual(reviewItems({ reviews: 'x' }), []);
  assert.deepEqual(reviewItems({ reviews: [], skipped: ['a'] }), []);
  assert.deepEqual(reviewItems(null), []);
});

test('unknown lang becomes empty', () => {
  assert.equal(reviewItems({ reviews: [r('a', { lang: 'fr' })] })[0].lang, '');
  assert.equal(reviewItems({ reviews: [r('a', { lang: 'nl' })] })[0].lang, 'nl');
});

test('a review without a name (empty or missing) is still kept, with an empty name', () => {
  const items = reviewItems({ reviews: [
    r('empty', { name: '', at: day(2) }),
    r('missing', { name: undefined, at: day(1) }),
    r('blank', { name: '   ', at: day(3) }),
  ] });
  assert.equal(items.length, 3);
  assert.ok(items.every((i) => i.name === ''));
  const main = readFileSync(new URL('../assets/js/main.js', import.meta.url), 'utf8');
  assert.match(main, /if \(item\.name\)/);
});

test('keeps only the first name', () => {
  const [item] = reviewItems({ reviews: [r('a', { name: 'Ana García' })] });
  assert.equal(item.name, 'Ana');
});

test('text is kept as plain text, never interpreted; reviews-data.js has no HTML sinks', () => {
  const evil = '<img src=x onerror=alert(1)> <b>hi</b>';
  const [item] = reviewItems({ reviews: [r('a', { text: evil })] });
  assert.equal(item.text, evil);
  const src = readFileSync(new URL('../assets/js/reviews-data.js', import.meta.url), 'utf8');
  assert.doesNotMatch(src, /innerHTML|insertAdjacentHTML|outerHTML|document\.write/);
  const main = readFileSync(new URL('../assets/js/main.js', import.meta.url), 'utf8');
  const block = main.slice(main.indexOf('function renderReviews'), main.indexOf('async function loadReviews'));
  assert.ok(block.length > 50);
  assert.doesNotMatch(block, /innerHTML|insertAdjacentHTML/);
  assert.match(block, /textContent/);
});

test('reads the static file with a relative URL, no Firestore', () => {
  assert.equal(REVIEWS_URL, 'assets/data/reviews.json');
  const src = readFileSync(new URL('../assets/js/reviews-data.js', import.meta.url), 'utf8');
  assert.doesNotMatch(src, /firestore\.googleapis/);
});

test('the shipped reviews.json is valid: every review shows, unique ids, none also skipped', () => {
  const json = JSON.parse(readFileSync(new URL('../assets/data/reviews.json', import.meta.url), 'utf8'));
  assert.ok(Array.isArray(json.reviews) && json.reviews.length > 0);
  assert.ok(Array.isArray(json.skipped));
  const ids = json.reviews.map((r) => r.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const r of json.reviews) {
    assert.ok(typeof r.id === 'string' && r.id.length > 0);
    assert.match(r.publishedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(!json.skipped.includes(r.id));
    assert.doesNotMatch(r.name, /\s/);
  }
  assert.equal(reviewItems(json).length, Math.min(json.reviews.length, MAX_REVIEWS));
  assert.ok(json.reviews.some((r) => r.id === 'c6a3553e0704a96d44fb' && r.name === 'Carolien'));
});

test('home has the section hidden by default, the i18n keys and no review markup or rating', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.doesNotMatch(html, /aggregateRating|schema\.org\/Review|"@type":\s*"Review"|ratingValue|reviewRating/);
  assert.match(html, /id="reviews"[^>]*\bhidden\b/);
  assert.ok(html.indexOf('id="reviews"') < html.indexOf('class="referral"'));
  for (const lang of ['en', 'es']) {
    assert.notEqual(t(lang, 'reviews_title'), 'reviews_title');
    assert.notEqual(t(lang, 'reviews_note'), 'reviews_note');
    assert.notEqual(t(lang, 'reviews_note_link'), 'reviews_note_link');
    const all = [t(lang, 'reviews_title'), t(lang, 'reviews_note'), t(lang, 'reviews_note_link')].join(' ');
    assert.doesNotMatch(all, /verified|verificad/i);
    assert.doesNotMatch(all, /[—–]/);
  }
  assert.match(html, /https:\/\/www\.google\.com\/maps\?cid=13805226269467129554/);
});
