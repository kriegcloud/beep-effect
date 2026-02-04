# Theme Configuration Inventory

> Comprehensive diff between `apps/todox` and `packages/ui/core` + `packages/ui/ui` theme systems.

---

## 1. CSS Variables & Globals Comparison

### `packages/ui/ui/src/styles/globals.css` (899 lines)

**CSS Variable Naming Convention**: `--mui-*` and `--color-*` prefix

**MUI Variables:**
- Typography: `--mui-font-h1` through `--mui-font-overline` + letter-spacing variants
- Palette: `--mui-palette-primary-main`, `--mui-palette-primary-mainChannel`, etc.
- Shadows: `--mui-shadows-1` through `--mui-shadows-24`
- Opacity: `--opacity-activated`, `--opacity-disabled`, `--opacity-focus`, `--opacity-hover`, `--opacity-selected`
- Overlay: `--overlay-1` through `--overlay-24`

**Tailwind Theme Variables:**
- Mapped from MUI: `--color-primary: rgb(var(--mui-palette-primary-mainChannel))`

**Sidebar Variables:**
- `--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-accent`, `--sidebar-border`, `--sidebar-ring`

**Third-Party Integration:**
- SimpleBar scrollbar (lines 80-309)
- NProgress bar using `--palette-primary-main`
- BlockNote editor theme (lines 760-853)
- Apex Charts styling

**CSS Layers:** `@layer theme, base, mui, components, utilities`

---

### `apps/todox/src/app/globals.css` (185 lines)

**CSS Variable Naming Convention**: shadcn/ui-centric with OKLch colors

**OKLch Color System:**
- Uses oklch color space: `oklch(1 0 0)` for white, `oklch(0.141 0.005 285.823)` for black

**Shadcn/ui Variables:**
- `--background`, `--foreground`, `--card`, `--popover`
- `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`
- `--border`, `--input`, `--ring`
- Chart colors: `--chart-1` through `--chart-5`

**Sidebar Variables:**
- Same structure as ui-ui but using OKLch colors

**Border Radius System:**
- Base: `--radius: 0.875rem`
- Computed variants: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-2xl`, `--radius-3xl`, `--radius-4xl`

**Unique Styles:**
- Resizable panel styles for react-resizable-panels v4 (lines 148-185)
- Dialog centering fix with `!important` overrides
- Custom scrollbar utility `.scrollbar-none`

**Missing from todox:**
- SimpleBar styling
- Apex Charts styling
- BlockNote styling

**CSS Layers:** `@layer theme, base, mui, components, utilities` (same as ui-ui)

---

### Naming Convention Differences

| Aspect | ui-ui | todox |
|--------|-------|-------|
| Color format | RGB channels for Tailwind | Direct OKLch values |
| Prefix | `--mui-palette-*` | `--background`, `--foreground` |
| Interpolation | `rgb(var(--channel))` | Direct value |

---

## 2. MUI Component Styles Comparison

### `packages/ui/core/src/theme/core/components/` (45 files)

**Form Components (9):**
- text-field.tsx, checkbox.tsx, radio.tsx, select.tsx
- autocomplete.tsx, slider.tsx, rating.tsx, switch.tsx, form.tsx

**Button Components (5):**
- button.tsx, button-fab.tsx, button-icon.tsx, button-group.tsx, button-toggle.tsx

**Data Display (11):**
- table.tsx, list.tsx, menu.tsx, pagination.tsx, badge.tsx
- chip.tsx, avatar.tsx, tabs.tsx, stepper.tsx, timeline.tsx, breadcrumbs.tsx

**Surfaces (7):**
- card.tsx, paper.tsx, dialog.tsx, drawer.tsx, popover.tsx, appbar.tsx, tooltip.tsx

**Feedback & Structure (8):**
- alert.tsx, skeleton.tsx, progress.tsx, accordion.tsx
- backdrop.tsx, link.tsx, toolbar.tsx, typography.tsx

**MUI X Components (3):**
- mui-x-data-grid.tsx, mui-x-date-picker.tsx, mui-x-tree-view.tsx

**Other (2):**
- svg-icon.tsx, popper.ts

---

### `apps/todox/src/theme/components/` (20 files)

**Form Components (5):**
- text-field.ts, select.ts, autocomplete.ts, date-picker.ts, controls.tsx

**Button Components (1):**
- button.ts

**Data Display (7):**
- table.ts, list.ts, menu.ts, avatar.ts, card.ts, chip.ts, tree-view.ts

**Feedback (2):**
- alert.ts, progress.ts

**Data Grid (1):**
- data-grid.ts

**SVG & Other (2):**
- svg-icon.ts, link.ts

**Custom (2):**
- controls.tsx (custom radio/checkbox/switch controls)
- layout.ts (custom layout configuration)

---

### Component Distribution Matrix

| Category | Only in ui-core | Only in todox | In Both |
|----------|-----------------|---------------|---------|
| Form | checkbox, radio, switch, form, slider, rating | controls.tsx | text-field, select, autocomplete |
| Button | button-fab, button-icon, button-group, button-toggle | - | button |
| Data Display | pagination, badge, stepper, timeline, breadcrumbs | - | table, list, menu, chip, avatar |
| Surfaces | paper, drawer, appbar | - | card, dialog |
| Feedback | skeleton, accordion, backdrop | - | alert, progress |
| Structure | toolbar, typography | layout.ts | link |
| MUI X | - | - | date-picker, tree-view, data-grid |
| Other | popper | - | svg-icon |

**Totals:**
- Only in ui-core: 25 components
- Only in todox: 2 components (controls.tsx, layout.ts)
- In both: 18 components

---

### Overlapping Components Requiring Style Merge Review

| Component | ui-core File | todox File | Notes |
|-----------|-------------|-----------|-------|
| text-field | text-field.tsx | text-field.ts | Large size support in ui-core |
| select | select.tsx | select.ts | |
| autocomplete | autocomplete.tsx | autocomplete.ts | |
| button | button.tsx | button.ts | ui-core has xLarge, todox has color-mix ripple |
| alert | alert.tsx | alert.ts | |
| table | table.tsx | table.ts | |
| list | list.tsx | list.ts | |
| menu | menu.tsx | menu.ts | |
| card | card.tsx | card.ts | |
| chip | chip.tsx | chip.ts | |
| avatar | avatar.tsx | avatar.ts | |
| link | link.tsx | link.ts | |
| progress | progress.tsx | progress.ts | |
| svg-icon | svg-icon.tsx | svg-icon.ts | |
| dialog | dialog.tsx | dialog.ts | |
| date-picker | mui-x-date-picker.tsx | date-picker.ts | |
| tree-view | mui-x-tree-view.tsx | tree-view.ts | |
| data-grid | mui-x-data-grid.tsx | data-grid.ts | |

---

## 3. Theme Configuration Structure

### ui-core Structure (Composable)

```
packages/ui/core/src/theme/
├── create-theme.ts           # Composition point
├── theme-config.ts           # Defaults (CSS var prefix, mode, direction, fonts)
├── extend-theme-types.ts     # TypeScript augmentation (244 lines)
├── types.ts                  # Internal types
├── sx-config.ts              # Reusable sx transformations
├── index.ts                  # Exports
├── core/
│   ├── palette.ts            # Channel-aware palette system
│   ├── typography.ts         # Font configurations
│   ├── colors.ts             # Color values
│   ├── shadows.ts
│   ├── custom-shadows.ts
│   ├── opacity.ts
│   ├── mixins/               # border.ts, text.ts, background.ts, global-styles-components.ts
│   └── components/           # 45 MUI overrides
├── with-settings/            # Dynamic customization
│   ├── update-core.ts
│   ├── update-components.ts
│   ├── color-presets.ts
│   └── right-to-left.tsx
└── styles/
    └── colorPicker.ts
```

---

### todox Structure (Monolithic)

```
apps/todox/src/theme/
├── theme.tsx                 # Single creation point
├── types.ts                  # Minimal augmentation
├── colors.ts                 # Color schemes (light/dark)
├── shadows.ts
├── typography.ts
├── index.ts
└── components/               # 20 component overrides
```

---

## 4. Type Augmentation Comparison

### `packages/ui/core/src/theme/extend-theme-types.ts` (244 lines)

**Extends:**
- Palette colors: `lighter`, `darker`, `lighterChannel`, `darkerChannel`
- Common colors: `whiteChannel`, `blackChannel`
- Text colors: `disabledChannel`
- Background: elevation system (`elevation1-4`), menu system (`menu`, `menuElevation1-2`)
- Grey: `950` shade + all channel variants
- Custom property: `customShadows`
- MUI X components (Data Grid, Date Pickers, Tree View)
- MUI Lab components

**Component Size Augmentations:**
- TextField: `large` size
- InputBase: `large` size
- Paper: `background` prop, `default` variant
- Avatar, Badge, Button, IconButton, ButtonGroup, Fab, Chip, Pagination, Slider, Rating, Tabs

---

### `apps/todox/src/theme/types.ts` + `colors.ts`

**Adds:**
- `text.icon` to TypeText
- `text.tertiary` to TypeText
- Optional `text` property to PaletteColor and SimplePaletteColorOptions

**Much simpler** - only adds what todox specifically needs.

---

### Required Augmentation Additions to ui-core

```typescript
// Add to extend-theme-types.ts
declare module "@mui/material/styles" {
  interface TypeText {
    icon?: string;      // NEW from todox
    tertiary?: string;  // NEW from todox
  }
}
```

---

## 5. Color System Comparison

### ui-core Palette (`packages/ui/core/src/theme/core/palette.ts`)

**Features:**
- Channel-aware: `mainChannel`, `lightChannel`, `darkChannel`, `contrastTextChannel`
- Shared colors: `inputOutlined`, `inputUnderline`, `paperOutlined`, `buttonOutlined`
- Background elevation: `elevation1-4` with corresponding channels
- Background menu: `menu`, `menuElevation1-2` with channels
- Extended grey: `950` shade + all channels

**CSS Variable Pattern:** `rgb(var(--mui-palette-primary-mainChannel))`

---

### todox Colors (`apps/todox/src/theme/colors.ts`)

**Features:**
- Simple light/dark schemes
- iOS-inspired colors: systemGray (E5E5EA), systemGreen (34C759), systemRed (FF3C3C)
- Custom text colors: `icon`, `tertiary`
- Action opacity: `activatedOpacity`, `selectedOpacity`, `disabledOpacity`, `focusOpacity`

**CSS Variable Pattern:** Direct oklch values

---

## 6. Implementation Differences

### Button Example

**ui-core (`button.tsx`):**
- TSX with Effect utilities (`Str` for string operations)
- Type extensions: `ButtonExtendSize`, `ButtonExtendVariant`, `ButtonExtendColor`
- Dynamic color generation using `colorKeys.palette`
- Custom sizes: `small`, `medium`, `large`, `xLarge`
- CSS variables for padding
- Mixin integration: `theme.mixins.filledStyles()`
- ~150 lines

**todox (`button.ts`):**
- Plain TS objects
- Uses MUI `applyStyles` for mode switching
- CSS color-mix for ripple: `color-mix(in oklch, currentColor, transparent 60%)`
- Focus visible with outline
- Active state with scale transform
- ~120 lines

---

## 7. Import & Dependency Patterns

### ui-core Imports
```typescript
import type { UnsafeTypes } from "@beep/types";
import { cssVarRgba, rgbaFromChannel } from "@beep/ui-core/utils";
import * as Str from "effect/String";
import type { Components, ComponentsVariants, Theme } from "@mui/material/styles";
import { buttonClasses } from "@mui/material/Button";
```

### todox Imports
```typescript
import type { CssVarsThemeOptions } from "@mui/material/styles";
```

---

## 8. Summary Matrix

| Aspect | ui-core | todox |
|--------|---------|-------|
| **Structure** | Multi-file, composable | Monolithic |
| **Color System** | Channel-aware | Direct OKLch |
| **CSS Variables** | `--mui-palette-*` | `--background`, `--chart-*` |
| **Components** | 45 files | 20 files |
| **Reusability** | Package export | App-local |
| **Settings** | Dynamic via layers | Static |
| **Implementation** | TSX + Effect | TS + objects |
| **Type System** | 244-line augmentation | Minimal |
| **Globals CSS** | 899 lines | 185 lines |
| **File Format** | .tsx | .ts |

---

## 9. Action Items by Phase

### P1: CSS Variables
- Add todox CSS variables to `packages/ui/ui/src/styles/globals.css`
- Preserve existing MUI channel-based variables
- Add OKLch shadcn variables alongside
- Add resizable panel styles
- Add `.scrollbar-none` utility

### P2: MUI Component Styles
- Merge `controls.tsx` into ui-core
- Merge `layout.ts` into ui-core
- Review 18 overlapping components for net-new styles only
- Preserve ui-core styles as authoritative

### P3: Theme Configuration
- Add `text.icon` and `text.tertiary` to type augmentation
- Add iOS-inspired colors as optional palette extension
- Merge todox-specific typography if any
- Review shadow differences

### P4: Todox Cleanup
- Remove `apps/todox/src/theme/components/` (or reduce to re-exports)
- Update `globals.css` to import from `@beep/ui`
- Remove `themeOverrides` or make it empty
- Update all imports in todox components
