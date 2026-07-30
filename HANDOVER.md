# PulseCap — Handover

> Read this + `ROADMAP.md` + `~/Capricorn-Brain/01 Projects/PulseCap.md` before working here.
> Last updated: 2026-07-30 · Fleet-wide standard: `capricorn-tooling/shared/CAP-STANDARD.md`

## What this is
Smart Coach fitness OS — **offline PWA only** (no native HealthKit / Live Activity / widgets planned). Workouts, nutrition, recovery, anatomy, 30+ modules.

## Facts
**Version:** 6.5.1
**SW cache:** `pulsecap-v84`
**Live:** https://shamikhahmed.github.io/PulseCap
**Repo:** https://github.com/shamikhahmed/PulseCap
**Stack:** Vanilla JS PWA. Module registry (`reg()` pattern). Playwright viewport QA.
**Data:** Local storage (+ IndexedDB for progress photos). Profiles are local-per-device.
**IA docs:** `AUDIT.md`, `IA-RATIONALE.md`, `docs/SCREEN-GALLERY.md`

## Run & verify
```bash
python3 -m http.server 8766   # or npm run serve
npx playwright test           # current suite
npm run gallery               # regen 200-shot matrix: dark+light × mobile+desktop
open screen-gallery.html      # Dark/Light + viewport + section filters
```

## Sample personas
- `S.seedPersonas(force, activate)` seeds 5 demo athletes (`demo_beginner/strong/injured/cutter/senior`) defined in `DEMO_PERSONAS` (`js/storage.js`). Each lives in its own `fos_profiles_<id>` bucket; never touches real profiles.
- UI: Profiles → "Load sample athletes". QA: `tests/functional.spec.js` sweeps every screen + core actions per profile.

## Screen gallery
- Matrix = every screen + sub-tab + welcome/intro + 7 onboarding steps + active workout, in **dark & light × mobile & desktop**.
- **VaultCap-style scroll:** when `#view` overflows ≥80px, companion `*-scroll.png` (bottom of scroll). Viewer: Include scroll / Scroll only.
- Driven by `tests/gallery.spec.js` (`CAPTURE_GALLERY=1` / `npm run gallery`).
- Manifest fields: `theme`, `viewport`, `section`, `screenId`, `label`, `route`, `scroll`.

## Architecture
- `js/app.js` — shell, router (`go()` + lazy `MODULE_SRC`), helpers, nav
- `js/engines.js` — Program / Recap / Plate / RestNotify / Weight / Muscle / …
- `js/coach-kernel.js` — Autoreg / VolumeLander / JointBudget / Mesocycle / CoachKernel / GymFloor
- `js/gym-tools.js` — WakeLock / VoiceLogger / BarcodeFood / MobilityFlow / PainFlag
- `js/data/foods-db.js` — offline food macros
- `js/modules/` — feature screens (Learn deep-screens load on demand)
- `js/data/form-loops.js` — honest offline form **cues** (not videos) + `isBarbell()`
- `js/data/exercise-library.js` — optional wger.de download for real form clips
- Desktop sidebar + mobile glass tab bar (Today · Train · Body · Learn · Me)

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
| `SplitEngine` | Schedule, skip-day, custom split, ranked swaps |

## Gotchas — read before coding
- PWA-only — do not add Cap HealthKit / Live Activity / WidgetKit unless owner reverses.
- Form cues ≠ video. Real clips need wger download once online.
- Rest notifications need Add to Home Screen on iOS; never `requestPermission` mid-workout.
- Dates: always `localISO()` / `today()`.
- Settings version footer uses `window.APP_VERSION`.
- Deprecated routes use `SCREEN_ALIASES` only — old `reg()` handlers removed in v6.2.0.
- Glass floating nav is current truth (V5.2-PLAN WS12).

## Where decisions live
- Capricorn-Brain project note
- `CHANGELOG.md` / `docs/V6-NORTHSTAR.md` / `ROADMAP.md`
