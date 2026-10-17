// scripts/build-landings.mjs
// Generates the static SEO landing pages (one per service, in English and Spanish)
// and the sitemap. Run with: node scripts/build-landings.mjs
// Everything is plain HTML so Google reads it without running any JavaScript.
// Writing style: no em dash anywhere. No invented reviews, prices or years of experience.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cities, services, SITE, WHATSAPP, copy } from './landings-data.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const path = (lang, slug) => (lang === 'es' ? `es/${slug.es}/` : `${slug.en}/`);
const url = (lang, slug) => `${SITE}/${path(lang, slug)}`;
const abs = (lang, slug) => `/${path(lang, slug)}`;

function waLink(lang, place) {
  const text = lang === 'es'
    ? `Hola Nico, necesito ayuda con un trabajo en ${place}: `
    : `Hi Nico, I need help with a job in ${place}: `;
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
}

function layout({ lang, slug, title, description, h1, lead, body, schema, image, place }) {
  const c = copy[lang];
  const other = lang === 'en' ? 'es' : 'en';
  const alt = (l) => `<link rel="alternate" hreflang="${l}" href="${url(l, slug)}" />`;
  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${url(lang, slug)}" />
  ${alt('en')}
  ${alt('es')}
  <link rel="alternate" hreflang="x-default" href="${url('en', slug)}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:site_name" content="Nico Fix" />
  <meta property="og:url" content="${url(lang, slug)}" />
  <meta property="og:image" content="${SITE}/assets/img/og-logo.jpg" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" type="image/png" href="/favicon-32.png" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="stylesheet" href="/assets/css/style.css" />
  <link rel="stylesheet" href="/assets/css/landing.css" />
  <script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
  </script>
</head>
<body>
  <header class="site-header">
    <div class="container header-inner">
      <a class="logo" href="/" aria-label="Nico Fix Handyman"><img src="/assets/img/logo/logo-horizontal-light.png" alt="Nico Fix Handyman" width="162" height="40" /></a>
      <nav class="main-nav">
        <a href="/">${c.nav_home}</a>
        <a href="/#services">${c.nav_services}</a>
        <a href="/#portfolio">${c.nav_work}</a>
        <a href="/#contact">${c.nav_contact}</a>
      </nav>
      <a class="lang-toggle" href="${abs(other, slug)}" hreflang="${other}" lang="${other}">${other === 'es' ? 'ES' : 'EN'}</a>
    </div>
  </header>

  <main>
    <section class="landing-hero">
      <div class="container landing-hero-inner">
        <div class="landing-hero-copy">
          <p class="eyebrow">${esc(c.eyebrow)}</p>
          <h1>${esc(h1)}</h1>
          <p class="landing-lead">${esc(lead)}</p>
          <div class="hero-actions">
            <a class="btn btn-primary btn-glow" href="${waLink(lang, place)}" target="_blank" rel="noopener">${c.cta}</a>
            <a class="btn btn-secondary" href="/#portfolio">${c.cta_work}</a>
          </div>
          <ul class="hero-badges">
            <li>${c.badge_lang}</li>
            <li>${c.badge_quote}</li>
            <li>${c.badge_kvk}</li>
          </ul>
        </div>
        <div class="landing-hero-photo">
          <img src="${image.src}" alt="${esc(image.alt[lang])}" width="900" height="900" fetchpriority="high" />
        </div>
      </div>
    </section>

${body}

    <section class="contact">
      <div class="container">
        <div class="contact-card">
          <h2>${esc(c.contact_title)}</h2>
          <p class="contact-body">${esc(c.contact_body)}</p>
          <a class="btn btn-primary btn-glow" href="${waLink(lang, place)}" target="_blank" rel="noopener">${c.cta}</a>
        </div>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="container footer-inner">
      <p>© 2026 Nico Fix · KVK 95562028 · <a href="mailto:info@nicofix.nl">info@nicofix.nl</a> · <a href="tel:+31610049118">+31 6 10049118</a></p>
      <p class="footer-links"><a href="/privacy.html">${c.privacy}</a></p>
    </div>
  </footer>

  <a class="whatsapp-float" href="${waLink(lang, place)}" target="_blank" rel="noopener" aria-label="WhatsApp">
    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.2h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.12h-.01a8.22 8.22 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.35c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.55-3.7 8.21-8.24 8.21zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.4-.12-.56.13-.17.25-.65.81-.79.97-.15.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.42h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08s.9 2.41 1.02 2.58c.12.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28z"/></svg>
  </a>
</body>
</html>
`;
}

function business(lang, extra = {}) {
  return {
    '@type': 'HomeAndConstructionBusiness',
    name: 'Nico Fix',
    url: `${SITE}/`,
    email: 'info@nicofix.nl',
    telephone: '+31 6 10049118',
    vatID: 'NL005161451B23',
    identifier: { '@type': 'PropertyValue', propertyID: 'KVK', value: '95562028' },
    image: `${SITE}/assets/img/portfolio/kitchen-after.jpg`,
    knowsLanguage: ['en', 'es'],
    ...extra,
  };
}

function breadcrumb(lang, label, slug) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Nico Fix', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: label, item: url(lang, slug) },
    ],
  };
}

function faqBlock(lang, items) {
  const c = copy[lang];
  const html = items.map((f) => `        <details class="faq-item"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('\n');
  return { html: `    <section class="landing-section">
      <div class="container">
        <h2>${esc(c.faq_title)}</h2>
${html}
      </div>
    </section>`, schema: {
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  } };
}

function links(lang, list, labelOf) {
  return list.map((x) => `<a href="${abs(lang, x.slug)}">${esc(labelOf(x))}</a>`).join('');
}

function servicePage(lang, svc) {
  const c = copy[lang];
  const faq = faqBlock(lang, svc.faq[lang]);
  const body = `    <section class="landing-section">
      <div class="container landing-text">
        <h2>${esc(svc.title[lang])}</h2>
        <p>${esc(svc.intro[lang])}</p>
        <ul class="landing-list">
${svc.items[lang].map((i) => `          <li>${esc(i)}</li>`).join('\n')}
        </ul>
        <p>${esc(svc.materials[lang])}</p>
      </div>
    </section>

    <section class="landing-section landing-alt">
      <div class="container">
        <h2>${esc(c.where_title)}</h2>
        <p>${esc(cities.map((x) => (lang === 'es' && x.esName) || x.name).join(' · '))}</p>
        <p class="landing-note"><strong>${esc(c.dont_title)}</strong> ${esc(c.dont_list)}</p>
      </div>
    </section>

${faq.html}

    <section class="landing-section landing-alt">
      <div class="container">
        <h2>${esc(c.other_services)}</h2>
        <p class="landing-links">${links(lang, services.filter((x) => x.id !== svc.id), (x) => x.title[lang])}</p>
      </div>
    </section>`;
  return layout({
    lang,
    slug: svc.slug,
    title: svc.seoTitle[lang],
    description: svc.seoDesc[lang],
    h1: svc.h1[lang],
    lead: svc.lead[lang],
    body,
    place: c.generic_place,
    image: svc.image,
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        business(lang, { areaServed: cities.map((x) => ({ '@type': 'City', name: x.name })) }),
        { '@type': 'Service', name: svc.title[lang], serviceType: svc.title[lang], provider: { '@type': 'HomeAndConstructionBusiness', name: 'Nico Fix', url: `${SITE}/` }, areaServed: cities.map((x) => ({ '@type': 'City', name: x.name })) },
        breadcrumb(lang, svc.title[lang], svc.slug),
        faq.schema,
      ],
    },
  });
}

function write(rel, content) {
  const file = join(root, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

const pages = [];
for (const lang of ['en', 'es']) {
  for (const svc of services) {
    write(`${path(lang, svc.slug)}index.html`, servicePage(lang, svc));
    pages.push({ lang, slug: svc.slug });
  }
}

const today = new Date().toISOString().slice(0, 10);
const entry = (loc, priority, alts = '') => `  <url>\n    <loc>${loc}</loc>\n${alts}    <lastmod>${today}</lastmod>\n    <priority>${priority}</priority>\n  </url>`;
const alternates = (slug) => ['en', 'es'].map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${url(l, slug)}" />\n`).join('');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entry(`${SITE}/`, '1.0')}
${entry(`${SITE}/reservar.html`, '0.8')}
${pages.map((p) => entry(url(p.lang, p.slug), '0.8', alternates(p.slug))).join('\n')}
</urlset>
`;
write('sitemap.xml', sitemap);
console.log(`Generated ${pages.length} pages and sitemap.xml`);
