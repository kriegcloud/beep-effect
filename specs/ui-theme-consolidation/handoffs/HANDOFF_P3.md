# Phase 3 Handoff - Theme Configuration Merge

> Context document for Phase 3 execution.

---

## Success Criteria (CRITICAL - READ FIRST)

- [ ] `text.icon` added to type augmentation
- [ ] `text.tertiary` added to type augmentation
- [ ] iOS-inspired colors reviewed for inclusion
- [ ] Typography differences merged if any
- [ ] Shadow differences reviewed
- [ ] `bun run check --filter @beep/ui-core` passes
- [ ] `bun run build --filter @beep/ui-core` passes
- [ ] `bun run check --filter @beep/todox` passes

## Key Constraint (BLOCKING)

**UI-CORE WINS.** When todox and ui-core have conflicting configurations, keep ui-core version. Only add features from todox that don't exist in ui-core.

---

## Working Context (Current Task)

### Mission

Merge todox-specific theme configuration (type augmentations, colors, typography) into `@beep/ui-core`.

### Implementation Order

1. Add `text.icon` and `text.tertiary` to type augmentation
2. Review todox colors for iOS-inspired additions
3. Review typography differences
4. Review shadow differences
5. Verify with `bun run check`

### Type Augmentation Target

**File:** `packages/ui/core/src/theme/extend-theme-types.ts`

**Required Additions:**
```typescript
declare module "@mui/material/styles" {
  interface TypeText {
    icon?: string;      // NEW from todox
    tertiary?: string;  // NEW from todox
  }
}
```

### Todox Color System Reference

**File:** `apps/todox/src/theme/colors.ts`

**iOS-inspired colors:**
- `systemGray: "#E5E5EA"`
- `systemGreen: "#34C759"`
- `systemRed: "#FF3C3C"`

**Custom text colors:**
- `text.icon` - Used for icon default state
- `text.tertiary` - Third-level text hierarchy

### Palette Augmentation Context

These additions enable todox components that use:
- `theme.palette.text.icon` in controls and buttons
- `theme.palette.text.tertiary` in secondary labels
- `theme.palette.*.text` color properties in variants

---

## Episodic Context (Previous Phases)

### Phase 1 Summary (COMPLETED ✓)

- CSS variables merged from todox to ui-ui globals.css
- Shadcn oklch colors alongside existing MUI variables
- Border radius, chart colors, resizable panels added

### Phase 2 Summary (COMPLETED ✓)

- `controls.tsx` and `layout.ts` **NOT ADDED** (pre-existing or conflicting)
- Added genuinely missing sub-components:
  - `MuiDialogContentText` to dialog.tsx
  - `MuiMenu` to menu.tsx
  - `MuiCardActions` to card.tsx
  - `MuiFormControlLabel.root` gap styling to form.tsx
- Skipped `color-mix` patterns pending P3 palette augmentation

---

## Semantic Context (Constants)

### UI-Core Theme Structure

```
packages/ui/core/src/theme/
├── create-theme.ts           # Composition point
├── theme-config.ts           # Defaults
├── extend-theme-types.ts     # TypeScript augmentation (UPDATE THIS!)
├── core/
│   ├── palette.ts            # Channel-aware palette system
│   ├── typography.ts         # Font configurations
│   └── colors.ts             # Color values
```

### Todox Theme Files

```
apps/todox/src/theme/
├── colors.ts                 # Light/dark color schemes (REVIEW THIS)
├── types.ts                  # Minimal type augmentation (MERGE FROM THIS)
├── typography.ts             # Typography settings
└── shadows.ts                # Shadow definitions
```

### Gotchas

1. **TypeText augmentation**: Must be interface merge, not replacement
2. **Optional properties**: Use `?` for new text properties (backward compatibility)
3. **Color scheme structure**: todox has separate light/dark objects
4. **Action opacity**: todox defines custom action opacity values

---

## Procedural Context (Links Only)

| Document | Purpose |
|----------|---------|
| `specs/ui-theme-consolidation/outputs/INVENTORY.md` | Full configuration comparison |
| `specs/ui-theme-consolidation/MASTER_ORCHESTRATION.md` | Complete workflow |
| `specs/ui-theme-consolidation/RUBRICS.md` | Decision scoring matrix |
| `packages/ui/core/src/theme/extend-theme-types.ts` | Target for augmentation |
| `apps/todox/src/theme/types.ts` | Source for type additions |
| `apps/todox/src/theme/colors.ts` | Source for color additions |

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

1. Update `REFLECTION_LOG.md` with Phase 3 learnings
2. Document which configurations were merged vs skipped
3. Create `handoffs/HANDOFF_P4.md`
4. Create `handoffs/P4_ORCHESTRATOR_PROMPT.md`

---

## Context Budget Verification

| Memory Type | Estimated Tokens | Budget | Status |
|-------------|------------------|--------|--------|
| Working | ~1,000 | ≤2,000 | ✓ |
| Episodic | ~400 | ≤1,000 | ✓ |
| Semantic | ~400 | ≤500 | ✓ |
| Procedural | ~100 (links) | Links only | ✓ |
| **Total** | **~1,900** | **≤4,000** | **✓** |
