# FlexLayout Schema Creation Handoff — P3 Phase

> Handoff for Phase 3: Create Support Class Schemas (LayoutWindow, BorderSet)

---

## Critical Rule

**DO NOT MODIFY ORIGINAL CLASSES.** This is additive work - create NEW schema classes alongside existing classes. Originals stay unchanged.

---

## Session Summary: P2 Complete

| Metric | Value |
|--------|-------|
| Date | 2026-01-11 |
| Phase completed | P2 (INode) |
| Next phase | P3 (ILayoutWindow, IBorderSet) |
| Status | Ready to execute P3 |

---

## What Was Accomplished (P2)

### INode Schema Class Created

- **File**: `packages/ui/ui/src/flexlayout-react/model/Node.ts`
- **Original class**: `abstract class Node extends Data.Class` (lines 18-318) - UNCHANGED
- **Schema classes**:
  - `INodeData extends S.Class<INodeData>($I\`INodeData\`)` (lines 329-334)
  - `INode extends S.Class<INode>($I\`INode\`)` (lines 345-671)

### Key Findings

1. **Concrete base with runtime checks** - Effect Schema classes cannot be abstract, so INode uses throwing method stubs:
   ```typescript
   toJson(): ReturnType {
     throw new Error("INode.toJson() must be implemented by subclass");
   }
   ```

2. **Private fields for non-serializable state** - Non-serializable runtime fields stored outside the schema:
   ```typescript
   private _model: O.Option<Model> = O.none();
   private _parent: O.Option<INode> = O.none();
   private _children: INode[] = [];
   private _rect: Rect = Rect.empty();
   private _path = "";
   private _listeners: Map<string, (p: UnsafeAny) => void> = new Map();
   private _attributes: Record<string, UnsafeAny> = {};
   ```

3. **Type assertions at Model boundary** - Where INode interacts with Model (which uses Node types), type assertions are needed:
   ```typescript
   // Type assertion needed: Model methods use Node types, INode is schema-based parallel
   rtn = model.getMaximizedTabset(windowId)!.canDrop(dragNode as unknown as Node & IDraggable, x, y);
   ```

4. **Protected initialization helper** - Added for subclass use:
   ```typescript
   protected initializeModel(model: Model): void {
     this._model = O.some(model);
     this._attributes = {};
   }
   ```

### Verification Results

- Type check: PASSED (`turbo run check --filter=@beep/ui`)
- Lint: PASSED (`turbo run lint --filter=@beep/ui`) after lint:fix
- All classes verified present in file

---

## P3 Target Files

### LayoutWindow.ts

Manages individual window state including DOM references and layout tree.

**Expected Structure:**
- Serializable: windowId, rect
- Runtime-only: _layout, _window (DOM Window ref), _root (Row node), _maximizedTabSet, _activeTabSet, _toScreenRectFunction (callback)

### BorderSet.ts

Collection of BorderNode instances, has Map<DockLocation, BorderNode>.

**Expected Structure:**
- Serializable: borders array, layoutHorizontal boolean
- Runtime-only: borderMap (complex Map structure)

---

## P3 Approach

### Pattern from P2

Use the same patterns established in P2:

1. **Separate Data class** - Create `ILayoutWindowData` / `IBorderSetData` for serializable fields
2. **Private runtime fields** - Non-serializable fields as private class members
3. **Option wrappers** - Use `O.Option<T>` for nullable references
4. **Type assertions** - Where needed at boundaries with original classes
5. **All methods copied** - Both to schema classes

### Dependency Note

BorderSet may reference BorderNode which is P4. If forward reference is needed, use:
- Type-only imports: `import type { BorderNode } from "./BorderNode"`
- Store as `INode[]` initially, type narrow at runtime

---

## P3 Tasks to Execute

### Task 1: Read and Analyze LayoutWindow.ts

Document:
- All instance fields (serializable vs runtime-only)
- Constructor logic
- Method inventory
- Dependencies

### Task 2: Create ILayoutWindow

1. Add imports at top of file
2. Create `$I` identifier
3. Create `ILayoutWindowData` struct
4. Create `ILayoutWindow` class with:
   - Private runtime fields
   - All methods from original
5. DO NOT modify original LayoutWindow class

### Task 3: Read and Analyze BorderSet.ts

Document:
- All instance fields
- Constructor logic
- Method inventory
- BorderNode dependency

### Task 4: Create IBorderSet

1. Add imports at top of file
2. Create `$I` identifier
3. Create `IBorderSetData` struct
4. Create `IBorderSet` class with:
   - Private runtime fields (including borderMap)
   - All methods from original
5. DO NOT modify original BorderSet class

### Task 5: Verify Both

```bash
turbo run check --filter=@beep/ui
turbo run lint --filter=@beep/ui
```

### Task 6: Update Reflection Log

Document P3 learnings in REFLECTION_LOG.md

---

## Success Criteria for P3

- [ ] LayoutWindow.ts structure analyzed
- [ ] ILayoutWindowData schema created
- [ ] ILayoutWindow schema class created BELOW original
- [ ] BorderSet.ts structure analyzed
- [ ] IBorderSetData schema created
- [ ] IBorderSet schema class created BELOW original
- [ ] Original LayoutWindow class UNCHANGED
- [ ] Original BorderSet class UNCHANGED
- [ ] Type check passes
- [ ] Lint passes
- [ ] REFLECTION_LOG.md updated with P3 learnings

---

## Files to Reference

| File | Purpose |
|------|---------|
| `model/LayoutWindow.ts` | Target file for ILayoutWindow |
| `model/BorderSet.ts` | Target file for IBorderSet |
| `model/Node.ts` | P2 reference (INode/INodeData pattern) |
| `model/Actions.ts` | P1 reference (IActions pattern) |
| `DockLocation.ts` | Tagged variant + lazy singleton |

---

## Handoff Checklist

- [x] P2 completed and verified
- [x] REFLECTION_LOG.md updated with P2 learnings
- [x] P3 target files identified
- [x] P3 approach defined
- [x] P3 tasks clear
- [ ] P3 execution pending
