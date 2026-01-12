# P8 Orchestrator Prompt: Complete Decoupling & Remove All Type Casts

You are continuing the FlexLayout Schema migration project. Your goal is to complete the decoupling of I* schema classes from original classes by eliminating all `as unknown as` type assertions.

## Critical Rules

1. **DO NOT MODIFY ORIGINAL CLASSES** - Only modify I* schema classes
2. **VERIFY METHOD PARITY FIRST** - Ensure I* classes have all methods before removing casts
3. **USE SCHEMA GUARDS** - Replace unsafe casts with `S.is()` or `S.decodeUnknownSync()`
4. **TEST INCREMENTALLY** - Run type check after each file modification

## Your Mission

Read `HANDOFF_P8.md` for full context, then execute these tasks in order:

---

## Task 1: Verify and Implement Missing Methods

### Step 1.1: Audit IBorderNode for missing methods

```bash
# Check original BorderNode methods
grep -n "^\s*\(override\s\+\)\?\(canDrop\|drop\|remove\)" packages/ui/ui/src/flexlayout-react/model/BorderNode.ts
```

**Known issue**: `IBorderNode` is missing `canDrop()` method.

### Step 1.2: Implement missing `canDrop` in IBorderNode

Copy from original BorderNode (lines 239-329) and adapt:

```typescript
// Original signature (BorderNode line 239)
override canDrop(dragNode: Node & IDraggable, x: number, y: number): DropInfo | undefined

// I* signature (update types)
override canDrop(dragNode: INode & IDraggable, x: number, y: number): DropInfo | undefined
```

Key adaptations needed:
- Change `Node` to `INode` in parameters
- Change `this.getSelected()` access pattern if needed
- Change child access patterns to use I* types
- Update any internal method calls

### Step 1.3: Audit other I* classes

For each I* class, verify it has these methods from its original:

**IBorderNode** (check against BorderNode):
- [ ] `canDrop()` - MISSING
- [ ] `drop()` - Present at line 665
- [ ] `remove()` - Present at line 767
- [ ] `toJson()` - Present at line 553

**ITabSetNode** (check against TabSetNode):
- [ ] `canDrop()` - Present at line 949
- [ ] `drop()` - Present at line 1045
- [ ] `remove()` - Present at line 1038

**IRowNode** (check against RowNode):
- [ ] `canDrop()` - Present at line 824
- [ ] `drop()` - Present at line 875
- [ ] `tidy()` - Verify present

**INode** (check against Node):
- [ ] `canDrop()` - Present at line 579
- [ ] `findDropTargetNode()` - Present at line 550
- [ ] `forEachNode()` - Present at line 499

**IBorderSet** (check against BorderSet):
- [ ] `findDropTargetNode()` - Present at line 196
- [ ] `forEachNode()` - Present at line 175

---

## Task 2: Create Schema Union Types

Create a new section in an appropriate file (or create `types.ts`):

```typescript
import * as S from "effect/Schema";
import type { ITabSetNode } from "./TabSetNode";
import type { IRowNode } from "./RowNode";
import type { ITabNode } from "./TabNode";
import type { INode } from "./Node";

// For drop operations - I* only
export const ILayoutNode = S.Union(
  S.instanceOf(ITabSetNode),
  S.instanceOf(IRowNode)
);
export type ILayoutNode = typeof ILayoutNode.Type;

// For draggable nodes
export const IDraggableNode = S.Union(
  S.instanceOf(ITabNode),
  S.instanceOf(ITabSetNode),
  S.instanceOf(IRowNode)
);
export type IDraggableNode = typeof IDraggableNode.Type;
```

---

## Task 3: Eliminate Casts File by File

### 3.1 Node.ts (2 casts)

**Line 556**: `model.getMaximizedTabset(windowId)!.canDrop(dragNode as unknown as Node & IDraggable, x, y)`

Analysis: `canDrop` should accept `INode & IDraggable`, not `Node & IDraggable`.

Fix: Ensure `ITabSetNode.canDrop()` signature accepts `INode & IDraggable`:
```typescript
// If ITabSetNode.canDrop already accepts INode, remove the cast:
rtn = model.getMaximizedTabset(windowId)!.canDrop(dragNode, x, y);
```

**Line 607**: Callback type coercion

Fix: Update callback type in method signature.

---

### 3.2 BorderNode.ts (8 casts)

**Line 557**: `this.getChildren().map((child) => (child as unknown as TabNode).toJson())`

Analysis: Children are INode but need ITabNode.toJson()

Fix options:
1. Use schema guard: `S.is(ITabNode)(child) ? child.toJson() : undefined`
2. Cast to ITabNode (preferred if we know children are always ITabNode):
   ```typescript
   this.getChildren().map((child) => {
     if (S.is(ITabNode)(child)) return child.toJson();
     throw new Error("BorderNode child must be ITabNode");
   });
   ```

**Lines 671, 681**: Self-cast `this as unknown as Node`

Analysis: These are comparisons against original class instances.

Fix: These may need interface-based comparison or the comparison logic needs updating.

**Line 691**: `dragNode as unknown as INode`

Analysis: dragNode comes in as a parameter, should already be INode.

Fix: Check method signature - if it accepts `INode & IDraggable`, no cast needed.

---

### 3.3 RowNode.ts (18 casts)

Work through each systematically. Key patterns:

**Self-reference casts** (lines 832-833):
```typescript
const dragAsNode = dragNode as unknown as Node & IDraggable;
const thisAsNode = this as unknown as Node & IDropTarget;
```

These exist because the method interacts with original class system. Solution:
- Ensure IDropTarget interface is properly typed
- Update comparison logic to work with I* types

**Child type narrowing** (lines 976, 1025, 1070, 1079):
```typescript
const c = child as unknown as RowNode | TabSetNode;
```

Solution: Use schema guards or update getChildren() return type.

---

### 3.4 TabSetNode.ts (35 casts) - Most complex

**Layout window casts** (lines 654, 658):
```typescript
layoutWindow.maximizedTabSet = newLayoutNode as unknown as TabSetNode;
```

Analysis: ILayoutWindow should accept ITabSetNode.

Fix: Update ILayoutWindow.maximizedTabSet type to `ITabSetNode | TabSetNode | undefined`.

**Self-comparison casts** (lines 821, 825):
```typescript
this.getModel().getMaximizedTabset(this.getWindowId()) === (this as unknown as TabSetNode)
```

Fix: These comparisons need to work between I* and original types. Options:
1. Compare by ID instead: `this.getModel().getMaximizedTabset(...)?.getId() === this.getId()`
2. Update getMaximizedTabset return type to union

**Drop method casts** (lines 1033-1141):
The drop() method has the most casts. Work through each:
1. Parent access casts
2. Child addition casts
3. Node creation casts (should use I* constructors now)

---

### 3.5 Model.ts (29 casts) - Most impactful

**fromJson casts** (line 826):
```typescript
IRowNode.fromJson(json.layout, model, mainWindow as unknown as LayoutWindow) as unknown as RowNode
```

Analysis: IRowNode.fromJson should return IRowNode, not need cast.

Fix: Update return type usage - consumers should accept IRowNode.

**doAction casts** (lines 849-1070):
Many casts to `Node & IDraggable`, `Node & IDropTarget`, specific node types.

Fix strategy:
1. Update _idMap type from `Map<string, Node>` to `Map<string, INode>`
2. Use schema guards for type narrowing
3. Update method calls to accept I* types

**forEachNode casts** (lines 1255, 1257, 1265, 1267):
```typescript
fn as unknown as (node: Node, level: number) => void
```

Fix: Update forEachNode to accept `(node: INode, level: number) => void`

---

## Common Gotchas

### 1. IDropTarget Interface Uses Original Node Types (CRITICAL)

The `IDropTarget` interface in `IDropTarget.ts` lines 13-25 uses **original `Node` type**, not `INode`:

```typescript
export interface IDropTarget {
  readonly canDrop: (dragNode: Node & IDraggable, ...) => DropInfo | undefined;
  readonly drop: (dragNode: Node & IDraggable, ...) => void;
}
```

However, there's ALSO a schema `DropTarget` class that uses `INode`:
```typescript
export const CanDrop = BS.Fn({
  input: S.Struct({
    dragNode: INode.pipe(S.extend(Draggable)),  // Uses INode!
    ...
  }),
});
```

**Decision needed**: Either update `IDropTarget` interface to use `INode`, OR ensure I* classes implement both interfaces.

### 2. Identity Comparison Will Fail Between I* and Original (CRITICAL)

Code like this will ALWAYS return false if comparing I* to original instances:

```typescript
// In ITabSetNode - this comparison is broken!
return this.getModel().getMaximizedTabset(this.getWindowId()) === (this as unknown as TabSetNode);
```

If `getMaximizedTabset()` returns a `TabSetNode` but `this` is `ITabSetNode`, they're different objects even if representing the same node.

**Fix**: Compare by ID instead of reference:
```typescript
return this.getModel().getMaximizedTabset(this.getWindowId())?.getId() === this.getId();
```

**Affected locations**:
- TabSetNode.ts:821 - `isMaximized()`
- TabSetNode.ts:825 - `isActive()`
- TabSetNode.ts:914 - `canDelete()`
- TabSetNode.ts:955 - drop comparison
- TabSetNode.ts:1065 - dragParent comparison
- BorderNode.ts:681 - dragParent comparison

### 3. Schema Class Property Access

I* classes access schema data via `this.data.x`, not `this._x`:
```typescript
// Original class
return this._name;

// I* class
return this.data._name;
```

### 4. Option Wrappers

I* classes use Effect Option for nullable fields:
```typescript
// Original
getModel(): Model { return this._model; }

// I* class
getModel(): IModel { return O.getOrThrow(this._model); }
```

### 5. Schema Guard Syntax

```typescript
import * as S from "effect/Schema";

// Type guard
if (S.is(ITabNode)(node)) {
  // node is ITabNode here
}

// Decode (throws on failure)
const tabNode = S.decodeUnknownSync(ITabNode)(unknownValue);

// Decode (returns Either)
const result = S.decodeUnknownEither(ITabNode)(unknownValue);
if (E.isRight(result)) {
  const tabNode = result.right;
}
```

### 6. Circular Dependencies

If you encounter circular import issues:
```typescript
// Use type-only import
import type { IModel } from "./Model";

// For runtime usage, may need lazy pattern
const getIModel = () => require("./Model").IModel;
```

### 7. Interface Implementation

Ensure I* classes properly implement interfaces:
```typescript
// IDraggable and IDropTarget should work with I* types
interface IDraggable {
  // ...
}

// ITabSetNode should implement IDropTarget
export class ITabSetNode extends INode.extend<ITabSetNode>(...)
  implements IDropTarget {
  // Must have canDrop(), drop() methods
}
```

### 8. Native Methods Banned

Remember the repo rule - no native array/string methods:
```typescript
// WRONG
array.map(x => x.toJson())

// CORRECT
A.map(array, x => x.toJson())
```

### 9. The _idMap Type in IModel

`IModel._idMap` may be typed as `Map<string, Node>`. It needs to become `Map<string, INode>` or use union type `Map<string, INode | Node>` during transition.

When accessing nodes from the map, type narrowing will be needed:
```typescript
// Current (with cast)
const node = this._idMap.get(id) as unknown as Node;

// Target (with schema guard)
const nodeOrUndef = this._idMap.get(id);
if (nodeOrUndef && S.is(ITabSetNode)(nodeOrUndef)) {
  // nodeOrUndef is ITabSetNode
}
```

### 10. LayoutWindow Fields Store Original Types

`ILayoutWindow` has fields like `maximizedTabSet`, `activeTabSet`, `root` that may store original types. Check if these need to accept I* types:

```typescript
// In ILayoutWindow
maximizedTabSet?: TabSetNode;  // Should this be ITabSetNode?
activeTabSet?: TabSetNode;     // Should this be ITabSetNode?
root?: RowNode;                // Should this be IRowNode?
```

### 11. Method Signature Inheritance

When overriding methods from INode base class, signatures must match. If INode.canDrop takes `INode & IDraggable`, all subclass overrides must too:

```typescript
// INode base
canDrop(dragNode: INode & IDraggable, x: number, y: number): DropInfo | undefined

// ITabSetNode override - MUST match base signature
override canDrop(dragNode: INode & IDraggable, x: number, y: number): DropInfo | undefined
```

### 12. getParent() Returns INode, Not Specific Type

`getParent()` returns `INode | undefined`, but code often needs the specific type:

```typescript
// This won't compile without cast or guard
const parentRow = this.getParent(); // INode | undefined
parentRow.getWindowId(); // Error: getWindowId doesn't exist on INode

// Fix with schema guard
const parent = this.getParent();
if (parent && S.is(IRowNode)(parent)) {
  const windowId = parent.getWindowId(); // OK
}
```

### 13. getChildren() Returns INode[], Needs Narrowing

Similar issue with children:
```typescript
// getChildren() returns INode[]
const children = this.getChildren();
const tabNode = children[0]; // INode, not ITabNode

// Need narrowing for specific operations
A.map(children, (child) => {
  if (S.is(ITabNode)(child)) {
    return child.toJson(); // Now OK
  }
  throw new Error("Expected ITabNode");
});
```

---

## Verification After Each File

```bash
# Type check
turbo run check --filter=@beep/ui

# If errors, diagnose before proceeding
# If passes, continue to next file

# After all changes
turbo run lint:fix --filter=@beep/ui
```

---

## Progress Tracking

After completing each task, update this checklist:

- [ ] Task 1.1: Audit IBorderNode - found missing `canDrop`
- [ ] Task 1.2: Implement `IBorderNode.canDrop()`
- [ ] Task 1.3: Audit other I* classes for missing methods
- [ ] Task 2: Create schema union types
- [ ] Task 3.1: Node.ts casts removed (2)
- [ ] Task 3.2: BorderNode.ts casts removed (8)
- [ ] Task 3.3: RowNode.ts casts removed (18)
- [ ] Task 3.4: TabSetNode.ts casts removed (35)
- [ ] Task 3.5: Model.ts casts removed (29)
- [ ] Final verification: type check passes
- [ ] Final verification: lint passes
- [ ] REFLECTION_LOG.md updated

---

## Expected Outcome

When complete:
1. Zero `as unknown as` casts in any I* class
2. All I* classes form a self-contained parallel hierarchy
3. Type safety maintained through schema guards
4. Original classes completely unchanged
5. I* classes can be used independently of original classes
