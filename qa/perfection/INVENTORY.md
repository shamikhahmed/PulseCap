# PulseCap — Perfection v3 INVENTORY
Seeded from §13.2 + `js/app.js` SCREEN_ALIASES / NAV_PARENT / `reg()` + MODULE_SRC · 2026-10-14

Live entry: `/PulseCap/?demo=1` · Stack: static JS PWA (MODULE_CHAIN defer) · own Pages · ver 6.44.0

## Primary tabs (Ember IA)
| ID | Screen | Nav label |
|---|---|---|
| S-DASH | `dashboard` (alias: today/home/briefing/assistant/coach) | Today |
| S-WORK | `workout` (alias: train/log/search/cardio/calisthenics) | Train |
| S-PROG | `progress` (alias: body/bodymap/physique*) | Progress |
| S-PLAN | `my-plan` (nav id `programs`; alias: plan/explore/learn/hub) | Programs |
| S-SET | `settings` (alias: me) | Me |

## Nested / secondary screens
| ID | Screen | Parent tab |
|---|---|---|
| S-ACTIVE | `active` | workout — live session |
| S-LIB | `library` | workout — 1,872 exercises |
| S-GUIDE | `guide` | workout — Training Guide (6.44) |
| S-CARDIO | `cardio` | workout |
| S-PHOTOS | `photos` | progress — physique photos |
| S-IMPORT | `plan-import` | programs |
| S-SPLIT | `split-builder` | settings |
| S-EQUIP | `equipment-setup` | settings |
| S-REC | `recovery` | settings — readiness |
| S-REHAB | `rehab` | settings |
| S-NUT | `nutrition` | settings |
| S-PROFILES | `profiles` | settings |
| S-ONBOARD | `onboarding` (+ intro via alias) | first-run |
| S-BRIEF | `briefing` → dashboard alias | — |

## Shell / global
| ID | Surface | Notes |
|---|---|---|
| S-SPLASH | Splash | until `__APP_READY__` / `data-boot-ready` |
| S-NAV | Bottom nav + desktop sidebar | 5 tabs; haptic on switch |
| S-TOP | Top bar / back chip | |
| S-TOAST | Toast live region | |
| S-MODAL | Modal dialog | Escape / focus trap |
| S-CELEBRATE | Celebration overlay | gated vibrate (PLS-V3-1) |
| S-DEMO | Demo banner | `?demo=1` |
| S-SW | SW update toast | |

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
