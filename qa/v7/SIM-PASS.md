# PulseCap — iOS simulator pass (v7 §7.4)

Date: 2026-10-22 · Capacitor/PWA · Safari via simctl openurl

## Devices (one at a time)

| Device | Light | Dark | Larger Text AX3 | VoiceOver (10 controls) |
|---|---|---|---|---|
| iPhone SE (3rd gen) | ✅ | ✅ | ✅ | ✅ spot (a11y tree) |
| iPhone 16 Pro | ✅ | ✅ | ✅ | ✅ spot (a11y tree) |
| iPad Air 11" (M2) | ✅ | ✅ | ✅ | ✅ spot (a11y tree) |

## Evidence (gitignored)

Screenshots: `PulseCap/build/qa/v7/sim/*.png` (9 PNGs)
Run log: `PulseCap/build/qa/v7/sim/sim-run.jsonl`
Script: `capricorn-tooling/scripts/v7-sim-pass.mjs` + `run-v7-sim-fleet.sh`

## VoiceOver spot-check (honest — live page a11y tree / aria labels)

Native VoiceOver not automated in CI; labels pulled from live demo via Playwright accessibility tree (https://shamikhahmed.github.io/PulseCap/?demo=1).

| # | Role | Label |
|---|---|---|
| 1 | `button` | Switch profile |
| 2 | `button` | Start workout |
| 3 | `button` | Do a different workout |
| 4 | `button` | Can’t train today? |
| 5 | `button` | Add chest volume — 0/12 sets this week. Open coach |
| 6 | `nav` | Main navigation |
| 7 | `button` | Today |
| 8 | `button` | Train |
| 9 | `button` | Progress |
| 10 | `button` | Programs |

## Notes

- Demo URL: `https://shamikhahmed.github.io/PulseCap/?demo=1`
- Matrix: 3 devices × light / dark / Larger Text AX3 (`--larger-text`).
- Dynamic Type AX3 via Simulator Accessibility prefs; appearance via `simctl ui`.
