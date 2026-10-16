# PulseCap — Handover

> Read this + `ROADMAP.md` + `~/Capricorn-Brain/01 Projects/PulseCap.md` before working here.
> Last updated: 2026-10-15 · Fleet-wide standard: `capricorn-tooling/shared/CAP-STANDARD.md`

## What this is
Offline-first training app — **PWA only** (no native HealthKit / Live Activity / widgets planned). Ember IA: Today · Train · Progress · Programs · Me.

## Facts
**Version:** 6.46.2
**SW cache:** `pulsecap-v131`
**Live:** https://shamikhahmed.github.io/PulseCap
**Repo:** https://github.com/shamikhahmed/PulseCap
**Stack:** Vanilla JS PWA. Module registry (`reg()` pattern). Playwright viewport QA.
**Data:** Local storage (+ IndexedDB for progress photos). Profiles are local-per-device.
**IA docs:** `AUDIT.md`, `IA-RATIONALE.md`, `docs/SCREEN-GALLERY.md`

## Run & verify
```bash
node scripts/static-server.mjs 8766   # no-store; python http.server serves stale JS to the SW
npx playwright test           # current suite
npm run gallery               # regen ~176-shot matrix: dark+light × mobile+desktop (--project=chromium)
open screen-gallery.html      # Dark/Light + viewport + section filters
```

## Sample personas
- `S.seedPersonas(force, activate)` seeds 5 demo athletes (`demo_beginner/strong/injured/cutter/senior`) defined in `DEMO_PERSONAS` (`js/storage.js`). Each lives in its own `fos_profiles_<id>` bucket; never touches real profiles.
- UI: Profiles → "Load sample athletes". QA: `tests/functional.spec.js` sweeps every screen + core actions per profile.

## Screen gallery
- Matrix = every screen + sub-tab + 1 intro + 4 onboarding steps + active workout, in **dark & light × mobile & desktop**.
- **VaultCap-style scroll:** when `#view` overflows ≥80px, companion `*-scroll.png` (bottom of scroll). Viewer: Include scroll / Scroll only.
- Driven by `tests/gallery.spec.js` (`CAPTURE_GALLERY=1` / `npm run gallery`).
- Manifest fields: `theme`, `viewport`, `section`, `screenId`, `label`, `route`, `scroll`.

## Architecture
- `js/app.js` — shell, router (`go()` + lazy `MODULE_SRC`). Same-screen `go()` preserves scroll and focus unless `resetScroll` or a Settings tab change.
- `js/engines.js` — Program / Recap / Plate / RestNotify / Weight / Muscle / …
- `js/coach-kernel.js` — Autoreg / VolumeLander / JointBudget / Mesocycle / CoachKernel / GymFloor
- `js/training-plan.js` — opt-in `trainingPlan` (rotation, deload, double progression, safety)
- `js/plan-import.js` — local JSON / text-PDF / paste → review UI. No upload. No OCR (scanned PDFs rejected).
- `js/gym-tools.js` — WakeLock / VoiceLogger / BarcodeFood / MobilityFlow / PainFlag
- `js/data/exercise-db.js` — canonical exercise library, **1,872 entries** (ids, 8 joints, patterns, MET, steps, easier/harder). Generated — edit the sources, then run `node scripts/build-regressions.mjs` (idempotent; validates every link):
  - `scripts/exercise-additions.mjs` — hand-written rows (skills, kettlebell, TRX, Olympic, strongman, yoga, Pilates, rehab, sports…)
  - `scripts/vendor/exercises-library.en.json` — English subset of the MIT **Exercises Library**. Rows carry `src: 'el'`; `media` (`0025-EIeI8Vf`) points at its © Gym visual animation — shown under the owner's licence via `exMediaUrl()` (pinned jsDelivr commit, 180×180, credit always visible, never bundled/precached). See `THIRD-PARTY-NOTICES.md`.
  - `scripts/exercise-import.mjs` — normalizes/dedupes and fills joints, MET, mistakes from the movement pattern
  - `scripts/exercise-links.mjs` + `CURATED` maps — hand-picked easier/harder links; `scripts/exercise-steps.mjs` — hand-written steps
- `js/data/workout-library.js` — 30 ready workouts (`go('library')`); `js/data/training-guide.js` — methods + goals (`go('guide')`)
- `js/data/foods-db.js` — 235 sourced foods (USDA + Karachi staples)
- `js/core/nutrition-math.js` — Mifflin-St Jeor + g/kg macros
- `js/core/equipment.js` — kit fallback, `equipmentIds` by machine type, 8-joint filters, gap banners
- `js/modules/` — Ember screens (Today / Train / Progress / Programs / Me)
- `js/data/form-loops.js` — honest offline form **cues** (not videos) + `isBarbell()`
- `js/data/exercise-library.js` — optional wger.de download for real form clips
- Desktop sidebar + mobile tab bar (Today · Train · Progress · Programs · Me)
- `js/core/profile.js` — deriveContext spine
- `js/core/engine.js` — EmberEngine facade

## Cap Standard status (2026-07-18)
| Cap Standard item | Status |
|---|---|
| Docs pack | ✅ |
| Screen gallery | ✅ VaultCap-style + active workout |
| Version discipline | ✅ VERSION.json ↔ APP_VERSION ↔ SW/register query |
| QA / e2e | ✅ smoke + flows + functional + gallery walk + viewport |
| CI gate | ✅ Playwright on push + `pages-gate` on main |
| PWA polish | ✅ shortcuts + rest notify (installed only) |
| Demo mode | ✅ `?demo=1` |

## Engines worth knowing
| Engine | Role |
|---|---|
| `CoachKernel` / kernel engines | Today focus, RPE autoreg, volume, joints, meso, push/pull |
| `WakeLock` / `VoiceLogger` / `BarcodeFood` / `MobilityFlow` / `PainFlag` | Gym-floor helpers (`js/gym-tools.js`) |
| `ProgramEngine` | Stronglifts / SS / 5/3/1 + starting-weight confirm |
| `RecapEngine` | Weekly stats + goal-aware coachReport |
| `PlateEngine` | Barbell → plates per side (barbell compounds only in UI) |
| `RestNotify` | Background rest banner — **installed PWA only** |
| `WeightEngine.warmupSets` | 40/60/80% ramp (barbell only in UI) |
| `FormLoops` | Offline form **cues** + `isBarbell()` |
| `TrainingPlanEngine` | Opt-in program: rotation, deload, double progression, ROM/safety |
| `PlanImport` | On-device JSON / text-PDF / paste → review → `trainingPlan` (no OCR) |

## Gotchas — read before coding
- PWA-only — do not add Cap HealthKit / Live Activity / WidgetKit unless owner reverses.
- Form cues ≠ video. Real clips need wger download once online.
- Rest notifications need Add to Home Screen on iOS; never `requestPermission` mid-workout.
- Plan import: text extract only — scanned/image PDFs unsupported; never claim OCR or cloud upload.
- Smart Coach = rules, not LLM. My Plan / Rehab = educational, not medical clearance.
- Dates: always `localISO()` / `today()`.
- Settings version footer uses `window.APP_VERSION`.
- Deprecated routes use `SCREEN_ALIASES` only — old `reg()` handlers removed in v6.2.0.
- Glass floating nav is current truth (V5.2-PLAN WS12).
- Exercise sheet (`showExerciseDetail`) is an iOS page sheet: tab changes and easier/harder links update the open sheet (`exSheetTab` / `exSheetPush` / `exSheetBack`) — never call `modal()` again for those. Training Guide sheets reuse it.
- New gear tags (rings, trx, stability_ball, foam_roller, ab_wheel, bosu, box, medball, sled, sandbag, ghd, rope, battle_rope, strongman, plate) are `Equipment.APPARATUS` — they gate bodyweight moves too. Cardio machine tags stay informational.
- Browse shows every exercise (equipment = filter); injury-avoid moves stay hidden. Search input must only update `#ex-browse-list` (iOS keyboard).
- ExerciseDB (exercisedb.dev) is a paid API with no open data licence — don't copy from it.

## Where decisions live
- Capricorn-Brain project note
- `CHANGELOG.md` / `docs/V6-NORTHSTAR.md` / `ROADMAP.md`
