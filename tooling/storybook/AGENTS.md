# @beep/storybook

Storybook workspace for @beep/ui component documentation.

## Quick Commands
- `bun run dev` - Start Storybook dev server (port 6006)
- `bun run build` - Build static Storybook

## Theme Integration
Uses `withThemeByDataAttribute` with `data-color-scheme` attribute.
Theme toggle in toolbar switches between light/dark modes.

## Adding Stories
Stories are co-located with components in `packages/ui/ui/src/`.
Pattern: `component.tsx` → `component.stories.tsx`

## Critical Constraint
NEVER use `withThemeByClassName` - this codebase uses `data-color-scheme` attribute selector.
