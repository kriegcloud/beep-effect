# Port Progress Report: model/Node.ts

## Summary

| Metric | Value |
|--------|-------|
| **Status** | Incomplete |
| **Completion** | 15% |
| **Critical Issues** | 5 |

The port has fundamentally diverged from the original architecture. The original `Node.ts` is an **abstract class** with mutable state, event listeners, parent/child relationships, and complex tree traversal logic. The port reimplements it as a **Schema constructor function** using Effect's schema system, which is appropriate for serialization but does not preserve the runtime behavioral contract.

---

## Original File Analysis

### File Location
`/home/elpresidank/YeeBois/projects/beep-effect/tmp/FlexLayout/src/model/Node.ts`

### Class Structure
- **Type**: Abstract class
- **Lines of Code**: 276

### Protected Properties (6)

| Property | Type | Description |
|----------|------|-------------|
| `model` | `Model` | Reference to parent model |
| `attributes` | `Record<string, any>` | Node attribute storage |
| `parent` | `Node \| undefined` | Parent node reference |
| `children` | `Node[]` | Child node array |
| `rect` | `Rect` | Layout rectangle |
| `path` | `string` | Path in layout tree |
| `listeners` | `Map<string, (params: any) => void>` | Event listener map |

### Public Methods (10)

| Method | Signature | Description |
|--------|-----------|-------------|
| `getId` | `() => string` | Get or generate unique ID |
| `getModel` | `() => Model` | Get parent model reference |
| `getType` | `() => string` | Get node type discriminator |
| `getParent` | `() => Node \| undefined` | Get parent node |
| `getChildren` | `() => Node[]` | Get child nodes array |
| `getRect` | `() => Rect` | Get layout rectangle |
| `getPath` | `() => string` | Get path in tree |
| `getOrientation` | `() => Orientation` | Get orientation (flipped from parent) |
| `setEventListener` | `(event: string, callback: Function) => void` | Register event listener |
| `removeEventListener` | `(event: string) => void` | Remove event listener |

### Internal Methods (16)

| Method | Signature | Description |
|--------|-----------|-------------|
| `setId` | `(id: string) => void` | Set node ID |
| `fireEvent` | `(event: string, params: any) => void` | Fire registered event |
| `getAttr` | `(name: string) => any` | Get attribute with model fallback |
| `forEachNode` | `(fn: Function, level: number) => void` | Recursive tree traversal |
| `setPaths` | `(path: string) => void` | Set paths recursively |
| `setParent` | `(parent: Node) => void` | Set parent reference |
| `setRect` | `(rect: Rect) => void` | Set layout rectangle |
| `setPath` | `(path: string) => void` | Set path |
| `setWeight` | `(weight: number) => void` | Set weight attribute |
| `setSelected` | `(index: number) => void` | Set selected index |
| `findDropTargetNode` | `(windowId, dragNode, x, y) => DropInfo \| undefined` | Find drop target recursively |
| `canDrop` | `(dragNode, x, y) => DropInfo \| undefined` | Check if can drop (default returns undefined) |
| `canDockInto` | `(dragNode, dropInfo) => boolean` | Check dock validity with rules |
| `removeChild` | `(childNode: Node) => number` | Remove child and return position |
| `addChild` | `(childNode: Node, pos?: number) => number` | Add child at position |
| `removeAll` | `() => void` | Remove all children |
| `styleWithPosition` | `(style?) => Record<string, any>` | Get style object with position |
| `isEnableDivide` | `() => boolean` | Check if divide enabled (default true) |
| `toAttributeString` | `() => string` | JSON stringify attributes |

### Abstract Methods (2)

| Method | Signature | Description |
|--------|-----------|-------------|
| `toJson` | `() => IJsonRowNode \| IJsonBorderNode \| IJsonTabSetNode \| IJsonTabNode \| undefined` | Serialize to JSON |
| `updateAttrs` | `(json: any) => void` | Update from JSON |
| `getAttributeDefinitions` | `() => AttributeDefinitions` | Get attribute definitions |

### Dependencies (7)

| Import | Usage |
|--------|-------|
| `AttributeDefinitions` | Attribute metadata |
| `DockLocation` | Drop location constants |
| `DropInfo` | Drop target information |
| `Orientation` | Layout orientation |
| `Rect` | Bounding rectangle |
| `IDraggable` | Drag interface |
| `Model` | Parent model reference |

---

## Port File Analysis

### File Location
`/home/elpresidank/YeeBois/projects/beep-effect/packages/ui/ui/src/flex-layout/model/node.ts`

### Implementation Approach
- **Type**: Schema constructor function (not a class)
- **Lines of Code**: 96

### Ported Fields (4 of 7 properties)

| Field | Ported | Notes |
|-------|--------|-------|
| `id` | Partial | Schema field, not method-based ID generation |
| `type` | Yes | Schema field |
| `rect` | Partial | Schema field with default, no runtime methods |
| `weight` | Yes | Schema field with default |
| `model` | No | Not ported |
| `parent` | No | Not ported |
| `children` | No | Not ported |
| `path` | No | Not ported |
| `listeners` | No | Not ported |

### Ported Methods (0 of 28)

All methods from the original class are missing. The port provides:
- `Node()` - Schema constructor function
- `NodeType<Fields>` - Type helper
- `NodeEncoded<Fields>` - Type helper
- `NodeContext<Fields>` - Type helper
- `BaseNodeSchema` - Base schema instance

---

## Missing Features

### Critical Missing Methods

| Method | Impact | Priority |
|--------|--------|----------|
| `getId()` | ID generation with model integration | Critical |
| `getModel()` | Model access | Critical |
| `getParent()` | Tree navigation | Critical |
| `getChildren()` | Tree navigation | Critical |
| `findDropTargetNode()` | Drop target resolution | Critical |
| `canDrop()` | Drop validation | Critical |
| `canDockInto()` | Dock validation with rules | Critical |
| `addChild()` | Tree mutation | Critical |
| `removeChild()` | Tree mutation | Critical |

### Missing Internal Methods

| Method | Impact | Priority |
|--------|--------|----------|
| `forEachNode()` | Tree traversal | High |
| `setPaths()` | Path management | High |
| `fireEvent()` | Event system | High |
| `setEventListener()` | Event registration | High |
| `getAttr()` | Attribute access with model fallback | High |
| `setRect()` | Layout updates | High |
| `getOrientation()` | Orientation calculation | Medium |
| `styleWithPosition()` | Style generation | Medium |
| `toAttributeString()` | Debug output | Low |

### Missing Properties

| Property | Type | Impact |
|----------|------|--------|
| `model` | `Model` | No model integration |
| `parent` | `Node` | No parent tracking |
| `children` | `Node[]` | No child management |
| `path` | `string` | No path tracking |
| `listeners` | `Map` | No event system |
| `attributes` | `Record<string, any>` | No attribute storage |

### Missing Abstract Contract

The original defines an abstract contract that subclasses must implement:
- `toJson()` - Serialization
- `updateAttrs()` - Deserialization
- `getAttributeDefinitions()` - Attribute metadata

The port does not establish this contract.

---

## Behavioral Differences

### Architecture Mismatch

| Aspect | Original | Port |
|--------|----------|------|
| **Paradigm** | OOP Abstract Class | Functional Schema Constructor |
| **State** | Mutable instance properties | Immutable schema types |
| **Inheritance** | Abstract class with subclasses | Schema composition |
| **Runtime** | Full behavioral contract | Serialization only |
| **Events** | Built-in listener system | None |
| **Tree** | Parent/child references | No tree structure |

### Semantic Differences

1. **ID Generation**: Original generates IDs lazily via `model.nextUniqueId()`. Port uses `S.optionalWith` with no generation logic.

2. **Attribute Access**: Original has `getAttr()` with model fallback for inherited defaults. Port has no equivalent.

3. **Event System**: Original has full event listener registration/firing. Port has nothing.

4. **Tree Traversal**: Original has `forEachNode()`, `findDropTargetNode()`. Port has no tree concept.

5. **Drag/Drop**: Original has sophisticated drop target resolution with `canDrop()`, `canDockInto()` rules. Port has nothing.

---

## Analysis

### Assessment of Port Strategy

The port appears to have taken a schema-first approach, which is appropriate for serialization and type safety but fundamentally insufficient for the behavioral requirements of the FlexLayout system. The original `Node` class is the foundation of:

1. **Tree Structure** - Parent/child relationships with navigation
2. **Layout Engine** - Rectangle assignment and path management
3. **Event System** - Listener registration and event firing
4. **Drag/Drop** - Drop target resolution and docking validation
5. **Model Integration** - Attribute inheritance from model defaults

The port provides none of these capabilities.

### What Would Need to Change

To achieve functional parity, the port would need:

1. **Runtime Class or Module**: A class or Effect service that implements the behavioral contract
2. **Tree Management**: Parent/child reference handling (possibly via Effect Ref or State)
3. **Event System**: Listener registration (possibly via Effect Hub/PubSub)
4. **Model Integration**: Service dependency for model access
5. **Abstract Contract**: Effect interface/tag for subtype implementations

### Alternative Interpretation

If the port intentionally chose schema-only representation for use with a different runtime architecture, then:
- The schema approach is valid for serialization
- A separate runtime layer would need to implement behaviors
- The current file represents ~15% of the data model requirements

---

## Recommendations

### Critical (Must Fix)

1. **Implement Tree Structure** - Add parent/children management, either via:
   - Traditional class with Effect integration
   - Effect State/Ref with tree manipulation functions
   - Separate TreeNode service layer

2. **Implement Event System** - Add listener registration/firing via:
   - Effect PubSub for event bus
   - Custom Event service
   - Callback registry with Effect

3. **Implement Model Integration** - Nodes need model reference for:
   - ID generation
   - Attribute inheritance
   - Global configuration access

4. **Implement Drop Target Logic** - Port `findDropTargetNode()`, `canDrop()`, `canDockInto()` for drag/drop to function

5. **Establish Abstract Contract** - Define interface/tag for node subtypes to implement

### High Priority

6. **Port `getAttr()` with Model Fallback** - Essential for attribute resolution
7. **Port Tree Traversal** - `forEachNode()`, `setPaths()` for layout calculations
8. **Port Rectangle Management** - `setRect()`, `styleWithPosition()` for rendering

### Medium Priority

9. **Port `getOrientation()`** - Required for layout orientation calculation
10. **Add Path Management** - Track node position in tree

### Low Priority

11. **Port Debug Utilities** - `toAttributeString()` for debugging
12. **Add Type Guards** - Runtime type checking for node subtypes

---

## Conclusion

The port is at an early stage (15% complete) and has taken a schema-first approach that diverges significantly from the original class-based architecture. While the schema definitions are useful for serialization and type safety, they do not provide the runtime behavioral contract that the FlexLayout system requires.

The most critical gap is the lack of tree structure management (parent/children) and event system, which are fundamental to how FlexLayout operates. A decision needs to be made whether to:

1. **Port the class-based approach** with Effect integration
2. **Design a new architecture** using Effect services that provides equivalent capabilities
3. **Layer approach**: Keep schemas for serialization, add separate runtime services

Option 3 may be the most idiomatic for an Effect-based codebase but requires significant additional work to design and implement the runtime layer.
