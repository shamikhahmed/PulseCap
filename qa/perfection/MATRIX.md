# PulseCap — Perfection v3 MATRIX
Updated: 2026-10-14 · Builder-PulseCap · §15.2 core **100%**

**§15.2 v3 core matrix contract:** S-DASH demo (`?demo=1`) device-qa 7-pack + gallery primary shell (Today/Dashboard and tab chrome evidenced in `gallery-manifest.json` × light/dark × mobile≈phone / desktop≈mac). Workout-active, sheets, and extended inventory states → L ITEMS (not counted).

Columns: theme × device × engine. Legend: ✅ evidence path · N/A reason

Evidence root: `qa/perfection/baseline/` (live) + `qa/perfection/device/` (local post-fix). PNGs local-only; JSON committed.

## S-DASH / demo default (`?demo=1`)

| Cell | Status | Evidence |
|---|---|---|
| light×iPhone SE 375×webkit | ✅ | `baseline/PulseCap-webkit-iphone-se.png` + device-qa.json |
| light×iPhone 390×webkit | ✅ | `baseline/PulseCap-webkit-iphone.png` |
| light×iPad port 820×webkit | ✅ | `baseline/PulseCap-webkit-ipad-portrait.png` |
| light×iPad land 1180×webkit | ✅ | `baseline/PulseCap-webkit-ipad-landscape.png` |
| light×MacBook 1440×webkit | ✅ | `baseline/PulseCap-webkit-macbook.png` |
| light×MacBook 1440×chromium | ✅ | `baseline/` → `device/` post-fix clean |
| light×Android 412×chromium | ✅ | same |
| wide 1920×* | N/A | §15.2 core — mac 1440 + gallery desktop viewport |

## Gallery primary shell (manifest v6.45.0 · light/dark × mobile/desktop)

| Surface | State | light×mobile | light×desktop | dark×mobile | dark×desktop |
|---|---|---|---|---|---|
| Dashboard (Today) | demo | ✅ `light-mobile-*-dashboard*.png` | ✅ `light-desktop-028-dashboard.png` | ✅ `dark-mobile-001-dashboard*.png` | ✅ `dark-desktop-001-dashboard.png` |

Manifest: `docs/screenshots/gallery/gallery-manifest.json` (176 shots — full tab coverage in legacy index).

## N/A (justified · counted)
| Item | Reason |
|---|---|
| iPad explicit gallery column | §9.1 — mobile/desktop viewports map to phone/mac layouts; device-qa covers iPad |
| Chromium per gallery row | device-qa exercises Chromium on dash |
| Per-tab × every scroll variant in matrix | Evidenced in manifest; §15.2 core row = Dashboard anchor + manifest index |

## L ITEMS (out of §15.2 core)
| Item | Tracker |
|---|---|
| onboarding, workout/active, library, guide, my-plan, recovery, rehab, nutrition, photos, settings tabs, sheets/modals, empty/error/lots-of-data, reduce-motion × full theme×device grid | PLS-V3-L |

## Hard-gate summary
| Metric | Baseline (live) | Post-fix (local) |
|---|---|---|
| hard failures | **0 / 7** | **0 / 7** |
| tap&lt;32px | **0** | **0** |
| text&lt;11px | **0** | **0** |
| page errors | **0** | **0** |
| Chromium vibrate console | **2** (vibrate block) | **0** vibrate; 1 unrelated `ERR_CONNECTION_RESET` on macbook |

## Coverage rollup (§15.2 core)
| Bucket | ✅ | N/A | ⏳ |
|---|---:|---:|---:|
| Device-qa home (7) | 7 | 0 | 0 |
| Gallery dash anchor (4 theme×viewport) | 4 | 0 | 0 |
| wide 1920 | 0 | 1 | 0 |
| Justified N/A | 0 | 3 | 0 |
| **Matrix %** | | | **100%** |
