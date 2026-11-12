// Photo-based calorie logging: camera modal, AI analysis, result panel.

import { XP_REWARDS } from '../config.js';
import { state } from '../core/state.js';
import { bus } from '../core/events.js';
import { $, esc, numVal } from '../utils/dom.js';
import { compressImage, thumbnailFromDataUrl } from '../utils/image.js';
import { analyzeFoodPhoto, hasApiKey } from '../services/ai.js';
import { buildBackground } from './background.js';
import { recordFoodUse, addAlbumEntry } from './food.js';
import { addXP } from './gamification.js';
import { toast, confetti } from './feedback.js';

const DEFAULT_ACTIONS =
  '<button class="cam-btn cam-btn-sec" data-action="closeCam">✕ 關閉</button>' +
  '<button class="cam-btn cam-btn-main" data-action="triggerUpload">📷 選擇照片</button>';

// The compressed photo currently shown in the modal — the source for the
// album thumbnail when the food actually gets logged.
let currentPhoto = null;

export function initCamera() {
  $('file-in').addEventListener('change', handlePhoto);
}

export function openCamera() {
  $('cam-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
  buildBackground($('cam-bg-el'));
}

export function closeCamera() {
  currentPhoto = null;
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

  let dataUrl;
  try {
    // Downscale before upload: full-size camera photos are slow, expensive,
    // and can exceed the API's image limits (HEIC gets rejected outright).
    dataUrl = await compressImage(file);
  } catch (err) {
    toast(err.message);
    return;
  }

  currentPhoto = dataUrl;
  const preview = $('cam-preview');
  preview.src = dataUrl;
  preview.classList.add('show');
  $('cam-ph').style.display = 'none';

  if (!hasApiKey()) {
    showManualFallback('尚未設定 API Key（更多 → AI 設定），先手動輸入吧');
    return;
  }

  $('cam-actions').innerHTML =
    '<button class="cam-btn cam-btn-sec" data-action="closeCam">✕ 取消</button>' +
    '<div class="cam-btn cam-btn-main" style="display:flex;align-items:center;justify-content:center;gap:8px"><span>🔍</span> AI 分析中...</div>';
  try {
    const result = await analyzeFoodPhoto(dataUrl);
    if (result) showAnalysisResult(result);
    else showManualFallback('AI 回應無法解析，請手動輸入');
  } catch {
    showManualFallback('連線失敗，請稍後再試或手動輸入');
  }
}

function showAnalysisResult(r) {
  const score = r.healthScore;
  const scoreColor = score >= 7 ? 'var(--primary-deep)' : score >= 5 ? 'var(--navy)' : 'var(--cyan)';
  const items = r.foods.map(f =>
    `<div class="ai-item"><div class="ai-item-n">${esc(f.name)} <span style="font-size:10px;color:var(--text3)">${esc(f.portion)}</span></div><div class="ai-item-c">${f.calories} kcal</div></div>`
  ).join('');

  $('ai-res-wrap').innerHTML = `<div class="ai-result">
    <div class="ai-res-title">✓ AI 識別完成</div>
    <div class="ai-macros">
      <div class="ai-macro"><div class="ai-macro-val" style="color:var(--navy)">${r.totalCalories}</div><div class="ai-macro-lbl">熱量</div></div>
      <div class="ai-macro"><div class="ai-macro-val" style="color:var(--sky)">${r.totalProtein}g</div><div class="ai-macro-lbl">蛋白質</div></div>
      <div class="ai-macro"><div class="ai-macro-val" style="color:var(--primary-deep)">${r.totalCarbs}g</div><div class="ai-macro-lbl">碳水</div></div>
      <div class="ai-macro"><div class="ai-macro-val" style="color:var(--cyan)">${r.totalFat}g</div><div class="ai-macro-lbl">脂肪</div></div>
    </div>
    <div class="ai-items-list">${items}</div>
    <div class="ai-nutrition">健康評分：<span style="color:${scoreColor};font-weight:900">${score}/10</span> ${'★'.repeat(score)}${'☆'.repeat(10 - score)}<br>💡 ${esc(r.tip)}</div>
    <div class="ai-edit-row"><input class="ai-edit-in" id="ai-fname" value="${esc(r.foods.map(f => f.name).join('、'))}" placeholder="食物名稱"><input class="ai-edit-in" id="ai-fcal" value="${r.totalCalories}" type="number" style="width:90px"></div>
    <button class="ai-add-btn" data-action="addAiFood" data-meal="${esc(r.mealType)}" data-pro="${r.totalProtein}">✓ 加入飲食記錄 +${XP_REWARDS.photoFood} XP</button>
  </div>`;
  $('cam-actions').innerHTML =
    '<button class="cam-btn cam-btn-sec" data-action="triggerUpload">重新拍</button>' +
    '<button class="cam-btn cam-btn-main" data-action="closeCam">完成 ✓</button>';
}

function showManualFallback(reason = '請確認照片清晰，或手動輸入') {
  $('ai-res-wrap').innerHTML = `<div class="ai-result">
    <div class="ai-res-title">手動輸入</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:10px;font-weight:700">${esc(reason)}</div>
    <div class="ai-edit-row"><input class="ai-edit-in" id="m-name" placeholder="食物名稱"><input class="ai-edit-in" id="m-cal" placeholder="卡路里" type="number" style="width:90px"></div>
    <button class="ai-add-btn" data-action="addManualCam">手動新增</button>
  </div>`;
  $('cam-actions').innerHTML =
    '<button class="cam-btn cam-btn-sec" data-action="closeCam">✕ 關閉</button>' +
    '<button class="cam-btn cam-btn-main" data-action="triggerUpload">重新拍照</button>';
}

// Thumbnail of the current photo, or null — logging must never fail
// just because thumbnail generation did.
async function tryThumb() {
  if (!currentPhoto) return null;
  try { return await thumbnailFromDataUrl(currentPhoto); } catch { return null; }
}

export async function addFoodFromAI(mealType, protein) {
  const name = ($('ai-fname')?.value || '').trim() || 'AI識別食物';
  const cal = Math.round(numVal('ai-fcal', { min: 0, max: 10000 }));
  if (!cal) { toast('請確認熱量'); return; }

  const thumb = await tryThumb();
  const entry = { name, cal, pro: protein, type: mealType, icon: '📸', hasPhoto: true, xp: XP_REWARDS.photoFood };
  if (thumb) {
    entry.thumb = thumb;
    entry.albumId = addAlbumEntry({ thumb, name, cal });
  }
  state.foodLogs.push(entry);
  state.counters.meals++;
  state.counters.snaps++;
  recordFoodUse(name, { cal, pro: protein, type: mealType, icon: '📸' });
  addXP(XP_REWARDS.photoFood, '📸', '拍照識別！', name + ' 已記錄');
  confetti();
  bus.emit('state:changed');
  setTimeout(closeCamera, 700);
}

export async function addManualFromCamera() {
  const name = ($('m-name')?.value || '').trim() || '食物';
  const cal = Math.round(numVal('m-cal', { min: 0, max: 10000 }));
  if (!cal) { toast('請填寫熱量'); return; }

  // A photo was still taken (AI just couldn't read it) — keep it in the album.
  const thumb = await tryThumb();
  const entry = { name, cal, pro: 0, type: '午餐', icon: '✏️', xp: XP_REWARDS.manualFoodFromCamera };
  if (thumb) {
    entry.thumb = thumb;
    entry.albumId = addAlbumEntry({ thumb, name, cal });
  }
  state.foodLogs.push(entry);
  state.counters.meals++;
  recordFoodUse(name, { cal, pro: 0, type: '午餐', icon: '✏️' });
  addXP(XP_REWARDS.manualFoodFromCamera, '✏️', '手動記錄', '繼續保持記錄習慣');
  bus.emit('state:changed');
  setTimeout(closeCamera, 600);
}
