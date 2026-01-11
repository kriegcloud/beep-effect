# CONTEXT.md Review Report

## Summary

The CONTEXT.md provides a reasonable compressed reference for the docking system, but contains several inaccuracies in class signatures, outdated project structure information, and incomplete Effect patterns documentation. These issues could mislead sub-agents during implementation.

## Issues Found

### Issue 1: Project Structure Lists Non-Existent Files

- **File**: CONTEXT.md
- **Line(s)**: 10-11
- **Category**: Technical Accuracy
- **Severity**: Major
- **Problem**: The project structure shows `dock-location.ts` and `drop-info.ts` marked as "(COMPLETE)" but these are at the root level, not as listed. More importantly, `attribute.ts` and `attribute-definitions.ts` exist in the actual codebase but are not documented. The structure also omits many view files.
- **Suggested Fix**: Update the project structure to reflect actual file layout:
```
packages/ui/ui/src/flex-layout/
├── index.ts                 # Barrel exports
├── attribute.ts             # Attribute base class
├── attribute-definitions.ts # Attribute definitions
├── dock-location.ts         # DockLocation class (COMPLETE)
├── drop-info.ts             # DropInfo + DropTargetNode (COMPLETE)
├── orientation.ts           # HORZ/VERT enum
├── rect.ts                  # Rect geometry class (COMPLETE - includes contains method)
├── i18n-label.ts            # Internationalization
├── types.ts                 # Shared types
│
├── model/
│   ├── index.ts            # Model exports
│   ├── model.ts            # Main Model class (COMPLETE)
│   ├── action.model.ts     # Action base class
│   ├── actions.model.ts    # Action creators (COMPLETE)
│   ├── close-type.model.ts # CloseType enum
│   ├── json.model.ts       # JSON schema types
│   │
│   ├── node.ts             # Base Node class
│   ├── tab-node.ts         # TabNode (leaf, draggable)
│   ├── tab-set-node.ts     # TabSetNode (implements IDropTarget, IDraggable)
│   ├── row-node.ts         # RowNode (implements IDropTarget)
│   ├── border-node.ts      # BorderNode (edge panels)
│   ├── border-set.ts       # BorderSet (border container)
│   ├── layout-window.ts    # Window management
│   │
│   ├── draggable.ts        # IDraggable interface + Draggable schema
│   ├── drop-target.ts      # IDropTarget interface + DropTarget schema
│   └── utils.ts            # Utility functions
│
└── view/
    ├── index.ts            # View exports
    ├── layout.tsx          # React Layout component
    ├── tab-set.tsx         # TabSet React component
    ├── tab.tsx             # Tab React component
    ├── row.tsx             # Row React component
    ├── splitter.tsx        # Splitter component
    ├── drag-container.tsx  # Drag container
    └── ... (15+ more view files)
```

---

### Issue 2: DockLocation Class Signature Missing Fields

- **File**: CONTEXT.md
- **Line(s)**: 54-68
- **Category**: Technical Accuracy
- **Severity**: Major
- **Problem**: The DockLocation class signature shows it as a plain class, but the actual implementation extends `S.Class` from Effect Schema and includes additional fields (`orientation`, `indexPlus`) and methods (`getByName`, `getOrientation`, `getName`).
- **Suggested Fix**: Replace lines 54-68 with:
```typescript
class DockLocation extends S.Class<DockLocation>("DockLocation")({
  name: S.String,
  orientation: Orientation,
  indexPlus: S.Number,
}) {
  static TOP, BOTTOM, LEFT, RIGHT, CENTER: DockLocation;
  static values: Map<string, DockLocation>;

  // Get DockLocation by name
  static getByName(name: string): O.Option<DockLocation>;

  // Get dock position from mouse coordinates
  static getLocation(rect: Rect, x: number, y: number): DockLocation;

  getName(): string;
  getOrientation(): Orientation;

  // Get outline rect for this dock position
  getDockRect(r: Rect): Rect;

  // Split rect at this position
  split(rect: Rect, size: number): { start: Rect; end: Rect };

  // Get opposite location
  reflect(): DockLocation;
}
```

---

### Issue 3: DropInfo Uses DropTargetNode Not Generic Node

- **File**: CONTEXT.md
- **Line(s)**: 74-80
- **Category**: Technical Accuracy
- **Severity**: Minor
- **Problem**: The DropInfo class signature shows `node: DropTargetNode` but the comment says "Target node for the drop" which is correct. However, it doesn't clarify that DropTargetNode is itself a schema class with method schemas, not just an interface alias.
- **Suggested Fix**: Update the comment to clarify:
```typescript
class DropInfo extends S.Class<DropInfo>("DropInfo")({
  node: DropTargetNode,     // Schema class with getId, getRect, canDrop, drop, isEnableDrop methods
  rect: Rect,               // Outline rectangle to display
  location: DockLocation,   // Where to dock (CENTER, TOP, etc.)
  index: S.Number,          // Insert index
  className: S.String,      // CSS class for styling
}) {}
```

---

### Issue 4: IDraggable Interface Return Type Incorrect

- **File**: CONTEXT.md
- **Line(s)**: 96-100
- **Category**: Technical Accuracy
- **Severity**: Minor
- **Problem**: The `getName()` method in the IDraggable interface documentation returns `string`, but the actual implementation returns `string | undefined`.
- **Suggested Fix**: Update lines 96-100:
```typescript
interface IDraggable {
  isEnableDrag(): boolean;
  getName(): string | undefined;  // Can return undefined
}
```

---

### Issue 5: TabSetNode Class Signature Incorrect

- **File**: CONTEXT.md
- **Line(s)**: 104-119
- **Category**: Technical Accuracy
- **Severity**: Critical
- **Problem**: The TabSetNode signature is materially incorrect:
  1. Shows `extends TabSetAttributes` but actual implementation `extends S.Class<TabSetNode>(...)`
  2. Shows `selected: Option<number>` but actual is `selected: number` (with default 0)
  3. Shows `children: TabNode[]` but children are not stored on the class in the current implementation
  4. The `canDrop` and `drop` methods already exist as stub implementations
- **Suggested Fix**: Replace lines 104-119 with:
```typescript
class TabSetNode extends S.Class<TabSetNode>("TabSetNode")({
  // ... many fields from NodeFields and TabSet-specific fields
  type: S.optionalWith(S.Literal("tabset"), { default: () => "tabset" }),
  selected: S.optionalWith(S.Number, { default: () => 0 }),
  name: S.optionalWith(S.String, { as: "Option" }),
  enableDrop: S.optionalWith(S.Boolean, { as: "Option" }),
  enableDrag: S.optionalWith(S.Boolean, { as: "Option" }),
  // ... more fields
  rect: Rect,
  tabStripRect: Rect,
  contentRect: Rect,
}) implements IDraggable, IDropTarget {
  // Accessors
  getId(): string | undefined;
  getRect(): Rect;
  getSelected(): number;

  // IDraggable implementation
  isEnableDrag(): boolean;
  getName(): string | undefined;

  // IDropTarget implementation (STUB - needs full logic)
  isEnableDrop(): boolean;
  canDrop(dragNode: IDraggable, x: number, y: number): DropInfo | undefined;
  drop(dragNode: IDraggable, location: DockLocation, index: number, select?: boolean): void;
}
```

---

### Issue 6: RowNode Class Signature Incorrect

- **File**: CONTEXT.md
- **Line(s)**: 122-134
- **Category**: Technical Accuracy
- **Severity**: Major
- **Problem**: The RowNode signature is incorrect:
  1. Shows `extends RowAttributes` but actual implementation uses Effect Schema
  2. Shows `children: (TabSetNode | RowNode)[]` but children are not stored on the class
  3. Shows `findDropTargetNode` method that doesn't exist on RowNode (exists on Model)
  4. Actual implementation has `canDrop` as stub, not "NEEDS IMPLEMENTATION"
- **Suggested Fix**: Replace lines 122-134 with:
```typescript
class RowNode extends S.Class<RowNode>("RowNode")({
  id: S.optionalWith(S.String, { as: "Option" }),
  type: S.optionalWith(S.Literal("row"), { default: () => "row" }),
  weight: S.optionalWith(S.Number, { default: () => 100 }),
  rect: S.optionalWith(Rect, { default: Rect.empty }),
  windowId: S.optionalWith(S.String, { default: () => "" }),
  minWidth: S.optionalWith(S.Number, { default: () => 0 }),
  maxWidth: S.optionalWith(S.Number, { default: () => 0 }),
  minHeight: S.optionalWith(S.Number, { default: () => 0 }),
  maxHeight: S.optionalWith(S.Number, { default: () => 0 }),
}) implements IDropTarget {
  // IDropTarget implementation (STUB - needs full logic)
  canDrop(dragNode: IDraggable, x: number, y: number): DropInfo | undefined;
  drop(dragNode: IDraggable, location: DockLocation, index: number, select?: boolean): void;
  isEnableDrop(): boolean;  // Always returns true

  // Utility
  isRoot(): boolean;
  toJson(): { id?: string; type: "row"; weight: number };
}
```

---

### Issue 7: Model Class Heavily Underspecified

- **File**: CONTEXT.md
- **Line(s)**: 137-149
- **Category**: Technical Accuracy
- **Severity**: Critical
- **Problem**: The Model class documentation is severely incomplete. The actual Model class has:
  - Full implementation of `doAction` that handles 10+ action types
  - Full tree traversal methods (`walkNodes`, `getNodeById`, `getParent`)
  - `calculateLayout` method for computing layout rectangles
  - Factory methods (`fromJson`, `fromJsonSync`, `empty`)
  - Private lookup maps (`_nodeIdMap`, `_parentMap`)

  The documentation shows `findDropTargetNode` as "NEEDS IMPLEMENTATION" but this method doesn't exist. The drag-drop coordinate handling happens at the view layer.
- **Suggested Fix**: Replace lines 137-149 with:
```typescript
class Model extends S.Class<Model>("Model")({
  borders: S.optionalWith(BorderSet, { default: BorderSet.empty }),
  rootLayout: S.optionalWith(JsonRowNode, { as: "Option" }),
  globalAttributes: S.optionalWith(GlobalAttributes, { ... }),
  splitterSize: S.optionalWith(S.Number, { default: () => 8 }),
  rootOrientationVertical: S.optionalWith(S.Boolean, { default: () => false }),
  enableEdgeDock: S.optionalWith(S.Boolean, { default: () => true }),
  borderSize: S.optionalWith(S.Number, { default: () => 200 }),
  activeTabSetId: S.optionalWith(S.String, { as: "Option" }),
  maximizedTabSetId: S.optionalWith(S.String, { as: "Option" }),
}) {
  // Factory methods
  static empty(): Model;
  static fromJson(json: unknown): Effect.Effect<Model, ParseError>;
  static fromJsonSync(json: unknown): Model;

  // Tree traversal (COMPLETE)
  walkNodes(visitor: (node: LayoutNode) => void): void;
  getNodeById(id: string): O.Option<LayoutNode>;
  getParent(nodeId: string): O.Option<LayoutNode>;
  getTabById(id: string): O.Option<JsonTabNode>;
  getTabSetById(id: string): O.Option<JsonTabSetNode>;

  // Action handling (COMPLETE)
  doAction(action: Action): Model;

  // Layout calculation (COMPLETE)
  calculateLayout(containerRect: Rect): Model;

  // Accessors
  getRoot(): O.Option<JsonRowNode>;
  getBorderSet(): BorderSet;
  getActiveTabSetId(): O.Option<string>;
  getMaximizedTabSetId(): O.Option<string>;
  getRootOrientation(): Orientation;

  toJson(): JsonModel;
}

// NOTE: findDropTargetNode does NOT exist on Model.
// Drop target detection is handled in the Layout view component.
```

---

### Issue 8: Rect Class Missing Method

- **File**: CONTEXT.md
- **Line(s)**: 204-218
- **Category**: Technical Accuracy
- **Severity**: Minor
- **Problem**: The Rect class documentation shows `contains` with "MAY NEED TO ADD" comment, but the actual implementation already has the `contains` method implemented.
- **Suggested Fix**: Replace lines 215-217 with:
```typescript
  // ALREADY IMPLEMENTED:
  contains(x: number, y: number): boolean;

  // Additional methods available:
  removeInsets(insets: Insets): Rect;
  centerInRect(outerRect: Rect): Rect;
  snap(round: number): Rect;
  relativeTo(r: Rect | DOMRect): Rect;
  equals(rect: Rect | null | undefined): boolean;
  getCenter(): { x: number; y: number };
```

---

### Issue 9: Actions Documentation Incomplete

- **File**: CONTEXT.md
- **Line(s)**: 188-200
- **Category**: Compression
- **Severity**: Minor
- **Problem**: The Actions documentation shows a simplified function signature but the actual implementation has more parameters. For example, `moveNode` has 5 parameters, not 4 as implied. Also missing several important actions.
- **Suggested Fix**: Replace lines 188-200 with:
```typescript
// Tab Operations
Actions.addNode(json, toNodeId, location: DockLocation, index, select?)
Actions.moveNode(fromNodeId, toNodeId, location: DockLocation, index, select?)
Actions.deleteTab(nodeId)
Actions.selectTab(nodeId)
Actions.renameTab(nodeId, text)

// TabSet Operations
Actions.deleteTabset(nodeId)
Actions.setActiveTabset(tabsetNodeId, windowId?)
Actions.maximizeToggle(nodeId, windowId?)

// Layout Operations
Actions.adjustWeights(nodeId, weights: readonly number[])
Actions.adjustBorderSplit(nodeId, pos)
Actions.updateNodeAttributes(nodeId, attributes)
Actions.updateModelAttributes(attributes)

// Window Operations (partial implementation)
Actions.popoutTab(nodeId)
Actions.popoutTabset(nodeId)
Actions.closeWindow(windowId)
Actions.createWindow(layout, rect)
```

---

### Issue 10: Effect Patterns Missing Critical Utilities

- **File**: CONTEXT.md
- **Line(s)**: 220-243
- **Category**: Effect Patterns
- **Severity**: Major
- **Problem**: The Effect patterns section is missing several utilities used throughout the actual codebase:
  1. Missing `S.Class` usage pattern for schema-based classes
  2. Missing `S.optionalWith` pattern extensively used in node schemas
  3. Missing `@beep/utils` thunk utilities (`thunk`, `thunkZero`, `thunkTrue`, `thunkFalse`, `thunkEmptyStr`)
  4. Missing `P.isTagged` for Option type checking
  5. Missing `A.findFirstIndex`, `A.insertAt`, `A.remove`, `A.replaceOption` used in Model

- **Suggested Fix**: Add after line 243:
```typescript
// Schema Class pattern (used throughout flex-layout)
import * as S from "effect/Schema";
import { $UiId } from "@beep/identity/packages";

const $I = $UiId.create("flex-layout/some-module");

class MyNode extends S.Class<MyNode>($I`MyNode`)(
  {
    field: S.optionalWith(S.String, { as: "Option" }),
    fieldWithDefault: S.optionalWith(S.Number, { default: () => 0 }),
  },
  $I.annotations("MyNode", { description: "..." })
) {
  // Instance methods
}

// Thunk utilities from @beep/utils (for schema defaults)
import { thunk, thunkZero, thunkTrue, thunkFalse, thunkEmptyStr, noOp } from "@beep/utils";

S.optionalWith(S.Number, { default: thunkZero })
S.optionalWith(S.Boolean, { default: thunkTrue })
S.optionalWith(S.Boolean, { default: thunkFalse })
S.optionalWith(S.String, { default: thunkEmptyStr })
S.optionalWith(Rect, { default: Rect.empty })

// Additional Array operations used in Model
A.findFirstIndex(array, predicate)  // Returns Option<number>
A.insertAt(array, index, element)   // Returns Option<Array>
A.remove(array, index)              // Returns Array
A.replaceOption(array, index, elem) // Returns Option<Array>
A.get(array, index)                 // Returns Option<element>

// Option type checking
P.isTagged("Some")(option)  // Type guard for Option.isSome
P.isTagged("None")(option)  // Type guard for Option.isNone
```

---

### Issue 11: Legacy Reference Lines Likely Inaccurate

- **File**: CONTEXT.md
- **Line(s)**: 265-271
- **Category**: Usability
- **Severity**: Minor
- **Problem**: The legacy reference locations table provides specific line numbers that are likely to drift as code changes. Without verification, these could be misleading.
- **Suggested Fix**: Either verify the line numbers are correct, or change to more resilient references:
```markdown
## Legacy Reference Locations

| Feature | Legacy File | Search Pattern |
|---------|-------------|----------------|
| TabSetNode.canDrop | `tmp/FlexLayout/src/model/TabSetNode.ts` | `canDrop(` |
| RowNode.canDrop | `tmp/FlexLayout/src/model/RowNode.ts` | `canDrop(` |
| Model drop handling | `tmp/FlexLayout/src/model/Model.ts` | `findDropTargetNode` |
| Drag handlers | `tmp/FlexLayout/src/view/Layout.tsx` | `onDrag` |
| Demo drag | `tmp/FlexLayout/demo/App.tsx` | `onRenderDragRect` |

Note: Line numbers may have shifted. Use search patterns instead.
```

---

### Issue 12: Missing Import for BS.Fn Pattern

- **File**: CONTEXT.md
- **Line(s)**: 220-243
- **Category**: Effect Patterns
- **Severity**: Minor
- **Problem**: The DropTargetNode and Draggable schemas use `BS.Fn` from `@beep/schema` for method schemas, but this pattern is not documented in the Effect Patterns section.
- **Suggested Fix**: Add to Effect Patterns section:
```typescript
// Method schemas using BS.Fn (from @beep/schema)
import { BS } from "@beep/schema";

// Define method schemas for protocol interfaces
canDrop: BS.Fn({
  input: S.Tuple(Draggable, S.Number, S.Number),
  output: S.UndefinedOr(DropInfo),
}),

isEnableDrop: BS.Fn({
  output: S.Boolean,
}),
```

---

### Issue 13: View Layer Not Documented

- **File**: CONTEXT.md
- **Line(s)**: 37-38
- **Category**: Compression
- **Severity**: Major
- **Problem**: The project structure shows only `layout.tsx (partial)` for the view layer, but there are 19+ view files. The actual drag-and-drop handlers, drop target detection, and UI rendering happen in these view components (especially `layout.tsx` which is 62K+ lines). Sub-agents need to know where the UI integration happens.
- **Suggested Fix**: Add a View Layer section:
```markdown
## View Layer Components

The view layer in `packages/ui/ui/src/flex-layout/view/` handles React rendering and drag-drop UI:

| File | Purpose |
|------|---------|
| `layout.tsx` | Main Layout component with drag handlers (62K lines) |
| `tab-set.tsx` | TabSet rendering with drop targets (34K lines) |
| `tab.tsx` | Individual tab rendering |
| `row.tsx` | Row rendering with splitters |
| `splitter.tsx` | Splitter between panes |
| `drag-container.tsx` | Drag preview container |
| `border-tab-set.tsx` | Border panel rendering |

**Key Integration Points:**
- Drop target detection: `layout.tsx` onDragOver handlers
- Drop indicator rendering: `layout.tsx` using `DropInfo.rect`
- Action dispatch: Components call `model.doAction(Actions.*)`
```

---

## Improvements Not Implemented (Opportunities)

1. **Type Guards Section**: The codebase has `isDraggable` and `isDropTarget` predicates that could be useful for sub-agents.

2. **BorderNode/BorderSet Documentation**: These are complete but not documented in CONTEXT.md. Border docking is a significant feature.

3. **JsonModel Schema Documentation**: The JSON serialization format (`JsonRowNode`, `JsonTabSetNode`, `JsonTabNode`, `JsonBorderNode`) would help agents understand data flow.

4. **Error Handling Patterns**: How Effects and ParseError are used in `Model.fromJson()`.

5. **Layout Calculation Algorithm**: The `calculateLayout` method is complete and the algorithm could be documented.

6. **Real Examples**: Adding concrete code examples from the actual implementation would improve usability.

## Verdict

**NEEDS_FIXES**

The CONTEXT.md has fundamental technical inaccuracies that will mislead sub-agents:
- Critical: Model and TabSetNode signatures are materially wrong
- Major: Classes use Effect Schema patterns not documented
- Major: Several "NEEDS IMPLEMENTATION" items are actually stub-implemented
- Major: Missing view layer documentation where drop handling occurs

These issues require correction before sub-agents can effectively use this context for implementation work.
