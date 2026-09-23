import { test } from 'node:test';
import assert from 'node:assert/strict';
import { servicesData, groupByCategory } from '../assets/js/services-data.js';

test('servicesData has exactly the 30 confirmed services', () => {
  assert.equal(servicesData.length, 30);
  for (const item of servicesData) {
    assert.equal(typeof item.key, 'string');
    assert.equal(typeof item.category, 'string');
  }
  const keys = servicesData.map((item) => item.key);
  assert.equal(new Set(keys).size, 30, 'service keys must be unique');
});

test('groupByCategory groups items under their category and covers all 10 categories', () => {
  const grouped = groupByCategory(servicesData);
  const categories = Object.keys(grouped);
  assert.equal(categories.length, 10);
  for (const category of categories) {
    for (const item of grouped[category]) {
      assert.equal(item.category, category);
    }
  }
});
