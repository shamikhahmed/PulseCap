# PulseCap — Roadmap

> Updated 2026-07-18. Fleet order & standard: Cap Standard.

## Now — v6.2.0 (job complete under owner constraints)
Coach Kernel + gym tools + leftover polish. No native / B2B / pricing / cloud LLM. See `CHANGELOG.md` + `docs/V6-NORTHSTAR.md`.

## Shipped (recent)
| Release | Focus |
|---------|--------|
| 6.2.0 | Finish leftovers: delete dead regs, barcode/mobility expand, de-emoji, CI pages-gate |
| 6.1.0 | Gym tools (voice/barcode/wake/mobility/pain) + ExDB purge |
| 6.0.0 | Coach Kernel + linked Smart Coach (offline rules, no AI API) |
| 5.6.6 | Footer blank / safe-area double-count |
| 5.6.5 | iPhone 16 Pro Max audit |
| 5.6.4–5.6.0 | Visual QA, personas, tokens, lazy Learn |
| 5.5.x | Security/honesty, Apple polish, PWA-only |
| 5.3–5.4 | ProgramEngine, split builder, plates, FormLoops, RestNotify |
| 5.0–5.2 | 5-tab IA, themes, skip-day, injury-aware train |

## Cap Standard gaps
| Cap Standard item | Status |
|---|---|
| Docs pack | ✅ |
| Screen gallery | ✅ |
| Version discipline | ✅ |
| QA / e2e | ✅ |
| CI gate | ✅ (+ `pages-gate` on main) |
| PWA polish | ✅ |
| Demo mode | ✅ |

## Next (owner-only — not code)
1. Real iPhone manual soak (`docs/IPHONE-SOAK.md` checklist) — needs your device.
2. Optional: switch Pages source to GitHub Actions if you want deploy-from-Actions instead of branch.

## Honest product ceiling
- Does **not** replace in-person form coaching or PT diagnosis.
- Smart Coach = **rules + local logs**, not LLM.
- FormLoops = cues, not video (unless user syncs wger media).
- No HealthKit / Watch — PWA-only by owner decision.
- 100% free. No accounts. No B2B.

## Ground rules
- No dirty trees: commit or discard before ending a session.
- CI green before tag; tag `vX.Y.Z` per release.
- Bump SW cache with any asset change (PWA apps).
- Never commit `.env` / secrets.
- Deprecate (`go()` alias) before delete; never same commit.
