# Phase 7 Handoff: Decouple I* Schema Classes from Original Classes

> Created: 2026-01-11
> Previous Phase: P6 (IModel Schema Creation)
> Status: Ready for execution

---

## Critical Rule

**DO NOT MODIFY ORIGINAL CLASSES.** This phase refactors the I* schema classes to reference each other instead of original classes. Original classes remain unchanged.

---

## Context from P6 Completion

### What Was Completed

All 9 schema classes have been created alongside their original counterparts:

| File | Original | Schema Classes | Lines |
|------|----------|---------------|-------|
| Actions.ts | Actions | IActions | 230 |
| Node.ts | Node | INode, INodeData | 345 |
| LayoutWindow.ts | LayoutWindow | ILayoutWindow, ILayoutWindowData | 164 |
| BorderSet.ts | BorderSet | IBorderSet, IBorderSetData | 115 |
| TabNode.ts | TabNode | ITabNode | 473 |
| TabSetNode.ts | TabSetNode | ITabSetNode | 621 |
| BorderNode.ts | BorderNode | IBorderNode | 485 |
| RowNode.ts | RowNode | IRowNode | 657 |
| Model.ts | Model | IModel, IModelData | 742 |

### Current Problem

The I* schema classes currently use **type assertions** to interact with original classes:

```typescript
// In IModel
new TabNode(this as unknown as Model, action.data.json, true);
RowNode.fromJson(json, this as unknown as Model, layoutWindow);
new BorderSet(this as unknown as Model);
model.addNode(this as unknown as Node);
```

This means:
- I* classes are tightly coupled to original classes
- Cannot use I* classes independently
- Type safety is compromised by `as unknown as` casts

### P7 Goal

Refactor all I* schema classes to form a **self-contained parallel hierarchy** that only references other I* classes:

```typescript
// Target pattern
ITabNode.new(this, action.data.json, true);
IRowNode.fromJson(json, this, layoutWindow);
IBorderSet.new(this);
model.addNode(this);  // where model is IModel and this is INode
```

---

## Critical: I* Schema Class Structure Difference

**Original classes** store properties directly:
```typescript
class TabNode {
  private _name: string;
  getName() { return this._name; }  // Direct access
}
```

**I* schema classes** store properties in a `data` field:
```typescript
class ITabNode extends S.Class<ITabNode>($I`ITabNode`)({
  data: ITabNodeData,  // All schema fields here
}) {
  getName() { return this.data._name; }  // Access via data
}
```

### Error Diagnosis Priority

When removing `as unknown as` assertions causes errors, diagnose in this order:

1. **FIRST: Check property path** - Is it `this.x` when it should be `this.data.x`?
   ```typescript
   // ❌ Wrong - original class pattern
   return this._name;

   // ✅ Correct - I* schema class pattern
   return this.data._name;
   ```

2. **SECOND: Check type alignment** - Does the method signature need updating to accept I* types?
   ```typescript
   // ❌ Wrong - accepts original class
   addNode(node: Node): void

   // ✅ Correct - accepts I* class
   addNode(node: INode): void
   ```

3. **ONLY THEN: Consider decode validation** - Is runtime type narrowing actually needed?

---

## Type-Safe Runtime Validation (When Actually Needed)

For cases where runtime type validation IS needed (e.g., narrowing union types, validating external data), use Effect Schema decode functions:

```typescript
// ✅ SAFE - Effect Schema decode with runtime validation
import * as S from "effect/Schema";

// Throws on failure (use when confident)
const parentRow = S.decodeUnknownSync(INode)(this.getParent());

// Returns Either - handle errors gracefully (preferred)
import * as E from "effect/Either";
const result = S.decodeUnknownEither(INode)(this.getParent());
if (E.isRight(result)) {
  const parentRow = result.right;
}
```

**Do NOT use decode functions to paper over property path bugs** - fix the actual issue first.

---

## Scope of Changes

### Files to Modify (I* classes only)

1. **IModel** (Model.ts) - Update to use I* node classes
2. **INode** (Node.ts) - Update model reference to IModel
3. **ITabNode** (TabNode.ts) - Update to use IModel, INode
4. **ITabSetNode** (TabSetNode.ts) - Update to use IModel, INode, ITabNode
5. **IBorderNode** (BorderNode.ts) - Update to use IModel, INode, ITabNode
6. **IRowNode** (RowNode.ts) - Update to use IModel, INode, ITabSetNode
7. **ILayoutWindow** (LayoutWindow.ts) - Update to use IModel, IRowNode
8. **IBorderSet** (BorderSet.ts) - Update to use IModel, IBorderNode

### Type Changes Required

| Current | Target |
|---------|--------|
| `Model` parameter | `IModel` parameter |
| `Node` parameter | `INode` parameter |
| `TabNode` constructor | `ITabNode.new()` |
| `TabSetNode` constructor | `ITabSetNode.new()` |
| `RowNode.fromJson()` | `IRowNode.fromJson()` |
| `BorderNode` constructor | `IBorderNode.new()` |
| `BorderSet` constructor | `IBorderSet.new()` |
| `LayoutWindow` constructor | `ILayoutWindow.new()` |

---

## Dependencies Between I* Classes

```
IModel
  ├── IBorderSet
  │     └── IBorderNode
  │           └── ITabNode
  ├── ILayoutWindow
  │     └── IRowNode
  │           ├── ITabSetNode
  │           │     └── ITabNode
  │           └── IRowNode (recursive)
  └── INode (base for all node types)
```

### Recommended Refactor Order

1. **INode** - Update `_model` type from `Model` to `IModel`
2. **ITabNode** - Update to accept `IModel`
3. **ITabSetNode** - Update to accept `IModel`, use `ITabNode`
4. **IBorderNode** - Update to accept `IModel`, use `ITabNode`
5. **IRowNode** - Update to accept `IModel`, use `ITabSetNode`, `IRowNode`
6. **ILayoutWindow** - Update to accept `IModel`, use `IRowNode`
7. **IBorderSet** - Update to accept `IModel`, use `IBorderNode`
8. **IModel** - Final update to use all I* classes

---

## Key Patterns to Apply

### Parameter Type Update

```typescript
// Before
static fromJson(json: UnsafeTypes.UnsafeAny, model: Model, layoutWindow: LayoutWindow): ITabSetNode

// After
static fromJson(json: UnsafeTypes.UnsafeAny, model: IModel, layoutWindow: ILayoutWindow): ITabSetNode
```

### Constructor Call Update

```typescript
// Before
const newNode = new TabNode(this as unknown as Model, action.data.json, true);

// After
const newNode = ITabNode.new(this, action.data.json, true);
```

### Remove Type Assertions

```typescript
// Before
model.addNode(this as unknown as Node);

// After
model.addNode(this);  // IModel.addNode accepts INode
```

### Private Field Type Update

```typescript
// Before (in INode)
private _model: O.Option<Model> = O.none();

// After
private _model: O.Option<IModel> = O.none();
```

---

## Verification Commands

After each file update:

```bash
# Type check
turbo run check --filter=@beep/ui

# Lint
turbo run lint --filter=@beep/ui

# If lint errors
turbo run lint:fix --filter=@beep/ui
```

---

## Success Criteria

- [ ] All I* classes only reference other I* classes
- [ ] **Zero `as unknown as` type assertions remain in I* classes** (includes `as unknown as Model`, `as unknown as Node`, `as unknown as TabNode`, etc.)
- [ ] No direct use of original class constructors (TabNode, RowNode, etc.) in I* classes
- [ ] Type narrowing uses `S.decodeUnknownSync()` or `S.decodeUnknownEither()` instead of unsafe casts
- [ ] Type check passes
- [ ] Lint passes
- [ ] Original classes remain completely unchanged
- [ ] REFLECTION_LOG.md updated with P7 learnings

---

## Common Gotchas

### 1. Two Property Locations in I* Classes

```typescript
class ITabNode extends S.Class<ITabNode>(...) {
  // RUNTIME fields (private, not serialized) → this._x
  private _model: O.Option<IModel> = O.none();
  private _parent: O.Option<INode> = O.none();

  // SCHEMA data (serializable) → this.data.x
  // (defined in ITabNodeData)
}
```

### 2. Option Wrappers Required

```typescript
// Original: direct access (can be undefined)
getModel(): Model { return this._model; }

// I* class: must unwrap Option
getModel(): IModel { return O.getOrThrow(this._model); }
```

### 3. Static Factory Pattern

```typescript
// ❌ WRONG: new ITabNode(...)
// ✅ CORRECT: ITabNode.new(...) or ITabNode.fromJson(...)
```

### 4. Override Keyword

```typescript
// Effect Schema base class has toString() - must use override
override toString(): string { ... }
```

### 5. Collection Types

```typescript
// ❌ Map<string, Node>  →  ✅ Map<string, INode>
// ❌ Node[]             →  ✅ INode[]
```

### 6. instanceof Doesn't Work

```typescript
// ❌ node instanceof TabNode  - different prototype
// ✅ node.getType() === "tab" - use type field
// ✅ S.is(ITabNode)(node)     - use schema guard
```

### 7. Native Methods Banned (Repo Rule)

```typescript
// ❌ array.map(...)   →  ✅ A.map(array, ...)
// ❌ str.split(...)   →  ✅ Str.split(str, ...)
```

See `P7_ORCHESTRATOR_PROMPT.md` for 14 detailed gotchas with examples.

---

## Risk Mitigation

### Circular Import Risk
- I* classes may have circular imports
- Use `type` imports where possible: `import type { IModel } from "./Model"`
- Consider lazy initialization if needed

### Breaking Changes Risk
- Only modifying I* classes
- Original classes unchanged = original functionality preserved
- I* classes form separate, parallel system

### Type Inference Issues
- May need explicit return type annotations
- Document any remaining type assertions with clear comments

---

## Files Reference

| File | Location |
|------|----------|
| IModel | `packages/ui/ui/src/flexlayout-react/model/Model.ts:742` |
| INode | `packages/ui/ui/src/flexlayout-react/model/Node.ts:345` |
| ITabNode | `packages/ui/ui/src/flexlayout-react/model/TabNode.ts:473` |
| ITabSetNode | `packages/ui/ui/src/flexlayout-react/model/TabSetNode.ts:621` |
| IBorderNode | `packages/ui/ui/src/flexlayout-react/model/BorderNode.ts:485` |
| IRowNode | `packages/ui/ui/src/flexlayout-react/model/RowNode.ts:657` |
| ILayoutWindow | `packages/ui/ui/src/flexlayout-react/model/LayoutWindow.ts:164` |
| IBorderSet | `packages/ui/ui/src/flexlayout-react/model/BorderSet.ts:115` |
