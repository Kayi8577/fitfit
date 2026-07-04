// AI personal coach: sends the user's current stats to the model
// and renders tailored advice.

import { XP_REWARDS } from '../config.js';
import { PHASES } from '../data/phases.js';
import { state } from '../core/state.js';
import { bus } from '../core/events.js';
import { $ } from '../utils/dom.js';
import { getCoachAdvice } from '../services/ai.js';
import { addXP } from './gamification.js';
import { toast } from './feedback.js';

const TOPIC_LABELS = {
  overall: '整體健康計畫',
  workout: '今日運動建議',
  diet: '飲食調整',
  sleep: '睡眠改善',
  plateau: '突破平台期',
};

let running = false;

export async function askCoach() {
  if (running) { toast('AI 正在回覆中...'); return; }
  running = true;

  const topic = $('ai-topic').value;
  const extra = $('ai-extra').value;
  const totalCal = state.foodLogs.reduce((a, b) => a + b.cal, 0);
  const totalBurn = state.exLogs.reduce((a, b) => a + b.burn, 0);
  const sleep = state.sleepLogs[0]?.hours || 0;
  const phase = PHASES[state.currentPhase];

  const prompt =
    `你是根據最新科學研究（2024-2025）的健康教練，繁體中文回覆。` +
    `用戶：飲食${totalCal}kcal，運動消耗${totalBurn}kcal，睡眠${sleep || '未記錄'}小時，` +
    `連續運動${state.streak}天，${phase.name}，目標${state.goals.cal}kcal/日，補充：${extra || '無'}。` +
    `針對「${TOPIC_LABELS[topic]}」給4點建議，每點emoji+粗體標題+換行說明1-2句，最後一句鼓勵。`;

  const out = $('ai-out');
  out.innerHTML = '<div class="ai-msg loading">AI 正在分析你的數據...</div>';

  try {
    const text = await getCoachAdvice(prompt);
    out.innerHTML = `<div class="ai-tag">AI 建議 · 基於最新研究</div><div class="ai-msg">${text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</div>`;
    addXP(XP_REWARDS.coachAdvice, '🤖', '獲取AI建議', '讓數據幫你做更好的決定');
    bus.emit('state:changed');
  } catch {
    out.innerHTML = '<div class="ai-msg loading">連線失敗，請稍後再試</div>';
  }
  running = false;
}
