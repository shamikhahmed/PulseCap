# PulseCap — Handover

> Read this + `ROADMAP.md` + `~/Capricorn-Brain/01 Projects/PulseCap.md` before working here.
> Last updated: 2026-07-17 · Fleet-wide standard: `capricorn-tooling/shared/CAP-STANDARD.md`

## What this is
Smart Coach fitness OS — **offline PWA only** (no native HealthKit / Live Activity / widgets planned). Workouts, nutrition, recovery, anatomy, 30+ modules.

## Facts
**Version:** 5.5.1
**SW cache:** `pulsecap-v57`
**Live:** https://shamikhahmed.github.io/PulseCap
**Repo:** https://github.com/shamikhahmed/PulseCap
**Stack:** Vanilla JS PWA. Module registry (`reg()` pattern). Playwright viewport QA.
**Data:** Local storage (+ IndexedDB for progress photos). Profiles are local-per-device.

## Run & verify
```bash
python3 -m http.server 8766   # or npm run serve
npx playwright test           # current suite
npm run gallery               # regenerate screen shots (includes active workout)
open screen-gallery.html
```

## Architecture
- `js/app.js` — shell, router (`go()`), engines (Program / Recap / Plate / RestNotify / Weight / Muscle / …)
- `js/modules/` — feature screens
- `js/data/form-loops.js` — honest offline form **cues** (not videos) + `isBarbell()`
- `js/data/exercise-library.js` — optional wger.de download for real form clips
- Desktop sidebar + mobile glass tab bar (Today · Train · Body · Learn · Me)

## Cap Standard status (2026-07-17)
| Cap Standard item | Status |
|---|---|
| Docs pack | ✅ |
| Screen gallery | ✅ VaultCap-style + active workout |
| Version discipline | ✅ VERSION.json ↔ APP_VERSION ↔ SW/register query |
| QA / e2e | ✅ 26 flows + module-smoke |
| CI gate | ✅ Playwright on push |
| PWA polish | ✅ shortcuts + rest notify (installed only) |
| Demo mode | ✅ `?demo=1` |

## Engines worth knowing
| Engine | Role |
|---|---|
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
- Glass floating nav is current truth (V5.2-PLAN WS12).

## Where decisions live
- Capricorn-Brain project note
- `CHANGELOG.md` / `docs/V5.2-PLAN.md` (WS15 = 5.5)
