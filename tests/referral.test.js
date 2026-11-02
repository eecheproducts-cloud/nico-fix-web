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

test('the conditions pages are noindex, out of the sitemap and out of the menu', () => {
  const sitemap = read('sitemap.xml');
  assert.ok(!sitemap.includes('referidos'));
  for (const html of Object.values(pages)) {
    assert.match(html, /<meta name="robots" content="noindex">/);
    assert.match(html, /<details class="referral-details">/);
    const nav = html.match(/<nav class="main-nav">[\s\S]*?<\/nav>/)[0];
    assert.ok(!nav.includes('referidos'));
  }
});

test('the home page has the recommend-a-friend block in both languages', async () => {
  const { translations } = await import('../assets/js/i18n.js');
  const home = read('index.html');
  assert.match(home, /id="referral-share"[^>]*href="https:\/\/wa\.me\/\?text=/);
  for (const lang of ['en', 'es']) {
    for (const k of ['referral_title', 'referral_body', 'referral_button', 'referral_terms', 'referral_share_text']) {
      assert.ok(translations[lang][k], `${lang}.${k}`);
      assert.ok(!/[—–]/.test(translations[lang][k]));
    }
  }
  assert.equal(translations.es.referral_terms_href, '/es/referidos/');
});

test('the booking page has the optional "who recommended us" field, 80 characters at most', () => {
  const html = read('reservar.html');
  assert.match(html, /<input name="referredBy" maxlength="80"/);
  assert.ok(!/<input name="referredBy"[^>]*required/.test(html));
});
