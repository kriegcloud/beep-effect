# Model/Actions Architecture Analysis

## Executive Summary

This analysis compares the legacy FlexLayout model and action system with the Effect-ported version. The legacy implementation uses imperative class-based state with event listeners. The port introduces an immutable, Effect-based approach with JSON schema validation.

## Action Type Inventory

| Action | Constant | Legacy | Port | Payload Schema |
|--------|----------|--------|------|----------------|
| Add Node | ADD_NODE | Yes | Yes | `{json, toNode, location, index, select?}` |
| Move Node | MOVE_NODE | Yes | Yes | `{fromNode, toNode, location, index, select?}` |
| Delete Tab | DELETE_TAB | Yes | Yes | `{node}` |
| Delete TabSet | DELETE_TABSET | Yes | Yes | `{node}` |
| Rename Tab | RENAME_TAB | Yes | Yes | `{node, text}` |
| Select Tab | SELECT_TAB | Yes | Yes | `{tabNode}` |
| Set Active TabSet | SET_ACTIVE_TABSET | Yes | Yes | `{tabsetNode, windowId?}` |
| Adjust Weights | ADJUST_WEIGHTS | Yes | Yes | `{nodeId, weights}` |
| Adjust Border Split | ADJUST_BORDER_SPLIT | Yes | Yes | `{node, pos}` |
| Maximize Toggle | MAXIMIZE_TOGGLE | Yes | Yes | `{node, windowId?}` |
| Update Model Attrs | UPDATE_MODEL_ATTRIBUTES | Yes | Yes | `{json}` |
| Update Node Attrs | UPDATE_NODE_ATTRIBUTES | Yes | Yes | `{node, json}` |
| Popout Tab | POPOUT_TAB | Yes | Stubbed | `{node}` |
| Popout TabSet | POPOUT_TABSET | Yes | Stubbed | `{node}` |
| Close Window | CLOSE_WINDOW | Yes | Stubbed | `{windowId}` |
| Create Window | CREATE_WINDOW | Yes | Stubbed | `{layout, rect}` |

**Total:** 16 action types. 12 fully ported (75%), 4 stubbed (25%).

## Action Flow Details

### ADD_NODE
- **Trigger:** User drags tab from palette, or programmatic action
- **Payload:** `{json, toNode, location, index, select?}`
- **State Changes:** Creates TabNode, adds to target location
- **Port Status:** Complete

### MOVE_NODE
- **Trigger:** User drags existing tab to new location
- **Payload:** `{fromNode, toNode, location, index, select?}`
- **State Changes:** Removes from source, adds at target
- **Port Status:** Complete (tabs only, tabset move logs warning)

### DELETE_TAB
- **Trigger:** User clicks close button on tab
- **Payload:** `{node}`
- **State Changes:** Removes tab, adjusts selected index
- **Port Status:** Complete

### SELECT_TAB
- **Trigger:** User clicks tab button
- **Payload:** `{tabNode}`
- **State Changes:** Sets selected index, updates active tabset
- **Port Status:** Complete

### MAXIMIZE_TOGGLE
- **Trigger:** User clicks maximize button
- **Payload:** `{node, windowId?}`
- **State Changes:** Toggles maximizedTabSetId
- **Port Status:** Complete

## Callback Hooks

| Callback | Signature | Purpose | Port Status |
|----------|-----------|---------|-------------|
| onAction | `(action: Action) => void` | Called after model changes | Not ported |
| onAllowDrop | `(dragNode, dropInfo) => boolean` | Veto drop operations | Not ported |
| onCreateTabSet | `(tabNode?) => ITabSetAttributes` | Customize new tabsets | Not ported |
| onRenderTab | `(node, renderValues) => void` | Customize tab rendering | Not ported |
| onRenderTabSet | `(node, renderValues) => void` | Customize tabset rendering | Not ported |
| onRenderDragRect | `(content, node?, json?) => ReactNode` | Customize drag preview | Not ported |
| onContextMenu | `(node, event) => void` | Right-click handling | Not ported |
| onAuxMouseClick | `(node, event) => void` | Middle-click handling | Not ported |
| onTabSetPlaceHolder | `(node) => ReactNode` | Empty tabset content | Not ported |
| addChangeListener | `(listener) => void` | Add observer callback | Not ported |

**Key Finding:** Callbacks are UI layer concerns and belong in Layout component, not Model layer.

## Persistence

### Serialization (toJson)

**Legacy:**
```typescript
toJson(): IJsonModel {
  const global = {};
  Model.attributeDefinitions.toJson(global, this.attributes);
  this.visitNodes(node => node.fireEvent("save", {}));
  return {
    global,
    borders: this.borders.toJson(),
    layout: this.rootWindow.root.toJson(),
    popouts: windows
  };
}
```

**Port:**
```typescript
toJson(): JsonModel {
  const borders = A.map(this.borders.getBorders(), border => ...);
  return new JsonModel({
    global: O.some(this.globalAttributes),
    layout: rootLayout,
    borders: O.some(borders),
    popouts: O.none()  // TODO
  });
}
```

**Port Status:** Partial - borders incomplete, popouts stubbed

### Deserialization (fromJson)

**Port:**
```typescript
static fromJson(json: unknown): Effect<Model, ParseError> {
  const jsonModel = S.decodeUnknown(JsonModel)(json);
  return Model._buildFromJsonModel(jsonModel);
}
```

**Port Status:** Complete - Effect-based with validation, automatic ID generation

## Gap Analysis

### Fully Ported (12/16 actions)
1. ADD_NODE
2. MOVE_NODE
3. DELETE_TAB
4. DELETE_TABSET
5. RENAME_TAB
6. SELECT_TAB
7. SET_ACTIVE_TABSET
8. ADJUST_WEIGHTS
9. ADJUST_BORDER_SPLIT
10. MAXIMIZE_TOGGLE
11. UPDATE_MODEL_ATTRIBUTES
12. UPDATE_NODE_ATTRIBUTES

### Missing/Stubbed (4/16 actions)
1. POPOUT_TAB - Requires LayoutWindow infrastructure
2. POPOUT_TABSET - Requires window management
3. CLOSE_WINDOW - Requires LayoutWindow management
4. CREATE_WINDOW - Requires coordinate transformation

## Key Architectural Differences

### 1. Immutability Strategy

**Legacy:** Mutable tree with imperative operations
```typescript
node.drop(...);  // Mutates in place
```

**Port:** Immutable tree with functional updates
```typescript
return new Model({ ...this, rootLayout: updated });
```

### 2. Type Safety

**Legacy:** Loose typing with `any`
**Port:** Strict Effect Schema validation

### 3. Node Lookup

**Legacy:** Runtime map `idMap: Map<string, Node>`
**Port:** Lazy-built map with `Option<T>` for safe access

### 4. Event System

**Legacy:** Callback-based observer pattern
**Port:** No callbacks in model layer (pure data structure)

## Port Completeness Scorecard

| Dimension | Score | Status |
|-----------|-------|--------|
| Actions | 75% | 12/16 complete |
| Callbacks | 0% | No callbacks ported |
| Persistence | 85% | Serialization partial, deserialization complete |
| Tree Operations | 90% | Full traversal, lookup, update |
| Type Safety | 100% | Effect Schema validation |
| Immutability | 100% | All operations return new Model |
| Windows | 0% | Stubbed |
| **Overall** | ~66% | Core tree operations complete |

## Demo App Callback Usage

The demo uses these callbacks extensively:

| Callback | Usage | Port Equivalent |
|----------|-------|-----------------|
| onAction | Identity passthrough | Use Effect.log or caller-level logging |
| onRenderTab | Customize tab rendering | Layout component render callback |
| onRenderTabSet | Add custom buttons | Layout component render callback |
| onRenderDragRect | Custom drag preview | Drag handler |
| onTabSetPlaceHolder | "Drag tabs here" message | TabSetNode render |
| onContextMenu | Right-click menu | TabNode event handler |

**Key Finding:** Demo relies on callbacks for ALL UI customization. Porting requires implementing Layout component callback props.

---

*Generated: 2026-01-10*
