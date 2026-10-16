// Pure helpers for reservar.html (tested with node:test). The DOM wiring lives in booking.js.
export const PRICES = { visit: 65 };
const WHATSAPP = '31610049118';

export function buildPayload(f) {
  const payload = {
    kind: f.kind, start: f.start, postcode: f.postcode, name: f.name.trim(), address: f.address.trim(), phone: f.phone,
    description: (f.description || '').trim(), manyThings: Boolean(f.manyThings), earlyStart: f.kind === 'work' && f.earlyStart === true,
    photos: f.photos || [], lang: f.lang, website: f.website || '',
  };
  if (f.token) payload.token = f.token;
  if (typeof f.price === 'number') payload.price = f.price;
  return payload;
}

export function validateForm(f, kind) {
  const fields = [];
  if (!f.name || f.name.trim().length < 2) fields.push('name');
  const digits = String(f.phone || '').replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) fields.push('phone');
  if (!/\d/.test(f.address || '')) fields.push('address');
  if (!/^[1-9]\d{3}\s?[a-zA-Z]{2}$/.test(String(f.postcode || '').trim())) fields.push('postcode');
  if (kind === 'work' && f.earlyStart !== true) fields.push('earlyStart');
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

const timeFmt24 = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

// Short date parts in Amsterdam time: { weekday: 'sáb', day: '24', month: 'oct' }. Trailing dots are removed.
export function dateParts(iso, lang) {
  const fmt = new Intl.DateTimeFormat(LOCALES[lang] || LOCALES.en, { timeZone: 'Europe/Amsterdam', weekday: 'short', day: 'numeric', month: 'short' });
  const out = {};
  for (const p of fmt.formatToParts(new Date(iso))) if (p.type !== 'literal') out[p.type] = p.value.replace(/\./g, '');
  return { weekday: out.weekday, day: out.day, month: out.month };
}

// Nearby-zone discount: the server marks slots with nearby:true and a price. Missing fields mean no discount.
export const BASE_PRICE = 65;
export function dayHasNearby(day) {
  return Boolean(day && Array.isArray(day.slots) && day.slots.some((s) => s && s.nearby === true));
}
export function anyNearby(days) {
  return Array.isArray(days) && days.some(dayHasNearby);
}
// Price of a slot for a visit: its own price, or the base price when the server sent none.
export function slotPrice(slot, basePrice = BASE_PRICE) {
  if (slot && typeof slot.price === 'number') return slot.price;
  return basePrice;
}
// Replaces {name} placeholders with values.
export function fillText(text, values) {
  return String(text).replace(/\{(\w+)\}/g, (m, k) => (k in values ? String(values[k]) : m));
}

// Day chips for the strip: only days with slots, each with weekday, day number and month ("sáb 24 oct").
export function dayChips(days, lang) {
  return days.filter((d) => d.slots && d.slots.length).map((d) => {
    const parts = dateParts(d.slots[0].start, lang);
    return { date: d.date, ...parts, label: `${parts.weekday} ${parts.day} ${parts.month}`, nearby: dayHasNearby(d) };
  });
}

// Splits slots into morning (before 13:00 Amsterdam) and afternoon. Returns only the groups that have slots, in order.
// Each slot keeps its fields and gets a "time" (HH:MM, Amsterdam).
export function groupByPeriod(slots) {
  const morning = [];
  const afternoon = [];
  for (const s of slots) {
    const time = timeFmt24.format(new Date(s.start));
    (Number(time.slice(0, 2)) < 13 ? morning : afternoon).push({ ...s, time });
  }
  const groups = [];
  if (morning.length) groups.push({ period: 'morning', slots: morning });
  if (afternoon.length) groups.push({ period: 'afternoon', slots: afternoon });
  return groups;
}

// "Sáb 24 oct · 09:30 · Visita" (kindLabel is already translated).
export function formatSummary(iso, lang, kindLabel) {
  const p = dateParts(iso, lang);
  const date = `${p.weekday} ${p.day} ${p.month}`;
  return `${date.charAt(0).toUpperCase()}${date.slice(1)} · ${timeFmt24.format(new Date(iso))} · ${kindLabel}`;
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
// The early-start checkbox exists only for the work day (a visit always sends earlyStart: false).
export function showsEarlyStart(kind) {
  return kind === 'work';
}

// Field names the server and validateForm use, in the order they appear on the page.
export const FIELD_ORDER = ['postcode', 'start', 'name', 'phone', 'address', 'description', 'earlyStart'];
const FIELD_LABEL_KEYS = { postcode: 'booking_f_postcode', start: 'booking_f_start', name: 'booking_f_name', phone: 'booking_f_phone',
  address: 'booking_f_address', description: 'booking_f_description', earlyStart: 'booking_f_early' };

// Known field names from a validation list or a server 400, in page order and without repeats.
export function knownFields(fields) {
  const set = new Set(Array.isArray(fields) ? fields : []);
  return FIELD_ORDER.filter((n) => set.has(n));
}

// "Falta: nombre, dirección". tr maps a translation key to text. Returns '' when no field is known.
export function missingMessage(fields, tr) {
  const names = knownFields(fields).map((n) => tr(FIELD_LABEL_KEYS[n]));
  return names.length ? `${tr('booking_missing')}: ${names.join(', ')}` : '';
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

// Phone as typed -> digits only; a Dutch +31 / 0031 number becomes its national 0... form, foreign numbers stay as digits.
export function normalizePhone(raw) {
  const s = String(raw || '').trim();
  let digits = s.replace(/\D/g, '');
  if (/^(\+|00)/.test(s) && digits.startsWith(s.startsWith('+') ? '31' : '0031')) {
    const rest = digits.slice(s.startsWith('+') ? 2 : 4).replace(/^0/, '');
    if (rest) digits = '0' + rest;
  }
  return digits;
}
