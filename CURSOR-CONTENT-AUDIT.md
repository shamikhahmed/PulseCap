# PulseCap — Content & Data Audit + Phases 16–21 Looping Cursor Prompt

> Audited against **v6.21.0** (`e0f6057`) on 2026-08-18 by Claude Code. Content/data layer only — the code and personalization spine were audited separately in `CURSOR-PHASE12-AUDIT.md`.
>
> Every number below was measured, not estimated. Method is stated per finding so Cursor can re-run the same check and confirm the fix.

---

## 1. What exists today (measured)

| Dataset | Count | Verdict |
|---|---:|---|
| Exercises (`ExDB` in `js/modules/workout.js`) | **302** | Good size, **but 37 are duplicates** — see 2.1 |
| MET values | **302 / 302** | ✅ Complete |
| Joint-stress tags | 302 × 5 joints | ⚠️ Only 5 of 8 joints — see 2.2 |
| Splits (`js/data/splits-db.js`) | **21** | Present |
| Plan templates (`js/data/plans/catalog.js`) | **7** | Good |
| Injuries (`js/data/injuries-db.js`) | **26** | DB is rich; **only 5 actually filter** |
| Injuries offered in Settings | **8** | shoulder, knee, low_back, wrist, elbow, hip, neck, ankle |
| Injuries offered in onboarding | **3** | shoulder, knee, low_back |
| Foods (`js/data/foods-db.js`) | **35** | ⚠️ Very thin, no local cuisine |
| Sports | **5 real** (+4 plyos mislabelled) | ⚠️ Major gap |
| Muscle groups | 14 | legs 43, back 41, chest 37, shoulders 32, core 24, triceps 19, glutes 19, biceps 19, warmup 17, fullbody 17, cardio 15, sports 9, forearms 8, neck 2 |

Movement coverage that **is** fine (I re-checked after a bad first grep): Romanian/RDL 3, Deadlift 6, Farmer 3, Carry 2, Single-Arm 6, Lunge 5, Split Squat 1, Step-Up 2, Bulgarian 1.

---

## 2. Confirmed data defects — ordered by severity

### 2.1 — 37 duplicate exercises with **divergent data** (breaks progress history)
**Method:** `grep -ohE "\{n:'[^']+'" js/modules/workout.js | sort | uniq -d` → 37 names.

Duplicates are **not** identical copies. Example — `Hack Squat` appears at `workout.js:120` and `workout.js:346`:

| Field | Line 120 | Line 346 |
|---|---|---|
| `sec` | Glutes | Glutes, Hamstrings |
| `cns` | 2 | 3 |
| `met` | 5.0 | 6.0 |
| `tempoRec` | 2-0-1-0 | 3-1-1-0 |
| `progressions` | Back Squat | Barbell Squat |

**Why this is the worst bug in the data layer:** if history keys on exercise name or index, logging the same lift from two different entries **splits the history into two series**. That directly breaks the product's core promise — "this lift vs itself." Progress charts silently under-report.

Full duplicate list: Arnold Press, Assault Bike, Band Tricep Pushdown, Box Jump, Cable Curl, Cable Lateral Raise, Clean and Press, Close-Grip Bench Press, Dragon Flag, Dumbbell Pullover, Good Morning, Hack Squat, Inverted Row, Landmine Press, Leg Extension, Leg Press — Wide Stance, Machine Chest Press, Machine Shoulder Press, Meadows Row, Pallof Press, Pendlay Row, Push Press, Rack Pull, Reverse Lunge, Rowing Machine, Single-Arm Cable Pushdown, Sissy Squat, Smith Machine Squat, Spider Curl, Stair Climber, Straight-Arm Pulldown, Sumo Deadlift, Sumo Squat, Svend Press, Tate Press, Thoracic Rotation, Zottman Curl.

### 2.2 — Wrist, neck and ankle injuries silently do nothing (safety)
**Method:** counted `joint:{…}` keys across all 302 exercises.

```
shoulder: 302   elbow: 302   knee: 302   spine: 302   hip: 302
wrist:      0   neck:    0   ankle:   0
```

`js/core/equipment.js:83-108` checks all eight:
```js
if (joints.wrist && (stress.wrist || 0) >= 3) return false;
if (joints.neck  && (stress.neck  || 0) >= 3) return false;
if (joints.ankle && (stress.ankle || 0) >= 3) return false;
```
Because no exercise carries those keys, `stress.wrist` is always `undefined`, `(undefined || 0) >= 3` is always `false`, and **nothing is ever filtered**.

Settings offers all eight injuries. **Three of them are placebo.** A user declares a wrist injury, sees it accepted, and receives zero protection — a silent failure, which is worse than not offering the option. Directly relevant to the owner's use case: a wrist or neck flag today does nothing.

### 2.3 — No movement-pattern tagging
**Method:** `grep -c "pattern:" js/modules/workout.js` → **0**.

The original brief required each exercise to carry a movement pattern (horizontal/vertical push, horizontal/vertical pull, hinge, squat, lunge, carry, isolation, core). Without it the app cannot detect pattern imbalance ("you press 3× more than you pull"), cannot build balanced custom programs, and cannot substitute intelligently across equipment.

### 2.4 — 39 exercises have fewer than 2 substitutions
**Method:** counted entries whose combined `regressions[] + progressions[]` < 2. Also: 30 have `regressions:[]`, 31 have `progressions:[]`.

The brief required **2+ substitutions each**. For these 39, the Swap button has nothing useful to offer — and Swap is the feature that makes the app usable when a machine is occupied or a joint hurts.

### 2.5 — Sports coverage is 5, and 4 entries are mislabelled
Current `grp:'sports'`: Swimming Freestyle, Swimming Breaststroke, Padel, Basketball, Football/Soccer — plus **Box Jump, Depth Jump, Medicine Ball Chest Pass, Lateral Bound**, which are plyometrics, not sports, and should be `grp:'plyometrics'`.

Missing, with **cricket the most conspicuous** given the owner trains in Karachi: cricket (batting/bowling/fielding), badminton, squash, tennis, table tennis, volleyball, field hockey, running (road/trail), outdoor cycling, boxing, MMA/martial arts, climbing, hiking, dancing, golf, skiing, skating, rowing (water), CrossFit-style conditioning.

### 2.6 — Foods database is 35 items with no local cuisine
The owner's own plan PDF has an "Office lunch — Karachi Foods" section. The DB has 35 generic Western items (oats, eggs, Greek yogurt). Missing the entire subcontinental staple set: roti/chapati, naan, daal (chana/masoor/moong), chicken/beef karahi, nihari, biryani, pulao, haleem, qeema, seekh kebab, chicken tikka, raita, lassi, paratha, samosa, chana chaat, halwa puri.

### 2.7 — Splits DB (21) vs template catalog (7)
`splits-db.js` holds 21 splits (531, arnold, bro, cardio_strength, fb, fb_2, home, phat, phul, powerbuilding, ppl, ppl_5, push_pull, starting_strength, str, stronglifts, ul, ul_3, upper_lower_fb, custom). The catalog exposes 7 installable templates. **Verify** whether the other 14 are reachable as real programs or are legacy data the matcher ignores — if they are dead, either wire them up or delete them.

---

## 3. Areas I am LEAST confident about

Ordered least-confident first. **Treat everything in 3.1–3.4 as unknown, not as working.**

### 3.1 — Whether duplicates already corrupt existing history
I proved duplicates exist and diverge. I did **not** trace how logged sets key back to an exercise (name string? index? id?). If it is name-based, existing history may already be fragmented or may silently merge two different lifts. **This must be traced before any dedupe**, because a careless dedupe could orphan real logged sets. Highest-stakes unknown in this document.

### 3.2 — Safety and accuracy of the exercise content itself
302 exercises carry `cues`, `setup`, `breathing`, `mistakes`, and joint-stress ratings 0–3. I spot-read perhaps a dozen. **I have no basis to claim the other ~290 are medically sound**, that the joint ratings are calibrated consistently, or that the cues are safe for someone with a dislocation history. No clinician has reviewed this. Unchanged from the previous audit and still the single largest content risk.

### 3.3 — MET value accuracy
Coverage is 100%, but I verified **no individual value** against the Compendium of Physical Activities. If METs drive any calorie figure shown to the user, wrong values become wrong advice. I do not know whether they are sourced or invented.

### 3.4 — Whether the 26-injury DB is wired to anything
`injuries-db.js` has 26 entries; the UI offers 8; the filter understands 8; exercises tag 5. **Four different numbers.** I did not trace what the other 18 DB entries (runners_knee, plantar_fasciitis, tennis_elbow, rotator_cuff, herniated_disc, left/right variants…) actually drive, if anything. Left/right variants also raise a question the filter ignores entirely: it has no concept of side.

### 3.5 — Exercise library completeness by muscle
Neck has 2 exercises, forearms 8. I do not know whether that is a deliberate scope decision or a gap. Similarly, I have not checked whether every muscle group has enough machine-only options for a shoulder-limited user — the owner's actual constraint.

### 3.6 — Whether `splits-db`'s 21 splits work end-to-end
See 2.7. I counted them; I never installed one and ran a session from it.

### 3.7 — Substitution *relevance*, not just count
Fixing "39 have <2 subs" by padding the arrays would be worse than useless if the substitutes are not equipment-compatible or joint-safe. I have not evaluated whether existing substitutions are actually sensible swaps.

### 3.8 — Food macro accuracy
35 items with calorie/protein/carb/fat values. I verified none against USDA or any reference.

### 3.9 — Everything from the previous audit that remains untested
Real-iPhone behaviour, lock-screen rest timer, VoiceOver, Dynamic Type 200 %, migration of live 6.6.0 data. Unchanged and still open.

---

# ▼ PASTE INTO CURSOR ▼

# PHASES 16–21 — CONTENT INTEGRITY LOOP

You are continuing the Ember rebuild of **PulseCap** (offline-first training PWA, vanilla JS, no framework, no build step). Phases 1–15 are shipped at v6.21.0. This block fixes the **content and data layer**.

## Standing rules (never violate)
- Offline-first. No external runtime calls, no CDNs, no external fonts, no analytics.
- No framework, no bundler. Vanilla JS + plain CSS.
- **No 1RM estimator. No training-to-failure features. No "beat your record" pressure.**
- Compare an exercise **only against itself**. Never total or rank across machines. Per-side entries record plates per side, never a computed total.
- Educational, not medical. Never diagnose. Keep limitation cautions persistent, not one-time.
- No AI claims — the coach is rule-based.
- Every UI string escaped via `esc()`.

## Loop protocol — after EVERY phase, in order
1. `node --check` every changed `.js`.
2. `npx playwright test --project=chromium` — all green.
3. Boot the app; console must have **zero errors**; app must reach Today.
4. Visual check at **375 / 390 / 430 px** — no horizontal scroll, tap targets ≥44 px.
5. Append the phase result to `REBUILD-PROGRESS.md`.
6. Bump `VERSION.json`, `window.APP_VERSION`, the `sw.js` cache name and the `index.html` SW `?v=` query **together**.
7. `git commit` — one commit per phase, message explaining *why*.
8. **Continue immediately to the next phase.** Do not wait for approval.

Stop only if a verification step fails twice in a row and you cannot fix it, or a decision would materially change the product. Otherwise pick the simplest option consistent with these rules and keep going.

---

### PHASE 16 — Trace the history key FIRST, then dedupe (do not reorder these)

**16.1 — Investigate before changing anything.** Determine exactly how a logged set references its exercise: by name string, array index, or id. Write the answer into `REBUILD-PROGRESS.md`. **Do not touch the duplicates until this is documented.** If sets key by name or index, a naive dedupe will orphan or mis-attribute real logged history.

**16.2 — Add a stable `id` to every exercise** (slug form, e.g. `hack-squat`). Make logged sets reference the id. Write a migration that maps existing history onto the new ids, and a test proving a pre-migration backup restores with every set still attached to the right lift.

**16.3 — Merge the 37 duplicates.** They diverge (see the `Hack Squat` example: different `sec`, `cns`, `met`, `tempoRec`, `progressions`). For each pair, keep the richer record, merge the union of `regressions`/`progressions`, and pick the more conservative `cns`/`joint` values. If two logged histories exist for one lift, merge them into the surviving id — **never delete logged sets.**

**16.4 — Add a guard test** that fails the build if any two exercises share a name or an id.

Acceptance: 302 → ~265 unique exercises, zero duplicate names, every historical set still attached, backup/restore test green.

---

### PHASE 17 — Make wrist, neck and ankle limitations real (safety)

Right now `js/core/equipment.js` checks `stress.wrist`, `stress.neck` and `stress.ankle`, but **no exercise carries those keys**, so those three limitations filter nothing while appearing to work.

- Add `wrist`, `neck` and `ankle` stress ratings (0–3) to **all** exercises, using the same scale as the existing five joints.
- Rate conservatively and consistently. Guidance: front squat / upright row / heavy pressing load the wrist; overhead and behind-neck work load the neck; standing calf raises, jumps and lunges load the ankle. When genuinely unsure, rate **higher** — a false caution is safe, a missed one is not.
- Add a **test that fails if any exercise is missing any of the eight joint keys.** This class of silent gap must never recur.
- Extend onboarding's limitation list from 3 to the same 8 that Settings offers, so the two screens agree.
- **Attach persistent, plain-language cautions** to affected movements for each new joint, in the same style as the existing shoulder cautions. Never diagnose; keep the "a recurring or undiagnosed joint problem needs a doctor or physio" line visible.

Acceptance: declaring a wrist/neck/ankle limitation visibly changes the exercise list, the library and Swap. Write a persona test proving it.

---

### PHASE 18 — Movement patterns + substitution quality

**18.1 — Tag every exercise with `pattern`**, from a fixed vocabulary: `horizontal_push`, `vertical_push`, `horizontal_pull`, `vertical_pull`, `hinge`, `squat`, `lunge`, `carry`, `core`, `isolation`, `conditioning`. Add a test that fails on any untagged or out-of-vocabulary exercise.

**18.2 — Use patterns for real:**
- Surface a push/pull balance insight on Progress (one honest line, e.g. "you press about twice as often as you pull"). No score, no shaming.
- Make substitutions pattern-aware: a Swap should offer the **same pattern**, filtered by the user's equipment and joints.

**18.3 — Fix the 39 exercises with fewer than 2 substitutions.** Every exercise needs **2+ substitutions that are actually valid** — same pattern, plausible on the user's equipment, not contraindicated for common limitations. **Do not pad arrays to satisfy a counter**; an irrelevant substitute is worse than none. Add a test asserting ≥2 valid substitutions each.

---

### PHASE 19 — Sports, conditioning and energy

- **Reclassify** Box Jump, Depth Jump, Medicine Ball Chest Pass and Lateral Bound from `grp:'sports'` to `grp:'plyometrics'`.
- **Add the missing sports**, each with MET, primary muscles, a session-structure note and a plain description: **cricket (batting, bowling, fielding — the owner trains in Karachi, this is the top priority)**, badminton, squash, tennis, table tennis, volleyball, field hockey, road running, trail running, outdoor cycling, boxing, MMA/martial arts, climbing, hiking, dancing, golf, rowing (water), swimming (butterfly, backstroke), skipping intervals.
- **Source every MET value from the Compendium of Physical Activities** (Ainsworth et al.) and record the source and the value in a comment or a `source:` field. **Audit the 302 existing MET values against the same reference** and correct outliers — right now nothing indicates whether they were sourced or invented.
- If any calorie figure shown to the user derives from MET, label it an estimate and state the assumption.

---

### PHASE 20 — Food database, including local cuisine

- Expand `js/data/foods-db.js` from 35 items to a genuinely useful set (target 200+).
- **Add the subcontinental/Pakistani staples the owner actually eats** — the plan PDF has an "Office lunch — Karachi Foods" section: roti/chapati, naan, paratha, daal (chana, masoor, moong), chicken karahi, beef karahi, nihari, biryani, pulao, haleem, qeema, seekh kebab, chicken tikka, raita, lassi, chana chaat, samosa, halwa puri.
- **Every macro must come from a real reference** — USDA FoodData Central, or a national food-composition table for local dishes. Record the source per item. Do not invent numbers; a wrong protein figure becomes wrong advice.
- Keep portions realistic and labelled (per roti, per cup cooked, per 100 g) — ambiguous portions are the main source of tracking error.
- This stays **lite guidance, not a calorie tracker.** Do not grow it into a food diary with streaks.

---

### PHASE 21 — Reconcile injuries and splits; close the loop

**21.1 — Reconcile the four different injury numbers.** Today: 26 in `injuries-db.js`, 8 offered in Settings, 8 understood by the filter, 5 tagged on exercises (8 after Phase 17). Decide one canonical model and make every layer agree. Trace what the other 18 DB entries (runners_knee, plantar_fasciitis, tennis_elbow, rotator_cuff, herniated_disc, left/right variants) actually drive — wire them up or delete them, but do not leave them half-connected.

**21.2 — Decide on side-awareness.** The DB has `left_shoulder`/`right_shoulder` but the filter has no concept of side. Either implement side properly or collapse to a single joint. Half-support is the worst outcome.

**21.3 — Audit the 21 splits in `splits-db.js`** against the 7 catalog templates. For each of the 14 extras: install it, run a session from it, confirm it produces a coherent rotation. Wire up the good ones; delete the dead ones.

**21.4 — Coverage guarantee test.** For every combination of {equipment kit} × {each of the 8 limitations}, assert that a complete, trainable session can still be generated — every major muscle group has at least one valid, non-contraindicated exercise. This is the test that proves the content layer actually serves every user, and it is the real acceptance criterion for this whole block.

**21.5 — Final report.** Post counts before/after for every dataset, list every test added, and state plainly anything you could not verify.

▲ END ▲

---

## 4. Suggested order and why

16 first — the duplicate/id work touches every other dataset, and doing it after tagging would mean tagging duplicates twice. 17 next because it is the only **safety** defect. 18–20 are enrichment. 21 reconciles and proves coverage.

## 5. What still cannot be fixed from a dev machine

Unchanged from the previous audit and **not** addressed by anything above:
1. **Real-iPhone pass** — A2HS, lock-screen rest timer, VoiceOver, Dynamic Type 200 %.
2. **Migration of your live 6.6.0 data** — export a backup from Me before installing over it. Phase 16 makes this *more* important, because it rewrites how history keys to exercises.
3. **Clinical review** of the ~290 unreviewed exercise cue/joint records — see 3.2. Given the dislocation history, this is the item I would not skip.
