import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readConsent, saveConsent, shouldShowBanner, analyticsCookieNames } from '../assets/js/consent.js';

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return { getItem: (k) => (k in data ? data[k] : null), setItem: (k, v) => { data[k] = String(v); }, data };
}

test('readConsent only accepts granted or denied', () => {
  assert.equal(readConsent(memoryStorage({ 'nicofix-consent': 'granted' })), 'granted');
  assert.equal(readConsent(memoryStorage({ 'nicofix-consent': 'denied' })), 'denied');
  assert.equal(readConsent(memoryStorage({ 'nicofix-consent': 'yes please' })), null);
  assert.equal(readConsent(memoryStorage()), null);
});

test('readConsent survives blocked storage', () => {
  const blocked = { getItem: () => { throw new Error('blocked'); } };
  assert.equal(readConsent(blocked), null);
});

test('saveConsent stores the choice and survives blocked storage', () => {
  const storage = memoryStorage();
  saveConsent(storage, 'denied');
  assert.equal(storage.data['nicofix-consent'], 'denied');
  assert.doesNotThrow(() => saveConsent({ setItem: () => { throw new Error('blocked'); } }, 'granted'));
});

test('the banner shows only when analytics is configured and nothing was chosen yet', () => {
  assert.equal(shouldShowBanner('', null), false);
  assert.equal(shouldShowBanner('G-ABC123', null), true);
  assert.equal(shouldShowBanner('G-ABC123', 'granted'), false);
  assert.equal(shouldShowBanner('G-ABC123', 'denied'), false);
});

test('analyticsCookieNames finds only the Google Analytics cookies', () => {
  assert.deepEqual(analyticsCookieNames('_ga=GA1.1.1; theme=dark; _ga_ABC123=GS1.1; _gat=1'), ['_ga', '_ga_ABC123']);
  assert.deepEqual(analyticsCookieNames(''), []);
});
