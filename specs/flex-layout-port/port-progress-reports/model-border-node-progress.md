# Port Progress Report: BorderNode.ts

**Analysis Date**: 2026-01-10
**Completion Status**: **Partial (55-60%)**

## Executive Summary

The BorderNode port represents a significant architectural shift from a mutable OOP class with inheritance to an immutable Effect Schema-based class. The port correctly captures the data structure and core accessor methods but is missing critical functionality for model integration, drag-and-drop operations, and serialization/deserialization that make BorderNode functional within the layout system.

---

## Original File Analysis

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/tmp/FlexLayout/src/model/BorderNode.ts`
**Lines**: 446
**Parent Class**: `Node` (provides model, attributes, children, rect, parent, listeners, and core methods)
**Interfaces Implemented**: `IDropTarget`

### Static Members

| Member | Type | Purpose |
|--------|------|---------|
| `TYPE` | `string` | Constant `"border"` for type identification |
| `fromJson()` | `static method` | Deserializes JSON into BorderNode with children |
| `attributeDefinitions` | `AttributeDefinitions` | Attribute metadata and inheritance rules |
| `createAttributeDefinitions()` | `private static method` | Factory for attribute definitions |
| `getAttributeDefinitions()` | `static method` | Public accessor for definitions |

### Instance Properties (via `Node` parent + own)

| Property | Type | Description |
|----------|------|-------------|
| `model` | `Model` | Reference to parent Model (from Node) |
| `attributes` | `Record<string, any>` | Attribute storage (from Node) |
| `parent` | `Node \| undefined` | Parent node reference (from Node) |
| `children` | `Node[]` | Child TabNodes (from Node) |
| `rect` | `Rect` | Layout rectangle (from Node) |
| `path` | `string` | Path in tree (from Node) |
| `listeners` | `Map<string, Function>` | Event listeners (from Node) |
| `location` | `DockLocation` | **BorderNode specific** - edge position |
| `contentRect` | `Rect` | **BorderNode specific** - content area |
| `tabHeaderRect` | `Rect` | **BorderNode specific** - header area |

### Public Methods

| Method | Signature | Purpose |
|--------|-----------|---------|
| `getLocation()` | `() => DockLocation` | Returns edge location |
| `getClassName()` | `() => string \| undefined` | CSS class for tab buttons |
| `isHorizontal()` | `() => boolean` | TOP/BOTTOM orientation check |
| `getSize()` | `() => number` | Gets size (considers selected tab override) |
| `getMinSize()` | `() => number` | Min size (considers selected tab) |
| `getMaxSize()` | `() => number` | Max size (considers selected tab) |
| `getSelected()` | `() => number` | Selected tab index (-1 = closed) |
| `isAutoHide()` | `() => boolean` | Auto-hide when empty |
| `getSelectedNode()` | `() => TabNode \| undefined` | Gets selected child TabNode |
| `getOrientation()` | `() => Orientation` | Layout orientation |
| `getConfig()` | `() => any` | User config data |
| `isMaximized()` | `() => boolean` | Always false for borders |
| `isShowing()` | `() => boolean` | Visibility state |
| `toJson()` | `() => IJsonBorderNode` | **Serialization** |
| `isEnableTabScrollbar()` | `() => boolean` | Scrollbar visibility |

### Internal Methods (marked `@internal`)

| Method | Signature | Purpose | Complexity |
|--------|-----------|---------|------------|
| `isAutoSelectTab()` | `(whenOpen?: boolean) => boolean` | Tab selection behavior | Low |
| `setSelected()` | `(index: number) => void` | Mutates selection | Low |
| `getTabHeaderRect()` | `() => Rect` | Returns header rect | Low |
| `setTabHeaderRect()` | `(r: Rect) => void` | Sets header rect | Low |
| `getRect()` | `() => Rect` | Returns tabHeaderRect (override) | Low |
| `getContentRect()` | `() => Rect` | Returns content rect | Low |
| `setContentRect()` | `(r: Rect) => void` | Sets content rect | Low |
| `isEnableDrop()` | `() => boolean` | IDropTarget implementation | Low |
| `setSize()` | `(pos: number) => void` | Complex size setting logic | **Medium** |
| `updateAttrs()` | `(json: any) => void` | Updates attributes from JSON | Low |
| `remove()` | `(node: TabNode) => void` | Removes child, adjusts selection | Medium |
| `canDrop()` | `(dragNode, x, y) => DropInfo \| undefined` | **CRITICAL** - Drop hit testing | **High** |
| `drop()` | `(dragNode, location, index, select?) => void` | **CRITICAL** - Execute drop | **High** |
| `getSplitterBounds()` | `(index, useMinSize?) => number[]` | Splitter constraint calculation | **High** |
| `calculateSplit()` | `(splitter, splitterPos) => number` | Split position calculation | Medium |
| `getAttributeDefinitions()` | `() => AttributeDefinitions` | Returns definitions | Low |

---

## Port File Analysis

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/ui/ui/src/flex-layout/model/border-node.ts`
**Lines**: 446
**Architecture**: Effect Schema class extending `BorderAttributes`
**Interfaces Implemented**: `IDropTarget`

### Architectural Differences

| Aspect | Original | Port |
|--------|----------|------|
| Inheritance | `extends Node` (class inheritance) | `extends BorderAttributes.extend<BorderNode>()` (schema composition) |
| Mutability | Mutable (setters modify state) | Immutable (with* methods return new instances) |
| Model Reference | `this.model` field | Not present - requires external context |
| Children | `this.children: Node[]` array | Not present - requires external management |
| Parent | `this.parent?: Node` field | Not present |
| Attributes | `this.attributes: Record<string, any>` | Schema fields with `O.Option` wrapping |
| Event Listeners | `Map<string, Function>` | Not present |

### Static Members Comparison

| Original | Port Status | Notes |
|----------|-------------|-------|
| `TYPE = "border"` | **MISSING** | Should be added as static constant |
| `fromJson()` | **MISSING** | Critical for deserialization; requires Model context |
| `attributeDefinitions` | **MISSING** | Replaced by Schema field definitions |
| `createAttributeDefinitions()` | **MISSING** | Not needed - schema handles this |
| `getAttributeDefinitions()` | **MISSING** | Could be reconstructed if needed |
| - | `makeId()` | **NEW** - Port adds ID generation helper |
| - | `toDockLocation()` | **NEW** - Port adds location conversion helper |

### Method Comparison

#### Ported Methods (Full or Equivalent)

| Method | Original | Port | Notes |
|--------|----------|------|-------|
| `getLocation()` | `DockLocation` | `BorderLocation.Type` | Different return type (string vs object) |
| `isHorizontal()` | Check orientation | Location string check | Equivalent behavior |
| `getSelected()` | `this.attributes.selected` | `this.selected` | Direct field access |
| `isShowEnabled()/isShowing()` | `this.attributes.show` | `this.show` | Renamed to `isShowEnabled()` |
| `isAutoHideEnabled()/isAutoHide()` | `getAttr("enableAutoHide")` | `O.getOrElse(this.enableAutoHide)` | Renamed, uses Option |
| `isEnableTabScrollbar()` | `getAttr("enableTabScrollbar")` | `O.getOrElse(this.enableTabScrollbar)` | Uses Option |
| `getClassName()` | `getAttr("className")` | `O.getOrUndefined(this.className)` | Uses Option |
| `getConfig()` | `this.attributes.config` | `O.getOrUndefined(this.config)` | Uses Option |
| `getOrientation()` | Via DockLocation | Via `getDockLocation()` | Equivalent |
| `isEnableDrop()` | `getAttr("enableDrop")` | `O.getOrElse(this.enableDrop)` | Uses Option with default |
| `getContentRect()` | Returns `this.contentRect` | Returns `this.contentRect` | Equivalent |
| `getTabHeaderRect()` | Returns `this.tabHeaderRect` | Returns `this.tabHeaderRect` | Equivalent |
| `getId()` | Via attributes + model fallback | Via `makeId(location)` | **Simplified - no dynamic ID generation** |
| `getSize()` | Complex logic with tab override | Simple `O.getOrElse(this.size)` | **SIMPLIFIED** |
| `getMinSize()` | Considers selected node | Simple `O.getOrElse(this.minSize)` | **SIMPLIFIED** |
| `getMaxSize()` | Considers selected node | Simple `O.getOrElse(this.maxSize)` | **SIMPLIFIED** |

#### Port-Only Methods (New)

| Method | Signature | Purpose |
|--------|-----------|---------|
| `getDockLocation()` | `() => DockLocation` | Returns DockLocation object |
| `isVertical()` | `() => boolean` | Convenience method |
| `hasSelectedTab()` | `() => boolean` | Semantic check for selection |
| `isAutoSelectTabWhenClosed()` | `() => boolean` | Extracted accessor |
| `isAutoSelectTabWhenOpen()` | `() => boolean` | Extracted accessor |
| `getAdjustedSize()` | `() => number` | Runtime size accessor |
| `withSelected()` | `(number) => BorderNode` | Immutable update |
| `withContentRect()` | `(Rect) => BorderNode` | Immutable update |
| `withTabHeaderRect()` | `(Rect) => BorderNode` | Immutable update |
| `withSize()` | `(number) => BorderNode` | Immutable update |
| `withAdjustedSize()` | `(number) => BorderNode` | Immutable update |
| `withShow()` | `(boolean) => BorderNode` | Immutable update |
| `toString()` | `() => string` | Debug representation |

#### Missing Methods

| Method | Complexity | Impact | Notes |
|--------|------------|--------|-------|
| `fromJson()` | High | **CRITICAL** | Cannot deserialize layouts without this |
| `toJson()` | Medium | **CRITICAL** | Cannot serialize layouts without this |
| `canDrop()` | **Very High** | **CRITICAL** | 70+ lines of complex hit-testing logic |
| `drop()` | High | **CRITICAL** | Drop execution with parent adjustments |
| `getSplitterBounds()` | High | **HIGH** | Splitter constraint calculation |
| `calculateSplit()` | Medium | HIGH | Split position calculation |
| `setSize()` | Medium | HIGH | Complex size mutation with tab override |
| `remove()` | Medium | HIGH | Child removal with selection adjustment |
| `isAutoSelectTab()` | Low | Medium | Conditional auto-select logic |
| `setSelected()` | Low | Medium | Mutation (replaced by `withSelected`) |
| `setTabHeaderRect()` | Low | Low | Mutation (replaced by immutable) |
| `setContentRect()` | Low | Low | Mutation (replaced by immutable) |
| `updateAttrs()` | Medium | Medium | Attribute update from JSON |
| `isMaximized()` | Low | Low | Always returns false |
| `getSelectedNode()` | Low | Medium | Requires children array access |
| `getRect()` | Low | **HIGH** | Override returns tabHeaderRect, not rect |

### Missing Properties/Fields

| Property | Purpose | Impact |
|----------|---------|--------|
| `model` | Model reference for operations | **CRITICAL** |
| `children` | Child TabNode array | **CRITICAL** |
| `parent` | Parent node reference | HIGH |
| `path` | Tree path | Medium |
| `listeners` | Event listener map | Medium |
| `attributes` | Generic attribute storage | Medium (schema replaces) |

---

## Behavioral Differences

### 1. Size Calculation Logic
**Original** `getSize()`:
```typescript
getSize() {
    const defaultSize = this.getAttr("size") as number;
    const selected = this.getSelected();
    if (selected === -1) {
        return defaultSize;
    } else {
        const tabNode = this.children[selected] as TabNode;
        const tabBorderSize = this.isHorizontal()
            ? tabNode.getAttr("borderWidth")
            : tabNode.getAttr("borderHeight");
        if (tabBorderSize === -1) {
            return defaultSize;
        } else {
            return tabBorderSize;
        }
    }
}
```
**Port** `getSize()`:
```typescript
getSize(): number {
    return O.getOrElse(this.size, () => 200);
}
```
**Impact**: Port loses per-tab size override capability. The original allows individual tabs to specify their own border size.

### 2. Drop Operation Logic
**Original** `canDrop()`: 70+ lines of complex hit-testing:
- Checks if drag is TabNode
- Tests if point is in tabHeaderRect
- Handles vertical vs horizontal orientation
- Calculates insertion index based on mouse position
- Creates DropInfo with precise outline rectangles
- Tests if point is in contentRect for content drops
- Validates via `canDockInto()`

**Port** `canDrop()`:
```typescript
canDrop(_dragNode: IDraggable, _x: number, _y: number): DropInfo | undefined {
    // Base implementation returns undefined - full logic requires model context
    return undefined;
}
```
**Impact**: **CRITICAL** - Drag-and-drop to borders completely non-functional.

### 3. Serialization
**Original** `toJson()`:
```typescript
toJson(): IJsonBorderNode {
    const json: any = {};
    BorderNode.attributeDefinitions.toJson(json, this.attributes);
    json.location = this.location.getName();
    json.children = this.children.map((child) => (child as TabNode).toJson());
    return json;
}
```
**Port**: Missing entirely.
**Impact**: **CRITICAL** - Cannot save layouts.

### 4. Tree Integration
**Original**: Full tree integration via `Node` parent class:
- `model` reference for global operations
- `children` array management
- `parent` reference for tree traversal
- Event listener system
- Attribute inheritance via `getAttr()`

**Port**: Schema-based data class only. No tree integration.
**Impact**: **CRITICAL** - Cannot function as tree node.

---

## Dependency Mapping

| Original Dependency | Port Status | Notes |
|---------------------|-------------|-------|
| `Attribute` | Replaced | Schema handles types |
| `AttributeDefinitions` | Replaced | Schema definitions |
| `DockLocation` | Ported | Available in port |
| `DropInfo` | Ported | Available, correctly typed |
| `Orientation` | Ported | Available |
| `Rect` | Ported | Available |
| `CLASSES` | Ported | Available in `types.ts` |
| `IDraggable` | Ported | Available as interface |
| `IDropTarget` | Ported | Available as interface |
| `IJsonBorderNode` | Partially | `BorderAttributes` serves similar purpose |
| `Model` | **NOT PORTED** | Missing critical dependency |
| `Node` (parent) | **DIFFERENT** | Schema composition vs inheritance |
| `TabNode` | Ported | Available but not integrated |
| `TabSetNode` | Ported | Available but not integrated |
| `adjustSelectedIndex` | Ported | Available in utils.ts |

---

## Missing Features Summary

### Critical (Blocks Core Functionality)

1. **`canDrop()` implementation** - 70+ lines of hit-testing logic
2. **`drop()` implementation** - Drop execution logic
3. **`fromJson()` static method** - Deserialization
4. **`toJson()` method** - Serialization
5. **Tree integration** - Model reference, children array, parent reference

### High Priority (Limits Functionality)

6. **`getSplitterBounds()`** - Splitter constraint calculation
7. **`calculateSplit()`** - Split position calculation
8. **`setSize()` complex logic** - Per-tab size override
9. **`getSelectedNode()`** - Requires children access
10. **`remove()` method** - Child removal with selection adjustment
11. **`getRect()` override** - Should return `tabHeaderRect`, not `rect`

### Medium Priority (Feature Completeness)

12. **`isAutoSelectTab()`** - Conditional behavior
13. **`updateAttrs()`** - Attribute updates from JSON
14. **Event listener system** - `setEventListener`, `removeEventListener`, `fireEvent`
15. **`getMinSize()/getMaxSize()` with tab consideration** - Currently simplified

### Low Priority (Nice to Have)

16. **`isMaximized()`** - Always returns false
17. **Path tracking** - `path` field and `setPath()`

---

## Prioritized Recommendations

### Phase 1: Core Data Integration
1. Add `model` reference capability (via Context or dependency injection)
2. Add `children` array management
3. Add `parent` reference
4. Implement `fromJson()` static factory
5. Implement `toJson()` method

### Phase 2: Drag-and-Drop
6. Implement full `canDrop()` logic with hit-testing
7. Implement `drop()` method
8. Ensure `DropInfo` integration works correctly

### Phase 3: Layout Operations
9. Implement `getSplitterBounds()`
10. Implement `calculateSplit()`
11. Implement complex `setSize()` or equivalent immutable version
12. Fix `getRect()` to return `tabHeaderRect`
13. Implement `getSelectedNode()` with children access

### Phase 4: Event System & Polish
14. Add event listener system
15. Implement `isAutoSelectTab()`
16. Implement `remove()` method
17. Add full `getMinSize()/getMaxSize()` logic

---

## Architectural Decision Points

### Option A: Extend Schema Pattern
Continue with Effect Schema classes, adding:
- Service dependencies via Effect Context
- Children as immutable array field
- All mutations return new instances

**Pros**: Consistent with codebase patterns, type-safe, immutable
**Cons**: Significant divergence from original, complex DnD state

### Option B: Runtime Class Wrapper
Create a runtime class that wraps the Schema type:
```typescript
class RuntimeBorderNode {
  constructor(
    private data: BorderNode,
    private model: Model,
    private children: RuntimeTabNode[]
  ) {}
  // Implement full API
}
```

**Pros**: Closer to original behavior, easier to port remaining logic
**Cons**: Two representations to maintain

### Option C: Hybrid Approach
Use Schema for serialization/validation, separate state management for runtime:
- `BorderNode` (Schema) - Data shape
- `BorderNodeState` - Mutable runtime state
- `borderNodeOps` - Pure functions for operations

**Pros**: Clean separation, testable
**Cons**: More complex architecture

---

## Conclusion

The BorderNode port has established a solid foundation for the data schema and basic accessors, but lacks the critical functionality that makes BorderNode useful in the layout system. The most significant gaps are:

1. **No serialization/deserialization** - Cannot load or save layouts
2. **No drag-and-drop** - `canDrop()` and `drop()` are stubs
3. **No tree integration** - Missing model, children, and parent references

Estimated completion with current approach: **55-60%** of functionality ported.

To reach full functionality, the team should decide on the architectural approach (Options A/B/C above) and prioritize the Phase 1 and Phase 2 items, as these block basic layout operations.
