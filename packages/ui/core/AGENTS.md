# `@beep/ui-core` Agent Guide

## Mission & Exports
- Acts as the source of truth for design tokens, palette math, typography, and MUI component overrides consumed by higher-level packages such as `@beep/ui`.
- Public surface lives under:
  - `packages/ui-core/src/theme/index.ts` – re-exports `createTheme`, `baseTheme`, `themeConfig`, `components`, `with-settings` helpers, `styles`, and type augmentation hooks.
  - `packages/ui-core/src/settings/index.ts` – exposes `SettingsProvider` types, defaults, storage keys, and schema utilities.
- Any exports added here ripple into the entire monorepo. Confirm new tokens or helpers are re-exported through these index barrels.

## Theme Foundations
- Starting point is `packages/ui-core/src/theme/create-theme.ts`:
  - `baseTheme` assembles dual color schemes (`light` and `dark`), typography, shape, mixins, `unstable_sxConfig`, and `cssVariables` (CSS theme variables are enabled via `themeConfig.cssVariables`).
  - `createTheme` merges four inputs: `baseTheme`, optional settings-driven updates, locale-specific component bundles, and caller-provided overrides.
- Key configuration files worth skimming before any change:
  - `theme-config.ts` – default direction (`ltr`), mode (`dark`), palette tokens, font families, and CSS variable selectors.
  - `core/palette.ts` – builds channel-aware color objects with helpers such as `createPaletteChannel`, `cssVarRgba`, and exports shared “vibrant” colors. Update this file when introducing new color primitives.
  - `core/typography.ts` – centralizes typography variants and responsive scale; uses `setFont` from `@beep/ui-core/utils`.
  - `sx-config.ts` – complements the design system with reusable `sx` transformations (e.g., `lineClamp`).
- Locale overrides pattern:
  - `createTheme` accepts `localeComponents?: { components?: Components<Theme> | undefined } | undefined`.
  - The `ThemeProvider` in `@beep/ui` passes `currentLang.systemValue` (see `packages/ui-core/src/i18n/constants.ts`) which merges MUI X Data Grid and Date Pickers locale bundles.
  - To add a new locale, extend `allLanguages` with a `systemValue` containing the relevant MUI locale `components` object.

## Settings-Driven Customization
- Settings state is defined in `packages/ui-core/src/settings/types.ts`:
  - Fields include `mode`, `direction`, `contrast`, `fontSize`, `fontFamily`, `primaryColor`, `navLayout`, `navColor`, `compactLayout`, and a `version` string used for storage invalidation.
  - Default values live in `settings-config.ts`; storage key is `SETTINGS_STORAGE_KEY`.
  - `SettingsProvider` in `packages/ui/src/settings/context/settings-provider.tsx` uses the version field to wipe stale persisted values.
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
- Global overrides reside in `packages/ui-core/src/theme/core/components`.
  - Each file mirrors an MUI component key (e.g., `button.tsx` → `MuiButton`, `mui-x-data-grid.tsx` → MUI X Data Grid).
  - Aggregator: `components/index.ts`. Additions must be wired here or overrides will never ship.
  - Prefer Effect utilities when iterating over collections inside overrides—native array/string methods are forbidden (`CRITICAL RULE` in `AGENTS.md` at repo root).
- Useful entry points:
  - `core/components/mui-x-*` – MUI X overrides align Data Grid and Date Picker tokens with the core palette.
  - `core/components/text-field.tsx` – centralizes variant density rules; update here before touching inline component styles elsewhere.
  - `core/styles/*` – ready-made style objects (e.g., vibrant nav styles) shared with `@beep/ui`.

## Utilities & Supporting Modules
- `packages/ui-core/src/utils` includes helpers used throughout the theme:
  - `createPaletteChannel`, `hexToRgbChannel`, `cssVarRgba` for color math.
  - `pxToRem`, `setFont` for typography.
  - Storage helpers (`getStorage`, `getCookie`, `getItemFromStore`) used by both settings providers (`@beep/ui` and `@beep/ui/settings-v2`).
- Keep utilities Effect-friendly. Avoid introducing bare Promises or native array/string mutations—follow the namespace import guidelines in the root instructions.

## Operational Guidance
- **Validations**
  - Run `bun run lint:fix` before leaving changes to ensure Biome formatting passes.
  - Prefer `bun run check` when you modify shared types or settings schema to surface TypeScript regressions.
  - For localized overrides, smoke-test via `bun run test --filter theme` (add a targeted test if the filter does not exist yet).
- **Cross-package impacts**
  - Downstream surfaces: `@beep/ui` consumes `createTheme`, `Rtl`, `mainDrawerWidth`, and settings schema. Breaking changes here will propagate to the Next.js app (`apps/web`) through `@beep/ui`.
  - Coordinate updates with `packages/ui` whenever you adjust token names, preset unions, or settings fields.

## Reference Library
- MUI docs worth fetching via `mui-mcp__useMuiDocs`:
  - `https://llms.mui.com/material-ui/7.2.0/customization/theming.md`
  - `https://llms.mui.com/material-ui/7.2.0/customization/css-theme-variables/overview.md`
  - `https://llms.mui.com/material-ui/7.2.0/customization/theme-components.md`
- Internal files to skim quickly:
  - `packages/ui-core/src/theme/create-theme.ts`
  - `packages/ui-core/src/theme/core/components/index.ts`
  - `packages/ui-core/src/settings/settings-config.ts`
  - `packages/ui-core/src/settings/schema/*` for Effect schema definitions powering `settings-v2`.

## Tool Call Shortcuts
- Pull full theming contract details before touching `createTheme`: `mui-mcp__useMuiDocs(["https://llms.mui.com/material-ui/7.2.0/customization/theming.md"])`
- Deep dive CSS variable behaviour when updating `themeConfig.cssVariables`: `mui-mcp__useMuiDocs(["https://llms.mui.com/material-ui/7.2.0/customization/css-theme-variables/usage.md"])`
- Confirm RTL setup while editing `with-settings/right-to-left.tsx`: `mui-mcp__useMuiDocs(["https://llms.mui.com/material-ui/7.2.0/customization/right-to-left.md"])`
- Reconcile Data Grid override changes with upstream styling guidance: `mui-mcp__useMuiDocs(["https://llms.mui.com/x-data-grid/8.8.0/style.md"])`
- Validate locale bundle structure against MUI X expectations: `mui-mcp__useMuiDocs(["https://llms.mui.com/x-data-grid/8.8.0/localization.md"])`
- Cross-check palette math against official token guidance: `mui-mcp__useMuiDocs(["https://llms.mui.com/material-ui/7.2.0/customization/palette.md"])`
- Refresh Effect schema and layer patterns before editing settings schemas: `context7__get-library-docs({"context7CompatibleLibraryID":"/effect-ts/effect","topic":"schema"})` (run `context7__resolve-library-id` first if the ID drifts)

## Change Checklist
- [ ] Updated `components/index.ts` when adding or removing an override file.
- [ ] Adjusted both primary and secondary preset records if you introduced a new theme preset.
- [ ] Confirmed locale bundles in `i18n/constants.ts` export `systemValue.components` that matches MUI’s locale structure.
- [ ] Ran `bun run lint:fix` (and `bun run check` when touching types or schema).
- [ ] Communicated downstream impacts to `@beep/ui` when altering exported tokens or settings fields.
