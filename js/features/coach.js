// AI personal coach: sends the user's current stats to the model
// and renders tailored advice.

import { XP_REWARDS } from '../config.js';
import { PHASES } from '../data/phases.js';
import { state } from '../core/state.js';
import { bus } from '../core/events.js';
import { $, esc } from '../utils/dom.js';
import { dailyLast } from '../utils/health.js';
import { dateKey, shortLabel } from '../utils/time.js';
import { getCoachAdvice, hasApiKey } from '../services/ai.js';
import { addXP } from './gamification.js';
import { toast } from './feedback.js';

const TOPIC_LABELS = {
  overall: '整體健康計畫',
  workout: '今日運動建議',
  diet: '飲食調整',
  sleep: '睡眠改善',
  plateau: '突破平台期',
};

// Model output is untrusted text (and the prompt embeds user input) —
// escape it first, THEN apply our own light markdown (**bold**, newlines).
function renderAdvice(text) {
  return esc(text)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

// Summarizes the user's recent trend — not just today — so the model can
// give advice grounded in what actually happened this week. Exported for tests.
export function buildCoachContext(s) {
  const parts = [];
  const todayCal = s.foodLogs.reduce((a, b) => a + b.cal, 0);
  const todayPro = Math.round(s.foodLogs.reduce((a, b) => a + (b.pro || 0), 0));
  const todayBurn = s.exLogs.reduce((a, b) => a + b.burn, 0);
  parts.push(`今日：攝入${todayCal}kcal（蛋白質${todayPro}g），運動消耗${todayBurn}kcal`);

  // Past days: settled daily summaries (most recent 6 + today = a week).
  const days = s.history.slice(-6);
  if (days.length) {
    const list = days.map(h => `${shortLabel(h.date)}攝入${h.cal}消耗${h.burn}`).join('、');
    const avg = Math.round(days.reduce((a, h) => a + h.cal, 0) / days.length);
    parts.push(`前${days.length}天（kcal）：${list}；日均攝入${avg}，目標${s.goals.cal}`);
  }

  const weights = dailyLast(s.weightHistory).slice(-14);
  if (weights.length >= 2) {
    const first = weights[0], last = weights[weights.length - 1];
    parts.push(`體重：${shortLabel(first.date)} ${first.v}kg → ${shortLabel(last.date)} ${last.v}kg`);
  } else if (weights.length === 1) {
    parts.push(`體重：${weights[0].v}kg`);
  }

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const sleeps = s.sleepLogs.filter(x => x.date && x.date >= dateKey(weekAgo));
  if (sleeps.length) {
    const avg = Math.round(sleeps.reduce((a, x) => a + x.hours, 0) / sleeps.length * 10) / 10;
    parts.push(`近7天睡眠${sleeps.length}筆，平均${avg}小時（目標${s.goals.sleep}）`);
  } else {
    parts.push('睡眠：未記錄');
  }

  parts.push(`連續運動${s.streak}天，本週已練${s.weekDone.filter(Boolean).length}/${s.goals.ex}次`);
  return parts.join('。');
}

let running = false;

export async function askCoach() {
  if (running) { toast('AI 正在回覆中...'); return; }
  const out = $('ai-out');
  if (!hasApiKey()) {
    out.innerHTML = '<div class="ai-msg loading">尚未設定 API Key — 請到「AI 設定」填入後再試</div>';
    return;
  }
  running = true;

  const topic = TOPIC_LABELS[$('ai-topic').value] ? $('ai-topic').value : 'overall';
  const extra = $('ai-extra').value.slice(0, 200);
  const phase = PHASES[state.currentPhase];

  const prompt =
    `你是根據最新科學研究的健康教練，繁體中文回覆。` +
    `用戶數據——${buildCoachContext(state)}。` +
    `訓練：${phase.name}（${phase.label}）。補充：${extra || '無'}。` +
    `針對「${TOPIC_LABELS[topic]}」給4點建議：先一句點出數據中最重要的趨勢，` +
    `每點emoji+粗體標題+換行說明1-2句，要引用具體數字，最後一句鼓勵。`;

  out.innerHTML = '<div class="ai-msg loading">AI 正在分析你的數據...</div>';

  try {
    const text = await getCoachAdvice(prompt);
    out.innerHTML = `<div class="ai-tag">AI 建議 · 僅供參考，非醫療建議</div><div class="ai-msg">${renderAdvice(text)}</div>`;
    addXP(XP_REWARDS.coachAdvice, '🤖', '獲取AI建議', '讓數據幫你做更好的決定');
    bus.emit('state:changed');
  } catch {
    out.innerHTML = '<div class="ai-msg loading">連線失敗，請稍後再試</div>';
  }
  running = false;
}
