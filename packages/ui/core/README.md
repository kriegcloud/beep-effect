# @beep/ui-core

Design system foundation for the beep-effect monorepo combining Material-UI theming with Effect patterns.

## Purpose

`@beep/ui-core` serves as the source of truth for design tokens, palette mathematics, typography scales, and MUI component overrides in the beep-effect monorepo. It provides:
- Effect-first theme system with runtime settings customization
- Channel-based color management for CSS variable support
- Comprehensive MUI component override catalog
- Internationalization infrastructure with MUI locale bundles
- Type-safe utilities for color, typography, storage, and formatting

This package sits at the UI layer foundation, consumed primarily by `@beep/ui` which builds higher-level components on top of these primitives. Applications like  use the complete design system through `@beep/ui`.

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/ui-core": "workspace:*"
```

## Key Features

- **Effect-First Theme System**: MUI theme factory with Effect utilities and type-safe color management
- **Settings-Driven Customization**: Runtime theme configuration (mode, colors, typography, layout)
- **Internationalization**: i18next integration with locale-aware MUI components
- **Component Overrides**: Comprehensive MUI component styling catalog
- **Effect DateTime Adapter**: MUI X Date Pickers integration with Effect's DateTime
- **Utility Collection**: Color math, typography, storage, formatting with Effect patterns

## Package Structure

```
packages/ui/core/
├── src/
│   ├── adapters/          # MUI X adapters (Effect DateTime)
│   ├── constants/         # Iconify registration
│   ├── i18n/             # Internationalization config
│   ├── settings/         # Settings types and defaults
│   ├── theme/            # Theme system
│   │   ├── core/        # Base theme (palette, typography, components)
│   │   ├── styles/      # Reusable style objects
│   │   └── with-settings/ # Settings application pipeline
│   └── utils/           # Effect-powered utilities
└── package.json
```

## Key Exports

| Export | Type | Description |
|--------|------|-------------|
| `createTheme` | Function | Main theme factory accepting settings, locale, overrides |
| `baseTheme` | ThemeOptions | Base theme with dual color schemes |
| `themeConfig` | Config | Theme defaults (direction, mode, fonts) |
| `defaultSettings` | SettingsState | Default settings configuration |
| `AdapterEffectDateTime` | Class | MUI X Date Picker adapter for Effect DateTime |
| `createPaletteChannel` | Function | Creates RGB channel palette from hex color |
| `cssVarRgba` | Function | Generates rgba CSS variable references |
| `SupportedLangValue` | Schema | Language enum schema (en, fr, ar, cn) |
| `getCurrentLang` | Function | Retrieves language config with MUI locale |

## Exports

### Theme System

```typescript
// Main theme factory and base theme (NOT exported from theme index)
import { createTheme, baseTheme } from "@beep/ui-core/theme/create-theme";
import type { CreateThemeProps } from "@beep/ui-core/theme/create-theme";

// Theme configuration and core building blocks (from theme index)
import { themeConfig } from "@beep/ui-core/theme/theme-config";
import { palette, basePalette, primary } from "@beep/ui-core/theme";
import { typography } from "@beep/ui-core/theme";
import { shadows, customShadows, createShadowColor } from "@beep/ui-core/theme";
import { components } from "@beep/ui-core/theme";
import { mixins } from "@beep/ui-core/theme";
import type { ThemeOptions, ThemeColorPreset } from "@beep/ui-core/theme";

// Settings and RTL support (from with-settings subpath)
import { Rtl } from "@beep/ui-core/theme/with-settings";
import { primaryColorPresets, secondaryColorPresets } from "@beep/ui-core/theme/with-settings";
import { applySettingsToTheme, applySettingsToComponents } from "@beep/ui-core/theme/with-settings";
```

**Core Exports:**
- `createTheme(props)` - Main theme factory accepting settings, locale components, and overrides
- `baseTheme` - Base theme configuration with dual color schemes (light/dark)
- `themeConfig` - Theme configuration defaults (direction, mode, fonts, CSS variables)
- `Rtl` - RTL wrapper component with stylis plugin support

**Theme Building Blocks (from `theme/core`):**
- `palette`, `basePalette`, `primary` - Color system with channel-based tokens
- `typography` - Typography scale and variants
- `shadows`, `customShadows`, `createShadowColor` - Shadow system
- `mixins` - Reusable style mixins
- `components` - Complete MUI component override catalog

**Settings Application (from `theme/with-settings`):**
- `primaryColorPresets`, `secondaryColorPresets` - Color preset system
- `applySettingsToTheme`, `applySettingsToComponents` - Settings application utilities

### Settings Management

```typescript
import { defaultSettings, SETTINGS_STORAGE_KEY } from "@beep/ui-core/settings";
import type { SettingsState, SettingsContextValue } from "@beep/ui-core/settings";
```

**Settings Fields:**
- `mode` - Color scheme (light/dark)
- `direction` - Text direction (ltr/rtl)
- `contrast` - Contrast level (default/high)
- `primaryColor` - Theme color preset
- `fontSize` - Base font size in pixels
- `fontFamily` - Primary font family
- `navLayout` - Navigation layout (vertical/horizontal/mini)
- `navColor` - Navigation color integration
- `compactLayout` - Compact spacing mode
- `version` - Settings schema version for storage invalidation

### Internationalization

```typescript
// Main i18n exports (from i18n index)
import { allLanguages, allLangs, fallbackLang, defaultNS } from "@beep/ui-core/i18n";
import { getCurrentLang, i18nOptions, i18nResourceLoader } from "@beep/ui-core/i18n";

// Language schema (separate export per package.json)
import { SupportedLangValue } from "@beep/ui-core/i18n/SupportedLangValue";
```

**Supported Languages:**
- English (`en`)
- French (`fr`)
- Arabic (`ar`)
- Chinese (`cn`)

Each language includes MUI locale bundles (Data Grid, Date Pickers) and translation namespaces (common, navbar, messages).

### Utilities

```typescript
import {
  // Color utilities
  createPaletteChannel,
  hexToRgbChannel,
  cssVarRgba,
  rgbaFromChannel,

  // Typography
  pxToRem,
  remToPx,
  setFont,

  // Storage
  getStorage,
  setStorage,
  removeStorage,
  getCookie,
  setCookie,
  removeCookie,
  localStorageAvailable,

  // Formatting
  fDate,
  fTime,
  fDateTime,
  fTimestamp,
  fAdd,
  fSub,
  fToNow,
  fIsAfter,
  fIsBetween,
  fIsSame,
  formatNumber,

  // React utilities
  createCtx,
  mergeClasses,
  isActiveLink,
  createHandlerSetter,

  // URL utilities
  isExternalLink,
  hasParams,
  removeParams,
  isEqualPath,
  removeLastSlash,

  // Environment checks
  isClient,
  isDevelopment,
  isApiSupported,

  // CSS variables
  getCssVariable,
  setCssVariable,

  // Geolocation
  geolocationUtils,

  // Swipe utilities
  swipeUtils,

  // Object utilities
  hasKeys,

  // Transform utilities
  transformValue,
  transformValueOnBlur,
  transformValueOnChange,
} from "@beep/ui-core/utils";
```

### Adapters

```typescript
import { AdapterEffectDateTime } from "@beep/ui-core/adapters";
import type { AdapterEffectDateTimeOptions } from "@beep/ui-core/adapters";
```

MUI X Date Picker adapter using Effect's `DateTime` module for type-safe date operations.

### Constants

```typescript
import { registerIcons } from "@beep/ui-core/constants/iconify/register-icons";

// Register Iconify icons for offline use
registerIcons();
```

### Assets

```typescript
// Import global styles
import "@beep/ui-core/globals.css";

// PostCSS configuration
import postcssConfig from "@beep/ui-core/postcss.config";
```

## Usage Examples

### Creating a Theme

```typescript
import { createTheme } from "@beep/ui-core/theme/create-theme";
import { defaultSettings } from "@beep/ui-core/settings";
import { getCurrentLang } from "@beep/ui-core/i18n";
import { SupportedLangValue } from "@beep/ui-core/i18n/SupportedLangValue";
import { ThemeProvider } from "@mui/material/styles";

// Basic theme
const theme = createTheme();

// With settings
const customTheme = createTheme({
  settingsState: {
    ...defaultSettings,
    mode: "dark",
    primaryColor: "blue",
  },
});

// With locale and overrides
const currentLang = getCurrentLang(SupportedLangValue.Enum.en);
const fullTheme = createTheme({
  settingsState: defaultSettings,
  localeComponents: currentLang.systemValue,
  themeOverrides: {
    components: {
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 12 },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={fullTheme}>
      {/* Your app */}
    </ThemeProvider>
  );
}
```

### Using Settings

```typescript
import * as O from "effect/Option";
import * as F from "effect/Function";
import { defaultSettings, SETTINGS_STORAGE_KEY } from "@beep/ui-core/settings";
import { getStorage, setStorage } from "@beep/ui-core/utils/localStorage";
import type { SettingsState } from "@beep/ui-core/settings";

// Load persisted settings
const loadSettings = (): SettingsState => {
  const stored = getStorage(SETTINGS_STORAGE_KEY);

  return F.pipe(
    stored,
    O.fromNullable,
    O.filter((s) => s.version === defaultSettings.version),
    O.map((s) => ({ ...defaultSettings, ...s })),
    O.getOrElse(() => defaultSettings)
  );
};

// Save settings
const saveSettings = (settings: SettingsState): void => {
  setStorage(SETTINGS_STORAGE_KEY, settings);
};
```

### Color Utilities with Effect

```typescript
import * as F from "effect/Function";
import { createPaletteChannel, cssVarRgba } from "@beep/ui-core/utils/color";

// Create palette channels for CSS variables
const bluePalette = F.pipe(
  "#2065D1",
  createPaletteChannel
);
// Returns: { main: "33 101 209", light: "...", dark: "...", ... }

// Generate rgba CSS var
const blueAlpha = cssVarRgba("--palette-primary-mainChannel", 0.08);
// Returns: "rgba(var(--palette-primary-mainChannel) / 0.08)"
```

### Internationalization

```typescript
import { getCurrentLang, i18nOptions, i18nResourceLoader } from "@beep/ui-core/i18n";
import { SupportedLangValue } from "@beep/ui-core/i18n/SupportedLangValue";
import i18next from "i18next";

// Initialize i18next
await i18next
  .use(i18nResourceLoader)
  .init(i18nOptions(SupportedLangValue.Enum.en));

// Get current language with MUI locale
const currentLang = getCurrentLang(SupportedLangValue.Enum.fr);
console.log(currentLang.label); // "French"
console.log(currentLang.systemValue.components); // MUI locale components
```

### Using Effect DateTime Adapter

```typescript
import { AdapterEffectDateTime } from "@beep/ui-core/adapters";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";

function DatePickerExample() {
  return (
    <LocalizationProvider dateAdapter={AdapterEffectDateTime}>
      <DatePicker label="Select date" />
    </LocalizationProvider>
  );
}
```

## Theme Architecture

### Base Theme Pipeline

The theme system is structured in layers:

1. **Core Theme Building Blocks** (`theme/core/`):
   - `palette.ts` - Color system with channel-based tokens
   - `typography.ts` - Typography scale and variants
   - `shadows.ts` - Shadow definitions
   - `components/` - MUI component overrides catalog
   - `mixins/` - Reusable style utilities
   - These are exported from `@beep/ui-core/theme` (via `theme/index.ts`)

2. **Base Theme Assembly** (`theme/create-theme.ts`):
   - `baseTheme` - Combines core building blocks into dual color schemes (light/dark)
   - `createTheme()` - Factory function that merges baseTheme with settings, locale, and overrides
   - Exported from `@beep/ui-core/theme/create-theme` (NOT re-exported from theme index)

3. **Settings Application** (`theme/with-settings/`):
   - `applySettingsToTheme()` - Applies runtime settings to theme core
   - `applySettingsToComponents()` - Applies settings-specific component overrides
   - `Rtl` - RTL wrapper component with stylis plugin
   - Color presets and theme customization utilities

4. **Locale Integration** (`i18n/constants.ts`):
   - MUI component locale bundles for Data Grid and Date Pickers
   - Passed via `localeComponents` prop to `createTheme()`

5. **User Overrides**:
   - Final layer via `themeOverrides` prop to `createTheme()`

### Color System

The package uses **channel-based color management** for CSS variable support:

```typescript
// Color tokens stored as RGB channels
const palette = {
  primary: {
    main: "33 101 209",        // RGB channels
    light: "...",
    dark: "...",
    contrastText: "...",
  },
};

// Used in CSS variables
// --palette-primary-main: 33 101 209;
// --palette-primary-mainChannel: 33 101 209;

// Enables alpha manipulation
// background-color: rgba(var(--palette-primary-mainChannel) / 0.08);
```

### Component Override Pattern

All MUI component overrides follow this structure:

```typescript
// packages/ui/core/src/theme/core/components/button.tsx
import type { Components, Theme } from "@mui/material/styles";

export const MuiButton: Components<Theme>["MuiButton"] = {
  styleOverrides: {
    root: ({ theme }) => ({
      // Overrides using theme tokens
    }),
  },
};
```

Overrides are aggregated in `components/index.ts` and merged into the base theme.

## Effect Patterns

### Import Conventions

```typescript
// Namespace imports for Effect modules
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";
```

### Collection Operations

```typescript
import * as A from "effect/Array";
import * as F from "effect/Function";

// Use Effect Array utilities with pipe
const names = F.pipe(
  items,
  A.map((item) => item.name),
  A.filter((name) => name.length > 0)
);

// Find operations return Option
const first = F.pipe(
  items,
  A.findFirst((item) => item.active)
);
```

### String Operations

```typescript
import * as Str from "effect/String";
import * as F from "effect/Function";

const capitalized = F.pipe(
  str,
  Str.trim,
  Str.capitalize
);
```

## Configuration

### Theme Config

Default theme configuration in `theme-config.ts`:

```typescript
export const themeConfig = {
  defaultMode: "dark",
  direction: "ltr",
  fontFamily: {
    primary: '"Public Sans Variable", sans-serif',
    secondary: '"Barlow", sans-serif',
    code: 'Fira Code',
  },
  cssVariables: {
    colorSchemeSelector: "class",
  },
};
```

### Settings Storage

Settings persist to localStorage with version-based invalidation:

```typescript
export const SETTINGS_STORAGE_KEY = "app-settings";

export const defaultSettings: SettingsState = {
  mode: "dark",
  direction: "ltr",
  contrast: "default",
  navLayout: "vertical",
  primaryColor: "default",
  navColor: "integrate",
  compactLayout: true,
  fontSize: 16,
  fontFamily: themeConfig.fontFamily.primary,
  version: "1.0.0", // Increment to invalidate old settings
};
```

## Development

### Scripts

```bash
# Development (from monorepo root)
bun run --filter @beep/ui-core dev              # Watch mode compilation

# Build
bun run --filter @beep/ui-core build            # Full build (ESM + CJS + annotations)
bun run --filter @beep/ui-core build-esm        # TypeScript compilation
bun run --filter @beep/ui-core build-cjs        # CommonJS transformation
bun run --filter @beep/ui-core build-annotate   # Pure call annotations

# Quality
bun run --filter @beep/ui-core check            # Type check
bun run --filter @beep/ui-core lint             # Biome lint
bun run --filter @beep/ui-core lint:fix         # Auto-fix lint issues

# Testing
bun run --filter @beep/ui-core test             # Run tests
bun run --filter @beep/ui-core coverage         # Test coverage

# Or from package directory
cd packages/ui/core
bun run dev              # Watch mode compilation
bun run build            # Full build
bun run check            # Type check
bun run lint             # Biome lint
bun run test             # Run tests
```

### Adding a Color Preset

1. Update `ThemeColorPreset` union in `theme/with-settings/color-presets.ts`
2. Add preset to both `primaryColorPresets` and `secondaryColorPresets`
3. Update UI controls in `@beep/ui` that surface the preset list

### Adding a Component Override

1. Create override file in `theme/core/components/[component-name].tsx`
2. Export component override following MUI pattern
3. Add export to `theme/core/components/index.ts`
4. Run `bun run check` to verify types

### Adding a Locale

1. Create translation files in `i18n/langs/[locale-code]/`
2. Add locale configuration to `allLanguages` in `i18n/constants.ts`
3. Include MUI locale bundles in `systemValue.components`
4. Update `SupportedLangValue` enum if needed

## Integration

### Consumed By

- `@beep/ui` - Main UI component library
-  - Next.js frontend application

### Dependencies

**Core:**
- `effect` - Effect runtime and utilities
- `@mui/material` - Material-UI components
- `@mui/x-data-grid`, `@mui/x-date-pickers`, `@mui/x-tree-view` - MUI X components
- `@emotion/react`, `@emotion/cache` - Styling engine
- `i18next` - Internationalization framework

**Beep Packages:**
- `@beep/invariant` - Assertion contracts
- `@beep/schema` - Effect Schema utilities
- `@beep/utils` - Effect utilities and no-ops
- `@beep/constants` - Schema-backed enums
- `@beep/shared-domain` - Shared domain entities

## Architecture Notes

### Import Rules

- Use `@beep/ui-core/[module]` path aliases (defined in package.json exports)
- Never use relative `../../../` paths across packages
- Prefer namespace imports for Effect modules

### Effect-First Guidelines

- No `async/await` or bare Promises in application code
- Use Effect utilities for all array/string/record operations
- Collections via `A.*`, strings via `Str.*`, records via `Record.*`
- Import Effect modules with namespace imports (`import * as A from "effect/Array"`)

### Critical Rules

- **NEVER** use native array methods (`map`, `filter`, `forEach`, etc.) - use Effect `A.*` utilities
- **NEVER** use native string methods (`charAt`, `split`, `trim`, etc.) - use Effect `Str.*` utilities
- **ALWAYS** use `F.pipe` for function composition
- **ALWAYS** use uppercase constructors (`S.Struct`, `S.Array`, `S.String`)

## Notes

### Channel-Based Color System

This package uses RGB channel notation for all colors to enable CSS variable alpha manipulation:

```typescript
// Colors stored as "R G B" strings
const primaryMain = "33 101 209";  // Not "#2065D1"

// Enables alpha in CSS
// background: rgba(var(--palette-primary-mainChannel) / 0.08);
```

When adding new colors, always use `createPaletteChannel` to generate the full palette with lighter/darker variants and contrast text.

### Settings Version Management

The `version` field in `defaultSettings` acts as a cache-busting mechanism. Increment it when:
- Adding or removing settings fields
- Changing the type or valid values of existing fields
- Making breaking changes to settings structure

The settings provider automatically clears stale localStorage when versions don't match.

### Locale Configuration

Each language in `allLanguages` must provide:
- `label` - Display name
- `value` - Language code
- `systemValue.components` - MUI locale bundles (Data Grid, Date Pickers)
- Icon component

Missing MUI locale components will cause runtime errors in localized grids and pickers.

### Theme Immutability

While MUI themes are objects, treat them as immutable. The `applySettingsToTheme` functions create new theme configurations rather than mutating existing ones. This ensures proper React re-rendering when settings change.

### Effect Utility Usage

All utility functions should follow Effect patterns:
- Use `F.pipe` for composition
- Return `Option` for potentially missing values
- Use Effect array/string utilities instead of native methods
- Import Effect modules with namespace imports

See the Effect Patterns section in this README for specific examples.

## Related Packages

- [`@beep/ui`](../ui/README.md) - Main UI component library built on @beep/ui-core
- [`@beep/constants`](../../common/constants/README.md) - Schema-backed enums and constants
- [`@beep/schema`](../../common/schema/README.md) - Effect Schema utilities
- [`@beep/utils`](../../common/utils/README.md) - Shared Effect utilities

## References

- [MUI Theming Documentation](https://llms.mui.com/material-ui/7.2.0/customization/theming.md)
- [MUI CSS Theme Variables](https://llms.mui.com/material-ui/7.2.0/customization/css-theme-variables/overview.md)
- [MUI Theme Components](https://llms.mui.com/material-ui/7.2.0/customization/theme-components.md)
- [MUI RTL Support](https://llms.mui.com/material-ui/7.2.0/customization/right-to-left.md)
- [Effect Documentation](https://effect.website)

## License

MIT
