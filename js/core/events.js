// Minimal pub/sub bus so feature modules stay decoupled.
// Convention: after mutating `state`, emit 'state:changed' —
// main.js listens and handles re-render + badge check + persistence.

const listeners = new Map();

export const bus = {
  on(event, handler) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event).add(handler);
  },
  off(event, handler) {
    listeners.get(event)?.delete(handler);
  },
  emit(event, payload) {
    listeners.get(event)?.forEach(handler => handler(payload));
  },
};
