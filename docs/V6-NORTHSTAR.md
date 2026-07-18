# PulseCap v6.0 — North Star (shipped)

**Date:** 2026-07-18  
**Version:** 6.0.0 · SW `pulsecap-v70`  
**Constraints (owner):** 100% free · offline PWA · no Capacitor/native · no B2B · no pricing · no cloud AI/LLM APIs · Smart Coach = rule-based + local data.

## Spine (everything links)

| Piece | Role |
|-------|------|
| `js/coach-kernel.js` | AutoregEngine, VolumeLander, JointBudget, MesocycleEngine, PushPullEngine, SessionRecap, ReadinessCalibrator, CoachKernel, GymFloor, BeginnerMode |
| `js/data/foods-db.js` | Offline food library + FoodEngine |
| Logger RPE | Persists on sets → Autoreg → next weight suggest |
| Today | Focus card (CoachKernel.oneThing) + last session recap + mesocycle chip |
| Smart Coach | New intents: today, status, RPE, meso, joints, push/pull, volume status |
| Settings → Training | Gym Floor, Beginner Mode, manual RHR/HRV |
| Nutrition | Food search → log meal |
| Learn Hub | Beginner Mode hides Anatomy/Calculators/Visualizations |
| SW | Update banner + reload when new worker waiting |

## Explicitly out of scope

- Capacitor / HealthKit / Watch / Live Activities / widgets
- Cloud LLM / paid APIs / accounts / prices / B2B coach dashboards
- Clinical medical claims

## Honest ceiling (unchanged)

Still not a human in the room. Form video still optional via existing wger download. Smart Coach is smart **offline rules**, not generative AI.
