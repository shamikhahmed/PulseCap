# PulseCap — Roadmap

> Updated 2026-07-11. Fleet order & standard: `capricorn-tooling/shared/CAP-STANDARD.md`.

## Now — v5.0.0
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
