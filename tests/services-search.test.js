import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalize, buildSearchIndex, searchServices } from '../assets/js/services-search.js';
import { servicesData } from '../assets/js/services-data.js';
import { translations } from '../assets/js/i18n.js';

const labels = {
  en: { outdoor: 'Outdoor', plumbing: 'Plumbing', assembly: 'Assembly' },
  es: { outdoor: 'Exterior', plumbing: 'Plomería', assembly: 'Montaje' },
};
const index = buildSearchIndex(servicesData, translations, labels);

test('normalize lowercases and strips accents', () => {
  assert.equal(normalize('Pérgola  ÑANDÚ'), 'pergola nandu');
});

test('finds pergola from its first 3 letters, in either language', () => {
  assert.ok(searchServices('per', index).matches.includes('svc_pergola'));
  assert.ok(searchServices('pérg', index).matches.includes('svc_pergola'));
  assert.ok(searchServices('Pergola', index).matches.includes('svc_pergola'));
});

test('a Spanish query finds a service whatever the page language', () => {
  assert.ok(searchServices('bicicleta', index).matches.includes('svc_bike_assembly'));
  assert.ok(searchServices('bike', index).matches.includes('svc_bike_assembly'));
});

test('synonyms work, including common Dutch words', () => {
  assert.ok(searchServices('canilla', index).matches.includes('svc_tap_replacement'));
  assert.ok(searchServices('kraan', index).matches.includes('svc_tap_replacement'));
  assert.ok(searchServices('fiets', index).matches.includes('svc_bike_assembly'));
});

test('every word of a multi-word query must match', () => {
  const result = searchServices('ikea cocina', index).matches;
  assert.ok(result.includes('svc_ikea_kitchen'));
  assert.ok(!result.includes('svc_bike_assembly'));
});

test('a typo gives suggestions instead of an empty result', () => {
  const result = searchServices('pergloa', index);
  assert.deepEqual(result.matches, []);
  assert.ok(result.suggestions.includes('svc_pergola'));
  assert.ok(result.suggestions.length <= 3);
});

test('queries shorter than 2 characters do not filter', () => {
  assert.deepEqual(searchServices('p', index), { matches: [], suggestions: [], active: false });
  assert.deepEqual(searchServices('   ', index), { matches: [], suggestions: [], active: false });
});

test('nonsense returns no matches and no suggestions', () => {
  const result = searchServices('xyzqwv', index);
  assert.deepEqual(result.matches, []);
  assert.deepEqual(result.suggestions, []);
  assert.equal(result.active, true);
});
