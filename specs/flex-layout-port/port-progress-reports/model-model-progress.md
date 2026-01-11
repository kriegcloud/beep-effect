# Port Progress Report: Model.ts

## Summary

| Metric | Value |
|--------|-------|
| **Status** | Partial |
| **Completion** | ~65% |
| **Critical Issues** | 4 |
| **High Priority Issues** | 6 |
| **Medium Priority Issues** | 5 |

## Original File Analysis

**Source**: `/home/elpresidank/YeeBois/projects/beep-effect/tmp/FlexLayout/src/model/Model.ts`

### Public Methods (18 total)

| Method | Description |
|--------|-------------|
| `doAction(action)` | Executes an action on the model |
| `getActiveTabset(windowId?)` | Gets the currently active tabset |
| `getMaximizedTabset(windowId?)` | Gets the currently maximized tabset |
| `getRoot(windowId?)` | Gets the root RowNode |
| `isRootOrientationVertical()` | Returns root orientation setting |
| `isEnableRotateBorderIcons()` | Returns border icon rotation setting |
| `getBorderSet()` | Returns the BorderSet |
| `getwindowsMap()` | Returns the windows map |
| `visitNodes(fn)` | Visits all nodes in the model |
| `visitWindowNodes(windowId, fn)` | Visits nodes in a specific window |
| `getNodeById(id)` | Gets a node by ID |
| `getFirstTabSet(node?)` | Finds the first/top-left tabset |
| `getSplitterSize()` | Returns splitter size |
| `getSplitterExtra()` | Returns splitter extra hit area |
| `isEnableEdgeDock()` | Returns edge dock enabled setting |
| `isSplitterEnableHandle()` | Returns splitter handle setting |
| `setOnAllowDrop(fn)` | Sets drop allow callback |
| `setOnCreateTabSet(fn)` | Sets tabset creation callback |
| `addChangeListener(listener)` | Adds a change listener |
| `removeChangeListener(listener)` | Removes a change listener |
| `toString()` | Returns JSON string representation |

### Static Methods (4 total)

| Method | Description |
|--------|-------------|
| `fromJson(json)` | Creates model from JSON |
| `toTypescriptInterfaces()` | Generates TypeScript interfaces |
| `createAttributeDefinitions()` | Creates attribute definitions (private) |
| `MAIN_WINDOW_ID` | Static constant for main window |

### Internal Methods (10 total)

| Method | Description |
|--------|-------------|
| `removeEmptyWindows()` | Removes windows with no tabs |
| `setActiveTabset(tabsetNode, windowId)` | Sets active tabset |
| `setMaximizedTabset(tabsetNode, windowId)` | Sets maximized tabset |
| `updateIdMap()` | Rebuilds the ID map |
| `addNode(node)` | Adds node to ID map |
| `findDropTargetNode(windowId, dragNode, x, y)` | Finds drop target |
| `tidy()` | Tidies the node tree |
| `updateAttrs(json)` | Updates model attributes |
| `nextUniqueId()` | Generates unique ID |
| `getAttribute(name)` | Gets an attribute value |
| `getOnAllowDrop()` | Returns drop allow callback |
| `getOnCreateTabSet()` | Returns tabset creation callback |

### Instance Properties (8 total)

| Property | Type | Description |
|----------|------|-------------|
| `attributes` | `Record<string, any>` | Model attributes |
| `idMap` | `Map<string, Node>` | Node ID lookup map |
| `changeListeners` | `Array<Function>` | Change listeners |
| `borders` | `BorderSet` | Border set |
| `onAllowDrop` | `Function?` | Drop allow callback |
| `onCreateTabSet` | `Function?` | Tabset creation callback |
| `windows` | `Map<string, LayoutWindow>` | Window map |
| `rootWindow` | `LayoutWindow` | Main window |

### Action Types Handled (17 total)

| Action | Original | Port |
|--------|----------|------|
| `ADD_NODE` | Full | Partial |
| `MOVE_NODE` | Full | Partial |
| `DELETE_TAB` | Full | Partial |
| `DELETE_TABSET` | Full | Partial |
| `POPOUT_TABSET` | Full | **STUB** |
| `POPOUT_TAB` | Full | **STUB** |
| `CLOSE_WINDOW` | Full | **STUB** |
| `CREATE_WINDOW` | Full | **STUB** |
| `RENAME_TAB` | Full | Full |
| `SELECT_TAB` | Full | Full |
| `SET_ACTIVE_TABSET` | Full | Full |
| `ADJUST_WEIGHTS` | Full | Full |
| `ADJUST_BORDER_SPLIT` | Full | Full |
| `MAXIMIZE_TOGGLE` | Full | Full |
| `UPDATE_MODEL_ATTRIBUTES` | Full | Full |
| `UPDATE_NODE_ATTRIBUTES` | Full | Partial |

---

## Port File Analysis

**Target**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/ui/ui/src/flex-layout/model/model.ts`

### Architecture Differences

The port uses a fundamentally different architecture:

| Aspect | Original | Port |
|--------|----------|------|
| **Base Class** | Plain class | `S.Class` (Effect Schema) |
| **Mutability** | Mutable tree | Immutable with copies |
| **Node Types** | Runtime class instances | JSON representations |
| **ID Map** | Direct node references | Lazy-built maps |
| **Multi-Window** | `LayoutWindow` instances | Not implemented |
| **Change Tracking** | Listener callbacks | Not implemented |

### Ported Methods

| Original Method | Port Equivalent | Fidelity |
|-----------------|-----------------|----------|
| `fromJson` | `fromJson` / `fromJsonSync` | Effect-ified, different signature |
| `toJson` | `toJson` | Simplified, missing popouts |
| `doAction` | `doAction` | Partial - 4 actions stubbed |
| `getRoot` | `getRoot` | Returns Option, not window-aware |
| `getActiveTabset` | `getActiveTabSet` | Returns Option, not window-aware |
| `getMaximizedTabset` | `getMaximizedTabSet` | Returns Option, not window-aware |
| `getBorderSet` | `getBorderSet` | Equivalent |
| `getNodeById` | `getNodeById` | Returns Option instead of undefined |
| `visitNodes` | `walkNodes` | Renamed, similar functionality |
| `getSplitterSize` | `getSplitterSize` | Equivalent |
| `isRootOrientationVertical` | `isRootOrientationVertical` | Equivalent |
| `isEnableEdgeDock` | `isEdgeDockEnabled` | Renamed |

### New Methods in Port

| Method | Description |
|--------|-------------|
| `empty()` | Creates empty model |
| `hasRoot()` | Check if root exists |
| `getGlobalAttributes()` | Get global attributes |
| `getRootOrientation()` | Get orientation as enum |
| `getTabById(id)` | Get tab by ID with type guard |
| `getTabSetById(id)` | Get tabset by ID with type guard |
| `getParent(nodeId)` | Get parent of a node |
| `calculateLayout(rect)` | Calculate layout rectangles |

---

## Missing Features

### Critical - Must Have

| Feature | Original Location | Impact |
|---------|-------------------|--------|
| **Multi-Window Support** | `windows` Map, `LayoutWindow` | Popout windows completely broken |
| **Change Listeners** | `addChangeListener`, `removeChangeListener` | No notification of model changes |
| **Drop Callbacks** | `onAllowDrop`, `onCreateTabSet` | Cannot customize drop behavior |
| **AttributeDefinitions Integration** | `attributeDefinitions`, `createAttributeDefinitions()` | ~70 global attributes not validated |

### Missing Methods

| Method | Reason Missing | Difficulty |
|--------|----------------|------------|
| `getwindowsMap()` | No multi-window | Medium |
| `visitWindowNodes(windowId, fn)` | No multi-window | Medium |
| `getFirstTabSet(node?)` | Not implemented | Low |
| `getSplitterExtra()` | Not in properties | Low |
| `isSplitterEnableHandle()` | Not in properties | Low |
| `isEnableRotateBorderIcons()` | Not in properties | Low |
| `setOnAllowDrop(fn)` | Architecture change | Medium |
| `setOnCreateTabSet(fn)` | Architecture change | Medium |
| `addChangeListener(listener)` | Architecture change | Medium |
| `removeChangeListener(listener)` | Architecture change | Medium |

### Missing Internal Methods

| Method | Impact |
|--------|--------|
| `removeEmptyWindows()` | Multi-window cleanup broken |
| `setActiveTabset(tabsetNode, windowId)` | Window-specific active state |
| `setMaximizedTabset(tabsetNode, windowId)` | Window-specific maximize |
| `findDropTargetNode(windowId, dragNode, x, y)` | Drag-drop targeting |
| `tidy()` | Tree optimization |
| `nextUniqueId()` | ID generation (uses `randomUUID` instead) |
| `addNode(node)` | Direct node registration |
| `getAttribute(name)` | Attribute access |
| `getOnAllowDrop()` | Callback retrieval |
| `getOnCreateTabSet()` | Callback retrieval |

### Missing Properties

| Property | Type | Impact |
|----------|------|--------|
| `changeListeners` | Array | No change notification |
| `onAllowDrop` | Function | No drop customization |
| `onCreateTabSet` | Function | No tabset creation customization |
| `windows` | Map | No multi-window |
| `rootWindow` | LayoutWindow | No window abstraction |

### Missing Global Attributes

The original defines ~70+ global attributes in `createAttributeDefinitions()`. The port only handles:

| Ported | Missing |
|--------|---------|
| `enableEdgeDock` | `enableRotateBorderIcons` |
| `rootOrientationVertical` | `splitterExtra` |
| `splitterSize` | `splitterEnableHandle` |
| `borderSize` | `tabEnableClose` |
| `borderClassName` | `tabCloseType` |
| `tabClassName` | `tabEnablePopout` |
| `tabContentClassName` | `tabEnablePopoutIcon` |
| `tabIcon` | `tabEnablePopoutOverlay` |
| `tabSetClassNameTabStrip` | `tabEnableDrag` |
| | `tabEnableRename` |
| | `tabEnableRenderOnDemand` |
| | `tabDragSpeed` |
| | `tabBorderWidth` |
| | `tabBorderHeight` |
| | `tabSetEnableDeleteWhenEmpty` |
| | `tabSetEnableDrop` |
| | `tabSetEnableDrag` |
| | `tabSetEnableDivide` |
| | `tabSetEnableMaximize` |
| | `tabSetEnableClose` |
| | `tabSetEnableSingleTabStretch` |
| | `tabSetAutoSelectTab` |
| | `tabSetEnableActiveIcon` |
| | `tabSetEnableTabStrip` |
| | `tabSetEnableTabWrap` |
| | `tabSetTabLocation` |
| | `tabMinWidth` / `tabMinHeight` |
| | `tabMaxWidth` / `tabMaxHeight` |
| | `tabSetMinWidth` / `tabSetMinHeight` |
| | `tabSetMaxWidth` / `tabSetMaxHeight` |
| | `tabSetEnableTabScrollbar` |
| | `borderMinSize` / `borderMaxSize` |
| | `borderEnableDrop` |
| | `borderAutoSelectTabWhenOpen` |
| | `borderAutoSelectTabWhenClosed` |
| | `borderEnableAutoHide` |
| | `borderEnableTabScrollbar` |

---

## Incomplete Implementations

### doAction - Stubbed Actions

The following actions return `this` without implementing logic:

```typescript
case ACTION_TYPES.POPOUT_TAB:
case ACTION_TYPES.POPOUT_TABSET:
case ACTION_TYPES.CLOSE_WINDOW:
case ACTION_TYPES.CREATE_WINDOW:
  console.warn(`Action ${actionType} not yet implemented`);
  return this;
```

### doAction - Partial Implementations

| Action | Original Behavior | Port Behavior | Gap |
|--------|-------------------|---------------|-----|
| `ADD_NODE` | Creates `TabNode` instance, calls `drop()` on target | Creates JSON tab, simplified docking | No `drop()` protocol, limited docking logic |
| `MOVE_NODE` | Handles TabNode/TabSetNode/RowNode moves | Only handles TabNode moves | TabSet/Row moves not supported |
| `DELETE_TAB` | Calls `node.delete()`, `removeEmptyWindows()` | Removes from children array | No empty window cleanup |
| `DELETE_TABSET` | Deletes closeable children first, then tabset | Removes entire tabset | No child-by-child close check |
| `UPDATE_NODE_ATTRIBUTES` | Works on any node type | Only Tab and TabSet | RowNode attributes not updateable |

### toJson - Simplified

| Original | Port |
|----------|------|
| Visits all nodes calling `fireEvent("save")` | No save event |
| Serializes all popout windows | `popouts: O.none()` hardcoded |
| Uses `AttributeDefinitions.toJson` | Direct property spread |

### calculateLayout - Basic

The port has basic layout calculation but:

- Does not set `rect` property on nodes (commented: "TabSetNode would need rect field")
- Does not calculate border content areas
- No tab strip height calculations
- No maximized state handling

---

## Behavioral Differences

### Immutability Model

**Original**: Mutable tree with direct node modifications
```typescript
node.setName(action.data.text);
window.activeTabSet = parent;
```

**Port**: Immutable with new Model instances
```typescript
return new Model({ ...this, rootLayout: newRoot });
```

**Impact**: This is an intentional architectural improvement, but requires careful verification that all action handlers properly create new instances.

### Return Value Semantics

**Original**: Returns `undefined | Node | string` from `doAction`
```typescript
doAction(action: Action): any {
  let returnVal = undefined;
  // ... action handling sets returnVal
  return returnVal;
}
```

**Port**: Always returns `Model`
```typescript
doAction(action: Action): Model {
  // ... returns new Model or this
}
```

**Impact**: Callers expecting added node reference or window ID will break.

### Node Type System

**Original**: Uses class instances (`TabNode`, `TabSetNode`, `RowNode`, `BorderNode`)
```typescript
if (node instanceof TabNode) { ... }
```

**Port**: Uses JSON representation with type guards
```typescript
if (isTabNode(node)) { ... }
```

**Impact**: Different runtime checking mechanism, may affect code relying on `instanceof`.

### Option vs Undefined

**Original**: Returns `undefined` for missing nodes
```typescript
getNodeById(id: string): Node | undefined
```

**Port**: Returns `Option`
```typescript
getNodeById(id: string): O.Option<LayoutNode>
```

**Impact**: All callers must use Option utilities instead of null checks.

### Window ID Parameters

**Original**: Many methods accept `windowId` parameter with default `MAIN_WINDOW_ID`
```typescript
getActiveTabset(windowId: string = Model.MAIN_WINDOW_ID)
getRoot(windowId: string = Model.MAIN_WINDOW_ID)
```

**Port**: No window ID parameters
```typescript
getActiveTabSetId(): O.Option<string>
getRoot(): O.Option<JsonRowNode>
```

**Impact**: Multi-window support completely absent.

---

## Recommendations

### Critical Priority

1. **Implement Multi-Window Support**
   - Add `windows: Map<string, LayoutWindow>` equivalent
   - Add `windowId` parameter to relevant methods
   - Implement `POPOUT_TAB`, `POPOUT_TABSET`, `CLOSE_WINDOW`, `CREATE_WINDOW` actions

2. **Add Change Listener System**
   - Either implement callback system or use Effect-style subscription
   - Consider integrating with Jotai atoms for React state management

3. **Implement Drop Callbacks**
   - Add `onAllowDrop` and `onCreateTabSet` callback properties
   - Integrate into action handlers

4. **Complete AttributeDefinitions**
   - Port all ~70 global attributes to GlobalAttributes schema
   - Add validation for tab/tabset/border-specific attributes

### High Priority

5. **Fix doAction Return Value**
   - Return added node for `ADD_NODE`
   - Return window ID for `CREATE_WINDOW`
   - Consider returning `Effect<Model, Error, AddedNode>` for type safety

6. **Implement `tidy()` Method**
   - Required for tree optimization after operations
   - Called in original after `fromJson` and `DELETE_TABSET`

7. **Complete MOVE_NODE Action**
   - Support moving TabSetNode and RowNode
   - Implement `removeEmptyWindows()` cleanup

8. **Implement `findDropTargetNode`**
   - Required for drag-drop functionality
   - Needs coordinate-based node lookup

9. **Add Missing Accessor Methods**
   - `getFirstTabSet()`
   - `getSplitterExtra()`
   - `isSplitterEnableHandle()`
   - `isEnableRotateBorderIcons()`

10. **Complete Layout Calculation**
    - Add `rect` field to node schemas
    - Calculate border content areas
    - Handle maximized state

### Medium Priority

11. **Add `toTypescriptInterfaces()` Static Method**
    - Useful for documentation generation
    - Lower priority - development tooling

12. **Implement Border Tab Storage**
    - Original stores tabs in borders
    - Port notes "Would need to extract tabs from model state"

13. **Add Node Event System**
    - Original fires `"save"` event on nodes during `toJson()`
    - Required for node-level state persistence

14. **Port Remaining Global Attributes**
    - Tab-specific: `tabBorderWidth`, `tabBorderHeight`, etc.
    - TabSet-specific: `tabSetEnableTabScrollbar`, etc.
    - Border-specific: `borderEnableAutoHide`, etc.

15. **Add ID Map Validation**
    - Original throws on duplicate IDs in `addNode()`
    - Port should validate ID uniqueness

### Low Priority

16. **Static `MAIN_WINDOW_ID` Constant**
    - Add for API compatibility
    - Used as default windowId

17. **Internal Method Parity**
    - `nextUniqueId()` (currently uses `randomUUID` directly)
    - `getAttribute()` accessor

18. **Documentation Alignment**
    - JSDoc comments differ in style
    - Consider aligning for consistency

---

## Testing Requirements

Before marking as complete, verify:

1. [ ] All 17 action types execute correctly
2. [ ] Multi-window operations work (after implementation)
3. [ ] Change listeners fire appropriately (after implementation)
4. [ ] Drop callbacks customize behavior (after implementation)
5. [ ] Layout calculation produces correct rectangles
6. [ ] `toJson()` round-trips correctly with `fromJson()`
7. [ ] All global attributes are validated and applied
8. [ ] Tree tidying produces optimal structure
9. [ ] ID uniqueness is enforced
10. [ ] Border tabs are properly tracked

---

## Conclusion

The port represents approximately **65% completion** of the original Model.ts functionality. The core architecture has been successfully modernized to use Effect Schema with immutable patterns, which is a significant improvement. However, several critical features are missing:

1. **Multi-window support** is completely absent, blocking popout functionality
2. **Change notification** system is not implemented
3. **Drop customization** callbacks are missing
4. **~60 global attributes** are not ported

The action handling system is partially complete with 4 of 17 actions stubbed and several others having reduced functionality compared to the original.

**Recommendation**: Focus on Critical priority items before considering the port production-ready. The architectural foundation is solid, but feature parity requires significant additional work.
