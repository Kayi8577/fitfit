// Pure health math — no DOM, no state, unit-testable.

export function bmiValue(heightCm, weightKg) {
  return Math.round(weightKg / (heightCm / 100) ** 2 * 10) / 10;
}

// Mifflin-St Jeor basal metabolic rate.
export function bmr({ weightKg, heightCm, age, sex }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'm' ? base + 5 : base - 161;
}

export const ACTIVITY_FACTORS = {
  sedentary: 1.2,   // 久坐（幾乎不運動）
  light: 1.375,     // 輕度（每週1-3次）
  moderate: 1.55,   // 中度（每週3-5次）
  active: 1.725,    // 高度（每週6-7次）
};

export function tdee(bmrVal, activity) {
  return Math.round(bmrVal * (ACTIVITY_FACTORS[activity] || ACTIVITY_FACTORS.moderate));
}

// Cutting target = TDEE − 20%, but never below BMR and never below an
// absolute safety floor — a lightweight user must not get a dangerous goal.
export const MIN_DAILY_KCAL = 1200;
export function cuttingTarget(tdeeVal, bmrVal) {
  return Math.max(Math.round(tdeeVal * 0.8), Math.round(bmrVal), MIN_DAILY_KCAL);
}

// Coerce anything to a finite number clamped to [min, max]; def on failure.
export function clampNum(value, min, max, def = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return def;
  return Math.min(max, Math.max(min, n));
}

// Collapse dated entries ({date:'YYYY-MM-DD', v}) to one point per day —
// the day's LAST entry wins (you weigh in, then correct a typo).
// Undated (v1) entries are dropped. Result is sorted by date ascending.
export function dailyLast(entries) {
  const byDate = new Map();
  (entries || []).forEach(e => {
    if (e && typeof e.v === 'number' && /^\d{4}-\d{2}-\d{2}$/.test(e.date || '')) byDate.set(e.date, e.v);
  });
  return [...byDate.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, v]) => ({ date, v }));
}

// Trailing moving average: point i averages the last `window` values up to
// and including i (the window grows from 1 at the start of the series).
export function movingAverage(values, window = 7) {
  return (values || []).map((_, i) => {
    const slice = values.slice(Math.max(0, i - window + 1), i + 1);
    const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
    return Math.round(avg * 100) / 100;
  });
}
