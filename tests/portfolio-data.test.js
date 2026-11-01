import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sortPortfolio, portfolioItems } from '../assets/js/portfolio-data.js';

const labels = {
  room_bath: 'Baño',
  room_kitchen: 'Cocina',
  room_pergola: 'Pérgola',
  room_living: 'Living',
};
const labelFor = (key) => labels[key];

test('groups photos of the same work together, alphabetically, ignoring accents', () => {
  const items = [
    { image: 'p1', roomKey: 'room_pergola', stateKey: null },
    { image: 'k-after', roomKey: 'room_kitchen', stateKey: 'portfolio_after' },
    { image: 'b-after', roomKey: 'room_bath', stateKey: 'portfolio_after' },
    { image: 'p2', roomKey: 'room_pergola', stateKey: null },
    { image: 'b-before', roomKey: 'room_bath', stateKey: 'portfolio_before' },
    { image: 'k-before', roomKey: 'room_kitchen', stateKey: 'portfolio_before' },
    { image: 'l', roomKey: 'room_living', stateKey: 'portfolio_before' },
  ];
  assert.deepEqual(
    sortPortfolio(items, labelFor).map((item) => item.image),
    ['b-before', 'b-after', 'k-before', 'k-after', 'l', 'p1', 'p2'],
  );
});

test('within a group, before comes first, then after, then photos without a state', () => {
  const items = [
    { image: 'extra', roomKey: 'room_bath', stateKey: null },
    { image: 'after', roomKey: 'room_bath', stateKey: 'portfolio_after' },
    { image: 'before', roomKey: 'room_bath', stateKey: 'portfolio_before' },
  ];
  assert.deepEqual(sortPortfolio(items, labelFor).map((item) => item.image), ['before', 'after', 'extra']);
});

test('does not modify the original list', () => {
  const copy = portfolioItems.map((item) => ({ ...item }));
  sortPortfolio(portfolioItems, (key) => key);
  assert.deepEqual(portfolioItems, copy);
});

import { appPostItems, captionOf } from '../assets/js/portfolio-data.js';

const doc = (id, photos, captionEn, captionEs) => ({
  name: `projects/nico-fix-bot/databases/(default)/documents/web_portfolio/${id}`,
  fields: {
    photos: { arrayValue: { values: photos.map(([url, state]) => ({ mapValue: { fields: { url: { stringValue: url }, state: { stringValue: state } } } })) } },
    ...(captionEn ? { captionEn: { stringValue: captionEn }, captionEs: { stringValue: captionEs } } : {}),
  },
});
const S = 'https://firebasestorage.googleapis.com/v0/b/x/o/web%2Fp1-1.jpg?alt=media';

test('app posts become gallery items with their own caption and before/after', () => {
  const items = appPostItems({ documents: [doc('p1', [[S, 'before'], [S, 'after']], 'New taps', 'Grifería nueva')] });
  assert.deepEqual(items.map((i) => [i.roomKey, i.stateKey]), [['app_p1', 'portfolio_before'], ['app_p1', 'portfolio_after']]);
  assert.equal(captionOf(items[0], 'es', () => 'x'), 'Grifería nueva');
  assert.equal(captionOf(items[0], 'en', () => 'x'), 'New taps');
});

test('only Firebase Storage links; no caption yet says recent work', () => {
  const items = appPostItems({ documents: [doc('p2', [['https://evil.example/x.jpg', 'before'], [S, 'after']])] });
  assert.equal(items.length, 1);
  assert.equal(captionOf(items[0], 'es', (lang, key) => key), 'portfolio_recent');
  assert.deepEqual(appPostItems({}), []);
});

test('fixed items still use the i18n key', () => {
  assert.equal(captionOf({ roomKey: 'portfolio_room_tap' }, 'en', (lang, key) => `${lang}:${key}`), 'en:portfolio_room_tap');
});
