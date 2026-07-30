# PulseCap — PERF

> 2026-07-30 · chromium · `/?demo=1` · local :8766

## Budgets

| Metric | Budget | Measured | Pass |
|--------|-------:|---------:|:----:|
| DOMContentLoaded | ≤8000ms | 1055ms | yes |
| Wall-clock ready (go/S) | ≤20000ms | 2168ms | yes |
| Critical CSS+JS bytes | ≤921600 | 674923 | yes |
| Max route go() | ≤800ms | 51ms (avg 34) | yes |

## Route samples

`20, 33, 51, 34, 33` ms for workout→bodymap→hub→settings→dashboard

## Critical assets

- `css/base.css`: 10973 B
- `css/layout.css`: 36588 B
- `css/components.css`: 45754 B
- `css/identity.css`: 14596 B
- `css/capricorn-core.css`: 49026 B
- `js/app.js`: 38635 B
- `js/storage.js`: 24301 B
- `js/engines.js`: 107122 B
- `js/coach-kernel.js`: 15107 B
- `js/gym-tools.js`: 10752 B
- `js/modules/dashboard.js`: 40007 B
- `js/modules/workout.js`: 234636 B
- `js/modules/settings.js`: 47426 B

**Splash:** absent (must dissolve when load done — no artificial delay).

## Notes

- Lazy Learn modules not in critical path (MODULE_SRC).
- Low Power Mode disables bg canvas (Settings → Access).
- After optimize, re-run `npx playwright test tests/perf.spec.js --project=chromium`.
