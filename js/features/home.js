// Home dashboard: daily stats, calorie deficit, streak dots,
// weekly minutes chart, 7-day intake history, weight tracking.

import { XP_REWARDS } from '../config.js';
import { PHASES } from '../data/phases.js';
import { state } from '../core/state.js';
import { bus } from '../core/events.js';
import { $, esc, numVal } from '../utils/dom.js';
import { DAYS, todayIndex, dateKey, shortLabel } from '../utils/time.js';
import { addXP, removeXP } from './gamification.js';
import { toast } from './feedback.js';

// Today's sleep only — an old entry must not show up as today's number.
function todaySleepHours() {
  return state.sleepLogs.find(s => s.date === dateKey())?.hours || 0;
}

export function renderStats() {
  const totalCal = state.foodLogs.reduce((a, b) => a + b.cal, 0);
  const totalBurn = state.exLogs.reduce((a, b) => a + b.burn, 0);
  const sleep = todaySleepHours();
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

// Pure display — day settlement (calorieDays) happens at rollover in storage.js.
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
    el.style.color = deficit >= 400 ? 'var(--primary-deep)' : deficit >= 0 ? 'var(--navy)' : 'var(--cyan)';
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
    `<div class="wb"><div class="wb-bar" style="height:${Math.round(v / max * 56)}px;background:${v > 0 ? 'var(--primary)' : 'rgba(140,170,220,0.18)'}"></div><div class="wb-day">${DAYS[i]}</div></div>`
  ).join('');
}

// Past-days intake trend: settled daily summaries + today's live total.
export function renderHistoryChart() {
  const todayCal = state.foodLogs.reduce((a, b) => a + b.cal, 0);
  const days = state.history.slice(-6).map(h => ({ label: shortLabel(h.date), cal: h.cal }));
  days.push({ label: '今天', cal: todayCal });
  const max = Math.max(...days.map(d => d.cal), state.goals.cal, 1);
  $('hist-chart').innerHTML = days.map(d =>
    `<div class="wb"><div class="wb-bar" style="height:${Math.round(d.cal / max * 56)}px;background:${d.cal > state.goals.cal ? 'var(--cyan)' : d.cal > 0 ? 'var(--lavender)' : 'rgba(140,170,220,0.18)'}"></div><div class="wb-day">${d.label}</div></div>`
  ).join('');
}

export function saveWeight() {
  const value = numVal('wt-in', { min: 20, max: 300 });
  if (!value) { toast('請輸入體重（20–300 kg）'); return; }
  const d = new Date();
  state.weightHistory.push({ v: value, l: `${d.getMonth() + 1}/${d.getDate()}`, date: dateKey(), xp: XP_REWARDS.weight });
  $('wt-in').value = '';
  addXP(XP_REWARDS.weight, '⚖️', '體重記錄', '每天追蹤才看得見進步');
  bus.emit('state:changed');
}

export function deleteWeight(index) {
  const entry = state.weightHistory[index];
  if (!entry) return;
  state.weightHistory.splice(index, 1);
  removeXP(entry.xp || 0);
  toast('已刪除記錄');
  bus.emit('state:changed');
}

export function renderWeightHistory() {
  const el = $('wt-hist');
  if (!state.weightHistory.length) { el.innerHTML = ''; return; }
  const start = Math.max(0, state.weightHistory.length - 8);
  el.innerHTML = state.weightHistory.slice(start).map((w, i) =>
    `<span class="wt-chip">${esc(w.l)}: ${w.v}kg<button class="del-x del-x-sm" data-action="delWeight" data-index="${start + i}" aria-label="刪除 ${esc(w.l)} 的體重記錄">✕</button></span>`
  ).reverse().join('');
}
