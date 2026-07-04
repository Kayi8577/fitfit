// Photo-based calorie logging: camera modal, AI analysis, result panel.

import { XP_REWARDS } from '../config.js';
import { state } from '../core/state.js';
import { bus } from '../core/events.js';
import { $, esc } from '../utils/dom.js';
import { analyzeFoodPhoto } from '../services/ai.js';
import { buildBackground } from './background.js';
import { addXP } from './gamification.js';
import { toast, confetti } from './feedback.js';

const DEFAULT_ACTIONS =
  '<button class="cam-btn cam-btn-sec" data-action="closeCam">✕ 關閉</button>' +
  '<button class="cam-btn cam-btn-main" data-action="triggerUpload">📷 選擇照片</button>';

export function initCamera() {
  $('file-in').addEventListener('change', handlePhoto);
}

export function openCamera() {
  $('cam-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
  buildBackground($('cam-bg-el'));
}

export function closeCamera() {
  $('cam-modal').classList.remove('open');
  document.body.style.overflow = '';
  $('cam-preview').classList.remove('show');
  $('cam-ph').style.display = '';
  $('ai-res-wrap').innerHTML = '';
  $('cam-actions').innerHTML = DEFAULT_ACTIONS;
  $('file-in').value = '';
}

export function triggerUpload() {
  $('file-in').click();
}

async function handlePhoto(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async ev => {
    const preview = $('cam-preview');
    preview.src = ev.target.result;
    preview.classList.add('show');
    $('cam-ph').style.display = 'none';
    $('cam-actions').innerHTML =
      '<button class="cam-btn cam-btn-sec" data-action="closeCam">✕ 取消</button>' +
      '<div class="cam-btn cam-btn-main" style="display:flex;align-items:center;justify-content:center;gap:8px"><span>🔍</span> AI 分析中...</div>';
    try {
      const result = await analyzeFoodPhoto(ev.target.result);
      showAnalysisResult(result);
    } catch {
      showManualFallback();
    }
  };
  reader.readAsDataURL(file);
}

function showAnalysisResult(r) {
  const score = r.healthScore || 5;
  const scoreColor = score >= 7 ? 'var(--mint2)' : score >= 5 ? 'var(--peach)' : 'var(--pink)';
  const items = (r.foods || []).map(f =>
    `<div class="ai-item"><div class="ai-item-n">${esc(f.name)} <span style="font-size:10px;color:var(--text3)">${esc(f.portion || '')}</span></div><div class="ai-item-c">${f.calories} kcal</div></div>`
  ).join('');

  $('ai-res-wrap').innerHTML = `<div class="ai-result">
    <div class="ai-res-title">✓ AI 識別完成</div>
    <div class="ai-macros">
      <div class="ai-macro"><div class="ai-macro-val" style="color:var(--peach)">${r.totalCalories || 0}</div><div class="ai-macro-lbl">熱量</div></div>
      <div class="ai-macro"><div class="ai-macro-val" style="color:var(--sky)">${r.totalProtein || 0}g</div><div class="ai-macro-lbl">蛋白質</div></div>
      <div class="ai-macro"><div class="ai-macro-val" style="color:var(--mint2)">${r.totalCarbs || 0}g</div><div class="ai-macro-lbl">碳水</div></div>
      <div class="ai-macro"><div class="ai-macro-val" style="color:var(--pink)">${r.totalFat || 0}g</div><div class="ai-macro-lbl">脂肪</div></div>
    </div>
    <div class="ai-items-list">${items}</div>
    <div class="ai-nutrition">健康評分：<span style="color:${scoreColor};font-weight:900">${score}/10</span> ${'★'.repeat(score)}${'☆'.repeat(10 - score)}<br>💡 ${esc(r.tip || '')}</div>
    <div class="ai-edit-row"><input class="ai-edit-in" id="ai-fname" value="${esc((r.foods || []).map(f => f.name).join('、'))}" placeholder="食物名稱"><input class="ai-edit-in" id="ai-fcal" value="${r.totalCalories || 0}" type="number" style="width:90px"></div>
    <button class="ai-add-btn" data-action="addAiFood" data-meal="${esc(r.mealType || '午餐')}" data-pro="${r.totalProtein || 0}">✓ 加入飲食記錄 +${XP_REWARDS.photoFood} XP</button>
  </div>`;
  $('cam-actions').innerHTML =
    '<button class="cam-btn cam-btn-sec" data-action="triggerUpload">重新拍</button>' +
    '<button class="cam-btn cam-btn-main" data-action="closeCam">完成 ✓</button>';
}

function showManualFallback() {
  $('ai-res-wrap').innerHTML = `<div class="ai-result">
    <div class="ai-res-title">無法識別</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:10px;font-weight:700">請確認照片清晰，或手動輸入</div>
    <div class="ai-edit-row"><input class="ai-edit-in" id="m-name" placeholder="食物名稱"><input class="ai-edit-in" id="m-cal" placeholder="卡路里" type="number" style="width:90px"></div>
    <button class="ai-add-btn" data-action="addManualCam">手動新增</button>
  </div>`;
  $('cam-actions').innerHTML =
    '<button class="cam-btn cam-btn-sec" data-action="closeCam">✕ 關閉</button>' +
    '<button class="cam-btn cam-btn-main" data-action="triggerUpload">重新拍照</button>';
}

export function addFoodFromAI(mealType, protein) {
  const name = $('ai-fname')?.value || 'AI識別食物';
  const cal = parseInt($('ai-fcal')?.value) || 0;
  if (!cal) { toast('請確認熱量'); return; }
  state.foodLogs.push({ name, cal, pro: protein, type: mealType, icon: '📸', hasPhoto: true });
  state.counters.meals++;
  state.counters.snaps++;
  addXP(XP_REWARDS.photoFood, '📸', '拍照識別！', name + ' 已記錄');
  confetti();
  bus.emit('state:changed');
  setTimeout(closeCamera, 700);
}

export function addManualFromCamera() {
  const name = ($('m-name')?.value || '').trim() || '食物';
  const cal = parseInt($('m-cal')?.value) || 0;
  if (!cal) { toast('請填寫熱量'); return; }
  state.foodLogs.push({ name, cal, pro: 0, type: '午餐', icon: '✏️' });
  state.counters.meals++;
  addXP(XP_REWARDS.manualFoodFromCamera, '✏️', '手動記錄', '繼續保持記錄習慣');
  bus.emit('state:changed');
  setTimeout(closeCamera, 600);
}
