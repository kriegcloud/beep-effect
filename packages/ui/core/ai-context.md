---
path: packages/ui/core
summary: Design tokens, palette math, typography, and MUI component overrides for the UI system
tags: [ui, theme, mui, design-system, settings, i18n, rtl]
---

# @beep/ui-core

Foundation package providing design tokens, palette math, typography scales, and MUI component overrides. Serves as the source of truth consumed by `@beep/ui` and ultimately `apps/web`.

## Architecture

```
|------------------|     |-------------------|     |-----------------|
|   theme-config   | --> |   create-theme    | --> |   ThemeProvider |
|------------------|     |-------------------|     |-----------------|
        |                         |                        |
        v                         v                        v
|------------------|     |-------------------|     |-----------------|
|  palette/typo    |     |  with-settings    |     |   @beep/ui      |
|------------------|     |-------------------|     |-----------------|
        |                         |
        v                         v
|------------------|     |-------------------|
|  components/*    |     |  color-presets    |
|------------------|     |-------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `theme/create-theme.ts` | Main theme factory merging base theme, settings, locale bundles |
| `theme/theme-config.ts` | Default direction, mode, palette tokens, font families |
| `theme/core/palette.ts` | Channel-aware color objects, `createPaletteChannel`, `cssVarRgba` |
| `theme/core/typography.ts` | Typography variants and responsive scale |
| `theme/core/components/*` | MUI component overrides (button, text-field, data-grid, etc.) |
| `theme/with-settings/*` | Settings-driven theme mutations, RTL support |
| `settings/types.ts` | `SettingsState` schema: mode, direction, contrast, colors |
| `settings/settings-config.ts` | Default settings values, storage key |
| `i18n/constants.ts` | Language configuration with MUI locale bundles |
| `utils/*` | Color math, typography helpers, storage utilities |
| `adapters/` | Effect DateTime adapter for MUI X Date Pickers |

## Usage Patterns

### Creating a Theme

```typescript
import * as React from "react";
import { createTheme } from "@beep/ui-core/theme/create-theme";
import { defaultSettings } from "@beep/ui-core/settings/settings-config";

const theme = createTheme(defaultSettings, localeComponents, overrides);
```

### Settings-Driven Customization

```typescript
import * as React from "react";
import { applySettingsToTheme } from "@beep/ui-core/theme/with-settings/update-core";
import type { SettingsState } from "@beep/ui-core/settings/types";

// Settings drive: mode, direction, contrast, fontSize, fontFamily, primaryColor
const updatedTheme = applySettingsToTheme(baseTheme, settings);
```

### Adding Color Presets

```typescript
// Update THREE places when adding presets:
// 1. ThemeColorPreset union type
// 2. primaryColorPresets record
// 3. secondaryColorPresets record
import { primaryColorPresets, secondaryColorPresets } from "@beep/ui-core/theme/with-settings/color-presets";
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| CSS Variables enabled | MUI uses CSS custom properties for runtime theme switching |
| Dual color schemes | Light/dark modes built into `baseTheme` structure |
| Settings versioning | `version` field invalidates stale localStorage on schema changes |
| Channel-aware colors | Palette objects include RGB channels for alpha compositing |
| Locale via components | MUI locale bundles passed as `{ components }` to `createTheme` |

## Dependencies

**Internal**: `@beep/schema`, `@beep/utils`, `@beep/types`, `@beep/identity`

**External**: `@mui/material`, `@mui/x-data-grid`, `@mui/x-date-pickers`, `@emotion/*`, `effect`, `i18next`, `stylis-plugin-rtl`

## Related

- **AGENTS.md** - Detailed contributor guidance with gotchas and change checklist
- **@beep/ui** - Downstream consumer providing React components and providers
