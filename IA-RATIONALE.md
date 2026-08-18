# PulseCap — Information Architecture Rationale

> Archived reference (pre-Ember IA). This file documents a 2026-07 layout and is not the shipped IA.
> Current IA truth: Today · Train · Progress · Programs · Me (see `CLAUDE.md`, `HANDOVER.md`, and `PERFECTION-REVIEW.md`).
>
> 2026-07-30 · v6.4.0 · Companion to `AUDIT.md`

## Product shape

Offline-first fitness OS. Five primary jobs, five tabs. Nested tools live under one home. No duplicate “set up profile” entries.

## Primary navigation

| Tab | Route | One job | Why here |
|-----|-------|---------|----------|
| **Today** | `dashboard` | Decide what to do *now* | Highest daily use; decision + streak + start |
| **Train** | `workout` | Log and plan training | Core logging; Progress/Skills/Intel nest here |
| **Body** | `bodymap` | Body state & recovery | Map is identity of Body; Recover/Fuel/Rehab/Photos under tools |
| **Learn** | `hub` | Knowledge & Smart Coach | Directory — not a third home for Train/Body tools |
| **Me** | `settings` | Identity, prefs, privacy | Mature settings groups (below) |

**≤2 taps:** Start workout (Today → Start or Train), Log meal (Body → Fuel), Smart Coach (Learn → Smart Coach), Export data (Me → Privacy).

**Not in tabs:** `active` session, `onboarding`, `briefing` — flow-only; nav hidden or parent lit.

## Settings groups (ordering law)

Most-used / identity → rare → destructive / legal.

| Group | id | Contains | Why |
|-------|-----|----------|-----|
| Account | `account` | Identity, goals, plan snapshot, metrics, injury pointer | Who you are — top |
| Training | `training` | Split, schedule, equipment, rest, gym-floor/beginner | Daily training prefs |
| Fuel | `fuel` | Macro targets + supplement stack | Nutrition prefs (log UI stays Body→Nutrition) |
| Appearance | `appearance` | Theme + coach personality/tone | Visual/voice only — **not** units |
| Access | `accessibility` | Units, low power, reduce-motion note | Measurement + motion — separate from Look |
| Alerts | `notifications` | Reminders, rest notify, coach frequency | Push-adjacent prefs |
| Privacy | `privacy` | Profiles, library sync, export/import, danger | Data control near bottom + confirm |
| About | `about` | Version, nav truth, privacy/license | Legal/version last |

**Aliases kept:** `profile→account`, `nutrition|supplements→fuel`, `data→privacy` so old deep links and tests don’t break.

**Fuel vs Body→Nutrition:** Settings Fuel = *targets*. Nutrition screen = *log meals/water/barcode*. One concept each.

**Units under Access, not Appearance:** Units change meaning of numbers (a11y/locale-adjacent), not paint. Matches “don’t nest Language under Appearance.”

**Coach under Appearance:** Personality/tone change copy voice and chrome feel; not account identity.

## Body / Learn tool strips

- **Body tools:** Recover, Fuel, Rehab, Photos, Physique, Body Intel, Injury Risk — body-adjacent. Calculators live under Learn only (one home).
- **Learn:** Search & Coach → Knowledge → Missions. Advanced charts hidden in Beginner Mode.

## Progressive disclosure

- Beginner Mode collapses Learn advanced rows.
- Settings: common path first (Account/Training/Fuel); Privacy danger at bottom with modal confirm.
- Physique/Recovery use in-screen tabs instead of separate nav destinations.

## Rejected alternatives

| Idea | Why rejected |
|------|----------------|
| Customizable bottom nav | Confused IA; fixed five tabs since v5 |
| Coach as 6th tab | Overlaps Learn; Smart Coach stays Learn row |
| Merge Fuel into Account | Macros change often; own group |
| Delete helper modules | Still render merged Physique/Style bodies |

## Discoverability checklist

| Feature | Path | Taps |
|---------|------|-----:|
| Log set | Train → start / Today Start | 1–2 |
| Smart Coach | Learn → Smart Coach | 2 |
| Export backup | Me → Privacy → Export | 2–3 |
| Theme | Me → Appearance | 2 |
| Units | Me → Access | 2 |
| Rest notifications | Me → Alerts | 2 |
