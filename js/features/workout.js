// Training plan: phases, weekly schedule, today's task, workout library,
// and manual exercise logging (MET-based burn estimate).

import { XP_REWARDS } from '../config.js';
import { PHASES } from '../data/phases.js';
import { state } from '../core/state.js';
import { bus } from '../core/events.js';
import { $, esc } from '../utils/dom.js';
import { DAYS, todayIndex } from '../utils/time.js';
import { addXP } from './gamification.js';
import { toast } from './feedback.js';

const LEVEL_CHIP = {
  easy: '<span class="chip cm">初階</span>',
  medium: '<span class="chip co">中階</span>',
  hard: '<span class="chip cp">進階</span>',
};

// ── Phases ──────────────────────────────────────────────

export function renderPhasePills() {
  $('phase-pills').innerHTML = PHASES.map((p, i) =>
    `<div class="pp ${i === state.currentPhase ? 'active' : ''}" data-action="setPhase" data-index="${i}">${p.name}<br><span style="font-size:10px;font-weight:600">${p.label}</span></div>`
  ).join('');
  const phase = PHASES[state.currentPhase];
  $('phase-desc').textContent = phase.desc;
  $('wk-g-lbl').textContent = `每週${phase.exPerWeek}次 · ${phase.weeks}`;
}

export function setPhase(index) {
  state.currentPhase = index;
  state.goals.ex = PHASES[index].exPerWeek;
  $('g-ex').value = state.goals.ex;
  toast(`切換到${PHASES[index].name}：${PHASES[index].label}`);
  bus.emit('state:changed');
}

// ── Weekly schedule & today's task ──────────────────────

export function renderWeekPlan() {
  const phase = PHASES[state.currentPhase];
  const ti = todayIndex();
  $('wk-plan').innerHTML = DAYS.map((d, i) => {
    const workout = phase.plan[i];
    const isDone = state.weekDone[i];
    const isToday = i === ti;
    const isRest = !workout;
    let emoji, cls = '';
    if (isDone) { emoji = '✅'; cls = 'done'; }
    else if (isRest) { emoji = '💜'; cls = 'rest'; }
    else if (isToday) { emoji = '🏃'; cls = 'today'; }
    else emoji = '⬜';
    return `<div class="dc"><div class="dc-lb">${d}</div><div class="dc-c ${cls}">${emoji}</div><div class="dc-s">${isRest ? '休' : workout.duration}</div></div>`;
  }).join('');
}

export function renderTodayWorkout() {
  const phase = PHASES[state.currentPhase];
  const idx = todayIndex();
  const workout = phase.plan[idx];
  const label = $('today-wk-lbl');
  const detail = $('today-wk-detail');

  if (!workout) {
    label.textContent = '今日：休息日 💜';
    detail.innerHTML = '<div class="wkc rest-day"><div class="wkc-top"><div><div class="wkc-name">今天好好休息</div><div class="wkc-meta"><span class="chip cl">休息日</span></div></div></div><div class="wkc-tip">肌肉在休息時成長。今天適合做輕鬆伸展。</div></div>';
    return;
  }

  label.textContent = '今日任務 🚀';
  const isDone = state.weekDone[idx];
  detail.innerHTML = `<div class="wkc ${workout.level}">
    <div class="wkc-top"><div><div class="wkc-name">${workout.name}</div><div class="wkc-meta">${LEVEL_CHIP[workout.level]}<span class="chip cs">${workout.duration}</span><span class="chip cm">~${workout.burn} kcal</span></div></div>
    <button class="done-btn ${isDone ? 'done' : ''}" data-action="toggleDone" data-index="${idx}">${isDone ? '✓ 完成' : '打卡'}</button></div>
    <div class="wkc-tip">💡 ${workout.tips}</div>
    <div>${workout.steps.map((s, i) => `<div class="wkc-step"><span class="wkc-sn">${i + 1}</span><span>${s}</span></div>`).join('')}</div>
  </div>`;
}

export function toggleDone(index) {
  state.weekDone[index] = !state.weekDone[index];
  const workout = PHASES[state.currentPhase].plan[index];

  if (state.weekDone[index] && workout) {
    const mins = parseInt(workout.duration) || 20;
    state.exLogs.push({ name: workout.name, min: mins, burn: workout.burn });
    state.weekMins[index] = (state.weekMins[index] || 0) + mins;
    state.counters.workouts++;
    if (index === todayIndex()) state.streak++;
    addXP(XP_REWARDS.workoutDone, '🔥', '任務完成！', workout.name);
  } else if (!state.weekDone[index]) {
    toast('已取消打卡');
  }
  bus.emit('state:changed');
}

// ── Workout library ─────────────────────────────────────

export function renderLibrary() {
  const all = [];
  PHASES.forEach(phase => phase.plan.forEach((w, i) => {
    if (w && w.level === state.viewLevel) all.push({ ...w, day: DAYS[i] });
  }));
  $('all-wks').innerHTML = all.length ? all.map(w =>
    `<div class="wkc ${w.level}"><div class="wkc-top"><div><div class="wkc-name">${w.name} <span style="font-size:10px;color:var(--text2)">(星期${w.day})</span></div><div class="wkc-meta">${LEVEL_CHIP[w.level]}<span class="chip cs">${w.duration}</span><span class="chip cm">~${w.burn}kcal</span></div></div></div><div class="wkc-tip">💡 ${w.tips}</div><div>${w.steps.map((s, i) => `<div class="wkc-step"><span class="wkc-sn">${i + 1}</span><span>${s}</span></div>`).join('')}</div></div>`
  ).join('') : '<div class="empty">此階段無資料</div>';
}

export function setViewLevel(level, tabEl) {
  state.viewLevel = level;
  document.querySelectorAll('.lt').forEach(t => t.classList.remove('active'));
  tabEl.classList.add('active');
  renderLibrary();
}

// ── Manual exercise log ─────────────────────────────────

export function initExerciseForm() {
  $('ex-type').addEventListener('change', updateBurnPreview);
  $('ex-min').addEventListener('input', updateBurnPreview);
  $('ex-w').addEventListener('input', updateBurnPreview);
}

// Estimated burn = MET × weight(kg) × hours.
export function updateBurnPreview() {
  const [name, metRaw] = $('ex-type').value.split(',');
  const met = parseFloat(metRaw) || 5;
  const mins = parseFloat($('ex-min').value) || 0;
  const weight = parseFloat($('ex-w').value) || 65;
  const burn = Math.round(met * weight * mins / 60);
  $('ex-prev').textContent = burn ? burn + ' kcal' : '—';
  return { name, burn };
}

export function addExercise() {
  const mins = parseInt($('ex-min').value) || 0;
  if (!mins) { toast('請填寫時長'); return; }
  const { name, burn } = updateBurnPreview();
  state.exLogs.push({ name, min: mins, burn });
  state.counters.workouts++;
  state.weekMins[todayIndex()] = (state.weekMins[todayIndex()] || 0) + mins;
  addXP(XP_REWARDS.exerciseLog, '💪', '運動記錄！', '繼續累積你的記錄');
  bus.emit('state:changed');
}

export function renderExerciseList() {
  const el = $('ex-list');
  if (!state.exLogs.length) {
    el.innerHTML = '<div class="empty">今日尚無記錄</div>';
    return;
  }
  el.innerHTML = state.exLogs.map(e =>
    `<div class="li"><div><div class="li-n">${esc(e.name)}</div><div class="li-d">${e.min} 分鐘</div></div><div><div class="li-v" style="color:var(--sky)">${e.burn}</div><div class="li-u">kcal</div></div></div>`
  ).join('');
}
