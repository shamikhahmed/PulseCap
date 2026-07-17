# PulseCap — Handover

> Read this + `ROADMAP.md` + `~/Capricorn-Brain/01 Projects/PulseCap.md` before working here.
> Last updated: 2026-07-17 · Fleet-wide standard: `capricorn-tooling/shared/CAP-STANDARD.md`

## What this is
Smart Coach fitness OS — offline PWA. Workouts, nutrition, recovery, anatomy, 30+ modules.

## Facts
**Version:** 5.4.0
**SW cache:** `pulsecap-v55`
**Live:** https://shamikhahmed.github.io/PulseCap
**Repo:** https://github.com/shamikhahmed/PulseCap
**Stack:** Vanilla JS PWA. Module registry (`reg()` pattern). Playwright viewport QA.
**Data:** Local storage (+ IndexedDB for progress photos). Profiles are local-per-device.

## Run & verify
```bash
python3 -m http.server 8766   # static (or npm run serve)
npx playwright test           # 24 pass / 2 skip
npm run gallery               # regenerate screen shots
open screen-gallery.html      # VaultCap-style gallery browser
```

## Architecture
- `js/app.js` — shell, router (`go()`), engines (Program / Recap / Plate / RestNotify / Weight / Muscle / …)
- `js/modules/` — feature screens (dashboard, workout, nutrition, coach, anatomy, bodymap, settings, …)
- `js/data/form-loops.js` — offline top-50 SVG form cues
- `js/data/exercise-library.js` — optional wger.de download → localStorage
- Desktop sidebar + mobile glass tab bar (Today · Train · Body · Learn · Me)

## Cap Standard status (2026-07-17)
| Cap Standard item | Status |
|---|---|
| Docs pack | ✅ |
| Screen gallery | ✅ VaultCap-style `screen-gallery.html` |
| Version discipline | ✅ VERSION.json ↔ APP_VERSION ↔ SW |
| QA / e2e | ✅ flows + module-smoke |
| CI gate | ✅ Playwright on push |
| PWA polish | ✅ shortcuts + rest notifications |
| Demo mode | ✅ `?demo=1` |

## Engines worth knowing
| Engine | Role |
|---|---|
| `ProgramEngine` | Stronglifts / SS linear + 5/3/1 TM waves |
| `RecapEngine` | Weekly stats + coachReport (volume vs target) |
| `PlateEngine` | Barbell → plates per side |
| `RestNotify` | Background rest banner via Notification API |
| `WeightEngine.warmupSets` | 40/60/80% ramp |
| `FormLoops` | Offline SVG form cards for top-50 lifts |
| `SplitEngine` | Schedule, skip-day, custom split, ranked swaps |

## Gotchas — read before coding
- All UI is string-template HTML — XSS: `esc()` everything user-entered.
- Dates: always `localISO()` / `today()` — never `toISOString().slice(0,10)` (UTC breaks evenings east of Greenwich).
- `type="button"` on every button inside forms (bare `<button>` submits).
- Skip link must stay clip-hidden until `:focus` — iOS PWA was painting it over the status bar.
- Settings version footer must use `window.APP_VERSION` (synced with `VERSION.json`).
- Owner flip-flop: glass floating nav is current truth (see Brain / V5.2-PLAN WS12).

## Where decisions live
- Dated decisions: Capricorn-Brain project note
- Release history: `CHANGELOG.md`
- Long plan/handover: `docs/V5.2-PLAN.md` (WS14 = v5.3; this release = v5.4 coach tools)
