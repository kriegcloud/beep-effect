# FlexLayout Schema Creation — P3 Orchestrator

> Execute Phase 3: Create Support Class Schemas (ILayoutWindow, IBorderSet)

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

## Context from P2 Completion

| Metric | Value |
|--------|-------|
| P2 Status | Complete |
| INodeData created | Lines 329-334 in Node.ts |
| INode created | Lines 345-671 in Node.ts |
| Pattern learned | Abstract class → concrete base with throwing stubs |
| Non-serializable fields | Private class fields with Option wrappers |
| Verification | Type check + lint passed |

---

## P3 Challenge Summary

Two support classes need schema versions:

1. **LayoutWindow** - Window state manager with DOM references
2. **BorderSet** - Collection of border nodes with Map storage

Both have a mix of serializable and runtime-only fields.

---

## P3 Tasks to Execute

### Task 1: Analyze LayoutWindow.ts

**Sub-agent prompt**:
```
Read packages/ui/ui/src/flexlayout-react/model/LayoutWindow.ts

Document:
1. All instance fields (names, types, initialization)
2. Constructor logic
3. All methods (count, names)
4. Dependencies (imports used)

Categorize fields:
- SERIALIZABLE: windowId, rect dimensions
- RUNTIME-ONLY: _window (DOM), _root, _layout, _maximizedTabSet, _activeTabSet, callbacks

Report structure - do not modify files yet.
```

### Task 2: Create ILayoutWindow

**Sub-agent prompt**:
```
Create ILayoutWindow schema class in packages/ui/ui/src/flexlayout-react/model/LayoutWindow.ts

IMPORTANT: DO NOT modify the existing LayoutWindow class. Add new code BELOW it.

Steps:
1. Add imports at top of file (if not already present):
   import { $UiId } from "@beep/identity/packages";
   import * as S from "effect/Schema";
   import * as O from "effect/Option";

2. Create identifier:
   const $I = $UiId.create("flexlayout-react/model/LayoutWindow");

3. Create data struct for serializable fields:
   export class ILayoutWindowData extends S.Class<ILayoutWindowData>($I`ILayoutWindowData`)({
     windowId: S.String,
     // rect fields as needed
   }) {}

4. Create ILayoutWindow class:
   export class ILayoutWindow extends S.Class<ILayoutWindow>($I`ILayoutWindow`)({
     data: ILayoutWindowData
   }) {
     // Private runtime fields
     private _window: O.Option<Window> = O.none();
     private _layout: O.Option<...> = O.none();
     private _root: O.Option<RowNode> = O.none();
     // ... other runtime fields

     // Methods from original class
   }

5. Copy all methods from LayoutWindow, adapting to private field access

6. DO NOT modify, delete, or mark the original LayoutWindow class
```

### Task 3: Verify LayoutWindow

**Sub-agent prompt**:
```
After creating ILayoutWindow:

1. Run type check:
   turbo run check --filter=@beep/ui

2. If errors, fix them

3. Verify both classes exist:
   grep -n "class LayoutWindow\|class ILayoutWindow" packages/ui/ui/src/flexlayout-react/model/LayoutWindow.ts
```

### Task 4: Analyze BorderSet.ts

**Sub-agent prompt**:
```
Read packages/ui/ui/src/flexlayout-react/model/BorderSet.ts

Document:
1. All instance fields (names, types, initialization)
2. Constructor logic
3. All methods (count, names)
4. Dependencies (imports used)
5. BorderNode dependency - how is it referenced?

Categorize fields:
- SERIALIZABLE: borders array (or elements), layoutHorizontal
- RUNTIME-ONLY: borderMap, model reference

Report structure - do not modify files yet.
```

### Task 5: Create IBorderSet

**Sub-agent prompt**:
```
Create IBorderSet schema class in packages/ui/ui/src/flexlayout-react/model/BorderSet.ts

IMPORTANT: DO NOT modify the existing BorderSet class. Add new code BELOW it.

Steps:
1. Add imports at top of file
2. Create identifier
3. Create IBorderSetData struct
4. Create IBorderSet class with private runtime fields
5. Copy all methods from BorderSet
6. Handle BorderNode references (may need forward ref or type assertion)
7. DO NOT modify original BorderSet class
```

### Task 6: Verify Both Classes

**Sub-agent prompt**:
```
Final verification:

1. Run type check:
   turbo run check --filter=@beep/ui

2. Run lint:
   turbo run lint --filter=@beep/ui

3. If lint errors, run lint:fix:
   turbo run lint:fix --filter=@beep/ui

4. Verify all classes exist:
   grep -n "class LayoutWindow\|class ILayoutWindow" packages/ui/ui/src/flexlayout-react/model/LayoutWindow.ts
   grep -n "class BorderSet\|class IBorderSet" packages/ui/ui/src/flexlayout-react/model/BorderSet.ts

5. Report results
```

### Task 7: Update Reflection Log

**Sub-agent prompt**:
```
Update specs/flexlayout-schemas/REFLECTION_LOG.md with P3 learnings:

Add new entry:
### 2026-01-11 - P3 Support Classes Schema Creation

#### What Worked
- [DOM reference handling? BorderNode forward ref?]

#### What Didn't Work
- [any issues encountered?]

#### Pattern Refinements
- DOM reference handling pattern
- Complex Map field handling
- Forward reference pattern if needed

#### Decisions Made
- [e.g., "Used O.Option<Window> for DOM reference"]
```

---

## Execution Protocol

```
┌─────────────────────────────────────────────────────┐
│                P3 EXECUTION FLOW                     │
├─────────────────────────────────────────────────────┤
│  1. Task 1: Analyze LayoutWindow.ts                  │
│  2. Task 2: Create ILayoutWindow                     │
│  3. Task 3: Verify ILayoutWindow                     │
│  4. Task 4: Analyze BorderSet.ts                     │
│  5. Task 5: Create IBorderSet                        │
│  6. Task 6: Final verification                       │
│  7. Task 7: Update REFLECTION_LOG.md                 │
│  8. If successful, create HANDOFF_P4.md              │
└─────────────────────────────────────────────────────┘
```

---

## Success Criteria

- [ ] LayoutWindow.ts structure analyzed
- [ ] ILayoutWindowData schema struct created
- [ ] ILayoutWindow schema class created BELOW original
- [ ] BorderSet.ts structure analyzed
- [ ] IBorderSetData schema struct created
- [ ] IBorderSet schema class created BELOW original
- [ ] Private runtime fields properly initialized
- [ ] Original LayoutWindow class UNCHANGED
- [ ] Original BorderSet class UNCHANGED
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

# Verify classes exist
grep -n "class LayoutWindow\|class ILayoutWindow" packages/ui/ui/src/flexlayout-react/model/LayoutWindow.ts
grep -n "class BorderSet\|class IBorderSet" packages/ui/ui/src/flexlayout-react/model/BorderSet.ts
```

---

## On Completion

If P3 succeeds:

1. Create `handoffs/HANDOFF_P4.md` with:
   - P3 completion summary
   - Learnings applied
   - P4 tasks (BorderNode.ts, RowNode.ts - Node subclasses)

2. Create `handoffs/P4_ORCHESTRATOR_PROMPT.md` with:
   - Context from P3
   - Tasks for Node subclass schema creation

---

## Troubleshooting

### DOM Window type issues
Use browser globals or create type-only reference:
```typescript
private _window: O.Option<Window> = O.none();
```

### BorderNode forward reference
If BorderSet needs BorderNode before it's converted:
```typescript
import type { BorderNode } from "./BorderNode";
// Store as any or use type assertion at boundaries
```

### Map with complex keys
DockLocation as key may need special handling:
```typescript
// Store as array of pairs or use Record
private _borderMap: Array<[DockLocation, BorderNode]> = [];
```

### Circular imports
Use type-only imports where possible:
```typescript
import type { Model } from "./Model";
```
