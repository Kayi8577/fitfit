// BMI + TDEE calculator. Adopts the cutting-calorie target as the daily
// calorie goal, with safety floors (never below BMR / 1200 kcal).

import { XP_REWARDS } from '../config.js';
import { state } from '../core/state.js';
import { bus } from '../core/events.js';
import { $, numVal } from '../utils/dom.js';
import { bmiValue, bmr, tdee, cuttingTarget } from '../utils/health.js';
import { addXP } from './gamification.js';
import { toast } from './feedback.js';

// Prefill the form from the saved profile so re-visits keep the numbers.
export function initBMIForm() {
  const p = state.profile;
  if (p.h) $('bmi-h').value = p.h;
  if (p.w) $('bmi-w').value = p.w;
  if (p.age) $('bmi-age').value = p.age;
  $('bmi-sex').value = p.sex || 'm';
  $('bmi-act').value = p.activity || 'moderate';
}

export function calculateBMI() {
  const height = numVal('bmi-h', { min: 80, max: 250 });
  const weight = numVal('bmi-w', { min: 20, max: 300 });
  const age = numVal('bmi-age', { min: 10, max: 120, def: 30 });
  const sex = $('bmi-sex').value;
  const activity = $('bmi-act').value;
  if (!height || !weight) { toast('請輸入有效的身高和體重'); return; }

  const bmi = bmiValue(height, weight);
  let category, color;
  if (bmi < 18.5) { category = '體重偏輕 💙'; color = 'var(--sky)'; }
  else if (bmi < 24) { category = '體重正常 ✅'; color = 'var(--primary-deep)'; }
  else if (bmi < 28) { category = '體重過重 ⚠️'; color = 'var(--navy)'; }
  else { category = '肥胖 🔴'; color = 'var(--cyan)'; }

  $('bmi-val').textContent = bmi;
  $('bmi-val').style.color = color;
  $('bmi-cat').textContent = category;
  $('bmi-ptr').style.left = Math.min(95, Math.max(5, (bmi - 15) / 25 * 100)) + '%';

  const bmrVal = bmr({ weightKg: weight, heightCm: height, age, sex });
  const tdeeVal = tdee(bmrVal, activity);
  const cut = cuttingTarget(tdeeVal, bmrVal);
  $('tdee-lbl').textContent = tdeeVal + ' kcal';
  $('cut-lbl').textContent = cut + ' kcal' + (cut > Math.round(tdeeVal * 0.8) ? '（已套用安全下限）' : '');
  $('bmi-res').style.display = 'block';

  state.profile = { h: height, w: weight, age, sex, activity };
  state.goals.cal = cut;
  $('g-cal').value = cut;
  state.hasBMI = true;
  addXP(XP_REWARDS.bmi, '📊', '數據達人！', '了解自己的身體是第一步');
  bus.emit('state:changed');
}
