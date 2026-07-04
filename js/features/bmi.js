// BMI + TDEE calculator. Also adopts the cutting-calorie target
// as the user's daily calorie goal.

import { XP_REWARDS } from '../config.js';
import { state } from '../core/state.js';
import { bus } from '../core/events.js';
import { $ } from '../utils/dom.js';
import { addXP } from './gamification.js';
import { toast } from './feedback.js';

export function calculateBMI() {
  const height = parseFloat($('bmi-h').value);
  const weight = parseFloat($('bmi-w').value);
  const age = parseInt($('bmi-age').value) || 30;
  const sex = $('bmi-sex').value;
  if (!height || !weight) { toast('請輸入身高和體重'); return; }

  const bmi = Math.round(weight / (height / 100) ** 2 * 10) / 10;
  let category, color;
  if (bmi < 18.5) { category = '體重偏輕 💙'; color = 'var(--sky)'; }
  else if (bmi < 24) { category = '體重正常 ✅'; color = 'var(--mint2)'; }
  else if (bmi < 28) { category = '體重過重 ⚠️'; color = 'var(--peach)'; }
  else { category = '肥胖 🔴'; color = 'var(--pink)'; }

  $('bmi-val').textContent = bmi;
  $('bmi-val').style.color = color;
  $('bmi-cat').textContent = category;
  $('bmi-ptr').style.left = Math.min(95, Math.max(5, (bmi - 15) / 25 * 100)) + '%';

  // Mifflin-St Jeor BMR × 1.55 activity factor; cut = TDEE − 20%
  const bmr = sex === 'm'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;
  const tdee = Math.round(bmr * 1.55);
  const cut = Math.round(tdee * 0.8);
  $('tdee-lbl').textContent = tdee + ' kcal';
  $('cut-lbl').textContent = cut + ' kcal';
  $('bmi-res').style.display = 'block';

  state.goals.cal = cut;
  $('g-cal').value = cut;
  state.hasBMI = true;
  addXP(XP_REWARDS.bmi, '📊', '數據達人！', '了解自己的身體是第一步');
  bus.emit('state:changed');
}
