import { test } from 'node:test';
import assert from 'node:assert/strict';
import { servicesData, groupByCategory, CATEGORY_ORDER } from '../assets/js/services-data.js';

test('servicesData has exactly the 38 confirmed services', () => {
  assert.equal(servicesData.length, 38);
  for (const item of servicesData) {
    assert.equal(typeof item.key, 'string');
    assert.equal(typeof item.category, 'string');
  }
  const keys = servicesData.map((item) => item.key);
  assert.equal(new Set(keys).size, 38, 'service keys must be unique');
});

test('groupByCategory groups items under their category and covers every card in CATEGORY_ORDER', () => {
  const grouped = groupByCategory(servicesData);
  const categories = Object.keys(grouped);
  assert.deepEqual([...categories].sort(), [...CATEGORY_ORDER].sort());
  for (const category of categories) {
    for (const item of grouped[category]) {
      assert.equal(item.category, category);
    }
  }
});
