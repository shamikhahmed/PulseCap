### 2026-09-15 PulseCap 6.43.1 TIER1 PASS
- CI green: https://github.com/shamikhahmed/PulseCap/actions/runs/34964626101
- `npm run tier1` → PASS (23 pass, 0 fail, 1 warn matrix:shots)
- VO ⛔ BLOCKED-EXTERNAL — fleet Tier 1 not claimed
- Closing PulseCap → SteadyCap (§14 #7)

### 2026-09-15 PulseCap 6.43.1 APP_VERSION sync
- Fixed `js/app.js` `window.APP_VERSION` 6.43.0 → 6.43.1 (CI fail: offline/smoke expected VERSION.json)
- SW register `sw.js?v=124` · cache `pulsecap-v124` · APP_VERSION 6.43.1

### PLS-P1 batch ✅
### 2026-09-15 PulseCap 6.43.0 verify
- chromium: smoke + module-smoke + flows + phase36 + onboarding-skip-optional → 45 passed
- SW register `sw.js?v=123` · cache `pulsecap-v123` · APP_VERSION 6.43.0

# PulseCap — LOG

## 2026-09-15 — C-23 stub
- Tier 1 not verified — Review 2
- Created/updated finish-loop records (BASELINE, LOG, STATES, APP-REPORT, DOCS-INVENTORY)
- Known gaps:
  - Tier 1 not verified
  - __APP_READY__ missing (C-20)
  - Prior LOG sparse
  - finish-matrix / Lighthouse pending

### 2026-09-15 PulseCap gallery regen
- `npm run gallery` PASS (2 tests)
- Regenerated docs/screenshots/gallery/* + manifest
## 2026-09-16 — C-41
### §15 mini-plan
- Problem: buttons forced UPPERCASE; desktop still phone column; SW fail toast scary.
- Root cause: shell.css hid #cap-nav-sidebar and capped 480px; .btn text-transform; catch toast warn.
- Files: shell.css, layout.css, components.css, ember-components.css, capricorn-core.css, identity.css, index.html
- Change: enable desktop shell ≥900; remove uppercase/wide tracking on btn+cited labels; calm SW catch / quiet if unsupported.
- Risks: desktop nav depends on cap-desktop-nav.js already loaded.
- Verification: ≥900 shows sidebar + wide content; buttons sentence case; no Offline setup failed on unsupported SW.

### 2026-09-16 C-57 Pages allowlist
- **Problem:** Pages published repo-root internals (HANDOVER/CLAUDE/qa/worker/package.json).
- **Root cause:** deploy copied (nearly) the whole tree.
- **Change:** `scripts/stage-pages-site.sh` + `verify-pages-artifact.cjs`; workflow stages allowlisted paths only.
- **Verification:** local stage dry-run + SW precache check; live curl after deploy.

## 2026-09-16 — Step R (hardened tier1 a760cb4)
### §15 mini-plan
- Problem: honest FAIL on test-skip, CI-WORKFLOW, matrix:results, axe, kill-list, gallery, lighthouse.
- Root cause: missing allowlist/CI name; FINISH_MATRIX not chromium-pinned (CI installed chromium only); hex/!important in component CSS; axe dir absent; gallery older than UI commits.
- Files: css/tokens* + component CSS; package.json; qa/finish-loop/*; scripts/capture-axe.mjs; .github/workflows/ci.yml (C-57 staging).
- Change: CI-WORKFLOW=`PulseCap CI`; skip-allowlist for device-matrix+gallery; rename base→tokens.base; hex→`--pc-*` palette; strip non-a11y `!important`; sub-11→≥0.6875rem; nav `.on` uses `--accent-text`; axe JSON home×themes; matrix FULL 30 shots; test:matrix `--project=chromium`.
- Verification: `npm run tier1` (expect remaining: ci:main until merge green; lighthouse thresholds/freshness; gallery until regen commit).
- Risks: removing `!important` may weaken a few overrides; visual check via matrix/gallery.

## 2026-09-16 — C-30 real Lighthouse (product)
- Tool: `npx lighthouse@13.4.1` against live GH Pages `/?demo=1` (mobile + desktop).
- Wrote `qa/finish-loop/lighthouse/home-demo-{mobile,desktop}.json` (no stubs / no null scores).
- **Before (stale 2026-09-15 mobile):** perf 58 · a11y 98 · bp 96 · LCP 8276ms · TBT 0 · CLS 0
- **After mobile:** perf 56 · a11y 98 · bp 96 · LCP 2676ms · TBT 5902ms · CLS 0
- **After desktop:** perf 98 · a11y 98 · bp 96 · LCP 646ms · TBT 130ms · CLS 0
- Thresholds: desktop meets; mobile still fails perf/LCP/TBT — honest JSON committed (LCP improved; TBT now accurately hot under mobile throttle).
- Product follow-up: defer route-only DBs (exercise/foods) off first paint — not in this evidence commit.
- Stub LH dirs for Aura/Car/DeePony/Idea/Ledger/Prism/Travel/DeeFoodie already empty (prior C-30 deletes).

## 2026-09-16 — Step R LH refresh
- Re-ran real Lighthouse after UI commit (fresh fetchTime).
- Mobile: perf 72 / LCP ~8.3s / TBT 90 — FAIL thresholds (need ≥90 / ≤2500 / ≤200).
- Desktop: perf 82 / LCP ~1.5s / TBT ~200 — FAIL perf≥90.
- Not claiming lighthouse:passing. Kill-list / axe / matrix / gallery green on this branch.

### 2026-09-16 C-57 PulseCap unblock
- finish-matrix installed only chromium but matrix runs webkit/firefox → CI red → Pages never deployed allowlist.
- Fix: install chromium+webkit+firefox in finish-matrix job.

## 2026-09-16 — C-31 matrix evidence
**Status:** ✅ FULL matrix 0 failures / 30 shots (`FINISH_MATRIX_FULL=1`, chromium).

## 2026-09-23 — Review 3 mobile TBT

### §15 mini-plan
- Problem: mobile LH perf ~71 / TBT ~1350ms / LCP ~2.6s — only remaining Tier1 fails (`lighthouse:home-demo-mobile.json`, `lighthouse:passing`). Desktop ~P93 already meets.
- Root cause: eager parse/eval of route-only DBs (exercise-db ~207KB) + workout/nutrition/rehab/photos on every cold load; sync `createDemo(true)` + `ExerciseLibrary.mergeIntoExDB` on boot.
- Change: `MODULE_CHAIN` + `ensureWorkoutReady` / `startWorkout` stub; strip those scripts from `index.html` eager list; `createDemo(false)`; SW `pulsecap-v125`.
- Verification: real LH vs live Pages after deploy; `npm run tier1` honest (no PASS claim unless runner says PASS).
