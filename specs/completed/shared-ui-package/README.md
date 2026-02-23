# Shared UI Package (`@beep/ui`)

## Status
COMPLETED

## Owner
@elpresidank

## Created
2026-02-22

## Purpose
Create a shared UI package at `packages/ui/ui` (`@beep/ui`) that owns the monorepo's component library, design token system, shadcn configuration, and Storybook setup. This enables consistent UI across multiple apps by providing a single source of truth for theme, components, and visual testing.

## Why This Spec Exists

The monorepo currently has all UI infrastructure locked inside `apps/web`:
- **1 shadcn component** (button.tsx) lives in `apps/web/src/components/ui/`
- **Theme tokens** (OKLch colors, dark mode, radius scales) live in `apps/web/src/app/globals.css`
- **`cn()` utility** lives in `apps/web/src/lib/utils.ts`
- **`components.json`** aliases point to `@beep/web/*` (app-local)
- **No Storybook** exists anywhere in the repo
- **No shared PostCSS/Tailwind config** for cross-app consumption

This means any future app would need to duplicate all theme tokens, utilities, and shadcn config from scratch. A shared `@beep/ui` package solves this by extracting the common UI foundation into a reusable workspace package.

## Primary Goal

Create `@beep/ui` (`packages/ui/ui`) that provides:
1. **Shared shadcn component library** — source-distributed `.tsx` components consumed by apps via Turbopack JIT compilation
2. **Shared theme system** — CSS custom properties (OKLch), Tailwind v4 `@theme inline` mappings, dark mode support
3. **Shared utilities** — `cn()` and future component helpers
4. **Shared Storybook** — Storybook 10 with `@storybook/react-vite`, a11y/docs/themes addons
5. **Shared PostCSS config** — `@tailwindcss/postcss` plugin configuration

## Package Location

`packages/ui/ui` — following the existing `packages/{category}/{name}` pattern (e.g., `packages/common/schema`, `packages/common/types`).

Scoped name: `@beep/ui`

## Architecture

### Distribution Strategy: Just-in-Time (Source)

shadcn components are source `.tsx` files. The consuming app's bundler (Turbopack) compiles them. This is the official shadcn monorepo pattern and avoids unnecessary build complexity.

- No `tsup`, `unbuild`, or Babel build step for components
- Components exported directly as TypeScript source via `package.json` exports
- Apps add `@beep/ui` to `transpilePackages` in Next.js config

### Package Exports

```json
{
  "exports": {
    ".": { "import": "./src/index.ts", "types": "./src/index.ts" },
    "./styles/globals.css": "./src/styles/globals.css",
    "./postcss.config": "./postcss.config.mjs",
    "./components/*": "./src/components/*.tsx",
    "./components/ui/*": "./src/components/ui/*.tsx",
    "./hooks/*": "./src/hooks/*.ts",
    "./lib/*": "./src/lib/*.ts"
  }
}
```

### Directory Structure

```
packages/ui/ui/
  package.json
  tsconfig.json
  components.json                 # shadcn config (shared)
  postcss.config.mjs              # shared PostCSS
  .storybook/
    main.ts                       # Storybook 10 config
    preview.ts                    # Global decorators, theme imports
  src/
    index.ts                      # Package entry (re-exports)
    styles/
      globals.css                 # Authoritative theme tokens + Tailwind imports
    components/
      ui/                         # shadcn components (source .tsx)
        button.tsx                # Moved from apps/web
        (future components)
    lib/
      utils.ts                    # cn() utility
    hooks/                        # Shared React hooks (empty initially)
  test/
    .gitkeep
  dtslint/
    .gitkeep
  docs/
    index.md
  LICENSE
  README.md
  AGENTS.md
  ai-context.md
  CLAUDE.md -> AGENTS.md
  docgen.json
  vitest.config.ts
```

### Theme Token Flow

```
@beep/ui (source of truth)
  └── src/styles/globals.css
        ├── :root { CSS custom properties }
        ├── .dark { dark mode overrides }
        └── @theme inline { Tailwind mappings }

apps/web (consumer)
  └── src/app/globals.css
        ├── @import "tailwindcss"
        ├── @import "@beep/ui/styles/globals.css"
        ├── @source "../../../../packages/ui/ui/src"
        └── (app-specific: fonts, layout overrides)
```

### Consumer Integration

Apps consuming `@beep/ui` need:

1. **Workspace dependency**: `"@beep/ui": "workspace:^"` in `package.json`
2. **transpilePackages**: Add `"@beep/ui"` to Next.js config
3. **CSS import**: `@import "@beep/ui/styles/globals.css"` in app's globals.css
4. **Tailwind source scanning**: `@source "../../../../packages/ui/ui/src"` in app's globals.css
5. **Updated `components.json`**: Point `ui`/`utils`/`lib`/`hooks` aliases to `@beep/ui/*`

## Scope

### In Scope
- Create `packages/ui/ui` package using `beep create-package` as foundation
- Move button component from `apps/web/src/components/ui/button.tsx`
- Move `cn()` utility from `apps/web/src/lib/utils.ts`
- Extract theme tokens from `apps/web/src/app/globals.css` into shared styles
- Create `components.json` for the UI package
- Set up Storybook 10 with `@storybook/react-vite` framework
- Add Storybook addons: `@storybook/addon-docs`, `@storybook/addon-a11y`, `@storybook/addon-themes`
- Create `preview.ts` that imports shared theme CSS and configures dark mode toggle
- Add Storybook scripts to `package.json` and Turbo tasks to `turbo.json`
- Update `apps/web` to consume from `@beep/ui` instead of local files
- Update `apps/web/components.json` aliases
- Update `apps/web/next.config.ts` `transpilePackages`
- Update `apps/web/src/app/globals.css` to import from `@beep/ui`
- Add all new deps to root catalog
- Add a Button story (`button.stories.tsx`) as the initial Storybook content

### Out of Scope
- MUI theme integration (not in current `apps/web` deps; future spec if needed)
- Chromatic CI integration (separate P1 item in tooling plan)
- Building/bundling the UI package (JIT source distribution, no build step)
- Additional shadcn component installation beyond button (future work)
- Visual regression testing setup (separate tooling plan item)
- Creating new apps that consume `@beep/ui`

## Dependencies

### Runtime Dependencies (from root catalog)
| Package | Version | Purpose |
|---------|---------|---------|
| `@base-ui/react` | `^1.2.0` | Headless UI primitives |
| `@phosphor-icons/react` | `^2.1.10` | Icon library |
| `class-variance-authority` | `^0.7.1` | Component variant management |
| `clsx` | `^2.1.1` | Class name composition |
| `tailwind-merge` | `^3.5.0` | Tailwind class deduplication |

### Peer Dependencies
| Package | Version | Why Peer |
|---------|---------|----------|
| `react` | `^19` | Consumed by app's React runtime |
| `react-dom` | `^19` | Consumed by app's React runtime |

### Dev Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | `^4` | Utility CSS framework |
| `@tailwindcss/postcss` | `^4` | PostCSS plugin |
| `tw-animate-css` | `^1.4.0` | Animation utilities |
| `shadcn` | `^3.8.5` | Component generation CLI |
| `@storybook/react-vite` | `^10.x` | Storybook framework |
| `@storybook/addon-docs` | `^10.x` | Documentation addon |
| `@storybook/addon-a11y` | `^10.x` | Accessibility addon |
| `@storybook/addon-themes` | `^10.x` | Theme switching addon |
| `storybook` | `^10.x` | Storybook CLI |

### New Catalog Entries Required
```json
{
  "@storybook/react-vite": "^10.0.0",
  "@storybook/addon-docs": "^10.0.0",
  "@storybook/addon-a11y": "^10.0.0",
  "@storybook/addon-themes": "^10.0.0",
  "storybook": "^10.0.0"
}
```

## Storybook Configuration

### Framework: `@storybook/react-vite`

Chosen over `@storybook/nextjs` because:
- Shared UI components are framework-agnostic React (no Next.js features like next/image, next/link)
- Vite builder is faster for HMR and builds
- Framework-agnostic Storybook can serve components to any React app, not just Next.js

### Addon Baseline

| Addon | Purpose |
|-------|---------|
| `@storybook/addon-docs` | Auto-generated documentation from component props |
| `@storybook/addon-a11y` | Accessibility checking (axe-core) per story |
| `@storybook/addon-themes` | Light/dark mode toggle in Storybook toolbar |

### Turbo Task Integration

```json
{
  "tasks": {
    "storybook": {
      "persistent": true,
      "cache": false
    },
    "build-storybook": {
      "dependsOn": ["^build"],
      "outputs": ["storybook-static/**"]
    }
  }
}
```

## Execution Plan For Another Agent Instance

### Phase 0: Research & Audit
Deliverable:
- `specs/pending/shared-ui-package/outputs/research.md` (already complete — preliminary research)

Must include:
- Current UI asset inventory in `apps/web`
- shadcn monorepo pattern documentation
- Tailwind v4 content scanning strategy
- Storybook 10 configuration patterns
- Package exports design

### Phase 1: Design
Deliverable:
- `specs/pending/shared-ui-package/outputs/design.md`

Must include:
- Final directory structure
- `package.json` with all deps, exports, scripts
- `components.json` for both UI package and updated app
- Theme token extraction plan (what moves, what stays)
- Storybook `main.ts` and `preview.ts` configuration
- `turbo.json` task additions
- Migration checklist for `apps/web` updates
- Test strategy

### Phase 2: Package Scaffolding
Expected code areas:
- Run `beep create-package ui --type library --parent-dir packages/ui --description "Shared UI component library with shadcn, Tailwind v4 theme, and Storybook"` as starting point
- Manually adjust the generated scaffold for UI-specific needs (Storybook, components.json, etc.)
- Add all Storybook deps to root catalog and UI package

### Phase 3: Asset Migration
Expected code areas:
- Move `apps/web/src/components/ui/button.tsx` -> `packages/ui/ui/src/components/ui/button.tsx`
- Move `apps/web/src/lib/utils.ts` -> `packages/ui/ui/src/lib/utils.ts`
- Extract theme tokens from `apps/web/src/app/globals.css` -> `packages/ui/ui/src/styles/globals.css`
- Update `apps/web/src/app/globals.css` to import from `@beep/ui`
- Add `@source` directive to app CSS for Tailwind content scanning
- Update `apps/web/components.json` aliases
- Update `apps/web/next.config.ts` `transpilePackages`
- Update `apps/web/package.json` to add `@beep/ui` dependency
- Remove duplicated files from `apps/web`
- Verify `apps/web` builds and runs correctly with shared imports

### Phase 4: Storybook Setup
Expected code areas:
- Create `packages/ui/ui/.storybook/main.ts`
- Create `packages/ui/ui/.storybook/preview.ts`
- Create `packages/ui/ui/src/components/ui/button.stories.tsx`
- Add Storybook scripts to `packages/ui/ui/package.json`
- Add Storybook tasks to root `turbo.json`
- Verify Storybook starts and renders button story correctly

### Phase 5: Verification
Run:
```bash
bun run build
bun run check
bun run test
bun run lint:jsdoc
bun run lint
```

Also verify:
```bash
# UI package Storybook starts
cd packages/ui/ui && bun run storybook

# Web app still builds with shared imports
cd apps/web && bun run build

# shadcn CLI works from UI package
cd packages/ui/ui && bunx shadcn add card --dry-run
```

## Success Criteria
- [x] `@beep/ui` package exists at `packages/ui/ui`
- [x] `package.json` has correct exports, dependencies, and peer dependencies
- [x] `components.json` configured for shared component generation
- [x] Theme tokens extracted to `src/styles/globals.css`
- [x] `cn()` utility lives in `src/lib/utils.ts`
- [x] Button component moved to `src/components/ui/button.tsx`
- [x] `apps/web` imports components and theme from `@beep/ui`
- [x] `apps/web` builds successfully with shared imports
- [x] `apps/web/components.json` aliases updated to point to `@beep/ui`
- [x] `apps/web/next.config.ts` includes `@beep/ui` in `transpilePackages`
- [x] Tailwind content scanning via `@source` covers UI package
- [x] Storybook 10 configured with `@storybook/react-vite` framework
- [x] Storybook addons: docs, a11y, themes, **vitest** (added beyond original scope)
- [x] Button story renders correctly in Storybook
- [x] Storybook tasks added to `turbo.json`
- [x] All Storybook deps in root catalog
- [x] Full repo verification commands pass (build, check, test, lint)

### Bonus (beyond original scope)
- [x] `@storybook/addon-vitest` for component testing in real browser (Playwright)
- [x] Interaction tests with `play` functions on Button stories (Default + ClickInteraction)
- [x] Lost Pixel visual regression testing with 9 baseline screenshots
- [x] Dedicated `vitest.storybook.config.ts` for browser-based Storybook tests
- [x] `test:storybook`, `test:visual`, `test:visual:update` scripts + Turbo tasks
- [x] Dark/light theme toggle in Storybook with CSS overrides for docs pages

## Open Questions
1. Should the package be at `packages/ui/ui` or `packages/ui`?
   Proposed: `packages/ui/ui` following the `packages/{category}/{name}` convention. The `ui` category can later hold `packages/ui/icons`, `packages/ui/charts`, etc.
2. Should button.stories.tsx use Storybook's play functions for interaction tests?
   Proposed: Not in v1. Simple render stories first. Add interaction tests as a follow-up.
3. Should we add a `build-storybook` CI step immediately?
   Proposed: No. Build Storybook locally for now. CI integration is a separate tooling plan item (Chromatic or Playwright snapshots).

## Exit Condition
This spec is complete when another agent instance can execute Phases 0-5 and land a working `@beep/ui` package with shared theme, shadcn components, and Storybook, consumed by `apps/web` with all quality checks passing.

## Navigation
- [Handoffs](./handoffs/) - Phase transition documents
- [Outputs](./outputs/) - Phase artifacts
