// Weekday labels, Monday-first (matches the plan grid).
export const DAYS = ['一', '二', '三', '四', '五', '六', '日'];

// Index into a Monday-first 7-slot week for today.
export function todayIndex() {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

// Minutes from "HH:MM" to "HH:MM", wrapping past midnight.
export function minutesBetween(start, end) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins < 0) mins += 1440;
  return mins;
}
