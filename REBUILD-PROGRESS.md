# PulseCap Ember Rebuild — Progress

Constitution: offline gym app — **today’s session → ≤2-tap log → honest progress**. Identity: Ember (near-black + `#FF7A1A`). Nav: Today · Train · Progress · Programs · Me.

| Phase | Status | Commit | Notes |
|-------|--------|--------|-------|
| 1 Foundation | done | fc02e87 | Tokens, system fonts, quarantine → `js/_deprecated/`, 5-tab shell, alias redirects |
| 2 Spine | done | pending | `profile.js` + `engine.js` + export/import + owner seed |
| 3 Onboarding | pending | — | &lt;90s + calibration + disclaimer |
| 4 Today | pending | — | One session CTA + one insight |
| 5 Log | pending | — | 2-tap sets, WakeLock rest, per-side |
| 6 Progress | pending | — | SVG self-vs-self |
| 7 Programs | pending | — | Templates + library + import |
| 8 Me + audit | pending | — | Interlink tests |
| 9 PWA | pending | — | Purge deprecated, offline/perf |
| 10 Polish | pending | — | A11y, docs, screenshots |

## Phase 1 checklist

- [x] Quarantine bloat modules → `js/_deprecated/`
- [x] `css/tokens.css` Ember dark/light + system `--font`
- [x] `css/shell.css` + `css/ember-components.css`
- [x] Remove Google Fonts + Capricorn/GSAP app runtime from `index.html`
- [x] Remove ambient canvas / desktop Capricorn chrome
- [x] 5-tab nav: dashboard / workout / progress / programs / settings
- [x] `SCREEN_ALIASES` redirect killed routes to survivors
- [x] `MODULE_SRC` slimmed; `sw.js` ASSETS without quarantine paths
- [x] Version `6.7.0` / `pulsecap-v87`
- [x] `node --check` + Playwright green
- [x] Boot / 390px sanity
- [x] Phase 1 commit

## Quarantined (Phase 9 hard-delete)

See `js/_deprecated/` — calculators, quests, physique*, hub, encyclopedia, anatomy, bodymap, Capricorn/GSAP/vendor, etc.
