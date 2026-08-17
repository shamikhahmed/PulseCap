# PulseCap — PERF

> 2026-08-17 · chromium · `/?demo=1` · local :8766

## Budgets

| Metric | Budget | Measured | Pass |
|--------|-------:|---------:|:----:|
| DOMContentLoaded | ≤8000ms | 1462ms | yes |
| Wall-clock ready (go/S) | ≤20000ms | 1686ms | yes |
| Critical CSS+JS bytes | ≤921600 | 714348 | yes |
| Max route go() | ≤800ms | 38ms (avg 32) | yes |

## Route samples

`20, 38, 34, 33, 33` ms for workout→bodymap→hub→settings→dashboard

## Critical assets

- `css/base.css`: 10973 B
- `css/layout.css`: 41444 B
- `css/components.css`: 45761 B
- `css/identity.css`: 14596 B
- `css/capricorn-core.css`: 49118 B
- `js/app.js`: 38786 B
- `js/storage.js`: 24381 B
- `js/engines.js`: 107173 B
- `js/coach-kernel.js`: 15107 B
- `js/gym-tools.js`: 10752 B
- `js/training-plan.js`: 21195 B
- `js/plan-import.js`: 11813 B
- `js/modules/dashboard.js`: 34388 B
- `js/modules/workout.js`: 240824 B
- `js/modules/settings.js`: 48037 B

**Splash:** absent (must dissolve when load done — no artificial delay).

## Notes

- Lazy Learn modules not in critical path (MODULE_SRC). My Plan / plan-import load on demand.
- Low Power Mode disables bg canvas (Settings → Access).
- After optimize, re-run `npx playwright test tests/perf.spec.js --project=chromium`.
