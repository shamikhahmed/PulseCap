# PulseCap — User Guide

PulseCap is your **Smart Coach fitness operating system** — a comprehensive, offline-first PWA for workouts, cardio, body tracking, nutrition, and coaching.

**Live app:** https://shamikhahmed.github.io/PulseCap

---

## Getting started

1. Open PulseCap in Safari (recommended on iPhone).
2. Watch the **4 intro slides**, then complete **12-step onboarding** (goals, equipment, injuries, split).
3. Land on the **Dashboard** with your daily briefing and readiness score.
4. Install: **Share → Add to Home Screen**.

---

## Main navigation

Customisable bottom nav (minimum 3 tabs). **Default tabs** (enterprise demo):

| Screen | Purpose |
|--------|---------|
| **Dashboard** | Readiness, coach quote, today's plan, quick actions |
| **Workout** | Exercise library, active logger, cardio protocols |
| **Smart Coach** (`assistant`) | Rule-based coaching chat — ask training questions |
| **Recovery** | Sleep/soreness check-in, muscle recovery grid |
| **Settings** | Themes, profiles, demo mode, import/export, injuries |

Additional screens (Body map, Progress, Nutrition, Hub explore, Rehab, etc.) are available via **Settings → Navigation** — pin any tab to the bottom bar.

---

## Workouts

### Active workout logger

1. Pick a program or **Quick Workout** (auto 4×3 session).
2. Log sets: weight (kg/lb), reps, tap checkmark to complete.
3. **Rest timer** — SVG ring with Skip and +30s.
4. **PR detection** — automatic 🏆 when you beat a record.
5. **Superset mode** — SS toggle for paired exercises.

### Exercise library

- **300+ exercises** with cues, setup, mistakes, breathing, joint stress
- Search and filter by muscle, equipment, difficulty
- Add custom exercises — persisted per profile

### Cardio protocols

HIIT (Tabata, 30/30), LISS, MISS, SIT (Wingate), Fartlek, Circuit — each with science notes, warmup/cooldown, and session logging.

---

## Smart Coach

Five personalities:

| Coach | Style |
|-------|-------|
| Maya | Sports Scientist |
| Alex | Drill Sergeant |
| Sam | Motivator |
| Zen | Mindful |
| Rex | Powerlifter |

Three tones: Motivational, Scientific, Hardcore.

Coach adapts to your goal (fat loss, strength, hypertrophy, recomp, athletic, maintenance) and signals deload when fatigue streaks build.

---

## Body map & measurements

- Interactive SVG — front/back, tap muscles for recovery status
- **11 measurement points** — neck to calves, cm/in toggle
- Weight log with goal line and trend chart
- BMI, BMR, TDEE, healthy range

---

## Recovery & readiness

**Readiness score (0–100)** from sleep, soreness, stress, energy, hydration, streak, injuries.

- Muscle recovery grid — 4-column tap for detail
- Injury flags block risky exercises by body part
- Mark-recovered toggle when healed

---

## Profiles

- Unlimited profiles — isolated `localStorage` per user
- **Demo mode** — pre-loaded with 16 workouts, 4 PRs
- Legacy migration imports old single-profile data automatically

---

## Settings essentials

- **8 themes** — Carbon (default cyan/purple), Aurora, Sunset, Midnight, Electric, Stealth, Forest, Light
- **6 training splits** — PPL, Upper/Lower, Full Body, Bro, Strength, Home
- **Equipment filter** — hides exercises you can't perform
- **Import/Export** — full JSON backup

---

## Offline & data

- All data in localStorage (`fos_profiles_[id]`)
- Service worker cache-first (`pulsecap-v62`)
- No backend required
- Export JSON before device reset

---

## Tips

- Set injuries early — exercise library respects joint stress heatmap.
- Use Quick Workout when short on time.
- Check readiness before heavy compounds — coach deload signals are streak-based.
- Carbon theme uses `#00d5ff` + `#7b5fff` — switch in Settings → Appearance.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Nav missing | Complete intro + onboarding |
| Exercises empty | Check equipment filter in Settings |
| PR not detected | Ensure same exercise name as previous log |
| Data lost | Restore from Settings → Import JSON |

---

*PulseCap © 2026 Shamikh Ahmed*
