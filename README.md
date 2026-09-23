# Nico Fix, website

One-page bilingual (EN/ES) site for Nico Fix, static HTML/CSS/JS, deployed on GitHub Pages at [nicofix.nl](https://nicofix.nl).

## Run locally

ES modules need an actual HTTP server (not `file://`):

    python -m http.server 8000

Then open http://localhost:8000

## Run tests

    npm test

## Pending before this goes fully live

- [x] Replace `WHATSAPP_NUMBER` in `assets/js/main.js` with Nico's real WhatsApp number. Done 2026-09-23, using his personal number for now, swap to the dedicated WhatsApp Business number once that exists (see Notion "WhatsApp Business separado + Bot").
- [x] Buy a domain and connect it to GitHub Pages. Done, `nicofix.nl` via TransIP, CNAME file in repo root.
- [x] Register "Nico Fix" as an extra handelsnaam on the existing KVK. Done.
- [x] Add real photos from the Schiedam renovation to the portfolio. Done, `assets/js/portfolio-data.js`.
- [ ] Add the real KVK number to `KVK_NUMBER` in `assets/js/main.js` (still shows a dash in the footer).
- [ ] Replace `CONTACT_WEBHOOK_URL` in `assets/js/main.js` once the contact-form backend exists.
- [ ] Replace `CONTACT_EMAIL` in `assets/js/main.js` with Nico's real business email (currently empty, so the contact-form error fallback only shows the WhatsApp link, no mailto link).

The services list (`assets/js/services-data.js`) is final, sourced from the Notion "Checklist de Servicios" database on 2026-09-22. If the offering changes later, update that Notion database first, then mirror the change here (add/remove the `{key, category}` entry and its `svc_*` translation pair in `i18n.js`).

Writing style: no em dash anywhere on this site or in its docs. Use a comma, a period, or a colon instead.

## Deploy to GitHub Pages

Already deployed. To push further changes:

    git push

Repo: `eecheproducts-cloud/nico-fix-web`. Custom domain via the `CNAME` file at the repo root plus DNS records at TransIP (4 A records for `@` pointing at GitHub Pages, 1 CNAME for `www`).
