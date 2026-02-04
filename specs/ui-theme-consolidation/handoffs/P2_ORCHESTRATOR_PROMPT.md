# Phase 2 Orchestrator Prompt

Copy-paste this prompt to start Phase 2 implementation.

---

## Prompt

You are implementing Phase 2 of the `ui-theme-consolidation` spec.

### Context

Phase 1 completed: CSS variables from todox are now merged into `@beep/ui`. Phase 2 focuses on MUI component styles.

**Critical Rule:** UI-CORE WINS. Only add net-new features from todox that don't exist in ui-core. Never modify existing ui-core behavior.

### Your Mission

1. Add 2 todox-unique components to ui-core
2. Review 18 overlapping components for additive features
3. Update component index barrel export

### Steps

#### Step 1: Add Todox-Unique Components

**Add `controls.tsx`:**
- Source: `apps/todox/src/theme/components/controls.tsx`
- Target: `packages/ui/core/src/theme/core/components/controls.tsx`
- Convert to ui-core style (`.tsx`, Effect imports if needed)

**Add `layout.tsx`:**
- Source: `apps/todox/src/theme/components/layout.ts`
- Target: `packages/ui/core/src/theme/core/components/layout.tsx`
- Convert to ui-core style

#### Step 2: Review Overlapping Components

For each of the 18 overlapping components:
1. Read both implementations
2. Identify features in todox NOT in ui-core
3. If additive → merge to ui-core
4. If conflicts → skip (document why)

**Priority components to review first:**
- `button` - has `color-mix` ripple, scale transform
- `dialog` - has centering fix (already in CSS from P1, verify component)
- `card` - may have elevation differences

#### Step 3: Update Component Index

Add new components to barrel export:
```
packages/ui/core/src/theme/core/components/index.ts
```

### Verification Commands

```bash
bun run check --filter @beep/ui-core
bun run build --filter @beep/ui-core
bun run check --filter @beep/todox
```

### Success Criteria

- [ ] `controls.tsx` added and exported
- [ ] `layout.tsx` added and exported
- [ ] Overlapping components reviewed (document decisions)
- [ ] Net-new features merged where applicable
- [ ] All verification commands pass

### On Completion

1. Update `specs/ui-theme-consolidation/REFLECTION_LOG.md` with learnings
2. Document which features were merged vs skipped
3. Create `specs/ui-theme-consolidation/handoffs/HANDOFF_P3.md`
4. Create `specs/ui-theme-consolidation/handoffs/P3_ORCHESTRATOR_PROMPT.md`

### Reference Files

- Inventory: `specs/ui-theme-consolidation/outputs/INVENTORY.md`
- Decision rubrics: `specs/ui-theme-consolidation/RUBRICS.md`
- Full handoff: `specs/ui-theme-consolidation/handoffs/HANDOFF_P2.md`
- Master workflow: `specs/ui-theme-consolidation/MASTER_ORCHESTRATION.md`
