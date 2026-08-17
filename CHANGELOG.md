## 6.12.0 — 2026-08-17 — Ember rebuild Phase 6
- Progress: Training Block + this-lift-vs-itself SVG (best set load, not e1RM) + history/empty + optional bodyweight/photos. SW `pulsecap-v92`.

## 6.11.0 — 2026-08-17 — Ember rebuild Phase 5
- Log: per-side L/R loads averaged into the set, WakeLock rest timer kept, shoulder caution banner from `Profile.deriveContext`. SW `pulsecap-v91`.

## 6.10.0 — 2026-08-17 — Ember rebuild Phase 4
- Today is one session card, one CTA, and one Smart Coach insight line. Prompt-queue chrome removed. SW `pulsecap-v90`.

## 6.9.0 — 2026-08-17 — Ember rebuild Phase 3
- Onboarding cut to one intro + four steps (name/goal, calibration, limitations + educational disclaimer, confirm). Optional Machine-Only PPL seed. SW `pulsecap-v89`.

## 6.8.0 — 2026-08-17 — Ember rebuild Phase 2
- Profile spine: `Profile.get/set` + `deriveContext` (plan, session, limitations, readiness, insight).
- Engine facade over rotation / RPE load suggest / skip / volume. Schema v4.
- `?owner=1` seeds Machine-Only PPL + shoulder cautions (same template remains public). Export→wipe→import roundtrip test. SW `pulsecap-v88`.

## 6.7.0 — 2026-08-17 — Ember rebuild Phase 1
- Identity: Ember tokens (near-black + `#FF7A1A`); system fonts; Google Fonts and Capricorn/GSAP app runtime removed from boot.
- IA: 5 tabs Today · Train · Progress · Programs · Me. Quarantined Learn/Body bloat to `js/_deprecated/` (hard-delete in Phase 9).
- Killed routes alias to survivors. Weigh-in + DailyDecision ported so Today still boots. SW `pulsecap-v87`.

## 6.6.0 — 2026-08-17 — Personalized Program Intelligence
- Personalized **training plan** OS: versioned `trainingPlan` (not `customSplit`), machine-only shoulder-safe PPL template, double progression, week-5 deload, Sunday rest, missed-session resume.
- Gym floor: Today / My Plan one-tap prescribed session with RPE, ROM stop cues, listed alternatives, shoulder 0–10, cardio after lifting.
- Local plan import: PulseCap JSON first; on-device **text**-PDF / paste extract with mandatory review. **No upload, no OCR** (scanned PDFs unsupported). Optional `CoachProvider` stub stays off.
- Safety: imported/installed plans require acknowledgement; sharp pain / clunk blocks load increases. Educational only — not medical clearance. SW `pulsecap-v86`.

## 6.5.2 — 2026-07-30
- Cap fleet device-matrix harness: `tests/device-matrix.{js,spec.js}`, `qa/device-matrix/REPORT.md`, PNGs gitignored.
- Shell BP **900 → 700** (`CapDesktopNav` + CSS show/hide): iPad mini/Air/Pro 11 now sidebar; hide rule was still `max-width:899` with `!important` (neither chrome).
- Demo banner `padding-top` uses `--top-safe`; viewport tests for 744 / 699 Cap BP band.
- SW `pulsecap-v85`.

## 6.5.1 — 2026-07-30
- Brand: kill residual cyan/purple fad on Today, progress charts, exercise-done chrome, marketing pages (landing/pitch/presentation/gallery/privacy/changelog).
- Tokens: dashboard chrome → shared `.dash-*` / `.icon-flex-*` classes; semantic status hex → `--success`/`--warn`/`--danger` in modules.
- Light backdrop blue wash → chalk-red tint.
- QA: `tests/iphone-soak.spec.js` automates soak slice; gallery captions → 6.5.1.
- SW `pulsecap-v84`.

## 6.5.0 — 2026-07-30
- Close quality checklist gaps: PERF.md budgets + live measures; QA-MATRIX.md interactive audit; calc correctness tests; a11y + offline/update specs.
- Design foundations: type/motion/elevation semantic tokens; offline banner to CSS; intro slides chalk-red (no cyan/purple fad).
- IA: Calculators one home under Learn (removed Body tool duplicate).
- SW `pulsecap-v83`.

## 6.4.0 — 2026-07-30
- IA: Settings regrouped to Account · Training · Fuel · Appearance · Access · Alerts · Privacy · About (aliases keep old deep links). See `IA-RATIONALE.md` + `AUDIT.md`.
- Design: light theme chalk-red DNA (no blue/purple fad); `--cap-accent` locked to PulseCap red; dark backdrop orbs match brand; duplicate layout CSS utilities removed.
- Health: deleted dead `toggleNavTab`; removed `physique-timeline` stub reg (alias-only); marketing SW version drift fixed (`pulsecap-v82`).
- Forms/a11y: settings labels, `inputmode`/`autocomplete`, `aria-pressed`/`tabpanel`, ≥44px targets, confirm copy without emoji.
- QA: settings IA smoke invariant; gallery states updated. SW `pulsecap-v82`.

## 6.3.0 — 2026-07-21
- Reliability: resumable active-workout drafts, lazy-route race protection, storage quota handling, robust wger sync retries, and user-consented service-worker activation.
- Data: canonical metric body values, guarded legacy-unit migration with rollback snapshot, profile-scoped IndexedDB photos, and quarantined legacy photos.
- Security/privacy: safe inline-handler arguments, validated 2 MB backup imports with confirmation and rollback, scoped photo deletion, camera cleanup, and PulseCap-specific privacy disclosures.
- UX/accessibility: accessible modal focus trap, keyboard activation for custom controls, larger touch targets, iOS install guidance, tablet layout fixes, accurate unit displays, and educational rehab wording.
- QA/release: SW `pulsecap-v81`, version `6.3.0`, cross-browser Playwright projects, precache integrity tests, and GitHub Pages deployment gated by verification.

## 6.2.7 — 2026-07-20
- Today remint: clipboard layout — readiness + plan stack on mobile; desktop 3-pane (body rail / main clipboard / PR watchlist). Quick actions + progress snapshot restored. SW `pulsecap-v79`.

## 6.2.6 — 2026-07-20
- Visual DNA remint: journal/passport splash → gym clipboard on rubber mat (chalk marks, metal clip). Chalk-red accent tokens (#FF3B30 / #FF453A), dark bg #121212, Impact stat numerals, 3px rest-timer border. SW `pulsecap-v78`.

## 6.2.5 — 2026-07-20
- Visual DNA: training-journal splash (cover open + pulse line), DM Sans + Bricolage Grotesque, paper/chalk Today, stamped cards. Smart Coach honesty.

## [6.2.4] — 2026-07-19

### QA
- SW allowlist includes Capricorn pitch QR; smoke test tracks `pulsecap-v76`
- Pitch/presentation/docs SW version drift fixed (was stuck on v73)

### Ops
- SW `pulsecap-v76`

## [6.2.3] — 2026-07-19

### Pitch
- Premium Capricorn QR (`assets/qr-pulsecap.png`) — H ECC, Capricorn Systems center mark, gold quiet frame on CTA

### Ops
- SW `pulsecap-v75`

# Changelog — PulseCap

## 6.2.2 (2026-07-19) — Capricorn OS brand lock
- PWA icons + mark locked to Capricorn OS `assets/marks/pulsecap.svg` (BRAND-LOCK).
- `FEATURES.md` inventory (S/W/L/R). SW `pulsecap-v74`.

## 6.2.1 (2026-07-19) — VaultCap-style scroll gallery + UI polish
- Gallery captures **viewport + scroll** companions when `#view` overflows (VaultCap pattern); `screen-gallery.html` Include scroll / Scroll only filters.
- Settings/Equipment/Today de-emoji leftovers; dashboard micro labels 10px; brand badges 10px.
- SW `pulsecap-v73`.

## 6.2.0 (2026-07-18) — Finish leftovers
- **Deprecated routes deleted** (aliases already shipped): `physique-archetype`, `recovery-debt`, `training-style`, `coach`, `intro` regs removed; body renderers kept.
- **Barcode map** expanded to full offline food ids + demo EAN stubs; mobility presets + ankles/wrists; Today mobility nudge when readiness low.
- **De-emoji:** anatomy/rehab unused icon glyphs stripped; settings macro presets; Today quest card → stroke icons.
- **CI:** `pages-gate` job after verify on main (Pages serves main only when CI green).
- SW `pulsecap-v72`.

## 6.1.0 (2026-07-18) — Gym tools (voice, barcode, wake, mobility)
- **`js/gym-tools.js`:** Screen Wake Lock, Web Speech set logging, BarcodeDetector food scan (offline map), MobilityFlow presets, PainFlag → rehab.
- **Logger:** Mic + Pain on active workout; wake lock while training; RPE+voice parse.
- **Nutrition:** camera barcode → local food library (no network API).
- **Recovery:** mobility mini-flows (pre-train).
- **ExDB:** stripped exercise emoji fields; cardio chrome uses stroke icons.
- **Settings:** clearer form-media / wger sync copy; Gym Floor toggles wake lock.
- SW `pulsecap-v71`. Still offline rules only — no LLM / native / pricing.

## 6.0.0 (2026-07-18) — Coach Kernel (offline, free, linked)
- **Coach Kernel** (`js/coach-kernel.js`): RPE autoreg, weekly volume lander, joint stress budget, 4-week mesocycle, push:pull ratio, session recap, manual RHR/HRV readiness bias, Gym Floor + Beginner Mode helpers, unified `CoachKernel` for Today + Assistant.
- **Logger:** RPE field on every set; autoreg reason under exercise; progression respects RPE + deload week.
- **Today:** Focus card + last-session recap + mesocycle chip.
- **Smart Coach:** intents for today/status/RPE/meso/joints/push-pull/volume — still **rules + local data**, not cloud AI.
- **Nutrition:** offline `FOODS_DB` search → one-tap meal log.
- **Settings:** Gym Floor Mode, Beginner Mode, resting HR / HRV fields.
- **Learn:** Beginner Mode simplifies hub.
- **PWA:** SW update banner; cache `pulsecap-v70`.
- Docs pack synced + `docs/V6-NORTHSTAR.md`. No native, no pricing, no B2B.

## 5.6.6 (2026-07-17) — Real-iPhone footer blank
- **Root cause:** `#view` reserved `108px + safe` AND almost every screen also ended with `.spacer-bottom` at `96px + safe` → ~270px empty footer on devices with home-indicator inset.
- **Fix:** view padding → `72px + max(12px, safe)`; `.spacer-bottom` → 12px breath only (no second safe/nav reserve).
- SW `pulsecap-v65`.

## 5.6.5 (2026-07-17) — iPhone 16 Pro Max device audit
- **Device walk:** simulated iPhone 16 Pro Max (440×956, DPR 3, safe-area top 62 / bottom 34) across every screen + active workout in dark + light; screenshotted and reviewed each, plus per-screen nav-overlap and horizontal-scroll probes.
- **Physique tabs fixed (bug):** Archetype/Timeline tabs never lazy-loaded their module — Archetype sat on "Archetype loading…" forever. `reg('physique')` now loads the module and re-renders.
- **Double topbar fixed (bug):** Physique Archetype + Timeline bodies rendered their own topbar inside the unified Physique shell → two stacked headers + dead gap. Inner topbars removed (always embedded via alias).
- **De-emoji wave 3:** quests (`⭐`→star icon, `⚔️`/`💪` dropped, checkboxes → clean boxes), academy (`🎓`/`✅`→icons), calculators (`🫀`/`📏`→heart/ruler icons), active workout note (`📝`→edit icon), seeded quest badge.
- **Icons:** added `star` + `edit` stroke glyphs to the icon set.
- SW `pulsecap-v64`.

## 5.6.4 (2026-07-17) — Close the honesty gaps
- **Exhaustive widgets:** `tests/functional.spec.js` battery covers settings tabs, theme cycle, weight/meals, recovery, workout, search, calculators, assistant, rehab, anatomy, quests, profiles, cardio, equipment, export, physique/recovery/intel tabs.
- **Nav clearance:** `#view` always reserves `108px + safe` bottom padding (not only after premium-nav class attaches); `.spacer-bottom` matches.
- **De-emoji wave 2:** bodymap, injury-risk, profiles (letter/color avatars), recovery, photos, physique, archetype, body-intelligence, progress, encyclopedia, search, training-style, calisthenics, rehab chrome, training-intel, dashboard demo/streak.
- **Visual QA:** gallery walk asserts no fatal chrome, no empty screens, zero unlabeled visible buttons.
- **iPhone soak:** CI automates 393 safe-area clearance + light-theme contrast tokens; `docs/IPHONE-SOAK.md` splits automated vs manual.
- **Light + dark contrast:** `--txt2/--txt3` alpha raised (light 0.78/0.58, dark 0.78/0.55).
- **a11y:** settings toggles get `role=switch` + `aria-label`; encyclopedia search button labeled.
- **Personas:** demo avatars use color keys `c1`–`c6` (no emoji).
- SW `pulsecap-v63`.

## 5.6.3 (2026-07-17) — Sample personas + functional QA
- **Sample athletes:** `S.seedPersonas()` seeds 5 distinct demo profiles — Beginner (Sam), Advanced (Marcus), Rehab/injured (Jordan), Cutting (Lena), Longevity (Ray) — each with its own goal, split, equipment, coach, theme, workouts, PRs, body/meal/recovery history. "Load sample athletes" button in Profiles.
- **Functional QA:** `tests/functional.spec.js` switches through every profile (demo + 5 personas), visits **every registered screen**, and runs a core-action battery (log water, quick-add meal, recovery check-in, start→log set→save workout) asserting zero runtime errors.
- No regressions found; app renders + functions clean across all user types.
- SW `pulsecap-v62`.

## 5.6.2 (2026-07-17) — Visual polish + full screen gallery
- **Heatmap fix:** Muscle Recovery Heatmap was a broken overlapping-blob SVG (`%` coords vs `viewBox` units, `r=14` in a 100-unit space). Rebuilt as a clean responsive tile grid with per-muscle recovery bars.
- **De-emoji chrome:** Nutrition (quick-add, streak, water, supplements), Assistant, Onboarding (intro + steps + coach picker), Settings (theme/coach/tone), Physique scores, Rehab, Anatomy, Workout plan, Visualizations → stroke icons via `icon()`.
- **Water intake:** emoji drops → clean filled/outlined dots.
- **Desktop:** content column capped at 1120px and centred so screens stop reading as a stretched phone.
- **Screen gallery:** capture matrix expanded to **dark + light × mobile + desktop** across every screen, sub-tab, welcome/intro slides, all 7 onboarding steps, and the active workout — 200 shots. Gallery viewer gets a Dark/Light toggle; manifest now carries `theme`/`section`/`screenId`.
- SW `pulsecap-v61`.

## 5.6.1 (2026-07-17) — Design-token migration
- **Utility CSS:** spacing/type/card/flex/back-chip classes expanded in `layout.css`.
- **Inline style kill:** ~580 static chrome `style=` strings across modules → utility classes.
- **Helpers:** `uiCard`, `uiSection`, `uiSpacer`, `moduleBackTopbar` for new screen chrome.
- Remaining inline styles are mostly dynamic (computed colors/widths) — intentional.
- SW `pulsecap-v60`.

## 5.6.0 (2026-07-17) — Architecture + lazy Learn + polish
- **Split engines:** `js/engines.js` extracted from monolith `app.js` (~2.5k → ~700 LOC shell).
- **Lazy Learn routes:** anatomy/encyclopedia/search/calculators/quests/assistant/… load on demand via `MODULE_SRC` + `loadScript`; SW still precaches for offline (`pulsecap-v59`).
- **Design tokens:** expanded spacing/type/radius utilities (`.pad`, `.card-block`, `.type-*`).
- **De-emoji:** coach / quests / recovery-debt chrome → stroke icons; install banner + celebrate defaults cleaned.
- **Viewport QA:** 320/430/768 tests + `docs/IPHONE-SOAK.md` real-device checklist.

## 5.5.2 (2026-07-17) — Production audit hardening
- **Audit:** full principal-engineer pass documented in `docs/PRODUCTION-AUDIT-5.5.2.md`.
- **Dead path removal:** deleted unused `js/cap-validators.js`, removed Capacitor packages/config/scripts (PWA-only), removed orphan roadmap modal.
- **Docs honesty:** `APP_STORE.md` / `IOS_INFO_PLIST.md` / pitch roadmap now say PWA-only (no fake native/HealthKit path).
- **a11y:** search results + recent rows + body-map muscle chips are real `<button>`s; shared `.list-row` design-system class; focus ring coverage.
- **Perf/security:** wger fetches use 15s `AbortController` timeout; form-guide Watch link gets `noreferrer` + 44px tap target.
- SW `pulsecap-v58`. Tests assert no Capacitor deps.

## 5.5.1 (2026-07-17) — Security + honesty patch
- **XSS hardening:** `esc()` now escapes single quotes for attribute contexts; router error messages are escaped.
- **Search hardening:** removed `eval(r.action)` from global search result dispatch; search now parses allowed `go(...)` actions only.
- **wger sync fixed under CSP:** `connect-src`, `img-src`, and `media-src` now allow `https://wger.de` for exercise library images/videos.
- **Service worker allowlist:** `sw.js` no longer caches every successful network response; cache is limited to same-origin app assets/navigation fallback. Added missing `identity.css`, demo mode, and desktop nav assets.
- **Honesty cleanup:** user-facing "AI" labels renamed to Coach/Smart Coach; landing version updated; Pro pricing/gating copy replaced with neutral roadmap copy until real monetization exists.
- **Docs updated:** `CLAUDE.md`, monetization notes, SECURITY, README, presentation, HANDOVER, and Brain note aligned to `5.5.1` / `pulsecap-v57`.

## 5.5.0 (2026-07-17) — Apple polish (PWA-only)
- **Honest form cues:** FormLoops no longer pretend to be videos — text coaching cards + ExDB cues; label says "not a video".
- **Barbell-only plates + warm-up ramp:** plate calc and ramp gated to barbell compounds (`FormLoops.isBarbell`).
- **Rest notifications:** installed-PWA only (iOS Home Screen); never prompts mid-workout; Settings explains Add to Home Screen.
- **Dashboard prompt queue:** max 2 prompts on first paint; overflow under "More for today".
- **Goal-aware weekly targets:** RecapEngine targets scale by goal (strength vs hypertrophy vs fat loss).
- **Program starting weights:** strength programs ask once for working weights before first session.
- **De-emoji chrome:** toast stroke icons; Train Start/Quick/Focus; active workout checkmarks; Learn/Search tiles.
- **a11y:** focus-visible rings, `prefers-reduced-motion` kills canvas, prompt cards are real `<button>`s.
- **Spacing/type tokens** in layout.css (`--space-*`, `--type-*`).
- **Gallery:** active workout shot included. SW `pulsecap-v57`. Tests 26 pass.

## 5.4.0 (2026-07-17) — Coach tools + screenshot polish
- **Screenshot bugs fixed:** skip-to-content link no longer stuck over the iOS status bar (clip/sr-only until focus); gender Male/Female icons spaced so ♀ never clips the label; Settings version reads `APP_VERSION` (was hard-coded **v4.7.4**); Safari's opaque `"Load failed"` network toast mapped to a human offline/wger message.
- **Weekly coach report:** recap card grows into volume-vs-target per muscle + weak-point flags + "what to change next week" advice (`RecapEngine.coachReport`).
- **Plate calculator in logger:** tap **plates** under the first set weight → plates-per-side modal (`PlateEngine`).
- **Warm-up ramp surfaced:** `WeightEngine.warmupSets` shown on active compounds; **Add to logger** prepends the ramp sets.
- **Rest-timer notifications:** PWA Notification API when backgrounded (`RestNotify`); Settings → Alerts → Enable rest notifications.
- **Home-screen shortcuts:** Today's workout / Start / Exercises via `manifest.json` + `bootDeepLink(?action=today|start)`.
- **Offline form loops:** top-50 compounds get animated SVG form cues (`js/data/form-loops.js`) when wger media isn't cached.
- **Screen gallery:** VaultCap-style browser — section pills (Today/Train/Body/Learn/Me), mobile/desktop toggle, lightbox keyboard nav (`screen-gallery.html`).
- Settings chrome de-emoji (tabs + data actions). SW `pulsecap-v55`. Flow tests: 24 pass.

## 5.3.0 (2026-07-17) — Gap punch-down
- **Timezone correctness:** all "today"/date math now LOCAL (`localISO`, 16 call sites) — was UTC, which broke evenings east of Greenwich: wrong day on streaks, weigh-ins, weekday schedule mismatch.
- **Real strength programs:** `ProgramEngine` — Stronglifts/Starting Strength get true linear progression (5×5 / 3×5, DL 1×5, +2.5kg on completed sets, 10% deload after 3 misses); 5/3/1 gets training-max waves (65/75/85 → 70/80/90 → 75/85/95 → deload, TM +2.5/+5 per cycle). Prescriptions prefill the logger with a plan chip ("5×5 @ 60kg…"); state advances on save with a coach toast.
- **Custom split builder:** Settings → Training → "Build your own split" — days, live exercise search over the full library, save → becomes active split, muscles auto-derived, plugs into weekly schedule/injuries/equipment like any built-in.
- **Skip-day matching hardened:** recognizes the missed session by name OR recorded split-day number (workouts now store the *actual* day trained via `SplitEngine.todayDayNumber()`).
- **Imported-exercise injury data:** wger exercises get joint-stress inferred from name+group (`_inferJoint`, cache v3) — injury filtering now covers the whole library, not just built-ins.
- **Readiness hygiene:** check-ins older than 2 days stop steering the score (drift to neutral).
- **De-emoji round 2:** Learn directory, Train chips, browse/search buttons → stroke icons; nutrition header cleaned.
- **Body map depth:** top-light sheen + ambient glow over the figure.
- **Flow tests:** new `tests/flows.spec.js` — workout→save→streak chain, program prescription, weigh-in coach, skip-day reshuffle, all-splits DB integrity. Suite now 18 passing.
- Deferred consciously: onboarding stays 7 quick steps (merge = break risk > value); readiness formula remains heuristic (documented); photos camera flow needs one real-device check post-deploy.

## 5.2.0 (2026-07-16)
- **Two themes, device-default:** light + dark only; fresh installs follow the phone's setting live (`applySystemTheme`), Settings offers Match device / Dark / Light. Legacy theme ids still alias to dark.
- **Skip-day trainer:** "Can't train today?" on the session card — engine decides like a coach: missed group not trained in 7 days → whole weekly map shifts one gym day (`SplitEngine.skipToday`); otherwise schedule holds. Reasoning always shown; skipped day logged and readiness guidance follows.
- **Weight-log coach:** every weigh-in gets a goal-aware reaction (`_weighInReaction`) — pace praise on a cut, eat-more nudge on a stalled bulk, goal-weight celebration.
- **Addictive loop:** weekly recap card (Sun 5pm–Mon, sessions/volume/PRs/streak/weight delta, dismiss per ISO week); streak rebuilt — scheduled rest days count, deliberate skips count, one freeze per counted week, milestone celebrations at 7/30/100/365; morning 30-second check-in card; progress photos (`js/modules/photos.js`, IndexedDB, on-device compression ≤200KB, Body → Photos).
- **New splash + welcome:** brand-mark splash with "Your coach. In your pocket."; onboarding slides rewritten in coach voice, theme-safe tokens.
- **Body tab redesign:** injury-aware muscle recovery — `MuscleEngine` maps injured joints to muscle groups ("Injured — light only/avoid" outranks time-based freshness, body-map SVG shows it); 2-column recovery cards with injury banner → Rehab; single Tools grid replaces uneven chip rows; map moved to top.
- **Ranked exercise swaps:** `SplitEngine.rankSubstitutes` scores alternatives (target-muscle match, difficulty, injured-joint stress, equipment) — swap modal shows "% match" bars, reasons, and a BEST SWAP pick; duplicate library entries deduped.
- **Light-mode audit:** full 34-screen sweep both themes — no overflow; calculators' status cyan → theme token (was unreadable on white).
- **Docked solid tab bar:** premium-nav floating glass pill neutralized (`#nav` forced relative/opaque/straight in layout.css) — bar sits permanently in the app column, content no longer cut behind it.
- **HD body map:** anatomical SVG rebuilt — bezier muscle shapes (delts, pecs, biceps, six-pack rectus + obliques, quads w/ separation, calves; back: trap diamond, rhomboids, lats, erectors, triceps, glutes, hamstrings w/ gastroc split), one side authored + mirrored, theme-aware silhouette, decor lines non-interactive.
- **Settings polish:** Appearance = Auto/Dark/Light segmented cards; Coach Personality rows realigned (avatar + radio); Coach Tone pills rebuilt (labels no longer clip); macro presets 2-col grid ("hypertrophy" overflowed its card).
- Removed `scroll-behavior: smooth` on the app scroller (unwanted auto-scroll animation on tab switches).
- **New brand icon:** pulse-line mark (`pulsecap.svg` from the portfolio icon set) → icon.svg + all PNG sizes (1024/512/192 + apple-touch 120/152/180 via rsvg-convert); splash tile + welcome slide use the same motif.
- **Parametric body map:** figure now scales to the user — `_bodyFactors` derives shoulder/waist/hip/height factors from gender, height, weight, body-fat % and FFMI (muscle); bands (upper/core/lower) scale independently inside a whole-figure transform; caption "Scaled to you: 185cm · 95kg · ♂ · ~14% BF". Verified male 95kg/14% vs female 55kg/26% render visibly different bodies.
- **Glass tab bar back, bug-free:** floating glass pill restored (blur re-enabled — the fast-shell rule was stripping it); every scroll surface gets `padding-bottom: 84px + safe-area` so content always scrolls clear of the pill. Docked-solid override removed.
- **Apple-grade icon system:** 27 minimalist stroke SVGs (`icon()`/`iconTile()` in app.js) replace chrome emojis — dashboard cards, quick actions, hero decision tile (DailyDecision branches carry `ic`/`tint`), Body tools grid, muscle-injury markers, topbar search. Emoji stays only in celebratory/content contexts.
- **Split integrity audit (all 19 splits × 79 days × 381 slots):** 16 shorthand exercise names had no DB entry (no cues/joint data/injury filtering) — `ExDB.ALIASES` resolves them ("Cable Row"→Seated Cable Row, "Plank 60s"→Plank, "Steady Bike 25min"→Stationary Bike, …).
- **Raw data ids off the UI:** `prettyMuscle()/prettyMuscles()` — "upper_chest · front_delts" now renders "Upper Chest · Front Delts" (dashboard, train, coach, hero message).
- **Light-mode invisible text root cause #2:** shared cap components use `--cap-text-secondary` which was never defined → near-white fallback (the unreadable "Day one" empty state). Now mapped to theme tokens in layout.css.
- **Copy pass:** DailyDecision, dashboard prompts, finish-workout toast rewritten human ("Green Light — Send It", "In the books.").
- SW `pulsecap-v53` (adds photos.js). Plan/handover: `docs/V5.2-PLAN.md`.

## 5.1.0 (2026-07-16)
- **Weekly schedule:** split days auto-map to gym days (Mon = Push A for a Mon/Wed/Fri PPL user); per-weekday editor in Settings → Training (`user.dayAssignments`); dashboard session chip overrides for one day only (`user.splitDayOverride`); changing split or gym days resets the map.
- **Scheduled rest days:** non-gym days show "Scheduled Rest Day" guidance (active recovery actions) with a "Train anyway" escape hatch.
- **Injuries unified under Rehab:** logging moved from Settings → Profile into Body → Rehab (protocol + severity + phase in one place; Settings keeps a summary + link). Rehab-logged conditions carry a `joint` so `InjuriesDB` severity/filtering understands them (`InjuriesDB.resolve`). Severity asked at log time.
- **Injury-aware workouts:** severe injury → "Injury Recovery" rest guidance (walk, rehab protocol). Trainable injuries auto-swap/remove exercises via avoid-lists **and** per-exercise joint-stress ratings; "🩹 Modified for X" badge on Today + Train; substitute duplicates deduped.
- **Supplements linked to Today:** "N supplements due" card on dashboard → Nutrition.
- **Modal fix (measurements & all sheets):** sticky ✕ close button, `dvh` height, background scroll lock — fixes iOS keyboard pushing the sheet around and impossible cancel.
- **Icons:** apple-touch icons regenerated from updated icon-1024 (new Capricorn mark on iOS home screen).
- SW `pulsecap-v52`.

## 5.0.1 (2026-07-16)
- **Fix:** live "Sets Done" counter during active workout — `_updateProgress` now updates `#wkt-count`, not just the progress bar (counter previously froze at 0/N until re-render).
- **Fix:** removed duplicate `showLogWeight`/`saveWeight` in settings.js that clobbered bodymap's unit- and fasted-aware versions — imperial weigh-ins were stored raw lb as kg, fasted flag lost.
- `saveWeight` now re-renders the screen it was opened from (dashboard/settings/bodymap) via new `currentScreenId()` helper.
- SW `pulsecap-v51`.


## 5.0.0 (2026-07-11)
- **Major IA overhaul:** Today · Train · Body · Learn · Me (fixed 5 tabs).
- Module merges: Physique, Recovery, Training Intel; coach→assistant; intro→onboarding slides.
- Module contract CSS + helpers; hub/calculators/profiles converted.
- Unified search indexes screens + calculators + existing knowledge bases.
- Today first paint: hero + session + optional empty; extras behind "More for today".
- Per-module smoke green; SW `pulsecap-v50`.

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
- Portfolio CTO pass: PWA icons (192/512 maskable), service worker cache bump (`legacy fos-v20`) — superseded by `pulsecap-v57`
- Truth sprint: docs aligned with shipped features
- Smart Coach naming, 9 themes in settings, deck precache

### Phase 2 — Quality (2026-06-10)
- Playwright smoke tests (2/2 pass)
- Pitch deck expanded: market, competition, tech, roadmap, OS family
- Landing footer: privacy.html, changelog.html, GitHub links
- privacy.html / changelog.html generated from markdown
