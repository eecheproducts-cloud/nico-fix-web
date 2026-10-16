// Pure helpers for reservar.html (tested with node:test). The DOM wiring lives in booking.js.
export const PRICES = { visit: 65 };
const WHATSAPP = '31610049118';

export function buildPayload(f) {
  const payload = {
    kind: f.kind, start: f.start, postcode: f.postcode, name: f.name.trim(), address: f.address.trim(), phone: f.phone,
    description: (f.description || '').trim(), manyThings: Boolean(f.manyThings), earlyStart: f.earlyStart === true,
    photos: f.photos || [], lang: f.lang, website: f.website || '',
  };
  if (f.token) payload.token = f.token;
  return payload;
}

export function validateForm(f, kind) {
  const fields = [];
  if (!f.name || f.name.trim().length < 2) fields.push('name');
  const digits = String(f.phone || '').replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) fields.push('phone');
  if (!/\d/.test(f.address || '')) fields.push('address');
  if (!/^[1-9]\d{3}\s?[a-zA-Z]{2}$/.test(String(f.postcode || '').trim())) fields.push('postcode');
  if (f.earlyStart !== true) fields.push('earlyStart');
  if (kind === 'work' && (f.description || '').trim().length < 3) fields.push('description');
  if (!f.start) fields.push('start');
  return fields;
}

const LOCALES = { es: 'es-ES', en: 'en-GB' };
export function groupDays(days, lang) {
  const locale = LOCALES[lang] || LOCALES.en;
  const dayFmt = new Intl.DateTimeFormat(locale, { timeZone: 'Europe/Amsterdam', weekday: 'long', day: 'numeric', month: 'long' });
  const timeFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  return days.map((d) => ({
    date: d.date,
    label: dayFmt.format(new Date(d.slots[0].start)),
    slots: d.slots.map((s) => ({ start: s.start, time: timeFmt.format(new Date(s.start)) })),
  }));
}

export function waLink(text) {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
}

export function scaledSize(width, height, max = 1600) {
  const ratio = Math.min(1, max / Math.max(width, height));
  return { width: Math.round(width * ratio), height: Math.round(height * ratio) };
}

// A visit with "more than one thing to look at" is a request: Nico agrees the price on WhatsApp before confirming.
export function isRequest(kind, manyThings) {
  return kind === 'work' || (kind === 'visit' && Boolean(manyThings));
}
export function submitLabelKey(kind, manyThings) {
  return isRequest(kind, manyThings) ? 'booking_submit_work' : 'booking_submit_visit';
}
export function doneKey(kind, manyThings) {
  if (kind === 'work') return 'booking_done_work';
  return manyThings ? 'booking_done_visit_request' : 'booking_done_visit';
}

// The promo ends on 31/12/2026 by the Amsterdam calendar date, not UTC.
const AMS_DATE = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam', year: 'numeric', month: '2-digit', day: '2-digit' });
export function promoActive(today = new Date(), until = '2026-12-31') {
  return AMS_DATE.format(today) <= until;
}
