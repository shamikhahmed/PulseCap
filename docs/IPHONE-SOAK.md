# PulseCap iPhone soak checklist (v5.6)

Real-device pass — Playwright covers shell, not Dynamic Island / A2HS / Notifications.

## Setup
1. Open https://shamikhahmed.github.io/PulseCap on iPhone Safari.
2. Share → **Add to Home Screen**.
3. Open from Home Screen icon (standalone).

## Must pass
- [ ] Boot splash → Today without blank frame
- [ ] Dark + Light (Settings → Appearance) — text readable on all cards
- [ ] Bottom nav never covers primary CTA (safe-area)
- [ ] Start workout → log set → rest timer → finish → save
- [ ] Rest notification when app backgrounded (Settings → enable; installed only)
- [ ] Plate calc + warm-up ramp on barbell compound only
- [ ] Search / Calculators / Academy load (lazy Learn screens) offline after first visit
- [ ] Photos: take/pick progress photo
- [ ] wger library sync once online, then offline form cues still work
- [ ] Landscape Train + Active logger — no clipped weight inputs
- [ ] VoiceOver: tab bar labels, search result buttons, set-done buttons

## Viewports already in CI
- 320 / 375 / 430 phone
- 768 tablet
- 1280 desktop

## After soak
Append findings to Brain note + `CHANGELOG.md` if bugs found.
