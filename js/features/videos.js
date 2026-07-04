// Workout video recommendations, filtered by category or today's plan.

import { PHASES } from '../data/phases.js';
import { VIDEOS, VIDEO_CATEGORIES } from '../data/videos.js';
import { state } from '../core/state.js';
import { $, esc } from '../utils/dom.js';
import { todayIndex } from '../utils/time.js';

const LEVEL_CHIP_CLASS = { easy: 'cm', medium: 'co', hard: 'cp' };
const LEVEL_LABEL = { easy: '初階', medium: '中階', hard: '進階' };

function getVideosFor(category) {
  if (category === 'cardio') return [...VIDEOS.easy, ...VIDEOS.medium];
  if (category === 'hiit') return VIDEOS.medium.concat(VIDEOS.hard);
  if (category === 'yoga') return VIDEOS.recovery;
  if (category === 'recovery') return VIDEOS.recovery;

  // 'today': match today's planned workout intensity
  const workout = PHASES[state.currentPhase].plan[todayIndex()];
  if (!workout) return VIDEOS.recovery;
  if (workout.level === 'easy') return VIDEOS.easy;
  if (workout.level === 'medium') return VIDEOS.medium;
  return VIDEOS.hard.concat(VIDEOS.medium);
}

function videoCard(v, featured = false) {
  return `<div class="vc ${featured ? 'feat' : ''}" data-action="openVideo" data-url="${v.url}">
    <div class="vc-thumb"><img src="${v.th}" onerror="this.style.display='none'" alt="${esc(v.title)}" loading="lazy"><div class="play-btn">▶</div></div>
    <div class="vc-info">
      <div style="display:flex;gap:5px;flex-wrap:wrap"><span class="chip ${LEVEL_CHIP_CLASS[v.level]}">${LEVEL_LABEL[v.level]}</span>${v.tags.slice(0, 2).map(t => `<span class="chip cs">${t}</span>`).join('')}${featured ? '<span class="chip co">⭐ 今日精選</span>' : ''}</div>
      <div class="vc-title">${esc(v.title)}</div>
      <div class="vc-chan">📺 ${esc(v.channel)}</div>
      <div class="vc-meta"><span>⏱ ${v.dur}</span><span>🔥 約${v.kcal}kcal</span></div>
      <button class="open-btn">在 YouTube 觀看 ↗</button>
    </div>
  </div>`;
}

export function renderCategoryTabs() {
  $('cat-tabs').innerHTML = VIDEO_CATEGORIES.map(c =>
    `<div class="ctab ${c.id === state.currentCategory ? 'active' : ''}" data-action="setCategory" data-cat="${c.id}">${c.label}</div>`
  ).join('');
}

export function setCategory(categoryId) {
  state.currentCategory = categoryId;
  renderCategoryTabs();
  renderVideos();
}

export function renderVideos() {
  const vids = getVideosFor(state.currentCategory);
  $('vids-today').innerHTML = vids.slice(0, 2).map((v, i) => videoCard(v, i === 0)).join('') || '<div class="empty">暫無影片</div>';
  $('vids-more').innerHTML = vids.slice(2).map(v => videoCard(v)).join('') || '<div class="empty">暫無更多</div>';
}
