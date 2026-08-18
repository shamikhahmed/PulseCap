# PulseCap — The Perfection Pass (Phases 30+)

> Written by Claude Code after auditing **v6.35.0** (`8afcb1b`). This is the final brief: not "fix these bugs," but **"is this actually a product Apple would ship?"**
>
> Findings are marked **VERIFIED** (I measured it) or **JUDGEMENT** (Cursor must decide with taste). Verified findings are non-negotiable. Judgement calls need a designer's eye, and the standard is stated for each.

---

## 0. The standard

The owner's ask: *"it should look like it was made by Apple, by senior developers."* That is not a styling request. Products that feel that way share four properties:

1. **Nothing is accidental.** Every element is where it is for a reason the designer could defend out loud.
2. **Nothing is stale.** No leftovers from a previous version of the idea — not in the icon, not in the copy, not in a manifest field nobody opens.
3. **Nothing is decorative.** Animation carries meaning (where something came from, what changed). Motion without meaning is noise.
4. **The seams are finished.** Launch, first run, empty states, errors, and offline all feel authored — not just the happy path.

PulseCap's *interior* now largely meets this bar. Its **seams and its brand do not**, and that is what this pass fixes.

---

## 1. VERIFIED — the brand is broken at the edges

These are measured facts, not opinions. They are also the highest-leverage fixes here, because they are the first and last things a user sees.

### 1.1 The app icon is from a different app
`icon.svg` is drawn in **`#00F2FF` — cyan**, the accent from *before* the Ember rebuild. The app's accent is now **`#FF7A1A`**. The icon on the Home Screen does not match the app it opens.

All raster icons are dated **17–19 July**. The Ember rebuild happened **17–18 August**. **Every icon predates the entire redesign.**

### 1.2 Three different "theme colors", none agreeing with the design system
| Source | Dark value | Should be |
|---|---|---|
| `manifest.json` `theme_color` / `background_color` | `#0d0d0f` | `#0A0A0B` |
| `index.html` `<meta name="theme-color">` | `#0A0A0B` ✅ | — |
| `applyTheme()` in `js/app.js` | `#0d0d0f` / `#f2f2f7` | `#0A0A0B` / `#F5F5F7` |
| `css/tokens.css` `--bg` | `#0A0A0B` / `#F5F5F7` | — |

`index.html` has the correct value, and **`applyTheme()` overwrites it with the stale one on every theme change.** The status bar and the app disagree by a few points of black — subtle, and exactly the kind of seam that reads as "unfinished" without the user knowing why.

### 1.3 No iOS launch screens at all
```
apple-touch-startup-image declarations in index.html: 0
```
Installed on iOS, PulseCap launches to a **blank flash** before the shell paints. Every app that feels native defines launch images. This is the single most visible "not a real app" tell on iPhone.

### 1.4 The maskable icon exists but is not used
`icon-maskable-512.png` is on disk and **referenced nowhere** — not in `manifest.json`, not in `sw.js`. Meanwhile `icon-192.png` and `icon-512.png` are declared `"purpose": "any maskable"` **without safe-zone padding**, so Android will crop into the artwork.

### 1.5 The manifest still sells the old product
`"description": "PulseCap by Capricorn Systems — your Smart Coach fitness operating system"` — the abandoned "fitness OS" positioning. Also: only 3 icon entries (no 96/144/256/384), and the "Exercises → Library" shortcut points at `?go=encyclopedia`, a screen that was deleted in the rebuild. It *redirects* via alias, so it is not broken — but a shortcut labelled "Library" that lands on Programs is a stale promise.

### 1.6 Marketing pages still describe the pre-Ember app
`changelog.html`, `pitch.html` and `presentation.html` still contain **"Performance OS" / "300+ exercises" / "full body map"** — the positioning the rebuild deliberately replaced. `AUDIT.md` (30 Jul) and `IA-RATIONALE.md` (30 Jul) predate the rebuild entirely and describe an IA that no longer exists.

### 1.7 One residual contrast failure
Light mode, unselected mesocycle chip: **`DELOAD` = 3.89:1** at 11px (needs 4.5). Everything else passes in both themes.

---

## 2. JUDGEMENT — where taste has to do the work

Cursor must evaluate these honestly and change what does not meet the standard. The instruction is *not* "add polish" — it is **"justify or fix."**

### 2.1 The interrogation, screen by screen
For **every** screen — Splash, Welcome/Intro, each Onboarding step, Today, Train, Log, Rest timer, Progress, Programs, Library, Me and every Settings tab — answer in `PERFECTION-REVIEW.md`:

1. **What is this screen for, in one sentence?** If it takes two, it is doing too much.
2. **What is the single most important element?** Is it visually the most important? If not, fix the hierarchy.
3. **Could anything be removed** without losing meaning? If yes, remove it.
4. **Is anything here better placed elsewhere?** Name the better place and move it.
5. **What does a brand-new user see** before any data exists? Does it teach, or apologise?
6. **What does a 6-month user see?** Does it still scale — 500 sessions, long names, many programs?

Fix what fails. Record the decision, not just the change — a reader should learn *why* the layout is what it is.

### 2.2 Motion with meaning
Audit every animation. The rule: **motion explains where something came from or what changed.** Anything else is deleted.

- Screen transitions should imply hierarchy — push forward, pop back — not a generic fade in both directions.
- Sheets rise from the edge they are anchored to and return there.
- The set-logged confirmation should feel physical and instant; it is the gesture the user performs most.
- Numbers that change should transition to their new value, not snap.
- Everything must respect `prefers-reduced-motion` (7 rules exist — verify they cover the new work).
- Nothing may exceed ~300 ms. If it feels slow, it is slow.

### 2.3 The launch sequence
Splash → first paint → Today must feel like **one continuous motion**, not three separate states. Currently there is a clipboard splash with a 300 ms floor. Judge honestly: does an artificial delay serve the user, or is it self-indulgent? If the app can paint in 180 ms, **let it**. A fast app that respects the user's time is more "Apple" than a staged animation.

### 2.4 Onboarding
It collects the right things now (verified in earlier phases). The question is whether it *feels* like a welcome or a form:
- Does the first screen make someone want to continue?
- Is the calibration step explained in language a nervous beginner understands?
- Does the disclaimer read as honest and calm, or as legal throat-clearing?
- Can someone who taps "skip" on everything still reach a usable Today? **Verify this actually works.**
- Does the last step *hand over* to the app with a clear first action?

### 2.5 Empty, error, and edge states
Design these deliberately, not by accident: no data yet · one session logged · a gym with almost no equipment (the gap banner exists — is it *encouraging* or defeatist?) · offline · storage full · import of a corrupt file. Each should tell the user what happened and what to do next, in plain language.

---

# ▼ PASTE INTO CURSOR ▼

# PHASES 30+ — THE PERFECTION PASS

You are finishing **PulseCap** (offline-first training PWA, vanilla JS, no framework, no build step), currently v6.35.0. The functional work is done. This pass makes it a product that reads as though a senior team at Apple shipped it.

Work through **every** phase below. There is no phase budget — correctness and craft matter more than speed. Do not stop early; do not skip a phase because it seems cosmetic.

## Standing rules (never violate)
- Offline-first. No external runtime calls, CDNs, external fonts, analytics, frameworks or bundlers.
- No 1RM estimator. No training-to-failure. No streaks that punish rest days.
- A lift is compared only against itself. Per-side entries record plates per side, never a fake total.
- Educational, not medical. Limitation cautions stay persistent.
- Rule-based coach only — never claim AI.
- Escape every user string with `esc()`.
- Fix causes, not symptoms. One root fix beats ten patches.
- **Never invent a number, a source, or a claim.** If you cannot verify it, say so.

## Loop protocol — after EVERY phase
1. `node --check` every changed `.js`.
2. `npx playwright test --project=chromium` — all green.
3. Boot the app; **zero** console errors; reaches Today.
4. Verify at **375 / 390 / 430 px**, in **light and dark**.
5. Append to `REBUILD-PROGRESS.md`.
6. Bump `VERSION.json`, `window.APP_VERSION`, `sw.js` cache name and the `index.html` SW `?v=` query **together**.
7. `git add -A && git commit` — message explains *why*.
8. **Continue immediately to the next phase.**

Stop only if a check fails twice and you cannot fix it, or a decision would materially change the product.

---

### PHASE 30 — Brand integrity (do this first; it is all verified fact)

**30.1 — Redraw the app icon.** `icon.svg` is `#00F2FF` cyan from the pre-Ember design; the app accent is `#FF7A1A`. Every PNG icon predates the rebuild by a month. Design one icon, in Ember, that works at 16 px and 1024 px, then export the full set: 48, 72, 96, 128, 144, 152, 167, 180, 192, 256, 384, 512, 1024. Keep it simple enough to read at 16 px — a mark, not an illustration.

**30.2 — Produce a real maskable icon.** `icon-maskable-512.png` exists but is referenced nowhere, while `icon-192/512` are declared `"any maskable"` without safe-zone padding. Generate a proper maskable variant (artwork inside the 80% safe zone), reference it correctly, and stop declaring the unpadded icons as maskable.

**30.3 — One source of truth for theme colour.** `manifest.json` says `#0d0d0f`, `index.html` says `#0A0A0B`, and `applyTheme()` overwrites the correct value with `#0d0d0f` / `#f2f2f7`. Make all three read the Ember tokens: `#0A0A0B` dark, `#F5F5F7` light. Fix `applyTheme()` so it stops clobbering the meta tag.

**30.4 — Add iOS launch screens.** There are currently **zero** `apple-touch-startup-image` declarations, so installed iOS launches flash blank. Generate launch images for the current iPhone sizes, in both light and dark, with `background_color` matching `--bg` exactly so launch → shell is seamless.

**30.5 — Rewrite the manifest.** Replace the "fitness operating system" description with the real positioning: *run today's session, log it in two taps, see honest progress — offline, on your device.* Point the "Library" shortcut at the screen that actually holds the exercise library. Add the full icon set. Verify `name`, `short_name`, categories and shortcuts all match the shipped app.

**30.6 — Fix the last contrast failure.** Light mode, unselected mesocycle chip `DELOAD` = 3.89:1 at 11px. Needs ≥4.5.

---

### PHASE 31 — The screen-by-screen interrogation

Create `PERFECTION-REVIEW.md`. For every screen — Splash, Welcome, each Onboarding step, Today, Train, Log, Rest timer, Progress, Programs, Library, Me, every Settings tab — answer the six questions in §2.1 of this brief, **in writing**, then fix what fails.

Rules:
- If a screen needs two sentences to explain its purpose, it is doing two jobs. Split it or cut one.
- If an element could be removed without losing meaning, remove it.
- If something belongs on another screen, move it and say why.
- The most important element on each screen must be the most visually prominent. No exceptions.

Deliverable: the written review **and** the changes it produced. A reader should finish it understanding why the app is laid out as it is.

---

### PHASE 32 — Motion with meaning

Audit every animation against one rule: **motion explains where something came from or what changed.** Delete anything else.

- Directional screen transitions (forward/back), not a symmetric fade.
- Sheets rise from and return to their anchor edge.
- Set-logged confirmation: immediate, physical, unmissable — it is the most-repeated gesture in the app.
- Values animate to their new number rather than snapping.
- Nothing over ~300 ms; verify `prefers-reduced-motion` covers all new work.
- Then **reconsider the splash floor.** If the app can paint in 180 ms, remove the artificial 300 ms delay. Speed beats theatre.

---

### PHASE 33 — Onboarding as a welcome

The data collected is correct. Make the experience match.
- First screen should invite, not interrogate.
- Explain calibration in language a nervous beginner understands.
- The disclaimer should read calm and honest, not legalistic.
- **Verify** that skipping every optional field still lands on a usable Today.
- The final step hands over with one clear first action.
- Time it end to end. If it exceeds 90 seconds of tapping, cut something.

---

### PHASE 34 — Every state, not just the happy path

Design deliberately: no data · exactly one session · a near-empty gym (is the gap banner encouraging or defeatist?) · fully offline · storage full · corrupt import file · longest exercise and food names in the DB · 500 sessions.

Each state says what happened and what to do next, in plain language. No dead ends, no apologies, no jargon.

---

### PHASE 35 — Documentation and site sync

Bring every artefact to the shipped truth:
- **`CHANGELOG.md`** — complete and accurate through the final version.
- **`HANDOVER.md`** — current architecture, the personalization spine, the data model, how to run tests, what is deliberately absent and why.
- **`README.md`** — what it is, how to run it, the constraints that define it.
- **Delete or rewrite stale docs.** `AUDIT.md` and `IA-RATIONALE.md` are dated 30 July and describe an IA that no longer exists. Either rewrite them against the current app or remove them — do not leave documents that contradict the product.
- **`changelog.html`, `pitch.html`, `presentation.html`** still say **"Performance OS" / "300+ exercises" / "full body map"** — the abandoned positioning. Rewrite to the real one.
- **Regenerate the full screenshot gallery** — every screen, both themes, at 390 px — and update `screen-gallery.html`. No orphaned PNGs, no shots of screens that no longer exist.
- Keep `FEATURES.md`, `ROADMAP.md`, `PRIVACY.md`, `SECURITY.md`, `QA-MATRIX.md` and `PERF.md` honest and current.

---

### PHASE 36 — Final verification, then ship

1. Full suite green on Chromium; run Firefox and WebKit too and report anything they surface.
2. Every screen, both themes, at 375 / 390 / 430: no overflow, no wrapped control bars, consistent gutters, all tap targets ≥44 px.
3. Contrast audit clean in both themes, gradients resolved correctly.
4. Offline: airplane mode → open, log a set, view progress.
5. Install as a PWA and confirm icon, launch screen, status bar and standalone chrome all match the app.
6. Fresh-install onboarding end to end, then export → wipe → import and confirm nothing is lost.
7. Write `PERFECTION-REVIEW.md`'s closing section: what changed, what you chose not to change and why, and **anything you could not verify.**
8. **`git add -A`, commit, and `git push` to `main`.** Confirm the live site serves the new version and that the service worker cache name changed so clients actually update.

▲ END ▲

---

## 3. What this pass cannot fix

Say so plainly rather than implying completeness:

1. **Real-iPhone behaviour** — Add to Home Screen, lock-screen rest timer, VoiceOver, Dynamic Type 200%. Phase 30's launch screens and Phase 32's motion work **must** be checked on a device; they cannot be validated in a desktop browser.
2. **The live 6.6.0 backup** — export from Me before overlaying a phone still running that build.
3. **Clinical review** of ~290 exercise cue/joint records. Given the dislocation history, this is the one item I would not ship without.

A product is not finished when the checklist is empty. It is finished when someone who has never seen it can open it, understand it, and use it on a gym floor without being taught. That is the bar.
