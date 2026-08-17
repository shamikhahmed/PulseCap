# PulseCap

**Version:** 6.33.0

**Your Smart Coach fitness operating system — by Capricorn Systems, built as a single offline-first PWA.**

🔗 **Live:** https://shamikhahmed.github.io/PulseCap  
📁 **Repo:** https://github.com/shamikhahmed/PulseCap

---

## What it is

PulseCap is a fitness tracking PWA built in vanilla HTML, CSS, and JavaScript — no framework, bundler, account, or backend. Core tracking works offline after first successful load and profile data stays on-device. Optional wger media and browser speech services can require network access.

Built by Shamikh Ahmed across 14 development sessions as a production-grade personal project.

---

## Features

### 🏋️ Workout System
- **My Plan** — opt-in training program: built-in **machine-only, shoulder-safe PPL**, or **local** text-PDF / JSON / paste import with mandatory review (no upload, no OCR; scanned PDFs unsupported). Prescribes today’s session into the logger.
- **290 unique exercises** with coaching cues, setup, common mistakes, breathing, eight-joint stress, movement pattern, and sourced MET
- **Active workout logger** — set-by-set tracking with KG/reps inputs, circular checkmark. Compare a lift only against itself (no 1RM estimator)
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

### 🤖 Smart Coach (rules, not AI)
- **Rule-based** Smart Assistant — local logs + engines, **not** an LLM or cloud AI
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
- **5-tab IA** — Today · Train · Progress · Programs · Me (fixed)
- **18 training splits + build-your-own** — PPL, Upper/Lower, Full Body, Arnold, PHUL, PHAT & more, plus a custom split builder with live exercise search
- **Real strength programs** — Stronglifts/Starting Strength linear progression (+2.5kg, auto-deload) and 5/3/1 training-max waves, prescribed straight into the logger
- **Weekly schedule** — split days auto-map to your gym days (Monday shows Monday's workout), editable per weekday; non-gym days give active-recovery guidance with a "Train anyway" option
- **Skip-day coach** — can't train? The engine decides like a trainer: shift the week forward or absorb the skip, with its reasoning shown
- **Habit loop** — weekly recap card, streaks that respect rest days (one freeze per week, milestones at 7/30/100), morning check-in, private progress photos (IndexedDB, on-device compression)
- **Goal-aware weigh-ins** — every weight log gets a coach reaction: on pace, eat more, or rein it in
- **Injury-aware training** — track conditions in Body → Rehab with educational guidance; high-stress exercises auto-swap via avoid-lists and joint-stress ratings, with a "Modified for X" badge
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
  training-plan.js  — opt-in trainingPlan engine (prescribe, deload, progression)
  plan-import.js    — local PDF/JSON/text plan import (review required)
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
    onboarding.js   — 1 intro + 4-step onboarding
    dashboard.js    — Today: one session + one insight
    workout.js      — Train hub + active logger (per-side, rest WakeLock)
    progress.js     — Training Block + this-lift-vs-itself SVG
    my-plan.js      — Programs tab (templates + local import)
    settings.js     — Me
    photos.js       — Progress photos (IndexedDB)
sw.js               — cache: pulsecap-v101
manifest.json       — PWA manifest
```

---

## Roadmap

Shipped through **v6.33.0** (see `CHANGELOG.md`): Ember rebuild Phases 1–27. Same-screen updates keep scroll and focus. Today fills the viewport. Settings gutters and a single-row tab bar. Gym-specific machines (type-first catalogue) actually filter the plan. Smart Coach is rules-based — not an LLM. No 1RM estimator.

Still open / honest gaps (owner constraints):

1. **Apple Watch companion** — needs native; PWA-only today.
2. **True AR physique overlay** — camera body-segmentation (preview only so far).
3. **Full retail barcode DB** — offline stub map only; no cloud food API.
4. **Real-device iPhone soak** — checklist in `docs/IPHONE-SOAK.md` (manual).
5. **HealthKit / Google Fit** — sleep/steps import (not in PWA without native shell).
6. **Program sharing** — peer JSON templates ship as My Plan export/import; text-PDF import is review-first (scanned PDFs unsupported).

---

## Install on iPhone

1. Open https://shamikhahmed.github.io/PulseCap in **Safari**
2. **Share → Add to Home Screen**
3. Launch from the home-screen icon for full-screen PWA mode (rest notifications require this on iOS)

## Safety & medical disclaimer

PulseCap is educational fitness software. My Plan, Smart Coach, and Rehab tips are **not medical advice or clearance**. Stop on sharp pain, clunk, or instability and see a clinician.

## iPhone test checklist

- [ ] Intro slide and 4-step onboarding complete
- [ ] Bottom nav: Today · Train · Progress · Programs · Me
- [ ] Active workout logger: sets, rest timer, PR badge
- [ ] My Plan: install machine PPL or review-first local import
- [ ] Progress: this-lift-vs-itself chart (no 1RM)
- [ ] Me: eight joint limitations change the library
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

- **Offline-first** — core data in localStorage; optional wger / speech may use the network
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
npm run gallery        # regenerate docs/screenshots/gallery/ (~348 shots; use --project=chromium)
npm run gallery:view   # then open http://127.0.0.1:8766/screen-gallery.html
```

## Verify

```bash
npm run verify   # full Playwright suite — CI runs this on every push
```