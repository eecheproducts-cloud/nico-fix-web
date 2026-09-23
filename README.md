# Nico Fix — website

One-page bilingual (EN/ES) site for Nico Fix, static HTML/CSS/JS, deployed on GitHub Pages.

## Run locally

ES modules need an actual HTTP server (not `file://`):

    python -m http.server 8000

Then open http://localhost:8000

## Run tests

    npm test

## Pending before this goes live

- [ ] Replace `WHATSAPP_NUMBER` in `assets/js/main.js` with Nico's real WhatsApp number (also update the hardcoded fallback `href` on `#hero-whatsapp` in `index.html` to match).
- [ ] Replace `CONTACT_WEBHOOK_URL` in `assets/js/main.js` once the n8n contact-form workflow exists.
- [ ] Replace `CONTACT_EMAIL` in `assets/js/main.js` with Nico's real business email (currently empty, so the contact-form error fallback only shows the WhatsApp link, no mailto link).
- [ ] Replace `KVK_NUMBER` in `assets/js/main.js` once "Nico Fix" is registered as an extra handelsnaam on the existing KVK.
- [ ] Replace the placeholder blocks in `assets/js/portfolio-data.js` with real photos from the Schiedam renovation (May 2026) once Maria brings them over — add real `<img>` rendering in `renderPortfolio()` in `main.js` at that point, the placeholder div approach is meant to be swapped, not extended.
- [ ] Buy a real domain and point it at GitHub Pages (currently ships on the default `github.io` URL).

The services list (`assets/js/services-data.js`) is already final — sourced from the Notion "Checklist de Servicios" database on 2026-09-22. If the offering changes later, update that Notion database first, then mirror the change here (add/remove the `{key, category}` entry and its `svc_*` translation pair in `i18n.js`).

## Deploy to GitHub Pages

1. Create a new repo under the `eecheproducts-cloud` GitHub org (e.g. `nico-fix-web`).
2. `git remote add origin git@github.com:eecheproducts-cloud/nico-fix-web.git`
3. `git push -u origin main`
4. In the repo's Settings → Pages, set source to the `main` branch, root folder.
5. Site goes live at `https://eecheproducts-cloud.github.io/nico-fix-web/`.
