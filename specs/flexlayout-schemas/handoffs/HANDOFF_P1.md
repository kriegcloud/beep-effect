# FlexLayout Schema Migration Handoff — P1 Phase

> Handoff for Phase 1: Actions.ts Migration

---

## Session Summary: Spec Setup Complete

| Metric | Value |
|--------|-------|
| Spec created | 2025-01-11 |
| Files created | 8 |
| Phase | P0 (Spec Setup) → P1 (Actions) |
| Status | Ready to execute P1 |

---

## What Was Accomplished (P0)

### Spec Scaffolding

1. **README.md** - Overview with patterns, target files, execution strategy
2. **QUICK_START.md** - 5-minute migration guide
3. **AGENT_PROMPTS.md** - Detailed prompts for all phases
4. **RUBRICS.md** - Evaluation criteria with 5 dimensions
5. **MASTER_ORCHESTRATION.md** - Full workflow with dependency graph
6. **REFLECTION_LOG.md** - Pre-populated with pattern analysis
7. **handoffs/HANDOFF_P1.md** - This document
8. **handoffs/P1_ORCHESTRATOR_PROMPT.md** - Execution prompt for P1

### Research Completed

- Analyzed existing migrations: Attribute.ts, AttributeDefinitions.ts, DockLocation.ts
- Identified 4 key patterns: Simple Data, Collection, Tagged Variant, Lazy Singleton
- Mapped dependency graph for 9 target files
- Documented abstract class handling options

---

## Key Learnings from P0

### Pattern Clarification

The existing DockLocation.ts shows TWO patterns:
1. **Tagged Variant Pattern** - `dockLocationVariant.top({})` for type-safe unions
2. **Lazy Singleton Pattern** - `O.Option` with `O.getOrElse` for static instances

### Recommended Migration Order

```
P1: Actions.ts (simplest, no deps)
P2: Node.ts (abstract base, critical)
P3: LayoutWindow.ts, BorderSet.ts (support)
P4: BorderNode.ts, RowNode.ts (node subclasses)
P5: TabSetNode.ts, TabNode.ts (node subclasses)
P6: Model.ts (orchestrator, most complex)
```

---

## P1 Tasks to Execute

### Task 1: Check Action.ts First

Actions.ts uses `Action.new()`. Before migrating Actions, check if Action needs migration.

```
Read packages/ui/ui/src/flexlayout-react/model/Action.ts
Determine if Action is already using schema pattern or needs migration.
```

### Task 2: Migrate Actions.ts

**File**: `packages/ui/ui/src/flexlayout-react/model/Actions.ts`

Current structure:
- Extends `Data.Class`
- 16 static action type constants (ADD_NODE, MOVE_NODE, etc.)
- 14 static factory methods

Migration steps:
1. Add schema imports
2. Create `$I = $UiId.create("flexlayout-react/Actions")`
3. Create `ActionsData` schema (may be empty if all static)
4. Create `IActions` schema class
5. Migrate all static constants
6. Migrate all factory methods

### Task 3: Verify

```bash
turbo run check --filter=@beep/ui
```

---

## Success Criteria for P1

- [ ] Action.ts status determined (needs migration or not)
- [ ] IActions schema class created in Actions.ts
- [ ] All 16 action type constants preserved
- [ ] All 14 factory methods working
- [ ] Type check passes
- [ ] REFLECTION_LOG.md updated with P1 learnings

---

## Improved Prompts Based on P0 Learning

### Pattern Recognition Prompt

When starting a file migration:
```
1. First read the file completely
2. Identify: static vs instance, mutable vs immutable, serializable vs runtime
3. Check dependencies: what schemas does this need that don't exist yet?
4. Choose pattern: Simple Data, Collection, Tagged Variant, or Lazy Singleton
5. Proceed with migration
```

### Verification Prompt

After each file:
```
1. Run: turbo run check --filter=@beep/ui
2. If errors, check for:
   - this.field should be this.data.field
   - Native array methods should use A.*
   - Optional fields need Option handling
3. Run: turbo run lint --filter=@beep/ui
4. Update REFLECTION_LOG.md
```

---

## Notes for P1 Agent

1. **Actions is static-only** - May not need a data struct at all, just migrate constants and factory methods

2. **Check Action.ts dependency** - The factory methods return `Action` type. Ensure Action class works with schema pattern.

3. **Keep legacy class** - Don't delete existing `Actions extends Data.Class`, mark with `/** @internal */`

4. **Factory method signatures** - Must return same `Action` type, not `IAction`

---

## Handoff Checklist

- [x] Spec structure complete
- [x] Patterns documented
- [x] Dependency graph created
- [x] Rubrics defined
- [x] P1 tasks clear
- [ ] P1 execution pending
