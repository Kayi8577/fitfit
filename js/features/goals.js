// Goal settings and weekly goal progress.

import { state } from '../core/state.js';
import { bus } from '../core/events.js';
import { $ } from '../utils/dom.js';
import { toast } from './feedback.js';

export function saveGoals() {
  state.goals.ex = parseInt($('g-ex').value) || 3;
  state.goals.cal = parseInt($('g-cal').value) || 1800;
  state.goals.sleep = parseFloat($('g-sleep').value) || 7.5;
  toast('✓ 目標已儲存');
  bus.emit('state:changed');
}

export function renderGoalProgress() {
  const exCount = state.weekDone.filter(Boolean).length;
  const totalCal = state.foodLogs.reduce((a, b) => a + b.cal, 0);
  const sleep = state.sleepLogs[0]?.hours || 0;
  const rows = [
    { l: '本週運動', d: exCount, t: state.goals.ex, u: '次', c: 'var(--mint)' },
    { l: '飲食達標', d: (totalCal > 0 && totalCal <= state.goals.cal) ? 1 : 0, t: 1, u: '天', c: 'var(--peach)' },
    { l: '睡眠充足', d: sleep >= state.goals.sleep ? 1 : 0, t: 1, u: '天', c: 'var(--lavender)' },
  ];
  $('goal-prog').innerHTML = rows.map(r =>
    `<div class="gr"><div style="font-size:13px;font-weight:700">${r.l}</div><div style="text-align:right"><div style="font-size:12px;color:var(--text2);font-weight:700">${r.d}/${r.t} ${r.u}</div><div class="gr-gbar"><div class="gr-gbf" style="width:${Math.min(100, Math.round(r.d / r.t * 100))}%;background:${r.c}"></div></div></div></div>`
  ).join('');
}
