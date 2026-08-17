import { test } from 'node:test';
import assert from 'node:assert/strict';
import { levelIndexFor } from '../js/features/gamification.js';
import { LEVELS } from '../js/data/levels.js';

test('levelIndexFor: boundaries', () => {
  assert.equal(levelIndexFor(0), 0);
  assert.equal(levelIndexFor(LEVELS[0].max - 1), 0);
  assert.equal(levelIndexFor(LEVELS[0].max), 1);
  assert.equal(levelIndexFor(LEVELS[1].max), 2);
});

test('levelIndexFor: huge XP caps at last level', () => {
  assert.equal(levelIndexFor(10 ** 9), LEVELS.length - 1);
});
