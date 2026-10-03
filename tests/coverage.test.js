import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkPostcode } from '../assets/js/coverage.js';

test('core cities are covered', () => {
  for (const code of ['3011 AB', '3112', '2511CV', '1012 JS', '2011', '2611']) {
    assert.equal(checkPostcode(code).status, 'yes', code);
  }
});

test('edge of the area is a maybe', () => {
  for (const code of ['3511 AB', '1315', '1211']) {
    assert.equal(checkPostcode(code).status, 'maybe', code);
  }
});

test('far away is outside the area', () => {
  for (const code of ['9711 AB', '6211', '5611', '8011']) {
    assert.equal(checkPostcode(code).status, 'no', code);
  }
});

test('formats the postcode the Dutch way', () => {
  assert.equal(checkPostcode(' 3011ab ').postcode, '3011 AB');
  assert.equal(checkPostcode('3011').postcode, '3011');
});

test('rejects things that are not a Dutch postcode', () => {
  for (const code of ['', '30', 'abcd', '0123 AB', '30111', 'Rotterdam']) {
    assert.equal(checkPostcode(code).status, 'invalid', code);
  }
});
