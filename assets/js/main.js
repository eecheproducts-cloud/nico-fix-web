// assets/js/main.js
import { t, translations } from './i18n.js';
import { servicesData, groupByCategory } from './services-data.js';
import { portfolioItems, sortPortfolio } from './portfolio-data.js';
import { buildSearchIndex, searchServices } from './services-search.js';
import { checkPostcode } from './coverage.js';

// Nico Fix's business number (WhatsApp only, not published as a phone line). index.html's
// WhatsApp links (#hero-whatsapp, #contact-whatsapp, #whatsapp-float) hardcode it too as a
// no-JS fallback, keep them in sync.
const WHATSAPP_NUMBER = '31610049118';
const KVK_NUMBER = '95562028';
const BTW_ID = 'NL005161451B23';

const CATEGORY_LABELS = {
  en: {
    assembly: 'Assembly',
    paint: 'Painting',
    maintenance: 'Maintenance',
    flooring: 'Flooring',
    plumbing: 'Plumbing',
    smart_home: 'Smart home',
    bathroom_kitchen: 'Bathroom & kitchen',
    security: 'Locks & security',
    outdoor: 'Outdoor',
    electrical: 'Electrical',
  },
  es: {
    assembly: 'Montaje',
    paint: 'Pintura',
    maintenance: 'Mantenimiento',
    flooring: 'Pisos',
    plumbing: 'Plomería',
    smart_home: 'Hogar inteligente',
    bathroom_kitchen: 'Baños y cocinas',
    security: 'Cerrajería y seguridad',
    outdoor: 'Exterior',
    electrical: 'Electricidad',
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
}

function applyTranslations(lang) {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(lang, el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.setAttribute('placeholder', t(lang, el.getAttribute('data-i18n-placeholder')));
  });
  document.title = t(lang, 'page_title');
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

  // Collapsible groups: open on wide screens, closed on phones so the list isn't four screens long.
  const startOpen = window.matchMedia('(min-width: 900px)').matches;
  const grouped = groupByCategory(servicesData);
  Object.entries(grouped).forEach(([category, items]) => {
    const group = document.createElement('details');
    group.className = 'service-group';
    group.open = startOpen;

    const summary = document.createElement('summary');
    const name = document.createElement('span');
    name.textContent = CATEGORY_LABELS[lang]?.[category] || category;
    const count = document.createElement('span');
    count.className = 'service-count';
    count.textContent = items.length;
    summary.append(name, count);
    group.appendChild(summary);

    const grid = document.createElement('div');
    grid.className = 'service-grid';
    items.forEach((item) => {
      const div = document.createElement('div');
      div.className = 'service-item';
      div.textContent = t(lang, item.key);
      grid.appendChild(div);
    });
    group.appendChild(grid);
    container.appendChild(group);
  });
}

function renderPortfolio(lang) {
  const container = document.getElementById('portfolio-grid');
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
  document.getElementById('footer-kvk-number').textContent = KVK_NUMBER || '-';
  document.getElementById('footer-btw-number').textContent = BTW_ID || '-';
}

function wireLangToggle() {
  document.getElementById('lang-toggle').addEventListener('click', () => {
    setLang(getLang() === 'en' ? 'es' : 'en');
  });
}

let coverageChecked = false;

function renderCoverage(lang) {
  const box = document.getElementById('coverage-result');
  const input = document.getElementById('coverage-input');
  if (!box || !input || !coverageChecked) return;

  const { status, postcode } = checkPostcode(input.value);
  box.innerHTML = '';
  box.className = `coverage-result is-${status}`;

  const message = document.createElement('p');
  message.textContent = t(lang, `coverage_${status}`).replace('{pc}', postcode);
  box.appendChild(message);

  if (status !== 'invalid') {
    const text = t(lang, 'coverage_wa_text').replace('{pc}', postcode);
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
  if (!form) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    coverageChecked = true;
    renderCoverage(getLang());
  });
}

function wireServiceSearch() {
  const input = document.getElementById('service-search');
  if (!input) return;
  input.addEventListener('input', () => renderServices(getLang()));
}

function init() {
  const lang = getLang();
  document.documentElement.lang = lang;
  applyTranslations(lang);
  renderServices(lang);
  renderPortfolio(lang);
  wireWhatsApp();
  wireFooter();
  wireLangToggle();
  wireServiceSearch();
  wireCoverage();
  wireLightbox();
  wireReveal();
}

init();
