// Manual food logging and food-list rendering.

import { XP_REWARDS } from '../config.js';
import { state } from '../core/state.js';
import { bus } from '../core/events.js';
import { $, esc } from '../utils/dom.js';
import { addXP } from './gamification.js';
import { toast } from './feedback.js';

const TYPE_CHIP = { 早餐: 'cm', 午餐: 'cs', 晚餐: 'cl', 點心: 'co' };

export function addFood() {
  const name = $('food-name').value.trim();
  const cal = parseInt($('food-cal').value) || 0;
  const pro = parseFloat($('food-pro').value) || 0;
  const type = $('food-type').value;
  if (!name || !cal) { toast('請填寫食物名稱和熱量'); return; }

  state.foodLogs.push({ name, cal, pro, type, icon: '✏️' });
  state.counters.meals++;
  $('food-name').value = '';
  $('food-cal').value = '';
  $('food-pro').value = '';
  addXP(XP_REWARDS.manualFood, '🥗', '飲食記錄！', '持續記錄幫你了解自己');
  bus.emit('state:changed');
}

export function renderFoodLog() {
  const el = $('food-log-list');
  if (!state.foodLogs.length) {
    el.innerHTML = '<div class="empty">尚無記錄，拍張照片開始！</div>';
  } else {
    el.innerHTML = state.foodLogs.map(f =>
      `<div class="pli"><div class="pli-icon">${f.icon || '🍽️'}</div><div style="flex:1;min-width:0"><div class="pli-name">${esc(f.name)}</div><div class="pli-det"><span class="chip ${TYPE_CHIP[f.type] || 'cm'}">${esc(f.type)}</span>${f.pro ? ' · 蛋白質' + f.pro + 'g' : ''}</div></div><div class="pli-cal">${f.cal}<span style="font-size:10px;color:var(--text2);font-weight:600"> kcal</span></div></div>`
    ).join('');
  }
  const totalCal = state.foodLogs.reduce((a, b) => a + b.cal, 0);
  const totalPro = state.foodLogs.reduce((a, b) => a + (b.pro || 0), 0);
  $('food-tot').textContent = totalCal + ' kcal';
  $('food-pro-tot').textContent = totalPro + ' g';
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
