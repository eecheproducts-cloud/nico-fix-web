// assets/js/main.js
import { t, translations } from './i18n.js';
import { servicesData, groupByCategory } from './services-data.js';
import { portfolioItems } from './portfolio-data.js';
import { validateLead, buildLeadPayload } from './contact-validate.js';

// TODO before going live: replace with the real n8n webhook URL once that workflow is built.
const CONTACT_WEBHOOK_URL = '';
// TODO before going live: replace with Nico's real business email.
const CONTACT_EMAIL = '';
// NOTE: index.html's #hero-whatsapp and #whatsapp-float hrefs have this same number hardcoded as a
// no-JS fallback, update it there too when this changes (e.g. once the separate Twilio WhatsApp
// Business number exists, see the Notion "WhatsApp Business separado + Bot" guide).
const WHATSAPP_NUMBER = '31630758860';
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
  renderWorkTypeOptions(lang);
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

function renderWorkTypeOptions(lang) {
  const select = document.getElementById('work-type-select');
  const previousValue = select.value;
  select.innerHTML = '';
  const labels = CATEGORY_LABELS[lang] || CATEGORY_LABELS.en;
  Object.keys(labels).forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = labels[category];
    select.appendChild(option);
  });
  const otherOption = document.createElement('option');
  otherOption.value = 'other';
  otherOption.textContent = t(lang, 'contact_work_type_other');
  select.appendChild(otherOption);

  if (previousValue && Array.from(select.options).some((opt) => opt.value === previousValue)) {
    select.value = previousValue;
  } else {
    select.selectedIndex = 0;
  }
}

function wireWhatsApp() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}`;
  document.getElementById('hero-whatsapp').href = href;
  const floatBtn = document.getElementById('whatsapp-float');
  if (floatBtn) floatBtn.href = href;
}

function wireFooter() {
  document.getElementById('footer-kvk-number').textContent = KVK_NUMBER || '-';
}

function wireLangToggle() {
  document.getElementById('lang-toggle').addEventListener('click', () => {
    setLang(getLang() === 'en' ? 'es' : 'en');
  });
}

async function submitLead(payload) {
  if (!CONTACT_WEBHOOK_URL) {
    throw new Error('no-webhook-configured');
  }
  const response = await fetch(CONTACT_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`webhook-failed-${response.status}`);
}

function showContactFallback(feedback, lang) {
  feedback.innerHTML = '';

  const errorText = document.createElement('span');
  errorText.textContent = t(lang, 'contact_error');
  feedback.appendChild(errorText);

  feedback.appendChild(document.createTextNode(' '));

  const whatsappLink = document.createElement('a');
  whatsappLink.href = `https://wa.me/${WHATSAPP_NUMBER}`;
  whatsappLink.target = '_blank';
  whatsappLink.rel = 'noopener';
  whatsappLink.textContent = t(lang, 'hero_cta_whatsapp');
  feedback.appendChild(whatsappLink);

  if (CONTACT_EMAIL) {
    feedback.appendChild(document.createTextNode(' '));
    const emailLink = document.createElement('a');
    emailLink.href = `mailto:${CONTACT_EMAIL}`;
    emailLink.textContent = CONTACT_EMAIL;
    feedback.appendChild(emailLink);
  }

  feedback.className = 'error';
}

function wireContactForm() {
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('contact-feedback');
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    submitButton.disabled = true;
    const lang = getLang();
    const formData = new FormData(form);
    const fields = {
      name: formData.get('name'),
      workType: formData.get('workType'),
      message: formData.get('message'),
    };

    const { valid, errors } = validateLead(fields, t, lang);
    if (!valid) {
      feedback.textContent = errors.name || errors.message;
      feedback.className = 'error';
      submitButton.disabled = false;
      return;
    }

    const payload = buildLeadPayload({ ...fields, lang });

    try {
      await submitLead(payload);
      feedback.textContent = t(lang, 'contact_success');
      feedback.className = 'success';
      form.reset();
    } catch (err) {
      showContactFallback(feedback, lang);
    } finally {
      submitButton.disabled = false;
    }
  });
}

function init() {
  const lang = getLang();
  document.documentElement.lang = lang;
  applyTranslations(lang);
  renderServices(lang);
  renderPortfolio(lang);
  renderWorkTypeOptions(lang);
  wireWhatsApp();
  wireFooter();
  wireLangToggle();
  wireContactForm();
}

init();
