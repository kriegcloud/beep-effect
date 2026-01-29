# Codebase Context: @beep/ui and @beep/ui-editor

**Analysis Date**: 2026-01-29

---

## Package Overview

### @beep/ui
- **Location**: `packages/ui/ui`
- **Total Component Files**: ~514 source files
- **Styling**: MUI + shadcn/ui + Tailwind CSS

### @beep/ui-editor
- **Location**: `packages/ui/editor`
- **Dependencies**: Lexical rich text editor
- **Uses**: .ts files with React components

### @beep/ui-core
- **Location**: `packages/ui/core`
- **Purpose**: Theme creation, settings, utilities

---

## Component Directory Structure (@beep/ui)

| Directory | Count | Purpose |
|-----------|-------|---------|
| `components/` | 53 | shadcn-style base components |
| `atoms/` | 8 | Base atomic components |
| `molecules/` | 7 | Compound components |
| `organisms/` | 11 | Complex components |
| `inputs/` | 40 | Form input components |
| `layouts/` | 51 | Page layout components |
| `routing/` | 27 | Navigation components |
| `animate/` | 9 | Animation components |
| `icons/` | 8 | Icon components |
| `form/` | 4 | Form utilities |
| `progress/` | 4 | Loading/progress components |
| `flexlayout-react/` | 19 | Docking layout system |

---

## CSS/Styling Architecture

### Tailwind CSS Configuration
- **PostCSS Config**: `packages/ui/ui/postcss.config.mjs`
- Uses `@tailwindcss/postcss` plugin
- **Global CSS**: `packages/ui/ui/src/styles/globals.css`

### Global CSS Features
- Tailwind v4 import: `@import "tailwindcss"`
- Layer declarations: `@layer theme, base, mui, components, utilities`
- Custom dark mode variant: `@custom-variant dark (&:is(.dark *))`

### Fonts
- `@fontsource-variable/public-sans` (primary)
- `@fontsource/barlow`
- `@fontsource-variable/dm-sans`
- `@fontsource-variable/inter`

---

## shadcn/ui Configuration

**File**: `packages/ui/ui/components.json`
- Style: `new-york`
- Base color: `neutral`
- CSS variables: `true`
- Icon library: `lucide`

**Path Aliases**:
- `utils` → `@beep/ui-core/utils`
- `components` → `@beep/ui/components`
- `hooks` → `@beep/ui/hooks`
- `ui` → `@beep/ui/components`

---

## Theme Integration (@beep/ui-core)

### Theme Creation
- **File**: `packages/ui/core/src/theme/create-theme.ts`
- Uses `createMuiTheme` from `@mui/material/styles`
- Supports dual color schemes: `light` and `dark`

### Theme Config
- **File**: `packages/ui/core/src/theme/theme-config.ts`
- Default mode: `dark`
- Direction: `ltr`
- CSS var prefix: empty string
- Color scheme selector: `data-color-scheme`

### Settings State
- `mode`: dark/light/system
- `direction`: ltr/rtl
- `contrast`: default/high
- `navLayout`: vertical/horizontal/mini
- `primaryColor`: ThemeColorPreset
- Storage key: `app-settings`

### Theme Provider
- **File**: `packages/ui/ui/src/theme/theme-provider.tsx`
- Wraps MUI `ThemeProvider`
- Includes `CssBaseline`
- Wraps with `Rtl` for RTL support
- Uses `useSettingsContext` for settings integration

---

## Build Configuration

### Build Scripts (@beep/ui)
- `build-esm`: TypeScript compilation
- `build-cjs`: Babel transformation
- Preserves "use client" directives

### TypeScript Configuration
- Target: `ES2024`
- Module: `esnext`
- Module resolution: `bundler`
- JSX: `preserve`

---

## Peer Dependencies (Critical for Storybook)

### Core UI Libraries
- `react`, `react-dom`
- `@mui/material`, `@mui/lab`, `@mui/x-data-grid`
- `@emotion/react`, `@emotion/styled`, `@emotion/cache`

### Animation
- `framer-motion`

### Radix UI Primitives
- 28 @radix-ui/* packages for shadcn components

### Icons
- `@iconify/react`
- `lucide-react`

### Forms
- `@tanstack/react-form`

### Styling
- `clsx`
- `tailwind-merge`

---

## Storybook Considerations

### Critical Provider Stack (Order Matters)
1. i18n initialization
2. SettingsProvider with defaultSettings
3. ThemeProvider
4. Story content

### CSS Requirements
- Must import `@beep/ui/globals.css`
- PostCSS with `@tailwindcss/postcss`
- Font imports included in globals.css

### Dark Mode Implementation
- Uses `data-color-scheme` attribute
- MUI `CssBaseline` handles base styles
- Settings context controls mode

### RTL Support
- `Rtl` component wraps for RTL
- Uses `stylis-plugin-rtl` for Emotion

---

## Key Configuration Files

| Purpose | Path |
|---------|------|
| Package config | `packages/ui/ui/package.json` |
| shadcn config | `packages/ui/ui/components.json` |
| Global CSS | `packages/ui/ui/src/styles/globals.css` |
| PostCSS | `packages/ui/ui/postcss.config.mjs` |
| Theme creation | `packages/ui/core/src/theme/create-theme.ts` |
| Theme config | `packages/ui/core/src/theme/theme-config.ts` |
| Settings types | `packages/ui/core/src/settings/types.ts` |
| Theme provider | `packages/ui/ui/src/theme/theme-provider.tsx` |
| Settings provider | `packages/ui/ui/src/settings/context/settings-provider.tsx` |

---

## Potential Challenges

1. Complex peer dependency graph
2. Multiple styling systems (MUI + Tailwind + Emotion)
3. React 19 compatibility
4. Monorepo workspace resolution
5. Effect library integration
