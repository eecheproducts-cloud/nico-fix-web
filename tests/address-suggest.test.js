import { test } from 'node:test';
import assert from 'node:assert/strict';
import { suggestUrl, shouldSuggest, extractPostcode, formatAddress, parseSuggestions, postcodeDiffers } from '../assets/js/address-suggest.js';

test('suggestUrl asks PDOK for 5 addresses and sends only the typed text', () => {
  const u = new URL(suggestUrl(' Schiedamseweg 12 '));
  assert.equal(u.origin + u.pathname, 'https://api.pdok.nl/bzk/locatieserver/search/v3_1/suggest');
  assert.equal(u.searchParams.get('q'), 'Schiedamseweg 12');
  assert.equal(u.searchParams.get('fq'), 'type:adres');
  assert.equal(u.searchParams.get('rows'), '5');
  assert.deepEqual([...u.searchParams.keys()].sort(), ['fq', 'q', 'rows']);
});

test('shouldSuggest needs 3 characters', () => {
  assert.equal(shouldSuggest('ab '), false);
  assert.equal(shouldSuggest('abc'), true);
  assert.equal(shouldSuggest(null), false);
});

test('extractPostcode finds the postcode in a weergavenaam', () => {
  assert.equal(extractPostcode('Straat 12, 3117RE Schiedam'), '3117 RE');
  assert.equal(extractPostcode('Straat 12, 3117 re Schiedam'), '3117 RE');
  assert.equal(extractPostcode('Straat 12, Schiedam'), null);
  assert.equal(extractPostcode(undefined), null);
});

test('formatAddress puts a space in the postcode', () => {
  assert.equal(formatAddress('Straat 12, 3117RE Schiedam'), 'Straat 12, 3117 RE Schiedam');
});

test('parseSuggestions reads docs, skips bad ones and caps at 5', () => {
  const docs = Array.from({ length: 7 }, (_, i) => ({ id: `adr-${i}`, weergavenaam: `Straat ${i + 1}, 3117RE Schiedam`, type: 'adres' }));
  docs.splice(1, 0, { id: 'x' }, { weergavenaam: '  ' });
  const out = parseSuggestions({ response: { docs } });
  assert.equal(out.length, 5);
  assert.deepEqual(out[0], { id: 'adr-0', label: 'Straat 1, 3117 RE Schiedam', postcode: '3117 RE' });
  assert.deepEqual(parseSuggestions({}), []);
  assert.deepEqual(parseSuggestions(null), []);
});

test('postcodeDiffers ignores spaces and case and needs both postcodes', () => {
  assert.equal(postcodeDiffers('3117 RE', '3117re'), false);
  assert.equal(postcodeDiffers('3117 RE', '3011 AB'), true);
  assert.equal(postcodeDiffers(null, '3011 AB'), false);
  assert.equal(postcodeDiffers('3117 RE', ''), false);
});
