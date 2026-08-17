# PulseCap — Documented Screen Gallery

> v6.34.0 · Captures via `npm run gallery -- --project=chromium` → `docs/screenshots/gallery/` · Viewer: `screen-gallery.html`  
> Latest matrix: **176** shots (108 viewport + 68 scroll) · v6.34.0 capture · light mode uses `--accent-text` for readable orange labels

## How state is kept

| Concern | Store | Key / notes |
|---------|-------|-------------|
| Profile blob | `localStorage` via `S` | `fos_profiles_<id>` · schema v6 (`exId` on logged sets) |
| Active profile | `localStorage` | `fos_meta.activeId` |
| Theme pin | profile `user.theme` / `user.mode` | null = follow system |
| Settings tab | in-memory `_activeSettingsTab` | not persisted; deep link `go('settings',{tab})` |
| Active workout | `activeWorkoutDraft` | survives nav/reload |
| Photos | IndexedDB `pulsecap-photos` | keyed by `profileId` |

## Nav (every matrix shot)

Today · Train · Progress · Programs · Me — fixed. Nested screens light parent (`NAV_PARENT`).

---

## Today

| State | What | Selection / why |
|-------|------|-----------------|
| empty / day-one | Decision card + setup prompts | No workouts; queue ≤2 prompts |
| one / many | Readiness + plan + quick actions | Demo persona |
| keyboard-open | Weigh-in / check-in modals | Modal sheet + scroll lock |
| dark / light | Theme tokens | `--accent-text` on surfaces; `--accent` for fills |
| reduced-motion | No screen-enter bounce | `prefers-reduced-motion` |

**Why ordered this way:** one primary decision above the fold; secondary tools below.

## Train

| State | What |
|-------|------|
| workout hub | Start / splits / cardio entry |
| active | Logger + rest + plates + Gym Floor |
| empty progress | CTA start workout |
| many PRs | History charts |

**Selection:** exercise list rows; set checkboxes; weight number inputs.

## Body

| State | What |
|-------|------|
| bodymap | Parametric SVG map + tool strip |
| recovery check-in / debt | Tabbed recovery |
| nutrition empty/logged | Meals + water + barcode |
| photos empty/one | IndexedDB gallery |

**Why:** Body owns body state; Fuel *log* here, Fuel *targets* in Settings.

## Learn

| State | What |
|-------|------|
| hub | Directory rows (Search, Coach, Academy…) |
| beginner on | Advanced rows hidden |
| assistant | Offline Q&A history in `assistantHistory` |

## Me (Settings) — v6.6.0 groups

| Tab | States to capture | Selection | Persist |
|-----|-------------------|-----------|---------|
| Account | identity filled / injuries none | fields + selects | `user.*` |
| Training | split + gym days + My Plan | chips `aria-pressed`, toggles | `user.split`, `gymDays`, `trainingPlan` |
| Gym machines | type-first picker + My gym | search, category, select-all | `user.equipmentIds` — brand optional; type drives the plan |
| Fuel | macros + empty stack | number fields, Remove | targets + `supplements` |
| Appearance | Auto/Dark/Light; coach pick | segmented + radio cards | theme + personality |
| Access | Metric/Imperial; Low Power | segmented + switch | `user.units`, `settings.lowPower` |
| Alerts | all toggles; rest CTA | switches | reminder flags |
| Privacy | export ready; danger | file input + confirm modal | backup / reset |
| About | version stamp | links | read-only |
| My Plan | empty (demo matrix) / installed* | install, file picker, safety ack | `trainingPlan` — text PDF/JSON only; no OCR; no upload |
| Plan Import | empty (no draft)* | back to My Plan | in-memory import draft |

\*Default `npm run gallery` captures empty My Plan + empty Plan Import Review. Installed-plan and filled-review PNGs need a seeded draft (not in the matrix).

**Aliases:** `profile→account`, `nutrition|supplements→fuel`, `data→privacy`.

## Themes & motion

Capture matrix already covers dark+light × mobile+desktop. Reduced-motion: OS setting — no separate PNG required if gallery notes caption; function preserved.

## Regenerating

```bash
# Prefer Chromium-only — multi-project capture races the same PNG paths
CAPTURE_GALLERY=1 npx playwright test tests/gallery.spec.js --project=chromium
# or: npm run gallery -- --project=chromium
open screen-gallery.html
```

Capture wipes stale PNGs on start so orphaned shots cannot linger.
