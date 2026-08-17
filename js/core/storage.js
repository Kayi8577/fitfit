import { STORAGE_KEY } from '../config.js';
import { state } from './state.js';
import { bus } from './events.js';
import { dateKey, yesterdayKey, weekKey } from '../utils/time.js';

// The exact shape that gets persisted / exported / backed up to Drive.
// NOTE: API keys and OAuth client IDs are intentionally NOT part of this —
// backups must never carry secrets.
export function exportSnapshot() {
  return {
    version: 2,
    xp: state.xp,
    streak: state.streak,
    lastWorkoutDate: state.lastWorkoutDate,
    earnedBadges: state.earnedBadges,
    counters: state.counters,
    currentPhase: state.currentPhase,
    weekDone: state.weekDone,
    weekMins: state.weekMins,
    foodLogs: state.foodLogs,
    exLogs: state.exLogs,
    sleepLogs: state.sleepLogs,
    weightHistory: state.weightHistory,
    history: state.history,
    goals: state.goals,
    hasBMI: state.hasBMI,
    profile: state.profile,
    fasting: state.fasting,
    reminders: state.reminders,
    savedDate: dateKey(),
    weekKey: weekKey(),
  };
}

let storageWarned = false;

export function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(exportSnapshot()));
  } catch {
    // Storage full/unavailable — warn once instead of silently losing data.
    if (!storageWarned) {
      storageWarned = true;
      bus.emit('storage:error');
    }
  }
}

// Restores a snapshot into `state`, handling day/week rollover:
//  - day changed  → settle yesterday (calorieDays counter + history entry),
//                   then clear the daily food/exercise logs
//  - week changed → reset weekly plan check-ins and minutes
//  - streak       → broken unless the last workout was today or yesterday
// Returns { isNewDay } for the greeting toast.
export function hydrate(d) {
  const today = dateKey();
  const isNewDay = d.savedDate !== today;
  const sameWeek = d.weekKey === weekKey();

  state.xp = d.xp || 0;
  state.streak = d.streak || 0;
  state.lastWorkoutDate = d.lastWorkoutDate || null;
  state.earnedBadges = d.earnedBadges || [];
  state.counters = { ...state.counters, ...(d.counters || {}) };
  // v1 stored calorieDays as fractional (+0.33 per render) — normalize.
  state.counters.calorieDays = Math.floor(state.counters.calorieDays || 0);
  state.currentPhase = d.currentPhase || 0;
  state.sleepLogs = d.sleepLogs || [];
  state.weightHistory = d.weightHistory || [];
  state.history = d.history || [];
  state.goals = { ...state.goals, ...(d.goals || {}) };
  state.hasBMI = d.hasBMI || false;
  state.profile = { ...state.profile, ...(d.profile || {}) };
  state.fasting = { ...state.fasting, ...(d.fasting || {}) };
  state.reminders = d.reminders || state.reminders;

  if (isNewDay && d.savedDate) {
    // Settle the day the snapshot was saved on, before dropping its logs.
    const cal = (d.foodLogs || []).reduce((a, b) => a + (b.cal || 0), 0);
    const burn = (d.exLogs || []).reduce((a, b) => a + (b.burn || 0), 0);
    if (cal > 0 && cal <= (d.goals?.cal || 1800)) state.counters.calorieDays++;
    // Only date-keyed snapshots enter history — v1 stored toDateString().
    if ((cal > 0 || burn > 0) && /^\d{4}-\d{2}-\d{2}$/.test(d.savedDate)) {
      state.history = state.history
        .filter(h => h.date !== d.savedDate)
        .concat({ date: d.savedDate, cal, burn })
        .slice(-60);
    }
  }
  state.foodLogs = isNewDay ? [] : (d.foodLogs || []);
  state.exLogs = isNewDay ? [] : (d.exLogs || []);

  state.weekDone = sameWeek && Array.isArray(d.weekDone) ? d.weekDone : state.weekDone.map(() => false);
  state.weekMins = sameWeek && Array.isArray(d.weekMins) ? d.weekMins : state.weekMins.map(() => 0);

  // A streak survives only if the last counted workout was today or yesterday.
  if (state.streak > 0 && state.lastWorkoutDate !== today && state.lastWorkoutDate !== yesterdayKey()) {
    state.streak = 0;
  }

  return { isNewDay: isNewDay && Boolean(d.savedDate) };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { isNewDay: false };
    return hydrate(JSON.parse(raw));
  } catch {
    return { isNewDay: false };
  }
}

// Applies an imported / Drive-restored snapshot. Throws on garbage input.
export function importSnapshot(d) {
  if (!d || typeof d !== 'object' || Array.isArray(d) || !('xp' in d)) {
    throw new Error('備份檔格式不正確');
  }
  const result = hydrate(d);
  saveState();
  return result;
}
