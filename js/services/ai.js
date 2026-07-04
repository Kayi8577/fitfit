// Anthropic API client for the two AI features:
// photo → nutrition analysis, and the personal coach.

import { AI } from '../config.js';

async function requestText(body) {
  const headers = {
    'Content-Type': 'application/json',
    'anthropic-version': AI.version,
    'anthropic-dangerous-direct-browser-access': 'true',
  };
  if (AI.apiKey) headers['x-api-key'] = AI.apiKey;

  const res = await fetch(AI.endpoint, {
    method: 'POST',
    headers,
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
  '"mealType":"早/午/晚/點心","healthScore":1到10,"tip":"一句中文建議"}。' +
  '台式食物注意份量，數字為整數。';

// Analyzes a food photo (data URL). Throws on network/API failure;
// falls back to a generic estimate if the model returns unparseable JSON.
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

  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch {
    return {
      foods: [{ name: '食物', portion: '1份', calories: 300, protein: 15, carbs: 35, fat: 8 }],
      totalCalories: 300, totalProtein: 15, totalCarbs: 35, totalFat: 8,
      mealType: '午餐', healthScore: 7, tip: '均衡飲食是健康的基礎',
    };
  }
}

export async function getCoachAdvice(prompt) {
  return requestText({
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  });
}
