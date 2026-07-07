// Home dashboard: daily stats, calorie deficit, streak dots,
// weekly minutes chart, weight tracking.

import { XP_REWARDS } from '../config.js';
import { PHASES } from '../data/phases.js';
import { state } from '../core/state.js';
import { bus } from '../core/events.js';
import { $ } from '../utils/dom.js';
import { DAYS, todayIndex } from '../utils/time.js';
import { addXP } from './gamification.js';
import { toast } from './feedback.js';

export function renderStats() {
  const totalCal = state.foodLogs.reduce((a, b) => a + b.cal, 0);
  const totalBurn = state.exLogs.reduce((a, b) => a + b.burn, 0);
  const sleep = state.sleepLogs[0]?.hours || 0;
  const exCount = state.weekDone.filter(Boolean).length;

  $('s-cal').textContent = totalCal;
  $('s-burn').textContent = totalBurn;
  $('s-sleep').textContent = sleep || '-';
  $('s-ex').textContent = exCount;
  $('s-ex-g').textContent = state.goals.ex;
  $('s-cal-b').style.width = Math.min(100, Math.round(totalCal / state.goals.cal * 100)) + '%';
  $('s-burn-b').style.width = Math.min(100, Math.round(totalBurn / 600 * 100)) + '%';
  $('s-sleep-b').style.width = Math.min(100, Math.round(sleep / 9 * 100)) + '%';
  $('s-ex-b').style.width = Math.min(100, Math.round(exCount / Math.max(state.goals.ex, 1) * 100)) + '%';
}

export function updateDeficit() {
  const totalCal = state.foodLogs.reduce((a, b) => a + b.cal, 0);
  const totalBurn = state.exLogs.reduce((a, b) => a + b.burn, 0);
  $('h-gcal').textContent = state.goals.cal + ' kcal';
  $('h-pf').style.width = Math.min(100, Math.round(totalCal / state.goals.cal * 100)) + '%';
  $('h-pfv').textContent = totalCal + ' kcal';

  const deficit = state.goals.cal - totalCal + totalBurn;
  const el = $('h-def');
  if (totalCal === 0 && totalBurn === 0) {
    el.textContent = '—';
    el.style.color = 'var(--text2)';
  } else {
    el.textContent = (deficit >= 0 ? '−' : '+') + Math.abs(deficit) + ' kcal';
    el.style.color = deficit >= 400 ? 'var(--mint2)' : deficit >= 0 ? 'var(--peach)' : 'var(--pink)';
    if (totalCal > 0 && totalCal <= state.goals.cal) {
      state.counters.calorieDays = Math.min(state.counters.calorieDays + .33, 99);
    }
  }
}

export function renderWeekDots() {
  const phase = PHASES[state.currentPhase];
  const ti = todayIndex();
  $('wdots').innerHTML = DAYS.map((d, i) => {
    const isRest = !phase.plan[i];
    const isDone = state.weekDone[i];
    const isToday = i === ti;
    let cls = '', label;
    if (isDone) { cls = 'done'; label = '✓'; }
    else if (isRest) { cls = 'rest'; label = '💤'; }
    else { cls = isToday ? 'today' : ''; label = d; }
    return `<div class="wd"><div class="wd-c ${cls}">${label}</div><div class="wd-lb">${d}</div></div>`;
  }).join('');

  $('h-streak').textContent = state.streak;
  $('h-streak-sub').textContent =
    state.streak === 0 ? '完成今日任務開始累積！'
    : state.streak < 7 ? `已連續${state.streak}天，繼續！`
    : state.streak < 30 ? `太強了！連續${state.streak}天 🏆`
    : `傳奇！${state.streak}天 👑`;
}

export function renderWeekChart() {
  const max = Math.max(...state.weekMins, 1);
  $('week-chart').innerHTML = state.weekMins.map((v, i) =>
    `<div class="wb"><div class="wb-bar" style="height:${Math.round(v / max * 56)}px;background:${v > 0 ? 'var(--mint)' : 'rgba(140,170,220,0.18)'}"></div><div class="wb-day">${DAYS[i]}</div></div>`
  ).join('');
}

export function saveWeight() {
  const value = parseFloat($('wt-in').value);
  if (!value) { toast('請輸入體重'); return; }
  const d = new Date();
  state.weightHistory.push({ v: value, l: `${d.getMonth() + 1}/${d.getDate()}` });
  $('wt-in').value = '';
  addXP(XP_REWARDS.weight, '⚖️', '體重記錄', '每天追蹤才看得見進步');
  bus.emit('state:changed');
}

export function renderWeightHistory() {
  $('wt-hist').textContent = state.weightHistory.slice(-5).reverse().map(w => `${w.l}: ${w.v}kg`).join(' · ');
}
