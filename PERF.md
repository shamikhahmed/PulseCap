# PulseCap — PERF

> 2026-08-17 · chromium · `/?demo=1` · local :8766

## Budgets

| Metric | Budget | Measured | Pass |
|--------|-------:|---------:|:----:|
| DOMContentLoaded | ≤8000ms | 412ms | yes |
| Wall-clock ready (go/S) | ≤20000ms | 554ms | yes |
| Critical CSS+JS bytes | ≤921600 | 646508 | yes |
| Max route go() | ≤800ms | 34ms (avg 31) | yes |

## Route samples

`23, 34, 34, 32, 33` ms for workout→progress→my-plan→settings→dashboard

## Critical assets

- `css/tokens.css`: 4222 B
- `css/base.css`: 10966 B
- `css/layout.css`: 41444 B
- `css/components.css`: 45761 B
- `css/ember-components.css`: 4417 B
- `css/shell.css`: 2425 B
- `css/identity.css`: 14599 B
- `js/app.js`: 35325 B
- `js/storage.js`: 24602 B
- `js/engines.js`: 107173 B
- `js/coach-kernel.js`: 15101 B
- `js/gym-tools.js`: 10752 B
- `js/training-plan.js`: 21195 B
- `js/plan-import.js`: 11813 B
- `js/modules/dashboard.js`: 3943 B
- `js/modules/workout.js`: 243110 B
- `js/modules/settings.js`: 49660 B

**Splash:** absent (must dissolve when load done — no artificial delay).

## Notes

- Ember Phase 1: tokens + shell; quarantined Learn/Body bloat. My Plan eager-loaded.
- Ambient canvas removed; Capricorn/GSAP runtime out of app boot.
- After optimize, re-run `npx playwright test tests/perf.spec.js --project=chromium`.
