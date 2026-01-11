# Port Progress Report: RowNode.ts

| Attribute | Value |
|-----------|-------|
| **Original File** | `/tmp/FlexLayout/src/model/RowNode.ts` |
| **Port File** | `/packages/ui/ui/src/flex-layout/model/row-node.ts` |
| **Completion Status** | **Incomplete (15-20%)** |
| **Analysis Date** | 2026-01-10 |

---

## Summary

The port of `RowNode` is in an early stage. The basic schema structure has been established using Effect's `S.Class` pattern, but the majority of the original functionality is missing or stubbed. The original class contains 559 lines with complex splitter calculation algorithms, tree manipulation, drag-and-drop logic, and min/max constraint propagation. The port contains only 202 lines with basic schema fields and stub implementations.

### Key Findings

1. **Schema Architecture Divergence**: The port uses Effect's `S.Class` pattern with immutable data structures, while the original uses a traditional OOP class hierarchy extending `Node` with mutable state.

2. **Missing Tree Structure**: The port lacks the fundamental tree operations (parent, children, addChild, removeChild) that are inherited from the base `Node` class in the original.

3. **Missing Splitter Logic**: All complex splitter calculation algorithms (`getSplitterBounds`, `getSplitterInitials`, `calculateSplit`) are completely absent.

4. **Missing Model Integration**: No integration with the Model class for node registration, unique ID generation, or attribute definitions.

---

## Original Analysis

### Class Structure

```typescript
export class RowNode extends Node implements IDropTarget {
  static readonly TYPE = "row";

  // Private fields
  private windowId: string;
  private minHeight: number;
  private minWidth: number;
  private maxHeight: number;
  private maxWidth: number;

  // Static
  private static attributeDefinitions: AttributeDefinitions;
}
```

### Public Methods

| Method | Signature | Lines | Description |
|--------|-----------|-------|-------------|
| `getWeight` | `(): number` | 68-70 | Returns weight attribute |
| `toJson` | `(): IJsonRowNode` | 72-82 | Serializes to JSON including children |
| `setWindowId` | `(windowId: string): void` | 89-91 | Sets window ID for popout support |

### Internal Methods (marked `@internal`)

| Method | Signature | Lines | Description | Complexity |
|--------|-----------|-------|-------------|------------|
| `static fromJson` | `(json, model, layoutWindow): RowNode` | 22-38 | Factory method with recursive child deserialization | Medium |
| `constructor` | `(model, windowId, json)` | 55-66 | Initializes defaults, parses attributes, normalizes weights | Low |
| `getWindowId` | `(): string` | 85-87 | Returns window ID | Low |
| `setWeight` | `(weight: number): void` | 94-96 | Sets weight attribute | Low |
| `getSplitterBounds` | `(index: number): number[]` | 99-127 | **Complex**: Calculates min/max splitter positions respecting child constraints | High |
| `getSplitterInitials` | `(index: number): object` | 130-150 | **Complex**: Gets initial sizes and positions for splitter drag | Medium |
| `calculateSplit` | `(index, splitterPos, initialSizes, sum, startPosition): number[]` | 153-237 | **Complex**: Calculates new weights after splitter drag with constraint propagation | Very High |
| `getMinSize` | `(orientation: Orientation): number` | 240-246 | Returns min size for orientation | Low |
| `getMinWidth` | `(): number` | 249-251 | Returns minWidth | Low |
| `getMinHeight` | `(): number` | 254-256 | Returns minHeight | Low |
| `getMaxSize` | `(orientation: Orientation): number` | 259-265 | Returns max size for orientation | Low |
| `getMaxWidth` | `(): number` | 268-270 | Returns maxWidth | Low |
| `getMaxHeight` | `(): number` | 273-275 | Returns maxHeight | Low |
| `calcMinMaxSize` | `(): void` | 278-308 | **Complex**: Recursively calculates min/max constraints from children | High |
| `tidy` | `(): void` | 311-367 | **Complex**: Cleans up empty nodes, hoists single children, handles root | High |
| `canDrop` | `(dragNode, x, y): DropInfo \| undefined` | 371-417 | **Complex**: Edge dock detection with coordinate calculations | High |
| `drop` | `(dragNode, location, index): void` | 420-503 | **Complex**: Executes drop with tree restructuring | Very High |
| `isEnableDrop` | `(): boolean` | 508-510 | Returns true | Low |
| `getAttributeDefinitions` | `(): AttributeDefinitions` | 513-515 | Returns static definitions | Low |
| `updateAttrs` | `(json): void` | 518-520 | Updates attributes from JSON | Low |
| `static getAttributeDefinitions` | `(): AttributeDefinitions` | 523-525 | Static getter for definitions | Low |
| `normalizeWeights` | `(): void` | 529-544 | Normalizes child weights to percentages | Medium |
| `static createAttributeDefinitions` | `(): AttributeDefinitions` | 547-558 | Creates attribute schema | Low |

### Inherited Methods from Node (Used in RowNode)

| Method | Usage in RowNode |
|--------|------------------|
| `getOrientation()` | Used in splitter calculations |
| `getChildren()` | Used throughout for child access |
| `getRect()` | Used in canDrop coordinate calculations |
| `addChild(node, pos?)` | Used in drop() and tidy() |
| `removeChild(node)` | Used in tidy() |
| `removeAll()` | Used in drop() for restructuring |
| `model` (protected) | Used for model operations |
| `attributes` (protected) | Used for attribute storage |
| `children` (protected) | Used for child manipulation |

### Dependencies

| Import | Usage |
|--------|-------|
| `TabNode` | Type checking in drop() |
| `Attribute` | Attribute type definitions |
| `AttributeDefinitions` | Schema management |
| `DockLocation` | Drop location handling |
| `DropInfo` | Drop result type |
| `Orientation` | Splitter direction |
| `CLASSES` | CSS class constants |
| `BorderNode` | Parent type checking in drop() |
| `IDraggable` | Drag source interface |
| `IDropTarget` | Drop target interface |
| `IJsonRowNode` | JSON serialization type |
| `DefaultMax, DefaultMin, Model` | Model integration |
| `Node` | Base class |
| `TabSetNode` | Child type handling |
| `canDockToWindow` | Popout window utility |
| `LayoutWindow` | Window management |

---

## Port Analysis

### Schema Structure

```typescript
export class RowNode
  extends S.Class<RowNode>($I`RowNode`)({
    // Serialized fields
    id: S.optionalWith(S.String, { as: "Option" }),
    type: S.optionalWith(S.Literal("row"), { default: () => "row" as const }),
    weight: S.optionalWith(S.Number, { default: () => 100 }),
    rect: S.optionalWith(Rect, { default: () => Rect.empty() }),

    // Runtime fields
    windowId: S.optionalWith(S.String, { default: () => "" }),
    minWidth: S.optionalWith(S.Number, { default: () => 0 }),
    maxWidth: S.optionalWith(S.Number, { default: () => 0 }),
    minHeight: S.optionalWith(S.Number, { default: () => 0 }),
    maxHeight: S.optionalWith(S.Number, { default: () => 0 }),
  })
  implements IDropTarget
```

### Implemented Methods

| Method | Status | Notes |
|--------|--------|-------|
| `canDrop` | **Stubbed** | Returns `undefined` with TODO comment |
| `drop` | **Stubbed** | Empty implementation with TODO comment |
| `isEnableDrop` | **Complete** | Returns `true` |
| `isRoot` | **Stubbed** | Returns `false` with TODO comment |
| `toJson` | **Partial** | Returns basic fields but no children array |
| `toString` | **Complete** | Debug string representation |

### Missing Infrastructure

| Component | Impact |
|-----------|--------|
| Tree structure (parent, children) | Cannot build layout hierarchy |
| Model reference | Cannot register nodes or generate IDs |
| AttributeDefinitions integration | Cannot use model attribute fallbacks |
| Event listener system | Cannot fire resize/visibility events |

---

## Missing Features

### Critical (P0) - Core Functionality

| Feature | Original Lines | Description | Impact |
|---------|----------------|-------------|--------|
| `static fromJson` | 22-38 | Factory with recursive child parsing | Cannot deserialize layouts |
| Tree structure | (inherited) | parent, children, addChild, removeChild | Cannot build tree |
| `calcMinMaxSize` | 278-308 | Constraint propagation from children | Cannot calculate valid sizes |
| `tidy` | 311-367 | Tree cleanup and normalization | Cannot maintain valid tree |
| `drop` | 420-503 | Full drop implementation | Drag-and-drop broken |
| `canDrop` | 371-417 | Edge dock detection | Drag-and-drop broken |

### High Priority (P1) - Splitter Operations

| Feature | Original Lines | Description | Impact |
|---------|----------------|-------------|--------|
| `getSplitterBounds` | 99-127 | Min/max positions for splitter | Resizing broken |
| `getSplitterInitials` | 130-150 | Initial state for drag | Resizing broken |
| `calculateSplit` | 153-237 | Weight calculation after drag | Resizing broken |
| `normalizeWeights` | 529-544 | Weight normalization | Layout sizing incorrect |

### Medium Priority (P2) - Integration

| Feature | Original Lines | Description | Impact |
|---------|----------------|-------------|--------|
| `getAttributeDefinitions` | 513-515 | Static definitions access | Attribute fallbacks broken |
| `updateAttrs` | 518-520 | Attribute updates | Cannot update nodes |
| `createAttributeDefinitions` | 547-558 | Schema creation | Missing type/weight/id schema |
| Constructor with model | 55-66 | Full initialization | Cannot create proper nodes |

### Lower Priority (P3) - Accessors

| Feature | Original Lines | Description | Impact |
|---------|----------------|-------------|--------|
| `setWeight` | 94-96 | Weight setter | Minor (can use schema copy) |
| `getMinSize` | 240-246 | Orientation-aware min size | Minor convenience |
| `getMaxSize` | 259-265 | Orientation-aware max size | Minor convenience |

---

## Behavioral Differences

### 1. Immutability Model

| Aspect | Original | Port |
|--------|----------|------|
| State mutation | Mutable class fields | Immutable Effect Schema |
| Child modification | `this.children.splice()` | Must create new instances |
| Weight updates | Direct assignment | Schema transformation |

### 2. Tree Relationship

| Aspect | Original | Port |
|--------|----------|------|
| Parent reference | `this.parent` from Node | Not implemented |
| Child access | `this.children` array | Not implemented |
| Orientation | Calculated from parent depth | Cannot calculate (no parent) |

### 3. Model Integration

| Aspect | Original | Port |
|--------|----------|------|
| Node registration | `model.addNode(this)` | Not implemented |
| ID generation | `model.nextUniqueId()` | Not integrated |
| Attribute fallbacks | `model.getAttribute()` | Not implemented |

### 4. Default Values

| Field | Original Default | Port Default |
|-------|------------------|--------------|
| `minWidth` | `DefaultMin` (0) | 0 |
| `maxWidth` | `DefaultMax` (99999) | 0 (incorrect) |
| `minHeight` | `DefaultMin` (0) | 0 |
| `maxHeight` | `DefaultMax` (99999) | 0 (incorrect) |

**Issue**: Port uses 0 for maxWidth/maxHeight defaults, but original uses `DefaultMax` (99999). This will cause constraint calculations to be incorrect (0 means "no maximum" in the port but should mean "unlimited" via large value).

---

## Code Complexity Analysis

### High Complexity Methods Requiring Careful Porting

1. **`calculateSplit` (84 lines)**: Most complex algorithm
   - Bidirectional constraint propagation
   - Handles leftward and rightward splitter movement differently
   - Must respect min/max constraints of all siblings
   - Weight normalization with 0.1 minimum to prevent zero weights

2. **`drop` (83 lines)**: Complex tree restructuring
   - Handles TabNode, TabSetNode, RowNode drag sources
   - Orientation-aware restructuring (horz/vert)
   - Creates intermediate RowNodes when needed
   - Weight distribution (new node gets 1/3 of total)

3. **`tidy` (56 lines)**: Recursive tree cleanup
   - Removes empty TabSetNodes (if deletable)
   - Hoists single children from RowNodes
   - Redistributes weights when hoisting
   - Creates root TabSet if root becomes empty

4. **`canDrop` (46 lines)**: Coordinate-based drop detection
   - Edge dock detection (10px margins)
   - Half-width/height zones (50px)
   - DockLocation-based outline rect calculation
   - Window docking restrictions

---

## Recommendations

### Phase 1: Infrastructure (P0)

1. **Implement tree structure** in base Node or RowNode
   - Add `parent: Option<Node>` and `children: Array<Node>` fields
   - Create functional methods: `addChild`, `removeChild`, `setParent`
   - Consider whether to keep as schema fields or separate mutable state

2. **Fix default values** for maxWidth/maxHeight
   - Change from 0 to 99999 or introduce `DEFAULT_MAX` constant
   - Align with original `DefaultMax` semantics

3. **Implement Model integration**
   - Either inject Model as a service or include model reference
   - Required for node registration and ID generation

### Phase 2: Core Methods (P0-P1)

4. **Implement `fromJson` factory**
   - Recursive child parsing
   - Support both TabSetNode and RowNode children

5. **Implement `calcMinMaxSize`**
   - Recursive constraint propagation
   - Respect splitter size from model

6. **Implement `tidy`**
   - Tree cleanup logic
   - Weight redistribution

### Phase 3: Splitter Logic (P1)

7. **Port splitter algorithms**
   - `getSplitterBounds`
   - `getSplitterInitials`
   - `calculateSplit`

8. **Implement `normalizeWeights`**
   - Weight normalization to prevent flex-grow issues

### Phase 4: Drag-and-Drop (P1)

9. **Implement full `canDrop`**
   - Edge dock detection
   - Window restrictions

10. **Implement full `drop`**
    - Tree restructuring
    - TabSetNode creation for TabNode drops

### Architectural Decision Required

The fundamental question is whether to:

**Option A**: Keep Effect Schema immutable pattern
- Pros: Type-safe, predictable, testable
- Cons: Requires complete rethinking of tree operations, all mutations become transformations

**Option B**: Hybrid approach with mutable runtime state
- Pros: Closer to original, easier to port
- Cons: May lose Effect benefits, more complex state management

**Option C**: Effect-native approach with Ref/State
- Pros: Effect-idiomatic, concurrent-safe
- Cons: Significant departure from original, steeper learning curve

The current port appears to target Option A but hasn't resolved how tree mutations will work.

---

## Test Coverage Needs

| Test Category | Priority | Description |
|---------------|----------|-------------|
| Splitter calculations | High | Unit tests for getSplitterBounds, calculateSplit |
| Tree operations | High | Add/remove child, tidy behavior |
| JSON round-trip | High | fromJson -> toJson preserves structure |
| Drop operations | Medium | Various drop locations and node types |
| Edge cases | Medium | Empty rows, single children, weight edge cases |

---

## Conclusion

The RowNode port is at an early stage (~15-20% complete). The schema structure captures the basic fields, but all complex logic is missing. The architectural decision on mutability patterns must be resolved before significant progress can be made. The splitter calculation algorithms (`calculateSplit` especially) are the most complex pieces requiring careful porting with thorough test coverage.

**Recommended next steps**:
1. Resolve architectural approach for tree mutation
2. Fix maxWidth/maxHeight default values
3. Implement base tree structure (parent/children)
4. Port `fromJson` and `toJson` with children
5. Add comprehensive tests for splitter calculations before porting
