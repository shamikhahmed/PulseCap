# PulseCap — Design system

Sober, Apple HIG-aligned, ported from the ScentCap 3.0 system (`ScentCap/src/design/system.css`, `DESIGN.md`).
Content first; chrome stays quiet. PulseCap keeps its own accent: **ember** (`#ff7a1a` on dark, `#c2410c` on light).

Source of truth:

| File | Role | Loading |
|---|---|---|
| `css/design/tokens.css` | Semantic tokens (light / dark / increased contrast) + Ember 6.x bridge | render-blocking, unlayered |
| `css/design/system.css` | `ui-*` primitives (ScentCap port) | `@layer components` via `css/cascade.css` |
| `css/design/pulse.css` | Reskin of the Ember shell + shared classes (`#nav .nb`, `.topbar`, `.card-block`, `.btn*`, `.cap-tab`, `.modal-sheet`) | `@layer components` |
| `css/cascade.css` | Cascade orchestrator: Ember token/shell/layout/component CSS demoted to `@layer legacy` | render-blocking |
| `css/cascade-deferred.css` | `ember-components.css` + `identity.css` in `@layer legacy` | async |

Ember's `tokens.base.css` carries an unlayered `* { margin:0; padding:0 }` reset; it must stay inside `@layer legacy`
or it beats every layered rule.

## Principles

1. **Content first.** Weights, sets and trends carry the screen; surfaces are grey/white (light) or black/graphite (dark).
2. **One accent.** Ember (`--tint`) marks the primary action per screen, selection and links. Never decorative.
3. **System type.** SF (`--font-ui`) at 17pt body; tabular figures for numbers.
4. **Native patterns.** Large titles, chips for filters / settings tabs, sheets with grabber, floating glass tab bar (phone),
   glass sidebar (≥700px).
5. **Accessible by default.** 44pt targets, AA contrast in light / dark / increased contrast, reduced motion honoured.

## Tokens

Same names as ScentCap: `--bg`, `--surface(-2|-elevated)`, `--fill(-2)`, `--separator`, `--label(-2|-3|-4)`,
`--tint(-hover|-soft)`, `--on-tint`, `--success-sys/--warning-sys/--danger-sys`, `--t-large … --t-caption2`,
`--r-sm/md/lg/xl`, `--shadow-1/2/3`, `--hit`, `--gutter`, `--tabbar-h` (64px — the Ember nav's min-height).
Legacy Ember names (`--bg-elev`, `--accent`, `--txt*`, `--line`, `--grad`) are bridged in `tokens.css`; don't use them in new code.

## Shell (iPhone)

- Phone (<700px): floating glass tab bar — Today · Train · Progress · Programs · Me, `bottom: max(14px, safe + 6px)`.
  The document scrolls (no `#view` scroller, no `overflow:hidden` on html/body); `#view` bottom padding = bar + 48 + safe area.
- ≥700px: the same `#nav`, vertical glass sidebar (248px).
- Sheets (`#_modal`) lock the page via `js/scroll-lock.js` (body `position:fixed; top:-scrollY`) and restore the position on close.
- `scroll-behavior: auto` — programmatic scrolls are instant. New screens open at the top.
- Service worker waits for the user's "Reload" before `skipWaiting`.

Check with `npm run ios:check` (needs `node scripts/static-server.mjs 8766`) and `tests/hig-design.spec.js`.
