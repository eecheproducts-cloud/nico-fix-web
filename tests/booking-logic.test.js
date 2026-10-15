import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPayload, validateForm, groupDays, waLink, scaledSize, promoActive } from '../assets/js/booking-logic.js';

const form = { kind: 'visit', start: '2026-10-24T08:00:00.000Z', postcode: '3117 re', name: 'Ana', address: 'Calle 1', phone: '0612345678',
  description: '', manyThings: false, earlyStart: true, photos: [], lang: 'es', website: '', token: '' };

test('buildPayload keeps server field names and drops an empty token', () => {
  const p = buildPayload(form);
  assert.equal(p.postcode, '3117 re');
  assert.equal('token' in p, false);
  assert.equal(buildPayload({ ...form, token: 'abc' }).token, 'abc');
});

test('validateForm mirrors the server rules', () => {
  assert.deepEqual(validateForm(form, 'visit'), []);
  assert.deepEqual(validateForm({ ...form, earlyStart: false }, 'visit'), ['earlyStart']);
  assert.ok(validateForm({ ...form, kind: 'work' }, 'work').includes('description'));
  assert.ok(validateForm({ ...form, address: 'sin numero' }, 'visit').includes('address'));
});

test('groupDays labels days in the language and Amsterdam time', () => {
  const days = [{ date: '2026-10-25', slots: [{ start: '2026-10-25T07:00:00.000Z', end: 'x' }] }];
  const [day] = groupDays(days, 'es');
  assert.equal(day.slots[0].time, '08:00');
  assert.match(day.label, /domingo/);
});

test('waLink encodes the text for wa.me', () => {
  assert.equal(waLink('Hola, código NF-8'), 'https://wa.me/31610049118?text=Hola%2C%20c%C3%B3digo%20NF-8');
});

test('scaledSize keeps the ratio under 1600 px', () => {
  assert.deepEqual(scaledSize(4000, 3000), { width: 1600, height: 1200 });
  assert.deepEqual(scaledSize(800, 600), { width: 800, height: 600 });
});

test('promo ends after 31/12/2026', () => {
  assert.equal(promoActive(new Date('2026-12-31T12:00:00Z')), true);
  assert.equal(promoActive(new Date('2027-01-01T12:00:00Z')), false);
});
