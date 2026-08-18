// Home dashboard: daily stats, calorie deficit, streak dots,
// weekly minutes chart, 7-day intake history, weight tracking.

import { XP_REWARDS } from '../config.js';
import { PHASES } from '../data/phases.js';
import { state } from '../core/state.js';
import { bus } from '../core/events.js';
import { $, esc, numVal } from '../utils/dom.js';
import { dailyLast, movingAverage } from '../utils/health.js';
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

// ── Weight trend chart ──────────────────────────────────
// Raw daily weigh-ins (dots + faint line) with a 7-day trailing average
// (solid line) — the average is what actually shows fat-loss progress,
// since day-to-day weight is mostly water noise.

const CW = 320, CH = 132, PT = 14, PR = 36, PB = 18, PL = 8;

function deltaVs7Days(series) {
  const cur = series[series.length - 1];
  const cutoff = new Date(cur.date + 'T00:00');
  cutoff.setDate(cutoff.getDate() - 7);
  const cutKey = dateKey(cutoff);
  // Latest point at least 7 days old; fall back to the earliest record.
  const base = [...series].reverse().find(p => p.date <= cutKey) || series[0];
  return base === cur ? null : { diff: Math.round((cur.v - base.v) * 10) / 10, since: shortLabel(base.date) };
}

export function renderWeightChart() {
  const hero = $('wt-hero');
  const box = $('wt-chart');
  const series = dailyLast(state.weightHistory).slice(-30);

  if (!series.length) { hero.innerHTML = ''; box.innerHTML = ''; return; }

  const cur = series[series.length - 1];
  const delta = deltaVs7Days(series);
  const deltaHtml = delta
    ? `<span class="wt-hero-d" style="color:${delta.diff <= 0 ? 'var(--primary-deep)' : 'var(--cyan)'}">${delta.diff > 0 ? '+' : ''}${delta.diff} kg <span style="color:var(--text3)">自${delta.since}</span></span>`
    : '';
  hero.innerHTML = `<div class="wt-hero"><span class="wt-hero-v">${cur.v}</span><span class="wt-hero-u">kg</span>${deltaHtml}</div>`;

  if (series.length < 2) {
    box.innerHTML = '<div class="empty" style="padding:8px">再記錄幾天就能看到趨勢曲線</div>';
    return;
  }

  const values = series.map(p => p.v);
  const ma = movingAverage(values, 7);
  const lo = Math.min(...values, ...ma), hi = Math.max(...values, ...ma);
  const pad = Math.max(0.4, (hi - lo) * 0.12);
  const vmin = lo - pad, vmax = hi + pad;
  const x = i => PL + i * (CW - PL - PR) / (series.length - 1);
  const y = v => PT + (vmax - v) / (vmax - vmin) * (CH - PT - PB);
  const fmt = v => Math.round(v * 10) / 10;

  const gridLevels = [vmin + pad, (vmin + vmax) / 2, vmax - pad];
  const grid = gridLevels.map(v =>
    `<line x1="${PL}" x2="${CW - PR}" y1="${y(v)}" y2="${y(v)}" stroke="rgba(140,170,220,0.25)" stroke-width="1"/>` +
    `<text x="${CW - PR + 4}" y="${y(v) + 3}" font-size="9" font-weight="700" fill="var(--text3)">${fmt(v)}</text>`
  ).join('');

  const mid = Math.floor((series.length - 1) / 2);
  const xLabels = [0, mid, series.length - 1].filter((v, i, a) => a.indexOf(v) === i).map(i =>
    `<text x="${x(i)}" y="${CH - 5}" font-size="9" font-weight="700" fill="var(--text3)" text-anchor="middle">${shortLabel(series[i].date)}</text>`
  ).join('');

  const rawPts = series.map((p, i) => `${x(i)},${y(p.v)}`).join(' ');
  const dots = series.map((p, i) =>
    `<circle cx="${x(i)}" cy="${y(p.v)}" r="${i === series.length - 1 ? 3.5 : 2.6}" fill="var(--primary)"/>`
  ).join('');
  const maPts = ma.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const lastLabel = `<text x="${x(series.length - 1)}" y="${y(cur.v) - 8}" font-size="10" font-weight="800" fill="var(--text)" text-anchor="end">${cur.v}</text>`;

  box.innerHTML = `<div class="wt-chart-box">
    <svg viewBox="0 0 ${CW} ${CH}" role="img" aria-label="體重趨勢圖：目前${cur.v}公斤">
      ${grid}${xLabels}
      <polyline points="${rawPts}" fill="none" stroke="var(--primary)" stroke-width="1.5" opacity="0.45"/>
      <polyline points="${maPts}" fill="none" stroke="var(--navy)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      ${dots}${lastLabel}
    </svg>
    <div class="wt-tip" id="wt-tip"></div>
    <div class="wt-legend"><span><span class="wt-lg-dot"></span>每日體重</span><span><span class="wt-lg-line"></span>7日平均</span></div>
  </div>`;

  // Tap/hover a point → tooltip with date + exact value.
  const svg = box.querySelector('svg');
  const tip = $('wt-tip');
  svg.addEventListener('pointermove', e => {
    const rect = svg.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width * CW;
    const i = Math.max(0, Math.min(series.length - 1, Math.round((px - PL) / ((CW - PL - PR) / (series.length - 1)))));
    tip.style.display = 'block';
    tip.style.left = x(i) / CW * 100 + '%';
    tip.style.top = y(series[i].v) / CH * 100 + '%';
    tip.textContent = `${shortLabel(series[i].date)} · ${series[i].v}kg（7日均 ${fmt(ma[i])}）`;
  });
  svg.addEventListener('pointerleave', () => { tip.style.display = 'none'; });
}

export function renderWeightHistory() {
  const el = $('wt-hist');
  if (!state.weightHistory.length) { el.innerHTML = ''; return; }
  const start = Math.max(0, state.weightHistory.length - 8);
  el.innerHTML = state.weightHistory.slice(start).map((w, i) =>
    `<span class="wt-chip">${esc(w.l)}: ${w.v}kg<button class="del-x del-x-sm" data-action="delWeight" data-index="${start + i}" aria-label="刪除 ${esc(w.l)} 的體重記錄">✕</button></span>`
  ).reverse().join('');
}
