# PulseCap — Roadmap

> Updated 2026-07-11. Fleet order & standard: `capricorn-tooling/shared/CAP-STANDARD.md`.

## Now — v4.9.0 (P2 IA shipped)
5 tabs: Today · Train · Body · Learn · Me. See `docs/AUDIT-IA.md` + `docs/ULTRACODE-STATE.md`.

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

## Next (ordered) — ULTRACODE
1. **P3** Merge duplicates (physique triple, recovery pair, training intel, coach family, intro/onboarding)
2. **P4** Module contract + CSS (kill inline styles ~5 modules / commit)
3. **P5** Unified search + advanced disclosure (first paint ≤3 cards)
4. **P6** Release `v5.0.0` (major IA), gallery regen, tag, push, CI green

## Ground rules
- No dirty trees: commit or discard before ending a session.
- CI green before tag; tag `vX.Y.Z` per release.
- Bump SW cache with any asset change (PWA apps).
- Never commit `.env` / secrets.
- Deprecate (`go()` alias) before delete; never same commit.
