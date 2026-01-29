# Phase 3 Handoff: Planning

**From**: Phase 2 (Design)
**To**: Phase 3 (Planning)
**Date**: 2026-01-29

---

## Phase 2 Summary

Design phase completed with 3 outputs documenting architecture, addon selection, and theme integration.

### Deliverables

| Output | Status | Lines |
|--------|--------|-------|
| `outputs/architecture-design.md` | ✅ Complete | ~220 |
| `outputs/addon-selection.md` | ✅ Complete | ~215 |
| `outputs/theme-integration-plan.md` | ✅ Complete | ~180 |

---

## Critical Design Decisions

### 1. Storybook Location

**Decision**: `tooling/storybook/` (new workspace)

**Rationale**: Aligns with existing `tooling/*` convention, separates build tooling from library source.

### 2. Story Co-location

**Decision**: `.stories.tsx` files next to components in `packages/ui/ui/src/`

**Pattern**:
```
src/components/button.tsx
src/components/button.stories.tsx  ← Co-located
```

### 3. Theme Decorator Stack

**CRITICAL**: Use `withThemeByDataAttribute`, NOT `withThemeByClassName`

```typescript
// CORRECT - matches codebase
decorators: [
  withThemeByDataAttribute({
    themes: { light: "light", dark: "dark" },
    attributeName: "data-color-scheme",  // Must match theme-config.ts
  }),
  withThemeFromJSXProvider({
    themes: { light: lightTheme, dark: darkTheme },
    Provider: StorybookThemeProvider,
  }),
]
```

### 4. Addon Set

**Required** (5):
- `@storybook/addon-essentials` (^8.6.0)
- `@storybook/addon-themes` (included)
- `@storybook/addon-a11y` (^8.6.0)
- `@storybook/addon-controls` (included)
- `@storybook/addon-viewport` (included)

**Recommended** (2):
- `storybook-addon-pseudo-states` (^4.0.2)
- `@storybook/addon-interactions` (^8.6.0)

### 5. @beep/ui-editor Status

**Status**: Empty stub - 0 components
**Action**: Phase 4c (Editor Stories) is minimal scope
**Lexical Location**: `apps/todox/src/app/lexical/` (not extracted)

---

## Files to Create in Phase 4

### Foundation (4a)

| File | Purpose |
|------|---------|
| `tooling/storybook/package.json` | Dependencies |
| `tooling/storybook/tsconfig.json` | TypeScript config |
| `tooling/storybook/.storybook/main.ts` | Storybook config |
| `tooling/storybook/.storybook/preview.tsx` | Decorators |
| `turbo.json` (modify) | Add storybook tasks |

### Priority Stories (4b)

Tier 1 components (create first):
1. `button.stories.tsx`
2. `input.stories.tsx`
3. `select.stories.tsx`
4. `dialog.stories.tsx`
5. `card.stories.tsx`
6. `badge.stories.tsx`
7. `tabs.stories.tsx`
8. `dropdown-menu.stories.tsx`

---

## Configuration Snippets

### main.ts (key sections)

```typescript
const config: StorybookConfig = {
  stories: ["../../../packages/ui/ui/src/**/*.stories.@(ts|tsx)"],
  addons: [
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-interactions"),
    getAbsolutePath("storybook-addon-pseudo-states"),
  ],
  framework: { name: "@storybook/nextjs", options: {} },
  viteFinal: async (config) => {
    config.css = {
      postcss: join(__dirname, "../../../packages/ui/ui/postcss.config.mjs"),
    };
    return config;
  },
};
```

### preview.tsx (key sections)

```typescript
import "@beep/ui/styles/globals.css";

const emotionCache = createCache({ key: "mui", prepend: true });

export const decorators = [
  withThemeByDataAttribute({
    themes: { light: "light", dark: "dark" },
    defaultTheme: "dark",
    attributeName: "data-color-scheme",
  }),
  withThemeFromJSXProvider({
    themes: { light: lightTheme, dark: darkTheme },
    defaultTheme: "dark",
    Provider: StorybookThemeProvider,
  }),
];
```

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Wrong theme selector | Use `data-color-scheme`, not `class` |
| PostCSS not processing | Explicit passthrough in viteFinal |
| Style insertion order | Emotion cache with `prepend: true` |
| React 19 issues | Storybook 8.6+ has full support |

---

## Phase 3 Objectives

1. Create detailed implementation plan with ordered tasks
2. Generate directory structure diagram
3. Create rubrics for implementation quality
4. Define verification commands for each task

### Expected Outputs

- `outputs/implementation-plan.md`
- `outputs/directory-structure.md`
- Updated `RUBRICS.md`

---

## Context Budget: ~2,800 tokens
