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
