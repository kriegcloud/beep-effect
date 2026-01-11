# LayoutWindow Port Progress Report

## Overview

| Aspect | Status |
|--------|--------|
| **Original File** | `tmp/FlexLayout/src/model/LayoutWindow.ts` |
| **Port File** | `packages/ui/ui/src/flex-layout/model/layout-window.ts` |
| **Overall Status** | PARTIAL - Significant architectural differences |
| **Port Approach** | Functional/immutable Effect Schema class vs mutable OOP class |

## Summary

The port represents a **significant architectural divergence** from the original FlexLayout implementation. The original `LayoutWindow` is a mutable class that holds runtime references to live DOM `Window` objects and React layout components. The port uses Effect Schema and an immutable data model, storing only JSON-serializable data. This is an intentional design choice but results in many features being either missing or requiring different implementation locations (view layer).

---

## 1. Properties/Fields Comparison

### Original Properties (8 private fields)

| Property | Original Type | Port Status | Notes |
|----------|---------------|-------------|-------|
| `_windowId` | `string` | PORTED | As `windowId: S.String` |
| `_layout` | `LayoutInternal \| undefined` | NOT PORTED | Runtime reference to React component - belongs in view layer |
| `_rect` | `Rect` | PORTED | As `rect: S.optionalWith(Rect, { default: ... })` |
| `_window` | `Window \| undefined` | NOT PORTED | Runtime browser Window reference - belongs in view layer |
| `_root` | `RowNode \| undefined` | PARTIAL | As `layout: S.optionalWith(JsonRowNode, { as: "Option" })` - stores JSON, not live node |
| `_maximizedTabSet` | `TabSetNode \| undefined` | NOT PORTED | Runtime node reference - should be tracked in Model/view |
| `_activeTabSet` | `TabSetNode \| undefined` | NOT PORTED | Runtime node reference - should be tracked in Model/view |
| `_toScreenRectFunction` | `(rect: Rect) => Rect` | NOT PORTED | Runtime function - belongs in view layer |

### Port-Specific Additions

| Property | Port Type | Notes |
|----------|-----------|-------|
| (none) | - | Port follows minimalist JSON-serializable approach |

---

## 2. Methods Comparison

### Original Methods (15 total)

#### Constructor
| Method | Original | Port Status | Notes |
|--------|----------|-------------|-------|
| `constructor(windowId, rect)` | Takes windowId and rect | DIFFERENT | Port uses Effect Schema `S.Class` constructor pattern |

#### Public Getters (6)
| Method | Original Return Type | Port Status | Notes |
|--------|---------------------|-------------|-------|
| `windowId` | `string` | PORTED | As `getWindowId()` method |
| `rect` | `Rect` | PORTED | As `getRect()` method |
| `layout` | `LayoutInternal \| undefined` | NOT PORTED | Runtime reference - view layer concern |
| `window` | `Window \| undefined` | NOT PORTED | Runtime reference - view layer concern |
| `root` | `RowNode \| undefined` | PARTIAL | As `getLayout(): O.Option<JsonRowNode>` - returns JSON, not live node |
| `maximizedTabSet` | `TabSetNode \| undefined` | NOT PORTED | Runtime state - Model concern |
| `activeTabSet` | `TabSetNode \| undefined` | NOT PORTED | Runtime state - Model concern |

#### Public Setters (Internal, 6)
| Method | Original | Port Status | Notes |
|--------|----------|-------------|-------|
| `set rect` | `Rect` | NOT PORTED | Immutable model - use `new LayoutWindow({...})` |
| `set layout` | `LayoutInternal` | NOT PORTED | Runtime reference - view layer concern |
| `set window` | `Window \| undefined` | NOT PORTED | Runtime reference - view layer concern |
| `set root` | `RowNode \| undefined` | NOT PORTED | Immutable model |
| `set maximizedTabSet` | `TabSetNode \| undefined` | NOT PORTED | Runtime state - Model concern |
| `set activeTabSet` | `TabSetNode \| undefined` | NOT PORTED | Runtime state - Model concern |

#### Internal Getter/Setter (1)
| Method | Original | Port Status | Notes |
|--------|----------|-------------|-------|
| `toScreenRectFunction` | `(rect: Rect) => Rect` | NOT PORTED | Runtime function - view layer concern |

#### Instance Methods (2)
| Method | Original Signature | Port Status | Notes |
|--------|-------------------|-------------|-------|
| `visitNodes(fn)` | `(fn: (node: Node, level: number) => void) => void` | NOT PORTED | Requires live RowNode tree; in port, JSON is inert |
| `toJson()` | `() => IJsonPopout` | PORTED | Similar output structure, different implementation |

#### Static Methods (1)
| Method | Original Signature | Port Status | Notes |
|--------|-------------------|-------------|-------|
| `fromJson(windowJson, model, windowId)` | `(IJsonPopout, Model, string) => LayoutWindow` | NOT PORTED | Uses Effect Schema `S.decodeUnknown` instead |

### Port-Specific Methods (4)

| Method | Signature | Notes |
|--------|-----------|-------|
| `getWindowId()` | `() => string` | Explicit getter instead of property |
| `getLayout()` | `() => O.Option<JsonRowNode>` | Returns Option instead of undefined |
| `getRect()` | `() => Rect` | Explicit getter instead of property |
| `hasLayout()` | `() => boolean` | Predicate for checking layout presence |
| `toString()` | `() => string` | Debug representation |

---

## 3. Behavioral Differences

### Chrome Minimization Handling
**Original (lines 98-106):**
```typescript
public toJson(): IJsonPopout {
    // chrome sets top,left to large -ve values when minimized, dont save in this case
    if (this._window && this._window.screenTop > -10000) {
        this.rect = new Rect(
            this._window.screenLeft,
            this._window.screenTop,
            this._window.outerWidth,
            this._window.outerHeight
        );
    }
    return { layout: this.root!.toJson(), rect: this.rect.toJson() }
}
```

**Port:**
No equivalent handling. The port's `toJson()` simply returns the stored rect and layout. This Chrome-specific behavior would need to be implemented in the view layer where the Window reference exists.

**Status:** NOT PORTED - Must be handled in view layer

### Rect Snapping on Deserialization
**Original (lines 113-114):**
```typescript
const rect = windowJson.rect ? Rect.fromJson(windowJson.rect) : new Rect(50 + 50 * count, 50 + 50 * count, 600, 400);
rect.snap(10); // snapping prevents issue where window moves 1 pixel per save/restore on Chrome
```

**Port:**
No snapping logic in port. The cascading default (50 + 50 * count) is also not implemented since the port doesn't have access to model's window count.

**Status:** NOT PORTED - Snapping and cascading defaults not implemented

### RowNode Tree Construction
**Original (line 116):**
```typescript
layoutWindow.root = RowNode.fromJson(windowJson.layout, model, layoutWindow);
```

**Port:**
The port stores raw `JsonRowNode` data, not a constructed `RowNode` tree. Tree construction would happen elsewhere (likely in Model).

**Status:** ARCHITECTURAL DIFFERENCE - By design

---

## 4. Dependencies Analysis

### Original Dependencies
| Import | Purpose | Port Equivalent |
|--------|---------|-----------------|
| `Rect` | Geometry | `Rect` from `../rect` |
| `IJsonPopout` | JSON interface | `JsonRowNode` from `./json.model` |
| `Model` | Parent model reference | Not used (stateless) |
| `RowNode` | Root node type | `JsonRowNode` (JSON only) |
| `Node` | Base node type | Not used |
| `TabSetNode` | Active/maximized tracking | Not used |
| `LayoutInternal` | React component ref | Not used |

### Port Dependencies
| Import | Purpose |
|--------|---------|
| `$UiId` from `@beep/identity/packages` | ID generation for Schema |
| `O` from `effect/Option` | Optional value handling |
| `S` from `effect/Schema` | Schema class definition |
| `Rect` from `../rect` | Geometry |
| `JsonRowNode` from `./json.model` | Layout JSON type |

---

## 5. Type System Differences

### Original IJsonPopout Interface
```typescript
export interface IJsonPopout {
    layout: IJsonRowNode;
    rect: IJsonRect;
}
```

### Port JsonPopout Schema (in json.model.ts)
```typescript
export class JsonPopout extends S.Class<JsonPopout>($I`JsonPopout`)(
  {
    layout: JsonRowNode,
    rect: JsonRect,
  },
  ...
) {}
```

The port's `LayoutWindow` is NOT equivalent to `JsonPopout`. It includes a `windowId` and uses `Option` for the layout field. This is a structural difference.

### Port LayoutWindow toJson Output
```typescript
toJson(): { windowId: string; rect: ReturnType<Rect["toJson"]>; layout?: JsonRowNode }
```

This includes `windowId` which the original `IJsonPopout` does not have. This may cause serialization incompatibility.

---

## 6. Critical Missing Features

### High Priority
1. **`visitNodes(fn)`** - Tree traversal functionality not available
2. **Chrome minimization rect update** - Browser-specific handling for serialization
3. **Rect snapping** - Prevents 1px drift on save/restore cycles
4. **Cascading window position defaults** - `50 + 50 * count` logic

### Medium Priority
5. **`maximizedTabSet` tracking** - Must be tracked elsewhere (Model)
6. **`activeTabSet` tracking** - Must be tracked elsewhere (Model)
7. **`fromJson` static factory** - Replaced by Schema decode, but loses model integration

### By Design (View Layer Concerns)
8. **`window` reference** - Browser Window object
9. **`layout` reference** - LayoutInternal React component
10. **`toScreenRectFunction`** - Coordinate transformation

---

## 7. Recommendations

### Immediate Actions
1. **Add rect snapping to default factory or deserialization layer**
   - The `snap(10)` call prevents visual drift bugs on Chrome

2. **Clarify JSON serialization format**
   - Port's `toJson()` includes `windowId` which original `IJsonPopout` lacks
   - May need separate `toIJsonPopout()` for compatibility

3. **Document view layer responsibilities**
   - Chrome minimization handling
   - Window reference management
   - Tree traversal (`visitNodes`)

### Architecture Decisions Needed
1. **Where should `maximizedTabSet` and `activeTabSet` be tracked?**
   - Options: Model class, separate state atom, view context

2. **How should `visitNodes` be implemented?**
   - Options: Method on Model that operates on deserialized tree, utility function

3. **Should LayoutWindow store JSON or live nodes?**
   - Current: JSON (JsonRowNode)
   - Alternative: Live RowNode references (requires circular dependency handling)

---

## 8. Code Quality Assessment

### Strengths of Port
- Clean Effect Schema integration
- Immutable design prevents mutation bugs
- Option type for nullable layout is more explicit
- Good JSDoc documentation
- Type-safe namespace exports

### Areas for Improvement
- Missing serialization compatibility with original format
- No validation of rect bounds
- No handling of browser-specific edge cases
- `toString()` could be more informative about layout structure

---

## 9. Test Coverage Requirements

### Unit Tests Needed
- [ ] Basic construction with windowId and rect
- [ ] Construction with layout
- [ ] `getWindowId()` returns correct value
- [ ] `getLayout()` returns Option.some when layout present
- [ ] `getLayout()` returns Option.none when layout absent
- [ ] `getRect()` returns correct rect
- [ ] `hasLayout()` returns true/false correctly
- [ ] `toJson()` produces correct structure
- [ ] `toJson()` handles missing layout
- [ ] Schema encode/decode roundtrip
- [ ] `toString()` output format

### Integration Tests Needed
- [ ] Serialization compatibility with original FlexLayout format
- [ ] Deserialization of original FlexLayout JSON
- [ ] Rect snapping behavior (if implemented)

---

## 10. Conclusion

**Overall Port Completeness: ~35%**

The port represents a valid but significantly different approach to the `LayoutWindow` concept. It focuses on JSON-serializable data representation rather than runtime state management. Many "missing" features are intentionally omitted because they belong in the view layer or Model class in this architecture.

**Key Architectural Insight:** The original FlexLayout `LayoutWindow` is a mutable runtime object that holds both serializable state AND runtime references. The port splits these concerns, keeping only serializable state in `LayoutWindow` and expecting runtime state to be managed elsewhere.

**Critical Compatibility Issue:** The port's `toJson()` output includes `windowId` while the original `IJsonPopout` does not. This needs to be reconciled for serialization compatibility.
