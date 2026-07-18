# PulseCap iPhone soak checklist (v6.1.0)

Real-device pass — Playwright covers shell + safe-area math, not Dynamic Island / A2HS / Notifications delivery.

## Automated in CI (do not skip)
- [x] 320 / 375 / 393 / 430 phone shells — no horizontal overflow (`tests/viewport.spec.js`)
- [x] Floating nav clearance ≥ 100px padding-bottom on `#view` with simulated `--safe`
- [x] Light-theme `--txt3` contrast tokens stronger than 0.42 alpha
- [x] Gallery walk: every screen/tab/intro/onboarding/active, dark+light × mobile+desktop — visual integrity (no fatal chrome, no empty screen)
- [x] Functional battery: settings tabs, theme cycle, weight/meals/water, recovery, workout save, search, calculators, assistant, rehab, anatomy, quests, profiles, cardio, equipment, export
- [x] Persona sweep: demo + 5 sample athletes × every registered route

## Manual (real iPhone)
1. Open https://shamikhahmed.github.io/PulseCap on iPhone Safari.
2. Share → **Add to Home Screen**.
3. Open from Home Screen icon (standalone).

### Must pass on device
- [ ] Boot splash → Today without blank frame
- [ ] Dark + Light (Settings → Appearance) — muted captions readable
- [ ] Bottom nav never covers primary CTA after scroll (safe-area)
- [ ] Start workout → log set → rest timer → finish → save
- [ ] Rest notification when app backgrounded (Settings → enable; installed only)
- [ ] Plate calc + warm-up ramp on barbell compound only
- [ ] Search / Calculators / Academy load offline after first visit
- [ ] Photos: take/pick progress photo
- [ ] wger library sync once online, then offline form cues still work
- [ ] Landscape Train + Active logger — no clipped weight inputs
- [ ] VoiceOver: tab bar labels, search result buttons, set-done buttons

## After soak
Append findings to Brain note + `CHANGELOG.md` if bugs found.
