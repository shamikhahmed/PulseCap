# PulseCap — Roadmap

> Updated 2026-07-18. Fleet order & standard: Cap Standard.

## Now — v6.1.0
Gym-floor tools on top of Coach Kernel: Wake Lock, voice logging, barcode food, mobility, pain flag. ExDB de-emoji. See `CHANGELOG.md`.

## Shipped (recent)
| Release | Focus |
|---------|--------|
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
| CI gate | ✅ |
| PWA polish | ✅ |
| Demo mode | ✅ |

## Next (optional polish — not blockers)
1. Delete deprecated module regs after longer alias soak (already thin redirects).
2. Pages deploy workflow with test gate (owner decision).
3. Real-device soak checklist (`docs/IPHONE-SOAK.md`).
4. Expand offline barcode map / more mobility presets.

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
