# PulseCap — PERF

> 2026-10-21 · chromium · `/?demo=1` · local :8766

## Budgets

| Metric | Budget | Measured | Pass |
|--------|-------:|---------:|:----:|
| DOMContentLoaded | ≤8000ms | 84ms | yes |
| Wall-clock ready (go/S) | ≤20000ms | 161ms | yes |
| Critical CSS+JS bytes | ≤921600 | 628003 | yes |
| Max route go() | ≤800ms | 40ms (avg 33) | yes |

## Route samples

`29, 35, 33, 40, 27` ms for workout→progress→my-plan→settings→dashboard

## Critical assets

- `css/tokens.css`: 6012 B
- `css/tokens.base.css`: 11917 B
- `css/layout.css`: 41368 B
- `css/components.css`: 47177 B
- `css/ember-components.css`: 28850 B
- `css/shell.css`: 4824 B
- `css/identity.css`: 14913 B
- `js/app.js`: 47816 B
- `js/storage.js`: 26127 B
- `js/engines.js`: 118030 B
- `js/coach-kernel.js`: 20017 B
- `js/gym-tools.js`: 10752 B
- `js/training-plan.js`: 22977 B
- `js/plan-import.js`: 11966 B
- `js/modules/dashboard.js`: 7093 B
- `js/modules/workout.js`: 151137 B
- `js/modules/settings.js`: 57027 B

**Splash:** absent (must dissolve when load done — no artificial delay).

## Notes

- Ember Phase 1: tokens + shell; quarantined Learn/Body bloat. My Plan eager-loaded.
- Ambient canvas removed; Capricorn/GSAP runtime out of app boot.
- After optimize, re-run `npx playwright test tests/perf.spec.js --project=chromium`.
