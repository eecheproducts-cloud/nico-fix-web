// assets/js/main.js
import { t, translations } from './i18n.js';
import { servicesData, groupByCategory } from './services-data.js';
import { portfolioItems } from './portfolio-data.js';
import { buildSearchIndex, searchServices } from './services-search.js';

// Nico Fix's business number (WhatsApp only, not published as a phone line). index.html's
// WhatsApp links (#hero-whatsapp, #contact-whatsapp, #whatsapp-float) hardcode it too as a
// no-JS fallback, keep them in sync.
const WHATSAPP_NUMBER = '31610049118';
const KVK_NUMBER = ''; // fill in once "Nico Fix" is registered as an extra handelsnaam

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
    smart_home: 'Smart home',
    bathroom_kitchen: 'Baños y cocinas',
    security: 'Cerrajería y seguridad',
    outdoor: 'Exterior',
    electrical: 'Electricidad',
  },
};

function getLang() {
  try {
    return localStorage.getItem('nicofix-lang') || 'en';
  } catch {
    return 'en';
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
    if (result.matches.length > 0) {
      status.textContent = result.matches.length === 1
        ? t(lang, 'services_search_count_one')
        : t(lang, 'services_search_count').replace('{n}', result.matches.length);
      result.matches.forEach((key) => container.appendChild(searchResultItem(key, lang)));
    } else {
      status.textContent = `${t(lang, result.suggestions.length ? 'services_search_suggest' : 'services_search_none')} `;
      if (!result.suggestions.length) status.appendChild(whatsAppAskLink(lang));
      result.suggestions.forEach((key) => container.appendChild(searchResultItem(key, lang)));
    }
    return;
  }

  const grouped = groupByCategory(servicesData);
  Object.entries(grouped).forEach(([category, items]) => {
    const heading = document.createElement('h3');
    heading.className = 'service-category';
    heading.textContent = CATEGORY_LABELS[lang]?.[category] || category;
    container.appendChild(heading);
    items.forEach((item) => {
      const div = document.createElement('div');
      div.className = 'service-item';
      div.textContent = t(lang, item.key);
      div.title = CATEGORY_LABELS[lang]?.[category] || category;
      container.appendChild(div);
    });
  });
}

function renderPortfolio(lang) {
  const container = document.getElementById('portfolio-grid');
  container.innerHTML = '';
  portfolioItems.forEach((item) => {
    const figure = document.createElement('figure');
    figure.className = 'portfolio-item';

    const img = document.createElement('img');
    img.src = item.image;
    img.loading = 'lazy';
    img.alt = item.stateKey
      ? `${t(lang, item.roomKey)}, ${t(lang, item.stateKey)}`
      : t(lang, item.roomKey);
    figure.appendChild(img);

    const caption = document.createElement('figcaption');
    caption.textContent = item.stateKey
      ? `${t(lang, item.roomKey)}, ${t(lang, item.stateKey)}`
      : t(lang, item.roomKey);
    figure.appendChild(caption);

    container.appendChild(figure);
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
}

function wireLangToggle() {
  document.getElementById('lang-toggle').addEventListener('click', () => {
    setLang(getLang() === 'en' ? 'es' : 'en');
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
  wireReveal();
}

init();
