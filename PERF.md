# PulseCap — PERF

> 2026-09-23 · chromium · `/?demo=1` · local :8766

## Budgets

| Metric | Budget | Measured | Pass |
|--------|-------:|---------:|:----:|
| DOMContentLoaded | ≤8000ms | 80ms | yes |
| Wall-clock ready (go/S) | ≤20000ms | 97ms | yes |
| Critical CSS+JS bytes | ≤921600 | 544585 | yes |
| Max route go() | ≤800ms | 35ms (avg 32) | yes |

## Route samples

`28, 33, 33, 31, 35` ms for workout→progress→my-plan→settings→dashboard

## Critical assets

- `css/tokens.css`: 6012 B
- `css/tokens.base.css`: 10966 B
- `css/layout.css`: 40903 B
- `css/components.css`: 46187 B
- `css/ember-components.css`: 12465 B
- `css/shell.css`: 4596 B
- `css/identity.css`: 14551 B
- `js/app.js`: 45468 B
- `js/storage.js`: 26127 B
- `js/engines.js`: 111096 B
- `js/coach-kernel.js`: 15101 B
- `js/gym-tools.js`: 10752 B
- `js/training-plan.js`: 21534 B
- `js/plan-import.js`: 11966 B
- `js/modules/dashboard.js`: 6660 B
- `js/modules/workout.js`: 103402 B
- `js/modules/settings.js`: 56799 B

**Splash:** absent (must dissolve when load done — no artificial delay).

## Notes

- Ember Phase 1: tokens + shell; quarantined Learn/Body bloat. My Plan eager-loaded.
- Ambient canvas removed; Capricorn/GSAP runtime out of app boot.
- After optimize, re-run `npx playwright test tests/perf.spec.js --project=chromium`.
