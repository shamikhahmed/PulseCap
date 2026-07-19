# PulseCap — CLAUDE.md

## Current truth
- Version: 6.2.1
- App type: offline-first **PWA only**. No native shell, HealthKit, Live Activity, WidgetKit, or RevenueCat unless owner reverses.
- Stack: vanilla JS, no framework, no bundler.
- Router: `reg('screen', fn)` + synchronous `go('screen')`.
- Data: `localStorage` via `S`; IndexedDB only for progress photos.
- Security: CSP meta exists in `index.html`; keep it aligned with wger sync.
- Coach naming: **Smart Coach** / Coach Insights. Do not use unbacked AI claims unless a real LLM is integrated.
- v6 spine: `js/coach-kernel.js` + `js/gym-tools.js` + `js/data/foods-db.js` (see `docs/V6-NORTHSTAR.md`).

## Required checks
- `node --check` changed JS.
- `npx playwright test` before commit.
- Bump `VERSION.json`, `window.APP_VERSION`, `sw.js` cache, and `index.html` SW register query together.
- Update `CHANGELOG.md`, `changelog.html`, `HANDOVER.md`, Brain note after meaningful work.

## Key files
- `js/app.js` — router + engines
- `js/storage.js` — profile/localStorage data
- `js/coach-kernel.js` — autoreg / volume / joints / meso / GymFloor
- `js/gym-tools.js` — WakeLock / VoiceLogger / BarcodeFood / MobilityFlow / PainFlag
- `js/modules/workout.js` — exercise DB + active logger
- `js/modules/dashboard.js` — Today screen
- `js/modules/coach.js` — Smart Coach screen
- `js/data/exercise-library.js` — wger sync
- `js/data/form-loops.js` — honest form cues (not video)
- `sw.js` — cache allowlist

## Gotchas
- Escape user strings. `esc()` must cover attribute contexts; avoid user data inside inline handlers where possible.
- wger needs CSP `connect-src/img-src/media-src https://wger.de`.
- Rest notifications only work after Add to Home Screen on iOS.
- Form cues are not videos; real clips require wger library download.
