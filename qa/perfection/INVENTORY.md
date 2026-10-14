# PulseCap — Perfection v3 INVENTORY
Seeded from §13.2 + `js/app.js` SCREEN_ALIASES / NAV_PARENT / `reg()` + MODULE_SRC · 2026-10-14

Live entry: `/PulseCap/?demo=1` · Stack: static JS PWA (MODULE_CHAIN defer) · own Pages · ver **6.45.0**

## Gallery screens (G17 — schema v2 · live `?demo=1`)
- Today — demo
- Train — demo
- Progress — demo
- Programs — demo
- Settings — demo

## Primary tabs (Ember IA — reference, not G17 rows)
S-DASH dashboard (Today) · S-WORK workout (Train) · S-PROG progress · S-PLAN my-plan / nav `programs` · S-SET settings (Me)

## Nested / secondary screens (reference — not G17 rows)
active · library · guide · cardio · photos · plan-import · split-builder · equipment-setup · recovery · rehab · nutrition · profiles · onboarding · briefing

## Shell / global (reference — not G17 rows)
Splash · bottom nav · top bar · toast · modal · celebration overlay · demo banner · SW update toast

## Forms (seed — expand Phase C)
onboarding profile (units kg/lb, goals, experience) · equipment checklist · set logging (weight, reps, RPE, rest timer, notes) · plan import (PDF text / JSON / paste + review) · custom split builder · cardio entry · nutrition food + barcode stub · body measurements · photo add · profile create/switch · settings (theme, units, nav, haptics)

## States (§7.9)
first-run/onboarding · demo (`?demo=1`) · empty · loading · active session · rest-timer · offline (SW) · update available · long library (1,872) · reduce-motion · light/dark

## Flows to exercise
onboarding → plan → start workout → log sets + rest timer → finish → progress/PRs → recovery score → Smart Coach suggestions → export

## Network / privacy
On-device primary. Optional: exercise form media links (external watch URLs on library detail). SW same-origin. Privacy: `privacy.html`. Support via hub (G-4).

## External links
`privacy.html` · `changelog.html` · GitHub issues · hub support
