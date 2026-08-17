# FitFit ✨

拍照識別卡路里的健康管理 App — 飲食記錄、運動計畫、睡眠追蹤、BMI/TDEE 計算、XP 遊戲化成就系統。

Modular, no-build-step vanilla JS PWA (ES modules). 可安裝到手機主畫面、支援離線開啟。

## Getting started

ES modules require the app to be served over HTTP (opening `index.html` directly via `file://` will not work in Chrome). Pick either:

```bash
# option A — Python (preinstalled on macOS)
python3 -m http.server 3000

# option B — Node
npm start
```

Then open http://localhost:3000

## Project structure

```
fitfit/
├── index.html              # Markup only — no inline JS; buttons declare data-action
├── sw.js                   # Service worker: precache + stale-while-revalidate (offline)
├── manifest.webmanifest    # PWA manifest (192/512/maskable icons)
├── assets/icons/           # App icons
├── css/
│   ├── tokens.css          # Design tokens (colors, radii, shadows) — theme here
│   ├── base.css            # Reset + button reset + reduced-motion + global defaults
│   ├── layout.css          # App shell, bottom nav, header, FAB
│   ├── components.css      # Reusable UI: cards, chips, buttons, forms, lists…
│   └── features/           # One stylesheet per feature area
├── js/
│   ├── main.js             # Entry point: action registry, per-section rendering, boot
│   ├── config.js           # Storage keys, AI endpoint, XP reward table
│   ├── data/               # Static content: levels, phases, videos, badges
│   ├── core/               # state.js (single source of truth), storage.js, events.js
│   ├── services/           # ai.js (Anthropic client), drive.js (Google Drive backup)
│   ├── utils/              # dom.js, time.js, health.js (pure math), image.js
│   └── features/           # One module per feature (camera, food, workout…)
└── tests/                  # node:test unit tests for the pure modules
```

## Architecture

- **Single state object** (`js/core/state.js`) holds all app data.
- **Unidirectional flow**: a feature mutates `state`, then emits `state:changed`
  on the event bus → `main.js` checks badges, re-renders the visible section
  (others are marked dirty and render on navigation), and persists to
  `localStorage`.
- **No inline JS**: every clickable element declares `data-action="…"`. A
  delegated click + keydown listener in `main.js` maps actions to handlers —
  actionable elements are real `<button>`s (or `role="button"` + `tabindex`),
  so everything is keyboard-accessible.
- **Day/week rollover** happens once, at load (`js/core/storage.js`): daily
  food/exercise logs are settled into `history` (per-day summaries) and
  cleared; weekly plan check-ins reset when the ISO week changes; the streak
  breaks unless the last workout was today or yesterday.
- **Hash routing**: the active tab lives in `location.hash`, so refresh keeps
  your place and the Android back button navigates instead of exiting.

## How to extend

| I want to… | Edit |
|---|---|
| Change colors / theme | `css/tokens.css` |
| Add a workout phase or exercise | `js/data/phases.js` |
| Add a recommended video | `js/data/videos.js` (set `cats` for the category tabs) |
| Add an achievement badge | `js/data/badges.js` (icon + condition; UI updates automatically) |
| Rebalance XP rewards | `js/config.js` → `XP_REWARDS` |
| Add a new button/action | Add `data-action` in HTML/template + one entry in the registry in `js/main.js` |

After adding/renaming files, also update the precache list in `sw.js` and bump
its `VERSION`.

## AI features (photo calories & coach)

`js/services/ai.js` calls the Anthropic API. **The key is never stored in
source code** — enter it in the app under 更多 → AI 設定. It is kept in this
device's `localStorage` only and is excluded from exports and Drive backups.

Notes:

- Photos are downscaled to ≤1024px JPEG client-side before upload (fast,
  cheap, avoids HEIC rejection).
- The request includes the `anthropic-dangerous-direct-browser-access` header,
  required for direct browser calls. Only do this for personal/local use —
  **never ship an API key in a public site**. For production, proxy the call
  through a small backend.
- Without a key, photo analysis falls back to manual entry and the coach
  shows a hint instead of burning a doomed request.
- If the model's reply can't be parsed, the app falls back to manual entry —
  it never fabricates nutrition numbers.

## Data, backup & privacy

- All records live in `localStorage` (key `health_mgr_v1`). Food/exercise
  logs reset each day (settled into a 60-day `history`); sleep, weight, XP
  and badges persist.
- **匯出/匯入 JSON**（更多 → 資料備份）— download a full snapshot or restore
  from one. Do this periodically: iOS Safari may evict site data after 7 days
  of non-use for non-installed sites.
- **Google Drive 備份** — stores the same snapshot in your Drive's hidden
  *application data folder* (invisible in the Drive UI, `drive.appdata`
  scope only). Backups never include your API key.

### Google Drive setup (one-time)

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → create a
   project.
2. **APIs & Services → Library** → enable **Google Drive API**.
3. **APIs & Services → OAuth consent screen** → External → add yourself as a
   test user.
4. **APIs & Services → Credentials → Create credentials → OAuth client ID** →
   type **Web application** → add your site's origin (e.g.
   `http://localhost:3000` or your HTTPS domain) under **Authorized
   JavaScript origins**.
5. Copy the client ID (`…apps.googleusercontent.com`) into 更多 → 資料備份 →
   Client ID, then hit ☁️ 備份.

The page must be served over HTTPS (localhost is exempt) — `file://` will not
work.

## Development

```bash
npm install     # dev deps (eslint) only — the app itself has zero dependencies
npm run lint    # eslint over js/, sw.js, tests/
npm test        # node:test unit tests for pure modules (time, health math, data, levels)
```

CI (GitHub Actions) runs both on every push/PR.

## Disclaimer

熱量估算、TDEE/減脂目標與 AI 建議僅供參考，非醫療建議；有健康疑慮請諮詢醫師或營養師。
