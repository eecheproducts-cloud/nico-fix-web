// assets/js/main.js
import { t, translations } from './i18n.js';
import { servicesData, groupByCategory, CATEGORY_ORDER } from './services-data.js';
import { portfolioItems, sortPortfolio } from './portfolio-data.js';
import { buildSearchIndex, searchServices } from './services-search.js';
import { checkPostcode } from './coverage.js';
import { initConsent } from './consent.js';
import { promoActive } from './booking-logic.js';
import { PROMO_WEEKEND_UNTIL } from './config.js';

// Nico Fix's business number (WhatsApp only, not published as a phone line). index.html's
// WhatsApp links (#hero-whatsapp, #contact-whatsapp, #whatsapp-float) hardcode it too as a
// no-JS fallback, keep them in sync.
const WHATSAPP_NUMBER = '31610049118';
const KVK_NUMBER = '95562028';
const BTW_ID = 'NL005161451B23';

const CATEGORY_LABELS = {
  en: {
    furniture: 'Furniture assembly',
    mounting: 'Mounting & hanging',
    paint: 'Painting',
    tiling: 'Tiling & microcement',
    flooring: 'Floors',
    doors_locks: 'Doors & locks',
    plumbing: 'Plumbing',
    electrical: 'Lights & smart home',
    bathroom_kitchen: 'Bathroom & kitchen',
    outdoor: 'Garden & outdoor',
    bikes: 'Bikes',
  },
  es: {
    furniture: 'Montaje de muebles',
    mounting: 'Colgar e instalar',
    paint: 'Pintura',
    tiling: 'Cerámicos y microcemento',
    flooring: 'Pisos',
    doors_locks: 'Puertas y cerraduras',
    plumbing: 'Plomería',
    electrical: 'Luces y hogar inteligente',
    bathroom_kitchen: 'Baño y cocina',
    outdoor: 'Jardín y exterior',
    bikes: 'Bicicletas',
  },
};

// First visit (no saved choice): Spanish if the visitor's device is in Spanish, otherwise English.
// Showing Spanish speakers the Spanish copy directly also stops Chrome from machine-translating it.
function browserLang() {
  const primary = navigator.languages?.[0] || navigator.language || '';
  return String(primary).toLowerCase().startsWith('es') ? 'es' : 'en';
}

function getLang() {
  try {
    return localStorage.getItem('nicofix-lang') || browserLang();
  } catch {
    return browserLang();
  }
}

function setLang(lang) {
  try {
    localStorage.setItem('nicofix-lang', lang);
  } catch {
    // Persistence unavailable (blocked storage, private/sandboxed context).
    // language switching still works for the rest of this page load.
  }
  document.documentElement.lang = lang;
  applyTranslations(lang);
  renderServices(lang);
  renderPortfolio(lang);
  renderCoverage(lang);
  document.dispatchEvent(new CustomEvent('nicofix-langchange', { detail: { lang } }));
}

function applyTranslations(lang) {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(lang, el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-alt]').forEach((el) => {
    el.setAttribute('alt', t(lang, el.getAttribute('data-i18n-alt')));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.setAttribute('placeholder', t(lang, el.getAttribute('data-i18n-placeholder')));
  });
  // Pages other than the home page name their title key on <body data-title-key>.
  document.title = t(lang, document.body.dataset.titleKey || 'page_title');
  const langToggle = document.getElementById('lang-toggle');
  if (langToggle) langToggle.setAttribute('aria-label', t(lang, 'lang_toggle_label'));
}

const searchIndex = buildSearchIndex(servicesData, translations, CATEGORY_LABELS);
const servicesByKey = new Map(servicesData.map((service) => [service.key, service]));

function searchResultItem(key, lang) {
  const { category } = servicesByKey.get(key);
  const div = document.createElement('div');
  div.className = 'service-item';
  const name = document.createElement('span');
  name.textContent = t(lang, key);
  const tag = document.createElement('span');
  tag.className = 'service-tag';
  tag.textContent = CATEGORY_LABELS[lang]?.[category] || category;
  div.append(name, tag);
  return div;
}

function whatsAppAskLink(lang) {
  const link = document.createElement('a');
  link.href = `https://wa.me/${WHATSAPP_NUMBER}`;
  link.target = '_blank';
  link.rel = 'noopener';
  link.textContent = t(lang, 'services_search_ask');
  return link;
}

function renderServices(lang) {
  const container = document.getElementById('services-list');
  if (!container) return;
  const status = document.getElementById('service-search-status');
  const input = document.getElementById('service-search');
  container.innerHTML = '';
  status.innerHTML = '';

  const result = searchServices(input ? input.value : '', searchIndex);
  if (result.active) {
    const grid = document.createElement('div');
    grid.className = 'service-grid';
    if (result.matches.length > 0) {
      status.textContent = result.matches.length === 1
        ? t(lang, 'services_search_count_one')
        : t(lang, 'services_search_count').replace('{n}', result.matches.length);
      result.matches.forEach((key) => grid.appendChild(searchResultItem(key, lang)));
    } else {
      status.textContent = `${t(lang, result.suggestions.length ? 'services_search_suggest' : 'services_search_none')} `;
      if (!result.suggestions.length) status.appendChild(whatsAppAskLink(lang));
      result.suggestions.forEach((key) => grid.appendChild(searchResultItem(key, lang)));
    }
    container.appendChild(grid);
    return;
  }

  // A card was clicked: show every service in that category, with a way back to the cards.
  const grouped = groupByCategory(servicesData);
  if (activeCategory) {
    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'services-back';
    back.textContent = t(lang, 'services_back');
    back.addEventListener('click', () => showCategory(null));
    const title = document.createElement('strong');
    title.textContent = CATEGORY_LABELS[lang]?.[activeCategory] || activeCategory;
    status.append(back, title);
    const grid = document.createElement('div');
    grid.className = 'service-grid';
    grouped[activeCategory].forEach((item) => {
      const div = document.createElement('div');
      div.className = 'service-item';
      div.textContent = t(lang, item.key);
      grid.appendChild(div);
    });
    container.appendChild(grid);
    return;
  }

  const cards = document.createElement('div');
  cards.className = 'service-cards';
  CATEGORY_ORDER.forEach((category, index) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'service-card';
    card.addEventListener('click', () => showCategory(category));

    const number = document.createElement('span');
    number.className = 'service-card-number';
    number.textContent = String(index + 1).padStart(2, '0');
    const title = document.createElement('span');
    title.className = 'service-card-title';
    title.textContent = CATEGORY_LABELS[lang]?.[category] || category;
    const desc = document.createElement('span');
    desc.className = 'service-card-desc';
    desc.textContent = t(lang, `cat_desc_${category}`);
    const more = document.createElement('span');
    more.className = 'service-card-more';
    const count = grouped[category].length;
    more.textContent = `${count === 1 ? t(lang, 'services_count_one') : t(lang, 'services_count').replace('{n}', count)} →`;
    card.append(number, title, desc, more);
    cards.appendChild(card);
  });

  const other = document.createElement('a');
  other.className = 'service-card service-card-other';
  other.href = `https://wa.me/${WHATSAPP_NUMBER}`;
  other.target = '_blank';
  other.rel = 'noopener';
  const otherTitle = document.createElement('span');
  otherTitle.className = 'service-card-title';
  otherTitle.textContent = t(lang, 'services_other_title');
  const otherCta = document.createElement('span');
  otherCta.className = 'service-card-more';
  otherCta.textContent = t(lang, 'services_other_cta');
  other.append(otherTitle, otherCta);
  cards.appendChild(other);

  container.appendChild(cards);
}

// Category whose full list is open (null = the cards). Kept here so a language switch keeps it.
let activeCategory = null;

function showCategory(category) {
  activeCategory = category;
  renderServices(getLang());
  document.getElementById('services').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderPortfolio(lang) {
  const container = document.getElementById('portfolio-grid');
  if (!container) return;
  container.innerHTML = '';
  sortPortfolio(portfolioItems, (key) => t(lang, key)).forEach((item) => {
    const label = item.stateKey
      ? `${t(lang, item.roomKey)}, ${t(lang, item.stateKey)}`
      : t(lang, item.roomKey);

    const figure = document.createElement('figure');
    figure.className = 'portfolio-item';
    figure.tabIndex = 0;
    figure.setAttribute('role', 'button');
    figure.setAttribute('aria-label', label);

    const img = document.createElement('img');
    img.src = item.image;
    img.loading = 'lazy';
    img.alt = label;
    figure.appendChild(img);

    const caption = document.createElement('figcaption');
    caption.textContent = label;
    figure.appendChild(caption);

    const open = () => openLightbox(item.image, label);
    figure.addEventListener('click', open);
    figure.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open();
      }
    });

    container.appendChild(figure);
  });
}

function openLightbox(src, label) {
  const dialog = document.getElementById('lightbox');
  if (!dialog || typeof dialog.showModal !== 'function') {
    window.open(src, '_blank', 'noopener');
    return;
  }
  const img = document.getElementById('lightbox-img');
  img.src = src;
  img.alt = label;
  document.getElementById('lightbox-caption').textContent = label;
  dialog.showModal();
}

function wireLightbox() {
  const dialog = document.getElementById('lightbox');
  if (!dialog) return;
  dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
  // A click on the dark backdrop lands on the <dialog> element itself, not on its content.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
}

function wireWhatsApp() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}`;
  ['hero-whatsapp', 'contact-whatsapp', 'whatsapp-float'].forEach((id) => {
    const link = document.getElementById(id);
    if (link) link.href = href;
  });
}

function wireReveal() {
  const targets = document.querySelectorAll('.reveal');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  targets.forEach((el) => observer.observe(el));
}

function wireFooter() {
  const kvk = document.getElementById('footer-kvk-number');
  const btw = document.getElementById('footer-btw-number');
  if (kvk) kvk.textContent = KVK_NUMBER || '-';
  if (btw) btw.textContent = BTW_ID || '-';
}

// Weekend promo banner (home page and booking page), shown until the date in config.js.
function wirePromo() {
  const banner = document.getElementById('promo');
  if (banner) banner.hidden = !promoActive(new Date(), PROMO_WEEKEND_UNTIL);
}

function wireLangToggle() {
  document.getElementById('lang-toggle').addEventListener('click', () => {
    setLang(getLang() === 'en' ? 'es' : 'en');
  });
}

// Last answer of the postcode check, kept so a language switch re-renders it without a new lookup.
let coverageResult = null;

// PDOK uses official municipality-style names; show the names people use.
const PLACE_NAMES = { "'s-Gravenhage": 'Den Haag' };

function renderCoverage(lang) {
  const box = document.getElementById('coverage-result');
  if (!box || !coverageResult) return;

  const { status, postcode, place } = coverageResult;
  const label = place ? `${postcode} (${PLACE_NAMES[place] || place})` : postcode;
  box.innerHTML = '';
  box.className = `coverage-result is-${status}`;

  const message = document.createElement('p');
  message.textContent = t(lang, `coverage_${status}`).replace('{pc}', label);
  box.appendChild(message);

  if (['yes', 'maybe', 'no', 'error'].includes(status)) {
    const text = t(lang, 'coverage_wa_text').replace('{pc}', label);
    const link = document.createElement('a');
    link.className = 'btn btn-primary';
    link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = t(lang, 'coverage_ask');
    box.appendChild(link);
  }
}

function wireCoverage() {
  const form = document.getElementById('coverage-form');
  const input = document.getElementById('coverage-input');
  if (!form || !input) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button');
    if (button) button.disabled = true;
    coverageResult = { status: 'checking', postcode: '', place: null };
    renderCoverage(getLang());
    coverageResult = await checkPostcode(input.value);
    if (button) button.disabled = false;
    renderCoverage(getLang());
  });
}

function wireServiceSearch() {
  const input = document.getElementById('service-search');
  if (!input) return;
  input.addEventListener('input', () => {
    activeCategory = null;
    renderServices(getLang());
  });
}

function init() {
  const lang = getLang();
  document.documentElement.lang = lang;
  applyTranslations(lang);
  renderServices(lang);
  renderPortfolio(lang);
  wireWhatsApp();
  wireFooter();
  wirePromo();
  wireLangToggle();
  wireServiceSearch();
  wireCoverage();
  wireLightbox();
  wireReveal();
  initConsent();
}

init();
