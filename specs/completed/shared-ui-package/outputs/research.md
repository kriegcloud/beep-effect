# Shared UI Package: Preliminary Research

## 1. Current State Audit

### What Exists Today

| Aspect | Location | Status | Shareable? |
|--------|----------|--------|------------|
| shadcn components | `apps/web/src/components/ui/` | 1 component (button.tsx) | Yes |
| `components.json` | `apps/web/components.json` | Points to `@beep/web/*` aliases | Needs new aliases |
| Global CSS / theme tokens | `apps/web/src/app/globals.css` | OKLch color system, dark mode, sidebar theme, chart colors | Yes (tokens only) |
| `cn()` utility | `apps/web/src/lib/utils.ts` | Standard clsx + tailwind-merge | Yes |
| PostCSS config | `apps/web/postcss.config.mjs` | Minimal `@tailwindcss/postcss` | Yes |
| Tailwind v4 | `apps/web` dependencies | CSS-first config (no tailwind.config.js) | Via shared CSS |
| Storybook | Absent | No `.storybook/` anywhere | Create from scratch |
| MUI | Not in `apps/web` deps | Exists in old `@beep/ui` only | Future integration |
| Other apps | None | Only `apps/web` exists | `@beep/ui` prepares for future apps |

### Current shadcn Configuration (`apps/web/components.json`)

```json
{
  "style": "base-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "phosphor",
  "aliases": {
    "components": "@beep/web/components",
    "utils": "@beep/web/lib/utils",
    "ui": "@beep/web/components/ui",
    "lib": "@beep/web/lib",
    "hooks": "@beep/web/hooks"
  }
}
```

### Current Theme System (`apps/web/src/app/globals.css`)

- **Color space**: OKLch (modern, accessibility-friendly)
- **Mode support**: Light + Dark (`.dark` class selector)
- **Token categories**: background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring, chart-1..5, sidebar-*
- **Radius scales**: sm through 4xl
- **CSS imports**: `tailwindcss`, `tw-animate-css`, `shadcn/tailwind.css`
- **Custom variant**: `@custom-variant dark (&:is(.dark *))`
- **Font variables**: `--font-geist-sans`, `--font-geist-mono` (app-specific, from Next.js `next/font`)

### UI Dependencies in Root Catalog

```json
{
  "@base-ui/react": "^1.2.0",
  "@phosphor-icons/react": "^2.1.10",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.5.0",
  "tailwindcss": "^4",
  "@tailwindcss/postcss": "^4",
  "tw-animate-css": "^1.4.0",
  "shadcn": "^3.8.5"
}
```

### Existing Packages Structure

```
packages/
  common/    (data, identity, messages, ontology, schema, types, utils)
  shared/    (domain, env)
```

No existing UI package. `@beep/ui` at `packages/ui/ui` would be the first UI-layer package.

---

## 2. shadcn Monorepo Patterns

### Official Pattern (shadcn docs)

The official monorepo pattern uses a **source-distribution model**:
- Components are `.tsx` source files, NOT built artifacts
- The consuming app's bundler (Turbopack) handles compilation
- Each workspace has its own `components.json` but they share style/icon/color settings
- App `components.json` aliases point to the shared package

### shadcn CLI 3.0 (August 2025)

- Namespaced registries: `@registry/name` format
- 3x faster dependency resolution with file deduplication
- Better monorepo support out of the box
- Private registry support with full auth
- CLI understands workspace structure

### UI Package `components.json`

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "base-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles/globals.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "phosphor",
  "aliases": {
    "components": "@beep/ui/components",
    "utils": "@beep/ui/lib/utils",
    "ui": "@beep/ui/components/ui",
    "lib": "@beep/ui/lib",
    "hooks": "@beep/ui/hooks"
  }
}
```

### App `components.json` (Updated)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "base-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "phosphor",
  "aliases": {
    "components": "@beep/web/components",
    "utils": "@beep/ui/lib/utils",
    "ui": "@beep/ui/components/ui",
    "lib": "@beep/ui/lib",
    "hooks": "@beep/ui/hooks"
  }
}
```

Key difference: `utils`, `ui`, `lib`, and `hooks` point to `@beep/ui/*` while app-specific `components` stays at `@beep/web/components`.

---

## 3. Tailwind v4 Monorepo Configuration

### CSS-First Configuration

Tailwind v4 eliminated `tailwind.config.js`. All configuration is CSS:
- `@theme inline { ... }` blocks define theme tokens
- `@custom-variant` defines custom variants
- `@source` directives control content scanning

### Content Scanning Problem

Tailwind auto-detects classes only in the current project directory. Shared package classes get missed.

**Solution**: `@source` directive in app CSS:

```css
/* apps/web/src/app/globals.css */
@import "tailwindcss";
@source "../../../../packages/ui/ui/src";
```

Or use `source()` on the import to set the base scanning directory:

```css
@import "tailwindcss" source("../../../../");
```

### Shared Token Architecture

**Layer 1**: CSS custom properties (authoritative source of truth)
```css
/* packages/ui/ui/src/styles/globals.css */
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --primary: oklch(0.21 0.006 285.885);
  /* ... */
}
.dark { /* dark overrides */ }
```

**Layer 2**: Tailwind theme mapping
```css
@theme inline {
  --color-background: var(--background);
  --color-primary: var(--primary);
  /* ... */
}
```

**Layer 3**: App imports shared styles
```css
/* apps/web/src/app/globals.css */
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "@beep/ui/styles/globals.css";
/* App-specific overrides below */
```

---

## 4. Storybook 10 in Shared Package

### Framework Choice: `@storybook/react-vite`

- `@storybook/nextjs` is for Next.js apps needing next/image, next/link, routing
- Shared UI components are framework-agnostic React — Vite is the natural fit
- Faster HMR, no Next.js overhead

### Centralized in UI Package

Community consensus: **single Storybook in shared UI package**, with optional per-app Storybooks for app-specific components.

```ts
// packages/ui/ui/.storybook/main.ts
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-themes",
  ],
};
export default config;
```

```ts
// packages/ui/ui/.storybook/preview.ts
import "../src/styles/globals.css";

const preview = {
  parameters: {
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#ffffff" },
        { name: "dark", value: "#141414" },
      ],
    },
  },
};
export default preview;
```

### Turborepo Task Integration

```json
{
  "tasks": {
    "storybook": { "persistent": true, "cache": false },
    "build-storybook": {
      "dependsOn": ["^build"],
      "outputs": ["storybook-static/**"]
    }
  }
}
```

---

## 5. Package Distribution Strategy

### Just-in-Time (Source) for shadcn Components

From Turborepo's internal packages docs:
- shadcn components are source `.tsx` files you own and modify
- App's bundler (Turbopack) handles compilation
- No pre-compilation step needed
- This is the official shadcn monorepo pattern

### Package Exports Configuration

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

### Peer Dependencies

```json
{
  "peerDependencies": {
    "react": "^19",
    "react-dom": "^19"
  }
}
```

### Next.js Integration

Apps must add `@beep/ui` to `transpilePackages`:

```ts
// apps/web/next.config.ts
const nextConfig: NextConfig = {
  transpilePackages: ["@beep/schema", "@beep/ui"],
};
```

---

## 6. What Moves vs What Stays

### Moves to `@beep/ui`

| Asset | From | To |
|-------|------|----|
| Button component | `apps/web/src/components/ui/button.tsx` | `packages/ui/ui/src/components/ui/button.tsx` |
| `cn()` utility | `apps/web/src/lib/utils.ts` | `packages/ui/ui/src/lib/utils.ts` |
| Theme tokens (CSS vars) | `apps/web/src/app/globals.css` | `packages/ui/ui/src/styles/globals.css` |
| `@theme inline` block | `apps/web/src/app/globals.css` | `packages/ui/ui/src/styles/globals.css` |
| shadcn config (shared) | `apps/web/components.json` | `packages/ui/ui/components.json` |

### Stays in `apps/web`

| Asset | Reason |
|-------|--------|
| Font declarations (`next/font/google`) | App-specific, Next.js feature |
| Font CSS variables (`--font-geist-*`) | Tied to font declarations |
| `layout.tsx` | App-specific layout |
| `postcss.config.mjs` | Each app needs its own PostCSS config |
| `components.json` (updated) | App keeps its own for local component generation preferences |
| `@source` directive | App-level Tailwind content scanning |
| Web Vitals, Analytics | App-specific telemetry |

### App CSS After Extraction

```css
/* apps/web/src/app/globals.css (simplified) */
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "@beep/ui/styles/globals.css";
@source "../../../../packages/ui/ui/src";

/* App-specific: fonts (injected by layout.tsx via next/font) */
```

---

## 7. MUI Integration (Future)

MUI is NOT in the current `apps/web` dependencies. The old `@beep/ui` had it, but the new web app uses `@base-ui/react` (headless primitives) instead.

### If MUI Is Reintroduced

- MUI v6+ supports CSS theme variables natively (`cssVariables: true` in `createTheme`)
- CSS `@layer` ordering needed: `@layer theme, mui, utilities;`
- MUI styles can have higher specificity than Tailwind utilities (known issue #44700)
- Bridge: `createTheme()` reads the same CSS custom properties as Tailwind

### Current Recommendation

Do NOT include MUI in the initial `@beep/ui` package. The current stack (base-ui + shadcn + Tailwind) is cleaner and avoids the specificity conflicts. If MUI is needed later, add a `packages/ui/mui-theme` package or extend `@beep/ui` with an optional MUI theme export.
