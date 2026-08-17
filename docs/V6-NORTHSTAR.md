# PulseCap v6 — North Star

**Date:** 2026-08-17  
**Version:** 6.6.0 · SW `pulsecap-v86` · **Personalized Program Intelligence**
**Constraints (owner):** 100% free · offline PWA · no Capacitor/native · no B2B · no pricing · no cloud AI/LLM APIs · Smart Coach = rule-based + local data.

## Spine (everything links)

| Piece | Role |
|-------|------|
| `js/coach-kernel.js` | AutoregEngine, VolumeLander, JointBudget, MesocycleEngine, PushPullEngine, SessionRecap, ReadinessCalibrator, CoachKernel, GymFloor, BeginnerMode |
| `js/training-plan.js` | Opt-in `trainingPlan`: rotation, deload, double progression, safety |
| `js/plan-import.js` | Local JSON / text-PDF / paste → review UI. No upload. No OCR (scanned PDFs rejected). |
| `js/data/plans/machine-ppl.js` | Built-in machine-only shoulder-safe PPL template |
| `js/data/foods-db.js` | Offline food library + FoodEngine |
| Logger RPE + voice | Persists on sets → Autoreg → next weight suggest |
| Today | Focus card (CoachKernel.oneThing) + last session recap + mesocycle chip + My Plan CTA |
| Smart Coach | intents today/status/RPE/meso/joints/push-pull/volume_status |
| Settings → Training | Gym Floor, Beginner Mode, manual RHR/HRV, My Plan |
| Nutrition | Food search + optional barcode → meal |
| Recovery | Mobility mini-flows |
| Learn Hub | Beginner Mode hides Anatomy/Calculators/Visualizations |
| SW | Update banner + reload when new worker waiting |

## Explicitly out of scope

- Capacitor / HealthKit / Watch / Live Activities / widgets
- Cloud LLM / paid APIs / accounts / prices / B2B coach dashboards
- Clinical medical claims / OCR for scanned PDFs / plan file upload to a server

## Honest ceiling (unchanged)

Still not a human in the room. Form video still optional via existing wger download. Smart Coach is smart **offline rules**, not generative AI. My Plan / Rehab copy is educational — not medical clearance. Barcode needs Chromium `BarcodeDetector`; voice needs SpeechRecognition (Safari varies).
