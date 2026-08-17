# PulseCap — User Guide

PulseCap is your **Smart Coach fitness operating system** — an offline-first PWA for workouts, cardio, body tracking, nutrition, and rule-based coaching.

**Live app:** https://shamikhahmed.github.io/PulseCap  
**Version:** 6.33.0 · SW `pulsecap-v113`

---

## Getting started

1. Open PulseCap in Safari (recommended on iPhone).
2. Watch the **1 intro slide**, then complete **4-step onboarding** (name/goal, calibration, limitations + educational disclaimer, confirm).
3. Land on **Today** with your daily decision and readiness.
4. Install: **Share → Add to Home Screen**.

---

## Main navigation

Default tabs (Ember IA):

| Tab | Purpose |
|-----|---------|
| **Today** | One session CTA + one insight |
| **Train** | Split picker, library, active logger |
| **Progress** | This-lift-vs-itself (no 1RM), history, optional bodyweight |
| **Programs** | Templates, custom builder, local import |
| **Me** | Limitations, equipment, settings, profiles |

---

## Workouts

### Active workout logger

1. Pick a program / split day or **Quick Workout**.
2. Log sets: weight (kg/lb), reps, **RPE (5–10)**, tap checkmark.
3. **Mic (voice)** — say e.g. `135 for 8 rpe 7` (Web Speech; Safari support varies).
4. **Pain flag** — marks joint → Rehab guidance.
5. **Rest timer** — SVG ring with Skip and +30s (installed-PWA rest notifications on iOS).
6. **Wake Lock** — screen stays on during active workout / Gym Floor Mode.
7. **PR detection** — automatic when you beat a record.
8. **Plate math + warm-up sets** on barbell compounds (when confirmed).
9. **Superset mode** — SS toggle for paired exercises.

### Food library

Nutrition → search offline foods → one-tap log. Optional **barcode scan** (Chromium `BarcodeDetector` + offline map — no cloud food API).

### Exercise library

- **300+ exercises** with cues, setup, mistakes, breathing, joint stress
- Search/filter by muscle, equipment, difficulty
- Injury-aware swaps when Rehab has an active injury
- Form cues via FormLoops (text/SVG — not video unless you sync wger clips in Settings → Data)

### My Plan

Me → Training → **My Plan**, or Today → My Plan.

- Install the built-in **machine-only, shoulder-safe PPL**, or import a PulseCap JSON / **text** PDF / pasted text on this device.
- Parsing is **local only** — nothing is uploaded. You must **review** every session before the plan is saved.
- **Scanned / image-only PDFs are unsupported** (no OCR). Use a text PDF, paste the program text, or import JSON.
- Today’s session is prescribed into the logger: sets, RPE, ROM stop cues, alternatives, cardio after lifting.
- Week 5 is a deload. Sunday is full rest. Load only increases when you hit the top of the rep range at RPE 8 with no relevant pain.
- Installing or importing requires a safety acknowledgement. Plans are training templates — **not medical clearance**.

### Strength programs

Stronglifts / Starting Strength linear progression and 5/3/1 TM waves prescribe into the logger and advance on save. Mesocycle chip on Today tracks 4-week blocks.

### Cardio protocols

HIIT, LISS, MISS, SIT, Fartlek, Circuit — science notes, warmup/cooldown, session logging.

---

## Smart Coach

Five personalities (Maya, Alex, Sam, Zen, Rex) × three tones (Motivational, Scientific, Hardcore).

**Honest:** Smart Coach / Fitness Assistant are **rule-based** — not an LLM. No cloud AI.

Coach adapts copy to your goal and flags deload / recovery when check-ins + streak signal fatigue.

---

## Body map & measurements

- Interactive SVG — front/back, tap muscles for recovery
- Measurement points — neck to calves, cm/in
- Weight log with goal line and trend
- BMI, BMR, TDEE, FFMI and related calculators
- Physique Score / Archetype / Timeline tabs

---

## Recovery & rehab

- Check-in: sleep, soreness, stress, energy, hydration
- Muscle recovery heatmap / readiness radar
- **Mobility mini-flows** (shoulders, hips, spine, full, ankles, wrists)
- Rehab library + active injury → workout auto-modify
- Streak protection mini-sessions when you miss a day

---

## Nutrition

Macro logging, water, supplements with timing. Quick-add meals + offline food search + optional barcode. Not a full retail product DB / meal planner.

---

## Settings essentials

- **Appearance** — Auto / Dark / Light (device default supported)
- **Training** — split, gym days, **Programs**, **Gym Floor Mode**, equipment kit, **Gym machines** (type-first; brand optional). Specific machines override the kit and actually filter the plan.
- **Foods** — search roti, karahi, oats… Macros are estimates per labelled portion.
- **Privacy / Data** — export/import, optional wger form-media pack sync
- **Profiles** — multi-profile + Demo + “Load sample athletes”

---

## Offline & data

- All data in localStorage (`fos_profiles_[id]`); photos in IndexedDB
- Service worker cache-first (`pulsecap-v113`)
- No backend required · no account · no cloud sync
- Export JSON before device reset

---

## Safety & medical disclaimer

PulseCap is a fitness logging and programming tool. Smart Coach, Rehab, and My Plan guidance are **educational only** — not medical advice, diagnosis, or clearance. Stop on sharp pain, clunk, or instability and see a clinician. Do not use the app as a substitute for a licensed trainer or healthcare professional.

---

## Tips

- Log injuries in Body → Rehab early — Train respects joint stress.
- Use Quick Workout when short on time.
- Check readiness before heavy compounds.
- Hard-refresh / reopen Home Screen icon after version bumps so SW updates.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Nav missing | Complete intro + onboarding |
| Exercises empty | Check equipment filter in Settings |
| PR not detected | Same exercise name as previous log |
| Data lost | Restore from Settings → Import JSON |
| Huge blank under content | Need ≥ v6.0.0 (double nav/safe padding fixed) |
| Stale UI after update | Kill PWA, reopen; or clear site data once |

---

*PulseCap © 2026 Shamikh Ahmed*
