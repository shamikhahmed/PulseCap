# PulseCap — UX / Layout Audit + Phases 22–27 Looping Cursor Prompt

> Audited against **v6.27.0** (`2011a81`) on 2026-08-18 by Claude Code, at 390 px, **both themes**. Every finding below was reproduced with a measurement, and the measurement is included so Cursor can re-run it to confirm the fix.
>
> The owner reported two bugs by feel — scroll jumping on every tap in Me, and dead space at the bottom. Both are real. Both have a **single systemic root cause each**, not a per-screen cosmetic issue, and there are four more defects of the same class that were found by looking for the pattern rather than the symptom.

---

## 1. The two reported bugs — root-caused

### 1.1 — Scroll jumps to top on every tap (reported: Me → gym days)
**PROVEN.** Scrolled `#view` to 400 px, tapped a control, measured again:
```
scrollJump: { before: 400, after: 0 }
```

**Root cause is the router, not the Me screen.** `js/app.js:207-233`:
```js
const SCROLL_PRESERVE_SCREENS = { bodymap: 1, recovery: 1 };
const preserveScroll = sameScreen && (
  (data && data.preserveScroll) || (!data && SCROLL_PRESERVE_SCREENS[id])
);
...
const scrollY = preserveScroll ? v.scrollTop : 0;
```

Every screen re-renders itself by calling `go('<same-screen>')` after a state change. Unless the screen is on that two-item allow-list, scroll resets to 0.

**Blast radius — 67 self-re-render call sites:**

| Module | Sites | Module | Sites |
|---|---:|---|---:|
| settings | **21** | photos | 4 |
| nutrition | 9 | recovery | 3 |
| onboarding | 8 | profiles | 2 |
| my-plan | 6 | rehab | 2 |
| workout | 6 | dashboard | 1 |
| equipment-setup | 5 | | |

Worse: **`bodymap` is aliased to `progress`** (`app.js:51`) and the alias resolves *before* `_renderScreen`, so the key `bodymap` in the allow-list is **dead code**. Only `recovery` actually preserves scroll. **66 of 67 sites jump.**

**The default is backwards.** Re-rendering the same screen is a *state update*, not navigation. It should preserve scroll by default and reset only when explicitly asked.

### 1.2 — Dead space at the bottom (reported: "large blank space in footer")
**PROVEN.** Measured content height vs viewport on Today at 390×844:
```
dashboard: contentEnd 459px, viewClientH 844px  →  ~385px of empty space (≈45% of the screen)
```
The gap is **not** stray padding — `#view` padding-bottom computes to 76 px for a 64 px nav, which is correct. The problem is that **short screens don't fill the viewport**: Today has only three blocks, and everything below sits as void.

**Contributing maintenance smell:** `padding-bottom` on the scroll container is declared in **two stylesheets** — `css/shell.css:28` (`calc(var(--nav-h) + var(--safe) + 12px)`) and `css/layout.css:25`, `:625`, `:628` (`calc(72px + max(12px, var(--safe)))`). Two sources of truth for the same property, resolved only by load order.

---

## 2. Four more defects of the same class (found by pattern, not report)

### 2.1 — Focus is destroyed on every re-render (accessibility; same root cause as 1.1)
**PROVEN.**
```
focusLost: { wasFocused: true, stillFocused: false, nowActive: "BODY" }
```
Focus an input, change anything, and focus lands on `<body>`. For a keyboard or VoiceOver user this is **worse than the scroll jump** — they lose their position in the form entirely and must tab from the top after every single toggle. This makes Settings effectively unusable with VoiceOver.

### 2.2 — Broken content gutter in Settings (both themes)
**PROVEN.** Histogram of left edges of form controls on Settings at 390 px:
```
left=0px : 12 elements   ← full-bleed, width 390 (breaks the gutter)
left=16px:  7 elements   ← correct
```
`SELECT.field`, `DIV.field-wrap` and `DIV.settings-section-title` render edge-to-edge while name/age/height/weight sit correctly at 16 px. Visible in light mode as text starting hard against the screen edge. Inconsistent gutters are one of the loudest "unfinished" signals in a UI.

### 2.3 — Settings tab bar wraps to two rows
**PROVEN.** Measured tab-bar height **88 px** (a single row is ~44 px). Eight tabs — Account, Training, Fuel, Appearance, Access, Alerts, Privacy, About — wrap onto a second line at 390 px, which looks broken rather than designed.

### 2.4 — Selecting your specific gym machines does nothing
**PROVEN.** `js/data/equipment-db.js` holds 13 brands and 68 items, and `equipment-setup` writes the user's picks to `user.equipmentIds`. But:
```
occurrences of "equipmentIds" in js/core/equipment.js: 0
```
The filter reads only the coarse `equipmentKit` (full gym / machines+cables / dumbbells / home). **Every specific machine the user selects is ignored when building the plan.** The screen looks functional and changes nothing — the same silent-failure class as the wrist/neck/ankle bug fixed in Phase 17. This is exactly the feature the owner is asking to have built out.

---

## 3. What is genuinely fine (checked, do not "fix")

| Check | Result |
|---|---|
| Horizontal overflow at 390 px | **None** on any of the 5 tabs |
| Duplicate DOM ids | **None** |
| `prefers-reduced-motion` | **7 rules** present |
| Bottom-nav active state | **Correct** — exactly one `.on`, others `#6E6E73` |
| `#view` padding vs nav height | 76 px vs 64 px — correct |

**Note on method:** the nav active state *looked* wrong in screenshots (two tabs appearing orange). The DOM disproved it — screenshots here are 2× downscaled and unreliable for fine colour judgements. Trust computed style over pixels.

---

# ▼ PASTE INTO CURSOR ▼

# PHASES 22–27 — UX INTEGRITY, LAYOUT, AND GYM-SPECIFIC EQUIPMENT

You are continuing the Ember rebuild of **PulseCap** (offline-first PWA, vanilla JS, no framework, no build step). v6.27.0 is shipped and live. This block fixes systemic UX defects and builds gym-specific machine selection.

## Standing rules (never violate)
- Offline-first. No external runtime calls, no CDNs, no external fonts, no analytics, no framework, no bundler.
- No 1RM estimator. No training-to-failure features. No streak that punishes rest days.
- Compare a lift only against itself. Per-side entries record plates per side, never a computed total.
- Educational, not medical. Limitation cautions stay persistent.
- Rule-based coach only — no AI claims.
- Escape every user string with `esc()`.
- **Fix causes, not symptoms.** If a defect has one root, fix the root once; do not patch it per screen.

## Loop protocol — after EVERY phase, in order
1. `node --check` every changed `.js`.
2. `npx playwright test --project=chromium` — all green.
3. Boot the app; console must show **zero errors**; app reaches Today.
4. Check at **375 / 390 / 430 px**, in **both light and dark**, on Today, Train, Log, Progress, Programs and every Settings tab.
5. Append the result to `REBUILD-PROGRESS.md`.
6. Bump `VERSION.json`, `window.APP_VERSION`, the `sw.js` cache name and the `index.html` SW `?v=` query **together**.
7. `git commit` — one per phase, message explains *why*.
8. **Continue immediately to the next phase.** Do not wait for approval.

Stop only if a check fails twice and you cannot fix it, or a decision would materially change the product.

---

### PHASE 22 — Fix the re-render contract once, in the router (highest priority)

The owner's most-felt bug. `js/app.js:207-233` resets scroll on same-screen re-render for all but two screens, and one of those two (`bodymap`) is dead because it is aliased to `progress` before `_renderScreen` runs.

**22.1 — Invert the default.** A same-screen re-render is a *state update*, not navigation:
- `sameScreen === true` → **always preserve `scrollTop`**, unless the caller passes an explicit `resetScroll: true`.
- `sameScreen === false` (real navigation) → reset to 0, as now.
- Delete `SCROLL_PRESERVE_SCREENS` entirely, including the dead `bodymap` key.

**22.2 — Preserve focus too** (this is the accessibility half of the same bug, and currently focus lands on `<body>` after every toggle). Before replacing the screen node, record `document.activeElement`'s stable identity (its `id`, or a `data-focus-key` you add to interactive controls) and its selection range if it is a text input. After the new node is mounted, restore focus and caret position. If the element no longer exists, focus the nearest surviving container rather than dumping focus to `<body>`.

**22.3 — Prove it.** Add tests that fail on regression:
- Scroll to 400 px on Settings, toggle a control, assert `scrollTop` is still ~400.
- Focus a `<select>`, toggle a control, assert `document.activeElement` is that same control.
- Run both for **every one of the 67 self-re-render sites** you can reach, or at minimum for settings, my-plan, workout, nutrition, photos, equipment-setup, profiles and rehab.

**22.4 — Consider incremental updates.** For high-frequency toggles (gym-day chips, unit switches), prefer patching the affected node over re-rendering the whole screen. Full re-render on every tap is what makes the app feel cheap.

Acceptance: tapping every control on every Settings tab never moves the scroll position and never loses focus.

---

### PHASE 23 — Fix vertical layout and the dead space

**23.1 — One source of truth for bottom padding.** `padding-bottom` on the scroll container is declared in both `css/shell.css:28` and `css/layout.css:25/625/628`. Delete the duplicates; keep one rule, in the shell layer, expressed as `calc(var(--nav-h) + max(var(--safe), 12px))`.

**23.2 — Short screens must not leave a void.** Today at 390×844 ends its content at 459 px, leaving ~385 px of empty space — about 45 % of the screen. Make short screens compose deliberately:
- Give the screen container `min-height: 100%` with a flex column layout so content distributes instead of clumping at the top.
- On Today specifically, use the space rather than padding it: the session card can breathe more, and a genuinely useful block (last session summary, next-session preview, or weekly consistency) can occupy the lower third. **Do not add filler** — if there is nothing worth showing, let the primary action sit optically centred instead of stranded at the top.

**23.3 — Audit every screen at 375/390/430 in both themes** for the same failure: content ending far above the fold with dead space beneath. Fix each by composition, not by adding empty spacers.

---

### PHASE 24 — Fix horizontal rhythm and the Settings tab bar

**24.1 — One content gutter, enforced.** On Settings, 12 elements render at `left: 0` (full-bleed) while 7 sit correctly at `left: 16px`. Offenders include `SELECT.field`, `DIV.field-wrap` and `DIV.settings-section-title`. Introduce a single layout primitive (e.g. `.screen-pad`) that owns the horizontal gutter, apply it consistently, and remove ad-hoc padding from individual controls.

**24.2 — Add a guard test:** assert that on every screen at 390 px, no visible interactive control has `left < 12px` or `right > viewport − 12px`, except elements deliberately marked full-bleed.

**24.3 — Fix the Settings tab bar.** Eight tabs wrap onto two rows (measured 88 px tall vs ~44 px for one). Choose one and apply it: a horizontally scrollable single row with momentum and fade-out edges, **or** collapse the eight tabs into a grouped list (the iOS Settings pattern, which suits eight sections better than tabs do). Do not leave it wrapping.

**24.4 — Sweep both themes.** Everything in this phase must be verified in **light and dark**. The gutter break is most visible in light mode.

---

### PHASE 25 — Make gym-specific machine selection actually drive the plan

Today `equipment-setup` writes `user.equipmentIds`, and `js/core/equipment.js` references `equipmentIds` **zero times**. The user picks their exact machines and nothing changes — a silent failure of the same class as the wrist/neck/ankle bug.

**25.1 — Wire `equipmentIds` into the filter.** Extend `canPerform(exercise, profile)`:
- If the user has configured specific machines, an exercise requiring a machine they do **not** have must be excluded from plans, the library and Swap.
- Keep `equipmentKit` as the coarse fallback for users who never open the detailed picker. Specific selection **overrides** the kit.
- Never leave a user with an empty plan: if their selection cannot fill a session, say so plainly and suggest the closest alternatives they *can* do, rather than silently returning nothing.

**25.2 — Map exercises to machine ids.** Each exercise needs to declare which specific machine(s) can perform it, with generic fallbacks (a "chest press machine" requirement is satisfied by any brand's chest press). Model this as machine **type** + optional brand, so brand is a labelling nicety and never a hard blocker.

**25.3 — Add a test:** a user who selects only a leg press and a lat pulldown gets a plan containing only exercises those two machines can perform, and is told clearly which muscle groups they cannot currently train.

---

### PHASE 26 — Expand the equipment catalogue

Currently 13 brands and 68 items, with 32 of 68 carrying no brand.

**26.1 — Expand meaningfully.** Cover the major commercial manufacturers the owner's users will actually meet: Life Fitness, Technogym, Hammer Strength, Precor, Matrix, Cybex, Nautilus, Hoist, Star Trac, Body-Solid, Rogue, Eleiko, plus Atlantis, Arsenal, Panatta, Gym80, Watson, Prime, and regionally common generic/no-brand plate-loaded equipment.

**26.2 — Structure it correctly.** The primary key is **machine type** (chest press, leg press, lat pulldown, pec deck, hack squat, seated row, leg curl, leg extension, cable crossover, Smith machine, assisted pull-up, …). Brand is metadata. **Do not require users to know their brand** — brand selection must be optional refinement, never a prerequisite, or the picker becomes a chore.

**26.3 — Make the picker fast.** 68 → several hundred items must not become an unusable list. Search, category filters, "select all in this category", and a "my gym" summary the user can edit later. Target: a user can describe a typical commercial gym in under two minutes.

**26.4 — Keep it honest.** Never claim plate markings are comparable across brands — leverage and pulley ratios differ. Keep the existing per-machine, compare-against-itself rule intact.

---

### PHASE 27 — Full-app QA sweep, both themes

**27.1 — Interaction sweep.** On every screen and every Settings tab, tap **every** control and verify: scroll does not move, focus is retained, no console error, no layout shift.

**27.2 — Theme parity.** Screenshot every screen at 390 px in **light and dark**. Check contrast (WCAG AA 4.5:1 for body text) on every token pair in both themes, not just the ones changed recently.

**27.3 — Width sweep.** 375 / 390 / 430 px: no horizontal overflow, no wrapped control bars, gutters consistent, tap targets ≥44 px.

**27.4 — Empty and extreme states.** Brand-new user with no data, user with one session, user with 500 sessions, longest exercise and food names in the DB. Nothing may overflow or look broken.

**27.5 — Report.** List every defect found and fixed, every test added, and state plainly anything you could not verify.

▲ END ▲

---

## 4. Order and rationale

22 first — it is the bug the owner feels on every single interaction, and it fixes an accessibility defect at the same time. 23–24 are layout, cheap once 22 is stable. 25 before 26 — **wire the plumbing before expanding the catalogue**, or you ship hundreds of machine options that still change nothing. 27 proves the lot.

## 5. Still not verifiable from a dev machine

Unchanged, and none of the above closes them:
1. **Real iPhone** — Add to Home Screen, lock-screen rest timer, VoiceOver, Dynamic Type 200 %. Note that Phase 22.2 directly improves VoiceOver usability, so re-test focus behaviour on device once it lands.
2. **Live 6.6.0 backup** — export from Me before overlaying any build.
3. **Clinical review** of cues and joint ratings.
