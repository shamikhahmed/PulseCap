# PulseCap — Roadmap

> Updated 2026-07-11. Fleet order & standard: `capricorn-tooling/shared/CAP-STANDARD.md`.

## Now — v4.7.5
Current shipped state. See `CHANGELOG.md` for how we got here.

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

## Next (ordered)
1. CI: Pages deploy workflow with test gate (currently NO workflows)
2. Screen gallery: module registry makes route enumeration easy — capture each registered module
3. `verify` script; expand e2e beyond viewport contract (smoke per top-5 modules)

## Later
- Module count is huge (30+) — consider feature-flagging rarely used modules out of first paint

## Ground rules
- No dirty trees: commit or discard before ending a session.
- CI green before tag; tag `vX.Y.Z` per release.
- Bump SW cache with any asset change (PWA apps).
- Never commit `.env` / secrets.
