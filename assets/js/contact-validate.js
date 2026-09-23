export function validateLead({ name, message }, t, lang) {
  const errors = {};
  if (!name || !name.trim()) errors.name = t(lang, 'contact_validation_name');
  if (!message || !message.trim()) errors.message = t(lang, 'contact_validation_message');
  return { valid: Object.keys(errors).length === 0, errors };
}

export function buildLeadPayload({ name, workType, message, lang }) {
  return {
    name,
    workType,
    message,
    lang,
    source: 'nicofix-website',
    submittedAt: new Date().toISOString(),
  };
}
