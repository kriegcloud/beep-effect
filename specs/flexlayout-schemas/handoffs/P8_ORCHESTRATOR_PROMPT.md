# P8 Orchestrator Prompt: Complete Decoupling & Remove All Type Casts

You are continuing the FlexLayout Schema migration project. Your goal is to complete the decoupling of I* schema classes from original classes by eliminating all `as unknown as` type assertions.

## Critical Rules

1. **DO NOT MODIFY ORIGINAL CLASSES** - Only modify I* schema classes
2. **VERIFY METHOD PARITY FIRST** - Ensure I* classes have all methods before removing casts
3. **USE SCHEMA GUARDS** - Replace unsafe casts with `S.is()` or `S.decodeUnknownSync()`
4. **TEST INCREMENTALLY** - Run type check after each file modification

---

## Sub-Agent Usage (REQUIRED)

**Use the Task tool to spawn sub-agents for complex tasks.** This improves reliability and allows parallel execution.

### Recommended Agent Types

| Agent Type | When to Use |
|------------|-------------|
| `effect-code-writer` | Writing/modifying Effect schema code (I* classes) |
| `package-error-fixer` | After changes, to fix type/build/lint errors |
| `Explore` | Searching codebase for patterns, usage sites |
| `general-purpose` | Complex multi-step tasks, research |

### Sub-Agent Prompt Pattern

Each task below includes a **Sub-agent prompt** block. Copy the prompt and use it with the Task tool:

```typescript
// Example Task tool usage:
Task({
  subagent_type: "effect-code-writer",
  description: "Update ILayoutWindow stored types",
  prompt: "<paste the sub-agent prompt here>"
})
```

### Parallel Execution

Tasks within the same step can run in parallel. For example:
- Task 0.1 and 0.2 can run in parallel (different files)
- Task 3.1-3.6 can run in parallel (independent files)

---

## Your Mission

Read `HANDOFF_P8.md` for full context, then execute these tasks in order:

---

## Task 0: Fix Root Causes - Update Stored Types (DO THIS FIRST)

**Why first?** ILayoutWindow and IBorderSet store original types. Fixing these will naturally eliminate many downstream casts.

### Step 0.1: Update ILayoutWindow to Store I* Types

**Sub-agent prompt** (use `effect-code-writer`):
```
Read packages/ui/ui/src/flexlayout-react/model/LayoutWindow.ts

In ILayoutWindow class:
1. Change `private _root: O.Option<RowNode>` to `O.Option<IRowNode>` (line ~172)
2. Change `private _maximizedTabSet: O.Option<TabSetNode>` to `O.Option<ITabSetNode>` (line ~173)
3. Change `private _activeTabSet: O.Option<TabSetNode>` to `O.Option<ITabSetNode>` (line ~174)
4. Update ALL corresponding getters to return I* types
5. Update ALL corresponding setters to accept I* types

DO NOT modify the original LayoutWindow class.
Run type check after changes: turbo run check --filter=@beep/ui
```

In `LayoutWindow.ts`, change the private fields to use I* types:

```typescript
// BEFORE (lines 172-174):
private _root: O.Option<RowNode> = O.none();
private _maximizedTabSet: O.Option<TabSetNode> = O.none();
private _activeTabSet: O.Option<TabSetNode> = O.none();

// AFTER:
private _root: O.Option<IRowNode> = O.none();
private _maximizedTabSet: O.Option<ITabSetNode> = O.none();
private _activeTabSet: O.Option<ITabSetNode> = O.none();
```

Then update ALL corresponding getters and setters:
- `get root(): IRowNode | undefined`
- `get maximizedTabSet(): ITabSetNode | undefined`
- `get activeTabSet(): ITabSetNode | undefined`
- `setRoot(value: IRowNode | undefined)`
- `setMaximizedTabSet(value: ITabSetNode | undefined)`
- `setActiveTabSet(value: ITabSetNode | undefined)`

**Critical**: This will cause `IModel.getMaximizedTabset()` and `IModel.getRoot()` to return I* types, eliminating many downstream casts.

### Step 0.2: Update IBorderSet to Store I* Types

**Sub-agent prompt** (use `effect-code-writer`):
```
Read packages/ui/ui/src/flexlayout-react/model/BorderSet.ts

In IBorderSet class:
1. Change `private _borders: BorderNode[]` to `IBorderNode[]` (line ~121)
2. Change `private _borderMap: Map<DockLocation, BorderNode>` to `Map<DockLocation, IBorderNode>` (line ~122)
3. Update `getBorders()` return type to `IBorderNode[]`
4. Update `getBorderMap()` return type to `Map<DockLocation, IBorderNode>`
5. Fix the cast at line ~139 in fromJson - should no longer need cast after type change

DO NOT modify the original BorderSet class.
Run type check after changes: turbo run check --filter=@beep/ui
```

In `BorderSet.ts`, change the private fields to use I* types:

```typescript
// BEFORE (lines 121-122):
private _borders: BorderNode[] = [];
private _borderMap: Map<DockLocation, BorderNode> = new Map();

// AFTER:
private _borders: IBorderNode[] = [];
private _borderMap: Map<DockLocation, IBorderNode> = new Map();
```

Then update ALL corresponding getters:
- `getBorders(): IBorderNode[]`
- `getBorderMap(): Map<DockLocation, IBorderNode>`

### Step 0.3: Update fromJson Method Signatures

In `IRowNode` and `ITabSetNode`, change the `layoutWindow` parameter type:

```typescript
// BEFORE:
static fromJson(json: ..., model: IModel, layoutWindow: LayoutWindow): IRowNode

// AFTER:
static fromJson(json: ..., model: IModel, layoutWindow: ILayoutWindow): IRowNode
```

Same for `ITabSetNode.fromJson`.

### Step 0.4: Update Method Signatures to Use I* Types

Update these method signatures to use I* types instead of original types:

```typescript
// IBorderSet:
forEachNode(fn: (node: INode, level: number) => void): void  // was Node
findDropTargetNode(dragNode: INode & IDraggable, x: number, y: number): DropInfo | undefined  // was Node

// ILayoutWindow:
visitNodes(fn: (node: INode, level: number) => void): void  // was Node

// IRowNode:
drop(dragNode: INode, location: DockLocation, index: number): void  // was Node

// ITabSetNode:
drop(dragNode: INode, ...): void  // was Node
remove(node: ITabNode): void  // was TabNode

// IBorderNode:
drop(dragNode: INode & IDraggable, ...): void  // was Node & IDraggable
remove(node: ITabNode): void  // was TabNode
```

### Step 0.5: Fix IModel.doAction to Use IRowNode.fromJson

**Sub-agent prompt** (use `effect-code-writer`):
```
Read packages/ui/ui/src/flexlayout-react/model/Model.ts lines 900-1000

In IModel.doAction() method, replace RowNode.fromJson with IRowNode.fromJson at these locations:
- Line ~925 (POPOUT_TAB case): Change `RowNode.fromJson(json, this as unknown as Model, layoutWindow as unknown as LayoutWindow)` to `IRowNode.fromJson(json, this, layoutWindow)`
- Line ~963 (POPOUT_TABSET case): Same change
- Line ~993 (CREATE_WINDOW case): Same change

After Task 0.1-0.3 are complete, these lines should need NO casts.
Run type check after changes: turbo run check --filter=@beep/ui
```

IModel.doAction() still calls `RowNode.fromJson` (original) instead of `IRowNode.fromJson`. Fix these three locations:

```typescript
// Line 925 (POPOUT_TAB case) - BEFORE:
const row = RowNode.fromJson(json, this as unknown as Model, layoutWindow as unknown as LayoutWindow);
// AFTER:
const row = IRowNode.fromJson(json, this, layoutWindow);

// Line 963 (POPOUT_TABSET case) - BEFORE:
layoutWindow.setRoot(
  RowNode.fromJson(json, this as unknown as Model, layoutWindow as unknown as LayoutWindow)
);
// AFTER:
layoutWindow.setRoot(
  IRowNode.fromJson(json, this, layoutWindow)
);

// Line 993 (CREATE_WINDOW case) - BEFORE:
layoutWindow.setRoot(
  RowNode.fromJson(action.data.layout, this as unknown as Model, layoutWindow as unknown as LayoutWindow)
);
// AFTER:
layoutWindow.setRoot(
  IRowNode.fromJson(action.data.layout, this, layoutWindow)
);
```

### Step 0.6: Run Type Check

```bash
turbo run check --filter=@beep/ui
```

After Task 0, re-count remaining casts - many should be naturally eliminated.

---

## Task 1: Verify and Implement Missing Methods (DO THIS SECOND)

### Step 1.1: Audit IBorderNode for missing methods

```bash
# Check original BorderNode methods
grep -n "^\s*\(override\s\+\)\?\(canDrop\|drop\|remove\)" packages/ui/ui/src/flexlayout-react/model/BorderNode.ts
```

**Known issue**: `IBorderNode` is missing `canDrop()` method.

### Step 1.2: Implement missing `canDrop` in IBorderNode

**Sub-agent prompt** (use `effect-code-writer`):
```
Read packages/ui/ui/src/flexlayout-react/model/BorderNode.ts lines 239-329

The original BorderNode has a canDrop() method that IBorderNode is missing.

1. Copy the canDrop method from BorderNode (lines 239-329)
2. Add it to IBorderNode class
3. Update the signature: `override canDrop(dragNode: INode & IDraggable, x: number, y: number): DropInfo | undefined`
4. Update internal references to use I* types
5. Replace any `this as unknown as` casts with proper I* type usage

DO NOT modify the original BorderNode class.
Run type check after changes: turbo run check --filter=@beep/ui
```

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

### 3.2 TabNode.ts (2 casts) - NEWLY IDENTIFIED

**Line 622**: `(parent as unknown as ITabSetNode | BorderNode).getSelectedNode()`

Analysis: ITabNode calls `getSelectedNode()` on parent, but `getParent()` returns `INode | undefined`.

Fix: Use schema guard:
```typescript
const parent = this.getParent();
if (parent && (S.is(ITabSetNode)(parent) || S.is(IBorderNode)(parent))) {
  const selectedNode = parent.getSelectedNode();
}
```

**Line 834**: `(parent as unknown as ITabSetNode | BorderNode).remove(this as unknown as TabNode)`

Analysis: ITabNode needs to call `remove()` on parent and pass itself.

Fix: After Task 0.4 updates `remove()` signatures to accept `ITabNode`:
```typescript
const parent = this.getParent();
if (parent && (S.is(ITabSetNode)(parent) || S.is(IBorderNode)(parent))) {
  parent.remove(this);
}
```

---

### 3.3 BorderNode.ts (9 casts)

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

### 3.4 RowNode.ts (22 casts)

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

### 3.5 TabSetNode.ts (36 casts) - Most complex

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

### 3.6 Model.ts (32 casts) - Most impactful

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

## Task 4: Fix Circular Dependencies (CRITICAL)

**54 circular dependencies exist** in the flexlayout-react code. These MUST be resolved.

### Verification Command

```bash
turbo run lint:circular --filter=@beep/ui
# Currently fails with "Found 54 circular dependencies!"
# Target: "Found 0 circular dependencies!"
```

### Core Circular Cycles

1. **Model Layer Cycles** (highest priority):
   - `BorderNode → Model → BorderSet → BorderNode`
   - `Model → LayoutWindow → RowNode → TabSetNode → TabNode → Model`
   - `TabSetNode → Utils (model) → TabSetNode`

2. **View Layer Cycles**:
   - `TabSetNode → Utils.tsx (view) → Layout.tsx → components → TabSetNode`
   - `Layout.tsx → BorderTab.tsx → Splitter.tsx → Layout.tsx`
   - `Layout.tsx → Row.tsx → TabSet.tsx → TabButton.tsx → Layout.tsx`

### Fix Strategies

#### Strategy 1: Extract Shared Types to `types.ts`

**Sub-agent prompt** (use `effect-code-writer`):
```
Create packages/ui/ui/src/flexlayout-react/model/types.ts

Move these shared types from individual files:
1. Union types (ILayoutNode, IDraggableNode, etc.)
2. Shared interfaces (if any are duplicated)
3. Type guards that don't need runtime class references

Update imports in Model.ts, BorderNode.ts, RowNode.ts, TabSetNode.ts, TabNode.ts, LayoutWindow.ts, BorderSet.ts, Node.ts to import from types.ts instead of cross-importing.

Run: turbo run lint:circular --filter=@beep/ui
```

#### Strategy 2: Use Type-Only Imports

Change runtime imports to type-only where the import is only used for type annotations:

```typescript
// BEFORE (creates runtime circular dependency):
import { TabSetNode } from "./TabSetNode";

// AFTER (breaks circular dependency):
import type { TabSetNode } from "./TabSetNode";
```

Audit each model file for imports that can be converted to `import type`.

#### Strategy 3: Break View ↔ Model Coupling

`TabSetNode.ts` imports `view/Utils.tsx` which imports `Layout.tsx`, creating a massive cycle.

Options:
1. Move the required utility function from view/Utils.tsx to model/Utils.ts
2. Pass the utility as a parameter instead of importing
3. Create a shared module that both can import without circular deps

#### Strategy 4: Create Barrel Index with Correct Order

```typescript
// packages/ui/ui/src/flexlayout-react/model/index.ts
// Export in dependency order (least dependent first):
export * from "./types";
export * from "./Node";
export * from "./TabNode";
export * from "./TabSetNode";
export * from "./RowNode";
export * from "./BorderNode";
export * from "./BorderSet";
export * from "./LayoutWindow";
export * from "./Model";
```

Then update imports to use the barrel file where appropriate.

#### Strategy 5: Lazy Initialization (Last Resort)

For runtime references that can't be avoided:

```typescript
let _ModelClass: typeof Model | undefined;
const getModelClass = () => _ModelClass ?? (_ModelClass = require("./Model").Model);
```

### Expected Order of Fixes

1. **Start with type-only imports** - Quick wins, no code changes
2. **Create types.ts** - Centralize shared types
3. **Break model → view imports** - TabSetNode.ts → view/Utils.tsx is critical
4. **Address model-layer cycles** - May require more extensive refactoring

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

### Using package-error-fixer Agent

If type check fails with multiple errors, use the `package-error-fixer` agent:

**Sub-agent prompt** (use `package-error-fixer`):
```
Fix all type errors, build errors, and lint issues in @beep/ui package.

Context: We are decoupling I* schema classes from original classes in the flexlayout-react model.
DO NOT modify original classes (BorderNode, RowNode, TabSetNode, TabNode, Node, Model, LayoutWindow, BorderSet).
Only modify I* classes (IBorderNode, IRowNode, ITabSetNode, ITabNode, INode, IModel, ILayoutWindow, IBorderSet).

Run: turbo run check --filter=@beep/ui
Fix any type errors that appear.
```

---

## Progress Tracking

After completing each task, update this checklist:

- [ ] Task 0.1: Update ILayoutWindow to store I* types (_root, _maximizedTabSet, _activeTabSet)
- [ ] Task 0.2: Update IBorderSet to store I* types (_borders, _borderMap)
- [ ] Task 0.3: Update IRowNode.fromJson and ITabSetNode.fromJson to accept ILayoutWindow
- [ ] Task 0.4: Update method signatures to use I* types (forEachNode, findDropTargetNode, drop, remove)
- [ ] Task 0.5: Fix IModel.doAction to use IRowNode.fromJson (lines 925, 963, 993)
- [ ] Task 0.6: Run type check - count remaining casts after Task 0
- [ ] Task 1.1: Audit IBorderNode - found missing `canDrop`
- [ ] Task 1.2: Implement `IBorderNode.canDrop()`
- [ ] Task 1.3: Audit other I* classes for missing methods
- [ ] Task 2: Create schema union types
- [ ] Task 3.1: Node.ts casts removed (2)
- [ ] Task 3.2: TabNode.ts casts removed (2) - NEWLY IDENTIFIED
- [ ] Task 3.3: BorderNode.ts casts removed (9)
- [ ] Task 3.4: RowNode.ts casts removed (22)
- [ ] Task 3.5: TabSetNode.ts casts removed (36)
- [ ] Task 3.6: Model.ts casts removed (32)
- [ ] LayoutWindow.ts cast removed (1) - should be fixed by Task 0
- [ ] BorderSet.ts cast removed (1) - should be fixed by Task 0
- [ ] Task 4.1: Convert runtime imports to type-only imports where possible
- [ ] Task 4.2: Create types.ts with shared types
- [ ] Task 4.3: Break TabSetNode → view/Utils.tsx → Layout.tsx cycle
- [ ] Task 4.4: Resolve remaining model-layer cycles
- [ ] Task 4.5: Verify circular dependencies resolved (`turbo run lint:circular --filter=@beep/ui`)
- [ ] Final verification: type check passes
- [ ] Final verification: lint passes (including lint:circular)
- [ ] REFLECTION_LOG.md updated

---

## Expected Outcome

When complete:
1. Zero `as unknown as` casts in any I* class
2. All I* classes form a self-contained parallel hierarchy
3. Type safety maintained through schema guards
4. Original classes completely unchanged
5. I* classes can be used independently of original classes
6. Zero circular dependencies (`turbo run lint:circular --filter=@beep/ui` passes)
