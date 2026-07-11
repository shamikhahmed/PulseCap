# PulseCap — Handover

> Read this + `ROADMAP.md` + `~/Capricorn-Brain/01 Projects/PulseCap.md` before working here.
> Last updated: 2026-07-11 · Fleet-wide standard: `capricorn-tooling/shared/CAP-STANDARD.md`

## What this is
Smart Coach fitness OS — offline PWA. Workouts, nutrition, recovery, anatomy, 30+ modules.

## Facts
**Version:** 4.7.5
**Live:** https://shamikhahmed.github.io/PulseCap
**Repo:** https://github.com/shamikhahmed/PulseCap
**Stack:** Vanilla JS PWA. Module registry (`reg()` pattern). Playwright viewport QA.
**Data:** Local storage. Profiles are local-per-device.

## Run & verify
```bash
python3 -m http.server 8000   # static
npm run test:e2e              # Playwright viewport QA
```

## Architecture
- `js/app.js` — shell + router (`go()`)
- `js/modules/` — 30+ feature modules (dashboard, workout, nutrition, coach, anatomy, bodymap, recovery-debt, ...)
- Desktop sidebar shell (Jun 27) + mobile bottom nav
- `js/cap-demo-mode.js` — demo profile

## Cap Standard status (2026-07-11)
| Cap Standard item | Status |
|---|---|
| Docs pack | ✅ |
| Screen gallery | ❌ |
| Version discipline | ✅ |
| QA / e2e | 🟡 |
| CI gate | ❌ |
| PWA polish | ✅ |
| Demo mode | ✅ |

Gaps are tracked as tasks in `ROADMAP.md`.

## Gotchas — read before coding
- All UI is string-template HTML with inline styles — XSS discipline: esc() everything user-entered.
- v4.7.5 added type="button" everywhere — keep it; bare <button> inside forms submits.

## Where decisions live
- Dated decisions: Capricorn-Brain project note (path above)
- Release history: `CHANGELOG.md`
- Fleet-level events: `Cap-Apps/docs/CHANGELOG.md` (master)
