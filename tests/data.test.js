import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS } from '../js/data/levels.js';
import { BADGES } from '../js/data/badges.js';
import { PHASES } from '../js/data/phases.js';
import { VIDEOS, VIDEO_CATEGORIES } from '../js/data/videos.js';

test('LEVELS: max thresholds strictly increase', () => {
  for (let i = 1; i < LEVELS.length; i++) {
    assert.ok(LEVELS[i].max > LEVELS[i - 1].max, `level ${i} max must grow`);
  }
});

test('BADGES: unique ids, each condition callable', () => {
  const ids = BADGES.map(b => b.id);
  assert.equal(new Set(ids).size, ids.length);
  const emptyState = {
    xp: 0, streak: 0, hasBMI: false, currentPhase: 0,
    counters: { workouts: 0, meals: 0, sleeps: 0, snaps: 0, calorieDays: 0 },
  };
  BADGES.forEach(b => assert.equal(b.isEarned(emptyState), false, `${b.id} must not be earned on empty state`));
});

test('BADGES: conditions trigger at their thresholds', () => {
  const s = {
    xp: 500, streak: 7, hasBMI: true, currentPhase: 2,
    counters: { workouts: 10, meals: 10, sleeps: 7, snaps: 10, calorieDays: 3 },
  };
  BADGES.forEach(b => assert.equal(b.isEarned(s), true, `${b.id} should be earned`));
});

test('PHASES: 7-slot plans, workout days match exPerWeek', () => {
  PHASES.forEach(p => {
    assert.equal(p.plan.length, 7, `${p.id} plan must have 7 slots`);
    const workoutDays = p.plan.filter(Boolean).length;
    assert.equal(workoutDays, p.exPerWeek, `${p.id}: plan days (${workoutDays}) must equal exPerWeek (${p.exPerWeek})`);
  });
});

test('VIDEOS: unique ids and URLs, valid cats', () => {
  const all = [...VIDEOS.easy, ...VIDEOS.medium, ...VIDEOS.hard, ...VIDEOS.recovery];
  const ids = all.map(v => v.id);
  const urls = all.map(v => v.url);
  assert.equal(new Set(ids).size, ids.length, 'video ids must be unique');
  assert.equal(new Set(urls).size, urls.length, 'video URLs must be unique');
  const catIds = new Set(VIDEO_CATEGORIES.map(c => c.id));
  all.forEach(v => {
    assert.ok(Array.isArray(v.cats) && v.cats.length, `${v.id} needs cats`);
    v.cats.forEach(c => assert.ok(catIds.has(c), `${v.id}: unknown cat ${c}`));
  });
});

test('every non-today category matches at least one video', () => {
  const all = [...VIDEOS.easy, ...VIDEOS.medium, ...VIDEOS.hard, ...VIDEOS.recovery];
  VIDEO_CATEGORIES.filter(c => c.id !== 'today').forEach(c => {
    assert.ok(all.some(v => v.cats.includes(c.id)), `category ${c.id} has no videos`);
  });
});
