# PulseCap — CLAUDE.md

## Current truth
- Version: 6.44.0
- App type: offline-first **PWA only**. No native shell, HealthKit, Live Activity, WidgetKit, or RevenueCat unless owner reverses.
- Stack: vanilla JS, no framework, no bundler.
- Router: `reg('screen', fn)` + synchronous `go('screen')`. Same-screen `go()` preserves scroll and focus unless `resetScroll` or a tab change.
- `js/core/equipment.js` — kit fallback + `equipmentIds` by machine type
- Data: `localStorage` via `S`; IndexedDB only for progress photos.
- Security: CSP meta exists in `index.html`; keep it aligned with wger sync.
- Coach naming: **Smart Coach** / Coach Insights. Do not use unbacked AI claims unless a real LLM is integrated.
- v6 spine: `js/core/profile.js` + `js/core/engine.js` + `js/coach-kernel.js` + `js/training-plan.js` + `js/gym-tools.js` + `js/data/foods-db.js` (see `docs/V6-NORTHSTAR.md`).
- Ember IA: Today · Train · Progress · Programs · Me. No 1RM estimator. Smart Coach = rules.

## Required checks
- `node --check` changed JS.
- `npx playwright test` before commit.
- Bump `VERSION.json`, `window.APP_VERSION`, `sw.js` cache, and `index.html` SW register query together.
- Update `CHANGELOG.md`, `changelog.html`, `HANDOVER.md`, Brain note after meaningful work.

## Key files
- `js/app.js` — router + engines
- `js/core/nutrition-math.js` — Mifflin-St Jeor + g/kg macros
- `js/core/equipment.js` — kit fallback + `equipmentIds` by machine type; joint filters
- `js/data/plans/catalog.js` — public templates + matcher
- `js/core/engine.js` — EmberEngine facade
- `js/storage.js` — profile/localStorage data
- `js/training-plan.js` — opt-in training plans
- `js/plan-import.js` — local PDF/JSON import
- `js/coach-kernel.js` — autoreg / volume / joints / meso / GymFloor
- `js/gym-tools.js` — WakeLock / VoiceLogger / BarcodeFood / MobilityFlow / PainFlag
- `js/data/exercise-db.js` — canonical ExDB, 1,872 entries — GENERATED: edit `scripts/exercise-additions.mjs` / `exercise-links.mjs` / vendor data, then `node scripts/build-regressions.mjs`
- `js/data/training-guide.js` — Training Guide methods + goals; `js/data/workout-library.js` — 30 ready workouts
- `js/modules/workout.js` — ExDB methods + active logger
- `js/modules/dashboard.js` — Today screen
- `js/modules/coach.js` — Smart Coach screen
- `js/data/exercise-library.js` — wger sync
- `js/data/form-loops.js` — honest form cues (not video)
- `js/data/plans/machine-ppl.js` — machine-only shoulder-safe PPL
- `sw.js` — cache allowlist

## Gotchas
- Escape user strings. `esc()` must cover attribute contexts; avoid user data inside inline handlers where possible.
- wger needs CSP `connect-src/img-src/media-src https://wger.de`.
- Rest notifications only work after Add to Home Screen on iOS.
- Form cues are not videos; real clips require wger library download.
- Plan import: text PDF/JSON/paste only — scanned PDFs unsupported (no OCR); no upload.
- Programs / Rehab / Smart Coach = educational, not medical clearance.
- Imported Exercises Library rows (`src:'el'`) are MIT text. Animations/thumbs (`ex.media`) are © Gym visual, shown under the owner's licence: keep the on-screen credit, 180×180 max, hotlink the pinned jsDelivr commit only — never bundle or precache. Don't copy ExerciseDB (paid API).
- Local preview: `node scripts/static-server.mjs <port>` (no-store). python http.server + SW serves stale JS.
