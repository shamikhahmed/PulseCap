# PulseCap — Information Architecture Audit (P1)

> Generated 2026-07-11 · Source: `reg()` registry + static `go()` graph + store key scan  
> **34 registered routes** (mission said ~33; `knowledge-graph.js` is data-only, no `reg`)  
> Current default nav: `dashboard · workout · assistant · recovery · settings`  
> Target (P2): **Today · Train · Body · Learn · Me**

## Summary verdicts

| Verdict | Count | Meaning |
|---------|------:|---------|
| **KEEP** | 14 | Canonical surface; stay as own route |
| **MERGE** | 12 | Fold into another module (alias old id) |
| **DEMOTE** | 8 | Keep code; hide behind category / Learn hub / search |

**Post-P3 target:** ~20 reachable first-class modules (plus aliases).

---

## Current entry-point map

| Surface | Routes linked |
|---------|---------------|
| Bottom/sidebar nav (default) | `dashboard`, `workout`, `assistant`, `recovery`, `settings` |
| Nav catalog (user-customizable) | also `hub`, `bodymap`, `progress`, `coach`, `rehab`, `anatomy`, `calisthenics`, `search` |
| Dashboard “More” row | `search`, `academy`, `rehab`, `anatomy` |
| Dashboard hero / cards | `briefing`, `recovery-debt` / `body-intelligence`, `equipment-setup`, `profiles`, `workout` |
| Hub (Explore) | `body-intelligence`, `training-intel`, `physique`, `academy`, `encyclopedia`, `rehab`, `search`, `quests`, `progress` |
| Search index | `workout`, `anatomy`, `rehab`, `encyclopedia`, `progress`, `calisthenics`, + self |
| Profiles / boot | `intro` → `onboarding` → `dashboard` |

**IA problem:** many modules reachable from 2–4 places (Dashboard More + Hub + Search + optional nav). P2 rule = exactly one home.

---

## Proposed homes (P2)

| Tab | Owns |
|-----|------|
| **Today** | `dashboard` (+ `briefing` content merged); daily decision, streak, start workout |
| **Train** | `workout` (+ `active`, `cardio`); progress entry; calisthenics via Train sub |
| **Body** | `bodymap` hub; physique family; recovery(+debt); nutrition; rehab |
| **Learn** | Hub as directory; encyclopedia, anatomy, academy, search, calculators, advanced intel |
| **Me** | `settings`, `profiles`, equipment-setup |

---

## Module inventory (all 34 regs)

Legend: **styles** = `style=` count in file (shared across multi-reg files). **Lines** ≈ screen fn size when multi-reg.

### Core shell / daily

| id | file | ~lines | styles | Store keys R/W | Entry points | Dup / notes | Verdict |
|----|------|-------:|-------:|----------------|--------------|-------------|---------|
| `dashboard` | dashboard.js | 328 | 116 | `user*`, `workouts`, `prs`, `bodyStats`, `settings.*`, quests XP | Nav Home; boot target | Overlaps briefing card + More grid | **KEEP** → rename IA to Today; absorb briefing |
| `briefing` | coach.js | ~100 | 40† | readiness/coach quote via engines; `settings.lastBriefingDate` | Dashboard Open | Duplicate of coach personality surface | **MERGE** → Today |
| `hub` | hub.js | 54 | 15 | (reads academy/quests engines) | Legacy Explore; still in nav catalog | Already marked legacy in file header | **KEEP** as Learn directory (rehome) |
| `settings` | settings.js | 546 | 90 | `settings.navTabs`, macros, injuries, supplements, theme… | Nav Me | Large; 7 sub-tabs | **KEEP** |
| `profiles` | profiles.js | 129 | 26 | `S.profiles` / `activeId` / demo | Avatar, settings | — | **KEEP** under Me |
| `intro` | onboarding.js | ~281 | 26† | `onboarded` gate | Boot if not onboarded | Marketing slides before form | **MERGE** → fold slides into `onboarding` step 0 / kill as separate product path |
| `onboarding` | onboarding.js | ~280‡ | 15† | `user`, `onboarded`, `supplements`, `settings.*` | After intro; profiles new user | Real setup (7 steps) | **KEEP** |
| `equipment-setup` | equipment-setup.js | 110 | 16 | `user.equipment*`, `settings.equipmentSetupPending` | Dashboard banner; settings | — | **DEMOTE** behind Me / settings Training |

† styles counted in shared file chunk. ‡ onboarding helpers live between regs; reg body thin but OB_STEPS large.

### Train

| id | file | ~lines | styles | Store keys R/W | Entry points | Dup / notes | Verdict |
|----|------|-------:|-------:|----------------|--------------|-------------|---------|
| `workout` | workout.js | ~77+DB | 24† | `workouts`, `customExercises`, `prs` | Nav Train | Giant file (1708) = DB+UI | **KEEP** |
| `cardio` | workout.js | ~50 | 18† | `cardioLogs` | Thin; few callers | Same file as workout | **MERGE** → Train sub-tab / section |
| `active` | workout.js | ~854 | 189† | session state + `workouts` | From workout start | Session UI, not a nav item | **KEEP** (flow-only; not a tab) |
| `progress` | progress.js | 465 | 89 | `workouts`, `prs`, `bodyStats` | Hub; search; optional nav | Charts/history | **KEEP** under Train |
| `calisthenics` | calisthenics.js | 219 | 30 | `calisthenics`, `calisthenicsProgress` | Search; optional nav | Skill trees | **DEMOTE** → Train → Skills |
| `quests` | quests.js | ~84 | 51† | `activeQuests`, `completedQuests`, `achievements`, `totalXP`, `streakSavers`… | Hub Missions | Gamification | **DEMOTE** → Today card + Learn/Missions |
| `training-intel` | training-intelligence.js | 471 | 64 | mostly engines / `workouts` | Hub only | Volume, specialization, age | **MERGE** w/ training-style |
| `training-style` | training-style.js | 326 | 45 | engines / `workouts` | Hub (indirect) | Style detector + rotation | **MERGE** → single Training Intel |

### Body

| id | file | ~lines | styles | Store keys R/W | Entry points | Dup / notes | Verdict |
|----|------|-------:|-------:|----------------|--------------|-------------|---------|
| `bodymap` | bodymap.js | 461 | 112 | `measurements`, `user.height*`, `user.weight` | Optional nav Body | Natural Body tab root | **KEEP** |
| `physique` | physique.js | 399 | 54 | engines / bodyStats | Hub | Scores + growth sim | **MERGE** → Physique sub-tabs |
| `physique-archetype` | physique-archetype.js | 514 | 74 | `user`, `physiqueProgressPhoto` | Self / deep links | Archetype + proportions | **MERGE** → Physique |
| `physique-timeline` | quests.js | ~57 | 24† | photo/progress adjacent | Few callers | Timeline UI | **MERGE** → Physique |
| `recovery` | recovery.js | 207 | 31 | `recovery`, `recoveryHistory`, `recoveryLogs` | Nav Recover | Check-in UI | **MERGE** w/ recovery-debt |
| `recovery-debt` | recovery-debt.js | 333 | 53 | engines; debt calc | Dashboard hero tap | Forecast / daily decision | **MERGE** → Recovery (canonical) |
| `nutrition` | nutrition.js | 306 | 40 | `meals`, `water`, supplements logs | Deep links | — | **KEEP** under Body |
| `rehab` | rehab.js | 385 | 59 | `user.injuries` | Dashboard More; hub; search | Protocols DB + UI | **KEEP** under Body (injury) |
| `injury-risk` | injury-risk.js | 178 | 29 | engines / workouts | Sparse | Forecast layer | **DEMOTE** → Body → Rehab/Risk |
| `body-intelligence` | body-intelligence.js | 614 | 62 | engines | Hub; dashboard hero | Joints / DNA / recovery overlay | **DEMOTE** → Body advanced |

### Learn / knowledge

| id | file | ~lines | styles | Store keys R/W | Entry points | Dup / notes | Verdict |
|----|------|-------:|-------:|----------------|--------------|-------------|---------|
| `search` | advanced-search.js | 320 | 31 | `recentSearches` | Dashboard; hub; topbar | Partial unified search already | **KEEP** → expand in P5 |
| `encyclopedia` | encyclopedia.js | 600 | 83 | (content DB) | Hub; search | Mobility/warmup/sports | **KEEP** under Learn |
| `anatomy` | anatomy.js | 161 | 29 | `settings.anatomyFilter` | Dashboard More; search | Muscle DB UI | **KEEP** under Learn |
| `academy` | quests.js | ~77 | 31† | `completedLessons`, XP | Dashboard More; hub | Lessons/quizzes | **KEEP** under Learn |
| `calculators` | calculators.js | 108 | 15 | — | Sparse | 1RM / BMI etc. | **DEMOTE** → Learn tools |
| `visualizations` | visualizations.js | 227 | 42 | workouts/prs | Sparse | Charts showcase | **DEMOTE** → Progress or Learn |
| `assistant` | fitness-assistant.js | 444 | 20 | `assistantHistory` | Nav Coach (default) | Offline Q&A chat | **MERGE** coach family |
| `coach` | coach.js | ~321 | 95† | coach settings | Optional nav | Personality coach screen | **MERGE** → Coach (w/ assistant) |

### Data-only (not registered)

| file | lines | Role | Verdict |
|------|------:|------|---------|
| `knowledge-graph.js` | 451 | Exercise graph for search/workout | **KEEP** as library (no screen) |

---

## Duplication clusters (P3 order)

Mission order — one merge commit each:

1. **Physique triple** — `physique` + `physique-archetype` + `physique-timeline` → `physique` w/ sub-tabs (`score` \| `archetype` \| `timeline`). Aliases: `physique-archetype`, `physique-timeline`.
2. **Recovery pair** — `recovery` + `recovery-debt` → `recovery` w/ Check-in \| Debt tabs. Alias: `recovery-debt`.
3. **Training intel pair** — `training-intel` + `training-style` → `training-intel`. Alias: `training-style`.
4. **Coach triple** — `coach` + `assistant` + `briefing` → Today embeds briefing; Train/Me keeps one Coach chat (`assistant` canonical). Aliases: `coach`, `briefing`.
5. **Intro vs onboarding** — keep `onboarding`; `intro` becomes alias → onboarding (or first slide inside). Kill separate product path.

### Shared logic smells (not separate merges)

| Smell | Where | Action |
|-------|-------|--------|
| Inline topbar / back button | Almost every module | P4 contract helpers |
| Empty-state markup | dashboard, workout, progress… | P4 `emptyState()` already exists — standardize |
| Readiness / debt / daily decision | dashboard + recovery-debt + coach | Single Today hero; modules consume engines only |
| Search vs hub directory | hub.js + advanced-search.js | P2: hub = Learn index; P5: search indexes all |

---

## Metrics snapshot

| Metric | Value |
|--------|------:|
| Registered routes | 34 |
| Module files | 29 (+ knowledge-graph) |
| Total module LOC | ~11.7k |
| Inline `style=` (modules) | ~1,650+ |
| Bare `<button>` (no type) | 0 (v4.7.5 discipline holds) |
| Orphan-looking (no static `go('id')` outside self) | Several advanced screens only via hub dynamic rows — OK if hub stays |

Largest files (CSS/contract debt magnets): `workout.js` (1708), `quests.js` (795), `body-intelligence.js` (614), `encyclopedia.js` (600), `settings.js` (546).

---

## Alias map (preview for P2/P3)

Do **not** delete files in same commit as redirect.

| Old id | → New id | Phase |
|--------|----------|-------|
| `briefing` | `dashboard` (Today) | P3 coach merge |
| `coach` | `assistant` | P3 |
| `recovery-debt` | `recovery` | P3 |
| `training-style` | `training-intel` | P3 |
| `physique-archetype` | `physique` (+tab) | P3 |
| `physique-timeline` | `physique` (+tab) | P3 |
| `intro` | `onboarding` | P3 |
| `cardio` | `workout` (+section) | P3 optional / with Train polish |
| `hub` | stays; nav label Learn | P2 |

Store migrations: one-time fn for any key renames (prefer keep keys; remount UI only). Test: migration idempotent + old `go(oldId)` lands on new screen.

---

## P2 reachability plan (one home each)

| Module | Single home |
|--------|-------------|
| dashboard (+briefing) | Today |
| workout, active, cardio, progress, calisthenics, training-intel | Train |
| bodymap, physique*, recovery*, nutrition, rehab, injury-risk, body-intelligence | Body |
| hub, search, encyclopedia, anatomy, academy, quests, calculators, visualizations, assistant | Learn |
| settings, profiles, equipment-setup, onboarding | Me |

First paint (P5 goal): 5 tabs + ≤3 Today cards. Everything else behind disclosure.

---

## Risks / gotchas (binding)

- `CORE_NAV_DEFAULT` + `settings.navMigration` — bump migration id when changing default 5 tabs.
- `_normalizeNavTabs` already aliases `coach`→`assistant`, `hub`→`search` — P2 must reconcile with Learn-as-hub (may reverse hub→search collapse).
- XSS: all new string HTML via `esc()`; keep `type="button"`.
- SW + `VERSION.json` bump on any asset change (not needed for this docs-only commit).

---

## Next phase

**P2 — IA: 5 tabs** — rewire nav to Today · Train · Body · Learn · Me; alias map in `go()`; smoke test every registered id renders with zero page errors.
