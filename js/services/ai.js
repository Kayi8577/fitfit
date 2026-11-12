// Anthropic API client for the two AI features:
// photo → nutrition analysis, and the personal coach.

import { AI, getApiKey } from '../config.js';
import { clampNum } from '../utils/health.js';

export function hasApiKey() {
  return Boolean(getApiKey());
}

async function requestText(body) {
  const apiKey = getApiKey();
  // Short-circuit: without a key the request is a guaranteed 401.
  if (!apiKey) throw new Error('missing-key');

  const res = await fetch(AI.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'anthropic-version': AI.version,
      'anthropic-dangerous-direct-browser-access': 'true',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({ model: AI.model, ...body }),
  });
  if (!res.ok) throw new Error(`AI request failed: ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}

const FOOD_PROMPT =
  '你是專業食物營養師AI。分析這張食物照片，以純JSON回覆（不含markdown）：' +
  '{"foods":[{"name":"名稱","portion":"份量","calories":數字,"protein":數字,"carbs":數字,"fat":數字}],' +
  '"totalCalories":數字,"totalProtein":數字,"totalCarbs":數字,"totalFat":數字,' +
  '"mealType":"早餐/午餐/晚餐/點心","healthScore":1到10,"tip":"一句中文建議"}。' +
  '台式食物注意份量，數字為整數。';

const MEAL_TYPES = ['早餐', '午餐', '晚餐', '點心'];

function normalizeMeal(raw) {
  const s = String(raw || '');
  return MEAL_TYPES.find(t => s.includes(t[0])) || '午餐';
}

// Analyzes a food photo (data URL). Throws on network/API failure.
// Returns null when the model's reply can't be parsed — the caller falls
// back to manual entry. We never invent numbers and present them as real.
export async function analyzeFoodPhoto(dataUrl) {
  const [meta, imageData] = dataUrl.split(',');
  const mediaType = meta.split(';')[0].split(':')[1];

  const text = await requestText({
    max_tokens: 1200,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageData } },
        { type: 'text', text: FOOD_PROMPT },
      ],
    }],
  });

  let parsed;
  try {
    parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object') return null;

  // Sanitize every model-provided number so a weird reply (healthScore: 85,
  // calories: -3) can't crash rendering or corrupt the logs.
  return {
    foods: (Array.isArray(parsed.foods) ? parsed.foods : []).map(f => ({
      name: String(f?.name || '食物'),
      portion: String(f?.portion || ''),
      calories: Math.round(clampNum(f?.calories, 0, 5000)),
    })),
    totalCalories: Math.round(clampNum(parsed.totalCalories, 0, 10000)),
    totalProtein: Math.round(clampNum(parsed.totalProtein, 0, 1000)),
    totalCarbs: Math.round(clampNum(parsed.totalCarbs, 0, 1000)),
    totalFat: Math.round(clampNum(parsed.totalFat, 0, 1000)),
    mealType: normalizeMeal(parsed.mealType),
    healthScore: Math.round(clampNum(parsed.healthScore, 1, 10, 5)),
    tip: String(parsed.tip || ''),
  };
}

export async function getCoachAdvice(prompt) {
  return requestText({
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  });
}
