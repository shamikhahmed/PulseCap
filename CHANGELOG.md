# Changelog — PulseCap

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
