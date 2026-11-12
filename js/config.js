// App-wide configuration. Tweak values here instead of hunting through feature code.

export const STORAGE_KEY = 'health_mgr_v1';

// Secrets are NEVER kept in source — they live in this device's localStorage
// only, entered by the user in 更多 → AI 設定 / 資料備份.
const API_KEY_STORAGE = 'fitfit_api_key';
const GDRIVE_CLIENT_ID_STORAGE = 'fitfit_gdrive_client_id';

// Anthropic API settings for photo calorie analysis & the AI coach.
export const AI = {
  endpoint: 'https://api.anthropic.com/v1/messages',
  model: 'claude-sonnet-5',
  version: '2023-06-01',
};

function read(key) {
  try { return localStorage.getItem(key) || ''; } catch { return ''; }
}
function write(key, value) {
  try { value ? localStorage.setItem(key, value) : localStorage.removeItem(key); } catch { /* ignore */ }
}

export const getApiKey = () => read(API_KEY_STORAGE);
export const setApiKey = v => write(API_KEY_STORAGE, v);
export const getDriveClientId = () => read(GDRIVE_CLIENT_ID_STORAGE);
export const setDriveClientId = v => write(GDRIVE_CLIENT_ID_STORAGE, v);

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
