# Port Progress Report: BorderSet.ts

## Summary

| Metric | Value |
|--------|-------|
| **File** | `model/BorderSet.ts` |
| **Completion** | **Partial (60%)** |
| **Critical Missing** | `fromJson`, `findDropTargetNode`, `forEachNode`, `setPaths`, `toJson` |
| **Architectural Difference** | Immutable Effect Schema class vs mutable OOP class |

The port transforms BorderSet from a mutable container class with Model dependency to an immutable Effect Schema class. While the port provides clean accessor methods and filtering capabilities, it lacks critical serialization methods (`fromJson`/`toJson`) and tree traversal methods (`forEachNode`, `findDropTargetNode`) that are essential for layout persistence and drag-and-drop functionality.

---

## Original Analysis

### Class Definition

```typescript
// Original: Mutable class with Model dependency
export class BorderSet {
    private borders: BorderNode[];
    private borderMap: Map<DockLocation, BorderNode>;
    private layoutHorizontal: boolean;

    constructor(_model: Model) {
        this.borders = [];
        this.borderMap = new Map<DockLocation, BorderNode>();
        this.layoutHorizontal = true;
    }
}
```

### Static Methods

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| `fromJson` | `json: any, model: Model` | `BorderSet` | Deserializes JSON, creates BorderNode children, populates borderMap |

### Instance Methods

| Method | Parameters | Return Type | Description | Internal? |
|--------|------------|-------------|-------------|-----------|
| `toJson` | none | `IJsonBorderNode[]` | Serializes all borders to JSON array | No |
| `getLayoutHorizontal` | none | `boolean` | Returns layoutHorizontal flag | Yes |
| `getBorders` | none | `BorderNode[]` | Returns borders array | Yes |
| `getBorderMap` | none | `Map<DockLocation, BorderNode>` | Returns location-to-border map | Yes |
| `forEachNode` | `fn: (node: Node, level: number) => void` | `void` | Iterates all nodes (borders and their children) at depth levels | Yes |
| `setPaths` | none | `void` | Sets path strings for all borders and their children | Yes |
| `findDropTargetNode` | `dragNode: Node & IDraggable, x: number, y: number` | `DropInfo \| undefined` | Finds drop target at coordinates by checking visible borders | Yes |

### Properties

| Property | Type | Visibility | Description |
|----------|------|------------|-------------|
| `borders` | `BorderNode[]` | private | Array of border nodes |
| `borderMap` | `Map<DockLocation, BorderNode>` | private | Maps location to border for O(1) lookup |
| `layoutHorizontal` | `boolean` | private | Layout orientation flag (always true in original) |

### Dependencies

| Import | Usage |
|--------|-------|
| `DockLocation` | Key type for borderMap, location comparisons |
| `DropInfo` | Return type for findDropTargetNode |
| `BorderNode` | Child node type, calls fromJson/toJson |
| `IDraggable` | Interface for drag node parameter |
| `Model` | Constructor parameter (stored but unused) |
| `Node` | Base type for forEachNode callback |

---

## Port Analysis

### Class Definition

```typescript
// Port: Immutable Effect Schema class
export class BorderSet extends S.Class<BorderSet>($I`BorderSet`)(
  {
    borders: S.Array(BorderNode).annotations({
      description: "Collection of border nodes for each edge",
    }),
  },
  $I.annotations("BorderSet", {
    description: "Collection of edge borders for a flex-layout",
  })
) { ... }
```

### Static Methods

| Method | Parameters | Return Type | Status |
|--------|------------|-------------|--------|
| `empty` | none | `BorderSet` | **New** - Creates empty BorderSet |
| `fromBorders` | `borders: ReadonlyArray<BorderNode>` | `BorderSet` | **New** - Factory from border array |

### Instance Methods

| Method | Parameters | Return Type | Status |
|--------|------------|-------------|--------|
| `getBorderByLocation` | `location: BorderLocation.Type` | `O.Option<BorderNode>` | **New** - Option-based lookup |
| `getBorders` | none | `ReadonlyArray<BorderNode>` | **Ported** - Returns readonly array |
| `getBorderCount` | none | `number` | **New** - Convenience accessor |
| `hasBorderAt` | `location: BorderLocation.Type` | `boolean` | **New** - Existence check |
| `getVisibleBorders` | none | `ReadonlyArray<BorderNode>` | **New** - Filter by show flag |
| `getOpenBorders` | none | `ReadonlyArray<BorderNode>` | **New** - Filter by selected >= 0 |
| `getHorizontalBorders` | none | `ReadonlyArray<BorderNode>` | **New** - Filter top/bottom |
| `getVerticalBorders` | none | `ReadonlyArray<BorderNode>` | **New** - Filter left/right |
| `updateBorderAt` | `location, updater` | `BorderSet` | **New** - Immutable update |
| `setBorder` | `newBorder: BorderNode` | `BorderSet` | **New** - Add/replace border |
| `removeBorderAt` | `location: BorderLocation.Type` | `BorderSet` | **New** - Remove border |
| `toString` | none | `string` | **New** - String representation |

### Properties

| Property | Type | Status |
|----------|------|--------|
| `borders` | `ReadonlyArray<BorderNode>` | **Ported** - Immutable array |

---

## Missing Features

### Critical (Blocks Core Functionality)

| Feature | Original | Impact | Priority |
|---------|----------|--------|----------|
| `fromJson` static method | Deserializes borders with Model context, populates borderMap | **Layout persistence broken** | P0 |
| `toJson` method | Serializes all borders | **Cannot save layouts** | P0 |
| `findDropTargetNode` method | Finds drop target by iterating visible borders and calling `canDrop` | **Drag-and-drop non-functional** | P0 |
| `forEachNode` method | Depth-first traversal of borders and children | **Tree operations broken** | P1 |
| `setPaths` method | Sets path strings for borders/children | **Path resolution broken** | P1 |

### Missing Properties

| Property | Original Type | Impact | Priority |
|----------|---------------|--------|----------|
| `borderMap` | `Map<DockLocation, BorderNode>` | O(1) lookup performance; currently requires O(n) search | P2 |
| `layoutHorizontal` | `boolean` | Layout orientation flag (appears unused but may be required) | P3 |

### Missing Dependencies

| Dependency | Usage in Original | Port Status |
|------------|-------------------|-------------|
| `Model` | Constructor parameter, used in children's fromJson | Schema-based, Model not directly available |
| `DockLocation` | Key type for borderMap | Uses `BorderLocation.Type` string instead |
| `DropInfo` | Return type for findDropTargetNode | Type imported but method not implemented |
| `IDraggable` | Parameter type for findDropTargetNode | Type imported but method not implemented |

---

## Behavioral Differences

### 1. Mutability vs Immutability

**Original:**
```typescript
// Mutable - borders array can be modified
borderSet.borders = json.map((borderJson: any) => BorderNode.fromJson(...));
borderSet.borderMap.set(border.getLocation(), border);
```

**Port:**
```typescript
// Immutable - returns new instance
const updated = borderSet.setBorder(newBorder);
const removed = borderSet.removeBorderAt("left");
```

**Impact:** Callers must capture returned instances; existing code expecting mutation will fail.

### 2. Location Lookup

**Original:**
```typescript
// O(1) Map lookup
const border = borderSet.getBorderMap().get(DockLocation.LEFT);
```

**Port:**
```typescript
// O(n) Array search returning Option
const border = borderSet.getBorderByLocation("left");
// Returns O.Option<BorderNode>
```

**Impact:** Performance difference negligible for 4 borders max; API change requires Option handling.

### 3. BorderMap Absence

**Original:**
```typescript
getBorderMap(): Map<DockLocation, BorderNode>
// Direct map access for callers needing iteration or modification
```

**Port:**
```typescript
// No borderMap exposed - must use getBorderByLocation or filtering methods
```

**Impact:** Code depending on Map API will need refactoring.

### 4. Type System Differences

**Original:**
```typescript
// DockLocation enum instances
DockLocation.LEFT, DockLocation.RIGHT, DockLocation.TOP, DockLocation.BOTTOM
```

**Port:**
```typescript
// String literal type
type BorderLocation = "left" | "right" | "top" | "bottom"
```

**Impact:** Conversion required at boundaries; `BorderNode.toDockLocation()` helper exists.

### 5. Tree Traversal

**Original:**
```typescript
forEachNode(fn: (node: Node, level: number) => void) {
    for (const borderNode of this.borders) {
        fn(borderNode, 0);
        for (const node of borderNode.getChildren()) {
            node.forEachNode(fn, 1); // Recursive traversal
        }
    }
}
```

**Port:**
```typescript
// Not implemented - BorderNode in port has no children concept
// BorderNode is purely a schema, not a container with children
```

**Impact:** Tree operations impossible; requires architectural decision on where children live.

---

## Architectural Observations

### Schema vs Runtime Separation

The port separates schema (data shape) from runtime behavior more strictly:

1. **BorderSet** is a pure data container with filtering helpers
2. **BorderNode** is a schema class without children management
3. Tree relationships (borders -> tabs) are not represented in schema

This differs from the original where:
1. **BorderSet** managed both data and tree traversal
2. **BorderNode** extended `Node` with full children management
3. Tree structure was self-contained in the model

### Missing Architectural Piece

The port appears to need either:
1. A separate runtime layer that wraps schema classes with tree behavior
2. Extension of schema classes to include children arrays
3. A `Model` class that manages the tree structure externally

Currently, the port's `BorderNode` has no `children` property, making methods like `forEachNode` and `setPaths` impossible without architectural changes.

---

## Recommendations

### Priority 0 (Immediate)

1. **Add `fromJson` static method**
   - Must handle nested BorderNode creation
   - Consider how Model context will be provided (DI, parameter, or external)

2. **Add `toJson` method**
   - Delegate to BorderNode.toJson for each border
   - Required for layout persistence

3. **Add `findDropTargetNode` method**
   - Iterate visible borders, call `canDrop` on each
   - Return first non-undefined DropInfo

### Priority 1 (Core Functionality)

4. **Resolve children architecture**
   - Either add `children: ReadonlyArray<TabNode>` to BorderNode schema
   - Or create runtime wrapper classes that manage tree structure
   - Decision impacts `forEachNode`, `setPaths`, and all tree operations

5. **Add `forEachNode` method**
   - Requires children resolution first
   - Maintain level-based traversal semantics

6. **Add `setPaths` method**
   - Requires children resolution first
   - Generate paths like `/border/${location}/t${index}`

### Priority 2 (Performance)

7. **Consider borderMap for O(1) lookup**
   - Could be computed lazily or maintained in parallel
   - Current O(n) search is acceptable for 4 borders

### Priority 3 (Completeness)

8. **Add `layoutHorizontal` property if needed**
   - Appears unused in original (always `true`)
   - May be vestigial; verify before adding

---

## Code Comparison

### fromJson (Missing in Port)

```typescript
// Original
static fromJson(json: any, model: Model) {
    const borderSet = new BorderSet(model);
    borderSet.borders = json.map((borderJson: any) => BorderNode.fromJson(borderJson, model));
    for (const border of borderSet.borders) {
        borderSet.borderMap.set(border.getLocation(), border);
    }
    return borderSet;
}

// Suggested Port
static fromJson(json: unknown): BorderSet {
    const decoded = S.decodeUnknownSync(S.Array(BorderNode))(json);
    return BorderSet.fromBorders(decoded);
}
```

### findDropTargetNode (Missing in Port)

```typescript
// Original
findDropTargetNode(dragNode: Node & IDraggable, x: number, y: number): DropInfo | undefined {
    for (const border of this.borders) {
        if (border.isShowing()) {
            const dropInfo = border.canDrop(dragNode, x, y);
            if (dropInfo !== undefined) {
                return dropInfo;
            }
        }
    }
    return undefined;
}

// Suggested Port
findDropTargetNode(dragNode: IDraggable, x: number, y: number): DropInfo | undefined {
    return A.findFirst(
        this.getVisibleBorders(),
        (border) => border.canDrop(dragNode, x, y) !== undefined
    ).pipe(
        O.flatMap(border => O.fromNullable(border.canDrop(dragNode, x, y)))
    ).pipe(O.getOrUndefined);
}
```

---

## Files Referenced

- **Original**: `/home/elpresidank/YeeBois/projects/beep-effect/tmp/FlexLayout/src/model/BorderSet.ts`
- **Port**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/ui/ui/src/flex-layout/model/border-set.ts`
- **Original BorderNode**: `/home/elpresidank/YeeBois/projects/beep-effect/tmp/FlexLayout/src/model/BorderNode.ts`
- **Port BorderNode**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/ui/ui/src/flex-layout/model/border-node.ts`
