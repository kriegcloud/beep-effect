You are implementing Phase 4 of the `ui-theme-consolidation` spec.

### Context

Phase 1 completed: CSS variables merged. Phase 2 completed: Missing MUI sub-components added. Phase 3 completed: `text.icon` and `text.tertiary` type augmentations added. Phase 4 focuses on cleaning up todox by removing duplicate configurations.

**Critical Rule:** This is a CLEANUP phase. All todox theme features have been merged to `@beep/ui-core`. Now remove duplicates.

### Your Mission

1. Remove `apps/todox/src/theme/components/` directory
2. Simplify `apps/todox/src/theme/theme.tsx` to re-export from @beep/ui-core
3. Update `apps/todox/src/app/globals.css` to import from @beep/ui
4. Remove/empty `themeOverrides` in global-providers.tsx
5. Fix any broken imports

### Steps

#### Step 1: List Component Files

```bash
ls apps/todox/src/theme/components/
```

#### Step 2: Remove Components Directory

```bash
rm -rf apps/todox/src/theme/components/
```

#### Step 3: Read and Simplify theme.tsx

Read `apps/todox/src/theme/theme.tsx` and simplify to:

```typescript
export { createTheme, baseTheme, themeConfig } from "@beep/ui-core/theme";
export { colors } from "./colors";
export { shadows } from "./shadows";
export { typography } from "./typography";
```

#### Step 4: Update globals.css

Read `apps/todox/src/app/globals.css`. If it has duplicate CSS variables that were merged in P1, update to import from @beep/ui:

```css
@import "@beep/ui/styles/globals.css";

/* Only todox-specific additions below */
```

#### Step 5: Update global-providers.tsx

Read `apps/todox/src/global-providers.tsx` and remove `themeOverrides` prop from ThemeProvider (or set to empty object).

#### Step 6: Search for Broken Imports

```bash
grep -r "theme/components" apps/todox/src/ --include="*.ts" --include="*.tsx"
```

Fix any remaining imports that reference the removed directory.

### Verification Commands

```bash
bun run check --filter @beep/todox
bun run build --filter @beep/todox
```

### Success Criteria

- [ ] `apps/todox/src/theme/components/` removed
- [ ] `theme.tsx` simplified to re-exports
- [ ] `globals.css` imports from @beep/ui (or is minimal)
- [ ] `themeOverrides` removed/empty
- [ ] No broken imports
- [ ] Verification commands pass

### On Completion

1. Update `specs/ui-theme-consolidation/REFLECTION_LOG.md` with learnings
2. Mark spec as COMPLETED
3. Create `specs/ui-theme-consolidation/outputs/COMPLETION_SUMMARY.md`

### Reference Files

- Full handoff: `specs/ui-theme-consolidation/handoffs/HANDOFF_P4.md`
- Master workflow: `specs/ui-theme-consolidation/MASTER_ORCHESTRATION.md`
- Reflection log: `specs/ui-theme-consolidation/REFLECTION_LOG.md`
