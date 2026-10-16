// Wiring of reservar.html. Pure helpers live in booking-logic.js. The site header, language
// switch and footer come from main.js, which also fires "nicofix-langchange" on a language switch.
// This file never calls gtag: no personal data goes to analytics.
import { BOOKING_API } from './config.js';
import { t } from './i18n.js';
import { buildPayload, validateForm, groupDays, dayChips, groupByPeriod, formatSummary, waLink, scaledSize, submitLabelKey, doneKey, showsEarlyStart, missingMessage, knownFields, BASE_PRICE, anyNearby, slotPrice, fillText } from './booking-logic.js';
import { checkPostcode } from './coverage.js';
import { suggestUrl, shouldSuggest, parseSuggestions, postcodeDiffers, extractPostcode } from './address-suggest.js';

const getLang = () => ((document.documentElement.lang || 'es').startsWith('es') ? 'es' : 'en');
const $ = (id) => document.getElementById(id);
const state = { kind: 'visit', start: null, token: '', days: [], chips: [], date: null, doneData: null, doneManyThings: false, basePrice: BASE_PRICE, nearbyPrice: null };

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
  updateSubmitLabel();
}
// Price of the chosen visit slot (the base price until a time is chosen, or when the server sends none).
function selectedPrice() {
  for (const d of state.days) {
    const slot = d.slots.find((x) => x.start === state.start);
    if (slot) return slotPrice(slot, state.basePrice);
  }
  return state.basePrice;
}
function updateSubmitLabel() {
  const price = selectedPrice();
  const lang = getLang();
  $('submit').textContent = fillText(t(lang, submitLabelKey(state.kind, false)), { price });
  // The early-start tick box exists only for the work day.
  const early = showsEarlyStart(state.kind);
  $('early-text').closest('label').hidden = !early;
  if (!early) $('details').elements.earlyStart.checked = false;
  $('early-text').textContent = early ? t(getLang(), 'booking_early_work') : '';
  $('submit-note').textContent = state.kind === 'visit' ? fillText(t(lang, 'booking_submit_note_visit'), { price }) : '';
  // The price box sits in the form, so it is always visible before the binding button.
  $('price-box').textContent = fillText(t(lang, state.kind === 'visit' ? 'booking_price_visit' : 'booking_price_work'), { price });
}
kindInputs().forEach((i) => i.addEventListener('change', () => {
  setKind(i.value);
  state.start = null;
  $('details').hidden = true;
  if ($('postcode').value) loadSlots(); else { state.days = []; showSlotsState('none'); }
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

// Steps 3 and 4: a swipeable strip of day chips, then a grid of times for the chosen day.
function stripEl() { return $('day-strip'); }
function chosenChip() { return state.chips.find((c) => c.date === state.date) || state.chips[0]; }

function renderChips() {
  const strip = stripEl();
  strip.innerHTML = '';
  for (const chip of state.chips) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'day-chip';
    b.dataset.date = chip.date;
    b.setAttribute('aria-pressed', chip.date === state.date ? 'true' : 'false');
    b.setAttribute('aria-label', chip.label);
    b.innerHTML = '<span class="dc-week"></span><span class="dc-day"></span><span class="dc-month"></span>';
    if (state.kind === 'visit' && chip.nearby) {
      const van = document.createElement('span');
      van.className = 'dc-van'; van.setAttribute('aria-hidden', 'true'); van.textContent = '🚐';
      b.append(van);
    }
    b.children[0].textContent = chip.weekday;
    b.children[1].textContent = chip.day;
    b.children[2].textContent = chip.month;
    b.addEventListener('click', () => { state.date = chip.date; state.start = null; renderChips(); renderTimes(); });
    strip.append(b);
  }
  const sel = strip.querySelector('[aria-pressed="true"]');
  if (sel) strip.scrollTo({ left: sel.offsetLeft - strip.offsetLeft - 8, behavior: 'auto' });
}

function renderTimes() {
  const box = $('time-groups');
  box.innerHTML = '';
  const day = state.days.find((d) => d.date === state.date);
  if (!day) return;
  for (const group of groupByPeriod(day.slots)) {
    const wrap = document.createElement('div');
    wrap.className = 'time-group';
    const h = document.createElement('h3');
    h.textContent = t(getLang(), group.period === 'morning' ? 'booking_morning' : 'booking_afternoon');
    h.dataset.period = group.period;
    const grid = document.createElement('div');
    grid.className = 'time-grid';
    for (const slot of group.slots) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'slot';
      const near = state.kind === 'visit' && slot.nearby === true;
      b.textContent = near ? `${slot.time} 🚐` : slot.time;
      if (near) b.setAttribute('aria-label', `${slot.time}, ${fillText(t(getLang(), 'booking_price_visit_short'), { price: slotPrice(slot, state.basePrice) })}`);
      b.setAttribute('aria-pressed', slot.start === state.start ? 'true' : 'false');
      b.addEventListener('click', () => chooseTime(slot.start));
      grid.append(b);
    }
    wrap.append(h, grid);
    box.append(wrap);
  }
}

function summaryText() {
  const kind = t(getLang(), state.kind === 'work' ? 'booking_summary_work' : 'booking_summary_visit');
  return formatSummary(state.start, getLang(), kind);
}

function chooseTime(start) {
  state.start = start;
  updateSubmitLabel();
  $('summary-text').textContent = summaryText();
  $('slots-pick').hidden = true;
  $('summary').hidden = false;
  $('details').hidden = false;
  $('details').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function changeTime() {
  state.start = null;
  updateSubmitLabel();
  $('summary').hidden = true;
  $('details').hidden = true;
  $('slots-pick').hidden = false;
  renderChips();
  renderTimes();
  $('slots').scrollIntoView({ behavior: 'smooth', block: 'start' });
  const sel = stripEl().querySelector('[aria-pressed="true"]');
  if (sel) sel.focus({ preventScroll: true });
}
$('summary-change').addEventListener('click', changeTime);

function scrollStrip(dir) {
  const strip = stripEl();
  strip.scrollBy({ left: dir * strip.clientWidth * 0.8, behavior: 'smooth' });
}
$('day-prev').addEventListener('click', () => scrollStrip(-1));
$('day-next').addEventListener('click', () => scrollStrip(1));

function updateArrowLabels() {
  $('day-prev').setAttribute('aria-label', t(getLang(), 'booking_days_prev'));
  $('day-next').setAttribute('aria-label', t(getLang(), 'booking_days_next'));
}

// The three states of the slots area: loading skeleton, empty (with WhatsApp), or the pickers.
function showSlotsState(name) {
  $('slots').hidden = name === 'none';
  $('slots-loading').hidden = name !== 'loading';
  $('slots-empty').hidden = name !== 'empty';
  $('slots-pick').hidden = name !== 'pick';
  $('summary').hidden = true;
}

function renderNearbyHint() {
  const hint = $('nearby-hint');
  const show = state.kind === 'visit' && anyNearby(state.days) && typeof state.nearbyPrice === 'number';
  hint.hidden = !show;
  hint.textContent = show ? fillText(t(getLang(), 'booking_nearby_hint'), { nearby: state.nearbyPrice, base: state.basePrice }) : '';
}

function renderSlots() {
  updateArrowLabels();
  renderNearbyHint();
  if (!state.days.length) return;
  state.chips = dayChips(state.days, getLang());
  if (!state.date || !state.chips.some((c) => c.date === state.date)) state.date = state.chips[0].date;
  renderChips();
  renderTimes();
  if (state.start) $('summary-text').textContent = summaryText();
}

async function loadSlots() {
  const msg = $('postcode-message');
  msg.textContent = '';
  state.days = [];
  state.chips = [];
  state.date = null;
  state.start = null;
  showSlotsState('none');
  $('details').hidden = true;
  const postcode = $('postcode').value;
  const area = await checkPostcode(postcode);
  if (area.status === 'invalid' || area.status === 'notfound') { msg.textContent = t(getLang(), 'booking_postcode_invalid'); return; }
  if (area.status === 'no') { msg.textContent = t(getLang(), 'booking_postcode_out'); return; }
  showSlotsState('loading');
  // 'error' (PDOK unreachable) is let through: the booking server checks the postcode itself.
  let data = null;
  try {
    const res = await fetch(`${BOOKING_API}/slots?kind=${state.kind}&postcode=${encodeURIComponent(postcode)}`);
    if (res.ok) data = await res.json();
  } catch (err) {
    data = null;
  }
  if (!data) { showSlotsState('none'); msg.textContent = t(getLang(), 'booking_error'); return; }
  if (data.status === 'invalid_postcode') { showSlotsState('none'); msg.textContent = t(getLang(), 'booking_postcode_invalid'); return; }
  const days = (data.days || []).filter((d) => d.slots && d.slots.length);
  if (!days.length) { $('empty-wa').href = waLink(''); showSlotsState('empty'); return; }
  state.days = days;
  state.basePrice = typeof data.basePrice === 'number' ? data.basePrice : BASE_PRICE;
  state.nearbyPrice = typeof data.nearbyPrice === 'number' ? data.nearbyPrice : null;
  updateSubmitLabel();
  showSlotsState('pick');
  renderSlots();
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

// Says in plain words which fields are missing, marks them and moves to the first one.
// Returns false when none of the names is a field the page knows (then the caller shows the generic error).
function showMissing(fields, lang) {
  const known = knownFields(fields);
  const text = missingMessage(fields, (k) => t(lang, k));
  if (!text) return false;
  const el = $('details').elements;
  known.forEach((name) => el[name]?.setAttribute('aria-invalid', 'true'));
  $('details-message').textContent = text;
  const first = known[0];
  const target = first === 'postcode' ? $('postcode') : first === 'start' ? $('slots') : el[first];
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (typeof target.focus === 'function' && first !== 'start') target.focus({ preventScroll: true });
  }
  return true;
}

// Address suggestions from PDOK. Only the typed text is sent.
const addr = { items: [], active: -1, timer: null, abort: null };
function closeSuggestions() {
  const input = $('address');
  $('address-list').hidden = true;
  input.setAttribute('aria-expanded', 'false');
  input.removeAttribute('aria-activedescendant');
  addr.active = -1;
}
function setActive(i) {
  const lis = $('address-list').children;
  addr.active = i;
  [...lis].forEach((li, n) => li.setAttribute('aria-selected', n === i ? 'true' : 'false'));
  if (i >= 0) { $('address').setAttribute('aria-activedescendant', lis[i].id); lis[i].scrollIntoView({ block: 'nearest' }); }
  else $('address').removeAttribute('aria-activedescendant');
}
function renderSuggestions(items) {
  addr.items = items;
  const list = $('address-list');
  list.innerHTML = '';
  list.setAttribute('aria-label', t(getLang(), 'booking_address_suggestions'));
  items.forEach((item, n) => {
    const li = document.createElement('li');
    li.id = `address-opt-${n}`;
    li.setAttribute('role', 'option');
    li.setAttribute('aria-selected', 'false');
    li.textContent = item.label;
    li.addEventListener('mousedown', (ev) => ev.preventDefault()); // keep the focus in the field
    li.addEventListener('click', () => chooseSuggestion(n));
    list.append(li);
  });
  list.hidden = items.length === 0;
  $('address').setAttribute('aria-expanded', items.length ? 'true' : 'false');
  addr.active = -1;
}
function updateAddressWarning() {
  const differs = postcodeDiffers(extractPostcode($('address').value), $('postcode').value);
  $('address-warning').textContent = differs ? t(getLang(), 'booking_address_warning') : '';
}
function chooseSuggestion(n) {
  const item = addr.items[n];
  if (!item) return;
  $('address').value = item.label;
  $('address').removeAttribute('aria-invalid');
  closeSuggestions();
  $('address-warning').textContent = postcodeDiffers(item.postcode, $('postcode').value) ? t(getLang(), 'booking_address_warning') : '';
}
async function fetchSuggestions(text) {
  if (addr.abort) addr.abort.abort();
  addr.abort = new AbortController();
  try {
    const res = await fetch(suggestUrl(text), { signal: addr.abort.signal });
    if (!res.ok) throw new Error('PDOK');
    renderSuggestions(parseSuggestions(await res.json()));
  } catch (err) {
    if (err.name !== 'AbortError') closeSuggestions(); // PDOK unreachable: the field still works as plain text
  }
}
$('address').addEventListener('input', () => {
  clearTimeout(addr.timer);
  updateAddressWarning();
  const text = $('address').value;
  if (!shouldSuggest(text)) { if (addr.abort) addr.abort.abort(); closeSuggestions(); return; }
  addr.timer = setTimeout(() => fetchSuggestions(text), 250);
});
$('address').addEventListener('keydown', (ev) => {
  const open = !$('address-list').hidden;
  if (ev.key === 'Escape' && open) { ev.preventDefault(); closeSuggestions(); }
  else if (ev.key === 'ArrowDown' && addr.items.length) { ev.preventDefault(); if (!open) { $('address-list').hidden = false; $('address').setAttribute('aria-expanded', 'true'); } setActive((addr.active + 1) % addr.items.length); }
  else if (ev.key === 'ArrowUp' && open) { ev.preventDefault(); setActive(addr.active <= 0 ? addr.items.length - 1 : addr.active - 1); }
  else if (ev.key === 'Enter' && open && addr.active >= 0) { ev.preventDefault(); chooseSuggestion(addr.active); }
});
$('address').addEventListener('blur', () => { clearTimeout(addr.timer); closeSuggestions(); });
$('postcode').addEventListener('input', updateAddressWarning);
$('details').addEventListener('input', (ev) => ev.target.removeAttribute?.('aria-invalid'));
$('postcode-form').addEventListener('submit', updateAddressWarning);

$('details').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  const el = f.elements;
  const lang = getLang();
  const form = { kind: state.kind, start: state.start, postcode: $('postcode').value, name: el.name.value, address: el.address.value,
    phone: el.phone.value, description: el.description.value, manyThings: false, earlyStart: el.earlyStart.checked,
    photos: [], lang, website: el.website.value, token: state.token };
  if (state.kind === 'visit') form.price = selectedPrice();
  const msg = $('details-message');
  msg.textContent = '';
  const invalid = validateForm(form, state.kind);
  f.querySelectorAll('[aria-invalid]').forEach((x) => x.removeAttribute('aria-invalid'));
  invalid.forEach((name) => el[name]?.setAttribute('aria-invalid', 'true'));
  if (invalid.length) { showMissing(invalid, lang); return; }
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
    if (res.status === 400 && data && Array.isArray(data.fields) && showMissing(data.fields, lang)) return;
    if (!data || !data.ok) { msg.textContent = t(lang, 'booking_error'); return; }
    state.doneManyThings = form.manyThings;
    state.donePrice = form.price;
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
  $('slots').hidden = true;
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
  // The server's price wins when it differs from what the page showed.
  if (state.kind === 'visit' && typeof data.price === 'number' && data.price !== state.donePrice) {
    const pp = document.createElement('p'); pp.textContent = fillText(t(lang, 'booking_done_price'), { price: data.price }); done.append(pp);
  }
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
  renderSlots();
  renderDone();
});

prefillFromLink();
