# Shared UI Package: Design

## 1. Final Directory Structure

```
packages/ui/ui/
  package.json
  tsconfig.json
  components.json                 # shadcn config (shared)
  postcss.config.mjs              # shared PostCSS (@tailwindcss/postcss)
  vitest.config.ts
  docgen.json
  LICENSE
  README.md
  AGENTS.md
  CLAUDE.md -> AGENTS.md          # symlink
  ai-context.md
  .storybook/
    main.ts                       # Storybook 10 config (@storybook/react-vite)
    preview.ts                    # Global decorators, theme CSS import
  src/
    index.ts                      # Re-exports: Button, buttonVariants, cn
    styles/
      globals.css                 # Authoritative theme tokens + @theme inline
    components/
      ui/
        button.tsx                # Moved from apps/web
        button.stories.tsx        # Storybook story
    lib/
      utils.ts                    # cn() utility
    hooks/                        # Empty initially
      .gitkeep
  test/
    .gitkeep
  dtslint/
    .gitkeep
  docs/
    index.md
```

## 2. package.json

```json
{
  "name": "@beep/ui",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "license": "MIT",
  "description": "Shared UI component library with shadcn, Tailwind v4 theme, and Storybook",
  "homepage": "https://github.com/kriegcloud/beep-effect/tree/main/packages/ui/ui",
  "repository": {
    "type": "git",
    "url": "git@github.com:kriegcloud/beep-effect.git",
    "directory": "packages/ui/ui"
  },
  "sideEffects": ["**/*.css"],
  "exports": {
    "./package.json": "./package.json",
    ".": "./src/index.ts",
    "./styles/globals.css": "./src/styles/globals.css",
    "./postcss.config": "./postcss.config.mjs",
    "./components/*": "./src/components/*.tsx",
    "./components/ui/*": "./src/components/ui/*.tsx",
    "./hooks/*": "./src/hooks/*.ts",
    "./lib/*": "./src/lib/*.ts"
  },
  "files": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.css"
  ],
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "check": "tsc -b tsconfig.json",
    "test": "vitest",
    "coverage": "vitest --coverage",
    "docgen": "bunx @effect/docgen"
  },
  "dependencies": {
    "@base-ui/react": "catalog:",
    "@phosphor-icons/react": "catalog:",
    "class-variance-authority": "catalog:",
    "clsx": "catalog:",
    "tailwind-merge": "catalog:"
  },
  "devDependencies": {
    "@storybook/addon-a11y": "catalog:",
    "@storybook/addon-docs": "catalog:",
    "@storybook/addon-themes": "catalog:",
    "@storybook/react-vite": "catalog:",
    "@tailwindcss/postcss": "catalog:",
    "@types/react": "catalog:",
    "@types/react-dom": "catalog:",
    "shadcn": "catalog:",
    "storybook": "catalog:",
    "tailwindcss": "catalog:",
    "tw-animate-css": "catalog:"
  },
  "peerDependencies": {
    "react": "^19",
    "react-dom": "^19"
  }
}
```

Key differences from standard Effect packages:
- No `build`/`babel` scripts (JIT source distribution)
- No `effect` dependency (UI package, not Effect package)
- `sideEffects: ["**/*.css"]` for CSS files
- `peerDependencies` for React
- Storybook scripts added
- Exports include CSS, components, hooks, lib paths

## 3. components.json

### UI Package (`packages/ui/ui/components.json`)

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

### Updated App (`apps/web/components.json`)

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
  "rtl": false,
  "aliases": {
    "components": "@beep/web/components",
    "utils": "@beep/ui/lib/utils",
    "ui": "@beep/ui/components/ui",
    "lib": "@beep/ui/lib",
    "hooks": "@beep/ui/hooks"
  },
  "registries": {}
}
```

## 4. Theme Token Extraction Plan

### Moves to `@beep/ui` (`packages/ui/ui/src/styles/globals.css`)

Everything except framework imports and font variables:

- `@custom-variant dark (&:is(.dark *));`
- `@theme inline { ... }` block (minus `--font-sans`/`--font-mono` which are app-specific)
- `:root { ... }` block (all CSS custom properties)
- `.dark { ... }` block (dark mode overrides)
- `@layer base { ... }` block (border/outline/body defaults)

### Stays in `apps/web` (`apps/web/src/app/globals.css`)

- `@import "tailwindcss"` (each app imports Tailwind)
- `@import "tw-animate-css"` (animation utilities)
- `@import "shadcn/tailwind.css"` (shadcn base styles)
- `@import "@beep/ui/styles/globals.css"` (NEW: imports shared tokens)
- `@source "../../../../packages/ui/ui/src"` (NEW: Tailwind content scanning)
- Font variables in `@theme inline` (app-specific `--font-sans`, `--font-mono`)

### Resulting `apps/web/src/app/globals.css`

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "@beep/ui/styles/globals.css";

@source "../../../../packages/ui/ui/src";

@theme inline {
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

### Resulting `packages/ui/ui/src/styles/globals.css`

```css
@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-sidebar-ring: var(--sidebar-ring);
  /* ... all color and radius mappings ... */
  --radius-4xl: calc(var(--radius) + 16px);
}

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  /* ... all light mode tokens ... */
}

.dark {
  --background: oklch(0.141 0.005 285.823);
  /* ... all dark mode tokens ... */
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

## 5. Storybook Configuration

### `.storybook/main.ts`

```ts
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

### `.storybook/preview.ts`

```ts
import type { Preview } from "@storybook/react-vite";
import "../src/styles/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
```

### Button Story (`src/components/ui/button.stories.tsx`)

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button";

const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline", "secondary", "ghost", "destructive", "link"],
    },
    size: {
      control: "select",
      options: ["default", "xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Button" },
};

export const Outline: Story = {
  args: { children: "Outline", variant: "outline" },
};

export const Secondary: Story = {
  args: { children: "Secondary", variant: "secondary" },
};

export const Ghost: Story = {
  args: { children: "Ghost", variant: "ghost" },
};

export const Destructive: Story = {
  args: { children: "Destructive", variant: "destructive" },
};

export const Link: Story = {
  args: { children: "Link", variant: "link" },
};

export const Small: Story = {
  args: { children: "Small", size: "sm" },
};

export const Large: Story = {
  args: { children: "Large", size: "lg" },
};
```

## 6. turbo.json Task Additions

```json
{
  "storybook": {
    "persistent": true,
    "cache": false
  },
  "build-storybook": {
    "dependsOn": ["^build"],
    "outputs": ["storybook-static/**"]
  }
}
```

## 7. Root Catalog Additions

```json
{
  "@storybook/react-vite": "^10.2.10",
  "@storybook/addon-docs": "^10.2.10",
  "@storybook/addon-a11y": "^10.2.10",
  "@storybook/addon-themes": "^10.2.10",
  "storybook": "^10.2.10"
}
```

## 8. apps/web Migration Checklist

- [ ] Add `"@beep/ui": "workspace:^"` to `apps/web/package.json` dependencies
- [ ] Add `"@beep/ui"` to `transpilePackages` in `apps/web/next.config.ts`
- [ ] Replace `apps/web/src/app/globals.css` with simplified version importing `@beep/ui/styles/globals.css`
- [ ] Update `apps/web/components.json` aliases to point `ui`, `utils`, `lib`, `hooks` to `@beep/ui/*`
- [ ] Update `apps/web/src/components/ui/button.tsx` import from `@beep/web/lib/utils` to `@beep/ui/lib/utils` (or delete file and re-export from `@beep/ui`)
- [ ] Delete `apps/web/src/lib/utils.ts` (moved to `@beep/ui`)
- [ ] Delete `apps/web/src/components/ui/button.tsx` (moved to `@beep/ui`)
- [ ] Update any app imports of `Button` to use `@beep/ui` or `@beep/ui/components/ui/button`

## 9. tsconfig Updates

### `packages/ui/ui/tsconfig.json`

```json
{
  "$schema": "http://json.schemastore.org/tsconfig",
  "extends": "../../../tsconfig.base.json",
  "include": ["src"],
  "compilerOptions": {
    "types": ["node"],
    "outDir": "dist",
    "rootDir": "src",
    "jsx": "react-jsx"
  }
}
```

### Root `tsconfig.packages.json` addition

```json
{ "path": "packages/ui/ui" }
```

### Root `tsconfig.json` path additions

```json
"@beep/ui": ["./packages/ui/ui/src/index.ts"],
"@beep/ui/*": ["./packages/ui/ui/src/*.ts"]
```

### `apps/web/tsconfig.json` reference addition

```json
{ "path": "../../packages/ui/ui/tsconfig.json" }
```

## 10. Test Strategy

- **No unit tests initially** — button is a pure React component with no logic beyond className composition
- **Storybook visual testing** — button.stories.tsx serves as the visual test
- **Type checking** — `tsc -b` ensures the package compiles
- **Lint** — Biome checks formatting/lint rules
- **Integration test** — `apps/web` building successfully confirms the shared package works end-to-end
