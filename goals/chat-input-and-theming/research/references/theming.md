# Reference: Theming Surfaces

Read-only synthesis (2026-06-20) of the three theming surfaces behind the
green-workbench palette. See `../palette.md` for the final token table.

## 1. trustgraph workbench-ui (target aesthetic) — `~/YeeBois/dev/trustgraph/ts/packages/workbench`

Stack: **pure Tailwind CSS v4** (no MUI/shadcn), custom React + Lucide,
react-router v7, `@effect/atom-react`. All tokens in one `@theme {}` block in
`src/index.css`, overridden for light via `html.light {}`.

Dark (default): bg `#09090b`, surface-50 `#111113`, surface-100 `#18181b`,
surface-200 `#27272a`, surface-300 `#3f3f46`, surface-400 `#52525b`; fg `#fafafa`,
muted `#a1a1aa`, subtle `#71717a`; border `#27272a`/hover `#3f3f46`. Brand green
scale: `#eef5ee` 50 → `#82b582` 300 → `#5c9a5c` 400 (active nav/logo) → `#3d7d3d`
500 (focus/primary) → `#2d632d` 600 (active bg) → `#214e21` 700 → `#122812` 900.
Success `#22c55e`, warning `#eab308`, error `#ef4444`. Amber accent is Tailwind
`amber-*` utilities in the chat page (agent "think" phase badges), not a token.

Light (`html.light`): surface-0 `#ffffff` → surface-400 `#a1a1aa`; fg `#18181b`,
muted `#52525b`; border `#d4d4d8`; brand darkened (`#2d632d`/`#214e21`).

Glow: `src/components/layout/glow-background.tsx` — three absolutely-positioned
blurred radial-gradient divs animated via CSS keyframes (`glow-drift-1/2/3`),
colors from `--tg-glow-*` CSS vars (e.g. `--tg-glow-primary-start:
rgba(61,125,61,0.35)`), respects `prefers-reduced-motion`.

Typography: Inter (sans), JetBrains Mono (mono). Radius: `rounded-lg` (no token).

## 2. `@beep/ui` theme system — `packages/foundation/ui-system/ui/src/themes/`

Dual-layer, manually kept in sync:

- **MUI CssVars colorSchemes** (`colors.ts`) — `light`/`dark` keys; selector is
  `"class"`. Current default is achromatic (light `primary #000`, bg
  `rgb(248,248,248)`; dark `primary #fff`, bg `rgb(0,0,0)`).
- **Tailwind oklch vars** (`globals.css`) — `:root` (light) + `.dark`; current
  default neutral/gray (`--background oklch(1 0 0)` / `oklch(0.145 0 0)`,
  `--primary oklch(0.205 0 0)` / `oklch(0.922 0 0)`); `--radius: 0.625rem`. Also
  `OrbBackground` keyframes.

No automatic sync — MUI emits `--mui-palette-*`; Tailwind vars are static; both
respond to the `.dark` class. `createTheme(themeOptions, overrides)` deep-merges,
so an app can override `colorSchemes.light/dark.palette`, `shape`, `components`.
`AppThemeProvider` accepts a `theme` prop — an app injects its own
`createAppTheme(customOptions)` without touching shared code. **No named-preset
registry today.**

`OrbBackground` (`src/components/orb-background.tsx`): `tone` (default green hue
138), `intensity` (subtle/medium/vivid), `animated`. The repo equivalent of
trustgraph's glow.

## 3. oip-web (light/parchment reference) — `apps/oip-web`

Uses the **app-local override pattern**: `src/components/OipThemeProvider.tsx`
defines `oipThemeOptions` and mounts `<AppThemeProvider theme={createAppTheme(
oipThemeOptions)}>`.

Light (parchment): `primary #5b1a1a` (burgundy), `secondary #c9a24b` (gold),
`background.default #f4ede0` (parchment), `background.paper #fffaf0` (cream),
`text.primary #2a2a2a`, `text.secondary #6f675c`. Tailwind `--oip-*` vars in
`globals.css` (`--oip-paper #f4ede0`, `--oip-gold #c9a24b`, etc.).

Dark: `primary #dcb85a` (gold), `background.default #181512`, `paper #211d19`,
`text #efe7d9`. Full light/dark via an inline `layout.tsx` script reading
`localStorage` and applying `.light`/`.dark` before hydration (flash prevention) +
`data-oip-theme-toggle` buttons.

**Takeaway:** the parchment background values (`#f4ede0`/`#fffaf0`) are the
light-mode reference; the mechanism (`createAppTheme` + `AppThemeProvider theme=`)
is exactly what this packet copies for green-workbench.

## Encoding options (decision: Option C, app-local)

- **A — global default change** (`@beep/ui` colors.ts + globals.css): high blast
  radius (oip-web Tailwind tokens, storybook, all apps). Rejected.
- **B — named preset in `@beep/ui`** (new `green-workbench.ts` + `.theme-green`
  CSS layer + index export): reusable, more upfront work. Graduation path.
- **C — app-local `createAppTheme` override (CHOSEN)**: define green-workbench
  `ThemeOptions` in `apps/professional-desktop` (mirror `OipThemeProvider`), add
  green Tailwind vars to an app-local globals layer, reuse `OrbBackground
  tone="green"`. Zero blast radius; promote to B if a 2nd app wants it.
