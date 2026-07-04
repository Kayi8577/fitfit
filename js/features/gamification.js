// XP, levels and achievement badges.

import { XP_REWARDS } from '../config.js';
import { LEVELS } from '../data/levels.js';
import { BADGES } from '../data/badges.js';
import { state } from '../core/state.js';
import { bus } from '../core/events.js';
import { $ } from '../utils/dom.js';
import { toast, showXPPop, confetti } from './feedback.js';

function currentLevelIndex() {
  let idx = 0;
  LEVELS.forEach((_, i) => {
    if (state.xp >= (i > 0 ? LEVELS[i - 1].max : 0)) idx = i;
  });
  return idx;
}

// Grants XP with visual feedback. Does NOT persist or re-render the app —
// callers emit 'state:changed' once at the end of their action.
export function addXP(amount, emoji, title, subtitle) {
  state.xp += amount;
  renderXPBar();
  showXPPop(emoji, title, subtitle, amount);
  if (amount >= 50) confetti();
}

export function renderXPBar() {
  const idx = currentLevelIndex();
  const level = LEVELS[idx];
  const prevMax = idx > 0 ? LEVELS[idx - 1].max : 0;
  const pct = Math.min(100, Math.round((state.xp - prevMax) / (level.max - prevMax) * 100));
  $('xp-bar').style.width = pct + '%';
  $('cur-xp').textContent = state.xp;
  $('max-xp').textContent = level.max;
  $('user-level').textContent = idx + 1;
  $('user-title').textContent = level.name;
}

// Awards any newly earned badges (with a short delay so the popup doesn't
// collide with the action's own feedback).
export function checkBadges() {
  BADGES.forEach(badge => {
    if (state.earnedBadges.includes(badge.id)) return;
    if (!badge.isEarned(state)) return;
    state.earnedBadges.push(badge.id);
    setTimeout(() => {
      toast(`🏅 成就解鎖：${badge.name}！`);
      addXP(XP_REWARDS.badge, '🏅', '成就解鎖！', badge.name);
      bus.emit('state:changed');
    }, 600);
  });
}

export function renderBadges() {
  $('badge-grid').innerHTML = BADGES.map(b => {
    const earned = state.earnedBadges.includes(b.id);
    return `<div class="bdg ${earned ? 'earned' : ''}"><div class="bdg-ic">${b.icon}</div><div class="bdg-nm">${b.name}</div></div>`;
  }).join('');
}
