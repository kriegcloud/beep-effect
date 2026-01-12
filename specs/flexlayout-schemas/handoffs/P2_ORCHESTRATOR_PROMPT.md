# FlexLayout Schema Creation — P2 Orchestrator

> Execute Phase 2: Create INode Schema Class (Abstract Class Challenge)

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

## Context from P1 Completion

| Metric | Value |
|--------|-------|
| P1 Status | Complete |
| IActions created | Lines 230-428 in Actions.ts |
| Pattern learned | Static-only classes use empty schema body `({})` |
| Verification | Type check + lint passed |

---

## P2 Challenge Summary

Node.ts is an **abstract class** with:
- 3 abstract methods (`toJson`, `updateAttrs`, `getAttributeDefinitions`)
- 7 protected instance fields
- ~25 concrete methods
- Protected constructor
- Circular dependency with Model

Effect Schema classes **cannot be abstract**. The recommended approach is Option 1: Concrete Base with Runtime Checks.

---

## P2 Tasks to Execute

### Task 1: Read Node.ts Thoroughly

**Sub-agent prompt**:
```
Read packages/ui/ui/src/flexlayout-react/model/Node.ts

Document:
1. All protected instance fields (names, types, initialization)
2. All abstract methods (names, signatures, return types)
3. All concrete methods (count, names, key patterns)
4. Constructor logic
5. Dependencies (imports used)

Report structure - do not modify files yet.
```

### Task 2: Identify Serializable vs Non-Serializable

**Sub-agent prompt**:
```
From the Node.ts analysis, categorize fields:

SERIALIZABLE (goes in schema struct):
- id (from attributes.id)
- type (from attributes.type)
- weight (from attributes.weight)
- selected (from attributes.selected)

NON-SERIALIZABLE (private instance fields):
- model (circular ref)
- parent (self-referential)
- children (self-referential array)
- rect (has own schema)
- path (runtime)
- listeners (callbacks)
- attributes (dynamic record)

Report categorization - do not modify files yet.
```

### Task 3: Create INode Schema Class

**Sub-agent prompt**:
```
Create INode schema class in packages/ui/ui/src/flexlayout-react/model/Node.ts

IMPORTANT: DO NOT modify the existing Node class. Add new code BELOW it.

Steps:
1. Add imports at top of file (if not already present):
   import { $UiId } from "@beep/identity/packages";
   import * as S from "effect/Schema";

2. Create identifier:
   const $I = $UiId.create("flexlayout-react/model/Node");

3. Create data struct for serializable fields:
   export class INodeData extends S.Struct({
     id: S.OptionFromUndefinedOr(S.String),
     type: S.NonEmptyTrimmedString,
     weight: S.OptionFromUndefinedOr(S.Number),
     selected: S.OptionFromUndefinedOr(S.Number),
   }).pipe(S.mutable).annotations($I.annotations("INodeData", {})) {}

4. Create INode class:
   export class INode extends S.Class<INode>($I`INode`)({
     data: INodeData
   }) {
     // Private non-serializable fields
     private _model: O.Option<Model> = O.none();
     private _parent: O.Option<INode> = O.none();
     private _children: INode[] = [];
     private _rect: Rect = Rect.empty();
     private _path: string = "";
     private _listeners: Map<string, (p: unknown) => void> = new Map();
     private _attributes: Record<string, unknown> = {};

     // Abstract method stubs (throw to indicate must be overridden)
     toJson(): JsonRowNode | JsonBorderNode | JsonTabSetNode | JsonTabNode | undefined {
       throw new Error("INode.toJson() must be implemented by subclass");
     }

     updateAttrs(json: unknown): void {
       throw new Error("INode.updateAttrs() must be implemented by subclass");
     }

     getAttributeDefinitions(): AttributeDefinitions {
       throw new Error("INode.getAttributeDefinitions() must be implemented by subclass");
     }

     // Copy ALL concrete methods from Node class
     // getId(), getModel(), getType(), getParent(), getChildren(),
     // getRect(), getPath(), getOrientation(), setEventListener(),
     // removeEventListener(), setId(), fireEvent(), getAttr(),
     // forEachNode(), setPaths(), setParent(), setRect(), setPath(),
     // setWeight(), setSelected(), findDropTargetNode(), canDrop(),
     // canDockInto(), removeChild(), addChild(), removeAll(),
     // styleWithPosition(), isEnableDivide(), toJSON(), toAttributeString()
   }

5. Adapt method implementations to use private fields:
   - this.model → O.getOrThrow(this._model)
   - this.parent → O.getOrUndefined(this._parent)
   - this.children → this._children
   - this.rect → this._rect
   - this.path → this._path
   - this.listeners → this._listeners
   - this.attributes → this._attributes

6. DO NOT modify, delete, or mark the original Node class
```

### Task 4: Verify Creation

**Sub-agent prompt**:
```
After creating INode:

1. Run type check:
   turbo run check --filter=@beep/ui

2. If errors, common fixes:
   - Import missing types (JsonRowNode, etc.)
   - Check Option handling (O.getOrThrow, O.getOrUndefined)
   - Ensure private field initialization matches types
   - Check method return types match originals

3. Run lint:
   turbo run lint --filter=@beep/ui

4. Verify both classes exist:
   grep -n "class Node\|class INode" packages/ui/ui/src/flexlayout-react/model/Node.ts

5. Report results
```

### Task 5: Update Reflection Log

**Sub-agent prompt**:
```
Update specs/flexlayout-schemas/REFLECTION_LOG.md with P2 learnings:

Add new entry:
### 2026-01-11 - P2 INode Schema Class Creation

#### What Worked
- [concrete base approach? private fields?]

#### What Didn't Work
- [challenges with abstract methods?]

#### Pattern Refinements
- Abstract class handling pattern
- Non-serializable field pattern
- Circular reference handling

#### Decisions Made
- [e.g., "Used throwing implementations for abstract methods"]
```

---

## Execution Protocol

```
┌─────────────────────────────────────────────────────┐
│                P2 EXECUTION FLOW                     │
├─────────────────────────────────────────────────────┤
│  1. Task 1: Read Node.ts (understand structure)      │
│  2. Task 2: Categorize fields (serializable/not)     │
│  3. Task 3: Create INode schema class                │
│  4. Task 4: Run verification commands                │
│  5. Task 5: Update REFLECTION_LOG.md                 │
│  6. If successful, create HANDOFF_P3.md              │
└─────────────────────────────────────────────────────┘
```

---

## Success Criteria

- [ ] Node.ts structure fully documented
- [ ] Serializable vs non-serializable fields categorized
- [ ] INodeData schema struct created
- [ ] INode schema class created BELOW original Node class
- [ ] All 3 abstract methods have throwing implementations
- [ ] All ~25 concrete methods copied and adapted
- [ ] Private non-serializable fields properly initialized
- [ ] Original Node class UNCHANGED
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

# Verify both classes exist
grep -n "class Node\|class INode" packages/ui/ui/src/flexlayout-react/model/Node.ts
```

---

## On Completion

If P2 succeeds:

1. Create `handoffs/HANDOFF_P3.md` with:
   - P2 completion summary
   - Learnings applied (abstract class pattern)
   - P3 tasks (LayoutWindow.ts, BorderSet.ts support classes)

2. Create `handoffs/P3_ORCHESTRATOR_PROMPT.md` with:
   - Context from P2
   - Tasks for support class schema creation

---

## Troubleshooting

### Type Error: Property does not exist on type
Private fields need to be accessed correctly:
- `this._model` not `this.model`
- Use `O.getOrThrow()` for required values

### Abstract method signature mismatch
Check return types match exactly with original abstract methods

### Circular import error
Model imports may need to be `type` imports:
```typescript
import type { Model } from "./Model";
```

### Option handling errors
Use correct Option operations:
- `O.some(value)` to set
- `O.getOrThrow(opt)` to get required
- `O.getOrUndefined(opt)` to get optional
- `O.none()` for initial empty state
