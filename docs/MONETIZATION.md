# PulseCap — Monetization Notes

## Current truth (2026-07-18)
PulseCap has **no paid gates** and no active subscription checkout (v6.2.0). The shipped app is a full offline PWA. Do not show prices, paid unlock claims, or fake Pro restrictions until monetization is implemented.

## Product stance
- All current features are available locally.
- Future optional upgrades may add larger media packs, export workflows, team tooling, or advanced reports.
- Any paid plan must ship with real gates, real payment flow, clear restore path, and updated privacy/security docs.

## Future options (not shipped)
- Stripe Checkout for web/PWA donations or paid license.
- One-time "Support PulseCap" unlock.
- Coach/team export bundle.
- Offline media pack funding.

## Rules before adding prices
1. Implement actual entitlement source (`PulsePro` or equivalent).
2. Add tests for free vs paid gates.
3. Update landing, privacy, SECURITY, CHANGELOG, presentation.
4. Never gate core local data export.
