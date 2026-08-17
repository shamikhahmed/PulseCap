# PulseCap — Redesign Brief & Cursor Build Prompts

> **What this file is.** A complete, self-contained set of prompts you paste into Cursor (Agent / Composer mode) so it can redesign PulseCap on its own, phase by phase, in a loop. Written by Claude Code after a full audit of the running app + codebase.
>
> **How to use it:**
> 1. Open this repo in Cursor. Open a new Agent chat.
> 2. Paste **PROMPT 0 — Constitution** first. It's the pinned context. Let Cursor confirm it understands and produce the file map.
> 3. Paste **THE LOOP DRIVER**. That tells Cursor to work through Phases 1→10 autonomously.
> 4. If you'd rather go slow, paste phases one at a time instead of the loop driver.
>
> Everything below the line "▼ PASTE INTO CURSOR ▼" and above "▲ END ▲" is meant to be copied verbatim.

---

## 0. Decisions locked (from the owner)

- **Approach:** Fresh rebuild that **ports the good data + engine logic** and **deletes the bloat UI**. (Not a from-scratch single file — we keep the modular data files that are actually good.)
- **Audience:** Generic, onboarding-driven public app **+ owner's plan preloaded** (Machine-Only PPL, shoulder-safe, machine/cable/Smith only) so it's instantly useful.
- **Identity / accent:** **"Ember" — near-black canvas + one warm orange accent.** Rationale below.
- **Feature cut:** Consolidate, don't scatter. Survivors must **work** and be **interlinked** through one personalization spine. Nothing orphaned.

### Why orange, not the current red
The current app uses red for *everything* — the primary action, but also neutral history ("Last: 80kg×8"), labels, and warnings. When everything is red, nothing reads as important, and red also means "danger," which is wrong for normal training data. Fix: **one warm accent (orange) for interactive/active/primary + PR moments**, and reserve **red strictly for pain-flag + destructive + errors**. This is a single CSS token — flip it to red in one line if you disagree after seeing it.

---

## 1. What I cut, kept, and merged (the answer to "what 30+ modules?")

The app is **21,000 lines of JS across 50+ modules** hidden behind a 5-tab nav. Here is the disposition of every screen module. "KILL" = delete the screen (its data/exercises still live in the library). "MERGE" = its useful logic folds into a surviving screen. "KEEP" = survives as a first-class screen, rebuilt.

| Module | Verdict | Where it goes |
|---|---|---|
| `dashboard.js` (Today) | **KEEP** | Rebuilt: one session, one primary action. |
| `workout.js` (Log/Active) | **KEEP** | Rebuilt: the crown-jewel logger. |
| `progress.js` | **KEEP** | Rebuilt: per-exercise, honest charts. |
| `my-plan.js` + `training-plan.js` + `plans/machine-ppl.js` | **KEEP** | Becomes the **Programs** screen. Owner's PPL ships as a template. |
| `settings.js` | **KEEP** | Rebuilt: profile, units, equipment, injuries, backup. |
| `onboarding.js` | **KEEP** | Rebuilt: <90s, calibration, feeds the spine. |
| `nutrition.js` | **KEEP (lite)** | Targets derived from body metrics + goal. NOT a calorie tracker. Optional. |
| `rehab.js` + `injury-risk.js` | **MERGE → Limitations system** | One injury/limitation model that **filters exercises + attaches persistent cautions**. Kill the fake "risk score." Not medical. |
| `equipment-setup.js` | **MERGE → onboarding/settings** | Drives library filtering + substitutions. |
| `recovery.js` + `recovery-debt.js` | **MERGE → Today readiness** | One simple readiness/recovery signal. Kill the "Debt" jargon. |
| `coach.js` + `fitness-assistant.js` + `training-intelligence.js` | **MERGE → rule-based "Coach insights"** | Volume/stall/deload logic surfaced inline on Today + Progress. **No AI claims** (no real LLM — CLAUDE.md rule). Kill the "assistant" screen. |
| `bodymap.js` + `body-intelligence.js` + `anatomy.js` | **MERGE → simple Body/measurements + exercise muscle tags** | Kill the fancy interactive muscle map as a primary screen. Keep measurements (optional). |
| `encyclopedia.js` + `advanced-search.js` | **MERGE → Exercise Library** | The library *is* the encyclopedia. One searchable list. |
| `photos.js` | **KEEP (optional)** | Progress photos (IndexedDB), folded into Progress, disableable. |
| `profiles.js` | **KEEP (minimal)** | Multi-profile on one device stays possible; low priority. |
| `calculators.js` | **KILL** | Especially: **no 1RM estimator ever** (safety). Per-side plate entry covers the rest. |
| `quests.js` (+ academy, physique-timeline aliases) | **KILL** | Gamification bloat. Replace with honest, non-punishing consistency on Today. |
| `physique.js` + `physique-archetype.js` | **KILL** | "Dream physique / archetype" is exactly what the original spec said NOT to build. |
| `knowledge-graph.js` | **KILL** | Pure decoration. |
| `visualizations.js` | **KILL** | Decorative. |
| `calisthenics.js` | **KILL screen** | Calisthenics moves live in the library, filtered by equipment. |
| `training-style.js` | **MERGE → program settings** | A preference, not a screen. |
| `hub.js` (the "Learn" tab) | **KILL** | This tab is the gateway to all the bloat. Gone. |
| `capricorn-*.js` (deck, scene, motion, cinematic, premium-nav, pitch, deck-pro) | **KILL from app** | These are landing/pitch-page tech. Out of the app runtime. `landing.html`/`pitch.html` can keep their own copies if you still want those pages. |
| `cap-demo-mode.js` | **KEEP** | Demo data for screenshots. |
| `cap-desktop-nav.js` | **KEEP (minimal)** | Mobile-first; desktop is a simple centered column, not a 3-pane shell. |

**Engines & data — all KEEP, ported and simplified:**
`engines.js` (Readiness, Streak, Split, Muscle, Plan, DailyDecision), `coach-kernel.js` (autoreg/volume/joints/meso), `gym-tools.js` (WakeLock rest timer is essential; VoiceLogger/Barcode keep only if reliable), `storage.js` (rebuild schema, versioned), `plan-import.js` (local PDF/JSON), and all of `js/data/*` (exercise-library, foods-db, equipment-db, injuries-db, splits-db, form-loops).

**Net effect:** ~30 screens → **5 tabs, ~8 real screens**, one profile spine, zero orphans.

---

## 2. The nav after the cut

Bottom tab bar, 5 tabs, mobile-first:

1. **Today** — the session that's due + one primary action + a small honest status.
2. **Train** → **Log** — start/resume today's session; the active logger.
3. **Progress** — per-exercise history, body weight (optional), measurements (optional), photos (optional).
4. **Programs** — template library, the custom builder, owner's Machine-Only PPL, plan import, the Exercise Library (searchable).
5. **Me** — profile (age/sex/height/weight/units), equipment, **limitations/injuries**, nutrition targets, theme, backup/export-import, about.

Everything the deleted modules did that mattered is reachable from these 5.

---
---

# ▼ PASTE INTO CURSOR ▼

# PROMPT 0 — CONSTITUTION (pin this; paste first)

You are rebuilding **PulseCap**, an offline-first training PWA, into an Apple-grade, ruthlessly simple app. Read this entire brief. Do not write code yet — first restate the plan in your own words and output the target file map. Then wait for the LOOP DRIVER.

## What PulseCap is
A training app for people who lift in a gym and want to (1) run today's session, (2) log it in two taps, (3) see honest progress. It is **not** a social network, calorie tracker, coaching marketplace, or gamified quest app. The competitive edge: logging a set is two taps, and the progress screens never lie.

It is a **public, generic app driven by onboarding**, but it ships with the owner's real program preloaded (see Personalization). Nothing about any one person is hardcoded into logic — it all comes from the profile.

## Hard constraints (never violate)
- **Offline-first PWA. No build step, no framework, no bundler.** Vanilla JS, plain CSS. Service worker + cached shell, fully functional with no network.
- **No third-party runtime calls, no analytics, no trackers, no external fonts.** Remove the Google Fonts `<link>` and CSP font entries — use the **system font stack** (`-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, sans-serif`). This restores offline + the native iOS feel.
- **Local-first, no accounts, no backend.** Data lives on-device: `localStorage` via the storage layer, IndexedDB only for progress photos. Because there's no server, **JSON export/import is mandatory and must be reachable in two taps.** Versioned schema.
- **iOS-first.** Safe-area insets everywhere (`env(safe-area-inset-*)`), 44pt minimum tap targets, no 300ms tap delay, momentum scrolling, `apple-mobile-web-app-*` meta correct, standalone display, haptics on key actions (`navigator.vibrate` guarded).
- **Accessibility is a requirement.** WCAG AA contrast on the dark canvas, respect Dynamic Type / font scaling without breaking layout, label every control for screen readers, never encode meaning in color alone (pair color with icon/text), honor `prefers-reduced-motion`.
- **Safety rules (keep from the original spec):** default rep targets & RPE ceilings sit short of failure. **No 1RM estimator.** No "beat your record" pressure, no streaks that punish rest days. Rest days are part of the plan. Brief honest disclaimer at first launch: general info, not medical/coaching advice.
- **Honesty rules:** only compare an exercise **against itself** — never total or rank across different machines (leverage/pulley ratios differ). Per-side entry for plate-loaded/Smith records **plates per side**, never a fake computed total. Repeating a weight is a **normal outcome**, never styled as failure, never red.
- **No unbacked AI claims.** There is no real LLM. Call it "Coach" or "Insights" — rule-based only. Never say "AI."

## The design system — "Ember"
Define these as CSS custom properties in one `:root` block (`css/tokens.css`). Everything else references tokens — **no hardcoded hex, no inline `style="..."` soup.** (The old app's biggest visual sin was thousands of inline styles. Kill them; use classes.)

**Color (dark is default; also ship a light theme):**
- `--bg`: near-black `#0A0A0B` (not muddy grey, not a gradient wash). `--bg-elev`: `#141416` for cards. `--bg-elev-2`: `#1C1C1F`.
- `--accent`: warm orange `#FF7A1A`. `--accent-press`: `#E86A0E`. This is the ONLY brand color — primary buttons, active tab, active states, PR highlights.
- Semantics, used sparingly and always with an icon/label too: `--success` (progress up / PR ready) `#30D158`; `--caution` (deload / careful) `#FFD60A`; `--danger` (pain flag, destructive, errors ONLY) `#FF453A`.
- Text scale: `--text` `#F5F5F7`, `--text-2` `#A1A1A6`, `--text-3` `#6E6E73`. Hairline border `--line` `rgba(255,255,255,0.08)`.
- Every token must have a light-theme value under `[data-theme="light"]`. Light mode is genuinely better in daylight — build it, don't fake it.

**Type:** system font. Sizes via a small scale (e.g. 34/28/22/17/15/13). Use the **iOS large-title pattern**: big bold screen title that shrinks to a nav title on scroll (can be pure CSS/JS, keep it cheap). Tabular numerals for weights/reps (`font-variant-numeric: tabular-nums`).

**Space & shape:** 8pt spacing scale (4/8/12/16/20/24/32). Card radius 16–20px, hairline borders, subtle elevation shadow — **no heavy glassmorphism blur stacks** (they're slow on iPhone and looked muddy). One quiet shadow token.

**Motion:** purposeful and fast. Screen transitions ≤ 250ms with an iOS spring `cubic-bezier(.32,.72,0,1)`. Press states scale to ~.97. **Remove the ambient background canvas orbs and all GSAP scene code from the app runtime** — they cost frames and add nothing. Everything respects `prefers-reduced-motion`.

**Components (build once, reuse — `css/components.css`):** `card`, `list-row` (icon-tile + title + subtitle + trailing), `btn` (primary/secondary/ghost/destructive), `stepper` (big number field for weight/reps), `stat` (number + label), `sheet` (iOS bottom sheet / modal with grab handle, focus trap, `Esc` close), `chip`, `segmented` (iOS segmented control), `empty-state`, `toast`, `banner`. All keyboard-accessible, all ≥44pt.

## The personalization spine (this is the part the owner cares about most)
There must be **one profile object** that everything derives from. No feature stands alone. Build `js/core/profile.js` exposing `Profile.get()` and a pure `deriveContext(profile)` that returns everything the UI needs. Every screen reads from `deriveContext`, never recomputes ad hoc.

**Profile fields:** `sex`, `age`, `heightCm`, `weightKg` (+ rolling history), `units` (kg/lb, stored per logged value, never silently converted), `experience` (beginner/returning/intermediate/advanced), `equipment` (full gym / machines+cables / dumbbells / home-minimal), `daysPerWeek`, `goal` (fat-loss / muscle / both), `limitations[]` (e.g. shoulder), `programId`, `rotationPosition`.

**`deriveContext` must link them — this table is the spec. Implement every arrow:**

| Profile input | Drives |
|---|---|
| `equipment` | Filters the exercise library; picks substitutions; hides impossible moves. |
| `limitations` (e.g. shoulder) | **Filters/flags** exercises that load that joint hard; promotes machine/cable variants; attaches **persistent** ROM cautions (pressing: stop short of full stretch; overhead: avoid end-range lockout; pulldowns: never behind neck). Cautions stay visible on affected exercises forever, not once at onboarding. Never diagnose; show "the app filters exercises but a recurring/undiagnosed joint issue needs a doctor or physio." |
| `experience` | Default rep ranges + how conservative progression suggestions are. |
| `goal` + `sex`+`age`+`height`+`weight`+activity | Nutrition targets (calories/protein) — **lite guidance, not a tracker**, fully optional/disableable. |
| `weightKg` history | Progress body-weight **rolling weekly average** (with "day-to-day is mostly water" note), optional. |
| `daysPerWeek` + `programId` | Which template/rotation is active. |
| `rotationPosition` | **Today's session by rotation, not calendar.** Missed days resume where you left off — never skip ahead. (Most-common competitor bug; get it right.) |
| logged sets + RPE | Progression suggestion (all sets at top of range, clean, RPE≤8 → +2.5–5% suggested, never auto-applied); stall detection (same weight, no rep progress, 3+ sessions → name likely causes: sleep, food, fatigue — not "push harder"); deload every 5th week (~60%, one fewer set, banner explaining why). |
| readiness inputs (recent volume, days since rest, optional sleep/energy) | **One** simple readiness signal on Today (0–100 or a word). Not repeated on every screen. Kill "recovery debt" jargon. |

**Owner's preloaded profile & program** (used when `?owner=1` or as the default seed, but fully editable): sex male, age 26, ~6'1", ~99–100kg, returning-after-break, **equipment = machines+cables+Smith only**, goal = fat-loss + muscle equal, **limitation = shoulder (3 dislocations May 2026, no overhead, no free-weight pressing, machine/cable/Smith only)**, program = **Machine-Only PPL** (Push A/Pull A/Legs A/Push B/Pull B/Legs B), RPE 8 ceiling, deload at week 5. Ship this as one of several public templates too. Port the real logged numbers from `js/data/plans/machine-ppl.js` if present.

## How to work (loop protocol)
- Work in **phases** (below). One phase per iteration. After each phase you MUST:
  1. `node --check` every changed `.js` file.
  2. Run `npx playwright test` (update/extend tests as you change screens; don't let them rot).
  3. Start the static server and load the app; check the browser console has **zero errors**; verify the app still boots to Today.
  4. Sanity-check the design at **390px width** (iPhone) — no horizontal scroll, tap targets ≥44pt, safe areas respected.
  5. Update `REBUILD-PROGRESS.md` (create it) — check off the phase, note anything deferred.
  6. `git add -A && git commit` with a clear message. One commit per phase.
- **Do not** break offline, add external fonts/CDNs, add a framework, add a 1RM estimator, or use inline `style=` for anything reusable.
- Keep `VERSION.json`, `window.APP_VERSION`, the `sw.js` cache name, and the `index.html` SW register query **in sync** whenever you ship a phase (bump together).
- If a decision is genuinely ambiguous and changes the product, stop and ask. Otherwise pick the simplest option that honors this brief and keep going.

Restate the plan, output the target file map (new `js/core/*`, `js/screens/*`, `css/*`, what gets deleted), then wait for the LOOP DRIVER.

▲ END ▲

---
---

# ▼ PASTE INTO CURSOR ▼

# THE LOOP DRIVER (paste after Prompt 0)

Execute Phases 1 through 10 below **in order, autonomously**. After finishing a phase, run the full loop protocol from the Constitution (node --check, playwright, boot+console check, 390px visual sanity, update `REBUILD-PROGRESS.md`, commit). Then **immediately continue to the next phase without waiting for me.** Only stop if: (a) a verification step fails twice in a row and you can't fix it, or (b) a decision materially changes the product and isn't covered by the brief. When all 10 phases pass, post a final summary + screenshots of Today, Log, and Progress at 390px.

---

### PHASE 1 — Foundation, cleanup, design system
- Create `css/tokens.css` (Ember palette + light theme + type/space/shape/motion tokens) and rewrite `css/components.css` around the component list. Delete or empty the old muddy styles.
- Switch `index.html` to the **system font stack**; remove the Google Fonts `<link>` and the `fonts.googleapis`/`fonts.gstatic` entries from the CSP.
- **Remove from the app runtime:** the ambient background canvas + `bg-canvas`, all `capricorn-*.js` scene/motion/deck/pitch scripts, GSAP vendor files. (Leave `landing.html`/`pitch.html` alone if they load their own copies.)
- Build the new app shell: single centered mobile-first column, safe-area padding, the 5-tab bottom bar (Today/Train/Progress/Programs/Me) with the tokened active-accent state. Desktop = same column centered, no 3-pane shell.
- **Quarantine the bloat modules** listed as KILL in the brief: move them to `js/_deprecated/` and remove their `<script>` tags + routes so the app boots clean. Do not delete data files.
- Acceptance: app boots to Today with new shell, zero console errors, no external network requests (check the Network tab is empty except same-origin), no horizontal scroll at 375/390/430px.

### PHASE 2 — Data model, spine, export/import
- Build `js/core/profile.js` (`Profile.get/set`, `deriveContext`) implementing **every arrow** in the personalization table. Migrate old `localStorage` data into the new profile shape (write a one-time migration; don't lose existing users' history).
- Port and **consolidate** the engines from `engines.js` + `coach-kernel.js` into `js/core/engine.js`: rotation (resume-after-missed-days), progression suggestion, stall detection, deload scheduler, one readiness signal, volume/muscle tracking. Simplify — cut duplicate/oracle logic. Pure functions where possible; unit-test them.
- Keep exercise library, foods, equipment, injuries, splits, form-loops as data. Ensure library items carry: name, primary muscle, pattern, equipment, default sets/reps, tempo, cue, safety note, **2+ substitutions**.
- **Versioned JSON export/import.** Prove it: write a test that exports → wipes storage → imports → asserts profile + workouts + programs are byte-identical. **Do not build any UI on top until this passes.**
- Acceptance: export→wipe→import test green; `deriveContext` unit tests green; owner seed profile produces the Machine-Only PPL with shoulder cautions attached.

### PHASE 3 — Onboarding + calibration
- Rebuild onboarding: **under 90 seconds**, every answer editable later in Me. Steps: units → experience → equipment → days/week → goal → program (template or custom) → limitations (skippable). Ask sex/age/height/weight only where the spine uses them, and say why. **Do not** ask goal weight, body-fat target, or "dream physique."
- **Calibration instead of seeded weights:** first time a user meets an exercise, run the light-load ramp ("do 8 reps, add 10–15% until a set leaves 2–3 in the tank"). Store the result; prefill from history after.
- First-launch honest disclaimer.
- Acceptance: a fresh install reaches a usable Today in <90s of taps; re-editing any answer in Me updates the plan live.

### PHASE 4 — Today screen
- One screen, clear hierarchy: greeting + date, **the session that's due** (by rotation, resume-after-missed-days), **one primary "Start / Resume" button**, and a *small* honest status line (readiness word + streak that never punishes rest). Deload/rest days get a calm banner, not red.
- Rule-based Coach insight = at most **one** short, useful line (e.g. "Add a set of hamstrings this week" or "Bench stalled 3 sessions — check sleep/food"). No dashboards of scores.
- Acceptance: the primary action is the biggest thing on screen; no readiness number repeated elsewhere; rest day reads as normal, not failure.

### PHASE 5 — Log screen (the crown jewel — spend the most effort here)
- Opens to today's exercises. Per set: **weight, reps, RPE (optional)**. **Prefill every field with last time.** Big steppers (configurable increment) + free numeric entry, tabular numerals, ≥44pt.
- **Rest timer auto-starts on logging a set**, using that exercise's prescribed rest, and **keeps running with the screen off / app backgrounded** (WakeLock + a timestamp-based fallback so it's correct after backgrounding). Gentle end cue.
- **Per-side entry** for plate-loaded/Smith: record plates per side, label it, **never compute a fake total.**
- **Swap to substitution** (filtered by equipment + limitations) in one tap; log which variant was actually performed.
- Optional per-session fields: body weight, energy 1–5, notes. RPE explained inline the first few times, always skippable; if never logged, progression falls back to "hit all target reps, clean."
- After the session, **suggest** the next weight (accept/dismiss — never auto-change the program). Shoulder/limitation cautions visible on affected exercises.
- Strip the header to: session name + timer + Finish. Move Pain-flag / superset / focus behind a single "⋯" if kept at all.
- Acceptance: logging a normal set is ≤2 taps; timer survives backgrounding; swap works; no red on normal history.

### PHASE 6 — Progress
- Per-exercise history (weight + volume over time) as **hand-rolled SVG, no chart library.** Only exercise-vs-itself. **No cross-machine totals, no 1RM.**
- Body weight = **rolling weekly average**, optional and fully disableable, with the "day-to-day is water" note. Optional measurements. Optional progress photos (IndexedDB), disableable.
- One honest "what's improving / what stalled" summary from the engine.
- Acceptance: a user who disables body weight never sees it again; charts render offline; no aggregate "total weight lifted" anywhere.

### PHASE 7 — Programs & Exercise Library
- **Programs:** ship several credible templates with plain "who this suits" descriptions — full-body 2–3 day beginner, upper/lower 4-day, PPL 6-day, and a **machines-and-cables-only** variant. Ship the owner's **Machine-Only PPL** as one of them.
- **Custom builder:** create sessions, add exercises, set sets/reps/rest/tempo, reorder, duplicate.
- **Exercise Library** (absorbs the old encyclopedia + search): one searchable list; each item shows muscle/pattern/equipment/cue/safety/substitutions. Original schematic SVG figures or an out-link to a video search — **never scrape/embed third-party GIFs.**
- Fold in **local plan import** (text PDF / JSON / paste; no OCR, no upload) from `plan-import.js`.
- Acceptance: switching template updates Today's rotation; equipment/limitation filters apply to the library; owner's plan loads with correct shoulder-safe exercises.

### PHASE 8 — Me + the interlink audit
- Build **Me**: profile (sex/age/height/weight/units), equipment, **limitations/injuries**, nutrition targets (lite, optional), theme (dark/light/system), **backup: export + import in two taps**, about + disclaimer.
- **Interlink audit (the owner's explicit ask):** walk the personalization table and prove each arrow live — change equipment → library changes; add shoulder limitation → affected exercises get flagged + cautioned everywhere; change goal/weight → nutrition targets change; miss days → rotation resumes correctly. Write a test or checklist for each. **No survivor feature may be a dead end.**
- Acceptance: editing any profile field visibly changes the plan/library/targets; nothing is decorative.

### PHASE 9 — PWA, offline, performance
- Correct `manifest.json`, apple meta, maskable icons. Rewrite `sw.js` cache allowlist to the new file set; bump cache name. Verify **full offline**: airplane mode → app opens, logs a set, shows progress.
- Prompt for a **backup periodically** and on fresh install offer import.
- Performance: remove dead code/deprecated modules once nothing references them, lazy-load non-critical screens, keep first paint fast. No long tasks on the logger.
- Acceptance: Lighthouse PWA installable; offline smoke test green; no references to deleted modules.

### PHASE 10 — Accessibility & polish
- Contrast AA on both themes; Dynamic Type / font-scaling doesn't break layout; every control has an accessible name; focus order sane; `prefers-reduced-motion` honored; color never the only signal.
- Haptics on: log set, PR, start/finish, timer end. iOS large-title behavior, momentum scroll, no tap delay, safe-area correct in standalone.
- Final visual QA at 375 / 390 / 430px. Screenshot Today, Log, Progress. Update docs (`README`, `CHANGELOG`, `HANDOVER`), bump version.
- Acceptance: reads as one coherent, quiet, fast, Apple-grade app; a stranger can onboard and log a session without confusion.

▲ END ▲

---
---

## 2.5 Public APIs — what actually fits (and the rule)

Checked the `public-apis/public-apis` list (Health / Food & Drink / Sports & Fitness). **The rule first:** PulseCap is offline-first, no-backend, privacy-first. **Runtime API dependencies break all three.** So APIs are **build-time seed tools** — run a one-time script, commit the resulting JSON, ship it offline. Keys never ship. Only ONE optional runtime exception (barcode), and it must degrade gracefully.

**Worth using:**

| API | Auth | Use in PulseCap | When |
|---|---|---|---|
| **wger** | apiKey (optional) | Exercise/muscle/equipment library — **already integrated.** Keep it as the exercise-DB source; it has original media under known licenses. | Build-time seed / optional sync (CSP already allows `wger.de`). |
| **Open Food Facts** | **No key** | Free, open-data food + barcode + nutrition. Best fit: seed/expand local `foods-db.js`, and power the existing BarcodeFood tool. | Build-time seed **+** optional runtime barcode lookup that **caches results locally and works offline without it.** |
| **USDA FoodData Central** | free apiKey | Authoritative nutrition — generate an accurate **offline** foods DB, including subcontinental/Karachi items for the owner. Key stays in the build script, never in the app. | Build-time only. |

**Skip (they'd break the model):** Edamam, Nutritionix, Spoonacular, Chomp, Zestful, RecipeAPI, TheMealDB — all commercial `apiKey` services, and PulseCap is neither a recipe app nor a calorie tracker. Fruityvice (fruit-only) is too small to bother. **Never** add an exercise-GIF API (ExerciseDB / API-Ninjas): embedding their animations is the exact copyright trap the brief forbids — use original SVG or a video-search out-link instead.

**If you add optional runtime barcode (Open Food Facts):** add `https://world.openfoodfacts.org` to CSP `connect-src` + `img-src`, keep it strictly optional, cache every lookup into local storage, and make the feature fully usable offline from the seeded DB. Offline is the default; the network is a bonus, never a requirement.

---

## 3. Feature ideas that fit the narrow philosophy (optional, for after the 10 phases)

You asked for more ideas. These *add value without growing sideways* — each strengthens the core loop (run → log → progress) or the personalization spine. Give Cursor any of these as an 11th+ phase.

- **Plate/side quick-math helper** (not a 1RM calc): tap the target weight, it shows plates-per-side for the increment you use. Honest, gym-floor useful.
- **"Ready in N" rest chip** on the lock screen via the timer — a glanceable countdown while the phone is propped on the machine.
- **One-tap "same as last time"** for a whole exercise when you're repeating — fills all sets, you just confirm.
- **Smart substitution memory:** if you always swap Barbell Row → Chest-Supported Row (shoulder), the app learns and offers your variant first.
- **Session recap card** at Finish: sets done, best set per exercise, one honest line ("solid session, 2 lifts progressed"), share-as-image optional and offline (canvas, no upload).
- **Weekly review** (Sunday): rolling body-weight trend, which lifts moved, one thing to focus next week — replaces the deleted "coach report" but calm and once a week.
- **Injury-aware warm-up**: for a shoulder limitation, auto-prepend band pull-aparts / face-pulls / scap work to push/pull days (you already have this content — surface it through the spine, not a separate screen).
- **Deload confidence banner:** when week 5 hits, explain *why* the numbers dropped so it never reads as a bug.
- **Offline-proof "backup nag"** that's gentle: after every ~10 sessions, one dismissible prompt to export JSON.
- **Two-accent A/B** (if you're unsure on orange vs red): a hidden setting to flip `--accent` so you can screenshot both and decide.

---

## 4. Quick reference — files the rebuild touches

- **New:** `css/tokens.css`, `css/components.css` (rewrite), `js/core/profile.js`, `js/core/engine.js`, `js/screens/{today,log,progress,programs,me,onboarding}.js`, `REBUILD-PROGRESS.md`.
- **Keep/port:** `js/data/*` (all), `js/storage.js`, `js/plan-import.js`, `js/gym-tools.js` (rest timer/WakeLock), `sw.js`, `manifest.json`, `cap-demo-mode.js`.
- **Quarantine → delete:** everything in the KILL list, all `js/capricorn-*.js`, GSAP vendor, `bg-canvas`, the old inline-style screens.
- **Keep in sync each phase:** `VERSION.json`, `window.APP_VERSION`, `sw.js` cache name, `index.html` SW `?v=` query.

---

*Generated by Claude Code after auditing the running app (iPhone viewport) and the full codebase. If Cursor pushes back on a constraint, the Constitution wins — it encodes the offline/honesty/safety/simplicity rules the original PulseCap brief established.*
