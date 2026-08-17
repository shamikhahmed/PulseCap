# PulseCap — Roadmap

> Updated 2026-08-17. Fleet order & standard: Cap Standard.

## Now — v6.6.0 shipped
**Personalized Program Intelligence:** My Plan + machine-only shoulder-safe PPL + local review-first text PDF/JSON import. See `CHANGELOG.md`.

## Shipped (recent)
| Release | Focus |
|---------|--------|
| 6.6.0 | My Plan / trainingPlan, machine PPL, local plan import (no OCR), prescribed gym floor |
| 6.5.2 | Cap fleet device-matrix; shell BP 700 |
| 6.5.x | Quality checklist, IA Settings, brand fad purge |
| 6.3.0 | Production hardening (units, photos, drafts, Pages gate) |
| 6.2.x | Scroll gallery, Cap brand lock, visual DNA |
| 6.1.0 | Gym tools (voice/barcode/wake/mobility/pain) + ExDB purge |
| 6.0.0 | Coach Kernel + linked Smart Coach (offline rules, no AI API) |
| 5.6.x | Footer/safe-area, iPhone audit, personas, tokens, lazy Learn |
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
1. Real iPhone manual soak (`docs/IPHONE-SOAK.md` checklist) — needs your device (incl. My Plan PDF picker).
2. Optional: switch Pages source to GitHub Actions if you want deploy-from-Actions instead of branch.

## Honest product ceiling
- Does **not** replace in-person form coaching or PT diagnosis.
- Smart Coach = **rules + local logs**, not LLM.
- FormLoops = cues, not video (unless user syncs wger media).
- My Plan import: text PDF / JSON / paste only — **no OCR**, no upload.
- No HealthKit / Watch — PWA-only by owner decision.
- 100% free. No accounts. No B2B.

## Ground rules
- No dirty trees: commit or discard before ending a session.
- CI green before tag; tag `vX.Y.Z` per release.
- Bump SW cache with any asset change (PWA apps).
- Never commit `.env` / secrets.
- Deprecate (`go()` alias) before delete; never same commit.
