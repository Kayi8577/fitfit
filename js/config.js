// App-wide configuration. Tweak values here instead of hunting through feature code.

export const STORAGE_KEY = 'health_mgr_v1';

// Anthropic API settings for photo calorie analysis & the AI coach.
// Set `apiKey` to enable the AI features (see README for details).
export const AI = {
  endpoint: 'https://api.anthropic.com/v1/messages',
  model: 'claude-sonnet-5',
  apiKey: '',
  version: '2023-06-01',
};

// XP awarded per action — keep gamification balance in one place.
export const XP_REWARDS = {
  photoFood: 15,
  manualFoodFromCamera: 5,
  manualFood: 10,
  workoutDone: 50,
  exerciseLog: 30,
  sleepLog: 15,
  bmi: 20,
  weight: 5,
  coachAdvice: 5,
  badge: 100,
};
