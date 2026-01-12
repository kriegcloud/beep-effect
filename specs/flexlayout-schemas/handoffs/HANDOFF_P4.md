# FlexLayout Schema Creation Handoff — P4 Phase

> Handoff for Phase 4: Create Node Subclass Schemas (BorderNode, RowNode, TabSetNode, TabNode)

---

## Critical Rule

**DO NOT MODIFY ORIGINAL CLASSES.** This is additive work - create NEW schema classes alongside existing classes. Originals stay unchanged.

---

## Session Summary: P3 Complete

| Metric | Value |
|--------|-------|
| Date | 2026-01-11 |
| Phase completed | P3 (ILayoutWindow, IBorderSet) |
| Next phase | P4 (Node subclasses) |
| Status | Ready to execute P4 |

---

## What Was Accomplished (P3)

### ILayoutWindow Schema Class Created

- **File**: `packages/ui/ui/src/flexlayout-react/model/LayoutWindow.ts`
- **Original class**: `class LayoutWindow extends Data.Class` (line 12) - UNCHANGED
- **Schema classes**:
  - `ILayoutWindowData extends S.Class<ILayoutWindowData>($I\`ILayoutWindowData\`)` (lines 153-156)
  - `ILayoutWindow extends S.Class<ILayoutWindow>($I\`ILayoutWindow\`)` (lines 164-318)

### IBorderSet Schema Class Created

- **File**: `packages/ui/ui/src/flexlayout-react/model/BorderSet.ts`
- **Original class**: `class BorderSet extends Data.Class` (line 13) - UNCHANGED
- **Schema classes**:
  - `IBorderSetData extends S.Class<IBorderSetData>($I\`IBorderSetData\`)` (lines 102-104)
  - `IBorderSet extends S.Class<IBorderSet>($I\`IBorderSet\`)` (lines 115-203)

### Key Findings

1. **IRect composition** - ILayoutWindow directly composes existing IRect schema:
   ```typescript
   export class ILayoutWindowData extends S.Class<ILayoutWindowData>($I`ILayoutWindowData`)({
     windowId: S.String,
     rect: IRect,
   }) {}
   ```

2. **DOM reference pattern** - Browser `Window` stored as `O.Option<Window>`:
   ```typescript
   private _window: O.Option<Window> = O.none();
   ```

3. **Function field pattern** - Callbacks as private fields:
   ```typescript
   private _toScreenRectFunction: (rect: Rect) => Rect = (r) => r;
   ```

4. **Forward reference pattern** - BorderNode[] stored as runtime field since not yet converted:
   ```typescript
   private _borders: BorderNode[] = [];
   private _borderMap: Map<DockLocation, BorderNode> = new Map();
   ```

5. **Minimal serializable data for collections** - IBorderSet only serializes layoutHorizontal boolean.

### Verification Results

- Type check: PASSED (`turbo run check --filter=@beep/ui`)
- Lint: PASSED (`turbo run lint --filter=@beep/ui`)
- All classes verified present in files

---

## P4 Target Files

### 1. BorderNode.ts

Node subclass for border panel nodes.

**Expected Structure:**
- Extends Node (will extend INode)
- Has BorderNode-specific attributes
- Contains selectedNode reference
- Override methods: toJson, updateAttrs, getAttributeDefinitions

### 2. RowNode.ts

Node subclass for row layout containers.

**Expected Structure:**
- Extends Node (will extend INode)
- Contains child node management
- Layout calculation methods
- Override methods: toJson, updateAttrs, getAttributeDefinitions

### 3. TabSetNode.ts

Node subclass for tabbed panels.

**Expected Structure:**
- Extends Node (will extend INode)
- Tab selection state
- Active tab tracking
- Override methods: toJson, updateAttrs, getAttributeDefinitions

### 4. TabNode.ts

Node subclass for individual tabs.

**Expected Structure:**
- Extends Node (will extend INode)
- Tab content/component reference
- Tab-specific attributes (name, enableClose, etc.)
- Override methods: toJson, updateAttrs, getAttributeDefinitions

---

## P4 Approach

### Pattern from P2/P3

Use the established patterns:

1. **Extend INode instead of Node** - Schema subclasses extend INode
2. **Subclass Data** - Create `IBorderNodeData`, `IRowNodeData`, etc. extending or composing INodeData
3. **Override abstract methods** - Implement `toJson()`, `updateAttrs()`, `getAttributeDefinitions()` properly
4. **Private runtime fields** - Add subclass-specific runtime state as private fields
5. **Factory methods** - Add `static readonly new()` and `static fromJson()` methods

### Recommended Class Structure

```typescript
const $I = $UiId.create("flexlayout-react/model/BorderNode");

export class IBorderNodeData extends S.Class<IBorderNodeData>($I`IBorderNodeData`)({
  // BorderNode-specific serializable fields (extends INodeData pattern)
  nodeData: INodeData,
  location: S.String, // DockLocation reference
  // ... other BorderNode fields
}) {}

export class IBorderNode extends INode {
  // Override abstract methods
  override toJson(): JsonBorderNode { ... }
  override updateAttrs(json: UnsafeAny): void { ... }
  override getAttributeDefinitions(): AttributeDefinitions { ... }

  // BorderNode-specific methods
  getLocation(): DockLocation { ... }
  isShowing(): boolean { ... }
  // ... etc
}
```

### Dependency Order

Execute in this order to minimize forward references:

1. **TabNode** - Leaf node, minimal dependencies
2. **TabSetNode** - Contains TabNode references
3. **BorderNode** - Contains children (TabNode references)
4. **RowNode** - Contains children (TabSetNode, RowNode references)

---

## P4 Tasks to Execute

### Task 1: Analyze TabNode.ts

Document:
- Instance fields
- Methods (especially abstract overrides)
- Dependencies

### Task 2: Create ITabNode

1. Add imports
2. Create `$I` identifier
3. Create `ITabNodeData` struct
4. Create `ITabNode` class extending INode
5. Override abstract methods
6. Copy TabNode-specific methods
7. DO NOT modify original TabNode class

### Task 3: Analyze TabSetNode.ts

Document structure.

### Task 4: Create ITabSetNode

Same pattern as ITabNode.

### Task 5: Analyze BorderNode.ts

Document structure.

### Task 6: Create IBorderNode

Same pattern, may need to reference ITabNode.

### Task 7: Analyze RowNode.ts

Document structure.

### Task 8: Create IRowNode

Same pattern, may need to reference ITabSetNode and IRowNode (recursive).

### Task 9: Verify All

```bash
turbo run check --filter=@beep/ui
turbo run lint --filter=@beep/ui
```

### Task 10: Update Reflection Log

Document P4 learnings.

---

## Success Criteria for P4

- [ ] TabNode.ts analyzed
- [ ] ITabNodeData and ITabNode schema classes created
- [ ] TabSetNode.ts analyzed
- [ ] ITabSetNodeData and ITabSetNode schema classes created
- [ ] BorderNode.ts analyzed
- [ ] IBorderNodeData and IBorderNode schema classes created
- [ ] RowNode.ts analyzed
- [ ] IRowNodeData and IRowNode schema classes created
- [ ] All abstract methods properly overridden
- [ ] Original classes UNCHANGED
- [ ] Type check passes
- [ ] Lint passes
- [ ] REFLECTION_LOG.md updated with P4 learnings

---

## Files to Reference

| File | Purpose |
|------|---------|
| `model/TabNode.ts` | Target file for ITabNode |
| `model/TabSetNode.ts` | Target file for ITabSetNode |
| `model/BorderNode.ts` | Target file for IBorderNode |
| `model/RowNode.ts` | Target file for IRowNode |
| `model/Node.ts` | INode base class |
| `model/LayoutWindow.ts` | P3 reference pattern |
| `model/BorderSet.ts` | P3 reference pattern |

---

## Handoff Checklist

- [x] P3 completed and verified
- [x] REFLECTION_LOG.md updated with P3 learnings
- [x] P4 target files identified
- [x] P4 approach defined
- [x] P4 tasks clear
- [x] Dependency order specified
- [ ] P4 execution pending
