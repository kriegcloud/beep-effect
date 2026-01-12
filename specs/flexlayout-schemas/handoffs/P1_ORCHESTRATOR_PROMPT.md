# FlexLayout Schema Creation — P1 Orchestrator

> Execute Phase 1: Create IActions Schema Class

---

## Critical Rule

**DO NOT MODIFY ORIGINAL CLASSES.** This is additive work - create NEW schema classes alongside existing classes. Originals stay unchanged.

---

## Critical Orchestration Rules

1. **NEVER write code without reading the file first**
2. **ALWAYS verify with type check after changes**
3. **DO NOT modify original classes** - Create new schema classes alongside them
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

Before creating IActions schema class, check its dependency.

**Sub-agent prompt**:
```
Read packages/ui/ui/src/flexlayout-react/model/Action.ts

Determine:
1. Does Action use Effect Schema or legacy pattern?
2. Does Action.new() factory exist and work correctly?
3. Is a schema version of Action.ts needed before Actions.ts?

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

Based on findings from Tasks 1-2, create the IActions schema class BELOW the existing Actions class.

**Sub-agent prompt**:
```
Create an IActions schema class in packages/ui/ui/src/flexlayout-react/model/Actions.ts

IMPORTANT: DO NOT modify the existing Actions class. Add new code BELOW it.

Steps:
1. Add imports at top of file (if not already present):
   import { $UiId } from "@beep/identity/packages";
   import * as S from "effect/Schema";

2. Create identifier:
   const $I = $UiId.create("flexlayout-react/Actions");

3. If Actions has NO instance state (only static), create minimal schema:
   export class IActions extends S.Class<IActions>($I`IActions`)({}) {
     // Add all static constants here
     static ADD_NODE = "FlexLayout_AddNode";
     // ... all 16 constants

     // Add all static factory methods here
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

5. DO NOT modify, delete, or mark the original Actions class
```

### Task 4: Verify Creation

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
### 2025-01-11 - P1 IActions Schema Class Creation

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
- [ ] IActions schema class created BELOW original Actions class
- [ ] All 16 static constants in IActions
- [ ] All 14 factory methods in IActions
- [ ] Original Actions class UNCHANGED
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

# Quick test that both classes exist
grep -n "class Actions" packages/ui/ui/src/flexlayout-react/model/Actions.ts
grep -n "class IActions" packages/ui/ui/src/flexlayout-react/model/Actions.ts
```

---

## On Completion

If P1 succeeds:

1. Create `handoffs/HANDOFF_P2.md` with:
   - P1 completion summary
   - Learnings applied
   - P2 tasks (Node.ts schema creation)

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
Remove any unused imports added during schema creation
