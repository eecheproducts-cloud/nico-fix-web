// Fetch with timeout and automatic retries, for when the backend is deploying or cold-starting.
// The pure helpers (schedule, retryable statuses) are tested in tests/resilient-fetch.test.js.
export const TIMEOUT_MS = 12000;
export const RETRY_WAITS_MS = [1500, 4000]; // waits before attempt 2 and attempt 3 (3 attempts in all)
const RETRYABLE = new Set([408, 429, 500, 502, 503, 504]);

export function isRetryableStatus(status) { return RETRYABLE.has(status); }
export function attemptCount(waits = RETRY_WAITS_MS) { return waits.length + 1; }
export function waitBefore(attempt, waits = RETRY_WAITS_MS) { return attempt <= 1 ? 0 : (waits[attempt - 2] ?? waits[waits.length - 1] ?? 0); }

async function once(url, options, timeoutMs, fetchFn) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try { return await fetchFn(url, { ...options, signal: ctl.signal }); } finally { clearTimeout(timer); }
}

// Resolves with the Response (any non-retryable status, including 4xx, is returned as is).
// Throws only when every attempt failed (network error, timeout or a retryable status).
// onRetry(attemptThatFailed) is called before each wait, so the page can show a "one moment" line.
export async function fetchRetry(url, { options = {}, timeoutMs = TIMEOUT_MS, waits = RETRY_WAITS_MS, onRetry = null,
  fetchFn = (...a) => fetch(...a), sleep = (ms) => new Promise((r) => setTimeout(r, ms)) } = {}) {
  const total = attemptCount(waits);
  let lastErr = null;
  for (let attempt = 1; attempt <= total; attempt++) {
    if (attempt > 1) await sleep(waitBefore(attempt, waits));
    try {
      const res = await once(url, options, timeoutMs, fetchFn);
      if (!isRetryableStatus(res.status)) return res;
      lastErr = new Error(`HTTP ${res.status}`);
    } catch (err) { lastErr = err; }
    if (attempt < total && onRetry) onRetry(attempt);
  }
  throw lastErr || new Error('fetch failed');
}

// One attempt only, with a timeout. Used for POST /book, which is never retried by itself.
export function fetchOnce(url, options = {}, timeoutMs = 30000, fetchFn = (...a) => fetch(...a)) {
  return once(url, options, timeoutMs, fetchFn);
}

// Last good /slots answer per (kind, postcode), for this page visit only.
export function slotsKey(kind, postcode) { return `${kind}|${String(postcode).replace(/\s+/g, '').toUpperCase()}`; }
export function makeCache() {
  const m = new Map();
  return { get: (k, p) => m.get(slotsKey(k, p)) || null, set: (k, p, v) => { m.set(slotsKey(k, p), v); } };
}
