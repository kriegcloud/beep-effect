# Phase 1 Handoff - CSS Variables Merge

> Context document for Phase 1 execution.

---

## Success Criteria (CRITICAL - READ FIRST)

- [ ] All todox CSS variables added to ui-ui globals.css
- [ ] Existing MUI `--mui-*` and `--palette-*` variables unchanged
- [ ] Border radius system added
- [ ] Resizable panel styles added
- [ ] `.scrollbar-none` utility added
- [ ] `bun run check --filter @beep/ui` passes
- [ ] `bun run build --filter @beep/ui` passes

## Key Constraint (BLOCKING)

**ADD, don't REPLACE.** All existing MUI variables must remain unchanged. Todox variables are appended as a secondary system.

---

## Working Context (Current Task)

### Mission

Merge CSS variables from `apps/todox/src/app/globals.css` into `packages/ui/ui/src/styles/globals.css` without breaking existing consumers.

### Implementation Order

1. Read current state of `packages/ui/ui/src/styles/globals.css`
2. Read `apps/todox/src/app/globals.css` for exact values
3. Add shadcn color variables under clear comment section
4. Add border radius system
5. Add sidebar variables (if missing)
6. Add resizable panel styles
7. Add scrollbar utility
8. Verify with `bun run check`

### Todox CSS Variables to Add

**From `apps/todox/src/app/globals.css`:**

1. **Shadcn/ui Color System** (lines ~20-80)
   - Light mode: `--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`, `--destructive`, `--destructive-foreground`, `--border`, `--input`, `--ring`
   - Chart colors: `--chart-1` through `--chart-5`
   - Dark mode variants: Same variables with dark values

2. **Border Radius System** (lines ~85-95)
   - `--radius: 0.875rem`
   - Computed: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-2xl`, `--radius-3xl`, `--radius-4xl`

3. **Sidebar Variables** (if not already in ui-ui)
   - `--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-primary-foreground`, `--sidebar-accent`, `--sidebar-accent-foreground`, `--sidebar-border`, `--sidebar-ring`

4. **Resizable Panel Styles** (lines 148-185)
   - `.group\/resize-handle` hover states
   - Panel handle positioning and visibility

5. **Utility Classes**
   - `.scrollbar-none` utility

---

## Episodic Context (Previous Phases)

### Phase 0 Summary

- Spec scaffolded with comprehensive inventory
- Explore agent produced detailed diff of all configuration differences
- 45 component styles in ui-core vs 20 in todox identified
- CSS variable naming convention differences documented

---

## Semantic Context (Constants)

### Target File Structure

```css
@layer theme, base, mui, components, utilities;
```

**Placement Strategy:**
- Add shadcn variables to `:root` in `@layer theme`
- Add utility classes to `@layer utilities`
- Add component-specific styles to `@layer components`

### Gotchas

1. **OKLch vs RGB**: Todox uses `oklch()` colors. Add them as-is - don't convert to RGB.
2. **Layer Ordering**: Respect the existing `@layer` structure. Don't create new layers.
3. **Dark Mode Selector**: Todox uses `.dark` class. Ensure this matches ui-ui's dark mode mechanism.
4. **Variable Conflicts**: If any variable name already exists in ui-ui, keep the ui-ui version. Document the conflict in REFLECTION_LOG.md.

---

## Procedural Context (Links Only)

| Document | Purpose |
|----------|---------|
| `specs/ui-theme-consolidation/outputs/INVENTORY.md` | Full configuration diff |
| `specs/ui-theme-consolidation/MASTER_ORCHESTRATION.md` | Complete workflow |
| `packages/ui/ui/src/styles/globals.css` | Target file |
| `apps/todox/src/app/globals.css` | Source file |

---

## Verification Commands (NEXT STEPS)

```bash
# After modifications
bun run check --filter @beep/ui
bun run build --filter @beep/ui

# Ensure todox still works
bun run check --filter @beep/todox
```

## On Completion

1. Update `REFLECTION_LOG.md` with Phase 1 learnings
2. Create `handoffs/HANDOFF_P2.md`
3. Create `handoffs/P2_ORCHESTRATOR_PROMPT.md`

---

## Context Budget Verification

| Memory Type | Estimated Tokens | Budget | Status |
|-------------|------------------|--------|--------|
| Working | ~800 | ≤2,000 | ✓ |
| Episodic | ~200 | ≤1,000 | ✓ |
| Semantic | ~400 | ≤500 | ✓ |
| Procedural | ~100 (links) | Links only | ✓ |
| **Total** | **~1,500** | **≤4,000** | **✓** |
