import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isRetryableStatus, attemptCount, waitBefore, fetchRetry, fetchOnce, slotsKey, makeCache } from '../assets/js/resilient-fetch.js';

const res = (status) => ({ status, ok: status >= 200 && status < 300 });

test('retry schedule: 3 attempts, waits 1.5 s then 4 s', () => {
  assert.equal(attemptCount(), 3);
  assert.deepEqual([1, 2, 3].map((n) => waitBefore(n)), [0, 1500, 4000]);
});

test('retryable statuses are gateway/server ones, never 4xx answers', () => {
  for (const s of [502, 503, 504, 500, 429, 408]) assert.equal(isRetryableStatus(s), true);
  for (const s of [200, 400, 404, 409]) assert.equal(isRetryableStatus(s), false);
});

test('fails twice then succeeds', async () => {
  const seq = [res(503), () => { throw new TypeError('network'); }, res(200)];
  let i = 0; const slept = []; const retried = [];
  const r = await fetchRetry('x', { fetchFn: async () => { const v = seq[i++]; return typeof v === 'function' ? v() : v; }, sleep: async (ms) => { slept.push(ms); }, onRetry: (n) => retried.push(n) });
  assert.equal(r.status, 200);
  assert.equal(i, 3);
  assert.deepEqual(slept, [1500, 4000]);
  assert.deepEqual(retried, [1, 2]);
});

test('a 4xx is returned without retrying', async () => {
  let i = 0;
  const r = await fetchRetry('x', { fetchFn: async () => { i++; return res(409); }, sleep: async () => {} });
  assert.equal(r.status, 409); assert.equal(i, 1);
});

test('throws after all attempts fail', async () => {
  let i = 0;
  await assert.rejects(fetchRetry('x', { fetchFn: async () => { i++; return res(503); }, sleep: async () => {} }));
  assert.equal(i, 3);
});

test('a hanging request times out and is retried', async () => {
  let i = 0;
  const hang = (u, o) => new Promise((_, rej) => { i++; o.signal.addEventListener('abort', () => rej(new Error('aborted'))); });
  await assert.rejects(fetchRetry('x', { fetchFn: hang, timeoutMs: 10, sleep: async () => {} }));
  assert.equal(i, 3);
});

test('fetchOnce does not retry', async () => {
  let i = 0;
  await assert.rejects(fetchOnce('x', {}, 1000, async () => { i++; throw new Error('boom'); }));
  assert.equal(i, 1);
});

test('cache is keyed by kind and normalized postcode', () => {
  assert.equal(slotsKey('visit', '3117 re'), slotsKey('visit', '3117RE'));
  const c = makeCache();
  c.set('visit', '3117 re', { a: 1 });
  assert.deepEqual(c.get('visit', '3117RE'), { a: 1 });
  assert.equal(c.get('work', '3117RE'), null);
});
