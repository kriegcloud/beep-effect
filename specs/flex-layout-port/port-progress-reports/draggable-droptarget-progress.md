# Port Progress Report: IDraggable.ts and IDropTarget.ts

## Overview

This report compares the original FlexLayout interface files with their Effect-based ports.

| File | Original | Port | Status |
|------|----------|------|--------|
| IDraggable | `tmp/FlexLayout/src/model/IDraggable.ts` | `packages/ui/ui/src/flex-layout/model/draggable.ts` | **Complete** |
| IDropTarget | `tmp/FlexLayout/src/model/IDropTarget.ts` | `packages/ui/ui/src/flex-layout/model/drop-target.ts` | **Partial** |

---

## IDraggable Analysis

### Original Interface

```typescript
export interface IDraggable {
    /** @internal */
    isEnableDrag(): boolean;
    /** @internal */
    getName(): string | undefined;
}
```

### Port Interface

```typescript
export interface IDraggable {
  /** Returns true if this node can be dragged by the user */
  readonly isEnableDrag: () => boolean;
  /** Returns the display name of this draggable node */
  readonly getName: () => string | undefined;
}
```

### IDraggable Method Comparison

| Method | Original | Port | Status |
|--------|----------|------|--------|
| `isEnableDrag()` | `boolean` | `() => boolean` | **Ported** |
| `getName()` | `string \| undefined` | `() => string \| undefined` | **Ported** |

### IDraggable Enhancements in Port

1. **Type Refinement Predicate**: Added `isDraggable` duck-typing predicate for runtime type checking
2. **Schema Class**: Added `Draggable` schema class with `BS.Fn`-based method schemas
3. **Namespace Exports**: Added type namespace for `Type` and `Encoded` type exports
4. **Documentation**: Enhanced JSDoc comments with detailed descriptions
5. **Readonly Properties**: Methods declared as `readonly` for immutability guarantees

### IDraggable Assessment: **Complete**

All original interface methods are ported with enhanced Effect-idiomatic additions.

---

## IDropTarget Analysis

### Original Interface

```typescript
import { DockLocation } from "../DockLocation";
import { DropInfo } from "../DropInfo";
import { IDraggable } from "./IDraggable";
import { Node } from "./Node";

export interface IDropTarget {
    /** @internal */
    canDrop(dragNode: Node & IDraggable, x: number, y: number): DropInfo | undefined;
    /** @internal */
    drop(dragNode: Node & IDraggable, location: DockLocation, index: number, select?: boolean): void;
    /** @internal */
    isEnableDrop(): boolean;
}
```

### Port Interface

```typescript
export interface IDropTarget {
  readonly canDrop: (dragNode: IDraggable, x: number, y: number) => DropInfo | undefined;
  readonly drop: (dragNode: IDraggable, location: DockLocation, index: number, select?: boolean) => void;
  readonly isEnableDrop: () => boolean;
}
```

### IDropTarget Method Comparison

| Method | Original Signature | Port Signature | Status |
|--------|-------------------|----------------|--------|
| `canDrop` | `(dragNode: Node & IDraggable, x, y)` | `(dragNode: IDraggable, x, y)` | **Type Simplified** |
| `drop` | `(dragNode: Node & IDraggable, location, index, select?)` | `(dragNode: IDraggable, location, index, select?)` | **Type Simplified** |
| `isEnableDrop` | `(): boolean` | `() => boolean` | **Ported** |

### IDropTarget Type Difference Analysis

#### Critical Finding: `Node & IDraggable` vs `IDraggable`

The original interface uses intersection type `Node & IDraggable` for `dragNode` parameter:

```typescript
// Original
canDrop(dragNode: Node & IDraggable, x: number, y: number): DropInfo | undefined;
drop(dragNode: Node & IDraggable, location: DockLocation, index: number, select?: boolean): void;
```

The port simplifies to just `IDraggable`:

```typescript
// Port
canDrop: (dragNode: IDraggable, x: number, y: number) => DropInfo | undefined;
drop: (dragNode: IDraggable, location: DockLocation, index: number, select?: boolean) => void;
```

**Impact Assessment:**

The original `Node` class provides critical methods used in drop operations:

| Node Method | Used In Drop Operations | Impact of Missing |
|-------------|------------------------|-------------------|
| `getId()` | Tab identification, insertion | **High** |
| `getType()` | Type discrimination ("tab", "tabset", etc.) | **High** |
| `getParent()` | Tree traversal | **Medium** |
| `getChildren()` | Child management | **Medium** |
| `getRect()` | Position calculations | **High** |
| `getModel()` | Model access | **High** |
| `getOrientation()` | Layout direction | **Medium** |
| `toJson()` | Serialization | **Medium** |

**Recommendation:** The port's simplification may be intentional for a more decoupled design, but implementing classes (TabSetNode, RowNode, BorderNode) will need to handle the Node-specific operations internally rather than relying on the interface contract.

### IDropTarget Enhancements in Port

1. **Type Refinement Predicate**: Added `isDropTarget` duck-typing predicate
2. **Schema Class**: Added `DropTarget` schema class with `BS.Fn`-based method schemas
3. **Namespace Exports**: Added type namespace for `Type` and `Encoded`
4. **Documentation**: Enhanced JSDoc with parameter descriptions
5. **Readonly Properties**: Methods declared as `readonly`

### IDropTarget Schema Class Analysis

```typescript
export class DropTarget extends S.Class<DropTarget>($I`DropTarget`)(
  {
    canDrop: BS.Fn({
      input: S.Tuple(Draggable, S.Number, S.Number),
      output: S.UndefinedOr(DropInfo),
    }),
    drop: BS.Fn({
      input: S.Tuple(Draggable, DockLocation, S.Number, S.UndefinedOr(S.Boolean)),
      output: S.Void,
    }),
    isEnableDrop: BS.Fn({
      output: S.Boolean,
    }),
  },
  ...
)
```

**Schema Observations:**
- Uses `Draggable` schema class (not the interface) for input validation
- This is consistent with the simplified interface approach
- Schema validation will work for runtime checks but may miss Node-specific validations

### IDropTarget Assessment: **Partial**

The interface is structurally complete but uses simplified types that may require additional handling in implementing classes.

---

## Dependencies Mapping

### IDraggable Dependencies

| Original Import | Port Import | Status |
|-----------------|-------------|--------|
| (none) | `@beep/identity/packages` | **Added** |
| (none) | `@beep/schema` | **Added** |
| (none) | `effect/Predicate` | **Added** |
| (none) | `effect/Schema` | **Added** |

### IDropTarget Dependencies

| Original Import | Port Import | Status |
|-----------------|-------------|--------|
| `../DockLocation` | `../dock-location` | **Mapped** |
| `../DropInfo` | `../drop-info` | **Mapped** |
| `./IDraggable` | `./draggable` | **Mapped** |
| `./Node` | (not imported) | **Removed** |
| (none) | `@beep/identity/packages` | **Added** |
| (none) | `@beep/schema` | **Added** |
| (none) | `effect/Predicate` | **Added** |
| (none) | `effect/Schema` | **Added** |

---

## Recommendations

### 1. Evaluate Node Type Requirement

The removal of `Node` from the intersection type needs careful consideration:

**Option A: Keep Simplified (Current)**
- Pros: More decoupled, cleaner interface contract
- Cons: Implementing classes must handle Node operations internally

**Option B: Restore Intersection Type**
- Would require creating a ported `INode` interface or using the schema-based `Node` type
- Would need: `dragNode: NodeType<{}> & IDraggable` or similar

**Suggested Approach:** If the implementing classes (TabNode, TabSetNode) already extend a Node base and implement IDraggable, the current simplified approach is valid since TypeScript will infer the full type at usage sites.

### 2. Verify Schema Consistency

The `DropTarget` schema class uses `Draggable` schema class for input validation:

```typescript
canDrop: BS.Fn({
  input: S.Tuple(Draggable, S.Number, S.Number),
  ...
})
```

Verify that:
- `Draggable` schema class accurately represents runtime draggable objects
- Schema validation doesn't reject valid TabNode/TabSetNode instances

### 3. Test Runtime Type Guards

Add tests for the predicate functions:

```typescript
// draggable.ts
isDraggable(tabNode) // should return true
isDraggable(tabSetNode) // should return true
isDraggable({}) // should return false

// drop-target.ts
isDropTarget(tabSetNode) // should return true
isDropTarget(rowNode) // should return true
isDropTarget(borderNode) // should return true
isDropTarget(tabNode) // should return false (tabs can't receive drops)
```

---

## Summary

| File | Interface Methods | Schema Class | Type Guard | Types Match | Overall |
|------|------------------|--------------|------------|-------------|---------|
| IDraggable | 2/2 (100%) | Yes | Yes | Yes | **Complete** |
| IDropTarget | 3/3 (100%) | Yes | Yes | Simplified | **Partial** |

### Outstanding Items

1. **[REVIEW]** Confirm that simplified `IDraggable` type (vs `Node & IDraggable`) is acceptable for all use cases
2. **[TEST]** Add unit tests for `isDraggable` and `isDropTarget` predicates
3. **[DOC]** Document the intentional type simplification if kept

---

*Generated: 2026-01-10*
*Files Analyzed: 4*
*Port Location: `packages/ui/ui/src/flex-layout/model/`*
