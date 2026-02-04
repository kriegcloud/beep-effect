# UI Theme Consolidation Spec

> **STATUS: ✅ COMPLETED** (2026-02-03)

Merge `apps/todox` theme configurations into `@beep/ui` and `@beep/ui-core` with zero breaking changes.

---

## Overview

The todox application was bootstrapped with shadcn 3.8.2 and base-ui primitives. Its theme configuration diverged from the shared `@beep/ui-core` theme system. This spec consolidates both configurations so todox can consume themes from the shared packages instead of maintaining its own.

**Current State:**
- `apps/todox/src/theme/` - App-specific theme with 20 MUI component overrides
- `apps/todox/src/app/globals.css` - OKLch-based CSS variables, shadcn-centric
- `packages/ui/core/src/theme/` - Shared theme system with 45 component overrides
- `packages/ui/ui/src/styles/globals.css` - Channel-aware CSS variables, MUI-centric

**Target State:**
- Todox consumes `@beep/ui-core` theme with no local overrides
- Todox consumes `@beep/ui/styles/globals.css` with no local CSS variables
- Zero type errors from theme augmentation changes
- All existing ui-core consumers continue working unchanged

---

## Success Criteria

### Type Safety (HARD REQUIREMENT)
- [x] `bun run check` passes with no new errors
- [x] Theme augmentation types remain compatible with existing consumers
- [x] No `@ts-ignore` or `any` type casts introduced

### Configuration Consolidation
- [x] Todox-unique MUI component styles merged into `@beep/ui-core`
- [x] Todox CSS variables added to `@beep/ui/styles/globals.css`
- [x] Todox theme colors/palette merged into `@beep/ui-core`
- [x] Todox `themeOverrides` export eliminated or empty

### Zero Breaking Changes
- [x] Existing apps consuming `@beep/ui-core` unchanged
- [x] CSS variable names from ui-ui preserved (add todox vars, don't replace)
- [x] Component style API signatures unchanged

### Cleanup
- [x] `apps/todox/src/theme/` directory removed or reduced to re-exports
- [x] `apps/todox/src/app/globals.css` imports from `@beep/ui` instead of defining vars
- [x] No duplicate component definitions across packages

---

## Scope

### In Scope
- MUI component style overrides (45 in ui-core + 2 unique to todox)
- CSS custom properties (globals.css files)
- Theme configuration (palette, typography, shadows)
- Type augmentation (`extend-theme-types.ts`)
- ThemeProvider integration pattern

### Out of Scope
- Shadcn component source code (already migrated to base-ui)
- React component logic/behavior
- Visual regression testing (deferred to follow-up)
- Storybook setup

---

## Phase Overview

| Phase | Focus | Key Deliverables | Status |
|-------|-------|------------------|--------|
| P1 | CSS Variables | Merge todox CSS vars into ui-ui globals.css | ✅ |
| P2 | MUI Component Styles | Merge todox component overrides into ui-core | ✅ |
| P3 | Theme Configuration | Merge palette, typography, shadows, type augmentation | ✅ |
| P4 | Todox Cleanup | Remove duplicate configs, update imports | ✅ |

---

## Key Artifacts

| File | Purpose |
|------|---------|
| `outputs/COMPLETION_SUMMARY.md` | Final summary with metrics and results |
| `outputs/INVENTORY.md` | Detailed diff of all configuration differences |
| `REFLECTION_LOG.md` | Cumulative learnings from all phases |
| `QUICK_START.md` | 5-minute guide to start Phase 1 |
| `MASTER_ORCHESTRATION.md` | Full workflow with agent prompts |
| `handoffs/HANDOFF_P[N].md` | Phase transition context |
| `handoffs/P[N]_ORCHESTRATOR_PROMPT.md` | Copy-paste prompts |

---

## Critical Constraints

### Conflict Resolution Rule
When todox and ui-core have conflicting styles for the same component:
**ui-core wins** - preserve existing styles, add only net-new from todox.

### CSS Variable Strategy
**Add both** - preserve all existing ui-ui CSS variables, append todox variables.
This prevents breaking consumers while enabling todox features.

### Type Augmentation
Todox adds `text.icon` and `text.tertiary` to TypeText. These MUST be added to
`packages/ui/core/src/theme/extend-theme-types.ts` without modifying existing augmentations.

---

## Verification Commands

```bash
# Type checking (primary gate)
bun run check --filter @beep/ui-core
bun run check --filter @beep/ui
bun run check --filter @beep/todox

# Full monorepo check
bun run check

# Build verification
bun run build --filter @beep/ui-core
bun run build --filter @beep/ui
```

---

## Verification Debugging Guide

Common errors and their fixes when verification fails:

| Error Pattern | Cause | Fix |
|---------------|-------|-----|
| `Property 'icon' does not exist on type 'TypeText'` | Missing type augmentation | Add `icon?: string` to `TypeText` in `extend-theme-types.ts` |
| `Property 'tertiary' does not exist on type 'TypeText'` | Missing type augmentation | Add `tertiary?: string` to `TypeText` in `extend-theme-types.ts` |
| `Module not found: @beep/ui-core/theme/core/components/controls` | Component not exported | Add to barrel export in `components/index.ts` |
| `CSS variable undefined` (runtime) | Missing variable in globals.css | Check layer placement and `:root` vs `.dark` selectors |
| `Type 'X' is not assignable to type 'Y'` in component override | Conflicting style definition | ui-core definition wins - remove todox version |
| Build fails but check passes | ESM/CJS mismatch | Verify `"use client"` directive placement |

### Debugging Steps

1. **Type errors**: Run `bun run check --filter @beep/ui-core` first (upstream)
2. **Import errors**: Check barrel exports in `index.ts` files
3. **CSS issues**: Verify layer order (`@layer theme, base, mui, components, utilities`)
4. **Runtime errors**: Check browser console for undefined CSS variables

---

## References

- `outputs/INVENTORY.md` - Complete configuration diff
- `RUBRICS.md` - Phase 2 component comparison decision matrix
- `packages/ui/core/CLAUDE.md` - ui-core agent guide
- `packages/ui/ui/CLAUDE.md` - ui-ui agent guide
- `apps/todox/src/global-providers.tsx` - ThemeProvider usage pattern
