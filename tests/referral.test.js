import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const pages = { en: read('referidos/index.html'), es: read('es/referidos/index.html') };

test('the referral page exists in English and Spanish, linked to each other', () => {
  assert.match(pages.en, /<html lang="en">/);
  assert.match(pages.es, /<html lang="es">/);
  assert.match(pages.en, /hreflang="es" href="https:\/\/nicofix\.nl\/es\/referidos\/"/);
  assert.match(pages.es, /hreflang="en" href="https:\/\/nicofix\.nl\/referidos\/"/);
});

test('the conditions state every agreed point', () => {
  const en = pages.en;
  for (const part of ['€15', 'new client', 'same address', 'before accepting the quote', '14 days', 'cancelled', 'withdraws',
    '50%', '12 months', 'cannot be transferred', 'cash', 'only the visit', 'Zoofy', 'VAT', 'benefit', 'change or end', 'privacy']) {
    assert.ok(en.includes(part), `EN: ${part}`);
  }
  const es = pages.es;
  for (const part of ['15 €', 'cliente nuevo', 'mismo domicilio', 'antes de aceptar el presupuesto', '14 días', 'se cancela', 'desiste',
    '50 %', '12 meses', 'no se puede transferir', 'dinero', 'solo la visita', 'Zoofy', 'BTW', 'beneficio', 'cambiar o terminar', 'privacidad']) {
    assert.ok(es.includes(part), `ES: ${part}`);
  }
});

test('no long dashes, no Dutch, no reviews, no voseo in the referral pages', () => {
  for (const html of Object.values(pages)) {
    assert.ok(!/[—–]/.test(html));
    assert.ok(!/reseña|review/i.test(html));
  }
  assert.ok(!/\b(vos|podés|tenés|escribime|contame|pasale)\b/i.test(pages.es));
});

test('the privacy links of the referral pages point to anchors that exist', () => {
  const privacy = read('privacy.html');
  assert.match(pages.en, /href="\/privacy\.html#referrals"/);
  assert.match(pages.es, /href="\/privacy\.html#referidos-es"/);
  assert.match(privacy, /id="referrals"/);
  assert.match(privacy, /id="referidos-es"/);
});

test('both pages are in the sitemap', () => {
  const sitemap = read('sitemap.xml');
  assert.match(sitemap, /<loc>https:\/\/nicofix\.nl\/referidos\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/nicofix\.nl\/es\/referidos\/<\/loc>/);
});

test('the booking page has the optional "who recommended us" field, 80 characters at most', () => {
  const html = read('reservar.html');
  assert.match(html, /<input name="referredBy" maxlength="80"/);
  assert.ok(!/<input name="referredBy"[^>]*required/.test(html));
});
