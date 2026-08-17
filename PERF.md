# PulseCap — PERF

> 2026-08-17 · chromium · `/?demo=1` · local :8766

## Budgets

| Metric | Budget | Measured | Pass |
|--------|-------:|---------:|:----:|
| DOMContentLoaded | ≤8000ms | 374ms | yes |
| Wall-clock ready (go/S) | ≤20000ms | 436ms | yes |
| Critical CSS+JS bytes | ≤921600 | 533885 | yes |
| Max route go() | ≤800ms | 34ms (avg 31) | yes |

## Route samples

`21, 33, 33, 34, 33` ms for workout→progress→my-plan→settings→dashboard

## Critical assets

- `css/tokens.css`: 4222 B
- `css/base.css`: 10966 B
- `css/layout.css`: 40973 B
- `css/components.css`: 45480 B
- `css/ember-components.css`: 11950 B
- `css/shell.css`: 4327 B
- `css/identity.css`: 14599 B
- `js/app.js`: 39043 B
- `js/storage.js`: 26105 B
- `js/engines.js`: 111068 B
- `js/coach-kernel.js`: 15101 B
- `js/gym-tools.js`: 10752 B
- `js/training-plan.js`: 21534 B
- `js/plan-import.js`: 11813 B
- `js/modules/dashboard.js`: 6645 B
- `js/modules/workout.js`: 103329 B
- `js/modules/settings.js`: 55978 B

**Splash:** absent (must dissolve when load done — no artificial delay).

## Notes

- Ember Phase 1: tokens + shell; quarantined Learn/Body bloat. My Plan eager-loaded.
- Ambient canvas removed; Capricorn/GSAP runtime out of app boot.
- After optimize, re-run `npx playwright test tests/perf.spec.js --project=chromium`.
