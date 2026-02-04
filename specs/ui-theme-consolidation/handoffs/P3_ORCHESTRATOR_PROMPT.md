# Phase 3 Orchestrator Prompt

> Copy this prompt to start Phase 3 in a new session.

---

You are implementing Phase 3 of the `ui-theme-consolidation` spec.

### Context

Phase 1 completed: CSS variables from todox merged into `@beep/ui`. Phase 2 completed: Added missing MUI sub-components (DialogContentText, Menu, CardActions, FormControlLabel gap). Phase 3 focuses on theme configuration (type augmentations, palette).

**Critical Rule:** UI-CORE WINS. Only add net-new features from todox that don't exist in ui-core. Never modify existing ui-core behavior.

### Your Mission

1. Add `text.icon` and `text.tertiary` to TypeText augmentation
2. Review iOS-inspired colors for potential inclusion
3. Review typography/shadow differences
4. Ensure type augmentation enables P2 skipped features

### Steps

#### Step 1: Read Source Files

Read these files to understand what needs to be added:
- `apps/todox/src/theme/types.ts` (source augmentation)
- `apps/todox/src/theme/colors.ts` (color definitions)
- `packages/ui/core/src/theme/extend-theme-types.ts` (target)

#### Step 2: Add TypeText Augmentation

In `packages/ui/core/src/theme/extend-theme-types.ts`, find the existing TypeText interface and add:

```typescript
interface TypeText {
  // ... existing properties
  icon?: string;      // NEW - default icon color state
  tertiary?: string;  // NEW - third-level text hierarchy
}
```

#### Step 3: Review Color Additions

Check if ui-core palette needs:
- iOS-inspired system colors (systemGray, systemGreen, systemRed)
- Custom action opacity values

Only add if NOT already present in ui-core.

#### Step 4: Review Typography/Shadows

Compare todox and ui-core for:
- Font family differences
- Shadow differences

Document findings even if no changes made.

### Verification Commands

```bash
bun run check --filter @beep/ui-core
bun run build --filter @beep/ui-core
bun run check --filter @beep/todox
```

### Success Criteria

- [ ] `text.icon` and `text.tertiary` in extend-theme-types.ts
- [ ] Color additions documented (merged or skipped with reason)
- [ ] Typography/shadow review documented
- [ ] All verification commands pass

### On Completion

1. Update `specs/ui-theme-consolidation/REFLECTION_LOG.md` with learnings
2. Document which configurations were merged vs skipped
3. Create `specs/ui-theme-consolidation/handoffs/HANDOFF_P4.md`
4. Create `specs/ui-theme-consolidation/handoffs/P4_ORCHESTRATOR_PROMPT.md`

### Reference Files

- Full handoff: `specs/ui-theme-consolidation/handoffs/HANDOFF_P3.md`
- Inventory: `specs/ui-theme-consolidation/outputs/INVENTORY.md`
- Decision rubrics: `specs/ui-theme-consolidation/RUBRICS.md`
- Master workflow: `specs/ui-theme-consolidation/MASTER_ORCHESTRATION.md`
