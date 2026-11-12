// Sleep logging (dated — "today's sleep" elsewhere means an entry dated today).

import { XP_REWARDS } from '../config.js';
import { state } from '../core/state.js';
import { bus } from '../core/events.js';
import { $ } from '../utils/dom.js';
import { minutesBetween, dateKey, shortLabel } from '../utils/time.js';
import { addXP, removeXP } from './gamification.js';
import { toast } from './feedback.js';

const QUALITY_CHIP = { 很好: 'cm', 普通: 'cs', 較差: 'co' };

export function addSleep() {
  const start = $('sl-s').value, end = $('sl-e').value, quality = $('sl-q').value;
  if (!start || !end) { toast('請設定時間'); return; }
  const hours = Math.round(minutesBetween(start, end) / 60 * 10) / 10;
  state.sleepLogs.unshift({ start, end, hours, quality, date: dateKey(), xp: XP_REWARDS.sleepLog });
  state.counters.sleeps++;
  addXP(XP_REWARDS.sleepLog, '🌙', '睡眠記錄', '好睡眠是減脂的秘密武器');
  bus.emit('state:changed');
}

export function deleteSleep(index) {
  const entry = state.sleepLogs[index];
  if (!entry) return;
  state.sleepLogs.splice(index, 1);
  state.counters.sleeps = Math.max(0, state.counters.sleeps - 1);
  removeXP(entry.xp || 0);
  toast('已刪除記錄');
  bus.emit('state:changed');
}

export function renderSleepList() {
  const el = $('sleep-list');
  if (!state.sleepLogs.length) {
    el.innerHTML = '<div class="empty">尚無記錄</div>';
    return;
  }
  el.innerHTML = state.sleepLogs.slice(0, 7).map((s, i) =>
    `<div class="li"><div><div class="li-n">${s.hours} 小時${s.date ? ` <span style="font-size:10px;color:var(--text3)">${shortLabel(s.date)}</span>` : ''}</div><div class="li-d">${s.start} → ${s.end}</div></div><div style="display:flex;align-items:center;gap:8px"><span class="chip ${QUALITY_CHIP[s.quality] || 'cs'}">${s.quality}</span><button class="del-x" data-action="delSleep" data-index="${i}" aria-label="刪除睡眠記錄">✕</button></div></div>`
  ).join('');
}
