# `@beep/ui-core` Agent Guide

## Mission & Exports

This package is the source of truth for design tokens, palette math, typography, and MUI component overrides consumed by higher-level packages such as `@beep/ui`.

### Package Exports (via `package.json`)

The package exposes the following entry points:

- `@beep/ui-core/theme/*` - Theme system (palette, typography, components, settings application)
- `@beep/ui-core/settings/*` - Settings types, defaults, and storage config
- `@beep/ui-core/utils/*` - Utility functions (color, font, storage, formatting)
- `@beep/ui-core/i18n/*` - Internationalization config and locale helpers
- `@beep/ui-core/constants/*` - Iconify registration utilities
- `@beep/ui-core/adapters` - Effect DateTime adapter for MUI X Date Pickers
- `@beep/ui-core/globals.css` - Global CSS imports
- `@beep/ui-core/postcss.config` - PostCSS configuration

### Key Public Exports

**Theme (`@beep/ui-core/theme`):**
- `createTheme` - Main theme factory accepting settings state, locale components, and overrides
- `baseTheme` - Base theme configuration with dual color schemes
- `themeConfig` - Theme configuration defaults
- `components` - MUI component overrides
- `palette`, `typography`, `shadows`, `customShadows`, `mixins` - Core theme building blocks
- `applySettingsToTheme`, `applySettingsToComponents` - Settings application utilities
- `primaryColorPresets`, `secondaryColorPresets`, `ThemeColorPreset` - Color preset system
- `Rtl` - RTL wrapper component

**Settings (`@beep/ui-core/settings`):**
- `defaultSettings` - Default settings state
- `SETTINGS_STORAGE_KEY` - Storage key constant
- `SettingsState`, `SettingsContextValue`, `SettingsProviderProps` - TypeScript types

**Utils (`@beep/ui-core/utils`):**
- Color utilities: `createPaletteChannel`, `hexToRgbChannel`, `cssVarRgba`
- Typography: `pxToRem`, `remToPx`, `setFont`
- Storage: `getStorage`, `setStorage`, `removeStorage`, `getCookie`, `setCookie`
- Formatting: `fDate`, `fTime`, `fDateTime`, `formatNumber`
- React utilities: `createCtx`, `mergeClasses`, `isActiveLink`

**i18n (`@beep/ui-core/i18n`):**
- `allLanguages`, `allLangs` - Language configuration with MUI locale bundles
- `fallbackLang`, `defaultNS` - i18n defaults
- `SupportedLangValue` - Language enum schema

**Adapters (`@beep/ui-core/adapters`):**
- `AdapterEffectDateTime` - MUI X Date Picker adapter using Effect DateTime

## Theme Foundations
- Starting point is `packages/ui/core/src/theme/create-theme.ts`:
  - `baseTheme` assembles dual color schemes (`light` and `dark`), typography, shape, mixins, `unstable_sxConfig`, and `cssVariables` (CSS theme variables are enabled via `themeConfig.cssVariables`).
  - `createTheme` merges four inputs: `baseTheme`, optional settings-driven updates, locale-specific component bundles, and caller-provided overrides.
- Key configuration files worth skimming before any change:
  - `theme-config.ts` – default direction (`ltr`), mode (`dark`), palette tokens, font families, and CSS variable selectors.
  - `core/palette.ts` – builds channel-aware color objects with helpers such as `createPaletteChannel`, `cssVarRgba`, and exports shared “vibrant” colors. Update this file when introducing new color primitives.
  - `core/typography.ts` – centralizes typography variants and responsive scale; uses `setFont` from `@beep/ui-core/utils`.
  - `sx-config.ts` – complements the design system with reusable `sx` transformations (e.g., `lineClamp`).
- Locale overrides pattern:
  - `createTheme` accepts `localeComponents?: { components?: Components<Theme> | undefined } | undefined`.
  - The `ThemeProvider` in `@beep/ui` passes `currentLang.systemValue` (see `packages/ui/core/src/i18n/constants.ts`) which merges MUI X Data Grid and Date Pickers locale bundles.
  - To add a new locale, extend `allLanguages` with a `systemValue` containing the relevant MUI locale `components` object.

## Settings-Driven Customization
- Settings state is defined in `packages/ui/core/src/settings/types.ts`:
  - Fields include `mode`, `direction`, `contrast`, `fontSize`, `fontFamily`, `primaryColor`, `navLayout`, `navColor`, `compactLayout`, and a `version` string used for storage invalidation.
  - Default values live in `settings-config.ts`; storage key is `SETTINGS_STORAGE_KEY`.
  - `SettingsProvider` in `packages/ui/ui/src/settings/context/settings-provider.tsx` uses the version field to wipe stale persisted values.
- Theme application pipeline (`theme/with-settings`):
  - `applySettingsToTheme` (`update-core.ts`) mutates color schemes, typography, direction, and shadow channels based on `SettingsState`. It pulls palette presets via `createPaletteChannel`.
  - `applySettingsToComponents` (`update-components.ts`) currently affects `MuiCssBaseline` for font sizing and high-contrast card shadows.
  - Primary color presets live in `color-presets.ts`. When adding a new preset, update:
    - `ThemeColorPreset` union.
    - Both `primaryColorPresets` and `secondaryColorPresets`.
    - Any UI controls that surface the preset list in `@beep/ui`.
- RTL support:
  - `Rtl` component (`with-settings/right-to-left.tsx`) swaps in an Emotion cache with `stylis-plugin-rtl` and ensures `document.dir` is set.

## Component Override Catalogue
- Global overrides reside in `packages/ui/core/src/theme/core/components`.
  - Each file mirrors an MUI component key (e.g., `button.tsx` → `MuiButton`, `mui-x-data-grid.tsx` → MUI X Data Grid).
  - Aggregator: `components/index.ts`. Additions must be wired here or overrides will never ship.
  - Prefer Effect utilities when iterating over collections inside overrides—native array/string methods are forbidden (`CRITICAL RULE` in `AGENTS.md` at repo root).
- Useful entry points:
  - `core/components/mui-x-*` – MUI X overrides align Data Grid and Date Picker tokens with the core palette.
  - `core/components/text-field.tsx` – centralizes variant density rules; update here before touching inline component styles elsewhere.
  - `core/styles/*` – ready-made style objects (e.g., vibrant nav styles) shared with `@beep/ui`.

## Utilities & Supporting Modules
- `packages/ui/core/src/utils` includes helpers used throughout the theme:
  - `createPaletteChannel`, `hexToRgbChannel`, `cssVarRgba` for color math.
  - `pxToRem`, `setFont` for typography.
  - Storage helpers (`getStorage`, `getCookie`, `getItemFromStore`) used by settings providers in `@beep/ui`.
- Keep utilities Effect-friendly. Avoid introducing bare Promises or native array/string mutations—follow the namespace import guidelines in the root instructions.

## Operational Guidance
- **Validations**
  - Run `bun run lint:fix` before leaving changes to ensure Biome formatting passes.
  - Prefer `bun run check` when you modify shared types or settings schema to surface TypeScript regressions.
  - For localized overrides, smoke-test via `bun run test --filter theme` (add a targeted test if the filter does not exist yet).
- **Cross-package impacts**
  - Downstream surfaces: `@beep/ui` consumes `createTheme`, `Rtl`, `mainDrawerWidth`, and settings schema. Breaking changes here will propagate to the Next.js app (`apps/web`) through `@beep/ui`.
  - Coordinate updates with `packages/ui` whenever you adjust token names, preset unions, or settings fields.

## Gotchas

### React 19 / Next.js 15 App Router
- Theme utilities (`createTheme`, `applySettingsToTheme`) are pure functions and can run in Server Components.
- `Rtl` component uses Emotion cache and `document.dir`, so it requires `"use client"` in its consumers.
- MUI locale bundles imported for `ThemeProvider` are static and do not affect server/client boundaries.

### TanStack Query Invalidation
- Settings stored via `getStorage`/`setStorage` are NOT in TanStack Query. Changing settings requires manual state refresh.
- Theme changes do not automatically trigger TanStack Query invalidation. Components relying on theme must re-render via React context.
- MUI X components using locale bundles do not need query invalidation when locale changes; `ThemeProvider` handles re-render.

### Server vs Client Component Boundaries
- `createTheme` and all palette/typography utilities CAN be called in Server Components for SSR.
- Settings persistence (`getStorage`, `setStorage`, `getCookie`, `setCookie`) requires browser APIs and MUST be in Client Components.
- `Rtl` component modifies `document.dir` and MUST be in a Client Component.

### Effect Integration in React
- NEVER use native array/string methods in component overrides. Use Effect utilities (`A.map`, `R.map`, etc.).
- Color calculation utilities (`createPaletteChannel`, `hexToRgbChannel`) are synchronous and do not use Effect.
- Date formatting utilities (`fDate`, `fTime`, `fDateTime`) use standard formatting, not `effect/DateTime`. For Effect DateTime integration, use `AdapterEffectDateTime`.

### Theme & Settings Pitfalls
- `settings.version` MUST be incremented when changing `SettingsState` schema. `SettingsProvider` uses this to invalidate stale localStorage.
- RTL cache (`stylis-plugin-rtl`) must be cleared when switching direction. The `Rtl` component handles this, but manual cache manipulation breaks it.
- `cssVariables: true` in `themeConfig` means MUI uses CSS custom properties. Inline style overrides may not work as expected.
- Locale bundles MUST export a `.components` object matching MUI's structure. Missing or malformed bundles fail silently.
- Color preset additions require updating THREE places: `ThemeColorPreset` type, `primaryColorPresets`, and `secondaryColorPresets`.
- `baseTheme` is memoized. Changes to `theme-config.ts` require a full rebuild to take effect.

### Cross-Package Coordination
- Token name changes in `palette.ts` break `@beep/ui` components that reference them. Always search for usages before renaming.
- `mainDrawerWidth` and layout constants are consumed by `@beep/ui/layouts`. Changing values affects app-wide layout.
- `defaultSettings` changes affect all new users and users whose settings version is outdated. Test migration scenarios.

## Reference Library
- MUI documentation resources:
  - Theming: `https://llms.mui.com/material-ui/7.2.0/customization/theming.md`
  - CSS Theme Variables: `https://llms.mui.com/material-ui/7.2.0/customization/css-theme-variables/overview.md`
  - Theme Components: `https://llms.mui.com/material-ui/7.2.0/customization/theme-components.md`
  - RTL Support: `https://llms.mui.com/material-ui/7.2.0/customization/right-to-left.md`
  - Palette: `https://llms.mui.com/material-ui/7.2.0/customization/palette.md`
  - MUI X Data Grid Styling: `https://llms.mui.com/x-data-grid/8.8.0/style.md`
  - MUI X Data Grid Localization: `https://llms.mui.com/x-data-grid/8.8.0/localization.md`
- Internal files to skim quickly:
  - `packages/ui/core/src/theme/create-theme.ts`
  - `packages/ui/core/src/theme/core/components/index.ts`
  - `packages/ui/core/src/settings/settings-config.ts`
  - `packages/ui/core/src/settings/types.ts`

## Change Checklist
- [ ] Updated `components/index.ts` when adding or removing an override file.
- [ ] Adjusted both primary and secondary preset records if you introduced a new theme preset.
- [ ] Confirmed locale bundles in `i18n/constants.ts` export `systemValue.components` that matches MUI’s locale structure.
- [ ] Ran `bun run lint:fix` (and `bun run check` when touching types or schema).
- [ ] Communicated downstream impacts to `@beep/ui` when altering exported tokens or settings fields.
