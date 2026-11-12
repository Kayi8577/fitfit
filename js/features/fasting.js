// Intermittent-fasting window calculator (times persist across visits).

import { state } from '../core/state.js';
import { bus } from '../core/events.js';
import { $ } from '../utils/dom.js';
import { minutesBetween } from '../utils/time.js';

export function initFasting() {
  $('if-s').value = state.fasting.s;
  $('if-e').value = state.fasting.e;
  $('if-s').addEventListener('change', onChange);
  $('if-e').addEventListener('change', onChange);
}

function onChange() {
  state.fasting.s = $('if-s').value || state.fasting.s;
  state.fasting.e = $('if-e').value || state.fasting.e;
  updateFastingInfo();
  bus.emit('state:changed');
}

export function updateFastingInfo() {
  const start = $('if-s').value, end = $('if-e').value;
  if (!start || !end) return;
  const eatingHours = Math.round(minutesBetween(start, end) / 60 * 10) / 10;
  const fastingHours = Math.round((24 - eatingHours) * 10) / 10;
  $('if-info').innerHTML =
    `進食窗口：<strong style="color:var(--primary-deep)">${eatingHours}小時</strong> · 斷食：<strong style="color:var(--lavender)">${fastingHours}小時</strong>${eatingHours <= 8 ? ' ✓ 達到16/8建議' : ''}`;
}
