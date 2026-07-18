# PulseCap — Product Presentation

---

## Slide 1 — Title

# PulseCap
### Your Intelligent Training Partner

*300+ exercises · Smart Coach · Offline PWA*

**Live:** shamikhahmed.github.io/PulseCap

---

## Slide 2 — Problem

Fitness apps want your data in the cloud.

Gym sessions need **speed** — not login screens.

Serious lifters need **depth** — not generic 10-exercise libraries.

---

## Slide 3 — Solution

**PulseCap** — production-grade offline PWA (v6.2.0):

- 300+ exercise database with coaching cues
- Active set logger + RPE autoreg + PR detection + rest timer
- Gym tools: voice log, barcode food, wake lock, mobility, pain→rehab
- Smart Coach (rules) + body map + nutrition — one app

**Vanilla JS. Zero framework. Fully offline.**

---

## Slide 4 — Workout system

- Set-by-set logging (kg/reps)
- Superset mode
- Quick Workout generator
- Cardio protocols: HIIT, LISS, MISS, SIT, Fartlek, Circuit
- Custom exercises per profile

---

## Slide 5 — Smart Coach

| Personality | Voice |
|-------------|-------|
| Maya | Evidence-based |
| Alex | No excuses |
| Sam | Hype |
| Zen | Breath & intent |
| Rex | Strength culture |

Goal-aware + deload signals from fatigue streaks.

---

## Slide 6 — Body intelligence

- Interactive SVG body map
- 11-point measurements
- Injury system flags exercises by joint stress
- Readiness score 0–100

*Train smart, not just hard.*

---

## Slide 7 — Progress

- Hand-rolled SVG charts (no Chart.js)
- PR wall with dates
- Achievement milestones
- Weight trend with goal line

---

## Slide 8 — Multi-profile

- Unlimited isolated profiles
- Demo mode for exploration
- JSON import/export
- Legacy v1 migration on boot

Families, coaches, clients — one install.

---

## Slide 9 — Design

- Appearance: **Auto / Dark / Light** (device default supported)
- Brand accent cyan (`#00d5ff`) on dark cinematic shell
- iPhone-optimised 390px → 16 Pro Max; safe-area aware floating nav
- Stroke icon system (chrome); content emoji purged from primary UI

---

## Slide 10 — Architecture

```
app.js / engines.js / coach-kernel.js / gym-tools.js
modules/            — Today · Train · Body · Learn · Me
storage.js          — Multi-profile S + seedPersonas
foods-db.js         — Offline macros
sw.js               — cache-first PWA (pulsecap-v72)
```

Vanilla JS. Zero framework. Fully offline. **v6.2.0**.

---

## Slide 11 — Roadmap highlights

Shipped (v6): RPE autoreg, mesocycle, voice/barcode/wake/mobility, offline foods, gallery, personas, CI pages-gate.
Open (owner): Watch / HealthKit (native), full retail barcode DB, real-device soak.

---

## Slide 12 — Honest ceiling

Smart Coach = **rules**, not LLM. FormLoops = **cues**, not live form coaching.
Replaces a template + logbook for intermediates. Does **not** replace a good in-person trainer for beginners, rehab, or competition prep.

## Slide 13 — Try it

shamikhahmed.github.io/PulseCap

Complete onboarding → log your first set in 5 minutes

*Built by Shamikh Ahmed · Capricorn Systems*
