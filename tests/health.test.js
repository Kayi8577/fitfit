import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bmiValue, bmr, tdee, cuttingTarget, clampNum, MIN_DAILY_KCAL, ACTIVITY_FACTORS } from '../js/utils/health.js';

test('bmiValue', () => {
  assert.equal(bmiValue(170, 65), 22.5);
  assert.equal(bmiValue(160, 80), 31.2); // 31.25 → banker's-ish float rounding lands low
});

test('bmr: Mifflin-St Jeor male/female', () => {
  assert.equal(bmr({ weightKg: 70, heightCm: 175, age: 30, sex: 'm' }), 10 * 70 + 6.25 * 175 - 150 + 5);
  assert.equal(bmr({ weightKg: 55, heightCm: 160, age: 25, sex: 'f' }), 10 * 55 + 6.25 * 160 - 125 - 161);
});

test('tdee: unknown activity falls back to moderate', () => {
  assert.equal(tdee(1500, 'nonsense'), Math.round(1500 * ACTIVITY_FACTORS.moderate));
  assert.equal(tdee(1500, 'sedentary'), 1800);
});

test('cuttingTarget: normal case is TDEE − 20%', () => {
  assert.equal(cuttingTarget(2500, 1700), 2000);
});

test('cuttingTarget: never below BMR', () => {
  // sedentary: tdee*0.8 = 0.96×bmr → floored to bmr
  const b = 1500;
  assert.equal(cuttingTarget(tdee(b, 'sedentary'), b), 1500);
});

test('cuttingTarget: never below absolute floor', () => {
  assert.equal(cuttingTarget(1100, 900), MIN_DAILY_KCAL);
});

test('clampNum: clamps, defaults on garbage', () => {
  assert.equal(clampNum(50, 0, 10), 10);
  assert.equal(clampNum(-5, 0, 10), 0);
  assert.equal(clampNum('abc', 0, 10, 7), 7);
  assert.equal(clampNum(Infinity, 0, 10, 3), 3);
});
