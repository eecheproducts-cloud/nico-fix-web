// assets/js/consent.js
// Google Analytics, loaded only after the visitor accepts in the cookie banner (Dutch and EU
// rules require consent before analytics cookies are set). Rejecting is as easy as accepting,
// and the choice can be changed later from the footer link.

// GA4 measurement id ("G-..."). While it is empty there is no banner and nothing is loaded.
export const GA_ID = 'G-RF1VXC1P0D';

const STORAGE_KEY = 'nicofix-consent';

export function readConsent(storage) {
  try {
    const value = storage?.getItem(STORAGE_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

export function saveConsent(storage, value) {
  try {
    storage?.setItem(STORAGE_KEY, value);
  } catch {
    // Storage blocked: the choice still applies to this page load.
  }
}

// Maria's and Nico's own phones and laptops: opening any page once with ?equipo=1 marks the
// device so it never loads analytics (their visits don't inflate the numbers); ?equipo=0 undoes it.
const TEAM_KEY = 'nicofix-equipo';

export function isTeamDevice(search, storage) {
  const flag = new URLSearchParams(search || '').get('equipo');
  try {
    if (flag === '1') storage?.setItem(TEAM_KEY, '1');
    if (flag === '0') storage?.removeItem(TEAM_KEY);
  } catch {
    // Storage blocked: the link still applies to this page load.
  }
  if (flag === '1') return true;
  if (flag === '0') return false;
  try {
    return storage?.getItem(TEAM_KEY) === '1';
  } catch {
    return false;
  }
}

export function shouldShowBanner(gaId, consent) {
  return Boolean(gaId) && consent === null;
}

// Names of the Google Analytics cookies in a document.cookie string (_ga, _ga_XXXX).
export function analyticsCookieNames(cookieString) {
  return String(cookieString ?? '')
    .split(';')
    .map((part) => part.split('=')[0].trim())
    .filter((name) => name === '_ga' || name.startsWith('_ga_'));
}

function loadAnalytics() {
  if (!GA_ID || window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID);
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(script);
}

function deleteAnalyticsCookies() {
  const host = location.hostname;
  analyticsCookieNames(document.cookie).forEach((name) => {
    [host, `.${host}`, ''].forEach((domain) => {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ''}`;
    });
  });
}

// Counts clicks on any WhatsApp link (only when analytics was accepted and loaded).
function wireWhatsAppTracking() {
  document.addEventListener('click', (event) => {
    const link = event.target.closest?.('a[href*="wa.me/"]');
    if (link && window.gtag) {
      window.gtag('event', 'whatsapp_click', { link_id: link.id || link.closest('[id]')?.id || 'other' });
    }
  });
}

export function initConsent() {
  const banner = document.getElementById('cookie-banner');
  const settings = document.getElementById('cookie-settings');
  if (!GA_ID || !banner) return;
  if (isTeamDevice(location.search, window.localStorage)) return;

  const consent = readConsent(window.localStorage);
  if (consent === 'granted') loadAnalytics();
  banner.hidden = !shouldShowBanner(GA_ID, consent);
  if (settings) settings.hidden = false;
  wireWhatsAppTracking();

  document.getElementById('cookie-accept')?.addEventListener('click', () => {
    saveConsent(window.localStorage, 'granted');
    banner.hidden = true;
    loadAnalytics();
  });

  document.getElementById('cookie-decline')?.addEventListener('click', () => {
    const wasGranted = readConsent(window.localStorage) === 'granted';
    saveConsent(window.localStorage, 'denied');
    banner.hidden = true;
    deleteAnalyticsCookies();
    // Analytics already running on this page cannot be unloaded; a reload starts clean.
    if (wasGranted) location.reload();
  });

  settings?.addEventListener('click', (event) => {
    event.preventDefault();
    banner.hidden = false;
  });
}
