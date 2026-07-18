# PulseCap — Distribution Notes

## Current truth (2026-07-18)
PulseCap ships as an **offline-first PWA only** (v6.2.0 / `pulsecap-v72`).

- Install: Safari → Share → Add to Home Screen (iOS) or Chrome install (Android/desktop).
- No Capacitor / Xcode / App Store binary in this repo.
- No HealthKit, Live Activity, WidgetKit, or RevenueCat unless owner explicitly reverses.

## Why PWA-only
- Same codebase for web + home-screen app.
- Offline via service worker (`pulsecap-v*` cache).
- Local data stays on device (`localStorage` + IndexedDB photos).

## If native is revisited later
1. Re-introduce Capacitor as an explicit product decision in Brain + HANDOVER.
2. Add entitlement gates, privacy disclosures, and App Store metadata before any store listing.
3. Do not market native features until they ship.

See also: `docs/MONETIZATION.md`, `SECURITY.md`, `HANDOVER.md`.
