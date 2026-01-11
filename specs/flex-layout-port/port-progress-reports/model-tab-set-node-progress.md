# Port Progress Report: TabSetNode.ts

## Summary

| Metric | Value |
|--------|-------|
| **File** | `model/TabSetNode.ts` -> `model/tab-set-node.ts` |
| **Completion Status** | **Partial (55-60%)** |
| **Schema/Data Model** | Complete |
| **Accessors** | Complete |
| **Core Operations** | Incomplete |
| **Tree Manipulation** | Missing |

The port successfully converts the TabSetNode from a class-based OOP pattern to an Effect Schema-based data model with accessor methods. However, the **critical operational methods** for drag-and-drop, tree manipulation, and model interaction are either stubbed or missing entirely.

---

## Original Analysis

### Source File
`/home/elpresidank/YeeBois/projects/beep-effect/tmp/FlexLayout/src/model/TabSetNode.ts`

### Class Structure

```typescript
export class TabSetNode extends Node implements IDraggable, IDropTarget {
  // Static members
  static readonly TYPE = "tabset";
  static fromJson(json: any, model: Model, layoutWindow: LayoutWindow): TabSetNode;
  static getAttributeDefinitions(): AttributeDefinitions;
  private static attributeDefinitions: AttributeDefinitions;
  private static createAttributeDefinitions(): AttributeDefinitions;

  // Instance fields (all @internal)
  private tabStripRect: Rect;
  private contentRect: Rect;
  private calculatedMinHeight: number;
  private calculatedMinWidth: number;
  private calculatedMaxHeight: number;
  private calculatedMaxWidth: number;

  // Constructor
  constructor(model: Model, json: any);

  // Methods (detailed below)
}
```

### All Methods in Original (33 total)

| Method | Visibility | Type | Description |
|--------|------------|------|-------------|
| `fromJson` | static | Factory | Deserialize from JSON, set up model references |
| `getAttributeDefinitions` | static | Meta | Return attribute definitions |
| `createAttributeDefinitions` | static private | Meta | Build attribute schema |
| `getName` | public | Accessor | Get name attribute |
| `isEnableActiveIcon` | public | Accessor | Check enableActiveIcon flag |
| `getSelected` | public | Accessor | Get selected tab index |
| `getSelectedNode` | public | Accessor | Get selected tab child node |
| `getWeight` | public | Accessor | Get weight attribute |
| `getAttrMinWidth` | public | Accessor | Get minWidth attribute |
| `getAttrMinHeight` | public | Accessor | Get minHeight attribute |
| `getMinWidth` | public | Accessor | Get calculated min width |
| `getMinHeight` | public | Accessor | Get calculated min height |
| `getMinSize` | internal | Accessor | Get min size by orientation |
| `getAttrMaxWidth` | public | Accessor | Get maxWidth attribute |
| `getAttrMaxHeight` | public | Accessor | Get maxHeight attribute |
| `getMaxWidth` | public | Accessor | Get calculated max width |
| `getMaxHeight` | public | Accessor | Get calculated max height |
| `getMaxSize` | internal | Accessor | Get max size by orientation |
| `getConfig` | public | Accessor | Get config attribute |
| `isMaximized` | public | Query | Check if tabset is maximized |
| `isActive` | public | Query | Check if tabset is active |
| `isEnableDeleteWhenEmpty` | public | Accessor | Check enableDeleteWhenEmpty flag |
| `isEnableDrop` | public | Accessor | Check enableDrop flag |
| `isEnableTabWrap` | public | Accessor | Check enableTabWrap flag |
| `isEnableDrag` | public | Accessor | Check enableDrag flag |
| `isEnableDivide` | public | Accessor | Check enableDivide flag |
| `isEnableMaximize` | public | Accessor | Check enableMaximize flag |
| `isEnableClose` | public | Accessor | Check enableClose flag |
| `isEnableSingleTabStretch` | public | Accessor | Check enableSingleTabStretch flag |
| `isEnableTabStrip` | public | Accessor | Check enableTabStrip flag |
| `isAutoSelectTab` | public | Accessor | Check autoSelectTab flag |
| `isEnableTabScrollbar` | public | Accessor | Check enableTabScrollbar flag |
| `getClassNameTabStrip` | public | Accessor | Get classNameTabStrip attribute |
| `getTabLocation` | public | Accessor | Get tabLocation attribute |
| `toJson` | public | Serialization | Serialize to JSON |
| `calcMinMaxSize` | internal | Layout | Calculate min/max constraints from children |
| `canMaximize` | internal | Query | Check if maximize is allowed |
| `setContentRect` | internal | Mutator | Set content rectangle |
| `getContentRect` | internal | Accessor | Get content rectangle |
| `setTabStripRect` | internal | Mutator | Set tab strip rectangle |
| `setWeight` | internal | Mutator | Set weight attribute |
| `setSelected` | internal | Mutator | Set selected index |
| `getWindowId` | public | Accessor | Get parent window ID |
| `canDrop` | internal | DnD | Check if drag node can drop here |
| `delete` | internal | Tree | Remove self from parent |
| `remove` | internal | Tree | Remove child tab, tidy model |
| `drop` | internal | DnD | Execute drop operation |
| `updateAttrs` | internal | Mutator | Update attributes from JSON |
| `getAttributeDefinitions` | internal | Meta | Return attribute definitions |

### Dependencies (Original)

| Import | Usage |
|--------|-------|
| `Attribute` | Attribute type constants |
| `AttributeDefinitions` | Schema definition system |
| `DockLocation` | Drop location enum |
| `DropInfo` | Drop operation data |
| `Orientation` | Layout direction |
| `Rect` | Rectangle geometry |
| `CLASSES` | CSS class constants |
| `canDockToWindow` | Window docking check |
| `BorderNode` | Cross-node type reference |
| `IDraggable` | Draggable interface |
| `IDropTarget` | Drop target interface |
| `IJsonTabSetNode` | JSON serialization type |
| `LayoutWindow` | Window context |
| `Model` | Root model reference |
| `Node` | Base node class |
| `RowNode` | Row node type |
| `TabNode` | Tab node type |
| `adjustSelectedIndex` | Selection utility |

---

## Port Analysis

### Target File
`/home/elpresidank/YeeBois/projects/beep-effect/packages/ui/ui/src/flex-layout/model/tab-set-node.ts`

### Architecture Approach

The port uses **Effect Schema Class pattern** instead of traditional OOP inheritance:

```typescript
export class TabSetNode
  extends S.Class<TabSetNode>($I`TabSetNode`)(
    {
      ...NodeFields,
      // Schema fields...
    },
    $I.annotations("TabSetNode", {...})
  )
  implements IDraggable, IDropTarget
{
  // Methods as class members
}
```

### Ported Features

| Feature | Status | Notes |
|---------|--------|-------|
| TYPE constant | Implicit | Encoded in schema as `type: S.Literal("tabset")` |
| Schema fields | Complete | All 24+ attributes ported with Effect Schema types |
| Runtime fields | Complete | `tabStripRect`, `contentRect`, `calculatedMin/Max*` |
| Accessor methods | Complete | All `is*`, `get*` methods implemented |
| Interface implementation | Partial | `IDraggable`, `IDropTarget` declared but stubbed |
| `toString()` | Added | New method for debugging |

### Missing/Incomplete Features

| Method | Status | Impact |
|--------|--------|--------|
| `fromJson` | **Missing** | Cannot deserialize from JSON with model context |
| `toJson` | **Missing** | Cannot serialize to JSON |
| `canDrop` | **Stubbed** | Returns `undefined` - DnD inoperable |
| `drop` | **Stubbed** | No-op - DnD inoperable |
| `delete` | **Missing** | Cannot remove from tree |
| `remove` | **Missing** | Cannot remove child tabs |
| `calcMinMaxSize` | **Missing** | Layout constraints not calculated |
| `canMaximize` | **Missing** | Maximize logic not available |
| `setContentRect` | **Missing** | Cannot update layout rectangles |
| `setTabStripRect` | **Missing** | Cannot update layout rectangles |
| `setWeight` | **Missing** | Cannot update weight |
| `setSelected` | **Missing** | Cannot change selection |
| `getWindowId` | **Missing** | No window context |
| `getSelectedNode` | **Missing** | Cannot get selected child |
| `getMinSize` | **Missing** | No orientation-based accessor |
| `getMaxSize` | **Missing** | No orientation-based accessor |
| `updateAttrs` | **Missing** | Cannot update from JSON |
| `createAttributeDefinitions` | **N/A** | Replaced by Schema fields |
| `getAttributeDefinitions` | **N/A** | Replaced by Schema fields |

---

## Detailed Comparison

### 1. Schema/Data Model (100% Complete)

All serialized attributes are present with correct types:

| Original Attribute | Port Field | Type Mapping |
|-------------------|------------|--------------|
| `type` | `type` | `S.Literal("tabset")` |
| `id` | `id` | `S.optionalWith(S.String, { as: "Option" })` |
| `weight` | `weight` | `S.Number` (in NodeFields) |
| `selected` | `selected` | `S.optionalWith(S.Number, { default: thunkZero })` |
| `name` | `name` | `S.optionalWith(S.String, { as: "Option" })` |
| `config` | `config` | `S.optionalWith(S.Unknown, { as: "Option" })` |
| `enableDeleteWhenEmpty` | `enableDeleteWhenEmpty` | `S.optionalWith(S.Boolean, { as: "Option" })` |
| `enableDrop` | `enableDrop` | `S.optionalWith(S.Boolean, { as: "Option" })` |
| `enableDrag` | `enableDrag` | `S.optionalWith(S.Boolean, { as: "Option" })` |
| `enableDivide` | `enableDivide` | `S.optionalWith(S.Boolean, { as: "Option" })` |
| `enableMaximize` | `enableMaximize` | `S.optionalWith(S.Boolean, { as: "Option" })` |
| `enableClose` | `enableClose` | `S.optionalWith(S.Boolean, { as: "Option" })` |
| `enableSingleTabStretch` | `enableSingleTabStretch` | `S.optionalWith(S.Boolean, { as: "Option" })` |
| `enableTabStrip` | `enableTabStrip` | `S.optionalWith(S.Boolean, { as: "Option" })` |
| `autoSelectTab` | `autoSelectTab` | `S.optionalWith(S.Boolean, { as: "Option" })` |
| `enableActiveIcon` | `enableActiveIcon` | `S.optionalWith(S.Boolean, { as: "Option" })` |
| `enableTabScrollbar` | `enableTabScrollbar` | `S.optionalWith(S.Boolean, { as: "Option" })` |
| `enableTabWrap` | `enableTabWrap` | `S.optionalWith(S.Boolean, { as: "Option" })` |
| `tabLocation` | `tabLocation` | `S.optionalWith(TabLocation, { as: "Option" })` |
| `minWidth` | `minWidth` | `S.optionalWith(S.Number, { as: "Option" })` |
| `minHeight` | `minHeight` | `S.optionalWith(S.Number, { as: "Option" })` |
| `maxWidth` | `maxWidth` | `S.optionalWith(S.Number, { as: "Option" })` |
| `maxHeight` | `maxHeight` | `S.optionalWith(S.Number, { as: "Option" })` |
| `classNameTabStrip` | `classNameTabStrip` | `S.optionalWith(S.String, { as: "Option" })` |

### 2. Accessor Methods (95% Complete)

| Original | Port | Notes |
|----------|------|-------|
| `getName()` | `getName()` | Uses `O.getOrUndefined` |
| `isEnableActiveIcon()` | `isEnableActiveIcon()` | Uses `O.getOrElse` with thunk |
| `getSelected()` | `getSelected()` | Direct property access |
| `getWeight()` | (inherited) | In NodeFields |
| `getAttrMinWidth()` | - | Missing - use `minWidth` directly |
| `getAttrMinHeight()` | - | Missing - use `minHeight` directly |
| `getMinWidth()` | `getCalculatedMinWidth()` | Renamed |
| `getMinHeight()` | `getCalculatedMinHeight()` | Renamed |
| `getAttrMaxWidth()` | - | Missing - use `maxWidth` directly |
| `getAttrMaxHeight()` | - | Missing - use `maxHeight` directly |
| `getMaxWidth()` | `getCalculatedMaxWidth()` | Renamed |
| `getMaxHeight()` | `getCalculatedMaxHeight()` | Renamed |
| `getConfig()` | `getConfig()` | Uses `O.getOrUndefined` |
| `isMaximized()` | `isMaximized()` | Returns field value, not model query |
| `isActive()` | `isActive()` | Returns field value, not model query |
| `isEnableDeleteWhenEmpty()` | `isEnableDeleteWhenEmpty()` | Uses `O.getOrElse` |
| `isEnableDrop()` | `isEnableDrop()` | Uses `O.getOrElse` |
| `isEnableTabWrap()` | `isEnableTabWrap()` | Uses `O.getOrElse` |
| `isEnableDrag()` | `isEnableDrag()` | Uses `O.getOrElse` |
| `isEnableDivide()` | `isEnableDivide()` | Uses `O.getOrElse` |
| `isEnableMaximize()` | `isEnableMaximize()` | Uses `O.getOrElse` |
| `isEnableClose()` | `isEnableClose()` | Uses `O.getOrElse` |
| `isEnableSingleTabStretch()` | `isEnableSingleTabStretch()` | Uses `O.getOrElse` |
| `isEnableTabStrip()` | `isEnableTabStrip()` | Uses `O.getOrElse` |
| `isAutoSelectTab()` | `isAutoSelectTab()` | Uses `O.getOrElse` |
| `isEnableTabScrollbar()` | `isEnableTabScrollbar()` | Uses `O.getOrElse` |
| `getClassNameTabStrip()` | `getClassNameTabStrip()` | Uses `O.getOrUndefined` |
| `getTabLocation()` | `getTabLocation()` | Returns `"top" \| "bottom"` |
| `getContentRect()` | `getContentRect()` | Direct property access |
| `getTabStripRect()` | `getTabStripRect()` | Direct property access |

### 3. Critical Missing Operations (0% Complete)

#### 3.1 Serialization

**Original `fromJson`** (45 lines):
```typescript
static fromJson(json: any, model: Model, layoutWindow: LayoutWindow) {
  const newLayoutNode = new TabSetNode(model, json);
  if (json.children != null) {
    for (const jsonChild of json.children) {
      const child = TabNode.fromJson(jsonChild, model);
      newLayoutNode.addChild(child);
    }
  }
  if (newLayoutNode.children.length === 0) {
    newLayoutNode.setSelected(-1);
  }
  if (json.maximized && json.maximized === true) {
    layoutWindow.maximizedTabSet = newLayoutNode;
  }
  if (json.active && json.active === true) {
    layoutWindow.activeTabSet = newLayoutNode;
  }
  return newLayoutNode;
}
```

**Port**: Missing entirely. The Schema can decode JSON but lacks:
- Model registration via `model.addNode(this)`
- Child node parsing and attachment
- LayoutWindow state updates (maximized/active)

**Original `toJson`** (15 lines):
```typescript
toJson(): IJsonTabSetNode {
  const json: any = {};
  TabSetNode.attributeDefinitions.toJson(json, this.attributes);
  json.children = this.children.map((child) => child.toJson());
  if (this.isActive()) { json.active = true; }
  if (this.isMaximized()) { json.maximized = true; }
  return json;
}
```

**Port**: Missing. The Schema can encode but doesn't handle:
- Child serialization
- Active/maximized state inclusion

#### 3.2 Drag and Drop

**Original `canDrop`** (65 lines):
```typescript
canDrop(dragNode: Node & IDraggable, x: number, y: number): DropInfo | undefined {
  let dropInfo;
  if (dragNode === this) {
    // Self-drop handling
  } else if (this.getWindowId() !== Model.MAIN_WINDOW_ID && !canDockToWindow(dragNode)) {
    return undefined;
  } else if (this.contentRect!.contains(x, y)) {
    // Content area drop - determine dock location
    let dockLocation = DockLocation.CENTER;
    if (this.model.getMaximizedTabset(...) === undefined) {
      dockLocation = DockLocation.getLocation(this.contentRect!, x, y);
    }
    // Calculate outline rect...
  } else if (this.tabStripRect != null && this.tabStripRect.contains(x, y)) {
    // Tab strip drop - calculate insertion position
    // Complex hit-testing for tab reordering...
  }
  if (!dragNode.canDockInto(dragNode, dropInfo)) {
    return undefined;
  }
  return dropInfo;
}
```

**Port**:
```typescript
canDrop(_dragNode: IDraggable, _x: number, _y: number): DropInfo | undefined {
  return undefined; // Stub
}
```

**Impact**: Drag and drop is completely non-functional.

**Original `drop`** (105 lines):
Complex method handling:
- Self-drop prevention
- Parent removal and index adjustment
- CENTER docking (tab insertion)
- Edge docking (tabset splitting)
- Row creation for opposite orientation
- Weight redistribution
- Model tidying

**Port**:
```typescript
drop(_dragNode: IDraggable, _location: DockLocation, _index: number, _select?: boolean): void {
  // No-op
}
```

#### 3.3 Tree Manipulation

**Original `delete`**:
```typescript
delete() {
  (this.parent as RowNode).removeChild(this);
}
```

**Port**: Missing - no tree removal capability.

**Original `remove`**:
```typescript
remove(node: TabNode) {
  const removedIndex = this.removeChild(node);
  this.model.tidy();
  adjustSelectedIndex(this, removedIndex);
}
```

**Port**: Missing - cannot remove child tabs.

#### 3.4 Layout Calculation

**Original `calcMinMaxSize`** (15 lines):
```typescript
calcMinMaxSize() {
  this.calculatedMinHeight = this.getAttrMinHeight();
  this.calculatedMinWidth = this.getAttrMinWidth();
  this.calculatedMaxHeight = this.getAttrMaxHeight();
  this.calculatedMaxWidth = this.getAttrMaxWidth();
  for (const child of this.children) {
    const c = child as TabNode;
    this.calculatedMinWidth = Math.max(this.calculatedMinWidth, c.getMinWidth());
    this.calculatedMinHeight = Math.max(this.calculatedMinHeight, c.getMinHeight());
    this.calculatedMaxWidth = Math.min(this.calculatedMaxWidth, c.getMaxWidth());
    this.calculatedMaxHeight = Math.min(this.calculatedMaxHeight, c.getMaxHeight());
  }
  this.calculatedMinHeight += this.tabStripRect.height;
  this.calculatedMaxHeight += this.tabStripRect.height;
}
```

**Port**: Missing - layout constraints not computed from children.

---

## Behavioral Differences

### 1. Model Reference Pattern

| Original | Port |
|----------|------|
| Stores `model: Model` reference | No model reference |
| Queries model for `isMaximized()`, `isActive()` | Returns local `active`/`maximized` fields |
| Uses `model.getMaximizedTabset()` | Not available |
| Uses `model.setActiveTabset()` | Not available |

**Impact**: The port cannot participate in global model state queries or mutations.

### 2. Tree Structure

| Original | Port |
|----------|------|
| `children: Node[]` array | No children array |
| `parent?: Node` reference | No parent reference |
| `addChild()`, `removeChild()` methods | Not available |

**Impact**: The port cannot maintain tree relationships.

### 3. Attribute Inheritance

| Original | Port |
|----------|------|
| Uses `AttributeDefinitions` with `addInherited()` | Direct schema fields |
| Falls back to model defaults via `getAttr()` | Returns Option values with defaults |

**Example Original**:
```typescript
isEnableDrop() {
  return this.getAttr("enableDrop") as boolean;
  // getAttr checks local, then falls back to model.getAttribute("tabSetEnableDrop")
}
```

**Example Port**:
```typescript
isEnableDrop(): boolean {
  return O.getOrElse(this.enableDrop, thunkTrue);
  // No model fallback - uses hardcoded default
}
```

**Impact**: Port loses inheritance from global model defaults.

### 4. Window Context

| Original | Port |
|----------|------|
| `getWindowId()` returns `(this.parent as RowNode).getWindowId()` | Not available |
| Window-aware maximization checks | Not available |

**Impact**: Multi-window support unavailable.

---

## Missing Features Table

| Category | Feature | Priority | Complexity |
|----------|---------|----------|------------|
| **Serialization** | `fromJson` factory | Critical | High |
| **Serialization** | `toJson` with children | Critical | Medium |
| **DnD** | `canDrop` hit testing | Critical | High |
| **DnD** | `drop` operation | Critical | Very High |
| **Tree** | `delete` self | High | Low |
| **Tree** | `remove` child | High | Medium |
| **Tree** | `addChild` / `removeChild` | High | Medium |
| **Layout** | `calcMinMaxSize` | High | Medium |
| **Layout** | `setContentRect` | Medium | Low |
| **Layout** | `setTabStripRect` | Medium | Low |
| **Query** | `canMaximize` | Medium | Low |
| **Query** | `getSelectedNode` | Medium | Low |
| **Query** | `getMinSize`/`getMaxSize` | Low | Low |
| **Mutation** | `setWeight` | Medium | Low |
| **Mutation** | `setSelected` | Medium | Low |
| **Meta** | `updateAttrs` | Low | Medium |
| **Context** | `getWindowId` | Medium | Medium |

---

## Prioritized Recommendations

### Phase 1: Tree Infrastructure (Prerequisite)

1. **Add tree structure to schema**:
   ```typescript
   children: S.optionalWith(S.Array(S.Unknown), { default: () => [] }),
   parent: S.optionalWith(S.Unknown, { as: "Option" }),
   ```

2. **Implement basic tree operations**:
   - `addChild(child: Node, pos?: number): number`
   - `removeChild(child: Node): number`
   - `getChildren(): Node[]`
   - `getParent(): Node | undefined`

### Phase 2: Model Context (Required for Operations)

3. **Design model reference pattern**:
   - Consider Effect Layer/Service pattern for model context
   - Or pass model explicitly to operations

4. **Implement model-aware queries**:
   - `isMaximized()` - query model state
   - `isActive()` - query model state
   - `getWindowId()` - traverse to row parent

### Phase 3: Core Operations

5. **Implement serialization**:
   - `fromJson` static factory with model/window context
   - `toJson` with child serialization

6. **Implement layout calculation**:
   - `calcMinMaxSize()` - aggregate child constraints
   - `setContentRect()`, `setTabStripRect()` - rectangle setters

7. **Implement tree manipulation**:
   - `delete()` - remove self from parent
   - `remove(node)` - remove child with selection adjustment

### Phase 4: Drag and Drop

8. **Port `canDrop`**:
   - Requires `Rect.contains()` and hit testing
   - Requires `DockLocation.getLocation()` edge detection
   - Requires `DropInfo` creation

9. **Port `drop`**:
   - Most complex method
   - Requires all tree operations
   - Requires model mutations
   - Requires weight redistribution logic

### Phase 5: Refinements

10. **Add missing accessors**:
    - `getSelectedNode()`
    - `getMinSize(orientation)`
    - `getMaxSize(orientation)`
    - `canMaximize()`

11. **Implement attribute updates**:
    - `updateAttrs(json)` for dynamic updates

---

## Conclusion

The TabSetNode port has successfully established a robust **data model** using Effect Schema, with complete attribute coverage and functional accessor methods. However, the port is **not operationally functional** for its primary purpose as a layout container because:

1. **No tree structure** - Cannot hold or manipulate children
2. **No model context** - Cannot query or mutate global state
3. **No drag-and-drop** - Core UI operations are stubbed
4. **No serialization** - Cannot round-trip to/from JSON with full fidelity

The current implementation is suitable for **type definitions and schema validation** but requires significant additional work before it can support the flex-layout runtime behavior.

**Estimated Effort to Complete**: 40-60 hours of development work, assuming familiarity with both the original FlexLayout codebase and Effect patterns.
