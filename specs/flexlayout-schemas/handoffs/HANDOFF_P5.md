# FlexLayout Schema Creation Handoff — P5 Phase

> Handoff for Phase 5: Create IModel Schema Class (The Final Boss)

---

## Critical Rule

**DO NOT MODIFY ORIGINAL CLASSES.** This is additive work - create NEW schema classes alongside existing classes. Originals stay unchanged.

---

## Session Summary: P4 Complete

| Metric | Value |
|--------|-------|
| Date | 2026-01-11 |
| Phase completed | P4 (Node Subclasses: ITabNode, ITabSetNode, IBorderNode, IRowNode) |
| Next phase | P5 (IModel - the final boss) |
| Status | Ready to execute P5 |

---

## What Was Accomplished (P4)

### Four Node Subclass Schema Classes Created

| File | Original | Schema Class | Line |
|------|----------|--------------|------|
| TabNode.ts | `class TabNode` (line 14) | `class ITabNode` (line 473) | ~300 lines |
| TabSetNode.ts | `class TabSetNode` (line 24) | `class ITabSetNode` (line 621) | ~550 lines |
| BorderNode.ts | `class BorderNode` (line 20) | `class IBorderNode` (line 485) | ~400 lines |
| RowNode.ts | `class RowNode` (line 23) | `class IRowNode` (line 657) | ~350 lines |

### Critical Pattern Discovered: Effect Schema Extension

**WRONG Pattern (Initial attempt):**
```typescript
export class ITabSetNode extends INode implements IDraggable { ... }
```

**CORRECT Pattern:**
```typescript
export class ITabSetNode extends INode.extend<ITabSetNode>("ITabSetNode")({}) {
  // NO implements clause - just add interface methods directly
  isEnableDrag(): boolean { return this.getAttr("enableDrag") as boolean; }
  // ...
}
```

### Key Learnings Applied

1. **`.extend<T>(name)({})` pattern required** - Effect Schema classes cannot use regular `extends`/`implements`
2. **Static factory method pattern** - Cannot override constructor, use `static readonly new = (...)`
3. **Parent schema fields in constructor** - Must pass parent data: `new ITabNode({ data: {...} })`
4. **No `implements` clause** - Just add methods directly to satisfy interfaces
5. **`as unknown as` double cast** - For type boundaries where types don't overlap

### Verification Results

- Type check: PASSED (`turbo run check --filter=@beep/ui`)
- Lint: PASSED (`turbo run lint --filter=@beep/ui`)
- All original classes: UNCHANGED

---

## P5 Target: Model.ts

### File Overview

- **Location**: `packages/ui/ui/src/flexlayout-react/model/Model.ts`
- **Lines**: 719 lines
- **Original class**: `class Model` (line 30)
- **Complexity**: HIGH - orchestrator class with complex state management

### Current Structure (Original Model)

```typescript
export class Model {
  static MAIN_WINDOW_ID = "__main_window_id__";

  // Static attribute definitions
  private static attributeDefinitions: AttributeDefinitions;

  // Instance fields (non-serializable - store as private)
  private readonly attributes: Record<string, UnsafeTypes.UnsafeAny>;
  private idMap: Map<string, Node>;
  private readonly changeListeners: ((action: Action) => void)[];
  private borders: BorderSet;
  private onAllowDrop?: (dragNode: Node, dropInfo: DropInfo) => boolean;
  private onCreateTabSet?: (tabNode?: TabNode) => TabSetAttributes;
  private readonly windows: Map<string, LayoutWindow>;
  private readonly rootWindow: LayoutWindow;

  // Constructor
  protected constructor() { ... }

  // Static factory
  static fromJson(json: UnsafeTypes.UnsafeAny, log?: boolean): Model { ... }

  // ~60+ methods including:
  // - doAction(action: Action): handles all action types
  // - getNodeById(id: string): Node lookup
  // - toJson(): JsonModel
  // - tidy(): cleanup tree structure
  // - visitNodes(): tree traversal
  // - getters/setters for all properties
}
```

### Challenges

1. **Action Handler** - `doAction()` method handles 16+ action types with complex logic
2. **Circular References** - Model references Node subclasses which reference Model
3. **Callback Functions** - `onAllowDrop`, `onCreateTabSet` are function references
4. **Window Management** - Multiple `LayoutWindow` instances with complex lifecycle
5. **Node ID Map** - `Map<string, Node>` for O(1) lookup
6. **Static Factory** - `fromJson()` creates entire tree structure

---

## P5 Approach

### Schema Class Structure

```typescript
const $I = $UiId.create("flexlayout-react/model/Model");

// Minimal serializable data
export class IModelData extends S.Class<IModelData>($I`IModelData`)({
  // Model-level serializable attributes (if any)
}) {}

// Main IModel class
export class IModel extends S.Class<IModel>($I`IModel`)({
  data: IModelData,
}) {
  static MAIN_WINDOW_ID = "__main_window_id__";

  // Static attribute definitions
  private static attributeDefinitions: AttributeDefinitions = IModel.createAttributeDefinitions();

  // Private runtime fields (NOT in schema)
  private _attributes: Record<string, UnsafeTypes.UnsafeAny> = {};
  private _idMap: Map<string, Node> = new Map();
  private _changeListeners: ((action: Action) => void)[] = [];
  private _borders: O.Option<BorderSet> = O.none();
  private _onAllowDrop: O.Option<(dragNode: Node, dropInfo: DropInfo) => boolean> = O.none();
  private _onCreateTabSet: O.Option<(tabNode?: TabNode) => TabSetAttributes> = O.none();
  private _windows: Map<string, LayoutWindow> = new Map();
  private _rootWindow: O.Option<LayoutWindow> = O.none();

  // Static factory
  static readonly new = (): IModel => {
    const instance = new IModel({ data: {} });
    instance._initialize();
    return instance;
  };

  static fromJson(json: UnsafeTypes.UnsafeAny, log?: boolean): IModel { ... }

  // All Model methods...
  doAction(action: Action): UnsafeTypes.UnsafeAny { ... }
  getNodeById(id: string): Node | undefined { ... }
  toJson(): JsonModel { ... }
  // ... etc
}
```

### Execution Strategy

1. **Read full Model.ts** - Understand all 719 lines
2. **Categorize fields** - Serializable vs runtime-only
3. **Plan method adaptation** - Especially `doAction()` complexity
4. **Create IModel incrementally** - Start with structure, add methods
5. **Handle type boundaries** - Strategic `as unknown as` casts
6. **Verify continuously** - Type check after each section

---

## P5 Tasks

### Task 1: Analyze Model.ts Structure

Document:
- All instance fields
- All static fields
- Constructor logic
- Static `fromJson()` factory
- Key methods: `doAction()`, `toJson()`, `tidy()`, `visitNodes()`
- All getter/setter methods

### Task 2: Create IModel Scaffold

1. Add imports at top
2. Create `$I` identifier
3. Create `IModelData` class (minimal)
4. Create `IModel` class scaffold with private fields

### Task 3: Implement Static Factory

Adapt `fromJson()` to work with IModel:
- Initialize private fields
- Create BorderSet
- Create windows
- Build node tree

### Task 4: Implement doAction()

The complex action handler - 16+ action cases:
- ADD_NODE, MOVE_NODE, DELETE_TAB, DELETE_TABSET
- POPOUT_TABSET, POPOUT_TAB, CLOSE_WINDOW, CREATE_WINDOW
- SELECT_TAB, SET_ACTIVE_TABSET, MAXIMIZE_TOGGLE
- ADJUST_BORDER_SPLIT, ADJUST_SPLIT, RENAME_TAB
- FLOAT_TAB, UNFLOAT_TAB, UPDATE_NODE_ATTRIBUTES

### Task 5: Implement Remaining Methods

- `toJson()`, `tidy()`, `visitNodes()`
- All getters/setters
- Helper methods

### Task 6: Verify

```bash
turbo run check --filter=@beep/ui
turbo run lint --filter=@beep/ui
```

### Task 7: Update Reflection Log

Document P5 learnings

---

## Success Criteria for P5

- [ ] Model.ts structure analyzed
- [ ] IModelData schema class created
- [ ] IModel schema class created with all private fields
- [ ] Static factory `new()` implemented
- [ ] Static `fromJson()` implemented
- [ ] `doAction()` method implemented (all 16+ cases)
- [ ] `toJson()` method implemented
- [ ] All getter/setter methods implemented
- [ ] Helper methods implemented (`tidy()`, `visitNodes()`, etc.)
- [ ] Original Model class UNCHANGED
- [ ] Type check passes
- [ ] Lint passes
- [ ] REFLECTION_LOG.md updated with P5 learnings

---

## Files to Reference

| File | Purpose |
|------|---------|
| `model/Model.ts` | Target file for IModel (719 lines) |
| `model/Node.ts` | INode base class pattern |
| `model/TabSetNode.ts` | ITabSetNode `.extend()` pattern |
| `model/RowNode.ts` | IRowNode with recursive references |
| `model/Actions.ts` | IActions static-only pattern |
| `model/LayoutWindow.ts` | ILayoutWindow composition pattern |

---

## Handoff Checklist

- [x] P4 completed and verified
- [x] REFLECTION_LOG.md updated with P4 learnings
- [x] P5 target file analyzed (Model.ts - 719 lines)
- [x] P5 approach defined
- [x] P5 tasks clear
- [x] Complexity challenges identified
- [ ] P5 execution pending
