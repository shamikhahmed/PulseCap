# PulseCap — Full Quality Audit

> Generated 2026-07-30 · Phase 1 discover (no code changes in this file's source snapshot)  
> App: offline-first PWA · v6.3.0 · SW `pulsecap-v81` · live https://shamikhahmed.github.io/PulseCap

## Architecture map

| Layer | Truth |
|-------|--------|
| Stack | Vanilla JS, no bundler, no framework |
| Shell | `index.html` + 5 CSS + eager scripts + lazy `MODULE_SRC` |
| Router | `reg` / `go` / `SCREEN_ALIASES` / `NAV_PARENT` in `js/app.js` |
| State | `localStorage` via `S` (`js/storage.js`, schema v2); IndexedDB photos only |
| Coach | Rule-based Smart Coach (`coach-kernel.js` + `fitness-assistant.js`) — not LLM |
| Network | Optional `wger.de` for exercise library metadata |
| Deploy | GitHub Actions verify → Pages rsync on `main` |

### Tabs (canonical)

Today (`dashboard`) · Train (`workout`) · Body (`bodymap`) · Learn (`hub`) · Me (`settings`)

### Routes

31 live `reg()` screens + 12 aliases. Flow-only (no tab): `active`, `briefing`, `onboarding`. Nested Body/Train/Learn screens light parent via `NAV_PARENT`.

### Design system

Tokens in `css/base.css` (`--c*`, `--bg*`, `--txt*`, `--space-*` in layout). Residual debt: ~1276 `style=` in modules, ~271 hex in JS, duplicate utility blocks in `layout.css`, light theme accent still blue/purple vs dark chalk-red DNA.

### Tests / deps

Playwright only (`@playwright/test`). Specs: smoke, flows, module-smoke, functional, viewport, gallery, v6-kernel, v61-gym-tools. No runtime npm deps.

---

## Top risks

| Sev | Risk | Business | User | Fix | Plan |
|-----|------|----------|------|-----|------|
| Critical | Inline handlers + string HTML (mitigated `esc`/`jsArg`) | XSS on shared device | Data wipe/theft | High | Keep escape discipline; prefer buttons; no new user→handler paths |
| High | CSP `unsafe-inline` required by architecture | Weak XSS defense-in-depth | Same | High | Document; incremental event delegation later |
| High | Token/`style=` debt | Theme/a11y drift | Invisible text, inconsistency | High | Tokens first on Me/chrome; light accent → chalk-red |
| High | Docs SW drift (v76 vs v81) | Wrong support guidance | Stale cache advice | Low | Sync presentation/pitch/SECURITY |
| Medium | Settings IA amateur (7 flat tabs, Style nests Units+Perf) | Looks unfinished | Hard find Privacy/About | Medium | Mature groups + IA-RATIONALE |
| Medium | Dead `toggleNavTab` + fixed-nav copy contradiction | Confusion | Broken expectation | Low | Delete dead API |
| Medium | Eager boot script weight | Slow cold start | Wait on weak phones | Medium | Measure; keep lazy Learn |
| Medium | 238MB gallery in git | Clone cost | Dev friction | Low–Med | Keep for gallery product; document |
| Medium | localStorage quota soft-fail only | Silent loss at scale | Lost logs | Medium | Already toasts; keep backup UX top of Privacy |
| Low | Duplicate CSS utilities | Maintainability | None direct | Low | Dedupe layout.css |

---

## Dead / duplicate / unused

| Item | Action |
|------|--------|
| `toggleNavTab` | Delete (nav fixed since v5) |
| Duplicate `.mt-12`/`.pad-x-*` in `layout.css` | Keep one block |
| `physique-timeline` stub `reg` | Prefer alias-only; keep helper load path |
| Merged helper modules still in SW | Keep — still render helpers |
| `docs/AUDIT-IA.md` nav section | Superseded by this file + IA-RATIONALE |
| Marketing SW `pulsecap-v76` | Bump to current |

---

## Prioritized plan (Phases 2–13)

1. **Health** — docs SW sync, CSS dedupe, delete `toggleNavTab`, light accent = chalk-red, de-emoji settings chrome
2. **IA** — Settings → Account · Training · Fuel · Appearance · Accessibility · Notifications · Privacy & Data · About; write `IA-RATIONALE.md`
3. **Design** — settings/component token classes; WCAG check light+dark; reduced-motion parity
4. **Forms** — label/inputmode/autocomplete on profile fields; confirm destructive
5. **Platform** — viewport + safe-area regression via Playwright + live screenshots
6. **A11y** — tablist, switches, focus rings, automated checks in smoke
7. **Perf** — cold load timing numbers; no new eager scripts
8. **Security** — re-verify esc/CSP/import validation; no secrets
9. **Offline** — SW allowlist + no-network smoke
10. **QA** — persona walks + edge cases
11. **Docs/gallery** — CHANGELOG, README, HANDOVER, documented gallery captions
12. **Final** — suite green + live evidence; version bump 6.4.0 / `pulsecap-v82`

---

## Why parts exist (do not delete blindly)

| Part | Why |
|------|-----|
| Alias map | Deep links + old bookmarks after ULTRACODE merges |
| Helper-only modules | Render bodies for merged Physique/Recovery/Style |
| Gym tools | Offline floor UX (wake/voice/barcode/mobility/pain) |
| wger sync | Optional media metadata; FormLoops stay offline truth |
| Glass premium nav | Owner restored floating pill; `#view` padding protects content |
| Photo IndexedDB | Binary blobs unfit for localStorage |

---

## Evidence baseline (pre-change)

- Git: `main` clean @ `a420e69` (v6.3.0)
- Serve: `python3 -m http.server 8766`
- Live verify + Playwright after each phase commit
