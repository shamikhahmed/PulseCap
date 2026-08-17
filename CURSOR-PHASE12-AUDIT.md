# PulseCap — Deep Audit, Confidence Register & Phase 12–15 Cursor Prompts

> Written by Claude Code after a hands-on audit of v6.17.0 (`2160fde`). Every claim below is marked **VERIFIED** (I ran it and saw the output), **CODE-READ** (I read the source but did not execute it), or **UNTESTED** (I could not check it — treat as unknown, not as fine).
>
> The owner asked for two things: *everything I am less confident about, even slightly*, and *a spoon-fed prompt set for Cursor*. Sections 1–5 are the audit. Sections 6–9 are what to build. Section 10 is where to legally get images/sound/icons. Section 11 is the paste-into-Cursor block.

---

## 0.0 STATUS — resolved in v6.21.0 (re-verified 2026-08-18)

This audit was written against v6.17.0. Phases 12–15 shipped as **v6.21.0** (`e0f6057`). I re-tested every finding. Current state:

| Finding | Status |
|---|---|
| §2.1 Hardcoded 2200 kcal | **FIXED** — Mifflin-St Jeor. Verified: 1744 / 3090 / 2913 / 1422 kcal for the four personas. |
| §2.1 Protein 3.4 g/kg | **FIXED** — 1.8 g/kg, capped 2.2. Verified: 140 / 130 / 104 / 115 g. |
| §2.2 Equipment never asked | **FIXED** — asked in onboarding; `js/core/equipment.js` filters plans, library and Swap. |
| §2.3 `daysPerWeek` ignored | **FIXED** — drives activity factor and template match. |
| §2.5 One template, no builder | **FIXED** — 7 templates + a real builder. Verified match: `machines_fb_3` / `ppl_5` / `upper_lower_4` / `home_bw`. |
| §2.6 Goal weight asked | **FIXED** — field removed; `delete u.goalWeight` at `onboarding.js:158`. |
| §2.7 Orphaned screens | **RETRACTED — my error.** See §2.7. |
| §2.8 Duplicate helper text | **FIXED** (1 occurrence). |
| §2.8 Light muted contrast | **FIXED** — `#6E6E73`. |
| §2.8 `S.g` null crash | **FIXED** — guarded at `storage.js:365`. |
| §2.8 iOS input zoom | **FIXED** — `.field` 16px, stepper 18px. |
| §5 Fake readiness precision | **FIXED** — word until 3 logged sessions; no numeric score at zero data. |

Full Chromium suite: **102 passed, 1 skipped.** Persona + spine specs assert real behaviour (I read and ran them).

**Still open — owner-manual, cannot be closed from a dev machine:** real-iPhone pass (A2HS, lock-screen rest timer, VoiceOver, Dynamic Type 200 %), migration of live 6.6.0 data, and a physio review of injury/form copy. See §3 and §9.

---

## 0. The headline (as written against v6.17.0)

The **shell** is now genuinely good — Today, Log, Progress and the Ember design system are close to the Apple-grade bar. Offline integrity is clean. Export/import round-trips correctly.

The **brain is not wired**. The app looks personalized but mostly is not. I tested four different users; they all got the same calories and the same workout. That is the gap between "looks senior-built" and "is senior-built", and it is what Phase 12 must fix.

---

## 1. VERIFIED WORKING — high confidence, leave alone

| Area | Evidence |
|---|---|
| Offline/SW integrity | Every file in `sw.js` exists; every file loaded by `index.html` is cached; all lazy `MODULE_SRC` modules cached. **Zero gaps.** |
| Export → wipe → import | Round-trip test passed: name + workouts restored exactly. This is the most important data-safety feature and it works. |
| No console errors | All 15 screens rendered, `console.error` captured nothing. |
| Log screen layout | One clean grid line per set, real steppers, ⋯ + Finish header, collapsed warm-up, neutral-gray history. Matches the constitution. |
| Tap targets & labels (Train) | 11 buttons, **0 unlabeled**, **0 under 44px**. |
| Light theme | Proper iOS values: `#F5F5F7` canvas, white cards, `#1C1C1E` text. Not an afterthought. |
| Owner mode (`?owner=1`) | Installs shoulder limitation + machine/Smith PPL. **No Barbell Row, no Deadlift, no overhead.** Correctly personalized. |
| No external runtime deps | No Google Fonts, no GSAP, no CDN. System font stack in `tokens.css`. |

---

## 2. VERIFIED BROKEN — high confidence, must fix

### 2.1 Nutrition is fake-personalized (worst offender)
**VERIFIED.** I created four users and read the nutrition screen for each:

| Persona | Sex | Age | Weight | Goal | Calories shown | Protein shown |
|---|---|---|---|---|---|---|
| Sara — cut | F | 29 | 78 kg | fat loss | **2200** | **220 g** |
| Bilal — build | M | 24 | 72 kg | hypertrophy | **2200** | 165 g |
| Tim — gain | M | 19 | 58 kg | weight gain | **2200** | 165 g |
| Ayesha — home cut | F | 35 | 64 kg | fat loss | **2200** | **220 g** |

Every user gets **2200 kcal**. `js/modules/nutrition.js:12` reads `user.calorieTarget || 2200`, and `user.calorieTarget` is **never set by onboarding** (VERIFIED: `S.g('user.calorieTarget')` returns `null`). Sex, age, height, weight and goal are collected and then ignored.

Protein is a fixed percentage of that fixed number, so a 64 kg woman is told to eat **220 g protein (3.4 g/kg)**. That is not just wrong, it is advice that could harm someone. **This must not ship as-is.**

### 2.2 Equipment is never asked, so filtering can never work
**VERIFIED.** Onboarding has 4 steps (name+goal → experience/age/units/height/weight → limitations → template) and **never asks what equipment the user has** (CODE-READ `js/modules/onboarding.js:196-267`). Consequence: a user with `equipment: []` (home, nothing) was served a **6-day barbell PPL including Barbell Row, Deadlift and Bench Press** (VERIFIED). There is no equipment-filter function anywhere in global scope (VERIFIED: scan for `filter|available|byEquip` returned `[]`).

### 2.3 `daysPerWeek` is collected nowhere and honored nowhere
**VERIFIED.** A user set to 2 days/week is shown a 6-session split. Onboarding never asks. Nothing selects a template by availability.

### 2.4 `deriveContext` is a pass-through, not a derivation engine
**CODE-READ** `js/core/profile.js:33-59`. It returns `user`, `plan`, `session`, `readiness`, `limitations`, `equipment` — raw. It computes **none** of the arrows the brief specified (calories, rep ranges by experience, filtered library, goal-driven programming). The spine exists in name only.

### 2.5 Only one program template, and no custom builder
**VERIFIED.** `js/data/plans/` contains exactly `machine-ppl.js`; the only registered id is `machine_ppl_shoulder`. Phase 7 was reported complete but the **custom program builder does not exist** (grep for `buildProgram|createProgram|addExerciseToDay` → 0 matches). A beginner who wants full-body 3×/week has nothing.

### 2.6 Onboarding asks for goal weight — a direct spec violation
**CODE-READ** `js/modules/onboarding.js:234`. The original brief said explicitly: *do not ask for goal weight, body-fat target, or dream physique.* It asks anyway — and then **throws the answer away** (VERIFIED: `user.goalWeight` is `null` after onboarding). Worst of both: unhealthy framing *and* dead data.

### 2.7 ~~Orphaned screens~~ — **RETRACTED, this finding was wrong**
My original crawl reported `nutrition`, `equipment-setup`, `recovery`, `profiles`, `plan-import`, `split-builder` and `briefing` as unreachable. **That was a false positive and is now retracted.**

Cause: the crawler read `#view.innerHTML` after calling `go('settings')`, which renders only Settings' **default tab** (Account). Every "orphan" was linked from a *non-default* Settings tab, so none of those links were ever in the DOM when I looked.

A static scan of `go()` targets per module (re-verified) shows **no orphans exist**:
- `settings.js` → `equipment-setup`, `nutrition`, `profiles`, `recovery`, `rehab`, `my-plan`, `split-builder`
- `dashboard.js` → `briefing`, `profiles`, `progress`, `recovery`
- `workout.js` → `active`, `cardio`, `my-plan`, `rehab`
- `progress.js` → `bodymap`, `photos`

**Lesson for any future reachability test:** a tabbed screen must have every tab rendered before its links are counted. A crawler that only sees default tabs will report false orphans.

### 2.8 Smaller verified defects
- Programs screen prints the same helper sentence **twice** (`grep -c` → 2).
- Train's split `<select>` showed "Pull A" while the card below rendered "Push A" — selection and preview disagree.
- Light-theme muted text `#8E8E93` on white ≈ **3.5:1 contrast — fails WCAG AA** for body copy.
- Step 2 is titled "Quick calibration" but contains no calibration; the brief's per-exercise ramp (light load → 8 reps → +10–15% until 2–3 in reserve) **was never built**.
- Only 3 limitation options (shoulder/knee/low back). No wrist, elbow, hip, neck, ankle.
- `S.g(path)` throws on a null path (`.split` unguarded) — `js/storage.js:358`.

---

## 3. THE CONFIDENCE REGISTER — what I am *not* sure about

This is the section the owner asked for. Ordered most→least confident. **Anything below "medium" should be independently re-tested before you trust it.**

### Medium-low confidence — I saw it once, in one context
1. **Rest timer surviving background/lock.** CODE-READ only. WakeLock is referenced, but I never backgrounded a real iPhone for 3 minutes and came back. Timestamp-based recovery is the correct pattern; **I did not verify it exists.** This is the single most important behaviour on the gym floor. *Test on a real iPhone.*
2. **Progression suggestion correctness.** I saw "Try 80kg ↑" render. I never logged a full session and checked that the +2.5–5 % rule, the RPE≤8 gate, and the "repeat the weight" path actually fire correctly. **Untested logic.**
3. **Stall detection & deload week 5.** CODE-READ references exist. Never observed firing. Deload requires 5 weeks of data I did not simulate.
4. **Rotation resume-after-missed-days.** This is the flagship correctness claim and I **never simulated missed days**. I only saw that a session renders. *High risk — it is the thing the brief said competitors get wrong.*
5. **Per-side L/R entry.** Grep-confirmed in source; **never seen rendered**, because the demo plan's first exercise is not plate-loaded. Unknown whether the L/R toggle fits the one-line grid.

### Low confidence — inferred, not observed
6. **Swap/substitution respecting limitations.** A "Swap" button exists. I never opened it. If it lists barbell moves for a shoulder-limited user, that is a safety bug. **Untested.**
7. **Real iPhone Safari behaviour.** Everything I saw was desktop Chromium at a 390 px viewport. Not the same as iOS Safari: safe-area insets, `100vh` bugs, rubber-band scroll, input zoom on focus (font-size <16 px triggers zoom), PWA standalone chrome. **Zero real-device testing happened.**
8. **Add-to-Home-Screen install + offline cold start.** Never performed. SW file integrity ≠ a working install.
9. **Photos/IndexedDB.** `photos` screen rendered 97 characters — suspiciously thin. Never uploaded an image. Storage limits and iOS eviction untested.
10. **Voice logging & barcode.** Both referenced in `gym-tools.js`. Never exercised. Voice needs mic permission; barcode needs a camera and probably a network lookup — **both may be broken or may violate offline-first.**
11. **Data migration from the old 6.6.0 schema.** If you (or any existing user) have real history in the old shape, I never verified it survives the Ember migration. **Back up before updating.** This is a data-loss risk.
12. **Playwright's 291 passing tests.** I did not read them. Passing tests that assert the wrong thing are worse than no tests — e.g. every persona getting 2200 kcal apparently passes today.

### Least confident — genuine unknowns, flagged honestly
13. **Whether the app is actually *pleasant* over weeks.** I ran single interactions. Fatigue, delight, and habit formation cannot be audited in one session.
14. **Accessibility beyond the mechanical checks.** I counted labels and hit-areas on one screen. I did not run VoiceOver, did not test Dynamic Type at 200 %, did not check focus order in the sheets.
15. **Performance on an actual older iPhone.** The Phase 11 fixes look right in principle; I never profiled on device. The renderer stalls I hit earlier were in *my* tooling, so I cannot cleanly separate tool flakiness from app jank.
16. **Whether the exercise library's form cues are safe advice.** ~300 exercises with cue text, some touching injured joints. I spot-read a handful. **Nobody with clinical training has reviewed this content.** For a shoulder-dislocation history, that matters.
17. **Licence status of any bundled exercise data/media.** The library appears to derive from wger. I did not verify attribution requirements are met. See §10.

---

## 4. Persona findings — how it fails different users

| User | What they need | What PulseCap does today | Verdict |
|---|---|---|---|
| **Fat loss, female, beginner, machines only** | Modest deficit, ~1.6 g/kg protein, 3 short machine sessions | 2200 kcal, **220 g protein**, 6-day barbell PPL | **Unusable + unsafe advice** |
| **Muscle gain, male, intermediate, full gym** | Small surplus, 5-day split, progressive overload | 2200 kcal (likely a deficit for him), correct-ish split by luck | Partially works |
| **Weight gain, 19 M, 58 kg, skinny** | Real surplus (~3000+), heavy compounds, high calories | **2200 kcal — an actual deficit.** App would make him *lose* weight | **Actively counterproductive** |
| **Home, no equipment, 2 days/week** | Bodyweight/band circuits, 2 sessions | 6-day barbell PPL he cannot perform | **Broken** |
| **Owner (shoulder, machines, recomp)** | Machine/Smith only, no overhead | Correct plan, cautions attached | **Works** ✅ |

Only the hand-curated owner path works. Everyone else gets a template that ignores them.

---

## 5. What "made by senior developers" still requires

Honest read: the **surface** now looks senior-built. Three things still read as junior:

1. **Fake precision.** "READINESS: 84 — READY" was identical for four different users with zero history. Senior engineers do not display a fabricated number to two significant figures. Show a state (`Ready` / `Take it easy`) or nothing until data exists.
2. **Collect-and-discard.** Asking for goal weight, age, height and then not using them is the clearest tell of an unfinished product.
3. **Dead ends.** A complete Nutrition screen nobody can reach means nobody walked the app as a user before shipping.

---

# ▼ PASTE INTO CURSOR ▼

## PROMPT — PHASES 12–15 (paste after the Constitution from `CURSOR-REBUILD.md`)

You previously completed Ember Phases 1–11 on PulseCap. An audit found that the UI shell is good but the **personalization spine is not wired** — four different users receive identical calories and identical workouts. Fix that, finish the missing features, then polish.

Same loop protocol as before: after each phase run `node --check` on changed JS, run `npx playwright test`, boot the app and confirm zero console errors, sanity-check at 375/390/430 px, update `REBUILD-PROGRESS.md`, and commit. Bump `VERSION.json`, `window.APP_VERSION`, the `sw.js` cache name and the `index.html` SW `?v=` query together. Continue automatically from one phase to the next; stop only if a check fails twice or a decision materially changes the product.

**Never violate:** offline-first, no external runtime calls, no framework, no 1RM estimator, no failure-chasing, exercise compared only against itself, no fake totals, honest language, no AI claims.

---

### PHASE 12 — Make `deriveContext` a real derivation engine (highest priority)

`js/core/profile.js` currently returns raw values. Make it **compute**. Every number the UI shows must come from here. Add unit tests for each.

**12.1 — Energy & macros (replaces the hardcoded 2200).**
Implement Mifflin-St Jeor in `js/core/nutrition-math.js`:
- BMR male = `10·kg + 6.25·cm − 5·age + 5`; female = `10·kg + 6.25·cm − 5·age − 161`. If sex is not given, average the two and label the result as an estimate.
- TDEE = BMR × activity factor (sedentary 1.2 → very active 1.725). Derive the factor from `daysPerWeek`, and say so in the UI.
- Goal adjustment: fat loss = TDEE − 20 % (floor at BMR × 1.1, never below 1200 kcal for women / 1500 for men — clamp and explain); muscle gain = TDEE + 10 %; weight gain = TDEE + 15 %; recomp/maintain = TDEE.
- Protein **1.6–2.2 g per kg bodyweight** (use lean-ish 1.8 default), fat ≥ 0.8 g/kg, carbs fill the remainder. **Never output 3 g/kg.**
- Show the derivation in the UI: "≈2,180 kcal — from your height, weight, age and 4 sessions/week. An estimate; adjust by results."
- Delete `user.calorieTarget || 2200`. Persist the computed value but recompute whenever an input changes.

**12.2 — Equipment filtering (build the missing function).**
Create `js/core/equipment.js` with `availableExercises(profile)` and `canPerform(exercise, profile)`. Every place that lists exercises — plan generation, library, **and the Swap sheet** — must go through it. A user with `equipment: []` must never be shown a barbell movement.

**12.3 — Limitation filtering must apply to swaps and library, not just curated plans.**
Extend the shoulder/knee/low-back logic so it filters *dynamically generated* lists too. Add wrist, elbow, hip, neck and ankle. Verify: a shoulder-limited user opening Swap on a press sees only machine/cable options.

**12.4 — `experience` drives rep ranges and progression aggressiveness.** Beginner: higher reps, larger jumps, more conservative RPE. Advanced: tighter ranges, smaller jumps.

**12.5 — `daysPerWeek` selects the template** and must be asked in onboarding (Phase 13).

Acceptance: write `tests/persona.spec.js` covering the five users in the audit table. Assert that **calories, protein and session count all differ appropriately** and that no user is ever shown equipment they do not have. This test failing must block the build.

---

### PHASE 13 — Fix onboarding

- **Add the two missing questions: equipment and days-per-week.** Without them nothing above can work. Equipment options: full gym / machines + cables / dumbbells only / home minimal (bodyweight + bands).
- **Remove the goal-weight field entirely.** It violates the brief, it is discarded anyway, and it is poor framing for anyone with a difficult relationship with food.
- **Ask sex** — now genuinely needed for BMR — with a plain one-line justification and a "prefer not to say" option that falls back to the averaged formula.
- **Build the real calibration flow** the step is named after: on first meeting an exercise, guide light load → 8 reps → +10–15 % until a set leaves 2–3 reps in reserve. Store the result; prefill from history thereafter.
- Keep it under 90 seconds. Every answer editable in Me.

---

### PHASE 14 — Finish the missing features

- **Ship 4+ real templates** (currently 1): full-body 2–3 day beginner, upper/lower 4-day, PPL 6-day, machines-and-cables-only, plus a home/bodyweight option. Each with a plain "who this suits" line. Offer them matched to `daysPerWeek` + `equipment`.
- **Build the custom program builder** — it does not exist. Create sessions, add exercises, set sets/reps/rest/tempo, reorder, duplicate.
- ~~Fix every orphan.~~ **Retracted — see §2.7. There are no orphans; that finding was a crawler artefact.** Instead: keep the reachability test in `tests/ember-rebuild.spec.js`, and make sure it renders **every Settings tab** before counting links, or it will report false orphans exactly as my first crawl did.
- Fix the duplicated helper sentence on Programs; fix the Train `<select>`/preview mismatch; guard `S.g` against a null path.

---

### PHASE 15 — Honesty, accessibility, device truth

- **Kill fake precision.** Do not show a 2-significant-figure readiness score derived from no data. Show a word (`Ready`, `Take it easy`, `Deload week`) or hide it until there are ≥3 logged sessions. Same rule anywhere else a number is invented.
- **Contrast:** raise light-theme muted text from `#8E8E93` to at least `#6E6E73` on white so body copy clears WCAG AA 4.5:1. Re-check every token pair in both themes.
- **iOS input zoom:** every `input`/`select` must be ≥16 px font-size or iOS Safari zooms on focus and the layout jumps.
- **Rest timer:** make it timestamp-based (store `startedAt`, compute remaining from wall-clock on resume) so backgrounding, lock-screen and app-kill cannot desync it. Add a test that fakes a 3-minute gap.
- **Verify migration** from the pre-Ember schema with a real old backup; never silently drop history.
- **Real-device pass:** run on an actual iPhone in Safari and as an installed PWA. Check safe areas, rubber-band scroll, standalone chrome, VoiceOver on Today and Log, Dynamic Type at 200 %.
- Re-read the Playwright suite and delete or fix any test that asserts the old wrong behaviour.

▲ END ▲

---

## 6. New features worth building (after 12–15)

Each one strengthens the core loop instead of widening the app.

**Make it feel alive**
- **Session recap card** at Finish: sets, best set per lift, one honest line ("two lifts progressed"), rendered to canvas so it can be saved offline. This is the shareable moment the app currently lacks.
- **Rest-timer as the hero.** Full-bleed countdown, dimmed screen, the next set's target weight in huge type. The 90 seconds between sets is the most-viewed screen in any lifting app; treat it as a designed surface, not a toast.
- **"Same as last time"** — one tap fills every set of an exercise from history.
- **Plate helper** (not a 1RM calc): shows plates-per-side for the target. Gym-floor useful, zero risk.
- **Weekly review**, Sunday only: body-weight trend, what moved, one focus for next week. Calm, once weekly.

**Make it smarter, honestly**
- **Substitution memory:** if the user always swaps X→Y, offer Y first next time.
- **Injury-aware warm-ups:** for a shoulder flag, auto-prepend band pull-aparts and face pulls. The content already exists — surface it through the spine.
- **Deload explanation banner** so the drop never reads as a bug.
- **Gentle backup nag** every ~10 sessions.

**Craft details that read as senior**
- Haptics with meaning: light on set logged, distinct double on PR, none on navigation.
- Numbers that animate to their value (150 ms) rather than snapping.
- Empty states that teach rather than apologise.
- A real first-run "here's your first session" moment instead of dropping into a dashboard.

---

## 7. Where to get images and assets — legally, offline, spoon-fed

**Constraint that governs everything:** the app is offline-first with a strict CSP. **No hotlinking, no CDNs.** Every asset must be downloaded, optimised, committed to the repo, and added to the `sw.js` cache list. Anything fetched at runtime is a bug.

**Cursor must verify each licence at download time and record it in `assets/CREDITS.md` — do not trust this table blindly.**

| Need | Source | Licence to verify | How to use |
|---|---|---|---|
| **UI icons** | **Lucide** (lucide.dev), Heroicons, Phosphor | Typically MIT/ISC — confirm | Copy the individual SVG paths inline. Do **not** add an icon-font or a package. Extends the existing `_ICONS` map in `app.js`. |
| **Exercise illustrations** | **Draw them yourself** — original schematic SVG (start pose, end pose, motion arrow) | Yours outright | **Strongly preferred.** Two-tone line figures on the dark canvas match Ember and carry zero legal risk. |
| **Exercise images (fallback)** | **wger** (already the library source); **free-exercise-db** (yuhonas on GitHub) | wger content is generally CC-BY-SA — **attribution is mandatory**; verify before shipping | If used, download once at build time, commit locally, and add a visible credits screen. Never hotlink. |
| **Anything from a competitor** | — | — | **Forbidden.** Do not scrape or embed exercise GIFs/photos/animations from other fitness apps or sites. This is the fastest way to get the project taken down. |
| **Illustrations / empty states** | unDraw, Open Peeps, Humaaans | Usually permissive/CC0 — confirm | Recolour to the Ember accent. Use sparingly; one good illustration beats five. |
| **Photography** (landing page only, not the app) | Unsplash, Pexels | Free licence, confirm per-image | Download, compress to WebP, commit. Keep out of the app shell for weight reasons. |
| **Sounds** (rest-timer end) | Freesound (filter **CC0**), or synthesise with the Web Audio API | CC0 only | **Best option: generate the tone in code** — a 2-oscillator chime is ~15 lines, weighs nothing, needs no licence. |
| **Fonts** | **System stack only** | n/a | Non-negotiable — external fonts break offline. |
| **Animation** | Hand-written CSS/SVG | n/a | No Lottie, no GSAP. |

**Give Cursor this instruction verbatim:**

> For every asset you add: download it at build time, optimise it (SVGO for SVG, WebP ≤80 quality for raster), commit it under `assets/`, add it to the `sw.js` cache list, and append a row to `assets/CREDITS.md` recording the source URL, the licence and the date retrieved. If a licence requires attribution, add a visible Credits entry in Me → About. If you cannot confirm a licence, do not use the asset — draw an original SVG instead. Never reference a remote URL at runtime.

---

## 8. Suggested order

1. **Phase 12** — the spine. Nothing else matters until a 58 kg bulker stops being told to eat 2200 kcal.
2. **Phase 13** — onboarding, so the spine has inputs.
3. **Phase 14** — templates, builder, orphans.
4. **Phase 15** — honesty, a11y, real-device.
5. Then §6 features, then §7 assets.

## 9. Before you ship to anyone else

- Back up your real data and verify the migration.
- Get the injury/form-cue content reviewed by a physio, given the shoulder history.
- Test on a real iPhone, installed, offline, in a gym.

---

*Audit method: static analysis plus live execution at a 390 px viewport — four synthetic personas, all 15 screens, export/import round trip, SW-vs-filesystem diff, contrast and tap-target sampling. Confidence is graded per finding in §3; anything marked untested was genuinely not tested and should not be assumed working.*
