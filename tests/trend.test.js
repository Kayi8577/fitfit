import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dailyLast, movingAverage } from '../js/utils/health.js';
import { buildCoachContext } from '../js/features/coach.js';

test('dailyLast: last entry per day wins, sorted, undated dropped', () => {
  const entries = [
    { date: '2026-08-12', v: 65.5 },
    { date: '2026-08-10', v: 66.0 },
    { date: '2026-08-12', v: 65.2 },   // same-day correction wins
    { v: 70, l: '8/1' },               // v1 entry without a date → dropped
    { date: '2026-08-11', v: 65.8 },
  ];
  assert.deepEqual(dailyLast(entries), [
    { date: '2026-08-10', v: 66.0 },
    { date: '2026-08-11', v: 65.8 },
    { date: '2026-08-12', v: 65.2 },
  ]);
  assert.deepEqual(dailyLast([]), []);
  assert.deepEqual(dailyLast(undefined), []);
});

test('movingAverage: trailing window grows from the start', () => {
  assert.deepEqual(movingAverage([1, 2, 3, 4], 2), [1, 1.5, 2.5, 3.5]);
  // Window wider than the series → cumulative average.
  assert.deepEqual(movingAverage([3, 6], 7), [3, 4.5]);
  assert.deepEqual(movingAverage([], 7), []);
});

test('movingAverage: 7-day window ignores older values', () => {
  const vals = [100, 0, 0, 0, 0, 0, 0, 7]; // last point: (0*6+7)/7 = 1
  assert.equal(movingAverage(vals, 7).at(-1), 1);
});

function fakeState(overrides = {}) {
  return {
    foodLogs: [{ cal: 500, pro: 30 }, { cal: 300, pro: 10 }],
    exLogs: [{ burn: 200 }],
    history: [
      { date: '2026-08-11', cal: 1800, burn: 100 },
      { date: '2026-08-12', cal: 2200, burn: 0 },
    ],
    weightHistory: [
      { date: '2026-08-01', v: 66 },
      { date: '2026-08-12', v: 64.8 },
    ],
    sleepLogs: [],
    goals: { ex: 3, cal: 1800, sleep: 7.5 },
    streak: 4,
    weekDone: [true, false, true, false, false, false, false],
    ...overrides,
  };
}

test('buildCoachContext: includes today, history, weight trend and streak', () => {
  const ctx = buildCoachContext(fakeState());
  assert.match(ctx, /今日：攝入800kcal（蛋白質40g），運動消耗200kcal/);
  assert.match(ctx, /8\/11攝入1800消耗100/);
  assert.match(ctx, /日均攝入2000/);
  assert.match(ctx, /體重：8\/1 66kg → 8\/12 64\.8kg/);
  assert.match(ctx, /睡眠：未記錄/);
  assert.match(ctx, /連續運動4天，本週已練2\/3次/);
});

test('buildCoachContext: empty state degrades gracefully', () => {
  const ctx = buildCoachContext(fakeState({ foodLogs: [], exLogs: [], history: [], weightHistory: [] }));
  assert.match(ctx, /今日：攝入0kcal/);
  assert.ok(!ctx.includes('體重'));
  assert.ok(!ctx.includes('前'));
});
