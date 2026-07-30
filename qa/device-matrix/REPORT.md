# PulseCap device-matrix QA report

**Date:** 2026-07-30  
**App:** PulseCap **v6.5.2** · SW `pulsecap-v85`  
**Prompt:** Cap Fleet DEVICE MATRIX (looping)  
**Harness:** `npm run device-matrix` (`DEVICE_MATRIX=1`)  
**Shots:** 96 under `qa/device-matrix/{iphone|ipad|browser}/` · `meta.json` (PNGs gitignored)

Shell breakpoint: **tabs &lt;700px · sidebar ≥700px** (iPad mini 744 → sidebar).

---

## App hooks

| Hook | Value |
|------|--------|
| Path | `/Users/shamikhahmed/Desktop/Cap-Apps/PulseCap` |
| Live | https://shamikhahmed.github.io/PulseCap |
| Tabs | `#nav` / `.cap-premium-nav` |
| Sidebar | `#cap-nav-sidebar` · `body.cap-desktop-nav` |
| Demo unlock | `/?demo=1` |
| Dense list | `workout` |
| Secondary hub | `hub` |
| Overlay | `showLogWeight` modal |
| Lock stand-in | `#boot-splash` (rebuilt if router wiped) |

---

## 1. Matrix summary (post-fix)

| device-id | layout | overflow | verdict |
|-----------|--------|----------|---------|
| iphone-se … iphone-16-pro-max | mobile-tabs | no | **OK** |
| browser-phone-360 | mobile-tabs | no | **OK** |
| **ipad-mini** | **sidebar** | no | **OK** (was phone tabs / then neither) |
| ipad-air-11 · ipad-pro-11 | sidebar | no | **OK** |
| ipad-pro-13 · land | sidebar | no | **OK** |
| browser-sm-laptop … ultrawide | sidebar | no | **OK** · VER `v6.5.2` |

`layoutFails: []` · `overflowFails: []` from `probe-summary.json`. Viewport chromium: **8 passed** (incl. 744 / 699 Cap BP).

---

## 2. Fixed this loop

| Issue | Severity | Fix |
|-------|----------|-----|
| iPad mini/Air/Pro11 phone tabs | High | Shell MQ + CSS show **700px** |
| Sidebar still hidden 700–899 | Critical | `#cap-nav-sidebar { display:none !important }` was `max-width:899` → **699** |
| Demo banner vs island | High | `.dash-demo-banner` `padding-top: calc(10px + var(--top-safe))` |
| Lock shot blank / dashboard | Medium | Rebuild splash on `body` when router wiped `#view` |
| Viewport contract gap | High | Tests for 744 sidebar + 699 tabs |

---

## 3. What looks RIGHT

- SE / Pro Island Today: tabs labeled, home indicator cleared, chalk-red DNA
- iPad mini: desktop sidebar + brand PulseCap (`ipad-mini/dashboard.png`)
- Laptop settings About: `v6.5.2` synced with `APP_VERSION`
- Ultrawide: content max-width, not empty desert
- Zero horizontal overflow across matrix
- Overlay weigh-in sheet Save CTA present

---

## 4. Residual (Low — deferred)

- Spot light-theme matrix (dark covered; light once optional)
- Overlay Save vs home-indicator density on Island (sheet already `max(var(--safe),16px)`)
- Lock = splash stand-in (no PIN) — intentional for PulseCap; matrix rebuilds brand card when router wiped `#view`

---

## 5. Loop prompt

Reuse Cap Fleet master paste. Exit when Critical/High empty + probe clean (this report).
