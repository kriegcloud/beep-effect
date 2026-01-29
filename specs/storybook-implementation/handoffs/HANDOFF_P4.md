# Phase 4 Handoff: Implementation

**From**: Phase 3 (Planning)
**To**: Phase 4 (Implementation)
**Date**: 2026-01-29

---

## Critical Constraints (MEMORIZE THESE)

### Theme Decorator - AUTOMATIC FAILURE if wrong

```typescript
// CORRECT - Use this
withThemeByDataAttribute({
  themes: { light: "light", dark: "dark" },
  attributeName: "data-color-scheme",  // MUST be data-color-scheme
})

// WRONG - Do NOT use (causes AUTOMATIC FAILURE)
withThemeByClassName({
  themes: { light: "", dark: "dark" },
})
```

### Location

- Storybook: `tooling/storybook/` (NOT `packages/ui/storybook/`)
- Stories: Co-located with components (e.g., `button.stories.tsx` next to `button.tsx`)

### Scope

- **@beep/ui-editor**: Empty stub - Phase 4c is documentation only
- Focus 100% effort on @beep/ui components

---

## Task List by Sub-Phase

### P4a: Foundation (7 tasks, do in order)

| Task | Description | Files | Complexity |
|------|-------------|-------|------------|
| 4a.1 | Create workspace package.json | `tooling/storybook/package.json` | S |
| 4a.2 | Create tsconfig.json | `tooling/storybook/tsconfig.json` | S |
| 4a.3 | Create .storybook/main.ts | `tooling/storybook/.storybook/main.ts` | M |
| 4a.4 | Create ThemeDecorator.tsx | `tooling/storybook/.storybook/decorators/ThemeDecorator.tsx` | M |
| 4a.5 | Create preview.tsx | `tooling/storybook/.storybook/preview.tsx` | M |
| 4a.6 | Update turbo.json | `turbo.json` | S |
| 4a.7 | Create AGENTS.md | `tooling/storybook/AGENTS.md` | S |

**Verification**: `cd tooling/storybook && bun run dev` starts on port 6006

### P4b: Priority UI Stories (7 tasks)

| Task | Stories | Files |
|------|---------|-------|
| 4b.1 | Button (reference pattern) | `components/button.stories.tsx` |
| 4b.2 | Input, Textarea, Label | 3 files |
| 4b.3 | Checkbox, Radio, Switch, Select | 4 files |
| 4b.4 | Dialog, Sheet, Popover, Tooltip | 4 files |
| 4b.5 | Card, Badge, Table, Avatar | 4 files |
| 4b.6 | Tabs, Accordion, Sidebar | 3 files |
| 4b.7 | DropdownMenu, ContextMenu, Command | 3 files |

**Verification**: Theme toggle switches all stories between light/dark

### P4c: Editor Stories (BLOCKED)

| Task | Description | Files |
|------|-------------|-------|
| 4c.1 | Document blocked status | `packages/ui/editor/STORYBOOK_PENDING.md` |

**Status**: @beep/ui-editor has 0 components. Document blocker only.

### P4d: Theme Integration (7 tasks)

| Task | Description | Files |
|------|-------------|-------|
| 4d.1 | CSS variable bridge test | `__tests__/theme-bridge.stories.tsx` |
| 4d.2 | Color palette docs | `__tests__/color-palette.stories.tsx` |
| 4d.3 | Typography scale | `__tests__/typography.stories.tsx` |
| 4d.4 | Spacing tokens | `__tests__/spacing-tokens.stories.tsx` |
| 4d.5 | Color preset switcher | Modify decorators (optional) |
| 4d.6 | Viewport presets | Modify preview.tsx |
| 4d.7 | Final integration test | Verification only |

**Verification**: `bun run storybook:build` succeeds

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `packages/ui/core/src/theme/theme-config.ts` | `colorSchemeSelector: "data-color-scheme"` |
| `packages/ui/core/src/theme/create-theme.ts` | `createTheme({ settingsState })` |
| `packages/ui/ui/src/styles/globals.css` | CSS variable bridge (lines 353-469) |
| `packages/ui/ui/postcss.config.mjs` | PostCSS config for viteFinal |

---

## Decorator Stack Order

```
┌─────────────────────────────────────────────────────────┐
│ withThemeByDataAttribute (OUTER)                        │
│   ↳ Sets data-color-scheme="light|dark" on <html>       │
│   ┌─────────────────────────────────────────────────┐   │
│   │ withThemeFromJSXProvider (INNER)                │   │
│   │   ↳ Provides MUI ThemeProvider context          │   │
│   │   ┌───────────────────────────────────────────┐ │   │
│   │   │ Story Component                           │ │   │
│   │   └───────────────────────────────────────────┘ │   │
│   └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Patterns to Avoid

1. **NEVER use `withThemeByClassName`**
2. **NEVER wrap with `SettingsProvider`** (uses localStorage)
3. **NEVER use Webpack builder** (use Vite with PostCSS)
4. **NEVER create editor stories** (package is empty)

---

## Success Criteria

- [ ] `tooling/storybook/` workspace exists
- [ ] `bun run storybook:dev` starts successfully
- [ ] Theme toggle uses `data-color-scheme` attribute (verify in DevTools)
- [ ] At least 8 priority stories render correctly
- [ ] Build succeeds: `bun run storybook:build`
- [ ] RUBRICS.md score ≥75 points
