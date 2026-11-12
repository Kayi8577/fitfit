// Daily reminders. While the app is open, due reminders fire a Web
// Notification (if permitted) plus an in-app toast. Because this is a pure
// frontend app with no push server, nothing can fire while the page is
// closed — the UI says so honestly.

import { state } from '../core/state.js';
import { bus } from '../core/events.js';
import { $, esc } from '../utils/dom.js';
import { dateKey } from '../utils/time.js';
import { toast } from './feedback.js';

export function initReminders() {
  checkDueReminders();
  setInterval(checkDueReminders, 30000);
}

function currentHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function checkDueReminders() {
  const now = currentHHMM();
  const today = dateKey();
  let fired = false;
  state.reminders.forEach(r => {
    if (!r.on || r.time !== now || r.lastFired === today) return;
    r.lastFired = today;
    fired = true;
    toast(`⏰ ${r.msg}`);
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try { new Notification('FitFit 提醒', { body: r.msg, icon: 'assets/icons/app-icon.png' }); } catch { /* ignore */ }
    }
  });
  if (fired) bus.emit('state:changed');
}

function requestPermission() {
  if (typeof Notification === 'undefined') {
    toast('此瀏覽器不支援通知，提醒只會在 App 開啟時顯示');
    return;
  }
  if (Notification.permission === 'default') {
    Notification.requestPermission().then(p => {
      if (p !== 'granted') toast('未授權通知 — 提醒只會在 App 開啟時顯示');
    });
  }
}

export function addReminder() {
  const time = $('r-time').value;
  const msg = $('r-msg').value.trim();
  if (!time || !msg) { toast('請填寫時間和內容'); return; }
  state.reminders.push({ time, msg, on: true, lastFired: '' });
  $('r-msg').value = '';
  requestPermission();
  toast('✓ 提醒已新增');
  bus.emit('state:changed');
}

export function deleteReminder(index) {
  if (!state.reminders[index]) return;
  state.reminders.splice(index, 1);
  toast('已刪除提醒');
  bus.emit('state:changed');
}

export function renderReminders() {
  $('remind-list').innerHTML = state.reminders.map((r, i) =>
    `<div class="ri"><div><div style="font-size:13px;font-weight:700">${r.time}</div><div style="font-size:12px;color:var(--text2);font-weight:600">${esc(r.msg)}</div></div><div style="display:flex;align-items:center;gap:8px"><button class="tgl ${r.on ? 'on' : ''}" data-action="toggleReminder" data-index="${i}" role="switch" aria-checked="${r.on}" aria-label="開關提醒 ${r.time}"></button><button class="del-x" data-action="delReminder" data-index="${i}" aria-label="刪除提醒 ${r.time}">✕</button></div></div>`
  ).join('');
}

export function toggleReminder(index) {
  const r = state.reminders[index];
  if (!r) return;
  r.on = !r.on;
  if (r.on) requestPermission();
  bus.emit('state:changed');
}
