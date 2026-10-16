import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPayload, validateForm, groupDays, waLink, scaledSize, promoActive, submitLabelKey, doneKey, showsEarlyStart, missingMessage, knownFields, dayChips, groupByPeriod, formatSummary, dayHasNearby, anyNearby, slotPrice, fillText } from '../assets/js/booking-logic.js';

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
  assert.deepEqual(validateForm({ ...form, earlyStart: false }, 'visit'), []);
  assert.deepEqual(validateForm({ ...form, kind: 'work', description: 'Pintar', earlyStart: false }, 'work'), ['earlyStart']);
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

test('promo uses the Amsterdam date, not UTC', () => {
  // 23:30 UTC on 31/12 is already 1 January in Amsterdam
  assert.equal(promoActive(new Date('2026-12-31T23:30:00Z')), false);
  // 22:30 UTC on 31/12 is 23:30 in Amsterdam
  assert.equal(promoActive(new Date('2026-12-31T22:30:00Z')), true);
});

test('submit label and done text follow kind and manyThings', () => {
  assert.equal(submitLabelKey('visit', false), 'booking_submit_visit');
  assert.equal(submitLabelKey('visit', true), 'booking_submit_work');
  assert.equal(submitLabelKey('work', false), 'booking_submit_work');
  assert.equal(doneKey('visit', false), 'booking_done_visit');
  assert.equal(doneKey('visit', true), 'booking_done_visit_request');
  assert.equal(doneKey('work', true), 'booking_done_work');
});

test('early-start box is only for the work day and a visit never sends true', () => {
  assert.equal(showsEarlyStart('visit'), false);
  assert.equal(showsEarlyStart('work'), true);
  assert.equal(buildPayload({ ...form, kind: 'visit', earlyStart: true }).earlyStart, false);
  assert.equal(buildPayload({ ...form, kind: 'work', earlyStart: true }).earlyStart, true);
});

test('missingMessage names the fields in page order and ignores unknown ones', () => {
  const tr = (k) => ({ booking_missing: 'Falta', booking_f_name: 'nombre', booking_f_address: 'dirección' }[k] || k);
  assert.equal(missingMessage(['address', 'name'], tr), 'Falta: nombre, dirección');
  assert.equal(missingMessage(['bogus'], tr), '');
  assert.equal(missingMessage(undefined, tr), '');
  assert.deepEqual(knownFields(['address', 'x', 'name', 'name']), ['name', 'address']);
});

test('dayChips gives weekday, day number and month, and skips days without slots', () => {
  const days = [
    { date: '2026-10-24', slots: [{ start: '2026-10-24T07:30:00.000Z' }] },
    { date: '2026-10-25', slots: [] },
  ];
  const chips = dayChips(days, 'es');
  assert.equal(chips.length, 1);
  assert.equal(chips[0].label, 'sáb 24 oct');
  assert.equal(chips[0].day, '24');
  assert.equal(dayChips(days, 'en')[0].label, 'Sat 24 Oct');
});

test('groupByPeriod splits morning and afternoon by Amsterdam time and omits empty groups', () => {
  const slots = ['2026-10-16T06:00:00.000Z', '2026-10-16T09:30:00.000Z', '2026-10-16T11:00:00.000Z', '2026-10-16T13:00:00.000Z'].map((start) => ({ start }));
  const groups = groupByPeriod(slots);
  assert.deepEqual(groups.map((g) => g.period), ['morning', 'afternoon']);
  assert.deepEqual(groups[0].slots.map((s) => s.time), ['08:00', '11:30']);
  assert.deepEqual(groups[1].slots.map((s) => s.time), ['13:00', '15:00']);
  assert.deepEqual(groupByPeriod(slots.slice(0, 1)).map((g) => g.period), ['morning']);
  assert.deepEqual(groupByPeriod(slots.slice(3)).map((g) => g.period), ['afternoon']);
  assert.deepEqual(groupByPeriod([]), []);
});

test('formatSummary builds "Sáb 24 oct · 09:30 · Visita"', () => {
  assert.equal(formatSummary('2026-10-24T07:30:00.000Z', 'es', 'Visita'), 'Sáb 24 oct · 09:30 · Visita');
  assert.equal(formatSummary('2026-10-24T07:30:00.000Z', 'en', 'Visit'), 'Sat 24 Oct · 09:30 · Visit');
});

test('BUG: a visit with the early-start box unticked or missing is valid and sends earlyStart false', () => {
  const visit = { ...form, kind: 'visit' };
  for (const earlyStart of [false, undefined]) {
    assert.deepEqual(validateForm({ ...visit, earlyStart }, 'visit'), []);
    assert.equal(buildPayload({ ...visit, earlyStart }).earlyStart, false);
    assert.equal(missingMessage(validateForm({ ...visit, earlyStart }, 'visit'), (k) => k), '');
  }
});

test('nearby helpers: day has nearby, price for slot, text interpolation', () => {
  const near = { slots: [{ start: 'a', nearby: false, price: 65 }, { start: 'b', nearby: true, price: 60 }] };
  const far = { slots: [{ start: 'c' }, { start: 'd', nearby: false, price: null }] };
  assert.equal(dayHasNearby(near), true);
  assert.equal(dayHasNearby(far), false);
  assert.equal(anyNearby([far, near]), true);
  assert.equal(anyNearby([far]), false);
  assert.equal(slotPrice(near.slots[1]), 60);
  assert.equal(slotPrice(far.slots[0]), 65);
  assert.equal(slotPrice(far.slots[1]), 65);
  assert.equal(slotPrice({ start: 'x' }, 70), 70);
  assert.equal(fillText('vale {nearby} en vez de {base} {x}', { nearby: 60, base: 65 }), 'vale 60 en vez de 65 {x}');
  assert.equal(buildPayload({ ...form, price: 60 }).price, 60);
  assert.equal('price' in buildPayload(form), false);
});
