import { STORAGE_KEY } from '../config.js';
import { state } from './state.js';

export function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      xp: state.xp,
      streak: state.streak,
      earnedBadges: state.earnedBadges,
      counters: state.counters,
      currentPhase: state.currentPhase,
      weekDone: state.weekDone,
      weekMins: state.weekMins,
      foodLogs: state.foodLogs,
      exLogs: state.exLogs,
      sleepLogs: state.sleepLogs,
      weightHistory: state.weightHistory,
      goals: state.goals,
      hasBMI: state.hasBMI,
      reminders: state.reminders,
      savedDate: new Date().toDateString(),
    }));
  } catch { /* storage full or unavailable — keep the app usable */ }
}

// Restores saved data into `state`. Daily logs are cleared when the
// save comes from a previous day. Returns { isNewDay } for the greeting toast.
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { isNewDay: false };
    const d = JSON.parse(raw);
    const isNewDay = d.savedDate !== new Date().toDateString();

    state.xp = d.xp || 0;
    state.streak = d.streak || 0;
    state.earnedBadges = d.earnedBadges || [];
    state.counters = { ...state.counters, ...(d.counters || {}) };
    state.currentPhase = d.currentPhase || 0;
    state.weekDone = isNewDay ? state.weekDone.map(() => false) : (d.weekDone || state.weekDone);
    state.weekMins = isNewDay ? state.weekMins.map(() => 0) : (d.weekMins || state.weekMins);
    state.foodLogs = isNewDay ? [] : (d.foodLogs || []);
    state.exLogs = isNewDay ? [] : (d.exLogs || []);
    state.sleepLogs = d.sleepLogs || [];
    state.weightHistory = d.weightHistory || [];
    state.goals = d.goals || state.goals;
    state.hasBMI = d.hasBMI || false;
    state.reminders = d.reminders || state.reminders;

    return { isNewDay: isNewDay && Boolean(d.savedDate) };
  } catch {
    return { isNewDay: false };
  }
}
