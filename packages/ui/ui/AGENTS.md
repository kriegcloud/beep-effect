# `@beep/ui` Agent Guide

## Purpose & Dependencies
- Opinionated React component library that composes `@beep/ui-core` theme primitives with MUI, shadcn components, Tailwind utilities, and specialty stacks (Framer Motion, Plate.js rich text editor, TanStack Form).
- Exports under `package.json#exports` mirror the directory structure. Key exported paths include:
  - Component hierarchy: `atoms/*`, `molecules/*`, `organisms/*`, `sections/*`, `components/*`
  - Functionality: `providers/*`, `hooks/*`, `inputs/*`, `form/*`, `layouts/*`
  - Theming/styling: `theme/*`, `settings/*`, `animate/*`, `progress/*`
  - Utilities: `i18n/*`, `lib/*`, `services/*`, `routing/*`, `icons/*`, `messages/*`
  - Assets: `assets/*`, `branding/*`, `data-display/*`, `surfaces/*`, `common/*`
  - CSS: `globals.css`, `postcss.config`
- Always update both build outputs (`build/esm`, `build/cjs`, `build/src`) and type declarations (`build/dts`) when adding new exported directories.
- Peer and dev dependencies are sourced from workspace catalogs; notable requirements:
  - Core: `react@19`, `react-dom@19`, `@mui/material`, `@emotion/*`, `@beep/ui-core`
  - Workspace packages: `@beep/invariant`, `@beep/schema`, `@beep/utils`, `@beep/constants`, `@beep/shared-domain`, `@beep/identity`, `@beep/types`
  - Styling: `tailwindcss`, `@tailwindcss/postcss`, `clsx`, `tailwind-merge`, `tailwindcss-animate`, `tw-animate-css`
  - UI libraries: `framer-motion`, `sonner`, `nprogress`, extensive `@radix-ui/*` components, `lucide-react`
  - Rich text: `platejs` and extensive `@platejs/*` plugins, `turndown`, `react-markdown`, `rehype-*`, `remark-*`
  - Forms/validation: `@tanstack/react-form`, `zod`, `effect`
  - MUI ecosystem: `@mui/x-data-grid`, `@mui/x-date-pickers`, `@mui/x-tree-view`, `@mui/lab`
  - i18n: `i18next`, `react-i18next`, `i18next-browser-languagedetector`, `accept-language`
- Downstream packages (e.g., `apps/web`) import these modules directly via workspace aliases; breaking surface exports will cascade into app runtimes.

## Theme & Settings Integration
- `src/theme/theme-provider.tsx` wraps children with:
  - `createTheme` from `@beep/ui-core` (injects settings overrides and locale components from `useTranslate()` → `currentLang.systemValue`).
  - `ThemeProvider` from MUI with `disableTransitionOnChange` for smoother color scheme swaps.
  - `Rtl` from `@beep/ui-core/theme/with-settings/right-to-left` to manage document direction.
- Settings layers:
  - Settings context (`src/settings/context`) connects to `@beep/ui-core/settings`. This state drives theme mode, primary color presets, typography, and navigation layout flags used by the theming pipeline.
  - Settings drawer (`src/settings/drawer`) provides UI controls for theme customization.
  - When extending settings, ensure the persisted `version` field is updated to avoid stale local storage.
- Locale overrides live in `packages/ui-core/src/i18n/constants.ts`; hook new locales there so `ThemeProvider` receives `Components<Theme>` bundles.

## Component Organization
- Directory taxonomy inside `src`:
  - `atoms`, `molecules`, `organisms`, `sections` – design-system gradation; barrels under `src/components` aggregate cross-tier exports.
  - `animate`, `branding`, `surfaces`, `progress`, `inputs`, `form`, `hooks`, `providers`, `routing`, `utils` – specialized groupings surfaced through package exports.
  - `styles` hosts global Tailwind + CSS variable definitions; `theme` contains provider plumbing.
- Conventions:
  - Namespace Effect utilities (`import * as A from "effect/Array"`, `import * as Str from "effect/String"`) and avoid native array/string methods. The repo’s critical rule applies here just as in `ui-core`.
  - Prefer collocating component stories/examples near implementation (no Storybook yet—add local demos under `apps/web` when needed).
  - Keep client/server boundaries explicit via `"use client"` directives at the file top for React 19 compliance.

## Styling Layers
- Tailwind, shadcn, and CSS variables converge in `src/styles/globals.css`:
  - Declares layered Tailwind imports, font families, baseline resets, and SimpleBar styling.
  - CSS variables come from `@beep/ui-core`’s theme; avoid redefining them locally unless necessary.
- `components.json` configures shadcn to target `src/styles/globals.css` and maps aliases to package exports. When running `bunx shadcn-ui`, this file must stay in sync with new directories.
- PostCSS pipeline is minimal (`postcss.config.mjs`), delegating to `@tailwindcss/postcss`. Any plugin additions should be coordinated with Next.js build settings in `apps/web`.
- Choose the right styling tool:
  - Use `@beep/ui/styled` helpers for repeated MUI customizations (`styled-text-field`, `outlined-badge`).
  - Use `sx` prop for token-aware tweaks and Tailwind utilities for layout scaffolding (keep `globals.css` authoritative for base tokens).

## Providers, Hooks & Utilities
- Provider exports (`src/providers`):
  - `AuthAdapterProvider` – typed context for auth/session adapters, notifications, and workspaces. Backed by `createCtx` from `@beep/ui-core/utils`.
  - `break-points.provider`, `bulk-select.provider` – manage responsive breakpoints and selection state across data-heavy surfaces.
- Hooks:
  - `src/hooks` includes storage hooks (`useCookies`, `useLocalStorage`), breakpoints, and helpers consumed by settings and layout modules.
  - `src/settings/context/use-settings-context.ts` wraps React's experimental `use()` to enforce provider presence.
- i18n:
  - `src/i18n` bridges to `@beep/ui-core/i18n/constants.ts`. Language metadata is centralized there; ensure added locales update both packages.
- Navigation layouts in `src/layouts/main-layout/**/*` consume settings from the settings context. Changing layout behavior requires coordinating with the settings provider and state.

## Operational Workflows
- Build & distribution:
  - `bun run build` orchestrates ESM, CJS, and annotated builds, then copies `globals.css` into each artifact.
  - `bun run codegen` (alias for `build-utils prepare-v2`) refreshes generated exports—run after introducing new directories or shadcn components.
  - `bun run lint:fix` enforces Biome formatting; `bun run check` performs TypeScript project references validation.
  - `bun run test` executes the Vitest suite (add focused tests under `src/**/__tests__` when extending components).
- Local development:
  - Use `bun run dev` for incremental TypeScript builds (`tsconfig.build.json`).
  - When debugging CSS, ensure Tailwind classes compile via `globals.css`; the Tailwind CLI is not bundled—rely on Next.js dev server in `apps/web` or run `bunx tailwindcss -i` ad hoc if necessary.
- Sanity checks before publishing changes:
  - Confirm exported barrels (`src/components/index.ts`, `src/atoms/index.ts`, etc.) match build outputs.
  - Update `components.json` if you add new alias directories to keep shadcn scaffolding usable.
  - Re-run `bun run build` to ensure Babel transforms (CJS/annotate phases) still succeed, especially after introducing `"use client"` entry points.

## Reference Library
- Internal docs:
  - `packages/ui/core/AGENTS.md` – upstream theme & settings contract.
  - `packages/ui/ui/src/theme/theme-provider.tsx`, `packages/ui/ui/src/settings/context/settings-provider.tsx`.
  - `packages/ui/ui/components.json`, `packages/ui/ui/src/styles/globals.css`, `packages/ui/ui/postcss.config.mjs`.
- External documentation resources:
  - MUI Next.js Integration: `https://llms.mui.com/material-ui/7.2.0/integrations/nextjs.md`
  - MUI + Tailwind CSS v4: `https://llms.mui.com/material-ui/7.2.0/integrations/tailwindcss/tailwindcss-v4.md`
  - CSS Baseline: `https://llms.mui.com/material-ui/7.2.0/components/css-baseline.md`
  - Responsive UI: `https://llms.mui.com/material-ui/7.2.0/guides/responsive-ui.md`
  - MUI X Data Grid Toolbar: `https://llms.mui.com/x-data-grid/8.8.0/components/toolbar.md`
  - MUI X Data Grid Style Recipes: `https://llms.mui.com/x-data-grid/8.8.0/style-recipes.md`
  - MUI X Data Grid Quick Filter: `https://llms.mui.com/x-data-grid/8.8.0/filtering/quick-filter.md`
  - Shadcn UI Guide: `https://ui.shadcn.com/docs`
  - Tailwind CSS Installation: `https://tailwindcss.com/docs/installation`

## Change Checklist
- [ ] Updated barrel exports (`src/**/index.ts`) and `package.json#exports` for new components.
- [ ] Coordinated theme token or settings changes with `@beep/ui-core` to avoid runtime mismatches.
- [ ] Regenerated build artifacts via `bun run build` (and re-ran `bun run codegen` when adding shadcn components).
- [ ] Executed `bun run lint:fix` (plus `bun run check` / `bun run test` when altering TypeScript types or logic).
- [ ] Reviewed locale additions so `ThemeProvider` receives the correct `localeComponents` bundle.
