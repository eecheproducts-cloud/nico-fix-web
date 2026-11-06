import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { reviewItems, MAX_REVIEWS, REVIEWS_URL } from '../assets/js/reviews-data.js';
import { t } from '../assets/js/i18n.js';

const doc = (id, f) => ({
  name: `projects/nico-fix-bot/databases/(default)/documents/web_reviews/${id}`,
  fields: {
    ...(f.name !== undefined ? { name: { stringValue: f.name } } : {}),
    ...(f.stars !== undefined ? { stars: { integerValue: String(f.stars) } } : {}),
    ...(f.text !== undefined ? { text: { stringValue: f.text } } : {}),
    ...(f.lang !== undefined ? { lang: { stringValue: f.lang } } : {}),
    ...(f.at !== undefined ? { at: { integerValue: String(f.at) } } : {}),
    ...(f.extra ? { secret: { stringValue: 'x' } } : {}),
  },
});
const ok = (id, at, extra = {}) => doc(id, { name: 'Ana', stars: 5, text: 'Muy bien', lang: 'es', at, ...extra });

test('parses a document into the allowed fields only', () => {
  const [r] = reviewItems({ documents: [ok('a', 100, { extra: true })] });
  assert.deepEqual(r, { name: 'Ana', stars: 5, text: 'Muy bien', lang: 'es', at: 100 });
});

test('newest first by at', () => {
  const items = reviewItems({ documents: [ok('a', 1), ok('b', 3), ok('c', 2)] });
  assert.deepEqual(items.map((i) => i.at), [3, 2, 1]);
});

test('caps at 6', () => {
  const documents = Array.from({ length: 10 }, (_, i) => ok(`d${i}`, i));
  const items = reviewItems({ documents });
  assert.equal(MAX_REVIEWS, 6);
  assert.equal(items.length, 6);
  assert.equal(items[0].at, 9);
});

test('drops invalid documents', () => {
  const documents = [
    doc('no-text', { name: 'Ana', stars: 5, at: 1 }),
    doc('empty-text', { name: 'Ana', stars: 5, text: '   ', at: 1 }),
    doc('stars0', { name: 'Ana', stars: 0, text: 'x', at: 1 }),
    doc('stars6', { name: 'Ana', stars: 6, text: 'x', at: 1 }),
    doc('no-stars', { name: 'Ana', text: 'x', at: 1 }),
    doc('no-at', { name: 'Ana', stars: 5, text: 'x' }),
    ok('good', 5),
    null,
    {},
  ];
  assert.deepEqual(reviewItems({ documents }).map((i) => i.at), [5]);
  assert.deepEqual(reviewItems({}), []);
  assert.deepEqual(reviewItems(null), []);
});

test('a review without a name (empty or missing) is still kept, with an empty name', () => {
  const items = reviewItems({ documents: [
    ok('empty', 2, { name: '' }),
    doc('missing', { stars: 4, text: 'Bien', at: 1 }),
    ok('blank', 3, { name: '   ' }),
  ] });
  assert.equal(items.length, 3);
  assert.ok(items.every((i) => i.name === ''));
  const main = readFileSync(new URL('../assets/js/main.js', import.meta.url), 'utf8');
  assert.match(main, /if \(item\.name\)/);
});

test('keeps only the first name', () => {
  const [r] = reviewItems({ documents: [ok('a', 1, { name: 'Ana García' })] });
  assert.equal(r.name, 'Ana');
});

test('text is kept as plain text, never interpreted; reviews-data.js has no HTML sinks', () => {
  const evil = '<img src=x onerror=alert(1)> <b>hi</b>';
  const [r] = reviewItems({ documents: [ok('a', 1, { text: evil })] });
  assert.equal(r.text, evil);
  const src = readFileSync(new URL('../assets/js/reviews-data.js', import.meta.url), 'utf8');
  assert.doesNotMatch(src, /innerHTML|insertAdjacentHTML|outerHTML|document\.write/);
  const main = readFileSync(new URL('../assets/js/main.js', import.meta.url), 'utf8');
  const block = main.slice(main.indexOf('function renderReviews'), main.indexOf('async function loadReviews'));
  assert.ok(block.length > 50);
  assert.doesNotMatch(block, /innerHTML|insertAdjacentHTML/);
  assert.match(block, /textContent/);
});

test('reads the public web_reviews collection', () => {
  assert.match(REVIEWS_URL, /nico-fix-bot\/databases\/\(default\)\/documents\/web_reviews/);
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
  assert.match(html, /https:\/\/www\.google\.com\/search\?q=NICOFIX#lrd/);
});
