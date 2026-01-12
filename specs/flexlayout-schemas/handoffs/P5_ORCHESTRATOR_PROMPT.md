# FlexLayout Schema Creation — P5 Orchestrator

> Execute Phase 5: Create IModel Schema Class (The Final Boss)

---

## Critical Rule

**DO NOT MODIFY ORIGINAL CLASSES.** This is additive work - create NEW schema classes alongside existing classes. Originals stay unchanged.

---

## Critical Orchestration Rules

1. **NEVER write code without reading the file first**
2. **ALWAYS verify with type check after changes**
3. **DO NOT modify original classes** - Create new schema classes alongside them
4. **LOG learnings** in REFLECTION_LOG.md

---

## Context from P4 Completion

| Metric | Value |
|--------|-------|
| P4 Status | Complete |
| ITabNode created | Line 473 in TabNode.ts |
| ITabSetNode created | Line 621 in TabSetNode.ts |
| IBorderNode created | Line 485 in BorderNode.ts |
| IRowNode created | Line 657 in RowNode.ts |
| Pattern learned | `.extend<T>(name)({})` for Effect Schema inheritance |
| Verification | Type check + lint passed |

---

## P5 Challenge Summary

Model.ts is the **final boss** - the orchestrator class that:

1. **Manages entire node tree** - Creates, updates, deletes nodes
2. **Handles 16+ action types** - Complex `doAction()` switch statement
3. **Maintains node ID map** - O(1) lookup for any node
4. **Manages multiple windows** - Main window + popout windows
5. **Owns BorderSet** - Border panel management
6. **Provides callbacks** - `onAllowDrop`, `onCreateTabSet`

**Size**: 719 lines with 60+ methods

---

## Execution Order

```
┌─────────────────────────────────────────────────────┐
│              P5 EXECUTION ORDER                      │
├─────────────────────────────────────────────────────┤
│  1. Read and analyze full Model.ts (719 lines)      │
│  2. Create IModelData minimal schema                │
│  3. Create IModel scaffold with private fields      │
│  4. Implement static new() factory                  │
│  5. Implement static fromJson() factory             │
│  6. Implement doAction() (16+ action cases)         │
│  7. Implement toJson() method                       │
│  8. Implement getter/setter methods                 │
│  9. Implement helper methods                        │
│  10. Verify and fix errors                          │
└─────────────────────────────────────────────────────┘
```

---

## P5 Tasks to Execute

### Task 1: Analyze Model.ts

**Sub-agent prompt**:
```
Read packages/ui/ui/src/flexlayout-react/model/Model.ts (all 719 lines)

Document:
1. All static fields and their types
2. All instance fields (names, types, initialization)
3. Constructor logic
4. Static fromJson() factory - how it builds the tree
5. doAction() method - list all action types handled
6. toJson() method - serialization logic
7. All getter/setter methods
8. Helper methods (tidy, visitNodes, etc.)

Categorize fields:
- SERIALIZABLE: Data that should be in schema
- RUNTIME-ONLY: Callbacks, node references, listeners

Report structure - do not modify files yet.
```

### Task 2: Create IModel Scaffold

**Sub-agent prompt**:
```
Create IModel schema class scaffold in packages/ui/ui/src/flexlayout-react/model/Model.ts

IMPORTANT: DO NOT modify the existing Model class. Add new code BELOW it.

Steps:
1. Add imports at top of file (if not already present):
   import { $UiId } from "@beep/identity/packages";
   import * as S from "effect/Schema";
   import * as O from "effect/Option";

2. Create identifier after Model class (around line 720):
   const $I = $UiId.create("flexlayout-react/model/Model");

3. Create minimal data struct:
   export class IModelData extends S.Class<IModelData>($I`IModelData`)({
     // Model has minimal serializable data at instance level
   }) {}

4. Create IModel class scaffold:
   export class IModel extends S.Class<IModel>($I`IModel`)({
     data: IModelData,
   }) {
     static MAIN_WINDOW_ID = "__main_window_id__";

     // Static attribute definitions
     private static attributeDefinitions: AttributeDefinitions = IModel.createAttributeDefinitions();

     // Private runtime fields (NOT serialized)
     private _attributes: Record<string, UnsafeTypes.UnsafeAny> = {};
     private _idMap: Map<string, Node> = new Map();
     private _changeListeners: ((action: Action) => void)[] = [];
     private _borders: O.Option<BorderSet> = O.none();
     private _onAllowDrop: O.Option<(dragNode: Node, dropInfo: DropInfo) => boolean> = O.none();
     private _onCreateTabSet: O.Option<(tabNode?: TabNode) => TabSetAttributes> = O.none();
     private _windows: Map<string, LayoutWindow> = new Map();
     private _rootWindow: O.Option<LayoutWindow> = O.none();
   }

5. DO NOT modify, delete, or mark the original Model class
```

### Task 3: Implement Static Factories

**Sub-agent prompt**:
```
Add static factory methods to IModel:

1. Static new() factory:
   static readonly new = (): IModel => {
     const instance = new IModel({ data: {} });
     instance._initialize();
     return instance;
   };

   private _initialize(): void {
     this._attributes = {};
     this._idMap = new Map();
     this._borders = O.some(new BorderSet(this as unknown as Model));
     this._windows = new Map();
     const rootWindow = new LayoutWindow(IModel.MAIN_WINDOW_ID, Rect.empty());
     this._rootWindow = O.some(rootWindow);
     this._windows.set(IModel.MAIN_WINDOW_ID, rootWindow);
     this._changeListeners = [];
   }

2. Static fromJson() factory (adapt from Model.fromJson):
   static fromJson(json: UnsafeTypes.UnsafeAny, log?: boolean): IModel {
     const model = IModel.new();
     // Adapt Model.fromJson logic to work with IModel
     // Handle borders, windows, root node creation
     return model;
   }
```

### Task 4: Implement doAction()

**Sub-agent prompt**:
```
Implement the doAction() method in IModel.

This is the most complex method - handles 16+ action types:
- ADD_NODE
- MOVE_NODE
- DELETE_TAB
- DELETE_TABSET
- POPOUT_TABSET
- POPOUT_TAB
- CLOSE_WINDOW
- CREATE_WINDOW
- SELECT_TAB
- SET_ACTIVE_TABSET
- MAXIMIZE_TOGGLE
- ADJUST_BORDER_SPLIT
- ADJUST_SPLIT
- RENAME_TAB
- FLOAT_TAB
- UNFLOAT_TAB
- UPDATE_NODE_ATTRIBUTES

Copy the logic from Model.doAction() and adapt:
- Use private fields with underscore prefix
- Use O.getOrThrow/O.getOrUndefined for Option fields
- Add type assertions at boundaries where needed
```

### Task 5: Implement toJson()

**Sub-agent prompt**:
```
Implement toJson() method in IModel:

toJson(): JsonModel {
  const json: Record<string, unknown> = {};
  IModel.attributeDefinitions.toJson(json, this._attributes);

  const borders = O.getOrThrow(this._borders);
  json.borders = borders.toJson();

  const rootWindow = O.getOrThrow(this._rootWindow);
  json.layout = rootWindow.root?.toJson();

  // Handle popout windows...

  return S.decodeUnknownSync(JsonModel)(json);
}
```

### Task 6: Implement Getter/Setter Methods

**Sub-agent prompt**:
```
Implement all getter/setter methods in IModel:

Examples:
- getRoot(windowId?: string): RowNode | undefined
- getActiveTabset(windowId?: string): TabSetNode | undefined
- setActiveTabset(tabset: TabSetNode | undefined, windowId?: string): void
- getBorderSet(): BorderSet
- getNodeById(id: string): Node | undefined
- addNode(node: Node): void
- removeNode(node: Node): void
- getSplitterSize(): number
- isEnableEdgeDock(): boolean
- isRootOrientationVertical(): boolean
- getMaximizedTabset(windowId?: string): TabSetNode | undefined
- setMaximizedTabset(tabset: TabSetNode | undefined, windowId?: string): void
- ... (copy all from Model)

Adapt each to use private fields with underscore prefix.
```

### Task 7: Implement Helper Methods

**Sub-agent prompt**:
```
Implement helper methods in IModel:

- tidy(): void - cleanup tree structure
- visitNodes(fn: (node: Node, level: number) => void, node?: Node): void - tree traversal
- removeEmptyWindows(): void
- getFirstTabSet(root?: RowNode): TabSetNode | undefined
- createAttributeDefinitions(): AttributeDefinitions (static)
- ... (copy all from Model)
```

### Task 8: Verify and Fix

**Sub-agent prompt**:
```
After implementing IModel:

1. Run type check:
   turbo run check --filter=@beep/ui

2. If errors, fix them one by one

3. Run lint:
   turbo run lint --filter=@beep/ui

4. If lint errors, run:
   turbo run lint:fix --filter=@beep/ui

5. Verify both classes exist:
   grep -n "class Model\|class IModel" packages/ui/ui/src/flexlayout-react/model/Model.ts

6. Verify original unchanged:
   git diff packages/ui/ui/src/flexlayout-react/model/Model.ts | head -50
   (should only see additions at end)
```

### Task 9: Update Reflection Log

**Sub-agent prompt**:
```
Update specs/flexlayout-schemas/REFLECTION_LOG.md with P5 learnings:

Add new entry:
### 2026-01-XX - P5 IModel Schema Creation (Final Boss)

#### What Worked
- [Action handler adaptation? Factory methods?]

#### What Didn't Work
- [Any issues with complex state?]

#### Pattern Refinements
- Orchestrator class pattern
- Action handler adaptation
- Callback function storage

#### Decisions Made
- [e.g., "Used Option wrappers for all major components"]
```

---

## Schema Class Pattern for Model

```typescript
const $I = $UiId.create("flexlayout-react/model/Model");

export class IModelData extends S.Class<IModelData>($I`IModelData`)({
  // Minimal - Model stores most state at instance level
}) {}

export class IModel extends S.Class<IModel>($I`IModel`)({
  data: IModelData,
}) {
  static MAIN_WINDOW_ID = "__main_window_id__";
  private static attributeDefinitions: AttributeDefinitions = IModel.createAttributeDefinitions();

  // All instance state as private fields
  private _attributes: Record<string, UnsafeTypes.UnsafeAny> = {};
  private _idMap: Map<string, Node> = new Map();
  private _changeListeners: ((action: Action) => void)[] = [];
  private _borders: O.Option<BorderSet> = O.none();
  private _onAllowDrop: O.Option<(dragNode: Node, dropInfo: DropInfo) => boolean> = O.none();
  private _onCreateTabSet: O.Option<(tabNode?: TabNode) => TabSetAttributes> = O.none();
  private _windows: Map<string, LayoutWindow> = new Map();
  private _rootWindow: O.Option<LayoutWindow> = O.none();

  // Static factory (required - cannot override constructor)
  static readonly new = (): IModel => {
    const instance = new IModel({ data: {} });
    instance._initialize();
    return instance;
  };

  static fromJson(json: UnsafeTypes.UnsafeAny, log?: boolean): IModel { ... }

  private _initialize(): void { ... }

  // Main action handler (16+ cases)
  doAction(action: Action): UnsafeTypes.UnsafeAny { ... }

  // Serialization
  toJson(): JsonModel { ... }

  // Getters/setters
  getRoot(windowId?: string): RowNode | undefined { ... }
  getBorderSet(): BorderSet { ... }
  getNodeById(id: string): Node | undefined { ... }
  addNode(node: Node): void { ... }
  // ... all other methods

  // Helpers
  tidy(): void { ... }
  visitNodes(fn: (node: Node, level: number) => void, node?: Node): void { ... }

  // Static helpers
  private static createAttributeDefinitions(): AttributeDefinitions { ... }
}
```

---

## Success Criteria

- [ ] Model.ts structure analyzed (719 lines)
- [ ] IModelData schema class created
- [ ] IModel schema class created with all private fields
- [ ] Static `new()` factory implemented
- [ ] Static `fromJson()` factory implemented
- [ ] `doAction()` implemented (all 16+ action cases)
- [ ] `toJson()` implemented
- [ ] All getter/setter methods implemented
- [ ] All helper methods implemented
- [ ] Original Model class UNCHANGED
- [ ] Type check passes: `turbo run check --filter=@beep/ui`
- [ ] Lint passes: `turbo run lint --filter=@beep/ui`
- [ ] REFLECTION_LOG.md updated

---

## Verification Commands

```bash
# Type check
turbo run check --filter=@beep/ui

# Lint
turbo run lint --filter=@beep/ui

# Verify classes exist
grep -n "class Model\|class IModel" packages/ui/ui/src/flexlayout-react/model/Model.ts

# Verify original unchanged (should only show additions)
git diff packages/ui/ui/src/flexlayout-react/model/Model.ts | head -100
```

---

## On Completion

If P5 succeeds, the FlexLayout Schema Creation project is **COMPLETE**:

1. Update REFLECTION_LOG.md with final summary
2. Create completion summary in README.md updates section
3. All schema classes created:
   - P1: IActions
   - P2: INode, INodeData
   - P3: ILayoutWindow, IBorderSet
   - P4: ITabNode, ITabSetNode, IBorderNode, IRowNode
   - P5: IModel

---

## Troubleshooting

### Circular reference errors
Model and Node have circular refs. Use type assertions:
```typescript
model.addNode(this as unknown as Node);
```

### Callback type mismatches
Callbacks expect original types. Use assertions:
```typescript
const result = O.getOrUndefined(this._onAllowDrop)?.(
  dragNode as unknown as Node,
  dropInfo
);
```

### Window management complexity
Multiple windows with complex lifecycle. Keep as `Map<string, LayoutWindow>`:
```typescript
private _windows: Map<string, LayoutWindow> = new Map();
```

### doAction complexity
16+ cases with complex logic. Copy verbatim and adapt field access:
```typescript
// Original: this.idMap.get(...)
// IModel:   this._idMap.get(...)
```

### Type narrowing
When Model methods return Node but need specific type:
```typescript
const node = this._idMap.get(id);
if (node instanceof TabSetNode) { ... }
```
