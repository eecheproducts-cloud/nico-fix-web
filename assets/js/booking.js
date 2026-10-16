// Wiring of reservar.html. Pure helpers live in booking-logic.js. The site header, language
// switch and footer come from main.js, which also fires "nicofix-langchange" on a language switch.
// This file never calls gtag: no personal data goes to analytics.
import { BOOKING_API } from './config.js';
import { t } from './i18n.js';
import { buildPayload, validateForm, groupDays, waLink, scaledSize, submitLabelKey, doneKey } from './booking-logic.js';
import { checkPostcode } from './coverage.js';

const getLang = () => ((document.documentElement.lang || 'es').startsWith('es') ? 'es' : 'en');
const $ = (id) => document.getElementById(id);
const state = { kind: 'visit', start: null, token: '', days: [], doneData: null, doneManyThings: false };

// The chat link carries only a random code.
// An inline script in reservar.html already moved it to window.__bookingToken and cleaned the URL.
function readToken() {
  if (window.__bookingToken) return window.__bookingToken;
  try { return sessionStorage.getItem('nicofix_booking_token') || ''; } catch (err) { return ''; }
}
state.token = readToken();

function kindInputs() { return document.querySelectorAll('input[name="kind"]'); }
function setKind(kind) {
  state.kind = kind;
  kindInputs().forEach((i) => { i.checked = i.value === kind; });
  document.querySelectorAll('.only-visit').forEach((el) => { el.hidden = kind !== 'visit'; });
  updateSubmitLabel();
}
function updateSubmitLabel() {
  const many = $('details').elements.manyThings.checked;
  $('submit').textContent = t(getLang(), submitLabelKey(state.kind, many));
  // The price box sits in the form, so it is always visible before the binding button.
  $('price-box').textContent = t(getLang(), state.kind === 'visit' ? 'booking_price_visit' : 'booking_price_work');
}
$('details').elements.manyThings.addEventListener('change', updateSubmitLabel);
kindInputs().forEach((i) => i.addEventListener('change', () => {
  setKind(i.value);
  state.start = null;
  $('details').hidden = true;
  if ($('postcode').value) loadSlots();
}));
setKind('visit');

async function prefillFromLink() {
  if (!state.token) return;
  let data = null;
  try {
    const res = await fetch(`${BOOKING_API}/link?r=${encodeURIComponent(state.token)}`);
    if (res.ok) data = await res.json();
  } catch (err) {
    data = null;
  }
  if (!data) { state.token = ''; return; }
  setKind(data.kind === 'work' ? 'work' : 'visit');
  const f = $('details');
  f.elements.name.value = data.name || '';
  f.elements.address.value = data.address || '';
  f.elements.phone.placeholder = data.phoneMasked || '';
  if (data.postcode) { $('postcode').value = data.postcode; loadSlots(); }
}

function renderDays() {
  const box = $('days');
  box.innerHTML = '';
  for (const day of groupDays(state.days, getLang())) {
    const block = document.createElement('div');
    block.className = 'booking-day';
    const h = document.createElement('h3');
    h.textContent = day.label;
    const row = document.createElement('div');
    row.className = 'booking-slots';
    for (const slot of day.slots) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'slot';
      b.textContent = slot.time;
      if (slot.start === state.start) b.classList.add('selected');
      b.addEventListener('click', () => {
        state.start = slot.start;
        box.querySelectorAll('.slot').forEach((x) => x.classList.toggle('selected', x === b));
        $('details').hidden = false;
        $('details').scrollIntoView({ behavior: 'smooth' });
      });
      row.append(b);
    }
    block.append(h, row);
    box.append(block);
  }
}

async function loadSlots() {
  const msg = $('postcode-message');
  msg.textContent = '';
  state.days = [];
  state.start = null;
  $('days').innerHTML = '';
  $('details').hidden = true;
  const postcode = $('postcode').value;
  const area = await checkPostcode(postcode);
  if (area.status === 'invalid' || area.status === 'notfound') { msg.textContent = t(getLang(), 'booking_postcode_invalid'); return; }
  if (area.status === 'no') { msg.textContent = t(getLang(), 'booking_postcode_out'); return; }
  // 'error' (PDOK unreachable) is let through: the booking server checks the postcode itself.
  let data = null;
  try {
    const res = await fetch(`${BOOKING_API}/slots?kind=${state.kind}&postcode=${encodeURIComponent(postcode)}`);
    if (res.ok) data = await res.json();
  } catch (err) {
    data = null;
  }
  if (!data) { msg.textContent = t(getLang(), 'booking_error'); return; }
  if (data.status === 'invalid_postcode') { msg.textContent = t(getLang(), 'booking_postcode_invalid'); return; }
  if (!data.days || !data.days.length) { msg.textContent = t(getLang(), 'booking_no_slots'); return; }
  state.days = data.days;
  renderDays();
}
$('postcode-form').addEventListener('submit', (e) => { e.preventDefault(); loadSlots(); });

// Photos are redrawn on a canvas: smaller, and without EXIF or GPS data.
async function readPhoto(file) {
  const bitmap = await createImageBitmap(file);
  const { width, height } = scaledSize(bitmap.width, bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return { base64: btoa(binary), mimeType: 'image/jpeg' };
}

$('details').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  const el = f.elements;
  const lang = getLang();
  const form = { kind: state.kind, start: state.start, postcode: $('postcode').value, name: el.name.value, address: el.address.value,
    phone: el.phone.value, description: el.description.value, manyThings: el.manyThings.checked, earlyStart: el.earlyStart.checked,
    photos: [], lang, website: el.website.value, token: state.token };
  const msg = $('details-message');
  msg.textContent = '';
  const invalid = validateForm(form, state.kind);
  f.querySelectorAll('[aria-invalid]').forEach((x) => x.removeAttribute('aria-invalid'));
  invalid.forEach((name) => el[name]?.setAttribute('aria-invalid', 'true'));
  if (invalid.length) { msg.textContent = t(lang, 'booking_error'); return; }
  $('submit').disabled = true;
  try {
    const files = [...el.photos.files].slice(0, 3);
    for (const file of files) {
      try { form.photos.push(await readPhoto(file)); } catch (err) { /* unreadable photo: skip it */ }
    }
    const res = await fetch(`${BOOKING_API}/book`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(buildPayload(form)) });
    let data = null;
    try { data = await res.json(); } catch (err) { data = null; }
    if (res.status === 409) { msg.textContent = t(lang, 'booking_taken'); loadSlots(); return; }
    if (!data || !data.ok) { msg.textContent = t(lang, 'booking_error'); return; }
    state.doneManyThings = form.manyThings;
    showDone(data);
  } catch (err) {
    msg.textContent = t(lang, 'booking_error');
  } finally {
    $('submit').disabled = false;
  }
});

function showDone(data) {
  state.doneData = data;
  renderDone();
  $('details').hidden = true;
  $('days').innerHTML = '';
  $('done').hidden = false;
  $('done').scrollIntoView({ behavior: 'smooth' });
}

function renderDone() {
  const data = state.doneData;
  if (!data) return;
  const lang = getLang();
  const when = groupDays([{ date: '', slots: [{ start: data.start }] }], lang)[0];
  const text = t(lang, doneKey(state.kind, state.doneManyThings))
    .replace('{when}', `${when.label}, ${when.slots[0].time}`).replace('{code}', data.code);
  const done = $('done');
  done.innerHTML = '';
  const h = document.createElement('h2'); h.textContent = t(lang, 'booking_done_title');
  const p = document.createElement('p'); p.textContent = text;
  done.append(h, p);
  if (data.photosRejected) { const r = document.createElement('p'); r.textContent = t(lang, 'booking_photo_rejected'); done.append(r); }
  // confirmSent comes from the server; undefined counts as false.
  if (!data.chatNotified && !data.confirmSent) {
    const a = document.createElement('a');
    a.className = 'btn btn-primary btn-glow'; a.href = waLink(data.confirmText); a.target = '_blank'; a.rel = 'noopener';
    a.textContent = t(lang, 'booking_done_button');
    done.append(a);
  }
}

// Language switch: texts with data-i18n are refreshed by main.js; redo the ones built here.
document.addEventListener('nicofix-langchange', () => {
  setKind(state.kind);
  renderDays();
  renderDone();
});

prefillFromLink();
