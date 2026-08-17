// FitFit entry point.
// Wires user actions (via `data-action` event delegation) to feature modules,
// and re-renders + persists whenever the bus reports a state change.

import { state } from './core/state.js';
import { loadState, saveState } from './core/storage.js';
import { bus } from './core/events.js';
import { $ } from './utils/dom.js';

import { buildBackground } from './features/background.js';
import { SECTIONS, activeSection, applyHash } from './features/navigation.js';
import { toast } from './features/feedback.js';
import { renderXPBar, checkBadges, renderBadges } from './features/gamification.js';
import { initCamera, openCamera, closeCamera, triggerUpload, addFoodFromAI, addManualFromCamera } from './features/camera.js';
import { addFood, deleteFood, renderFoodLog, renderHomeFoodList } from './features/food.js';
import { initFasting, updateFastingInfo } from './features/fasting.js';
import {
  renderStats, updateDeficit, renderWeekDots, renderWeekChart, renderHistoryChart,
  saveWeight, deleteWeight, renderWeightHistory,
} from './features/home.js';
import {
  renderPhasePills, setPhase, renderWeekPlan, renderTodayWorkout, toggleDone,
  renderLibrary, setViewLevel, initExerciseForm, updateBurnPreview,
  addExercise, deleteExercise, renderExerciseList,
} from './features/workout.js';
import { addSleep, deleteSleep, renderSleepList } from './features/sleep.js';
import { calculateBMI, initBMIForm } from './features/bmi.js';
import { saveGoals, renderGoalProgress } from './features/goals.js';
import { initReminders, addReminder, deleteReminder, renderReminders, toggleReminder } from './features/reminders.js';
import { renderCategoryTabs, setCategory, renderVideos } from './features/videos.js';
import { askCoach } from './features/coach.js';
import { initSettings, saveAiKey, exportData, triggerImport, driveBackup, driveRestore } from './features/settings.js';

// ── Action registry: `data-action` attribute → handler ──
// Null prototype + hasOwn lookup: `data-action="constructor"` must not
// reach up the prototype chain.
const actions = Object.assign(Object.create(null), {
  navigate: el => { location.hash = el.dataset.section; },
  openCam: () => openCamera(),
  closeCam: () => closeCamera(),
  triggerUpload: () => triggerUpload(),
  addAiFood: el => addFoodFromAI(el.dataset.meal, Number(el.dataset.pro) || 0),
  addManualCam: () => addManualFromCamera(),
  addFood: () => addFood(),
  delFood: el => deleteFood(Number(el.dataset.index)),
  addExercise: () => addExercise(),
  delExercise: el => deleteExercise(Number(el.dataset.index)),
  addSleep: () => addSleep(),
  delSleep: el => deleteSleep(Number(el.dataset.index)),
  addReminder: () => addReminder(),
  delReminder: el => deleteReminder(Number(el.dataset.index)),
  toggleReminder: el => toggleReminder(Number(el.dataset.index)),
  toggleDone: el => toggleDone(Number(el.dataset.index)),
  setPhase: el => setPhase(Number(el.dataset.index)),
  setLevel: el => setViewLevel(el.dataset.level, el),
  setCategory: el => setCategory(el.dataset.cat),
  calcBMI: () => calculateBMI(),
  saveGoals: () => saveGoals(),
  saveWeight: () => saveWeight(),
  delWeight: el => deleteWeight(Number(el.dataset.index)),
  askCoach: () => askCoach(),
  openVideo: el => window.open(el.dataset.url, '_blank', 'noopener'),
  saveAiKey: () => saveAiKey(),
  exportData: () => exportData(),
  triggerImport: () => triggerImport(),
  driveBackup: () => driveBackup(),
  driveRestore: () => driveRestore(),
});

function runAction(el, e) {
  if (Object.hasOwn(actions, el.dataset.action)) actions[el.dataset.action](el, e);
}

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (el) runAction(el, e);
});

// Keyboard support for the few non-<button> actionable elements
// (cards with role="button") — buttons already fire click on Enter/Space.
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const el = e.target.closest('[data-action]');
  if (!el || ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName)) return;
  e.preventDefault();
  runAction(el, e);
});

// ── Rendering ────────────────────────────────────────────
// Renderers grouped per section: on state change only the visible section
// re-renders; the rest are marked dirty and render when navigated to.
const SECTION_RENDERERS = {
  home: [renderXPBar, renderStats, renderWeekDots, renderWeekChart, renderHistoryChart, renderHomeFoodList, updateDeficit, renderWeightHistory],
  food: [renderFoodLog, updateFastingInfo],
  plan: [renderPhasePills, renderWeekPlan, renderTodayWorkout, renderLibrary, renderExerciseList, updateBurnPreview],
  videos: [renderCategoryTabs, renderVideos],
  more: [renderSleepList, renderBadges, renderGoalProgress, renderReminders],
};

const dirty = new Set();

function renderSection(id) {
  (SECTION_RENDERERS[id] || []).forEach(fn => fn());
  dirty.delete(id);
}

function renderAll() {
  SECTIONS.forEach(renderSection);
}

bus.on('state:changed', () => {
  checkBadges();
  SECTIONS.forEach(id => dirty.add(id));
  renderSection(activeSection());
  renderXPBar(); // XP bar lives in the home header but reflects every action
  saveState();
});

bus.on('storage:error', () => {
  toast('⚠️ 無法儲存資料（儲存空間已滿？）建議先匯出備份');
});

window.addEventListener('hashchange', () => {
  const id = applyHash();
  if (dirty.has(id)) renderSection(id);
});

// ── Boot ─────────────────────────────────────────────────
function syncSettingsInputs() {
  $('g-ex').value = state.goals.ex;
  $('g-cal').value = state.goals.cal;
  $('g-sleep').value = state.goals.sleep;
}

function renderGreeting() {
  const h = new Date().getHours();
  $('greeting').textContent =
    h < 5 ? '深夜了 🌙' : h < 12 ? '早安 ☀️' : h < 17 ? '午安 🌤' : h < 21 ? '晚安 🌇' : '深夜了 🌙';
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline support is best-effort */ });
  }
}

function init() {
  buildBackground($('bg-canvas'));
  const { isNewDay } = loadState();
  syncSettingsInputs();
  renderGreeting();
  setInterval(renderGreeting, 60000); // stays correct if the tab lives past a time-of-day boundary
  initCamera();
  initFasting();
  initExerciseForm();
  initBMIForm();
  initReminders();
  initSettings();
  renderAll();
  applyHash();
  registerServiceWorker();
  if (isNewDay) toast('✨ 新的一天，繼續加油！');
}

init();
