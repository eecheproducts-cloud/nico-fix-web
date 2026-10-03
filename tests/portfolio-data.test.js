import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sortPortfolio, portfolioItems } from '../assets/js/portfolio-data.js';

const labels = {
  room_bath: 'Baño',
  room_kitchen: 'Cocina',
  room_pergola: 'Pérgola',
  room_living: 'Living',
};
const labelFor = (key) => labels[key];

test('groups photos of the same work together, alphabetically, ignoring accents', () => {
  const items = [
    { image: 'p1', roomKey: 'room_pergola', stateKey: null },
    { image: 'k-after', roomKey: 'room_kitchen', stateKey: 'portfolio_after' },
    { image: 'b-after', roomKey: 'room_bath', stateKey: 'portfolio_after' },
    { image: 'p2', roomKey: 'room_pergola', stateKey: null },
    { image: 'b-before', roomKey: 'room_bath', stateKey: 'portfolio_before' },
    { image: 'k-before', roomKey: 'room_kitchen', stateKey: 'portfolio_before' },
    { image: 'l', roomKey: 'room_living', stateKey: 'portfolio_before' },
  ];
  assert.deepEqual(
    sortPortfolio(items, labelFor).map((item) => item.image),
    ['b-before', 'b-after', 'k-before', 'k-after', 'l', 'p1', 'p2'],
  );
});

test('within a group, before comes first, then after, then photos without a state', () => {
  const items = [
    { image: 'extra', roomKey: 'room_bath', stateKey: null },
    { image: 'after', roomKey: 'room_bath', stateKey: 'portfolio_after' },
    { image: 'before', roomKey: 'room_bath', stateKey: 'portfolio_before' },
  ];
  assert.deepEqual(sortPortfolio(items, labelFor).map((item) => item.image), ['before', 'after', 'extra']);
});

test('does not modify the original list', () => {
  const copy = portfolioItems.map((item) => ({ ...item }));
  sortPortfolio(portfolioItems, (key) => key);
  assert.deepEqual(portfolioItems, copy);
});
