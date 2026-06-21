# Green Workbench Palette

Final token reference for the green-workbench theme. Derived from
`seed/palette.json` (exported from the deployed app), the trustgraph
`workbench-ui` source, and the `oip-web` parchment values. Encode **app-local**
in `apps/professional-desktop` via `createAppTheme` + an app-local Tailwind var
layer (Option C); reuse the existing `@beep/ui` `OrbBackground tone="green"`.

## `seed/palette.json` — extracted dominant colors

| hex | role(s) | note |
| --- | --- | --- |
| `#a1a1aa` | text/outline/stroke | muted foreground (dark) |
| `#fafafa` | text/fill | foreground (dark) |
| `#71717a` | text/outline | subtle foreground |
| `#5c9a5c` | text/stroke | **brand green 400** (primary accent, dark) |
| `#27272a` | border/background | surface-200 / border (dark) |
| `#eab308` | text/bg/stroke | **amber accent** (warning / agent phase) |
| `#ffffff` | text/stroke | pure white |
| `#18181b` | background | surface-100 (card/input, dark) |
| `#82b582` | text/outline | brand green 300 |
| `#09090b` | background/fill | surface-0 (page bg, dark) |
| `#111113` | background | surface-50 (sidebar, dark) |
| `#3c7e3c @.30` / `#214f21 @.30` / `#3b803b @.10` / `#2d632d` | borders/bg | green-tinted surfaces & borders |

## Brand green scale (trustgraph)

`50 #eef5ee` · `100 #d4e8d4` · `200 #aed1ae` · `300 #82b582` · **`400 #5c9a5c`**
· **`500 #3d7d3d`** · **`600 #2d632d`** · `700 #214e21` · `800 #1a3a1a` ·
`900 #122812`.

## MUI `colorSchemes` (for `createAppTheme` overrides)

```ts
const greenWorkbenchThemeOptions = {
  colorSchemes: {
    dark: {
      palette: {
        primary:    { main: "#5c9a5c" },  // brand-400 — active UI green
        secondary:  { main: "#eab308" },  // amber accent
        background: { default: "#09090b", paper: "#18181b" },
        text:       { primary: "#fafafa", secondary: "#a1a1aa" },
      },
    },
    light: {
      palette: {
        primary:    { main: "#2d632d" },  // brand-600 — accessible on parchment
        secondary:  { main: "#c9a24b" },  // gold (parchment harmony)
        background: { default: "#f4ede0", paper: "#fffaf0" }, // parchment (oip-web)
        text:       { primary: "#1a3a1a", secondary: "#52525b" },
      },
    },
  },
} satisfies ThemeOptions;
```

## Tailwind oklch vars (app-local globals layer)

```css
/* dark */
--background: oklch(0.07 0.01 145);   /* ≈ #09090b */
--card:       oklch(0.13 0.01 145);   /* ≈ #18181b */
--primary:    oklch(0.52 0.12 145);   /* ≈ #5c9a5c */
--primary-foreground: oklch(0.98 0 0);
--muted:      oklch(0.22 0.01 145);   /* ≈ #27272a */
--muted-foreground: oklch(0.65 0 0);
--border:     oklch(1 0 0 / 10%);

/* light */
--background: oklch(0.95 0.015 85);   /* ≈ #f4ede0 parchment */
--card:       oklch(0.99 0.005 85);   /* ≈ #fffaf0 cream */
--primary:    oklch(0.44 0.12 145);   /* ≈ #2d632d */
--primary-foreground: oklch(0.99 0 0);
--muted:      oklch(0.92 0.01 85);
--border:     oklch(0.85 0.02 85);
```

## Glow / orb background

Reuse `@beep/ui` `OrbBackground` (`packages/foundation/ui-system/ui/src/components/orb-background.tsx`)
with `tone="green"` and `intensity="vivid"` — the repo equivalent of trustgraph's
`GlowBackground` (which used `--tg-glow-primary-start: rgba(61,125,61,0.35)` over
near-black with `mix-blend-screen`). If exact trustgraph glow values are wanted,
they can be supplied as app-local CSS custom properties; otherwise the existing
component's green hue (138) is the default match. Respect `prefers-reduced-motion`.

## Typography & radius (optional alignment)

trustgraph uses Inter (sans) + JetBrains Mono (mono) and `rounded-lg`. `@beep/ui`
default radius is `8px` / `--radius: 0.625rem`. Keep `@beep/ui` defaults unless QA
shows a mismatch; do not change global tokens.
