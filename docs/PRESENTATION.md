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

**PulseCap Pro** — production-grade PWA:

- 300+ exercise database with coaching cues
- Active set logger + PR detection + rest timer
- 5 Smart Coach personalities
- Body map, readiness, nutrition — one app

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

- Default **Carbon** theme: `#00d5ff` → `#7b5fff` gradient
- 8 themes total
- iPhone-optimised 390px → 16 Pro Max
- Cinematic dark default, light mode available

---

## Slide 10 — Architecture

```
app.js        — Router + Smart Coach engines
modules/      — dashboard, workout, bodymap, coach…
storage.js    — Multi-profile S object
sw.js         — cache-first PWA
```

14 dev sessions. Production-grade output.

---

## Slide 11 — Roadmap highlights

- Apple Watch companion (QR handoff)
- Periodisation planner
- Plate calculator
- Voice set logging
- Progress photo timeline

---

## Slide 12 — Try it

📱 shamikhahmed.github.io/PulseCap

🏋️ Complete onboarding → log your first set in 5 minutes

*Built by Shamikh Ahmed*
