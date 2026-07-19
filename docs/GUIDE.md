# PulseCap — User Guide

PulseCap is your **Smart Coach fitness operating system** — an offline-first PWA for workouts, cardio, body tracking, nutrition, and rule-based coaching.

**Live app:** https://shamikhahmed.github.io/PulseCap  
**Version:** 6.2.1 · SW `pulsecap-v73`

---

## Getting started

1. Open PulseCap in Safari (recommended on iPhone).
2. Watch the **4 intro slides**, then complete **7-step onboarding** (goals, equipment, injuries, split).
3. Land on **Today** with your daily decision and readiness.
4. Install: **Share → Add to Home Screen**.

---

## Main navigation

Default tabs (v5 IA):

| Tab | Purpose |
|-----|---------|
| **Today** | Daily decision, readiness, prompts, quick actions |
| **Train** | Workout plans, active logger, cardio, calisthenics |
| **Body** | Body map, measurements, recovery, rehab, physique |
| **Learn** | Hub, encyclopedia, assistant, academy, calculators |
| **Me** | Progress, settings, profiles, equipment, custom split |

Pin extra screens via **Settings → Navigation** (min 3 tabs).

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
- **Training** — split, gym days, **Gym Floor Mode**, **Beginner Mode**, programs, equipment, manual RHR/HRV
- **Data** — export/import, optional wger form-media pack sync
- **Profiles** — multi-profile + Demo + “Load sample athletes”

---

## Offline & data

- All data in localStorage (`fos_profiles_[id]`); photos in IndexedDB
- Service worker cache-first (`pulsecap-v73`)
- No backend required · no account · no cloud sync
- Export JSON before device reset

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
