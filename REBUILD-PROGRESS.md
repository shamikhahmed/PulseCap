# PulseCap Ember Rebuild — Progress

Constitution: offline gym app — **today’s session → ≤2-tap log → honest progress**. Identity: Ember (near-black + `#FF7A1A`). Nav: Today · Train · Progress · Programs · Me.

| Phase | Status | Commit | Notes |
|-------|--------|--------|-------|
| 1 Foundation | done | fc02e87 | Tokens, system fonts, quarantine → `js/_deprecated/`, 5-tab shell, alias redirects |
| 2 Spine | done | 569871d | `profile.js` + `engine.js` + export/import + owner seed |
| 3 Onboarding | done | 2cd634e | 1 intro + 4 steps, calibration, educational disclaimer |
| 4 Today | done | df61a32 | One session CTA + one insight |
| 5 Log | done | e5a1dc2 | Per-side loads, WakeLock rest, limitation banner |
| 6 Progress | done | b2625e4 | SVG self-vs-self (best set load, no 1RM) |
| 7 Programs | done | pending | Tab chrome, templates, local import |
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

## Phase 3 checklist

- [x] One intro slide (Skip still works)
- [x] Four steps: name+goal → calibration → limitations + disclaimer → confirm/optional Machine-Only PPL
- [x] Educational, not medical — checkbox required
- [x] Keep `__pcOnboardingState`, `obSelect`, `_finishOnboarding` for tests
- [x] Gallery `INTRO_COUNT = 1`, `OB_STEPS = 4`
- [x] Version `6.9.0` / `pulsecap-v89`
- [x] Chromium Playwright green

## Phase 4 checklist

- [x] One session card + one CTA + one insight
- [x] Version `6.10.0` / `pulsecap-v90`

## Phase 5 checklist

- [x] Per-side L/R inputs when `kg_per_side`
- [x] WakeLock + rest timer
- [x] Limitation caution banner on active logger
- [x] Version `6.11.0` / `pulsecap-v91`

## Phase 6 checklist

- [x] Keep Training Block + empty “No workouts yet”
- [x] SVG self-vs-self (best set load, no 1RM)
- [x] Optional BW chart + progress photos
- [x] Version `6.12.0` / `pulsecap-v92`

## Phase 7 checklist

- [x] Programs topbar (not Settings back)
- [x] Machine-only PPL template + local import + safety ack
- [x] Version `6.13.0` / `pulsecap-v93`

## Quarantined (Phase 9 hard-delete)

See `js/_deprecated/` — calculators, quests, physique*, hub, encyclopedia, anatomy, bodymap, Capricorn/GSAP/vendor, etc.
