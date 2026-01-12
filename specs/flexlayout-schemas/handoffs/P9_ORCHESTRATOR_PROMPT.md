# P9 Orchestrator Prompt: Complete Cast Elimination & Circular Dependency Fixes

> This document provides detailed implementation guidance for Phase 9.
> Read HANDOFF_P9.md first for context and task overview.

---

## Pre-Execution Checklist

Before starting:
- [ ] Read HANDOFF_P9.md completely
- [ ] Read REFLECTION_LOG.md P8 section for context
- [ ] Verify you understand the virtual methods added to INode
- [ ] Verify you know where NodeTypes.ts union types and guards are located

---

## Task 3: Cast Elimination - Detailed Guidance

### 3.1 Node.ts (1 cast)

**Location**: `INode.findDropTargetNode()` around line 556

**Current code**:
```typescript
rtn = model.getMaximizedTabset(windowId)!.canDrop(dragNode as unknown as Node & IDraggable, x, y);
```

**Root cause**: `canDrop()` signature expects `Node & IDraggable`, not `INode & IDraggable`.

**Fix approach**:
1. ITabSetNode.canDrop() already exists and should accept `INode & IDraggable`
2. Verify `IModel.getMaximizedTabset()` returns `ITabSetNode | undefined`
3. Update the call to use I* types directly

**Expected result**:
```typescript
rtn = model.getMaximizedTabset(windowId)!.canDrop(dragNode, x, y);
```

### 3.2 TabNode.ts (2 casts)

**Location 1**: Around line 622 (getSelectedNode)
```typescript
(parent as unknown as ITabSetNode | BorderNode).getSelectedNode()
```

**Fix**:
```typescript
const parent = this.getParent();
if (parent) {
  if (isITabSetNode(parent)) {
    return parent.getSelectedNode();
  }
  if (isIBorderNode(parent)) {
    return parent.getSelectedNode();
  }
}
```

**Location 2**: Around line 834 (remove call)
```typescript
(parent as unknown as ITabSetNode | BorderNode).remove(this as unknown as TabNode)
```

**Fix**:
1. Update `ITabSetNode.remove()` and `IBorderNode.remove()` to accept `ITabNode`
2. Then the call becomes:
```typescript
if (isITabSetNode(parent)) {
  parent.remove(this);
} else if (isIBorderNode(parent)) {
  parent.remove(this);
}
```

### 3.3 BorderNode.ts (15 casts)

Work through systematically. Most fall into these categories:

**Category A: Children → TabNode (most common)**

Pattern locations: ~lines 557, 593, 631, 752
```typescript
// BEFORE:
const child = this.getChildren()[i] as unknown as TabNode;

// AFTER:
const child = this.getChildren()[i];
if (!isITabNode(child)) continue; // or throw if unexpected
// child is now ITabNode
```

**Category B: Self casts for identity**

Pattern locations: ~lines 671, 681
```typescript
// BEFORE:
node === (this as unknown as Node)

// AFTER:
node.getId() === this.getId()
```

**Category C: dragNode parameter**

Pattern location: ~line 691
```typescript
// BEFORE:
drop(dragNode as unknown as INode, ...)

// AFTER:
// Update drop() signature to accept INode directly
drop(dragNode: INode, location: DockLocation, index: number): void
```

### 3.4 RowNode.ts (20 casts)

**Primary areas**: `drop()` and `tidy()` methods

**Category A: Child narrowing in loops**

```typescript
// BEFORE:
const child = this.getChildren()[i] as unknown as RowNode | TabSetNode;

// AFTER:
const child = this.getChildren()[i];
if (!child) continue;
if (isIRowNode(child)) {
  // handle RowNode case
} else if (isITabSetNode(child)) {
  // handle TabSetNode case
}
```

**Category B: New node creation**

The P8 work already updated these to use `IRowNode.new()` and `ITabSetNode.new()`.
Verify no casts remain around node creation.

**Category C: Parent type narrowing**

```typescript
// BEFORE:
const parent = this.getParent() as unknown as RowNode;

// AFTER:
const parent = this.getParent();
if (!parent || !isIRowNode(parent)) {
  throw new Error("Expected IRowNode parent");
}
// parent is IRowNode
```

### 3.5 Model.ts (20 casts)

**Primary area**: `doAction()` switch statement

For each action case, identify the cast and apply the appropriate fix:

**Pattern A: Node lookup and narrowing**

```typescript
// BEFORE:
const node = this._idMap.get(action.data.node) as unknown as TabNode;

// AFTER:
const nodeRaw = this._idMap.get(action.data.node);
if (!nodeRaw || !isITabNode(nodeRaw)) {
  throw new Error("Expected ITabNode");
}
const node = nodeRaw; // TypeScript now knows it's ITabNode
```

**Pattern B: forEachNode callback**

```typescript
// BEFORE:
forEachNode(fn as unknown as (node: Node, level: number) => void)

// AFTER:
// Signature already accepts (node: INode, level: number) => void
forEachNode(fn);
```

### 3.6 TabSetNode.ts (30 casts)

**Most complex file. Work through methodically.**

**Category A: Children collection**

ITabSetNode children are always ITabNode. Consider updating:
```typescript
// Add method to ITabSetNode:
getTabChildren(): ITabNode[] {
  return this.getChildren().filter(isITabNode);
}
```

Then replace casts:
```typescript
// BEFORE:
this.getChildren()[selected] as unknown as TabNode

// AFTER:
this.getTabChildren()[selected]
```

**Category B: Identity comparisons**

Multiple locations compare `this` to results from model:
```typescript
// BEFORE:
this.getModel().getMaximizedTabset() === (this as unknown as TabSetNode)

// AFTER:
this.getModel().getMaximizedTabset()?.getId() === this.getId()
```

**Category C: layoutWindow casts**

Should be fixed by P8 Task 0. Verify and remove if present.

---

## Task 4: Interface Type Updates

### 4.1 Review Current IDraggable

Location: `packages/ui/ui/src/flexlayout-react/model/IDraggable.ts`

Check if it uses `Node` type. If so, consider:
1. Creating `IIDraggable` with `INode` type
2. OR using union `Node | INode`
3. OR removing interface and using duck typing

### 4.2 Review Current IDropTarget

Location: `packages/ui/ui/src/flexlayout-react/model/IDropTarget.ts`

The schema `DropTarget` class already exists. Options:
1. Have I* classes extend/implement schema DropTarget
2. Update interface to use I* types
3. Use structural typing (no implements clause)

---

## Task 5: Circular Dependency Fixes

### Step 1: Identify All Cycles

```bash
turbo run lint:circular --filter=@beep/ui 2>&1 | grep "Circular"
```

### Step 2: Categorize Cycles

Create list:
```
| Cycle | Files Involved | Type |
|-------|---------------|------|
| 1 | BorderNode → Model → BorderSet → BorderNode | model-only |
| 2 | TabSetNode → Utils.tsx → Layout.tsx | model→view |
| ... | ... | ... |
```

### Step 3: Fix Model-Only Cycles First

For cycles entirely within model layer:

1. **Convert to type-only imports**:
```typescript
// In BorderNode.ts:
import type { Model } from "./Model";  // type-only

// But keep if used at runtime:
import { Model } from "./Model";  // needed for Model.fromJson()
```

2. **Extract shared types to types.ts**:
```typescript
// packages/ui/ui/src/flexlayout-react/model/types.ts
export type { INode } from "./Node";
export type { ITabNode } from "./TabNode";
// ... etc
```

3. **Import from types.ts instead**:
```typescript
import type { ITabNode, ITabSetNode } from "./types";
```

### Step 4: Fix Model→View Cycles

These are harder. Investigate:

1. **What does TabSetNode import from view?**
```bash
grep -n "from.*view" packages/ui/ui/src/flexlayout-react/model/TabSetNode.ts
```

2. **Why?** Usually for utility functions. Options:
   - Move utility into model layer
   - Pass as callback/parameter
   - Use dependency injection

3. **Apply fix and verify**:
```bash
turbo run lint:circular --filter=@beep/ui
```

### Step 5: Verify Zero Cycles

Target output:
```
Found 0 circular dependencies!
```

---

## Verification After Each Task

### After Task 3 (each file):
```bash
turbo run check --filter=@beep/ui
```

### After Task 4:
```bash
turbo run check --filter=@beep/ui
turbo run lint --filter=@beep/ui
```

### After Task 5:
```bash
turbo run lint:circular --filter=@beep/ui
turbo run check --filter=@beep/ui
turbo run lint --filter=@beep/ui
```

---

## Common Errors and Fixes

### Error: TS2322 - Type 'X' is not assignable to type 'Y'

**Cause**: Type mismatch after removing cast

**Fix**: Either:
1. Update method signature to accept broader type
2. Add proper type guard before call
3. Verify the types should actually be compatible

### Error: TS2339 - Property 'X' does not exist on type 'Y'

**Cause**: Type guard not properly narrowing

**Fix**: Verify type guard is applied before property access:
```typescript
if (isITabSetNode(node)) {
  node.getWeight(); // OK - TypeScript knows node has this method
}
```

### Error: TS7006 - Parameter 'x' implicitly has an 'any' type

**Cause**: Callback type not inferred

**Fix**: Add explicit type annotation:
```typescript
forEachNode((node: INode, level: number) => { ... });
```

### Error: Circular dependency detected

**Cause**: Import creates cycle

**Fix**:
1. If type-only: `import type { X }`
2. If runtime: move to types.ts or restructure

---

## Reflection Log Entry Template

After completing P9, add to REFLECTION_LOG.md:

```markdown
### 2026-01-XX - P9: Complete Cast Elimination

#### What Worked

1. **[Pattern that succeeded]** - Description

2. **[Another success]** - Description

#### What Didn't Work Initially

1. **[Issue]** - How it was resolved

#### Pattern Refinements

1. **[Pattern name]**:
   ```typescript
   // Code example
   ```

#### Cast Elimination Progress

| Phase | Cast Count | Change |
|-------|------------|--------|
| After Task 2 | 88 | - |
| After Task 3 | X | -Y |

#### Files Modified

| File | Changes |
|------|---------|
| ... | ... |

#### Verification Results

```
✓ turbo run check --filter=@beep/ui - X tasks successful
✓ turbo run lint --filter=@beep/ui - X tasks successful
✓ turbo run lint:circular --filter=@beep/ui - 0 circular dependencies
✓ All 88 casts eliminated
```

---
```

---

## Success Checklist

- [ ] Node.ts: 1 cast → 0 casts
- [ ] TabNode.ts: 2 casts → 0 casts
- [ ] BorderNode.ts: 15 casts → 0 casts
- [ ] RowNode.ts: 20 casts → 0 casts
- [ ] Model.ts: 20 casts → 0 casts
- [ ] TabSetNode.ts: 30 casts → 0 casts
- [ ] Interface types updated (IDraggable, IDropTarget)
- [ ] Circular dependencies: 54 → 0
- [ ] `turbo run check --filter=@beep/ui` passes
- [ ] `turbo run lint --filter=@beep/ui` passes
- [ ] REFLECTION_LOG.md updated with P9 learnings
- [ ] Original classes remain UNCHANGED
