# Docking System Technical Context

> Compressed reference for orchestration agents. Contains key technical details without requiring file reads.

## Project Structure

```
packages/ui/ui/src/flex-layout/
├── index.ts                 # Barrel exports
├── dock-location.ts         # DockLocation class (COMPLETE)
├── drop-info.ts            # DropInfo + DropTargetNode (COMPLETE)
├── orientation.ts          # HORZ/VERT enum
├── rect.ts                 # Rect geometry class
├── i18n-label.ts           # Internationalization
├── types.ts                # Shared types
│
├── model/
│   ├── index.ts            # Model exports
│   ├── model.ts            # Main Model class
│   ├── action.model.ts     # Action base class
│   ├── actions.model.ts    # Action creators (ADD_NODE, MOVE_NODE, etc.)
│   ├── close-type.model.ts # CloseType enum
│   ├── json.model.ts       # JSON schema types
│   │
│   ├── node.ts             # Base Node class
│   ├── tab-node.ts         # TabNode (leaf, draggable)
│   ├── tab-set-node.ts     # TabSetNode (container, drop target)
│   ├── row-node.ts         # RowNode (layout, contains children)
│   ├── border-node.ts      # BorderNode (edge panels)
│   ├── border-set.ts       # BorderSet (border container)
│   ├── layout-window.ts    # Window management
│   │
│   ├── draggable.ts        # IDraggable interface
│   ├── drop-target.ts      # IDropTarget interface
│   └── utils.ts            # Utility functions
│
└── view/
    └── layout.tsx          # React Layout component (partial)

tmp/FlexLayout/              # Legacy reference (DO NOT MODIFY)
├── src/
│   ├── model/              # Model implementations
│   ├── view/               # React components
│   └── DockLocation.ts
└── demo/
    └── App.tsx             # Demo application
```

## Key Classes Summary

### DockLocation (COMPLETE)

```typescript
class DockLocation extends S.Class<DockLocation>("DockLocation")({
  name: S.String,
  orientation: Orientation,
  indexPlus: S.Number,
}) {
  static TOP, BOTTOM, LEFT, RIGHT, CENTER: DockLocation;
  static values: Map<string, DockLocation>;

  // Get DockLocation by name
  static readonly getByName = (name: string): O.Option<DockLocation> => { /* */ }

  // Get dock position from mouse coordinates
  static readonly getLocation = (rect: Rect, x: number, y: number): DockLocation => { /* */ };

  readonly getName = (): string => { /* */ };
  readonly getOrientation = (): Orientation => { /* */ };

  // Get outline rect for this dock position
  readonly getDockRect = (r: Rect): Rect => { /* */ };

  // Split rect at this position
  readonly split = (rect: Rect, size: number): { start: Rect; end: Rect } => { /* */ };

  // Get opposite location
  readonly reflect = (): DockLocation => { /* */ };
}
```

### DropInfo (COMPLETE)

```typescript
class DropInfo {
  node: DropTargetNode;  // Target node for the drop
  rect: Rect;            // Outline rectangle to display
  location: DockLocation; // Where to dock (CENTER, TOP, etc.)
  index: number;         // Insert index
  className: string;     // CSS class for styling
}
```

### IDropTarget Interface (COMPLETE)

```typescript
interface IDropTarget {
  canDrop(dragNode: IDraggable, x: number, y: number): DropInfo | undefined;
  drop(dragNode: IDraggable, location: DockLocation, index: number, select?: boolean): void;
  isEnableDrop(): boolean;
}
```

### IDraggable Interface (COMPLETE)

```typescript
interface IDraggable {
  isEnableDrag(): boolean;
  getName(): string | undefined;  // Can return undefined
}
```

### TabSetNode (STUB canDrop - needs full logic)

```typescript
class TabSetNode extends S.Class<TabSetNode>("TabSetNode")({
  // Includes NodeFields (id, rect, weight, windowId)
  type: S.optionalWith(S.Literal("tabset"), { default: () => "tabset" }),
  selected: S.optionalWith(S.Number, { default: () => 0 }),  // Index, not Option
  name: S.optionalWith(S.String, { as: "Option" }),
  enableDrop: S.optionalWith(S.Boolean, { as: "Option" }),
  enableDrag: S.optionalWith(S.Boolean, { as: "Option" }),
  enableDivide: S.optionalWith(S.Boolean, { as: "Option" }),
  enableMaximize: S.optionalWith(S.Boolean, { as: "Option" }),
  // ... more optional fields
  tabStripRect: S.optionalWith(Rect, { default: Rect.empty }),
  contentRect: S.optionalWith(Rect, { default: Rect.empty }),
}) implements IDraggable, IDropTarget {
  // Accessors
  getId(): string | undefined;
  getRect(): Rect;
  getSelected(): number;

  // IDraggable implementation
  isEnableDrag(): boolean;
  getName(): string | undefined;

  // IDropTarget implementation (STUB - returns undefined, needs full logic)
  isEnableDrop(): boolean;
  canDrop(dragNode: IDraggable, x: number, y: number): DropInfo | undefined;
  drop(dragNode: IDraggable, location: DockLocation, index: number, select?: boolean): void;
}
```

### RowNode (STUB canDrop - needs full logic)

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
  // IDropTarget implementation (STUB - returns undefined, needs full logic)
  canDrop(dragNode: IDraggable, x: number, y: number): DropInfo | undefined;
  drop(dragNode: IDraggable, location: DockLocation, index: number, select?: boolean): void;
  isEnableDrop(): boolean;  // Always returns true

  // Utility
  isRoot(): boolean;
  toJson(): { id?: string; type: "row"; weight: number };
}

// NOTE: findDropTargetNode does NOT exist on RowNode.
// Tree traversal for drop targets is done by Model.walkNodes() or view layer.
```

### Model (COMPLETE - no findDropTargetNode method)

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

  // Action handling (COMPLETE - handles 10+ action types)
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
// Drop target detection is handled in the view layer (Layout component).
```

## DockLocation Algorithm Detail

The `getLocation` algorithm divides a rect into zones:

```
+-------+-------+-------+
|       | TOP   |       |
|  LEFT +-------+ RIGHT |
|       |CENTER |       |
|       +-------+       |
|       |BOTTOM |       |
+-------+-------+-------+
```

**Zone detection:**
```typescript
// Normalize to 0-1
x = (x - rect.x) / rect.width;
y = (y - rect.y) / rect.height;

// CENTER: inner 50% square
if (x >= 0.25 && x < 0.75 && y >= 0.25 && y < 0.75) {
  return CENTER;
}

// Edge detection via diagonal
const bl = y >= x;      // bottom-left diagonal
const br = y >= 1 - x;  // bottom-right diagonal

if (bl && br) return BOTTOM;
if (bl && !br) return LEFT;
if (!bl && br) return RIGHT;
return TOP;
```

## Actions (COMPLETE)

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

## Rect Class (COMPLETE)

```typescript
class Rect extends S.Class<Rect>("Rect")({
  x: S.Number,
  y: S.Number,
  width: S.Number,
  height: S.Number,
}) {
  static empty(): Rect;
  static fromJson(json: {...}): Rect;
  static getBoundingClientRect(element: Element): Rect;

  getBottom(): number;  // y + height
  getRight(): number;   // x + width
  clone(): Rect;
  equals(rect: Rect | null | undefined): boolean;
  getCenter(): { x: number; y: number };

  // ALREADY IMPLEMENTED:
  contains(x: number, y: number): boolean;
  removeInsets(insets: Insets): Rect;
  centerInRect(outerRect: Rect): Rect;
  snap(round: number): Rect;
  relativeTo(r: Rect | DOMRect): Rect;
}
```

## Effect Patterns Required

```typescript
// Imports
import * as O from "effect/Option";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import * as P from "effect/Predicate";
import { thunk, thunkZero, thunkTrue, thunkFalse, thunkEmptyStr } from "@beep/utils";

// Option handling
O.getOrElse(option, () => defaultValue)
O.getOrUndefined(option)           // Returns T | undefined
O.fromNullable(value)
O.isSome(option)
O.isNone(option)
O.map(option, fn)
O.flatMap(option, fn)

// Array operations (NEVER use native methods)
A.map(array, fn)
A.filter(array, predicate)
A.findFirst(array, predicate)
A.findFirstIndex(array, predicate)  // Returns Option<number>
A.reduce(array, initial, fn)
A.insertAt(array, index, element)   // Returns Option<Array>
A.remove(array, index)              // Returns Array
A.replaceOption(array, index, elem) // Returns Option<Array>
A.get(array, index)                 // Returns Option<element>

// Schema Class pattern (used throughout flex-layout)
class MyNode extends S.Class<MyNode>("MyNode")({
  field: S.optionalWith(S.String, { as: "Option" }),
  fieldWithDefault: S.optionalWith(S.Number, { default: () => 0 }),
  // Use thunk utilities for defaults
  weight: S.optionalWith(S.Number, { default: thunkZero }),
  enabled: S.optionalWith(S.Boolean, { default: thunkTrue }),
}) {
  // Instance methods
}

// Option type checking with Predicate
P.isTagged("Some")(option)  // Type guard for Option.isSome
P.isTagged("None")(option)  // Type guard for Option.isNone

// Type guards (actual codebase uses type field, not instanceof)
const isTabSetNode = (n: LayoutNode): n is JsonTabSetNode => n.type === "tabset";
const isRowNode = (n: LayoutNode): n is JsonRowNode => n.type === "row";
const isTabNode = (n: LayoutNode): n is JsonTabNode => n.type === "tab";
```

## CSS Classes

```css
/* Drop indicator classes */
.flexlayout__tabset_drop_target { }
.flexlayout__border_drop_target { }
.flexlayout__row_drop_target { }

/* Outline styles (add to globals or component) */
.flexlayout__drop_indicator {
  position: absolute;
  background: rgba(0, 120, 215, 0.2);
  border: 2px dashed rgba(0, 120, 215, 0.6);
  pointer-events: none;
  transition: all 150ms ease-out;
}
```

## Legacy Reference Locations

| Feature | Legacy File | Search Pattern |
|---------|-------------|----------------|
| TabSetNode.canDrop | `tmp/FlexLayout/src/model/TabSetNode.ts` | `canDrop(` |
| RowNode.canDrop | `tmp/FlexLayout/src/model/RowNode.ts` | `canDrop(` |
| Model drop handling | `tmp/FlexLayout/src/model/Model.ts` | `findDropTargetNode` |
| Drag handlers | `tmp/FlexLayout/src/view/Layout.tsx` | `onDrag` |
| Demo drag | `tmp/FlexLayout/demo/App.tsx` | `onRenderDragRect` |

Note: Line numbers may have shifted. Use search patterns instead.

## Verification Commands

```bash
# Type check
bun run check --filter @beep/ui

# Build
bun run build --filter @beep/ui

# Test
bun run test --filter @beep/ui

# Lint
bun run lint:fix --filter @beep/ui

# Demo check
bun run check --filter @beep/todox
```

## Common Errors & Fixes

### Error: Property 'canDrop' does not exist on type 'TabSetNode'
**Fix:** Implement the method on the class

### Error: Cannot find name 'DropInfo'
**Fix:** Add import: `import { DropInfo } from "../drop-info";`

### Error: Type 'undefined' is not assignable to type 'DropInfo'
**Fix:** Return type should be `DropInfo | undefined`

### Error: Native array method detected
**Fix:** Replace `.map()` with `A.map()`, etc.
