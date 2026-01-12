# FlexLayout Schema Creation — P7 Orchestrator

> Execute Phase 7: Decouple I* Schema Classes from Original Classes

---

## Critical Rule

**DO NOT MODIFY ORIGINAL CLASSES.** This phase refactors I* schema classes to only reference other I* classes. Original classes stay completely unchanged.

---

## Critical Orchestration Rules

1. **NEVER write code without reading the file first**
2. **ALWAYS verify with type check after changes**
3. **DO NOT modify original classes** - Only modify I* schema classes
4. **LOG learnings** in REFLECTION_LOG.md
5. **INCREMENTAL changes** - One file at a time, verify after each

---

## Context from P6 Completion

| Metric | Value |
|--------|-------|
| P6 Status | Complete |
| Schema classes created | 9 files, 11 classes total |
| Current issue | I* classes use `as unknown as OriginalClass` type casts |
| P7 Goal | I* classes reference only other I* classes |

---

## P7 Challenge Summary

Currently I* classes are coupled to original classes via type assertions:

```typescript
// Current patterns to eliminate
new TabNode(this as unknown as Model, ...)
RowNode.fromJson(json, this as unknown as Model, ...)
new BorderSet(this as unknown as Model)
model.addNode(this as unknown as Node)
```

Must become:

```typescript
// Target patterns
ITabNode.new(this, ...)
IRowNode.fromJson(json, this, ...)
IBorderSet.new(this)
model.addNode(this)  // IModel.addNode(node: INode)
```

---

## Critical: I* Schema Class Structure Difference

**Original classes** access properties directly: `this._name`
**I* schema classes** access via data field: `this.data._name`

### Error Diagnosis Priority (IMPORTANT)

When removing `as unknown as` assertions causes type errors, diagnose in THIS ORDER:

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Property Path Issue?                               │
│  ─────────────────────────────                              │
│  Is code using `this.x` when it should be `this.data.x`?   │
│                                                             │
│  ❌ this._name          →  ✅ this.data._name               │
│  ❌ this._children      →  ✅ this.data._children           │
│  ❌ this._attributes    →  ✅ this.data._attributes         │
├─────────────────────────────────────────────────────────────┤
│  STEP 2: Type Signature Issue?                              │
│  ──────────────────────────────                             │
│  Does method accept original class when it should accept I*?│
│                                                             │
│  ❌ addNode(node: Node)     →  ✅ addNode(node: INode)      │
│  ❌ setModel(model: Model)  →  ✅ setModel(model: IModel)   │
├─────────────────────────────────────────────────────────────┤
│  STEP 3: ONLY THEN - Runtime Validation Needed?             │
│  ───────────────────────────────────────────────            │
│  Use S.decodeUnknown* ONLY when actual runtime narrowing    │
│  is required (union types, external data, etc.)             │
└─────────────────────────────────────────────────────────────┘
```

**Do NOT use decode functions to paper over property path bugs.**

---

## Effect Schema Decode Functions (When Actually Needed)

For cases where runtime type validation IS genuinely needed:

```typescript
import * as S from "effect/Schema";

// Option 1: Throws on failure (use when confident)
const parentRow = S.decodeUnknownSync(INode)(this.getParent());

// Option 2: Returns Either - handle errors gracefully (preferred)
import * as E from "effect/Either";
const result = S.decodeUnknownEither(INode)(this.getParent());
if (E.isRight(result)) {
  const parentRow = result.right;
}
```

**Valid use cases for decode functions**:
- Narrowing union types at runtime
- Validating external/untrusted data
- Converting between original and I* class instances

---

## Execution Order

```
┌─────────────────────────────────────────────────────┐
│              P7 EXECUTION ORDER                      │
├─────────────────────────────────────────────────────┤
│  1. Update INode: _model type Model → IModel        │
│  2. Update ITabNode: model param Model → IModel     │
│  3. Update ITabSetNode: use IModel, ITabNode        │
│  4. Update IBorderNode: use IModel, ITabNode        │
│  5. Update IRowNode: use IModel, ITabSetNode        │
│  6. Update ILayoutWindow: use IModel, IRowNode      │
│  7. Update IBorderSet: use IModel, IBorderNode      │
│  8. Update IModel: use all I* classes               │
│  9. Remove all `as unknown as` casts                │
│  10. Verify and fix errors                          │
│  11. Update REFLECTION_LOG.md                       │
└─────────────────────────────────────────────────────┘
```

---

## P7 Tasks

### Task 1: Update INode Base Class

**File**: `packages/ui/ui/src/flexlayout-react/model/Node.ts`

**Changes**:
```typescript
// Before
private _model: O.Option<Model> = O.none();

// After
private _model: O.Option<IModel> = O.none();

// Update all methods that reference Model to use IModel
protected initializeModel(model: IModel): void { ... }
getModel(): IModel { return O.getOrThrow(this._model); }
```

**Verify**: `turbo run check --filter=@beep/ui`

---

### Task 2: Update ITabNode

**File**: `packages/ui/ui/src/flexlayout-react/model/TabNode.ts`

**Changes**:
```typescript
// Update factory signature
static readonly new = (model: IModel, json: UnsafeTypes.UnsafeAny, addToModel = true): ITabNode

// Update _initialize
private _initialize(model: IModel, json: UnsafeTypes.UnsafeAny, addToModel: boolean): void

// Remove type assertions
model.addNode(this);  // not: model.addNode(this as unknown as Node)
```

**Verify**: `turbo run check --filter=@beep/ui`

---

### Task 3: Update ITabSetNode

**File**: `packages/ui/ui/src/flexlayout-react/model/TabSetNode.ts`

**Changes**:
```typescript
// Update factory signature
static readonly new = (model: IModel, json: UnsafeTypes.UnsafeAny): ITabSetNode

// Update fromJson to use ITabNode
static fromJson(json: UnsafeTypes.UnsafeAny, model: IModel, layoutWindow: ILayoutWindow): ITabSetNode {
  // Use ITabNode.new instead of TabNode constructor
  const child = ITabNode.new(model, jsonChild);
  ...
}
```

**Verify**: `turbo run check --filter=@beep/ui`

---

### Task 4: Update IBorderNode

**File**: `packages/ui/ui/src/flexlayout-react/model/BorderNode.ts`

**Changes**:
```typescript
// Update to accept IModel
static readonly new = (model: IModel, json: UnsafeTypes.UnsafeAny): IBorderNode

// Use ITabNode in fromJson
const child = ITabNode.new(model, jsonChild);
```

**Verify**: `turbo run check --filter=@beep/ui`

---

### Task 5: Update IRowNode

**File**: `packages/ui/ui/src/flexlayout-react/model/RowNode.ts`

**Changes**:
```typescript
// Update to accept IModel, ILayoutWindow
static fromJson(json: UnsafeTypes.UnsafeAny, model: IModel, layoutWindow: ILayoutWindow): IRowNode

// Use ITabSetNode, IRowNode in child creation
if (jsonChild.type === "tabset") {
  const child = ITabSetNode.fromJson(jsonChild, model, layoutWindow);
  ...
} else {
  const child = IRowNode.fromJson(jsonChild, model, layoutWindow);
  ...
}
```

**Verify**: `turbo run check --filter=@beep/ui`

---

### Task 6: Update ILayoutWindow

**File**: `packages/ui/ui/src/flexlayout-react/model/LayoutWindow.ts`

**Changes**:
```typescript
// Update root type
private _root: O.Option<IRowNode> = O.none();

// Update fromJson
static fromJson(windowJson: JsonPopout, model: IModel, windowId: string): ILayoutWindow {
  layoutWindow.setRoot(IRowNode.fromJson(windowJson.layout, model, layoutWindow));
  ...
}
```

**Verify**: `turbo run check --filter=@beep/ui`

---

### Task 7: Update IBorderSet

**File**: `packages/ui/ui/src/flexlayout-react/model/BorderSet.ts`

**Changes**:
```typescript
// Update borders type
private _borders: IBorderNode[] = [];

// Update fromJson
static fromJson(json: UnsafeTypes.UnsafeAny, model: IModel): IBorderSet {
  const border = IBorderNode.fromJson(json[i], model);
  ...
}
```

**Verify**: `turbo run check --filter=@beep/ui`

---

### Task 8: Update IModel

**File**: `packages/ui/ui/src/flexlayout-react/model/Model.ts`

**Changes**:
```typescript
// Update field types
private _borders: O.Option<IBorderSet> = O.none();
private _idMap: Map<string, INode> = new Map();
private _windows: Map<string, ILayoutWindow> = new Map();
private _rootWindow: O.Option<ILayoutWindow> = O.none();

// Update doAction to use I* classes
case Actions.ADD_NODE: {
  const newNode = ITabNode.new(this, action.data.json, true);
  ...
}

case Actions.POPOUT_TABSET: {
  const row = IRowNode.fromJson(json, this, layoutWindow);
  ...
}

// Update fromJson
static fromJson(json: JsonModel): IModel {
  model._borders = O.some(IBorderSet.fromJson(json.borders, model));
  rootWindow.root = IRowNode.fromJson(json.layout, model, ...);
  ...
}
```

**Verify**: `turbo run check --filter=@beep/ui`

---

### Task 9: Remove All Type Assertions

**Search and eliminate ALL `as unknown as` patterns**:
```bash
# Find ALL unsafe type assertions (not just Model and Node)
grep -rn "as unknown as" packages/ui/ui/src/flexlayout-react/model/*.ts
```

**Patterns to eliminate**:
- `as unknown as Model`
- `as unknown as Node`
- `as unknown as TabNode`
- `as unknown as TabSetNode`
- `as unknown as RowNode`
- `as unknown as BorderNode`
- `as unknown as LayoutWindow`
- Any other `as unknown as` patterns

**Replacement strategy**:
1. If types align after P7 refactor → use direct assignment
2. If runtime type narrowing needed → use `S.decodeUnknownSync(IXxx)()` or `S.decodeUnknownEither(IXxx)()`
3. Never leave `as unknown as` in I* classes

---

### Task 10: Final Verification

```bash
# Type check
turbo run check --filter=@beep/ui

# Lint
turbo run lint --filter=@beep/ui

# If lint errors
turbo run lint:fix --filter=@beep/ui

# Verify no remaining unsafe casts in I* classes
grep -rn "as unknown as" packages/ui/ui/src/flexlayout-react/model/*.ts | grep -E "^.*:.*class I|^.*I[A-Z].*as unknown"
# Should return empty for I* class methods

# Alternative: search for any remaining casts
grep -rn "as unknown as" packages/ui/ui/src/flexlayout-react/model/*.ts
# Review results - original classes may still have casts (that's OK), but I* classes should have none
```

---

### Task 11: Update Reflection Log

Add P7 entry to `specs/flexlayout-schemas/REFLECTION_LOG.md`:

```markdown
## 2026-01-XX - P7 Decouple I* Schema Classes

### What Worked
- [Patterns that made decoupling smooth]

### What Didn't Work
- [Any circular import issues? Type inference problems?]

### Pattern Refinements
- Self-referential schema hierarchy
- Import organization for I* classes

### Decisions Made
- [e.g., "Used type imports to avoid circular deps"]
```

---

## Import Pattern for I* Classes

To avoid circular imports, use type imports where possible:

```typescript
// At top of file
import type { IModel } from "./Model";
import type { INode } from "./Node";

// For runtime needs (constructors, static methods)
import { ITabNode } from "./TabNode";
import { IRowNode } from "./RowNode";
```

---

## Success Criteria

- [ ] INode uses IModel (not Model)
- [ ] ITabNode uses IModel (not Model)
- [ ] ITabSetNode uses IModel, ITabNode, ILayoutWindow
- [ ] IBorderNode uses IModel, ITabNode
- [ ] IRowNode uses IModel, ITabSetNode, ILayoutWindow
- [ ] ILayoutWindow uses IModel, IRowNode
- [ ] IBorderSet uses IModel, IBorderNode
- [ ] IModel uses IBorderSet, ILayoutWindow, IRowNode, ITabNode, ITabSetNode, IBorderNode
- [ ] **Zero `as unknown as` type assertions remain in I* classes** (any form)
- [ ] Type narrowing uses `S.decodeUnknownSync()` or `S.decodeUnknownEither()` where needed
- [ ] Type check passes
- [ ] Lint passes
- [ ] Original classes UNCHANGED
- [ ] REFLECTION_LOG.md updated

---

## Troubleshooting & Gotchas

### 1. Property Path Confusion (`this.x` vs `this.data.x`)

I* schema classes have TWO places where properties live:

```typescript
class ITabNode extends S.Class<ITabNode>($I`ITabNode`)({
  data: ITabNodeData,  // Schema data - accessed via this.data.x
}) {
  // Private runtime fields - accessed via this._x
  private _model: O.Option<IModel> = O.none();
  private _parent: O.Option<INode> = O.none();

  // Methods access both:
  getModel() { return O.getOrThrow(this._model); }  // Runtime field
  getName() { return this.data._name; }             // Schema data field
}
```

**Rule of thumb**:
- Schema-serializable data → `this.data.x`
- Runtime-only references (model, parent, children) → `this._x`

---

### 2. Option Wrappers

I* classes use `O.Option<T>` for nullable fields that original classes access directly:

```typescript
// Original class
getModel(): Model { return this._model; }  // Can be undefined!

// I* schema class - MUST unwrap Option
getModel(): IModel { return O.getOrThrow(this._model); }

// Or handle None case
getModelSafe(): O.Option<IModel> { return this._model; }
```

**Common Option operations**:
- `O.getOrThrow(opt)` - Get value or throw
- `O.getOrElse(opt, () => default)` - Get value or default
- `O.map(opt, fn)` - Transform if Some
- `O.isSome(opt)` / `O.isNone(opt)` - Check state

---

### 3. Static Factory Pattern

I* classes use static `new` factory instead of constructors:

```typescript
// ❌ WRONG - Can't call new on Effect Schema class
const node = new ITabNode(model, json);

// ✅ CORRECT - Use static factory
const node = ITabNode.new(model, json);

// ✅ CORRECT - Use static fromJson for deserialization
const node = ITabNode.fromJson(json, model);
```

---

### 4. Circular Import Errors

Use `type` imports for type-only usage:
```typescript
// Type-only import (no runtime dependency)
import type { IModel } from "./Model";

// Runtime import (needed for constructors/static methods)
import { ITabNode } from "./TabNode";
```

---

### 5. Override Keyword for Inherited Methods

Effect Schema base class provides methods like `toString()`. Override requires keyword:

```typescript
// ❌ WRONG - Missing override
toString(): string { return `ITabNode[${this.getId()}]`; }

// ✅ CORRECT
override toString(): string { return `ITabNode[${this.getId()}]`; }
```

---

### 6. Collection Type Updates

All collections referencing original types need updating:

```typescript
// ❌ WRONG - Original types
private _idMap: Map<string, Node> = new Map();
private _children: Node[] = [];
private _changeListeners: ((action: Action) => void)[] = [];

// ✅ CORRECT - I* types
private _idMap: Map<string, INode> = new Map();
private _children: INode[] = [];
// (Action can stay as-is if not refactored)
```

---

### 7. Callback Type Signatures

Callbacks that reference original classes need updating:

```typescript
// ❌ WRONG
private _onAllowDrop: O.Option<(dragNode: Node, dropInfo: DropInfo) => boolean>;

// ✅ CORRECT
private _onAllowDrop: O.Option<(dragNode: INode, dropInfo: DropInfo) => boolean>;
```

---

### 8. Return Type Annotations

Methods returning original types need updating:

```typescript
// ❌ WRONG - Returns original type
getChildren(): Node[] { ... }

// ✅ CORRECT - Returns I* type
getChildren(): INode[] { ... }
```

---

### 9. Method Signature Mismatches

Update BOTH caller and callee together. If you update a method signature:
1. Update the method definition
2. Update ALL call sites
3. Verify before moving on

---

### 10. Missing Exports

Ensure all I* classes are exported:
```typescript
export class ITabNode extends S.Class<ITabNode>(...) { ... }
//     ^^^^^^ Don't forget export!
```

---

### 11. instanceof Checks Don't Work

I* schema classes have different prototypes than original classes:

```typescript
// ❌ WRONG - Won't work with I* classes
if (node instanceof TabNode) { ... }
if (node instanceof Node) { ... }

// ✅ CORRECT - Use type field or schema guards
if (node.getType() === "tab") { ... }
if (S.is(ITabNode)(node)) { ... }
```

---

### 12. Native Array/String Methods (Repo-Wide Rule)

Per CLAUDE.md, NEVER use native methods. This applies in I* classes too:

```typescript
// ❌ WRONG
this._children.map(child => child.getId())
nodeName.split("-")

// ✅ CORRECT
A.map(this._children, child => child.getId())
Str.split(nodeName, "-")
```

---

### 13. JSON Serialization Differences

`toJson()` methods serialize I* class structure, which may differ:

```typescript
// Check that toJson() output matches original format
// May need to access this.data.x for schema fields
toJson(): JsonTabNode {
  return {
    type: "tab",
    name: this.data._name,        // Schema data
    config: this.data._config,    // Schema data
    // ...
  };
}
```

---

### 14. Type Guards Need Updating

Original type guards reference original classes:

```typescript
// ❌ WRONG - Uses original type
function isTabNode(node: Node): node is TabNode { ... }

// ✅ CORRECT - Uses I* type
function isITabNode(node: INode): node is ITabNode {
  return node.getType() === "tab";
}

// ✅ ALSO CORRECT - Schema-based guard
const isITabNode = S.is(ITabNode);
```

---

## On Completion

If P7 succeeds:
1. I* schema classes form a fully independent hierarchy
2. Can be used without any original class references
3. Ready for potential future migration where I* replaces original classes
4. Update REFLECTION_LOG.md with final P7 summary
