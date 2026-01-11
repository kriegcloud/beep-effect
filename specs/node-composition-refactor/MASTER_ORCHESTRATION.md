# Node Composition Refactor: Master Orchestration

> Full workflow for refactoring Node hierarchy from inheritance to composition.

---

## Critical Orchestration Rules

1. **NEVER delete existing code until new code is tested**
2. **Maintain backward compatibility during migration**
3. **One node type at a time** - Start with TabNode, end with RowNode
4. **Test coverage before refactoring** - Write tests for current behavior first
5. **Benchmark critical paths** - findDropTargetNode, calcMinMaxSize, drop operations

---

## Phase Overview

```
P0: Research & Proposal ──────────────────────────────── COMPLETE
    │
    ▼
P1: Tagged Classes & Node Union ─────────────────────── Ready
    │ Output: New type definitions alongside existing
    │
    ▼
P2: Behavior Modules ────────────────────────────────── Pending
    │ Output: NodeOps.ts, DraggableOps.ts, DropTargetOps.ts, etc.
    │
    ▼
P3: Serialization Migration ─────────────────────────── Pending
    │ Output: Schema-based toJson/fromJson
    │
    ▼
P4: View Component Updates ──────────────────────────── Pending
    │ Output: React components using Match patterns
    │
    ▼
P5: Cleanup & Optimization ──────────────────────────── Pending
    │ Output: Delete old classes, optimize Match dispatch
    │
    ▼
COMPLETE
```

---

## Phase 1: Tagged Classes & Node Union

### Objective

Create new `Data.TaggedClass` definitions for all node types alongside existing classes.

### Pre-Phase Checklist

- [ ] Write tests for current Node behavior (`Node.test.ts`)
- [ ] Create benchmark for `findDropTargetNode` performance
- [ ] Map all protected field access (see Field Access Matrix below)

### Tasks

#### Task 1.1: Create Base Types Module

**File**: `packages/ui/ui/src/flex-layout/model/types.ts`

Create shared type definitions:
```typescript
import * as Data from "effect/Data";
import { Rect } from "../rect";

// Common fields for all nodes
export interface BaseNodeFields {
  readonly id: string;
  readonly rect: Rect;
  readonly path: string;
  readonly attributes: Record<string, unknown>;
}

// Node union (forward declaration)
export type Node = RowNode | TabSetNode | TabNode | BorderNode;
```

#### Task 1.2: Create TabNode Tagged Class

**File**: `packages/ui/ui/src/flex-layout/model/tab-node.new.ts`

**Sub-agent prompt**:
```
Create a new TabNode using Data.TaggedClass that:
1. Has all fields from the current TabNode class
2. Implements Pipeable for fluent composition
3. Does NOT include methods - those go in behavior modules
4. Uses readonly for all fields
5. Preserves tabRect, visible, rendered state

Reference: packages/ui/ui/src/flexlayout-react/model/TabNode.ts
Target: packages/ui/ui/src/flex-layout/model/tab-node.new.ts

Key fields to include:
- id, rect, path, attributes (from Node)
- name, component, helpText, icon
- tabRect, visible, rendered
- scrollTop, scrollLeft
- extra (runtime-only data)
```

#### Task 1.3: Create TabSetNode Tagged Class

**File**: `packages/ui/ui/src/flex-layout/model/tabset-node.new.ts`

**Sub-agent prompt**:
```
Create a new TabSetNode using Data.TaggedClass that:
1. Contains children as ReadonlyArray<TabNode>
2. Includes weight, selected, tabStripRect, contentRect
3. Includes calculated min/max dimensions
4. Does NOT include methods

Reference: packages/ui/ui/src/flexlayout-react/model/TabSetNode.ts
Target: packages/ui/ui/src/flex-layout/model/tabset-node.new.ts
```

#### Task 1.4: Create BorderNode Tagged Class

**File**: `packages/ui/ui/src/flex-layout/model/border-node.new.ts`

**Sub-agent prompt**:
```
Create a new BorderNode using Data.TaggedClass that:
1. Includes DockLocation for position
2. Contains children as ReadonlyArray<TabNode>
3. Includes contentRect, tabHeaderRect, size, selected

Reference: packages/ui/ui/src/flexlayout-react/model/BorderNode.ts
Target: packages/ui/ui/src/flex-layout/model/border-node.new.ts
```

#### Task 1.5: Create RowNode Tagged Class

**File**: `packages/ui/ui/src/flex-layout/model/row-node.new.ts`

**Sub-agent prompt**:
```
Create a new RowNode using Data.TaggedClass that:
1. Contains children as ReadonlyArray<RowNode | TabSetNode>
2. Includes windowId, weight
3. Includes minWidth, minHeight, maxWidth, maxHeight

Reference: packages/ui/ui/src/flexlayout-react/model/RowNode.ts
Target: packages/ui/ui/src/flex-layout/model/row-node.new.ts
```

#### Task 1.6: Create Node Union & Type Guards

**File**: `packages/ui/ui/src/flex-layout/model/node.new.ts`

Create the union type and predicates:
```typescript
export type Node = RowNode | TabSetNode | TabNode | BorderNode;

export const NodePredicates = {
  isRowNode: (node: Node): node is RowNode => node._tag === "RowNode",
  isTabSetNode: (node: Node): node is TabSetNode => node._tag === "TabSetNode",
  isTabNode: (node: Node): node is TabNode => node._tag === "TabNode",
  isBorderNode: (node: Node): node is BorderNode => node._tag === "BorderNode",
};
```

### Success Criteria

- [ ] All 4 tagged classes compile without errors
- [ ] Node union type correctly discriminates on `_tag`
- [ ] Pipeable works: `tabNode.pipe(f1, f2)` compiles
- [ ] Type guards narrow correctly in conditionals

### Verification Commands

```bash
# Type check
bun run check --filter=@beep/ui

# Ensure no runtime errors
bun run test --filter=@beep/ui
```

---

## Phase 2: Behavior Modules

### Objective

Extract behaviors from class methods into pure function modules.

### Tasks

#### Task 2.1: Core Node Operations

**File**: `packages/ui/ui/src/flex-layout/model/ops/node-ops.ts`

Extract universal node operations:
```typescript
export const NodeOps = {
  getId: (node: Node) => node.id,
  getRect: (node: Node) => Match.value(node).pipe(...),
  getPath: (node: Node) => node.path,
  getChildren: (node: Node) => Match.value(node).pipe(...),
  forEachNode: (node: Node, fn, level) => { ... },
};
```

#### Task 2.2: Draggable Operations

**File**: `packages/ui/ui/src/flex-layout/model/ops/draggable-ops.ts`

Extract IDraggable behavior:
```typescript
export const DraggableOps = {
  isDraggable: (node: Node) => Match.value(node).pipe(...),
  isEnableDrag: (node: Node) => Match.value(node).pipe(...),
  getName: (node: Node) => Match.value(node).pipe(...),
};
```

#### Task 2.3: Drop Target Operations

**File**: `packages/ui/ui/src/flex-layout/model/ops/drop-target-ops.ts`

Extract IDropTarget behavior:
```typescript
export const DropTargetOps = {
  isDropTarget: (node: Node) => Match.value(node).pipe(...),
  canDrop: (target: Node, dragNode: Node, x: number, y: number) => Match.value(target).pipe(...),
  drop: (target: Node, dragNode: Node, location: DockLocation, index: number) => Match.value(target).pipe(...),
};
```

#### Task 2.4: Sizing Operations

**File**: `packages/ui/ui/src/flex-layout/model/ops/sizing-ops.ts`

Extract size calculation logic:
```typescript
export const SizingOps = {
  getWeight: (node: Node) => Match.value(node).pipe(...),
  getMinWidth: (node: Node) => Match.value(node).pipe(...),
  calcMinMaxSize: (node: Node) => Match.value(node).pipe(...),
};
```

#### Task 2.5: Immutable Update Operations

**File**: `packages/ui/ui/src/flex-layout/model/ops/update-ops.ts`

Extract update operations returning new nodes:
```typescript
export const NodeUpdates = {
  setRect: (node: Node, rect: Rect) => Match.value(node).pipe(...),
  setPath: (node: Node, path: string) => Match.value(node).pipe(...),
  addChild: (parent: Node, child: Node, index?: number) => Match.value(parent).pipe(...),
  removeChild: (parent: Node, childId: string) => Match.value(parent).pipe(...),
};
```

### Success Criteria

- [ ] All behavior modules compile
- [ ] Each module has corresponding test file
- [ ] Behavior matches original class methods

---

## Phase 3: Serialization Migration

### Objective

Replace `toJson()`/`fromJson()` methods with Effect Schema transforms.

### Tasks

#### Task 3.1: Define JSON Schemas

**File**: `packages/ui/ui/src/flex-layout/model/schemas/json-schemas.ts`

Create schemas for wire format:
```typescript
const RowNodeJson = S.Struct({
  type: S.Literal("row"),
  id: S.optional(S.String),
  weight: S.optional(S.Number),
  children: S.optional(S.Array(S.suspend(() => NodeJson))),
});
```

#### Task 3.2: Create Transforms

**File**: `packages/ui/ui/src/flex-layout/model/schemas/transforms.ts`

Create bidirectional transforms:
```typescript
export const RowNodeTransform = S.transform(RowNodeJson, RowNode, {
  decode: (json) => new RowNode({ ... }),
  encode: (node) => ({ type: "row", ... }),
});
```

#### Task 3.3: Migrate Existing Serialization

Update callers to use new schema-based serialization.

### Success Criteria

- [ ] All node types have JSON schemas
- [ ] Roundtrip test passes: `decode(encode(node)) === node`
- [ ] Recursive schemas work for nested structures

---

## Phase 4: View Component Updates

### Objective

Update React components to use new patterns.

### Tasks

#### Task 4.1: Audit View Components

List all files in `view/` that use Node types and methods.

#### Task 4.2: Update Tab Component

Migrate to use NodeOps and Match patterns.

#### Task 4.3: Update TabSet Component

Migrate to use NodeOps and Match patterns.

#### Task 4.4: Update Layout Component

Migrate tree traversal to use new NodeOps.forEachNode.

### Success Criteria

- [ ] All view components compile with new types
- [ ] No `instanceof` checks remain
- [ ] UI behavior unchanged

---

## Phase 5: Cleanup & Optimization

### Objective

Remove old classes and optimize.

### Tasks

#### Task 5.1: Delete Old Classes

Remove:
- `Node.ts` (abstract class)
- Old class files (after migration complete)

#### Task 5.2: Rename New Files

- `tab-node.new.ts` -> `tab-node.ts`
- etc.

#### Task 5.3: Performance Optimization

- Benchmark Match dispatch overhead
- Consider memoization for hot paths

### Success Criteria

- [ ] No references to old class files
- [ ] Performance within 10% of original
- [ ] All tests pass

---

## Field Access Matrix

Protected fields accessed by each class method:

| Method | model | attributes | parent | children | rect | path | listeners |
|--------|-------|------------|--------|----------|------|------|-----------|
| getId | X | X | | | | | |
| getType | | X | | | | | |
| getParent | | | X | | | | |
| getChildren | | | | X | | | |
| getRect | | | | | X | | |
| getOrientation | X | | X | | | | |
| canDrop | X | | | X | X | | |
| findDropTargetNode | X | | | X | X | | |
| fireEvent | | | | | | | X |
| forEachNode | | | | X | | | |
| setPaths | | | | X | | X | |

**Insight**: Most methods need `model` reference. Consider passing Model as parameter or storing reference in each node.

---

## Handoff Template

When completing a phase, generate `HANDOFF_P[N+1].md`:

```markdown
# Node Composition Refactor: P[N] -> P[N+1] Handoff

## P[N] Completion Summary
| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Files created | X | Y | OK/ISSUE |
| Tests passing | X | Y | OK/ISSUE |

## What Worked
- ...

## What Needed Adjustment
- ...

## P[N+1] Priority Tasks
1. ...
2. ...

## Improved Prompts
[Refined prompts based on learnings]

## Verification Commands
```bash
bun run check --filter=@beep/ui
bun run test --filter=@beep/ui
```

## Notes for Next Session
- ...
```
