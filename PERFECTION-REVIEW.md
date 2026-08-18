# PulseCap — Perfection Review (Phase 31)

This file answers the six required interrogation questions for each shipped screen. Screen notes were written against v6.36.0 (post Phase 30 brand + launch polish); the closing section records Phases 32–36.

Findings are written from the current code contracts for each screen renderer (the `reg('<screen>', fn)` blocks) rather than from guesswork.

---

## Splash
1. Purpose: Provide a fast “app is starting” moment and establish the brand feel before the first screen renders.
2. Most important element: The app name (“PulseCap”) in the clipboard-splash board.
3. Remove?: The decorative clipboard animation could be removed if it no longer reduces perceived latency; keep only if it measurably helps “user knows it’s loading”.
4. Better elsewhere?: No—this is intentionally the pre-shell state.
5. New user: Sees brand title + “Today’s session — log fast, stay honest.” Nothing depends on data.
6. 6-month user: Same; should still reassure the user that the offline PWA boot succeeded.

---

## Welcome / Intro
1. Purpose: Invite the user into onboarding with a single “Get started” path and an optional Skip.
2. Most important element: The centered “Get started” primary CTA.
3. Remove?: The top-right Skip could be demoted or simplified if it creates “I skipped but nothing happened” risk (needs device verification, but code routes into onboarding).
4. Better elsewhere?: Keep Skip here; it’s an onboarding safety valve.
5. New user: Sees a single explanatory slide (“Run today’s session…”) and 3 educational bullets.
6. 6-month user: If they are already onboarded, they should not see this screen (router logic sends onboarded users to `dashboard`).

---

## Onboarding step 1 (Name + Goal)
1. Purpose: Collect identity (name) and pick a primary goal.
2. Most important element: Goal selection buttons (each with title/sub + selection check).
3. Remove?: The “Sex — used only for the calorie formula” header is part of Step 1; it’s required for Step 1’s next inputs, so no removal.
4. Better elsewhere?: Keep within Step 1 because validation requires Step 1 to be completed before Step 2.
5. New user: Sees the UI copy that names what the app will do offline (no account / no cloud / no ads).
6. 6-month user: Sees no onboarding if `S.g('onboarded')` is already set; scaling concern is handled by skipping this entire flow.

---

## Onboarding step 2 (Gym + Starting Size)
1. Purpose: Collect remaining calibration basics (experience, days/week, equipment kit, units, age).
2. Most important element: Days/week segmented control (it directly drives weekly schedule and plan generation).
3. Remove?: Size fields can be skipped; no part is required if user taps “skip” (the code validates only range constraints when values exist).
4. Better elsewhere?: Keep equipment kit and days/week here; later screens assume them to build a usable first `dashboard` plan.
5. New user: Sees explicit “Skip any size field you do not know.”
6. 6-month user: Same screen is never shown; if onboarding is repeated via reset flows, the form should remain stable and parseable.

---

## Onboarding step 3 (Limitations + Disclaimer Ack)
1. Purpose: Collect optional limitations and require acknowledgment of the educational disclaimer.
2. Most important element: Disclaimer acknowledgment input (gates Continue).
3. Remove?: The disclaimer is intentionally required (`_validateStep` denies Step 3 without `disclaimerAck`).
4. Better elsewhere?: Keep here because it is part of user safety comprehension before any plan is installed.
5. New user: Sees calm, educational wording (educational disclaimer; not “legal throat-clearing” style).
6. 6-month user: Same gating behavior; still should be clear and not punitive.

---

## Onboarding step 4 (Confirm / Optional Seed Plan + Finish)
1. Purpose: Complete onboarding and transition to the first usable “Today’s session”.
2. Most important element: The primary “Start training” / final CTA.
3. Remove?: No: this is the only user-confirm step before saving the profile.
4. Better elsewhere?: Keep final action here to avoid silently starting training on partial onboarding.
5. New user: Receives the “Welcome, <name>. Today’s session is ready.” toast and lands on `dashboard`.
6. 6-month user: Not shown unless onboarding is reset; transition must remain one tap to Today.

---

## Today
1. Purpose: Present the single next-session decision and the most immediate “start logging” action.
2. Most important element: The primary CTA button (Start workout / Start light session) at full width.
3. Remove?: The weekly dots card is useful but could be collapsed if it starts feeling like decoration; currently it communicates “rest days count, not a punish streak”.
4. Better elsewhere?: Keep the insight banner on Today; it’s the “one insight” requirement.
5. New user: Sees the session card + insight copy even if there’s no prior history (placeholder logic uses defaults from `Profile.deriveContext` and engines).
6. 6-month user: Should scale with longer names/muscle lists via `esc()` and truncation where needed; no secondary panels create deep scroll dependencies.

---

## Train (Workout start / pre-logger)
1. Purpose: Route from Programs → workout and provide the logger entry affordance.
2. Most important element: The “Start workout” entry path that creates the active logger state.
3. Remove?: Keep; if removed, there’s no consistent place to initialize logger state.
4. Better elsewhere?: It belongs in workout, not in Programs or Today.
5. New user: If no plan is installed, training still comes from the split + kit defaults.
6. 6-month user: Continues to work with persisted workouts history and plan templates; no UI re-model required.

---

## Log (Active logger inside Workout)
1. Purpose: Let the user record sets, weights, reps, RPE, and mark done per set.
2. Most important element: The active set entry rows (the “current input”).
3. Remove?: No; removing set rows breaks the core product.
4. Better elsewhere?: No; logging is the product’s primary workflow.
5. New user: Sees guidance copy (warmup/range cues + education), with “Start a workout first” safety when misused.
6. 6-month user: Must handle many sets and multiple exercises; should remain navigable without relying on animations.

---

## Rest timer
1. Purpose: Provide timed recovery between sets to improve adherence and consistency.
2. Most important element: The timer UI itself (and the “start/stop/next” control associated with it).
3. Remove?: No; rest timing is part of logged pacing (and tests cover wall-clock behavior).
4. Better elsewhere?: Keep as part of workout flow; rest can’t be generic across other screens.
5. New user: Should show a clear “time to rest” indicator without requiring extra configuration.
6. 6-month user: Should respect long sessions and still remain accurate.

---

## Progress
1. Purpose: Show periodization block, strength trend, workout history, body stats chart, and quick “progress photos”.
2. Most important element: The periodization block (“Training Block / Week / phases / sessions”).
3. Remove?: Strength chart is useful but can remain secondary; it’s already gated on logged data length.
4. Better elsewhere?: Keep on Progress; it’s a “read over time” screen, not a per-session screen.
5. New user: If no workouts exist, the chart and history parts should show “No data yet” CTAs instead of empty containers.
6. 6-month user: Shows trends with scrolling; nothing should require external resources for core info.

---

## Programs (My Plan)
1. Purpose: Manage templates and active training plans and start the planned session.
2. Most important element: The primary plan CTA (Review & install, or Start planned session).
3. Remove?: Don’t remove safety messaging: installs require safety acknowledgment; that’s product integrity, not decoration.
4. Better elsewhere?: Keep plan safety and import review in Programs so users can understand mapping before training.
5. New user: Sees template cards and import options with clear “nothing uploaded” semantics.
6. 6-month user: Maintains editing workflow without overwriting workout history; “remove plan — keep history” avoids data fear.

---

## Library (Exercise Library)
1. Purpose: Provide built-in exercise metadata and optional wger sync controls.
2. Most important element: The Exercise Library sync button (when used) and the “built-in / cached / media offline caveats”.
3. Remove?: Keep the “offline caching is optional” disclaimer; it’s an edge-state prevention.
4. Better elsewhere?: The shipped code renders Library controls in Settings → Privacy section, so it belongs under Me/Settings.
5. New user: Shows the built-in exercise count and clarifies that media/images may require network unless cached.
6. 6-month user: Sync button remains useful; built-in library keeps scaling even if offline.

---

## Me (Settings root)
1. Purpose: Present user profile controls and the product’s settings IA.
2. Most important element: The Settings tab bar (because it determines the user’s next action).
3. Remove?: Tab bar is required for navigation; do not remove.
4. Better elsewhere?: Keep on Settings because “Me” is inherently tabbed.
5. New user: Defaults should land them on an Account/Identity experience with minimal friction.
6. 6-month user: Tabs should stay consistent and avoid wrapping; scrolling and re-render contracts must preserve focus/position.

---

## Settings / Account
1. Purpose: Capture identity and core body metrics used to personalize calculations.
2. Most important element: Identity inputs (“Name”, “Age”, “Height”, “Weight”).
3. Remove?: No; these inputs drive nutrition + plan math.
4. Better elsewhere?: Keep in Account; it’s the canonical profile entry point.
5. New user: See simple unit labels and immediate plan-related metrics (“Plan snapshot”).
6. 6-month user: Keeps working with both metric and imperial; no heavy re-render chaos.

---

## Settings / Training
1. Purpose: Configure split, gym days, equipment kit, and training schedule behaviors.
2. Most important element: Split selection and gym-day chips.
3. Remove?: No: these choices directly determine Today and workout composition.
4. Better elsewhere?: It’s correct under Training.
5. New user: Guided prompts like “Pick your gym days above first”.
6. 6-month user: Supports edits without data loss.

---

## Settings / Fuel
1. Purpose: Control nutrition targets and macro presets and supplement stack entries.
2. Most important element: Macro target inputs and macro preset buttons.
3. Remove?: No; Fuel is the only place users adjust targets.
4. Better elsewhere?: Keep here; it’s separate from Training.
5. New user: Clear “Estimated TDEE” and recalculation action.
6. 6-month user: Should handle pinned/unpinned macro states without confusion.

---

## Settings / Appearance
1. Purpose: Choose theme behavior (Auto / Dark / Light) and coach personality/tone.
2. Most important element: The theme segmented buttons and coach chips.
3. Remove?: No; personalization is product identity.
4. Better elsewhere?: Keep under Appearance; other screens don’t own theme policy.
5. New user: Sees “Pinned — ignores your phone’s setting” language.
6. 6-month user: Theme preference should persist and not desync with meta/theme-color.

---

## Settings / Access (Accessibility)
1. Purpose: Adjust units and performance/comfort modes (reduced motion handling, low power).
2. Most important element: Motion & performance toggles.
3. Remove?: No; these influence perceived responsiveness.
4. Better elsewhere?: Keep in accessibility to match user expectation.
5. New user: Clear “System Reduce Motion is honored” messaging.
6. 6-month user: Should remain stable under device constraints.

---

## Settings / Alerts
1. Purpose: Configure reminder toggles and rest notification enablement guidance.
2. Most important element: “Enable rest notifications” guidance button.
3. Remove?: No; it prevents a dead-end (“background rest banners need install”).
4. Better elsewhere?: Under Alerts to match mental model.
5. New user: Sees the “Add to Home Screen (iOS 16.4+) once — never mid-workout” guidance.
6. 6-month user: Keeps reminders consistent.

---

## Settings / Privacy
1. Purpose: Handle on-device status, exercise library sync affordance, and export/import.
2. Most important element: Exercise Library “Sync wger library” and export/import controls.
3. Remove?: Keep privacy language; it clarifies offline-first constraints.
4. Better elsewhere?: Library controls belong here (implementation source of truth).
5. New user: Sees “All training data stays in this browser profile.”
6. 6-month user: Should scale to large histories without confusing the user about what’s backed up.

---

## Settings / About
1. Purpose: Provide version, positioning, and legal links.
2. Most important element: Version display and legal buttons.
3. Remove?: Don’t remove legal links; they’re trust-critical.
4. Better elsewhere?: Keep About as the canonical “what is this” page.
5. New user: Sees calm “PulseCap vX” and offline-first positioning.
6. 6-month user: Keeps “what changed” visible when paired with CHANGELOG updates.

---

## Phase 31 verdict (what to fix now)
No Apple-standard failures are known to require Phase-31 code edits, because the Playwright UX/contrast/a11y suite already validates:
- re-render contracts (focus + scroll),
- contrast at required widths,
- core navigation and manifest correctness.

Next phase candidates (not fixed here; handled in the brief later):
- Phase 32 motion meaning and splash floor (directional transitions + possible removal of artificial splash delay).

---

## Closing (Phase 36) — what changed, what we left, what we could not verify

### What changed in this pass (Phases 30–36)

- **Brand seam (30):** Ember accent `#FF7A1A` on the icon set; real maskable icons with safe-zone padding; one theme-color source (`#0A0A0B` dark / `#F5F5F7` light); iOS launch images; manifest copy and Library shortcut pointed at the real exercise library; last light-mode Deload chip contrast.
- **Interrogation (31):** This file. No layout splits were required; hierarchy already matches one job per screen.
- **Motion (32):** Removed the artificial 300 ms splash floor. Existing motion stays capped and respects `prefers-reduced-motion`.
- **Onboarding (33):** Guardrail that skipping optional size fields still reaches Today.
- **Edge states (34):** Encouraging gym-gap copy; storage-full toast names Export Backup; invalid plan JSON speaks in next-step English.
- **Docs/site (35):** README, GUIDE, landing, pitch, presentation, and Settings About copy match shipped positioning (offline training companion, 290 exercises). Pre-Ember `AUDIT.md` / `IA-RATIONALE.md` marked archived. Gallery regenerated.
- **Final verify (36):** Firefox/WebKit full suite (quota-stub test made cross-engine). Airplane-mode log-a-set → Progress. PWA chrome contract (theme-color tokens, maskable-only icons, iOS launch images). Fresh boot → Today with no page errors.

### What we chose not to change, and why

- **Clipboard splash mark:** It is the brand, not a delay. The delay was the problem; the mark stays.
- **Weekly consistency dots on Today:** They explain rest days; they are not a punishing streak. Removing them would hide the one honest weekly signal.
- **Onboarding disclaimer as a required tick:** Educational, not legalistic — it is the one gate before a plan exists. Skipping it would hide the stop-on-sharp-pain rule.
- **`AUDIT.md` / `IA-RATIONALE.md` kept, not deleted:** They are dated 30 July and describe a dead IA. Archiving them preserves history without presenting them as current truth.
- **No new animation system:** Directional push/pop already exists on screen enter/exit. Adding a second motion language would be decoration.

### Verified in this pass (automated)

- Chromium full suite: 143 passed / 1 skipped (device-matrix capture, opt-in).
- Firefox + WebKit: 284 passed / 2 skipped on the first full run; the only failures were the Chromium-only `localStorage.setItem` stub. After the prototype stub, the Phase 36 slice is green on all three engines (39/39).
- Widths 375 / 390 / 430, both themes: overflow, gutters, Settings tab row, contrast (including computed backgrounds and on-accent chips) — existing `ux-integrity` + `viewport` specs.
- Export → wipe → import restores workouts (`ember-spine`).
- Skip-optional onboarding still lands on Today.
- Offline: abort network after boot, log a set, open Progress.

### Could not verify (say so plainly)

1. **Real iPhone:** Add to Home Screen, lock-screen rest timer, VoiceOver, Dynamic Type 200%, and whether launch images actually paint before first JS. Desktop Playwright cannot stand in for a device.
2. **Live 6.6.0 backup overlay:** Must export from Me on the phone still running that build before installing over it. Not performed here.
3. **Clinical review** of ~290 exercise cue/joint records. Educational copy is not medical clearance; this remains the one item I would not ship without a clinician if dislocation history is in play.
4. **Installed-PWA status bar / standalone chrome on a physical Home Screen icon.** Code and manifest match Ember tokens; the OS chrome was not observed on a device.

A product is finished when someone who has never seen it can open it, understand it, and use it on a gym floor without being taught. The seams this pass could reach in a desktop browser now match that bar. The three items above still need a human with an iPhone.

