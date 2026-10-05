import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parsePostcode, pdokUrl, readPdokResponse, distanceToArea, classifyPoint, checkPostcode,
} from '../assets/js/coverage.js';

// Real postcode centroids returned by PDOK Locatieserver (fetched 2026-10-05).
const REAL = {
  '3112AA Schiedam': [4.41173690, 51.91365813],
  '2511BT Den Haag': [4.31645627, 52.07736854],
  '1012JS Amsterdam': [4.89410619, 52.37291108],
  '1211AA Hilversum': [5.17663971, 52.23084375],
  '9711AA Groningen': [6.56155495, 53.21363579],
};

function fakeFetch(body, ok = true) {
  return async () => ({ ok, status: ok ? 200 : 500, json: async () => body });
}

function pdokBody(postcode, place, lon, lat) {
  return { response: { numFound: 1, docs: [{ postcode, woonplaatsnaam: place, centroide_ll: `POINT(${lon} ${lat})` }] } };
}

test('parsePostcode accepts Dutch formats and formats them the Dutch way', () => {
  assert.equal(parsePostcode(' 3011ab ').postcode, '3011 AB');
  assert.equal(parsePostcode('3011').postcode, '3011');
  assert.equal(parsePostcode('3011').letters, null);
});

test('parsePostcode rejects things that are not a Dutch postcode', () => {
  for (const code of ['', '30', 'abcd', '0123 AB', '30111', 'Rotterdam', '3011 SS', '3011 SA', '3011 SD']) {
    assert.equal(parsePostcode(code), null, code);
  }
});

test('pdokUrl asks for an exact postcode, or any postcode starting with four digits', () => {
  assert.match(pdokUrl(parsePostcode('3112 AA')), /q=postcode%3A3112AA&/);
  assert.match(pdokUrl(parsePostcode('3112')), /q=postcode%3A3112\*&/);
});

test('readPdokResponse reads the place and coordinates, and spots an empty answer', () => {
  const found = readPdokResponse(pdokBody('3112AA', 'Schiedam', 4.4117369, 51.91365813));
  assert.deepEqual(found, { found: true, postcode: '3112AA', place: 'Schiedam', lon: 4.4117369, lat: 51.91365813 });
  assert.deepEqual(readPdokResponse({ response: { numFound: 0, docs: [] } }), { found: false });
});

test('the three corner cities and Schiedam are covered', () => {
  for (const name of ['3112AA Schiedam', '2511BT Den Haag', '1012JS Amsterdam']) {
    assert.equal(classifyPoint(...REAL[name]), 'yes', name);
  }
});

test('Hilversum is at the edge, Groningen is far away', () => {
  assert.equal(classifyPoint(...REAL['1211AA Hilversum']), 'maybe');
  assert.equal(classifyPoint(...REAL['9711AA Groningen']), 'no');
});

test('a point inside the Rotterdam / The Hague / Amsterdam triangle is 0 km away', () => {
  assert.equal(distanceToArea(4.49, 52.16), 0); // Leiden
});

test('checkPostcode: a postcode that does not exist is reported as notfound', async () => {
  const result = await checkPostcode('1299 AB', fakeFetch({ response: { numFound: 0, docs: [] } }));
  assert.deepEqual(result, { status: 'notfound', postcode: '1299 AB', place: null });
});

test('checkPostcode: a real postcode returns the status and the place', async () => {
  const result = await checkPostcode('3112aa', fakeFetch(pdokBody('3112AA', 'Schiedam', ...REAL['3112AA Schiedam'])));
  assert.deepEqual(result, { status: 'yes', postcode: '3112 AA', place: 'Schiedam' });
});

test('checkPostcode: a near match for a different postcode counts as notfound', async () => {
  const result = await checkPostcode('3112 AB', fakeFetch(pdokBody('3112AA', 'Schiedam', ...REAL['3112AA Schiedam'])));
  assert.equal(result.status, 'notfound');
});

test('checkPostcode: a failed lookup is an error, not a wrong answer', async () => {
  assert.equal((await checkPostcode('3112 AA', fakeFetch({}, false))).status, 'error');
  const offline = async () => { throw new Error('offline'); };
  assert.equal((await checkPostcode('3112 AA', offline)).status, 'error');
});

test('checkPostcode: bad format never calls the lookup', async () => {
  let called = false;
  const result = await checkPostcode('hola', async () => { called = true; });
  assert.equal(result.status, 'invalid');
  assert.equal(called, false);
});
