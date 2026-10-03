// assets/js/main.js
import { t, translations } from './i18n.js';
import { servicesData, groupByCategory } from './services-data.js';
import { portfolioItems } from './portfolio-data.js';

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

function renderServices(lang) {
  const container = document.getElementById('services-list');
  container.innerHTML = '';
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

function init() {
  const lang = getLang();
  document.documentElement.lang = lang;
  applyTranslations(lang);
  renderServices(lang);
  renderPortfolio(lang);
  wireWhatsApp();
  wireFooter();
  wireLangToggle();
  wireReveal();
}

init();
