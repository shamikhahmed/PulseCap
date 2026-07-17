# PulseCap Production Audit — 2026-07-17 (post v5.5.1)

Principal-engineer audit of the offline PWA. Stack: vanilla JS, no bundler, `localStorage` + IndexedDB (photos), Playwright QA, GitHub Pages.

## Architecture map

| Layer | Location | Role |
|---|---|---|
| Shell / CSP / SW register | `index.html` | Boot, meta, script load order |
| Router + engines | `js/app.js` (~2.5k LOC) | `reg`/`go`, Readiness/Coach/Muscle/Program/Recap/Plate/RestNotify… |
| Persistence | `js/storage.js` | Multi-profile `S` |
| Screens | `js/modules/*.js` (30) | HTML-string screens |
| Data | `js/data/*` | ExDB, splits, injuries, form cues, wger sync |
| Styles | `css/{base,layout,components,identity,capricorn-core}.css` | Tokens + Cap chrome |
| Offline | `sw.js` (`pulsecap-v58`) | Allowlisted cache-first |
| Marketing | `landing.html`, `presentation.html`, `pitch.html` | GSAP/scene (not in app shell) |

**Screens registered:** ~37 (`dashboard`…`active`, aliases via `SCREEN_ALIASES`).

**Data flow:** user action → `go(id)` → registered fn returns HTML string → `#view` innerHTML → engines read/write `S` → toast/modal.

## Top findings (ranked)

### Critical
1. **Attribute XSS residual** — many `onclick="…('` + `esc(user)` + `')"` sinks remain. `esc()` now escapes `'`, so risk lowered, but pattern still fragile. Prefer index + listener / `data-*`.
2. **Monolith `app.js`** — engines + UI helpers in one file; high change-blast radius.

### High
3. **Design system incomplete** — majority of UI is inline `style=` strings; tokens (`--space-*`, `--type-*`) exist but barely used.
4. **Capacitor leftovers** — `@capacitor/*` in `package.json` + `capacitor.config.json` while product is PWA-only → confusion / false native path.
5. **Dead `js/cap-validators.js`** — never loaded; contains IBAN helper irrelevant to fitness PWA.
6. **Roadmap modal orphan** — `openRoadmapModal` defined, never called.
7. **All app JS eager-loaded** — ~40 scripts on every boot; cold start cost on mid-range phones.
8. **`div[onclick]` rows** — keyboard/SR gaps on search/rehab/body map lists (partially fixed on dashboard prompts).

### Medium
9. **Emoji still in content chrome** — quests/coach/recovery-debt celebration copy; chrome mostly cleaned.
10. **Duplicate knowledge surfaces** — `ExDB` + `EKG` overlap (muscles/fatigue); both used, but drift risk.
11. **SW vs marketing** — scene/gsap/deck cached for offline marketing; fine, but app install cache heavier than needed.
12. **Light/dark** — theme system exists; residual hard-coded rgba whites in marketing modal copy.
13. **No request timeout/abort** on wger `fetch`.
14. **41MB screenshot gallery** in repo — good for QA, heavy clone.

### Low
15. `console.error`/`warn` in catch paths (acceptable).
16. `.DS_Store` may linger locally.
17. `test-results/` local Playwright output.
18. Docs drift risk (many markdown files) — mitigated by VERSION discipline.
19. `unsafe-inline` CSP for scripts/styles — required by string-HTML architecture.
20. No real payment/auth — correct for local PWA; keep honesty.

## What is already strong
- Offline-first PWA, honest Smart Coach naming (post 5.5.1).
- CSP + wger allowlist, SW allowlist (post 5.5.1).
- Playwright flows + gallery + module smoke.
- Program engines, Recap, plate/warmup gates, RestNotify installed-only.
- Version sync: `VERSION.json` ↔ `APP_VERSION` ↔ SW.

## Phase plan (this pass → v5.5.2)
1. ~~Audit~~ (this doc)
2. Architecture hygiene: remove Capacitor path, orphan modal, dead validators
3. Dead code / deps cleanup
4. UI tokens + a11y on hottest sinks (search rows, hub already OK)
5. Perf: wger fetch timeout; optional defer non-critical (careful)
6. Security: harden remaining high-risk onclick sites where cheap
7. a11y: buttons not divs on search results
8. Cross-device: safe-area / touch target sweep on nav
9. QA: playwright + node --check + docs/VERSION bump
