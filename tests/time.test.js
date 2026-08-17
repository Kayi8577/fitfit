import { test } from 'node:test';
import assert from 'node:assert/strict';
import { minutesBetween, dateKey, weekKey, todayIndex, shortLabel } from '../js/utils/time.js';

test('minutesBetween: same-day span', () => {
  assert.equal(minutesBetween('10:00', '20:00'), 600);
});

test('minutesBetween: wraps past midnight', () => {
  assert.equal(minutesBetween('23:00', '07:00'), 480);
});

test('minutesBetween: zero span', () => {
  assert.equal(minutesBetween('08:30', '08:30'), 0);
});

test('dateKey: local YYYY-MM-DD', () => {
  assert.equal(dateKey(new Date(2026, 7, 17)), '2026-08-17');
  assert.equal(dateKey(new Date(2026, 0, 3)), '2026-01-03');
});

test('todayIndex: Monday-first mapping', () => {
  assert.equal(todayIndex(new Date(2026, 7, 17)), 0); // Mon
  assert.equal(todayIndex(new Date(2026, 7, 23)), 6); // Sun
});

test('weekKey: any day maps to its Monday', () => {
  const monday = '2026-08-17';
  for (let d = 17; d <= 23; d++) {
    assert.equal(weekKey(new Date(2026, 7, d)), monday);
  }
  assert.equal(weekKey(new Date(2026, 7, 24)), '2026-08-24');
});

test('shortLabel strips leading zeros', () => {
  assert.equal(shortLabel('2026-08-07'), '8/7');
});
