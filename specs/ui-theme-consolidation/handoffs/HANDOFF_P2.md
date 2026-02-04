# Phase 2 Handoff - MUI Component Styles Merge

> Context document for Phase 2 execution.

---

## Success Criteria (CRITICAL - READ FIRST)

- [ ] `controls.tsx` added to ui-core
- [ ] `layout.tsx` added to ui-core
- [ ] 18 overlapping components reviewed
- [ ] Net-new features from todox merged
- [ ] Component index updated
- [ ] `bun run check --filter @beep/ui-core` passes
- [ ] `bun run build --filter @beep/ui-core` passes
- [ ] `bun run check --filter @beep/todox` passes

## Key Constraint (BLOCKING)

**UI-CORE WINS.** When todox and ui-core have conflicting styles, keep ui-core version. Only add features from todox that don't exist in ui-core.

---

## Working Context (Current Task)

### Mission

Merge todox-unique component styles into `@beep/ui-core` and add net-new features from overlapping components.

### Implementation Order

1. Add `controls.tsx` (todox-unique)
2. Add `layout.tsx` (todox-unique)
3. Review 18 overlapping components for net-new features
4. Update component index barrel export
5. Verify with `bun run check`

### File Format Conversion

**IMPORTANT**: Todox uses `.ts` files (plain objects), ui-core uses `.tsx` files (with Effect imports).

Pattern to follow for conversion:

```typescript
// ui-core style (tsx)
import type { Components, Theme } from "@mui/material/styles";

export const MuiComponentName: Components<Theme>["MuiComponentName"] = {
  styleOverrides: {
    root: ({ theme }) => ({
      // styles here
    }),
  },
};
```

### Todox-Unique Components to Add

1. **controls.tsx** (`apps/todox/src/theme/components/controls.tsx`)
   - Custom radio/checkbox/switch control styling
   - Target: `packages/ui/core/src/theme/core/components/controls.tsx`

2. **layout.ts** (`apps/todox/src/theme/components/layout.ts`)
   - Custom layout configuration
   - Target: `packages/ui/core/src/theme/core/components/layout.tsx`

### Overlapping Components (18 total)

| Component | Todox File | UI-Core File | Review Focus |
|-----------|------------|--------------|--------------|
| button | button.ts | button.tsx | `color-mix` ripple, scale transform |
| text-field | text-field.ts | text-field.tsx | Input styling |
| select | select.ts | select.tsx | Dropdown styling |
| autocomplete | autocomplete.ts | autocomplete.tsx | Listbox styling |
| alert | alert.ts | alert.tsx | Icon colors |
| table | table.ts | table.tsx | Row styling |
| list | list.ts | list.tsx | Item padding |
| menu | menu.ts | menu.tsx | Paper styling |
| card | card.ts | card.tsx | Elevation |
| chip | chip.ts | chip.tsx | Colors |
| avatar | avatar.ts | avatar.tsx | Sizes |
| link | link.ts | link.tsx | Hover states |
| progress | progress.ts | progress.tsx | Colors |
| svg-icon | svg-icon.ts | svg-icon.tsx | Sizes |
| dialog | dialog.ts | dialog.tsx | Backdrop, centering |
| date-picker | date-picker.ts | mui-x-date-picker.tsx | Calendar styling |
| tree-view | tree-view.ts | mui-x-tree-view.tsx | Node styling |
| data-grid | data-grid.ts | mui-x-data-grid.tsx | Cell styling |

### Decision Framework for Overlapping Components

```
For each component:
  1. Read todox implementation
  2. Read ui-core implementation
  3. Identify features in todox NOT in ui-core
  4. For each feature:
     - If additive (doesn't modify existing) → ADD
     - If conflicts with ui-core → SKIP
  5. Document decision in REFLECTION_LOG.md
```

---

## Episodic Context (Previous Phases)

### Phase 1 Summary (COMPLETED ✓)

- Successfully merged CSS variables from todox to ui-ui globals.css
- Added shadcn/ui color system (oklch) alongside existing MUI variables
- Added border radius system (`--radius-*`)
- Added chart colors (`--chart-1` through `--chart-5`)
- Added resizable panel styles
- Added `.scrollbar-none` utility
- All verification commands passed

**Key Files Modified:**
- `packages/ui/ui/src/styles/globals.css` (CSS variables, utilities, components)

---

## Semantic Context (Constants)

### UI-Core Component Structure

```
packages/ui/core/src/theme/core/components/
├── index.ts              # Barrel export (update this!)
├── button.tsx
├── text-field.tsx
├── dialog.tsx
├── ... (45 total)
```

### Effect Import Pattern (ui-core standard)

```typescript
import * as Str from "effect/String";
import * as A from "effect/Array";
// Use Str.toLowerCase(), A.map() instead of native methods
```

### Gotchas

1. **File extension**: Convert `.ts` to `.tsx` when adding to ui-core
2. **applyStyles**: Todox uses MUI's `applyStyles` for mode switching - this is valid, keep it
3. **color-mix**: Todox uses CSS `color-mix(in oklch, ...)` for ripple - this is valid, keep it
4. **Scale transforms**: Todox uses `transform: scale()` for active states - this is valid, keep it
5. **Index export**: Always update `components/index.ts` barrel when adding components

---

## Procedural Context (Links Only)

| Document | Purpose |
|----------|---------|
| `specs/ui-theme-consolidation/outputs/INVENTORY.md` | Full component comparison |
| `specs/ui-theme-consolidation/MASTER_ORCHESTRATION.md` | Complete workflow |
| `specs/ui-theme-consolidation/RUBRICS.md` | Decision scoring matrix |
| `apps/todox/src/theme/components/` | Source components |
| `packages/ui/core/src/theme/core/components/` | Target components |
| `packages/ui/core/src/theme/core/components/index.ts` | Barrel export to update |

---

## Verification Commands (NEXT STEPS)

```bash
# After modifications
bun run check --filter @beep/ui-core
bun run build --filter @beep/ui-core

# Ensure todox still works
bun run check --filter @beep/todox
```

## On Completion

1. Update `REFLECTION_LOG.md` with Phase 2 learnings
2. Document which features were merged vs skipped
3. Create `handoffs/HANDOFF_P3.md`
4. Create `handoffs/P3_ORCHESTRATOR_PROMPT.md`

---

## Context Budget Verification

| Memory Type | Estimated Tokens | Budget | Status |
|-------------|------------------|--------|--------|
| Working | ~1,200 | ≤2,000 | ✓ |
| Episodic | ~300 | ≤1,000 | ✓ |
| Semantic | ~400 | ≤500 | ✓ |
| Procedural | ~100 (links) | Links only | ✓ |
| **Total** | **~2,000** | **≤4,000** | **✓** |
