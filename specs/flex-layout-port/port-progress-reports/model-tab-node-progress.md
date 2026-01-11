# Port Progress Report: TabNode.ts

## Summary

| Metric | Value |
|--------|-------|
| **Completion Status** | **Partial (65%)** |
| **Original File** | `/tmp/FlexLayout/src/model/TabNode.ts` |
| **Port File** | `/packages/ui/ui/src/flex-layout/model/tab-node.ts` |
| **Architecture** | Original: Mutable OOP class extending `Node` base class. Port: Immutable Effect Schema class extending `TabAttributes` |

The port has successfully transformed the mutable OOP pattern into an immutable Effect Schema-based approach. All JSON-serializable attributes and most accessor methods are ported. However, significant functionality is missing related to:
1. Model integration (parent references, model context)
2. DOM element management (moveableElement, tabStamp)
3. Event system (listeners, fireEvent)
4. Tree operations (inherited from Node base class)
5. Several internal methods for layout orchestration

---

## Original File Analysis

### Class Hierarchy
- `TabNode extends Node implements IDraggable`
- Node provides: model reference, parent/children relationships, rect, path, event listeners, attribute inheritance system

### Static Members

| Member | Type | Description | Ported |
|--------|------|-------------|--------|
| `TYPE` | `string` | Constant `"tab"` | Partial (via `type` field default) |
| `attributeDefinitions` | `AttributeDefinitions` | Attribute metadata/defaults | Different approach (Schema fields) |
| `fromJson()` | Factory method | Creates TabNode from JSON | Not needed (Schema handles) |
| `getAttributeDefinitions()` | Static getter | Returns attribute definitions | Not ported |
| `createAttributeDefinitions()` | Factory | Builds attribute definitions with inheritance | Not ported (Schema approach) |

### Instance Properties (Private/Internal)

| Property | Type | Description | Ported |
|----------|------|-------------|--------|
| `tabRect` | `Rect` | Tab button rectangle | Yes |
| `moveableElement` | `HTMLElement \| null` | Reference to moveable DOM element | **No** |
| `tabStamp` | `HTMLElement \| null` | Reference to tab stamp element | **No** |
| `renderedName` | `string \| undefined` | Cached rendered name | **No** |
| `extra` | `Record<string, any>` | Transient runtime data | Yes |
| `visible` | `boolean` | Tab visibility state | Yes |
| `rendered` | `boolean` | Has been rendered flag | Yes |
| `scrollTop` | `number \| undefined` | Saved scroll position | Yes |
| `scrollLeft` | `number \| undefined` | Saved scroll position | Yes |
| (inherited) `model` | `Model` | Reference to model | **No** |
| (inherited) `attributes` | `Record<string, any>` | Raw attribute storage | Schema fields instead |
| (inherited) `parent` | `Node \| undefined` | Parent node reference | **No** |
| (inherited) `children` | `Node[]` | Child nodes | N/A (tabs have no children) |
| (inherited) `rect` | `Rect` | Content rectangle | **No** (only tabRect) |
| (inherited) `path` | `string` | Node path in tree | **No** |
| (inherited) `listeners` | `Map<string, Function>` | Event listeners | **No** |

### Public Methods

| Method | Signature | Description | Ported |
|--------|-----------|-------------|--------|
| `getName()` | `() => string` | Get tab name | Yes |
| `getHelpText()` | `() => string \| undefined` | Get tooltip text | Yes |
| `getComponent()` | `() => string \| undefined` | Get component identifier | Yes |
| `getWindowId()` | `() => string` | Get window ID from parent | **No** |
| `getWindow()` | `() => Window \| undefined` | Get Window object | **No** |
| `getConfig()` | `() => any` | Get config object | Yes |
| `getExtraData()` | `() => Record<string, any>` | Get transient data | Yes (as `getExtra`) |
| `isPoppedOut()` | `() => boolean` | Check if in popout window | **No** |
| `isSelected()` | `() => boolean` | Check if currently selected | **No** |
| `getIcon()` | `() => string \| undefined` | Get icon identifier | Yes |
| `isEnableClose()` | `() => boolean` | Can be closed | Yes |
| `getCloseType()` | `() => number` | Get close button type | **No** |
| `isEnablePopout()` | `() => boolean` | Can be popped out | Yes |
| `isEnablePopoutIcon()` | `() => boolean` | Show popout icon | **No** |
| `isEnablePopoutOverlay()` | `() => boolean` | Show overlay when backgrounded | **No** |
| `isEnableDrag()` | `() => boolean` | Can be dragged | Yes |
| `isEnableRename()` | `() => boolean` | Can be renamed | Yes |
| `isEnableWindowReMount()` | `() => boolean` | Remount on popout | **No** |
| `getClassName()` | `() => string \| undefined` | Get CSS class | Yes |
| `getContentClassName()` | `() => string \| undefined` | Get content CSS class | Yes |
| `getTabSetClassName()` | `() => string \| undefined` | Get tabset CSS class | Yes |
| `isEnableRenderOnDemand()` | `() => boolean` | Lazy render enabled | Yes |
| `getMinWidth()` | `() => number` | Minimum width constraint | Yes |
| `getMinHeight()` | `() => number` | Minimum height constraint | Yes |
| `getMaxWidth()` | `() => number` | Maximum width constraint | Yes |
| `getMaxHeight()` | `() => number` | Maximum height constraint | Yes |
| `isVisible()` | `() => boolean` | Check visibility | Yes |
| `toJson()` | `() => IJsonTabNode` | Serialize to JSON | Implicit (Schema) |

### Inherited Public Methods (from Node)

| Method | Signature | Description | Ported |
|--------|-----------|-------------|--------|
| `getId()` | `() => string` | Get/generate unique ID | Yes |
| `getModel()` | `() => Model` | Get model reference | **No** |
| `getType()` | `() => string` | Get node type | Implicit (Schema) |
| `getParent()` | `() => Node \| undefined` | Get parent node | **No** |
| `getChildren()` | `() => Node[]` | Get child nodes | N/A |
| `getRect()` | `() => Rect` | Get content rectangle | **No** |
| `getPath()` | `() => string` | Get path in tree | **No** |
| `getOrientation()` | `() => Orientation` | Get layout orientation | **No** |
| `setEventListener()` | `(event, callback) => void` | Add event listener | **No** |
| `removeEventListener()` | `(event) => void` | Remove event listener | **No** |

### Internal Methods

| Method | Signature | Description | Ported |
|--------|-----------|-------------|--------|
| `saveScrollPosition()` | `() => void` | Save scroll state from DOM | **No** |
| `restoreScrollPosition()` | `() => void` | Restore scroll state to DOM | **No** |
| `setRect()` | `(rect) => void` | Set rect with event | **No** (immutable) |
| `setVisible()` | `(visible) => void` | Set visibility with event | `withVisible()` |
| `getScrollTop()` | `() => number \| undefined` | Get saved scroll | Implicit via fields |
| `setScrollTop()` | `(n) => void` | Set scroll top | `withScrollPosition()` |
| `getScrollLeft()` | `() => number \| undefined` | Get saved scroll | Implicit via fields |
| `setScrollLeft()` | `(n) => void` | Set scroll left | `withScrollPosition()` |
| `isRendered()` | `() => boolean` | Check rendered flag | Yes |
| `setRendered()` | `(rendered) => void` | Set rendered flag | `withVisible()` |
| `getTabRect()` | `() => Rect` | Get tab button rect | Yes |
| `setTabRect()` | `(rect) => void` | Set tab button rect | `withTabRect()` |
| `getTabStamp()` | `() => HTMLElement \| null` | Get stamp element | **No** |
| `setTabStamp()` | `(stamp) => void` | Set stamp element | **No** |
| `getMoveableElement()` | `() => HTMLElement \| null` | Get moveable element | **No** |
| `setMoveableElement()` | `(el) => void` | Set moveable element | **No** |
| `setRenderedName()` | `(name) => void` | Set cached name | **No** |
| `getNameForOverflowMenu()` | `() => string \| undefined` | Get overflow menu name | **No** (partial via `getAltName`) |
| `setName()` | `(name) => void` | Set name directly | `withName()` |
| `delete()` | `() => void` | Remove from parent, fire close | **No** |
| `updateAttrs()` | `(json) => void` | Update attributes from JSON | **No** (immutable) |
| `getAttributeDefinitions()` | `() => AttributeDefinitions` | Get attribute defs | **No** |
| `setBorderWidth()` | `(width) => void` | Set border width | **No** |
| `setBorderHeight()` | `(height) => void` | Set border height | **No** |

### Inherited Internal Methods (from Node)

| Method | Description | Ported |
|--------|-------------|--------|
| `setId()` | Set node ID | **No** (immutable) |
| `fireEvent()` | Dispatch event to listeners | **No** |
| `getAttr()` | Get attribute with inheritance | **No** (Schema defaults instead) |
| `forEachNode()` | Traverse tree | **No** |
| `setPaths()` | Set paths in subtree | **No** |
| `setParent()` | Set parent reference | **No** |
| `setRect()` | Set content rect | **No** |
| `setPath()` | Set path string | **No** |
| `setWeight()` | Set weight | **No** (immutable) |
| `setSelected()` | Set selected index | N/A |
| `findDropTargetNode()` | Find drop target | **No** |
| `canDrop()` | Check if can drop | **No** |
| `canDockInto()` | Check if can dock | **No** |
| `removeChild()` | Remove child node | N/A |
| `addChild()` | Add child node | N/A |
| `removeAll()` | Remove all children | N/A |
| `styleWithPosition()` | Get style object | **No** |
| `isEnableDivide()` | Check divide enabled | **No** |
| `toAttributeString()` | Debug string | **No** |

---

## Port Analysis

### Architecture Differences

| Aspect | Original | Port |
|--------|----------|------|
| **Mutability** | Mutable class with setters | Immutable with `with*` methods |
| **Base Class** | Extends `Node` | Extends `TabAttributes` Schema |
| **Model Reference** | Direct reference to Model | None (stateless) |
| **Parent/Children** | Tree structure maintained | None (flat schema) |
| **DOM References** | `moveableElement`, `tabStamp` | None |
| **Event System** | Map-based listeners | None |
| **Attribute Inheritance** | Runtime from parent/model | Schema defaults |
| **ID Generation** | Model.nextUniqueId() | External responsibility |

### Successfully Ported Features

1. **All JSON-serializable attributes** via `TabAttributes` Schema
2. **Runtime state fields**: `tabRect`, `visible`, `rendered`, `scrollTop`, `scrollLeft`, `extra`
3. **Accessor methods**: `getName`, `getHelpText`, `getComponent`, `getConfig`, `getIcon`, `isEnableClose`, `isEnableDrag`, `isEnableRename`, `isEnablePopout`, `isEnableRenderOnDemand`, `getMinWidth/Height`, `getMaxWidth/Height`, `getClassName`, `getContentClassName`, `getTabsetClassName`, `isVisible`, `isRendered`, `getTabRect`
4. **Immutable update methods**: `withVisible`, `withTabRect`, `withScrollPosition`, `withName`, `withExtra`
5. **IDraggable implementation**: `isEnableDrag()`, `getName()`

### New Features in Port

1. **`getExtra<T>(key: string)`**: Typed getter for extra data
2. **`withExtra(key, value)`**: Immutable extra data update
3. **`getBorderWidth()`/`getBorderHeight()`**: Getters for border dimensions

---

## Missing Features (Prioritized)

### Critical (Required for Core Functionality)

| Feature | Impact | Complexity |
|---------|--------|------------|
| Model integration | Cannot access global settings, generate IDs | High |
| Parent node reference | Cannot determine selection state, window ID | High |
| Event system | No resize/visibility/close events | Medium |
| `delete()` method | Cannot remove tabs | Medium |
| `getRect()` (content rect) | Only has tabRect, missing content area | Low |

### High Priority (Important for Full Parity)

| Feature | Impact | Complexity |
|---------|--------|------------|
| `saveScrollPosition()` / `restoreScrollPosition()` | Cannot persist scroll on tab switch | Medium |
| `getWindowId()` / `getWindow()` / `isPoppedOut()` | Popout functionality broken | Medium |
| `isSelected()` | Cannot style selected tabs | Low |
| `getCloseType()` | Close button behavior incomplete | Low |
| `isEnablePopoutIcon()` / `isEnablePopoutOverlay()` | Popout UI incomplete | Low |
| `isEnableWindowReMount()` | Window remount behavior | Low |
| DOM element refs (`moveableElement`, `tabStamp`) | Drag/drop visual feedback | Medium |

### Medium Priority (Quality of Life)

| Feature | Impact | Complexity |
|---------|--------|------------|
| `getPath()` | Debugging, path-based lookups | Low |
| `getOrientation()` | Layout calculations | Low |
| `getNameForOverflowMenu()` | Overflow menu display | Low |
| `renderedName` caching | Performance optimization | Low |
| `toAttributeString()` | Debugging | Low |
| `fireEvent()` with rect change | Resize notifications | Medium |

### Low Priority (Advanced Features)

| Feature | Impact | Complexity |
|---------|--------|------------|
| Tree traversal (`forEachNode`) | Batch operations | Medium |
| Drop target finding | Advanced DnD | High |
| `canDrop()` / `canDockInto()` | Drop validation | Medium |
| `setBorderWidth()` / `setBorderHeight()` setters | Border sizing | Low |

---

## Behavioral Differences

### 1. Attribute Inheritance
**Original**: Runtime lookup chain `node -> model global attributes`
```typescript
getAttr(name: string) {
  let val = this.attributes[name];
  if (val === undefined) {
    const modelName = this.getAttributeDefinitions().getModelName(name);
    if (modelName !== undefined) {
      val = this.model.getAttribute(modelName);
    }
  }
  return val;
}
```
**Port**: Static Schema defaults, no runtime inheritance
```typescript
isEnableClose(): boolean {
  return O.getOrElse(this.enableClose, thunkTrue);
}
```
**Impact**: Cannot override defaults from model global settings at runtime.

### 2. ID Generation
**Original**: Auto-generates UUID via `model.nextUniqueId()` on first access
**Port**: Returns `undefined` if not set; external responsibility to assign
**Impact**: IDs must be pre-assigned or handled externally.

### 3. Visibility Events
**Original**: Fires `visibility` event on change
```typescript
setVisible(visible: boolean) {
  if (visible !== this.visible) {
    this.visible = visible;
    this.fireEvent("visibility", { visible });
  }
}
```
**Port**: Returns new instance, no events
```typescript
withVisible(visible: boolean): TabNode {
  return new TabNode({ ...this, visible, rendered: visible ? true : this.rendered });
}
```
**Impact**: External code must detect and propagate visibility changes.

### 4. Rect Change Events
**Original**: Fires `resize` event when rect changes
```typescript
setRect(rect: Rect) {
  if (!rect.equals(this.rect)) {
    this.fireEvent("resize", {rect});
    this.rect = rect;
  }
}
```
**Port**: No rect field for content area, only `tabRect`
**Impact**: No resize notifications, missing content rect entirely.

### 5. Delete Behavior
**Original**: Removes from parent and fires `close` event
```typescript
delete() {
  (this.parent as TabSetNode | BorderNode).remove(this);
  this.fireEvent("close", {});
}
```
**Port**: Not implemented
**Impact**: Tab deletion must be handled externally with model updates.

### 6. Default Value Sources

| Attribute | Original Default Source | Port Default |
|-----------|------------------------|--------------|
| `enableClose` | `tabEnableClose` from model | `true` |
| `enableDrag` | `tabEnableDrag` from model | `true` |
| `enableRename` | `tabEnableRename` from model | `true` |
| `enablePopout` | `tabEnablePopout` from model | `false` |
| `enableRenderOnDemand` | `tabEnableRenderOnDemand` from model | `true` |
| `minWidth/Height` | `tabMinWidth/Height` from model | `0` |
| `maxWidth/Height` | `tabMaxWidth/Height` from model | `99999` |
| `borderWidth/Height` | `tabBorderWidth/Height` from model | `-1` |

---

## Recommendations

### Immediate Actions

1. **Add content `rect` field** - Required for layout positioning
2. **Implement `getCloseType()`** - Affects close button rendering
3. **Add missing popout getters** - `isEnablePopoutIcon()`, `isEnablePopoutOverlay()`, `isEnableWindowReMount()`

### Short-term Actions

1. **Design model integration strategy** - Options:
   - Pass model reference at method call time
   - Create `TabNodeInModel` wrapper class
   - Use Effect Context/Service pattern
2. **Implement event system** - Could use Effect Stream or external EventEmitter
3. **Add parent node reference** - Required for `isSelected()`, `getWindowId()`

### Long-term Actions

1. **Implement tree operations** - `forEachNode`, path management
2. **Add drop target logic** - `findDropTargetNode`, `canDrop`, `canDockInto`
3. **DOM reference management** - Consider React ref pattern instead of storing elements

---

## Test Coverage Recommendations

```typescript
// Tests to add:
describe("TabNode", () => {
  // Existing functionality
  it("returns name from field")
  it("returns undefined for optional fields")
  it("applies default values correctly")
  it("implements IDraggable interface")

  // Missing functionality to test once ported
  it("fires visibility event on change")
  it("fires resize event on rect change")
  it("inherits defaults from model global settings")
  it("auto-generates ID when accessed")
  it("tracks selection state from parent")
  it("saves and restores scroll position")
});
```

---

## Conclusion

The port successfully transforms TabNode from a mutable OOP class to an immutable Effect Schema class, preserving all serializable attributes and basic accessor methods. The immutable `with*` pattern is idiomatic and type-safe.

However, the port is missing critical infrastructure:
- **Model integration** for attribute inheritance and ID generation
- **Parent references** for tree navigation and selection state
- **Event system** for change notifications
- **DOM references** for visual feedback during drag operations

The current implementation is suitable for serialization/deserialization and basic property access, but cannot participate in the full layout orchestration lifecycle. Further development should focus on establishing a model integration strategy that preserves immutability while enabling the required runtime behaviors.
