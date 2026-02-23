# @beep/ui Agent Guide

## Purpose & Fit

Shared UI component library providing shadcn components, design tokens (OKLch CSS custom properties), Tailwind v4 theme configuration, and Storybook for the monorepo.

**Distribution**: JIT source distribution — components are `.tsx` files compiled by the consuming app's bundler (Turbopack). No build step.

## Surface Map

| Module | Key exports | Notes |
| --- | --- | --- |
| `src/index.ts` | `VERSION`, `Button`, `buttonVariants`, `cn` | Package entry point |
| `src/components/ui/button.tsx` | `Button`, `buttonVariants` | Base UI button with CVA variants |
| `src/lib/utils.ts` | `cn` | clsx + tailwind-merge utility |
| `src/styles/globals.css` | CSS custom properties | OKLch theme tokens, dark mode, Tailwind @theme |

## Usage Snapshots

```tsx
// Import components
import { Button } from "@beep/ui";
import { cn } from "@beep/ui/lib/utils";

// Import theme in app CSS
// @import "@beep/ui/styles/globals.css";
```

## Authoring Guardrails

- Components are React `.tsx` files using `"use client"` directive when needed
- Variants use `class-variance-authority` (CVA)
- All className merging uses the shared `cn()` utility
- shadcn CLI generates into `src/components/ui/` via `components.json`
- Every export needs `/** @since 0.0.0 */` JSDoc

## Quick Recipes

```bash
# Add a new shadcn component
cd packages/ui/ui && bunx shadcn add <component>

# Run Storybook
cd packages/ui/ui && bun run storybook
```

## Verifications

- `bunx turbo run check --filter=@beep/ui`
- `cd packages/ui/ui && bun run storybook`
- `cd packages/ui/ui && bun run build-storybook`

## Contributor Checklist

- [ ] All new exports have `/** @since 0.0.0 */` JSDoc annotations
- [ ] New components have a `.stories.tsx` file
- [ ] `bun run check` passes
- [ ] Storybook renders without errors
