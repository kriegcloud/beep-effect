# FlexLayout Tailwind Styles Spec

> Replace SCSS-based FlexLayout styles with Tailwind CSS-compatible styles in apps/todox.

---

## Overview

The custom `flexlayout-react` implementation in `packages/ui/ui/src/flexlayout-react` requires styling. Currently, the demo at `apps/todox/src/app/demo` imports SCSS styles from `@beep/todox/style/combined.scss`, which conflicts with the Tailwind/shadcn configuration in `apps/todox/src/app/globals.css`.

**Goal**: Create a Tailwind-compatible CSS file that provides FlexLayout styles while integrating with the existing theme system.

---

## Problem Statement

1. **Style conflicts**: The FlexLayout SCSS resets and styles conflict with globals.css (Tailwind + shadcn base)
2. **Theme mismatch**: FlexLayout uses its own CSS variable system (`--color-1` to `--color-6`) separate from Tailwind's oklch variables
3. **Dark mode**: FlexLayout uses theme class wrappers (`.flexlayout__theme_dark`) vs Tailwind's `.dark` class

---

## Constraints

- **Only modify files in `apps/todox`** - the flexlayout-react package is being improved by other agents
- **Preserve existing class names** - the flexlayout-react components use specific CSS class names from `Types.ts`
- **Use Tailwind utilities where possible** - minimize custom CSS
- **Support dark/light theme switching** - integrate with next-themes

---

## Success Criteria

- [ ] Demo page at `/demo` renders correctly with both globals.css and flexlayout styles
- [ ] Dark/light theme toggle works correctly
- [ ] No SCSS imports required - pure CSS/Tailwind solution
- [ ] `apps/todox/src/style` directory can be removed after migration
- [ ] Layout panels, tabs, splitters, and borders all render with proper styling

---

## Technical Approach

### Phase 1: CSS Variable Mapping

Map FlexLayout CSS variables to Tailwind theme variables:

```css
.flexlayout__layout {
  --color-text: var(--foreground);
  --color-background: var(--background);
  --color-1: var(--muted);
  /* etc. */
}
```

### Phase 2: Create Flexlayout CSS Layer

Add a dedicated CSS layer for flexlayout styles that integrates with Tailwind:

```css
@layer flexlayout {
  .flexlayout__layout { /* base styles */ }
  .flexlayout__tabset { /* tabset styles */ }
  /* etc. */
}
```

### Phase 3: Theme Integration

Map to Tailwind's dark mode instead of separate theme classes:

```css
.dark .flexlayout__layout {
  --color-text: var(--foreground);
  /* dark mode variable overrides */
}
```

---

## Key Files

| File | Purpose |
|------|---------|
| `packages/ui/ui/src/flexlayout-react/Types.ts` | CSS class name constants |
| `tmp/FlexLayout/style/_base.scss` | Original base styles |
| `tmp/FlexLayout/style/_themes.scss` | Theme variable definitions |
| `apps/todox/src/style/combined.css` | Current compiled CSS (to be replaced) |
| `apps/todox/src/app/globals.css` | Tailwind + shadcn config |
| `apps/todox/src/app/demo/_lib/App.tsx` | Demo page implementation |

---

## Phase Outputs

- `outputs/flexlayout.css` - The Tailwind-compatible flexlayout stylesheet
- `outputs/migration-notes.md` - Notes on what was changed and why

---

## References

- [FlexLayout NPM](https://www.npmjs.com/package/flexlayout-react)
- [Tailwind CSS Layers](https://tailwindcss.com/docs/adding-custom-styles#using-css-layers)
