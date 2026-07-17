# PulseCap — Roadmap

> Updated 2026-07-11. Fleet order & standard: `capricorn-tooling/shared/CAP-STANDARD.md`.

## Now — v5.3.0
Gap punch-down: local-time dates, real strength programs (SL/SS/5/3/1 via ProgramEngine), custom split builder, library-wide injury data, hardened skip-day, flow tests (suite 18). See `CHANGELOG.md`.

## Previous — v5.2.0
One-stop-shop pass: 2-theme system (device default), skip-day trainer engine, goal-aware weigh-in coach, weekly recap + smarter streaks + check-in ritual + progress photos, new splash/welcome, human copy voice. Plan/handover: `docs/V5.2-PLAN.md`.

## Previous — v5.1.0
Trainer-replacement pass shipped: weekday split schedule, scheduled rest days, injury system unified under Rehab with auto-modified workouts, supplement reminders on Today, bottom-sheet keyboard fix. See `CHANGELOG.md`.

## Previous — v5.0.0
IA overhaul shipped (ULTRACODE P1–P6). See `CHANGELOG.md` + `docs/AUDIT-IA.md`.

## Cap Standard gaps
| Cap Standard item | Status |
|---|---|
| Docs pack | ✅ |
| Screen gallery | ✅ |
| Version discipline | ✅ |
| QA / e2e | ✅ |
| CI gate | ✅ |
| PWA polish | ✅ |
| Demo mode | ✅ |

## Next
1. Delete deprecated module regs after alias soak (physique-archetype, recovery-debt, training-style, coach, intro).
2. Continue P4 CSS conversion (~5 modules / commit) until inline `style=` on buttons ≈ 0 in touched modules.
3. Pages deploy workflow with test gate (owner decision vs legacy branch deploy).

## Ground rules
- No dirty trees: commit or discard before ending a session.
- CI green before tag; tag `vX.Y.Z` per release.
- Bump SW cache with any asset change (PWA apps).
- Never commit `.env` / secrets.
- Deprecate (`go()` alias) before delete; never same commit.
