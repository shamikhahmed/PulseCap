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
| 7 Programs | done | 03abd81 | Tab chrome, templates, local import |
| 8 Me + audit | done | 45eacf4 | Limitations on Training tab + interlink tests |
| 9 PWA | done | c0b7220 | Purged deprecated modules, dropped dead marketing scripts |
| 10 Polish | done | 66bfc9c | A11y + docs synced to 6.16.0 |
| 11 Log + Train | done | pending | Slim Active header, set-row grid, Train picker, logger perf |

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

## Phase 8 checklist

- [x] About nav copy: Today · Train · Progress · Programs · Me
- [x] Limitations chips on Training tab, synced to injuries
- [x] `deriveContext` reads `user.limitations` / `user.injuries`
- [x] Interlink tests in `tests/ember-rebuild.spec.js`
- [x] Version `6.14.0` / `pulsecap-v94`

## Phase 9 checklist

- [x] Hard-delete `js/_deprecated/`
- [x] Drop dead Capricorn `<script>` tags from landing/pitch/presentation/privacy/changelog
- [x] SW allowlist unchanged (never listed quarantine paths)
- [x] Version `6.15.0` / `pulsecap-v95`

## Phase 10 checklist

- [x] 48px named exercise-detail targets
- [x] Docs: CHANGELOG, changelog.html, CLAUDE, HANDOVER, README, GUIDE
- [x] Version `6.16.0` / `pulsecap-v96`
- [ ] Gallery regen optional (`npm run gallery`) — not run (heavy)

## Phase 11 checklist

- [x] Active header: name + timer + Finish; ⋯ menu for Pain / Superset / Focus / Mic
- [x] Session warm-up collapsed by default
- [x] Last / plates use `--text-2`
- [x] Set row one line at 375/390/430 with steppers; per-side L/R in KG stepper
- [x] Train: no Progress/Cardio/Skills/Intel chips; split is segmented or `<select>`
- [x] Perf: `_addSet` DOM patch, deferred `AchEngine.check`, ExDB name index
- [x] Version `6.17.0` / `pulsecap-v97`

## Quarantined (deleted in Phase 9)

Removed calculators, quests, physique*, hub, encyclopedia, anatomy, bodymap, Capricorn/GSAP/vendor, etc.
