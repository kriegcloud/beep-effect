# FlexLayout Schema Migration — P1 Orchestrator

> Execute Phase 1: Migrate Actions.ts

---

## Critical Orchestration Rules

1. **NEVER write code without reading the file first**
2. **ALWAYS verify with type check after changes**
3. **PRESERVE legacy class** - mark with `/** @internal */`
4. **LOG learnings** in REFLECTION_LOG.md

---

## Context from P0 Completion

| Metric | Value |
|--------|-------|
| Spec setup | Complete |
| Reference patterns | Documented in README.md |
| Dependency graph | Created in MASTER_ORCHESTRATION.md |
| Rubrics | Defined in RUBRICS.md |

---

## P1 Tasks to Execute

### Task 1: Investigate Action.ts Dependency

Before migrating Actions.ts, check its dependency.

**Sub-agent prompt**:
```
Read packages/ui/ui/src/flexlayout-react/model/Action.ts

Determine:
1. Does Action use Effect Schema or legacy pattern?
2. Does Action.new() factory exist and work correctly?
3. Is migration of Action.ts needed before Actions.ts?

Report findings - do not modify files yet.
```

### Task 2: Read Actions.ts

**Sub-agent prompt**:
```
Read packages/ui/ui/src/flexlayout-react/model/Actions.ts

Document:
1. All static constants (count and names)
2. All static factory methods (count, names, signatures)
3. Current class structure (extends Data.Class?)
4. Any instance state or methods

Report structure - do not modify files yet.
```

### Task 3: Create IActions Schema Class

Based on findings from Tasks 1-2, migrate Actions.ts.

**Sub-agent prompt**:
```
Migrate packages/ui/ui/src/flexlayout-react/model/Actions.ts to use Effect Schema.

Steps:
1. Add imports at top of file:
   import { $UiId } from "@beep/identity/packages";
   import * as S from "effect/Schema";

2. Create identifier:
   const $I = $UiId.create("flexlayout-react/Actions");

3. If Actions has NO instance state (only static), create minimal schema:
   export class IActions extends S.Class<IActions>($I`IActions`)({}) {
     // Migrate all static constants here
     static ADD_NODE = "FlexLayout_AddNode";
     // ... all 16 constants

     // Migrate all static factory methods here
     static addNode(...): Action { ... }
     // ... all 14 methods
   }

4. If Actions HAS instance state, create data struct first:
   export class ActionsData extends S.Struct({
     // fields here
   }).pipe(S.mutable).annotations($I.annotations("ActionsData", {})) {}

   export class IActions extends S.Class<IActions>($I`IActions`)({
     data: ActionsData
   }) { ... }

5. Mark legacy class with /** @internal */

6. Do NOT delete legacy class
```

### Task 4: Verify Migration

**Sub-agent prompt**:
```
After creating IActions:

1. Run type check:
   turbo run check --filter=@beep/ui

2. If errors, fix them:
   - Check import paths
   - Ensure factory methods return correct types
   - Verify static constants are accessible

3. Run lint:
   turbo run lint --filter=@beep/ui

4. Report results
```

### Task 5: Update Reflection Log

**Sub-agent prompt**:
```
Update specs/flexlayout-schemas/REFLECTION_LOG.md with P1 learnings:

Add new entry:
### 2025-01-11 - P1 Actions.ts Migration

#### What Worked
- [list what went smoothly]

#### What Didn't Work
- [list challenges encountered]

#### Pattern Refinements
- [any new patterns discovered]

#### Decisions Made
- [e.g., "Actions has no instance state, used minimal schema"]
```

---

## Execution Protocol

```
┌─────────────────────────────────────────────────────┐
│                P1 EXECUTION FLOW                     │
├─────────────────────────────────────────────────────┤
│  1. Task 1: Read Action.ts (dependency check)        │
│  2. Task 2: Read Actions.ts (understand structure)   │
│  3. Task 3: Create IActions schema class             │
│  4. Task 4: Run verification commands                │
│  5. Task 5: Update REFLECTION_LOG.md                 │
│  6. If successful, create HANDOFF_P2.md              │
└─────────────────────────────────────────────────────┘
```

---

## Success Criteria

- [ ] Action.ts dependency investigated
- [ ] Actions.ts structure documented
- [ ] IActions schema class created
- [ ] All 16 static constants preserved
- [ ] All 14 factory methods preserved
- [ ] Legacy Actions class marked `/** @internal */`
- [ ] Type check passes: `turbo run check --filter=@beep/ui`
- [ ] Lint passes: `turbo run lint --filter=@beep/ui`
- [ ] REFLECTION_LOG.md updated

---

## Verification Commands

```bash
# Type check
turbo run check --filter=@beep/ui

# Lint
turbo run lint --filter=@beep/ui

# Quick test that constants exist
grep -n "static ADD_NODE" packages/ui/ui/src/flexlayout-react/model/Actions.ts
```

---

## On Completion

If P1 succeeds:

1. Create `handoffs/HANDOFF_P2.md` with:
   - P1 completion summary
   - Learnings applied
   - P2 tasks (Node.ts migration)

2. Create `handoffs/P2_ORCHESTRATOR_PROMPT.md` with:
   - Context from P1
   - Tasks for Node.ts abstract class challenge

---

## Troubleshooting

### Type Error: Cannot find module
Check import path for `@beep/identity/packages`

### Static methods not accessible
Ensure methods are declared as `static` in the schema class

### Factory method return type wrong
Methods should return `Action`, not `IAction` (Action is the return type)

### Lint error: unused import
Remove any unused imports added during migration
