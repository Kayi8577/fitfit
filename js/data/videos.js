// Curated YouTube workout videos, grouped by intensity.
export const VIDEOS = {
  easy: [
    { id: 'v1', title: '20分鐘初學者全身有氧（零跳躍）', channel: 'MadFit', url: 'https://www.youtube.com/watch?v=gC_L9qAHVJ8', dur: '20分鐘', kcal: 120, level: 'easy', tags: ['有氧', '初學者'], th: 'https://img.youtube.com/vi/gC_L9qAHVJ8/mqdefault.jpg' },
    { id: 'v2', title: '30分鐘室內步行減脂', channel: 'Walk at Home', url: 'https://www.youtube.com/watch?v=fnEFGSvagS0', dur: '30分鐘', kcal: 150, level: 'easy', tags: ['步行', '低衝擊'], th: 'https://img.youtube.com/vi/fnEFGSvagS0/mqdefault.jpg' },
    { id: 'v6', title: '20分鐘晚間瑜珈助眠放鬆', channel: 'Yoga With Adriene', url: 'https://www.youtube.com/watch?v=BiWDsfZ3zbo', dur: '20分鐘', kcal: 35, level: 'easy', tags: ['瑜珈', '助眠'], th: 'https://img.youtube.com/vi/BiWDsfZ3zbo/mqdefault.jpg' },
  ],
  medium: [
    { id: 'v3', title: '30分鐘HIIT有氧（含暖身緩和）', channel: 'SELF', url: 'https://www.youtube.com/watch?v=ml6cT4AZdqI', dur: '30分鐘', kcal: 280, level: 'medium', tags: ['HIIT', '全身'], th: 'https://img.youtube.com/vi/ml6cT4AZdqI/mqdefault.jpg' },
    { id: 'v4', title: '20分鐘全身燃脂訓練', channel: 'Pamela Reif', url: 'https://www.youtube.com/watch?v=UItWltVZZmE', dur: '20分鐘', kcal: 200, level: 'medium', tags: ['燃脂', '全身'], th: 'https://img.youtube.com/vi/UItWltVZZmE/mqdefault.jpg' },
  ],
  hard: [
    { id: 'v5', title: '30分鐘高強度HIIT燃脂', channel: 'SELF', url: 'https://www.youtube.com/watch?v=ml6cT4AZdqI', dur: '30分鐘', kcal: 380, level: 'hard', tags: ['HIIT', '高強度'], th: 'https://img.youtube.com/vi/ml6cT4AZdqI/mqdefault.jpg' },
  ],
  recovery: [
    { id: 'v7', title: '15分鐘全身肌肉放鬆（訓練後必做）', channel: 'MadFit', url: 'https://www.youtube.com/watch?v=g_tea8ZNk5A', dur: '15分鐘', kcal: 20, level: 'easy', tags: ['恢復', '伸展'], th: 'https://img.youtube.com/vi/g_tea8ZNk5A/mqdefault.jpg' },
  ],
};

export const VIDEO_CATEGORIES = [
  { id: 'today', label: '今日推薦' },
  { id: 'cardio', label: '有氧燃脂' },
  { id: 'hiit', label: 'HIIT' },
  { id: 'yoga', label: '瑜珈伸展' },
  { id: 'recovery', label: '恢復放鬆' },
];
