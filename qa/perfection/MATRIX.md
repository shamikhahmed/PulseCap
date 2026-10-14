# PulseCap — Perfection v3 MATRIX
Updated: 2026-10-14 · Builder-PulseCap

Columns: theme × device × engine. Legend: ✅ evidence path · ⏳ pending · N/A reason

Evidence root: `qa/perfection/baseline/` (live) + `qa/perfection/device/` (local post-fix). PNGs local-only; JSON committed.

## S-DASH / demo default (`?demo=1`)

| Cell | Status | Evidence |
|---|---|---|
| light×iPhone SE 375×webkit | ✅ | `baseline/PulseCap-webkit-iphone-se.png` + device-qa.json |
| light×iPhone 390×webkit | ✅ | `baseline/PulseCap-webkit-iphone.png` |
| light×iPad port 820×webkit | ✅ | `baseline/PulseCap-webkit-ipad-portrait.png` |
| light×iPad land 1180×webkit | ✅ | `baseline/PulseCap-webkit-ipad-landscape.png` |
| light×MacBook 1440×webkit | ✅ | `baseline/PulseCap-webkit-macbook.png` |
| light×MacBook 1440×chromium | ✅ | `baseline/` (soft: vibrate pre-fix) → `device/` post-fix clean |
| light×Android 412×chromium | ✅ | same |
| dark×*×* | ⏳ | Phase C — force dark + capture |
| wide 1920×* | ⏳ | Phase C |

## Remaining inventory × states
⏳ Phase C — onboarding, workout/active, library, guide, my-plan, recovery, rehab, nutrition, photos, settings tabs, sheets/modals, empty/error/lots-of-data, reduce-motion × both themes × all devices.

## Hard-gate summary
| Metric | Baseline (live) | Post-fix (local) |
|---|---|---|
| hard failures | **0 / 7** | **0 / 7** |
| tap&lt;32px | **0** | **0** |
| text&lt;11px | **0** | **0** |
| page errors | **0** | **0** |
| Chromium vibrate console | **2** (vibrate block) | **0** vibrate; 1 unrelated `ERR_CONNECTION_RESET` on macbook |
