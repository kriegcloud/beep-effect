# Storybook Architecture Design - @beep/ui

**Design Date**: 2026-01-29

---

## Executive Summary

This document defines the Storybook architecture for the beep-effect monorepo, focusing on `@beep/ui`. The design accounts for the critical discovery that `@beep/ui-editor` is an empty stub package with no extractable components.

**Key Decisions**:
1. Single Storybook instance in dedicated `tooling/storybook` workspace
2. Story files co-located with components using `.stories.tsx` suffix
3. Vite builder with explicit PostCSS configuration for Tailwind v4
4. Combined theme switching for MUI + Tailwind via `@storybook/addon-themes`

---

## Decision 1: Single vs Per-Package Storybook

**Decision**: Single Storybook instance

**Rationale**:
- `@beep/ui-editor` is empty (0 components) - no second target package exists
- Component inventory shows 271 `.tsx` files concentrated in `@beep/ui`
- Single instance eliminates duplication of provider configuration
- Build time concern only applies at 60s+ threshold
- Monorepo workspace resolution is simpler with unified configuration

---

## Decision 2: Storybook Location

**Decision**: Dedicated workspace at `tooling/storybook`

**Rationale**:
- Aligns with existing `tooling/*` convention (build-utils, cli, testkit)
- Separates build tooling from library source code
- Workspace pattern already established: `"tooling/*"` in root `package.json`
- Avoids polluting `@beep/ui` package.json with Storybook devDependencies

**Rejected Alternatives**:
- Root-level `.storybook/` - Violates monorepo separation of concerns
- `packages/ui/ui/.storybook/` - Couples tooling with library source

---

## Decision 3: Story File Location

**Decision**: Co-located with components using `.stories.tsx` suffix

**Rationale**:
- Discoverability: Story lives next to component implementation
- Maintenance: Component changes prompt story updates
- Glob pattern simplicity: `../packages/ui/ui/src/**/*.stories.tsx`
- Industry standard (shadcn/ui, Radix, MUI documentation patterns)

**File Naming Convention**:
```
src/components/button.tsx        → src/components/button.stories.tsx
src/inputs/TextField.tsx         → src/inputs/TextField.stories.tsx
src/layouts/dashboard/layout.tsx → src/layouts/dashboard/layout.stories.tsx
```

---

## Decision 4: Build Tool Configuration

**Decision**: Vite builder with explicit PostCSS passthrough

**Rationale**:
- Tailwind v4 requires explicit PostCSS configuration
- Project already uses `@tailwindcss/postcss` plugin
- Vite provides faster HMR than Webpack for component development
- `@storybook/nextjs` framework handles App Router specifics

---

## Decision 5: TypeScript Configuration

**Decision**: Extend `tsconfig.base.jsonc` with Storybook-specific paths

**Configuration**:
```jsonc
// tooling/storybook/tsconfig.json
{
  "extends": "../../tsconfig.base.jsonc",
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "noEmit": true,
    "paths": {
      "@beep/ui/*": ["../../packages/ui/ui/src/*"],
      "@beep/ui-core/*": ["../../packages/ui/core/src/*"]
    }
  },
  "include": [
    ".storybook/**/*.ts",
    ".storybook/**/*.tsx",
    "../../packages/ui/ui/src/**/*.stories.tsx"
  ]
}
```

---

## Decision 6: CSS Processing Pipeline

**Decision**: Import globals.css in preview.ts with PostCSS passthrough

**Processing Flow**:
```
globals.css
    ↓ @tailwindcss/postcss
    ↓ tw-animate-css
    ↓ Font imports
    ↓ Layer declarations (@layer theme, base, mui, components, utilities)
    ↓ Dark mode variant (@custom-variant dark)
    → Processed CSS in Storybook
```

---

## Directory Structure

```
beep-effect/
├── tooling/
│   └── storybook/                    # NEW: Dedicated Storybook workspace
│       ├── package.json
│       ├── tsconfig.json
│       └── .storybook/
│           ├── main.ts               # Framework & stories config
│           ├── preview.tsx           # Decorators & globals
│           └── decorators/
│               └── ThemeDecorator.tsx
│
├── packages/
│   └── ui/
│       ├── ui/
│       │   └── src/
│       │       ├── components/
│       │       │   ├── button.tsx
│       │       │   └── button.stories.tsx    # Co-located
│       │       └── ...
│       ├── core/                             # Theme, settings (unchanged)
│       └── editor/                           # Empty stub (unchanged)
│
└── turbo.json                                # Add storybook task
```

---

## Configuration Files

### 1. `tooling/storybook/package.json`

```json
{
  "name": "@beep/storybook",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "storybook dev -p 6006",
    "build": "storybook build -o dist",
    "check": "tsc --noEmit"
  },
  "devDependencies": {
    "@storybook/addon-a11y": "^8.6.0",
    "@storybook/addon-essentials": "^8.6.0",
    "@storybook/addon-interactions": "^8.6.0",
    "@storybook/addon-themes": "^8.6.0",
    "@storybook/blocks": "^8.6.0",
    "@storybook/nextjs": "^8.6.0",
    "@storybook/react": "^8.6.0",
    "@storybook/test": "^8.6.0",
    "storybook": "^8.6.0",
    "storybook-addon-pseudo-states": "^4.0.2",
    "@beep/ui": "workspace:^",
    "@beep/ui-core": "workspace:^"
  }
}
```

### 2. `tooling/storybook/.storybook/main.ts`

```typescript
import type { StorybookConfig } from "@storybook/nextjs";
import { join, dirname } from "node:path";

function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, "package.json")));
}

const config: StorybookConfig = {
  stories: [
    "../../../packages/ui/ui/src/**/*.stories.@(ts|tsx)",
  ],
  addons: [
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/addon-themes"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-interactions"),
    getAbsolutePath("storybook-addon-pseudo-states"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/nextjs") as "@storybook/nextjs",
    options: {},
  },
  viteFinal: async (config) => {
    config.css = {
      postcss: join(__dirname, "../../../packages/ui/ui/postcss.config.mjs"),
    };
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        "@beep/ui": join(__dirname, "../../../packages/ui/ui/src"),
        "@beep/ui-core": join(__dirname, "../../../packages/ui/core/src"),
      },
    };
    return config;
  },
  typescript: {
    reactDocgen: "react-docgen-typescript",
  },
};

export default config;
```

### 3. `turbo.json` Additions

```json
{
  "tasks": {
    "storybook:dev": {
      "cache": false,
      "persistent": true,
      "dependsOn": ["^build"]
    },
    "storybook:build": {
      "cache": true,
      "dependsOn": ["^build"],
      "outputs": ["tooling/storybook/dist/**"],
      "inputs": [
        "tooling/storybook/.storybook/**",
        "packages/ui/ui/src/**/*.stories.tsx",
        "packages/ui/ui/src/styles/**"
      ]
    }
  }
}
```

---

## @beep/ui-editor Status

**Current State**: Empty stub package

**Files Present**:
- `packages/ui/editor/AGENTS.md`
- `packages/ui/editor/README.md`
- `packages/ui/editor/reset.d.ts`
- `packages/ui/editor/test/Dummy.test.ts`

**Source Files**: None (0 components)

**Implication for Phase 4c (Editor Stories)**:
- Phase 4c scope is MINIMAL - no editor components exist to document
- Lexical editor code resides in `apps/todox/src/app/lexical/` (90+ files)
- Editor extraction to `@beep/ui-editor` is prerequisite for meaningful editor stories

**Recommended Action**:
1. Mark `@beep/ui-editor` stories as blocked pending extraction
2. Focus Phase 4 effort entirely on `@beep/ui` primitives and complex components

---

## Provider Stack Order

For components requiring full context:
```tsx
<MuiThemeProvider theme={theme}>
  <CssBaseline />
  <Story />
</MuiThemeProvider>
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Tailwind v4 + Storybook incompatibility | Explicit PostCSS passthrough in `viteFinal` |
| MUI v7 SSR issues | Disable SSR in Storybook (client-only) |
| Workspace resolution failures | Explicit alias mapping in Vite config |
| React 19 compatibility | Use Storybook 8.6+ with React 19 support |
| Build time growth | Turborepo caching + selective story inclusion |

---

## Implementation Checklist

Phase 3 should create:
- [ ] `tooling/storybook/package.json`
- [ ] `tooling/storybook/tsconfig.json`
- [ ] `tooling/storybook/.storybook/main.ts`
- [ ] `tooling/storybook/.storybook/preview.tsx`
- [ ] Update `turbo.json` with storybook tasks
- [ ] Verify `bun run storybook:dev` starts successfully
- [ ] Verify theme switching works (light/dark toggle)
- [ ] Verify Tailwind classes render correctly
