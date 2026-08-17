// FitFit service worker: precache the app shell, serve same-origin requests
// stale-while-revalidate. Bump VERSION on every release to invalidate.
const VERSION = 'fitfit-v2.0.0';

const PRECACHE = [
  '.',
  'index.html',
  'manifest.webmanifest',
  'assets/icons/app-icon.png',
  'assets/icons/app-icon-192.png',
  'assets/icons/app-icon-maskable.png',
  'css/tokens.css',
  'css/base.css',
  'css/layout.css',
  'css/components.css',
  'css/features/background.css',
  'css/features/home.css',
  'css/features/workout.css',
  'css/features/videos.css',
  'css/features/camera.css',
  'css/features/insights.css',
  'css/features/feedback.css',
  'js/main.js',
  'js/config.js',
  'js/core/state.js',
  'js/core/storage.js',
  'js/core/events.js',
  'js/data/badges.js',
  'js/data/levels.js',
  'js/data/phases.js',
  'js/data/videos.js',
  'js/services/ai.js',
  'js/services/drive.js',
  'js/utils/dom.js',
  'js/utils/time.js',
  'js/utils/health.js',
  'js/utils/image.js',
  'js/features/background.js',
  'js/features/bmi.js',
  'js/features/camera.js',
  'js/features/coach.js',
  'js/features/fasting.js',
  'js/features/feedback.js',
  'js/features/food.js',
  'js/features/gamification.js',
  'js/features/goals.js',
  'js/features/home.js',
  'js/features/navigation.js',
  'js/features/reminders.js',
  'js/features/settings.js',
  'js/features/sleep.js',
  'js/features/videos.js',
  'js/features/workout.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Same-origin GET only — API calls (Anthropic, Google) always hit the network.
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;

  e.respondWith(
    caches.open(VERSION).then(async cache => {
      const cached = await cache.match(e.request);
      const refresh = fetch(e.request)
        .then(res => {
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || refresh;
    })
  );
});
