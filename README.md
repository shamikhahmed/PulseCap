# PulseCap

**Version:** 6.2.4

**Your Smart Coach fitness operating system — by Capricorn Systems, built as a single offline-first PWA.**

🔗 **Live:** https://shamikhahmed.github.io/PulseCap  
📁 **Repo:** https://github.com/shamikhahmed/PulseCap

---

## What it is

PulseCap Pro is a comprehensive fitness tracking PWA built entirely in vanilla HTML, CSS, and JavaScript — no frameworks, no CDNs, no backend. It runs fully offline, installs on any device, and stores all data locally.

Built by Shamikh Ahmed across 14 development sessions as a production-grade personal project.

---

## Features

### 🏋️ Workout System
- **300+ exercise database** with coaching cues, setup, common mistakes, breathing, joint stress heatmap
- **Active workout logger** — set-by-set tracking with KG/reps inputs, circular checkmark, PR detection
- **Rest timer** — SVG ring countdown with Skip and +30s controls
- **PR detection** — automatic personal record tracking with 🏆 badge
- **Superset mode** — SS toggle for paired exercises
- **Quick Workout** — auto-generates 4-exercise × 3-set session
- **Custom exercise adding** — persisted to localStorage
- **Browse all exercises** — searchable/filterable library with difficulty + spotter flags

### ❤️ Cardio Protocols
- **HIIT** — Tabata, 30/30 intervals, work-rest pyramid
- **LISS** — Incline walk, fasted walk, steady bike
- **MISS** — Tempo run, rowing MISS, stair climber
- **SIT** — Wingate protocol, hill sprints
- **Fartlek** — Street fartlek, music-driven
- **Circuit Training** — Push-pull-legs, barbell complex, AMRAP
- Each with science notes, warmup/cooldown, warnings, session logging

### 🫀 Body Map & Measurements
- **Interactive SVG body map** — front/back, clickable muscles, recovery status
- **11-point measurements** — neck to calves, cm/in toggle, change tracking
- **Body stats** — BMI, BMR, TDEE, healthy range, weight history
- **Weight logging** — metric/imperial, goal tracking

### 🤖 Smart Coach
- **Daily Briefing** — readiness score, coach quote, today's plan, injury alerts, supplement reminders
- **5 coach personalities** — Maya (Sports Scientist), Alex (Drill Sergeant), Sam (Motivator), Zen (Mindful), Rex (Powerlifter)
- **3 coach tones** — Motivational, Scientific, Hardcore
- **Goal-aware insights** — fat loss, strength, hypertrophy, recomp, athletic, maintenance
- **Deload signals** — streak-based fatigue detection

### 💪 Recovery & Readiness
- **Readiness score** — sleep, soreness, stress, energy, hydration, streak, injuries
- **Muscle recovery grid** — 4-column tap-to-detail with recovery %
- **Injury system** — flags exercises by body part + joint stress, mark-recovered toggle

### 📊 Progress Tracking
- **Strength trends** — per-exercise SVG charts with goal line
- **Weight trend** — gradient fill chart, current label, goal line, imperial support
- **PR wall** — exercise records with date
- **Achievement system** — milestone badges

### 💊 Nutrition & Supplements
- **Macro tracking** — calories, protein, carbs, fat
- **Supplement logger** — timing-aware (morning/pre/post/evening), dose tracking
- **Water intake** — glass-by-glass tracking

### 👤 Multi-Profile System
- **Up to unlimited profiles** — each with isolated localStorage
- **Demo mode** — pre-populated with 16 workouts, 4 PRs, body stats
- **Legacy migration** — auto-imports single-profile data

### ⚙️ Settings
- **Dark & light modes** — Settings → Appearance
- **5-tab IA** — Today · Train · Body · Learn · Me (fixed; customization retired)
- **18 training splits + build-your-own** — PPL, Upper/Lower, Full Body, Arnold, PHUL, PHAT & more, plus a custom split builder with live exercise search
- **Real strength programs** — Stronglifts/Starting Strength linear progression (+2.5kg, auto-deload) and 5/3/1 training-max waves, prescribed straight into the logger
- **Weekly schedule** — split days auto-map to your gym days (Monday shows Monday's workout), editable per weekday; non-gym days give active-recovery guidance with a "Train anyway" option
- **Skip-day coach** — can't train? The engine decides like a trainer: shift the week forward or absorb the skip, with its reasoning shown
- **Habit loop** — weekly recap card, streaks that respect rest days (one freeze per week, milestones at 7/30/100), morning check-in, private progress photos (IndexedDB, on-device compression)
- **Goal-aware weigh-ins** — every weight log gets a coach reaction: on pace, eat more, or rein it in
- **Injury-aware training** — log injuries in Body → Rehab (severity + phased protocol); unsafe exercises auto-swap via avoid-lists and joint-stress ratings, with a "Modified for X" badge
- **Equipment selection** — filters exercises by available gear
- **Import/Export** — full JSON backup/restore

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Vanilla HTML5, CSS3, JavaScript (ES6+) |
| Storage | localStorage (multi-profile, key: `fos_profiles_[id]`) |
| PWA | Service Worker (cache-first), Web App Manifest |
| Charts | Hand-rolled SVG — no Chart.js |
| Icons | SVG stroke icons (`icon()` / `iconTile`) |
| Build | None — zero build step |

---

## Architecture
```
index.html          — Boot, service worker registration
css/
  base.css          — Design tokens, themes, animations (DO NOT EDIT)
  layout.css        — Nav, screens, topbar (DO NOT EDIT)
  components.css    — All component styles
js/
  app.js            — Router, icon system, lazy MODULE_SRC loader
  engines.js        — Smart Coach engines (Readiness, Coach, Muscle, Split, Program, etc.)
  coach-kernel.js   — RPE autoreg, volume lander, joints, mesocycle, GymFloor, BeginnerMode
  gym-tools.js      — WakeLock, VoiceLogger, BarcodeFood, MobilityFlow, PainFlag
  data/foods-db.js  — Offline food macros
  storage.js        — S object, multi-profile localStorage, seedPersonas
  modules/
    dashboard.js    — Today screen
    workout.js      — Exercise DB (300+), active logger, cardio, plates/warmup
    bodymap.js      — SVG body map, measurements, body stats
    coach.js        — Daily briefing / coach insights
    progress.js     — Charts, PRs, achievements
    nutrition.js    — Meals, macros, supplements, barcode
    recovery.js     — Readiness check-in + debt tab + mobility
    settings.js     — Settings tabs (profile/training/appearance/…)
    profiles.js     — Profile switcher, demo mode, sample athletes
    onboarding.js   — 4 intro slides + 7-step onboarding
    quests.js       — Quests, Academy, Physique Timeline body
sw.js               — Service worker (cache: pulsecap-v76)
manifest.json       — PWA manifest
```

---

## Roadmap

Shipped through **v6.2.4** (see `CHANGELOG.md`): Coach Kernel, gym tools (voice/barcode/wake/mobility/pain), RPE autoreg, mesocycle, offline foods, plate math, ProgramEngine, sample personas, gallery + CI `pages-gate`.

Still open / honest gaps (owner constraints):

1. **Apple Watch companion** — needs native; PWA-only today.
2. **True AR physique overlay** — camera body-segmentation (preview only so far).
3. **Full retail barcode DB** — offline stub map only; no cloud food API.
4. **Real-device iPhone soak** — checklist in `docs/IPHONE-SOAK.md` (manual).
5. **HealthKit / Google Fit** — sleep/steps import (not in PWA without native shell).
6. **Program sharing** — peer JSON templates (export exists; sharing UX not built).

---

## Install on iPhone

1. Open the live URL in **Safari**
2. **Share → Add to Home Screen**
3. Launch from home screen for full-screen PWA mode

## iPhone test checklist

- [ ] Intro slides and 7-step onboarding complete
- [ ] Bottom nav: Today · Train · Body · Learn · Me
- [ ] Active workout logger: sets, rest timer, PR badge
- [ ] Body map taps show muscle recovery detail
- [ ] Coach daily briefing renders with selected personality
- [ ] Import/export JSON works in Settings
- [ ] App works offline after first load
- [ ] No huge blank gap under content above floating nav (v6.0.0+)
- [ ] Safe area: nav and topbar clear notch / home indicator

See `docs/IPHONE-SOAK.md` for automated vs manual soak.

## Documentation

| Resource | Path |
|----------|------|
| User guide | [docs/GUIDE.md](docs/GUIDE.md) |
| Presentation | [docs/PRESENTATION.md](docs/PRESENTATION.md) |
| Landing page | [landing.html](landing.html) |

## Running Locally

```bash
git clone https://github.com/shamikhahmed/PulseCap.git
cd PulseCap
# Open index.html directly or serve with any static server:
npx serve .
# or
python3 -m http.server 8080
```

No install, no build step, no dependencies.

---

## Design Principles

- **Offline-first** — all data in localStorage, no API calls
- **iPhone-optimised** — tested on Safari 390px (XS Max → 16 Pro Max)
- **Zero framework** — vanilla JS only, `touch-action:manipulation` on all buttons
- **Dark-mode default** — cinematic design system with CSS custom properties
- **Progressive enhancement** — works without service worker, better with it

---

## Author

**Shamikh Ahmed**  
Director, NEWS Logistics · Founder, TheSolution360  
MSc Logistics & Operations Management, Cardiff University
MSc Accounting & Finance, BPP University London  
Karachi, Pakistan

---

*Built by Shamikh Ahmed — offline-first Smart Coach fitness OS.*

## Screen gallery

```bash
npm run gallery        # regenerate docs/screenshots/gallery/ (64 shots)
npm run gallery:view   # then open http://127.0.0.1:8766/screen-gallery.html
```

## Verify

```bash
npm run verify   # full Playwright suite — CI runs this on every push
```