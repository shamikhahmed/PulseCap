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
| 11 Log + Train | done | 2160fde | Slim Active header, set-row grid, Train picker, logger perf |
| 12 Spine computes | done | e0f6057 | Mifflin-St Jeor + equipment filter + matched templates + persona tests |
| 13 Onboarding | done | e0f6057 | Equipment, days/week, sex; no goal weight; first-lift calibration |
| 14 Programs + orphans | done | e0f6057 | 6 templates, custom builder, crawl test, Train select match, S.g guard |
| 15 Honesty / a11y | done | e0f6057 | Readiness words, contrast, 16px inputs, wall-clock rest, schema v5 |
| 16 History ids + dedupe | done | 8ab5a56 | **History key = exercise name string** (`ex.name` on workouts, PRs, calibrations). Duplicates did not split history — they merged. Schema v6 adds `exId` slug; 302→265 unique; never deletes sets |
| 17 Wrist/neck/ankle | done | 19d5ace | Eight joint keys on every lift. Wrist/neck/ankle ≥3 now filter. Persistent cautions on Log |
| 18 Patterns + swaps | done | 05e0f0a | Pattern vocab + ≥2 real substitutions + Progress push/pull line |
| 19 Sports + MET | done | e1850dc | Plyo reclass, cricket + sports, Compendium MET sources. Chromium 108 passed |
| 20 Foods | done | 674acba | 35→235 sourced foods incl. Karachi staples; labelled portions; lite guidance |
| 21 Injuries + coverage | done | 79dde28 | Canonical 8 joints; named conditions wired; 20 splits live; kit×joint coverage test |
| 22 Re-render contract | done | 0e13988 | Same-screen go() preserves scrollTop + focus; resetScroll / tab change still reset. SCROLL_PRESERVE_SCREENS deleted |
| 23 Vertical layout | done | fafa734 | One #view padding in shell.css. Today: last session + next + weekly consistency. .screen min-height 100% flex column |
| 24 Gutter + tabs | done | | `.screen-pad` primitive; Account fields no longer full-bleed; Settings tab bar nowrap + scroll |

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

## Phase 16–21 content layer — final report

History key (traced before any dedupe): logged sets keyed on **exercise name string**. Same-name duplicates merged history; they did not split it. Schema v6 stamps `exId` and never deletes sets.

| Dataset | v6.21.0 audit | After 16–21 |
|---------|--------------:|------------:|
| Exercises | 302 (37 duplicate names) | **290** unique ids |
| Duplicate names | 37 | **0** |
| Joint keys | 5 of 8 | **8 of 8** on every lift |
| Movement `pattern` | 0 | **290 / 290** |
| Sports (`grp:sports`) | 5 real + 4 mislabelled plyos | **27** sports; **4** plyos |
| Foods | 35, no local cuisine | **235**, sourced + portioned, Karachi staples in |
| Splits (`splits-db.js`) | 21 claimed | **20** live in SplitEngine (audit over-counted by 1). None deleted. `custom` has a default day until the user builds one. |
| Plan templates | 7 | **7** — separate prescribed-load layer, not dead splits |
| Injury model | 26 / 8 / 8 / 5 disagreeing | **8 canonical joints**. 20 named rows (L/R + conditions) map onto them. Filter is **bilateral** (no side). Rehab `INJURY_DB` maps via `jointFrom`. |

Tests added (`tests/content.spec.js` unless noted): uniqueness + Hack Squat restore; eight joint keys; wrist library/Swap; pattern vocab + ≥2 subs; plyo/cricket/MET source; foods ≥200 + Karachi; named-injury collapse + tennis elbow; kit × joint coverage (4 kits × 8 joints); all SplitsDB ids resolve (`tests/flows.spec.js` also includes `custom`).

Could not verify from this machine: clinical review of cues/joint ratings; Compendium line-by-line for every pre-existing MET (sports + outliers corrected; resistance work cited as CPA 02052/02054 band); USDA FDC for mixed Karachi plates (those are labelled component estimates); real iPhone A2HS / lock-screen rest / VoiceOver / Dynamic Type 200%; live 6.6.0 backup migration (export from Me before overlay).

## Phase 22 — Re-render contract (v6.28.0 / pulsecap-v108)

- Inverted default in `js/app.js` `_renderScreen`: same-screen `go()` preserves `scrollTop` and restores focus (`id` / `data-focus-key` + caret). Real navigation still resets to 0. `resetScroll: true` or a Settings tab change also reset.
- Deleted `SCROLL_PRESERVE_SCREENS` (the `bodymap` key was dead because the alias resolves before `_renderScreen`).
- Tests: `tests/ux-integrity.spec.js` — gym-day + accessibility toggle keep ~400px scroll and focus; weekly `<select>` keeps focus; eight self-re-render screens assert `preserveScroll`; cross-screen nav still resets.
- `npx playwright test --project=chromium`: **124 passed**, 1 skipped (device-matrix). Console boot via smoke suite: no fatal errors, Today reachable.

## Phase 23 — Vertical layout (v6.29.0 / pulsecap-v109)

- Deleted duplicate `#view { padding-bottom }` rules in `css/layout.css` (including the `:has(#nav.cap-premium-nav)` copy). Shell owns `calc(var(--nav-h) + max(var(--safe), 12px))`.
- `#view > .screen` is a min-height 100% flex column. Today composes last session, next-up, and this-week consistency in the lower third — no spacer filler.
- Test: Today content bottom / viewport > 0.55 at 390×844 in demo.
- Chromium: **125 passed**, 1 skipped.

## Phase 24 — Gutter + tab bar (v6.30.0 / pulsecap-v110)

- `.screen-pad` is the 16px gutter. Settings Account wraps all fields (Days/week and Goal were leaking to `left: 0`).
- `.cap-tab-bar` is nowrap + horizontal scroll + edge fade. Height ~60px (one row), not 88px wrap.
- Guard test: interactive controls at 390px stay ≥12px from the edge unless `data-full-bleed` or inside a horizontal scroller.
- Chromium: **127 passed**, 1 skipped.

