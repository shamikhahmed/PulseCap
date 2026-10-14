# PulseCap — Perfection v3 ITEMS
Seeded from §13.2 + local baseline 2026-10-14. Status: only Auditor sets ✅ VERIFIED.

### PLS-V3-1 — `navigator.vibrate` before user activation
severity: P1     status: ✅ FIXED
Where: Chromium macbook + android · `?demo=1` boot · Evidence: baseline `errors` ×1 vibrate block each; post-fix `errors=[]`
Cause: `_renderScreen` called `haptic(10)` on first screen paint (and `celebrate` used raw `navigator.vibrate`) before any user gesture
Fix: `js/app.js` `canVibrate()` gates on `navigator.userActivation.hasBeenActive`; `haptic()` + `celebrate` use it
Test: device-qa post-fix hub-console/vibrate **0** · smoke assert no vibrate-before-activation console
Auditor: _(pending formal VERIFIED)_ · Live device-qa 2026-10-14: 7/7 hard=0, vibrate=0 on Pages 6.45.0

### PLS-V3-2 — hub screenshot stale (v4.5.1 / "300+ exercises")
severity: P2     status: ⏳ OPEN
Where: Hub `assets/screenshots/` + Capricorn OS window · Phase Hub / G
Note: Hand to Hub Engineer after Phase G gallery refresh (app is 6.44.0 / 1,872 exercises). Builder does not edit hub repo while PulseCap lock held.

### PLS-V3-3 — gallery v3 extend + viewer migrate
severity: P2 · status: **L (time-box 2026-10-14)**  
Where: `docs/screenshots/gallery/gallery-manifest.json` (manifest **6.43.1** / 2026-09-23) vs `VERSION.json` **6.45.0**  
Reason: Gallery Builder skipped full 178-shot `npm run gallery` refresh (≈45m+); live app is 6.45.0 clean — stale gallery assets only.  
Next: schema-v2 migrate + Training Guide coverage + shared v3 viewer (future Gallery wave).

## Hard-gate summary (local post-fix)
`qa/perfection/device/device-qa.json` — hard=0, tap&lt;32=0, text&lt;11=0, pageErr=0, vibrate console=0.
