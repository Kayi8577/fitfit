// Transient UI feedback: toast, XP popup, confetti burst.

import { $ } from '../utils/dom.js';

export function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2400);
}

export function showXPPop(emoji, title, subtitle, amount) {
  const pop = $('xppop');
  $('xp-em').textContent = emoji;
  $('xp-t').textContent = title;
  $('xp-s').textContent = subtitle;
  $('xp-x').textContent = '+' + amount + ' XP';
  pop.classList.add('show');
  setTimeout(() => pop.classList.remove('show'), 2200);
}

export function confetti() {
  ['#5b9bd5', '#7ba7e8', '#4ec3e0', '#90c8f0', '#2f6fb0'].forEach(color => {
    for (let j = 0; j < 4; j++) {
      const el = document.createElement('div');
      el.className = 'cf';
      el.style.cssText = `left:${15 + Math.random() * 70}%;top:${15 + Math.random() * 35}%;background:${color};animation-delay:${Math.random() * .5}s;animation-duration:${.8 + Math.random() * .8}s;transform:rotate(${Math.random() * 360}deg);`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1600);
    }
  });
}
