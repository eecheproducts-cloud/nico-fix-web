import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateLead, buildLeadPayload } from '../assets/js/contact-validate.js';
import { t } from '../assets/js/i18n.js';

test('validateLead rejects empty name and message', () => {
  const result = validateLead({ name: '', workType: 'painting', message: '' }, t, 'en');
  assert.equal(result.valid, false);
  assert.equal(result.errors.name, t('en', 'contact_validation_name'));
  assert.equal(result.errors.message, t('en', 'contact_validation_message'));
});

test('validateLead accepts a filled-in form', () => {
  const result = validateLead({ name: 'Jane', workType: 'painting', message: 'Paint my hallway' }, t, 'en');
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
});

test('buildLeadPayload shapes the payload for the webhook', () => {
  const payload = buildLeadPayload({ name: 'Jane', workType: 'painting', message: 'Paint my hallway', lang: 'en' });
  assert.equal(payload.name, 'Jane');
  assert.equal(payload.workType, 'painting');
  assert.equal(payload.message, 'Paint my hallway');
  assert.equal(payload.lang, 'en');
  assert.equal(payload.source, 'nicofix-website');
  assert.ok(!Number.isNaN(Date.parse(payload.submittedAt)));
});
