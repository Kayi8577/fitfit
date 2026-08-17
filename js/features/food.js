// Manual food logging and food-list rendering.

import { XP_REWARDS } from '../config.js';
import { state } from '../core/state.js';
import { bus } from '../core/events.js';
import { $, esc, numVal } from '../utils/dom.js';
import { addXP, removeXP } from './gamification.js';
import { toast } from './feedback.js';

const TYPE_CHIP = { 早餐: 'cm', 午餐: 'cs', 晚餐: 'cl', 點心: 'co' };

export function addFood() {
  const name = $('food-name').value.trim();
  const cal = Math.round(numVal('food-cal', { min: 0, max: 10000 }));
  const pro = numVal('food-pro', { min: 0, max: 1000 });
  const type = $('food-type').value;
  if (!name || !cal) { toast('請填寫食物名稱和熱量'); return; }

  state.foodLogs.push({ name, cal, pro, type, icon: '✏️', xp: XP_REWARDS.manualFood });
  state.counters.meals++;
  $('food-name').value = '';
  $('food-cal').value = '';
  $('food-pro').value = '';
  addXP(XP_REWARDS.manualFood, '🥗', '飲食記錄！', '持續記錄幫你了解自己');
  bus.emit('state:changed');
}

// Deleting rolls back everything the entry granted (counters + XP),
// so log→delete→log can't be farmed for XP.
export function deleteFood(index) {
  const entry = state.foodLogs[index];
  if (!entry) return;
  state.foodLogs.splice(index, 1);
  state.counters.meals = Math.max(0, state.counters.meals - 1);
  if (entry.hasPhoto) state.counters.snaps = Math.max(0, state.counters.snaps - 1);
  removeXP(entry.xp || 0);
  toast('已刪除記錄');
  bus.emit('state:changed');
}

export function renderFoodLog() {
  const el = $('food-log-list');
  if (!state.foodLogs.length) {
    el.innerHTML = '<div class="empty">尚無記錄，拍張照片開始！</div>';
  } else {
    el.innerHTML = state.foodLogs.map((f, i) =>
      `<div class="pli"><div class="pli-icon">${f.icon || '🍽️'}</div><div style="flex:1;min-width:0"><div class="pli-name">${esc(f.name)}</div><div class="pli-det"><span class="chip ${TYPE_CHIP[f.type] || 'cm'}">${esc(f.type)}</span>${f.pro ? ' · 蛋白質' + f.pro + 'g' : ''}</div></div><div class="pli-cal">${f.cal}<span style="font-size:10px;color:var(--text2);font-weight:600"> kcal</span></div><button class="del-x" data-action="delFood" data-index="${i}" aria-label="刪除 ${esc(f.name)}">✕</button></div>`
    ).join('');
  }
  const totalCal = state.foodLogs.reduce((a, b) => a + b.cal, 0);
  const totalPro = state.foodLogs.reduce((a, b) => a + (b.pro || 0), 0);
  $('food-tot').textContent = totalCal + ' kcal';
  $('food-pro-tot').textContent = Math.round(totalPro * 10) / 10 + ' g';
}

export function renderHomeFoodList() {
  const el = $('home-food-list');
  if (!state.foodLogs.length) {
    el.innerHTML = '<div class="empty" style="padding:10px">還沒有記錄，點上方拍照！</div>';
    return;
  }
  el.innerHTML = state.foodLogs.slice(-3).reverse().map(f =>
    `<div class="pli" style="padding:8px 10px"><div class="pli-icon" style="width:36px;height:36px;font-size:18px">${f.icon || '🍽️'}</div><div style="flex:1;min-width:0"><div class="pli-name" style="font-size:12px">${esc(f.name)}</div><div class="pli-det">${esc(f.type)}</div></div><div class="pli-cal" style="font-size:13px">${f.cal}<span style="font-size:10px;color:var(--text2);font-weight:600"> kcal</span></div></div>`
  ).join('');
}
