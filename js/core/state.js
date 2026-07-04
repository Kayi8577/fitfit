// Single source of truth for all app data. Mutate it, then emit
// 'state:changed' on the event bus so the UI re-renders and persists.

export const state = {
  // Gamification
  xp: 0,
  streak: 0,
  earnedBadges: [],
  counters: { workouts: 0, meals: 0, sleeps: 0, snaps: 0, calorieDays: 0 },

  // Training
  currentPhase: 0,
  weekDone: [false, false, false, false, false, false, false],
  weekMins: [0, 0, 0, 0, 0, 0, 0],

  // Daily logs (food/exercise reset each day; sleep & weight persist)
  foodLogs: [],
  exLogs: [],
  sleepLogs: [],
  weightHistory: [],

  // Settings
  goals: { ex: 3, cal: 1800, sleep: 7.5 },
  hasBMI: false,
  reminders: [
    { time: '07:00', msg: '早晨運動任務時間！💪', on: true },
    { time: '12:00', msg: '午餐拍照記錄熱量 📸', on: true },
    { time: '20:00', msg: '記錄今日飲食 🌿', on: true },
  ],

  // Transient UI state (not persisted)
  viewLevel: 'easy',
  currentCategory: 'today',
};
