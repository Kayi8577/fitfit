import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FOODS, findFood, topFrequentFoods, pruneFoodFreq } from '../js/data/foods.js';

test('FOODS: names unique, values sane', () => {
  const names = FOODS.map(f => f.name);
  assert.equal(new Set(names).size, names.length, 'duplicate food names');
  for (const f of FOODS) {
    assert.ok(f.cal >= 0 && f.cal <= 2000, `${f.name} cal out of range`);
    assert.ok(f.pro >= 0 && f.pro <= 100, `${f.name} protein out of range`);
    assert.ok(['早餐', '午餐', '晚餐', '點心'].includes(f.type), `${f.name} bad type`);
  }
});

test('findFood: exact match with trimming, null otherwise', () => {
  assert.equal(findFood('雞腿便當').cal, 850);
  assert.equal(findFood('  雞腿便當  ').cal, 850);
  assert.equal(findFood('雞腿'), null);
  assert.equal(findFood(''), null);
  assert.equal(findFood(null), null);
});

test('topFrequentFoods: ranks by count, ties by recency', () => {
  const freq = {
    A: { count: 2, lastUsed: '2026-08-01', cal: 100 },
    B: { count: 5, lastUsed: '2026-07-01', cal: 200 },
    C: { count: 2, lastUsed: '2026-08-10', cal: 300 },
  };
  const top = topFrequentFoods(freq, 2);
  assert.deepEqual(top.map(f => f.name), ['B', 'C']);
  assert.equal(top[0].cal, 200);
});

test('topFrequentFoods: empty/missing map', () => {
  assert.deepEqual(topFrequentFoods({}, 5), []);
  assert.deepEqual(topFrequentFoods(undefined, 5), []);
});

test('pruneFoodFreq: keeps the most-used entries under the cap', () => {
  const freq = {};
  for (let i = 0; i < 10; i++) freq['f' + i] = { count: i + 1, lastUsed: '2026-08-01' };
  const pruned = pruneFoodFreq(freq, 3);
  assert.deepEqual(Object.keys(pruned).sort(), ['f7', 'f8', 'f9']);
  // Under the cap: untouched (same reference is fine).
  assert.equal(pruneFoodFreq(freq, 100), freq);
});
