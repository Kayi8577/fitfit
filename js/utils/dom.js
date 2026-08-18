export const $ = id => document.getElementById(id);

// Escape user-entered text before injecting it into innerHTML templates.
export function esc(value) {
  return String(value).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

// Read a numeric input, clamped to a sane range. Returns `def` (default 0)
// when empty or not a number — callers treat 0 as "missing".
export function numVal(id, { min = 0, max = Infinity, def = 0 } = {}) {
  const n = parseFloat($(id)?.value);
  if (!Number.isFinite(n)) return def;
  return Math.min(max, Math.max(min, n));
}
