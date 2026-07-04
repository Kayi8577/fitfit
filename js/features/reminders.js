// Daily reminder list with on/off toggles.

import { state } from '../core/state.js';
import { bus } from '../core/events.js';
import { $, esc } from '../utils/dom.js';
import { toast } from './feedback.js';

export function addReminder() {
  const time = $('r-time').value;
  const msg = $('r-msg').value.trim();
  if (!time || !msg) { toast('請填寫時間和內容'); return; }
  state.reminders.push({ time, msg, on: true });
  $('r-msg').value = '';
  toast('✓ 提醒已新增');
  bus.emit('state:changed');
}

export function renderReminders() {
  $('remind-list').innerHTML = state.reminders.map((r, i) =>
    `<div class="ri"><div><div style="font-size:13px;font-weight:700">${r.time}</div><div style="font-size:12px;color:var(--text2);font-weight:600">${esc(r.msg)}</div></div><div class="tgl ${r.on ? 'on' : ''}" data-action="toggleReminder" data-index="${i}"></div></div>`
  ).join('');
}

export function toggleReminder(index) {
  state.reminders[index].on = !state.reminders[index].on;
  bus.emit('state:changed');
}
