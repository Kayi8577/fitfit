# FitFit ✨

拍照識別卡路里的健康管理 App — 飲食記錄、運動計畫、睡眠追蹤、BMI/TDEE 計算、XP 遊戲化成就系統。

Refactored from a single-file prototype into a modular, no-build-step vanilla JS project (ES modules).

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
├── manifest.webmanifest    # PWA manifest (installable on iOS/Android home screen)
├── assets/
│   ├── icons/app-icon.png  # App icon (512×512, extracted from the old base64 blob)
│   ├── images/             # Drop illustrations, food photos, backgrounds here
│   └── fonts/              # Drop self-hosted fonts here (currently Google Fonts)
├── css/
│   ├── tokens.css          # Design tokens (colors, radii, shadows) — theme here
│   ├── base.css            # Reset + global defaults
│   ├── layout.css          # App shell, bottom nav, header, FAB
│   ├── components.css      # Reusable UI: cards, chips, buttons, forms, lists…
│   └── features/           # One stylesheet per feature area
└── js/
    ├── main.js             # Entry point: action registry, renderAll, boot
    ├── config.js           # Storage key, AI settings, XP reward table
    ├── data/               # Static content: levels, phases, videos, badges
    ├── core/               # state.js (single source of truth), storage.js, events.js
    ├── services/ai.js      # Anthropic API client (photo analysis + coach)
    ├── utils/              # dom.js ($, esc), time.js
    └── features/           # One module per feature (camera, food, workout…)
```

## Architecture

- **Single state object** (`js/core/state.js`) holds all app data.
- **Unidirectional flow**: a feature mutates `state`, then emits `state:changed`
  on the event bus → `main.js` checks badges, re-renders every section, and
  persists to `localStorage`. Features never call each other's render functions.
- **No inline `onclick`**: every clickable element declares `data-action="…"`
  (plus `data-index` / `data-cat` / … as arguments). A single delegated listener
  in `main.js` maps actions to handlers — works for dynamically rendered HTML too.
- **Data lives in `js/data/`**: workout phases, video library, badges and levels
  are plain data files. Editing content never touches logic.

## How to extend

| I want to… | Edit |
|---|---|
| Change colors / theme | `css/tokens.css` |
| Add a workout phase or exercise | `js/data/phases.js` |
| Add a recommended video | `js/data/videos.js` |
| Add an achievement badge | `js/data/badges.js` (icon + condition; UI updates automatically) |
| Rebalance XP rewards | `js/config.js` → `XP_REWARDS` |
| Add a new button/action | Add `data-action` in HTML/template + one entry in the registry in `js/main.js` |
| Add images / fonts | Drop into `assets/images` or `assets/fonts` and reference by relative path |

## AI features (photo calories & coach)

`js/services/ai.js` calls the Anthropic API (`claude-sonnet-5`). To enable it,
set your key in `js/config.js`:

```js
export const AI = { …, apiKey: 'sk-ant-…' };
```

Notes:

- The request includes the `anthropic-dangerous-direct-browser-access` header,
  which is required for direct browser calls. Only do this for personal/local
  use — **never ship an API key in a public site**. For production, proxy the
  call through a small backend.
- Without a key, photo analysis gracefully falls back to manual entry, and the
  coach shows a connection error.

## Data & privacy

All records are stored locally in `localStorage` (key `health_mgr_v1`).
Food/exercise logs reset each day; sleep, weight, XP and badges persist.
