// Achievement badge definitions. `isEarned` receives the app state.
export const BADGES = [
  { id: 'snap1', icon: '📸', name: '第一拍', isEarned: s => s.counters.snaps >= 1 },
  { id: 'snap10', icon: '🎬', name: '十拍達人', isEarned: s => s.counters.snaps >= 10 },
  { id: 'first', icon: '🌱', name: '第一步', isEarned: s => s.counters.workouts >= 1 },
  { id: 'streak3', icon: '🔥', name: '3天連勝', isEarned: s => s.streak >= 3 },
  { id: 'streak7', icon: '⚡', name: '一週無休', isEarned: s => s.streak >= 7 },
  { id: 'food10', icon: '🥗', name: '飲食達人', isEarned: s => s.counters.meals >= 10 },
  { id: 'sleep7', icon: '🌙', name: '睡眠優等', isEarned: s => s.counters.sleeps >= 7 },
  { id: 'xp500', icon: '💎', name: '500俱樂部', isEarned: s => s.xp >= 500 },
  { id: 'bmi', icon: '📊', name: '數據控', isEarned: s => s.hasBMI },
  { id: 'workout10', icon: '💪', name: '十次戰士', isEarned: s => s.counters.workouts >= 10 },
  { id: 'allphase', icon: '🚀', name: '全能選手', isEarned: s => s.currentPhase >= 2 },
  { id: 'calgoal', icon: '🎯', name: '卡路里控', isEarned: s => s.counters.calorieDays >= 3 },
];
