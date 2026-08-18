// Manual food logging, quick re-logging of frequent foods,
// autocomplete from the built-in food DB, and food-list / album rendering.

import { XP_REWARDS } from '../config.js';
import { FOODS, findFood, topFrequentFoods, pruneFoodFreq } from '../data/foods.js';
import { state } from '../core/state.js';
import { bus } from '../core/events.js';
import { $, esc, numVal } from '../utils/dom.js';
import { dateKey } from '../utils/time.js';
import { addXP, removeXP } from './gamification.js';
import { toast } from './feedback.js';

const TYPE_CHIP = { 早餐: 'cm', 午餐: 'cs', 晚餐: 'cl', 點心: 'co' };
const ALBUM_CAP = 60; // ~5KB per thumb → keeps the album well inside localStorage quota

// ── Frequency tracking (powers the quick-log chips) ─────

// Every logged food updates the frequency map so "常吃的" reflects
// real habits. Called from manual logging AND the camera flow.
export function recordFoodUse(name, { cal, pro = 0, type = '午餐', icon = '🍽️' }) {
  const entry = state.foodFreq[name] || { count: 0 };
  state.foodFreq[name] = { count: entry.count + 1, lastUsed: dateKey(), cal, pro, type, icon };
  state.foodFreq = pruneFoodFreq(state.foodFreq);
}

// One-tap re-log from a frequent-food chip.
export function quickAddFood(name) {
  const f = state.foodFreq[name];
  if (!f) return;
  state.foodLogs.push({ name, cal: f.cal, pro: f.pro || 0, type: f.type || '午餐', icon: f.icon || '🍽️', xp: XP_REWARDS.manualFood });
  state.counters.meals++;
  recordFoodUse(name, f);
  addXP(XP_REWARDS.manualFood, f.icon || '🥗', '快速記錄！', `${name} 已記錄`);
  bus.emit('state:changed');
}

export function renderFrequentFoods() {
  const wrap = $('freq-foods');
  const top = topFrequentFoods(state.foodFreq, 8);
  if (!top.length) {
    wrap.innerHTML = '<div class="empty" style="padding:10px">記錄過的食物會出現在這裡，一鍵重複記錄</div>';
    return;
  }
  wrap.innerHTML = top.map(f =>
    `<button class="freq-chip" data-action="quickFood" data-name="${esc(f.name)}">${f.icon || '🍽️'} ${esc(f.name)} <span class="freq-cal">${f.cal}</span></button>`
  ).join('');
}

// ── Autocomplete from the built-in DB ───────────────────

export function initFoodForm() {
  $('food-dl').innerHTML = FOODS.map(f =>
    `<option value="${esc(f.name)}" label="${f.cal} kcal"></option>`
  ).join('');
  // Exact match (typically a datalist pick) autofills the numbers —
  // the user can still adjust them before adding.
  $('food-name').addEventListener('input', e => {
    const hit = findFood(e.target.value);
    if (!hit) return;
    $('food-cal').value = hit.cal;
    $('food-pro').value = hit.pro || '';
    $('food-type').value = hit.type;
  });
}

// ── Logging ─────────────────────────────────────────────

export function addFood() {
  const name = $('food-name').value.trim();
  const cal = Math.round(numVal('food-cal', { min: 0, max: 10000 }));
  const pro = numVal('food-pro', { min: 0, max: 1000 });
  const type = $('food-type').value;
  if (!name || !cal) { toast('請填寫食物名稱和熱量'); return; }

  const icon = findFood(name)?.icon || '✏️';
  state.foodLogs.push({ name, cal, pro, type, icon, xp: XP_REWARDS.manualFood });
  state.counters.meals++;
  recordFoodUse(name, { cal, pro, type, icon });
  $('food-name').value = '';
  $('food-cal').value = '';
  $('food-pro').value = '';
  addXP(XP_REWARDS.manualFood, '🥗', '飲食記錄！', '持續記錄幫你了解自己');
  bus.emit('state:changed');
}

// Deleting rolls back everything the entry granted (counters + XP),
// so log→delete→log can't be farmed for XP. A same-day photo entry
// also takes its album copy with it.
export function deleteFood(index) {
  const entry = state.foodLogs[index];
  if (!entry) return;
  state.foodLogs.splice(index, 1);
  state.counters.meals = Math.max(0, state.counters.meals - 1);
  if (entry.hasPhoto) state.counters.snaps = Math.max(0, state.counters.snaps - 1);
  if (entry.albumId) state.photoAlbum = state.photoAlbum.filter(a => a.id !== entry.albumId);
  removeXP(entry.xp || 0);
  toast('已刪除記錄');
  bus.emit('state:changed');
}

// ── Photo album (persists across days; foodLogs reset daily) ──

export function addAlbumEntry({ thumb, name, cal }) {
  const id = Date.now().toString(36);
  state.photoAlbum.push({ id, date: dateKey(), thumb, name, cal });
  state.photoAlbum = state.photoAlbum.slice(-ALBUM_CAP);
  return id;
}

export function deleteAlbumEntry(id) {
  state.photoAlbum = state.photoAlbum.filter(a => a.id !== id);
  toast('已從相簿移除');
  bus.emit('state:changed');
}

export function renderPhotoAlbum() {
  const el = $('photo-album');
  if (!state.photoAlbum.length) {
    el.innerHTML = '<div class="empty" style="padding:10px">拍照記錄的餐點會留在這裡</div>';
    return;
  }
  el.innerHTML = state.photoAlbum.slice().reverse().map(a =>
    `<div class="alb-item"><img src="${a.thumb}" alt="${esc(a.name)}" loading="lazy"><button class="del-x alb-del" data-action="delAlbum" data-id="${a.id}" aria-label="從相簿刪除 ${esc(a.name)}">✕</button><div class="alb-cap"><span class="alb-name">${esc(a.name)}</span><span class="alb-meta">${esc(a.date.slice(5).replace('-', '/'))} · ${a.cal} kcal</span></div></div>`
  ).join('');
}

// ── Rendering ───────────────────────────────────────────

function foodIcon(f, size) {
  return f.thumb
    ? `<img class="pli-icon pli-thumb" style="width:${size}px;height:${size}px" src="${f.thumb}" alt="">`
    : `<div class="pli-icon" style="width:${size}px;height:${size}px${size < 40 ? ';font-size:18px' : ''}">${f.icon || '🍽️'}</div>`;
}

export function renderFoodLog() {
  const el = $('food-log-list');
  if (!state.foodLogs.length) {
    el.innerHTML = '<div class="empty">尚無記錄，拍張照片開始！</div>';
  } else {
    el.innerHTML = state.foodLogs.map((f, i) =>
      `<div class="pli">${foodIcon(f, 44)}<div style="flex:1;min-width:0"><div class="pli-name">${esc(f.name)}</div><div class="pli-det"><span class="chip ${TYPE_CHIP[f.type] || 'cm'}">${esc(f.type)}</span>${f.pro ? ' · 蛋白質' + f.pro + 'g' : ''}</div></div><div class="pli-cal">${f.cal}<span style="font-size:10px;color:var(--text2);font-weight:600"> kcal</span></div><button class="del-x" data-action="delFood" data-index="${i}" aria-label="刪除 ${esc(f.name)}">✕</button></div>`
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
    `<div class="pli" style="padding:8px 10px">${foodIcon(f, 36)}<div style="flex:1;min-width:0"><div class="pli-name" style="font-size:12px">${esc(f.name)}</div><div class="pli-det">${esc(f.type)}</div></div><div class="pli-cal" style="font-size:13px">${f.cal}<span style="font-size:10px;color:var(--text2);font-weight:600"> kcal</span></div></div>`
  ).join('');
}
