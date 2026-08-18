// Weekday labels, Monday-first (matches the plan grid).
export const DAYS = ['一', '二', '三', '四', '五', '六', '日'];

// Index into a Monday-first 7-slot week for today.
export function todayIndex(date = new Date()) {
  const d = date.getDay();
  return d === 0 ? 6 : d - 1;
}

// Local date as 'YYYY-MM-DD' (local time — toISOString would shift near midnight).
export function dateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function yesterdayKey(date = new Date()) {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return dateKey(d);
}

// Monday of the given date's week, as a date key — identifies the week
// so weekly stats (weekDone/weekMins) reset on week change, not day change.
export function weekKey(date = new Date()) {
  const d = new Date(date);
  d.setDate(d.getDate() - todayIndex(d));
  return dateKey(d);
}

// 'YYYY-MM-DD' → 'M/D' for compact chart labels.
export function shortLabel(key) {
  const [, m, d] = String(key).split('-');
  return `${Number(m)}/${Number(d)}`;
}

// Minutes from "HH:MM" to "HH:MM", wrapping past midnight.
export function minutesBetween(start, end) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins < 0) mins += 1440;
  return mins;
}
