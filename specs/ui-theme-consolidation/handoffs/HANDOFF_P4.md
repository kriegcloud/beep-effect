# Phase 4 Handoff - Todox Cleanup

> Context document for Phase 4 execution.

---

## Success Criteria (CRITICAL - READ FIRST)

- [ ] `apps/todox/src/theme/components/` directory removed
- [ ] `apps/todox/src/theme/theme.tsx` simplified (re-export from @beep/ui-core)
- [ ] `apps/todox/src/app/globals.css` imports from @beep/ui (or minimal local additions)
- [ ] `themeOverrides` removed from global-providers.tsx (or empty)
- [ ] No broken imports in todox
- [ ] `bun run check --filter @beep/todox` passes
- [ ] `bun run build --filter @beep/todox` passes
- [ ] App renders correctly (visual verification)

## Key Constraint (BLOCKING)

This is a **cleanup phase**. All features from todox theme have been merged to `@beep/ui-core` in P1-P3. Now remove duplicates and update imports.

---

## Working Context (Current Task)

### Mission

Remove duplicate theme configurations from todox and update imports to use shared `@beep/ui-core` and `@beep/ui` packages.

### Implementation Order

1. Remove `apps/todox/src/theme/components/` directory
2. Simplify `apps/todox/src/theme/theme.tsx`
3. Update `apps/todox/src/app/globals.css` imports
4. Update `apps/todox/src/global-providers.tsx` (remove themeOverrides)
5. Search for and fix any broken imports
6. Run verification commands

### Files to Remove

| Path | Reason |
|------|--------|
| `apps/todox/src/theme/components/*.ts` | All component styles merged to @beep/ui-core |

### Files to Modify

| Path | Change |
|------|--------|
| `apps/todox/src/theme/theme.tsx` | Re-export from @beep/ui-core |
| `apps/todox/src/theme/index.ts` | Update exports |
| `apps/todox/src/app/globals.css` | Import from @beep/ui/styles |
| `apps/todox/src/global-providers.tsx` | Remove themeOverrides |

---

## Episodic Context (Previous Phases)

### Phase 1 Summary (COMPLETED ✓)

- CSS variables merged from todox to ui-ui globals.css
- Shadcn oklch colors alongside existing MUI variables
- Border radius, chart colors, resizable panels added

### Phase 2 Summary (COMPLETED ✓)

- Added missing sub-components to ui-core:
  - `MuiDialogContentText` to dialog.tsx
  - `MuiMenu` to menu.tsx
  - `MuiCardActions` to card.tsx
  - `MuiFormControlLabel.root` gap styling to form.tsx
- Skipped conflicting styles (ui-core wins)

### Phase 3 Summary (COMPLETED ✓)

- Added `text.icon` and `text.tertiary` to TypeTextExtend in palette.ts
- Added actual values using `rgbaFromChannel` pattern
- Skipped iOS colors, typography, shadows (ui-core wins)
- All verification passed

---

## Semantic Context (Constants)

### Todox Theme Structure (Files to Remove/Modify)

```
apps/todox/src/theme/
├── components/           # REMOVE - all merged to @beep/ui-core
│   ├── alert.ts
│   ├── autocomplete.ts
│   ├── avatar.ts
│   ├── button.ts
│   ├── card.ts
│   ├── chip.ts
│   ├── data-grid.ts
│   ├── date-picker.ts
│   ├── dialog.ts
│   ├── layout.ts
│   ├── link.ts
│   ├── list.ts
│   ├── menu.ts
│   ├── progress.ts
│   ├── select.ts
│   ├── svg-icon.ts
│   ├── table.ts
│   ├── text-field.ts
│   └── tree-view.ts
├── colors.ts            # KEEP - todox-specific color definitions for now
├── shadows.ts           # KEEP - may be referenced locally
├── typography.ts        # KEEP - may be referenced locally
├── types.ts             # KEEP - local type definitions
├── theme.tsx            # SIMPLIFY - re-export from @beep/ui-core
└── index.ts             # UPDATE - remove component exports
```

### Expected Simplified theme.tsx

```typescript
// apps/todox/src/theme/theme.tsx
export { createTheme, baseTheme, themeConfig } from "@beep/ui-core/theme";

// Re-export todox-specific augmentations if needed
export { colors } from "./colors";
export { shadows } from "./shadows";
export { typography } from "./typography";
```

### Gotchas

1. **Import cycles**: Removing files may expose hidden import dependencies
2. **TypeScript paths**: todox may have local path aliases to resolve
3. **Runtime vs build**: Some imports may only fail at runtime
4. **Visual regression**: Changes may affect rendering even if build passes

---

## Procedural Context (Links Only)

| Document | Purpose |
|----------|---------|
| `specs/ui-theme-consolidation/MASTER_ORCHESTRATION.md` | Phase 4 scope details |
| `specs/ui-theme-consolidation/REFLECTION_LOG.md` | Previous phase learnings |
| `packages/ui/core/src/theme/create-theme.ts` | Target createTheme to re-export |
| `packages/ui/ui/src/styles/globals.css` | CSS variables source (from P1) |

---

## Verification Commands (NEXT STEPS)

```bash
# After modifications
bun run check --filter @beep/todox
bun run build --filter @beep/todox

# Full monorepo check (ensure no regressions)
bun run check

# Visual verification (manual)
bun run dev --filter @beep/todox
```

## On Completion

1. Update `REFLECTION_LOG.md` with Phase 4 learnings
2. Mark spec as COMPLETED in `specs/README.md`
3. Create summary document `outputs/COMPLETION_SUMMARY.md`

---

## Context Budget Verification

| Memory Type | Estimated Tokens | Budget | Status |
|-------------|------------------|--------|--------|
| Working | ~1,000 | ≤2,000 | ✓ |
| Episodic | ~500 | ≤1,000 | ✓ |
| Semantic | ~400 | ≤500 | ✓ |
| Procedural | ~100 (links) | Links only | ✓ |
| **Total** | **~2,000** | **≤4,000** | **✓** |
