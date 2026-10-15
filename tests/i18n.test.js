import { test } from 'node:test';
import assert from 'node:assert/strict';
import { t, translations } from '../assets/js/i18n.js';

test('translations has both en and es dictionaries', () => {
  assert.ok(translations.en);
  assert.ok(translations.es);
});

test('t returns the Spanish string for a known key', () => {
  assert.equal(t('es', 'hero_title'), 'Nico Fix');
});

test('t falls back to English when the key is missing in the requested language', () => {
  assert.equal(t('es', 'only_in_en_test_key'), t('en', 'only_in_en_test_key'));
});

test('t falls back to the key itself when missing everywhere', () => {
  assert.equal(t('en', 'totally_unknown_key'), 'totally_unknown_key');
});

test('every booking_* and promo_* key exists in both languages', () => {
  const wanted = (dict) => Object.keys(dict).filter((k) => /^(booking_|promo_|nav_book$)/.test(k)).sort();
  const en = wanted(translations.en);
  const es = wanted(translations.es);
  assert.ok(en.length > 30);
  assert.deepEqual(en, es);
});
