// Sleep logging.

import { XP_REWARDS } from '../config.js';
import { state } from '../core/state.js';
import { bus } from '../core/events.js';
import { $ } from '../utils/dom.js';
import { minutesBetween } from '../utils/time.js';
import { addXP } from './gamification.js';
import { toast } from './feedback.js';

const QUALITY_CHIP = { 很好: 'cm', 普通: 'cs', 較差: 'co' };

export function addSleep() {
  const start = $('sl-s').value, end = $('sl-e').value, quality = $('sl-q').value;
  if (!start || !end) { toast('請設定時間'); return; }
  const hours = Math.round(minutesBetween(start, end) / 60 * 10) / 10;
  state.sleepLogs.unshift({ start, end, hours, quality });
  state.counters.sleeps++;
  addXP(XP_REWARDS.sleepLog, '🌙', '睡眠記錄', '好睡眠是減脂的秘密武器');
  bus.emit('state:changed');
}

export function renderSleepList() {
  const el = $('sleep-list');
  if (!state.sleepLogs.length) {
    el.innerHTML = '<div class="empty">尚無記錄</div>';
    return;
  }
  el.innerHTML = state.sleepLogs.slice(0, 7).map(s =>
    `<div class="li"><div><div class="li-n">${s.hours} 小時</div><div class="li-d">${s.start} → ${s.end}</div></div><span class="chip ${QUALITY_CHIP[s.quality] || 'cs'}">${s.quality}</span></div>`
  ).join('');
}
