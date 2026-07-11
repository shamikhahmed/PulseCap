# Changelog — PulseCap


## 4.9.4 (2026-07-11)
- **P3 merges:** Physique (score/archetype/timeline), Recovery (check-in/debt), Training Intel (intel/style).
- Aliases: `coach`→`assistant`, `intro`→`onboarding` (slides via `showIntro`), deprecated regs kept.
- SW `pulsecap-v44`.

## 4.9.0 (2026-07-11)
- **P2 IA:** Fixed 5 tabs — Today · Train · Body · Learn · Me (`navMigration` v4).
- Learn = `hub` module directory; Body/Train expose nested tools; Home More no longer duplicates Learn modules.
- `SCREEN_ALIASES` + `NAV_PARENT` so old `go()` ids and nested screens keep working / light correct tab.
- Per-module smoke: every registered screen renders with zero page errors (`tests/module-smoke.spec.js`).
- SW cache `pulsecap-v40`.

## 4.8.0 (2026-07-11)
- Cap Standard rollout: 64-shot screen gallery (32 modules x mobile/desktop, `npm run gallery`) + browsable `screen-gallery.html`.
- CI: PulseCap CI workflow runs full Playwright suite on every push (fixed stale package-lock; vendored viewport-helpers into tests/).
- `verify` / `gallery` / `gallery:view` npm scripts per Cap Standard contract.
- SW cache pulsecap-v39.

## 4.7.1 (2026-06-15)
- Restore pre–Capricorn identity home-screen icons; service worker cache bump.

## 4.7.0 (2026-06-15)
- Collapse Explore hub: Home **More** row + Search replaces the 25-row directory; simplified legacy `hub` route.
- **One-tap start** from Home quick action (calls `startWorkout()` directly).
- Empty states for zero workout history on Home and Progress.
- Nav migration v3: saved Explore tab maps to Search; service worker cache `pulsecap-v32`.

## 4.6.1 (2026-06-12)
- Phase P4: Playwright test for periodization block on progress screen in demo mode; service worker cache bump.

## 4.5.1 (2026-06-10)
- Portfolio CTO pass: PWA icons (192/512 maskable), service worker cache bump (`fos-v20`)
- Truth sprint: docs aligned with shipped features
- Smart Coach naming, 9 themes in settings, deck precache

### Phase 2 — Quality (2026-06-10)
- Playwright smoke tests (2/2 pass)
- Pitch deck expanded: market, competition, tech, roadmap, OS family
- Landing footer: privacy.html, changelog.html, GitHub links
- privacy.html / changelog.html generated from markdown
