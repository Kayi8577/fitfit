// FitFit entry point.
// Wires user actions (via `data-action` event delegation) to feature modules,
// and re-renders + persists whenever the bus reports a state change.

import { state } from './core/state.js';
import { loadState, saveState } from './core/storage.js';
import { bus } from './core/events.js';
import { $ } from './utils/dom.js';

import { buildBackground } from './features/background.js';
import { switchSection } from './features/navigation.js';
import { toast } from './features/feedback.js';
import { renderXPBar, checkBadges, renderBadges } from './features/gamification.js';
import { initCamera, openCamera, closeCamera, triggerUpload, addFoodFromAI, addManualFromCamera } from './features/camera.js';
import { addFood, renderFoodLog, renderHomeFoodList } from './features/food.js';
import { initFasting, updateFastingInfo } from './features/fasting.js';
import { renderStats, updateDeficit, renderWeekDots, renderWeekChart, saveWeight, renderWeightHistory } from './features/home.js';
import {
  renderPhasePills, setPhase, renderWeekPlan, renderTodayWorkout, toggleDone,
  renderLibrary, setViewLevel, initExerciseForm, updateBurnPreview, addExercise, renderExerciseList,
} from './features/workout.js';
import { addSleep, renderSleepList } from './features/sleep.js';
import { calculateBMI } from './features/bmi.js';
import { saveGoals, renderGoalProgress } from './features/goals.js';
import { addReminder, renderReminders, toggleReminder } from './features/reminders.js';
import { renderCategoryTabs, setCategory, renderVideos } from './features/videos.js';
import { askCoach } from './features/coach.js';

// ── Action registry: `data-action` attribute → handler ──
const actions = {
  navigate: el => switchSection(el.dataset.section, el),
  openCam: () => openCamera(),
  closeCam: () => closeCamera(),
  triggerUpload: () => triggerUpload(),
  addAiFood: el => addFoodFromAI(el.dataset.meal, Number(el.dataset.pro) || 0),
  addManualCam: () => addManualFromCamera(),
  addFood: () => addFood(),
  addExercise: () => addExercise(),
  addSleep: () => addSleep(),
  addReminder: () => addReminder(),
  toggleReminder: el => toggleReminder(Number(el.dataset.index)),
  toggleDone: el => toggleDone(Number(el.dataset.index)),
  setPhase: el => setPhase(Number(el.dataset.index)),
  setLevel: el => setViewLevel(el.dataset.level, el),
  setCategory: el => setCategory(el.dataset.cat),
  calcBMI: () => calculateBMI(),
  saveGoals: () => saveGoals(),
  saveWeight: () => saveWeight(),
  askCoach: () => askCoach(),
  openVideo: el => window.open(el.dataset.url, '_blank'),
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  actions[el.dataset.action]?.(el, e);
});

// ── Rendering ────────────────────────────────────────────
function renderAll() {
  renderStats(); renderWeekDots(); renderWeekChart(); renderHomeFoodList(); updateDeficit(); renderWeightHistory();
  renderPhasePills(); renderWeekPlan(); renderTodayWorkout(); renderLibrary();
  renderFoodLog(); renderExerciseList(); renderSleepList(); renderBadges();
  renderGoalProgress(); renderReminders(); renderCategoryTabs(); renderVideos();
  updateFastingInfo(); updateBurnPreview(); renderXPBar();
}

bus.on('state:changed', () => {
  checkBadges();
  renderAll();
  saveState();
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

function init() {
  buildBackground($('bg-canvas'));
  const { isNewDay } = loadState();
  syncSettingsInputs();
  renderGreeting();
  initCamera();
  initFasting();
  initExerciseForm();
  renderAll();
  if (isNewDay) toast('✨ 新的一天，繼續加油！');
}

init();
