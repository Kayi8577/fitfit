// Intermittent-fasting window calculator.

import { $ } from '../utils/dom.js';
import { minutesBetween } from '../utils/time.js';

export function initFasting() {
  $('if-s').addEventListener('change', updateFastingInfo);
  $('if-e').addEventListener('change', updateFastingInfo);
}

export function updateFastingInfo() {
  const start = $('if-s').value, end = $('if-e').value;
  if (!start || !end) return;
  const eatingHours = Math.round(minutesBetween(start, end) / 60 * 10) / 10;
  const fastingHours = Math.round((24 - eatingHours) * 10) / 10;
  $('if-info').innerHTML =
    `進食窗口：<strong style="color:var(--mint2)">${eatingHours}小時</strong> · 斷食：<strong style="color:var(--lavender)">${fastingHours}小時</strong>${eatingHours <= 8 ? ' ✓ 達到16/8建議' : ''}`;
}
