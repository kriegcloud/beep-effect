# Pattern Matching Violations Report

## Executive Summary

This audit identifies switch statements and non-exhaustive pattern matching in the FlexLayout port that should be refactored to use Effect's `Match.value` for type-safe exhaustive matching.

**Files Analyzed**: All files in `/packages/ui/ui/src/flex-layout/`

**Violations Found**: 3 switch statements, multiple type-guard patterns

---

## Switch Statement Violations

### 1. BorderNode.toDockLocation (CRITICAL)

**File**: `/packages/ui/ui/src/flex-layout/model/border-node.ts`
**Lines**: 122-132

```typescript
static toDockLocation(location: BorderLocation.Type): DockLocation {
  switch (location) {
    case "top":
      return DockLocation.TOP;
    case "bottom":
      return DockLocation.BOTTOM;
    case "left":
      return DockLocation.LEFT;
    case "right":
      return DockLocation.RIGHT;
  }
}
```

**Analysis**:
- **Type**: Discriminated union mapping (`BorderLocation.Type` -> `DockLocation`)
- **Exhaustiveness**: TypeScript considers this exhaustive because `BorderLocation.Type` is `"top" | "bottom" | "left" | "right"` and all variants are covered
- **No default case**: Relies on TypeScript's control flow analysis
- **Risk Level**: Medium - TypeScript catches missing cases at compile time, but no runtime protection if type narrowing fails

**Recommended Match Pattern**:
```typescript
import * as Match from "effect/Match";

static toDockLocation(location: BorderLocation.Type): DockLocation {
  return Match.value(location).pipe(
    Match.when("top", () => DockLocation.TOP),
    Match.when("bottom", () => DockLocation.BOTTOM),
    Match.when("left", () => DockLocation.LEFT),
    Match.when("right", () => DockLocation.RIGHT),
    Match.exhaustive
  );
}
```

---

### 2. Model.doAction (CRITICAL)

**File**: `/packages/ui/ui/src/flex-layout/model/model.ts`
**Lines**: 701-762

```typescript
switch (actionType) {
  case ACTION_TYPES.SELECT_TAB:
    return this._doSelectTab(data.tabNode as string);
  case ACTION_TYPES.SET_ACTIVE_TABSET:
    return this._doSetActiveTabSet(data.tabsetNode as string | undefined);
  case ACTION_TYPES.MAXIMIZE_TOGGLE:
    return this._doMaximizeToggle(data.node as string);
  // ... 9 more cases ...
  case ACTION_TYPES.POPOUT_TAB:
  case ACTION_TYPES.POPOUT_TABSET:
  case ACTION_TYPES.CLOSE_WINDOW:
  case ACTION_TYPES.CREATE_WINDOW:
    console.warn(`Action ${actionType} not yet implemented`);
    return this;
  default:
    console.warn(`Unknown action type: ${actionType}`);
    return this;
}
```

**Analysis**:
- **Type**: Action dispatcher (Redux-style pattern)
- **Exhaustiveness**: NOT EXHAUSTIVE - has `default` case that logs warning
- **Problem**: The `default` case swallows unknown actions silently at runtime
- **Risk Level**: HIGH - Adding new action types won't cause compile errors; bugs discovered at runtime
- **Type Safety Issue**: Multiple `as string` casts indicate weak typing on action data

**Recommended Match Pattern**:
```typescript
import * as Match from "effect/Match";

doAction(action: Action): Model {
  return Match.value(action.type).pipe(
    Match.when(ACTION_TYPES.SELECT_TAB, () =>
      this._doSelectTab(action.data.tabNode as string)),
    Match.when(ACTION_TYPES.SET_ACTIVE_TABSET, () =>
      this._doSetActiveTabSet(action.data.tabsetNode as string | undefined)),
    Match.when(ACTION_TYPES.MAXIMIZE_TOGGLE, () =>
      this._doMaximizeToggle(action.data.node as string)),
    Match.when(ACTION_TYPES.RENAME_TAB, () =>
      this._doRenameTab(action.data.node as string, action.data.text as string)),
    Match.when(ACTION_TYPES.DELETE_TAB, () =>
      this._doDeleteTab(action.data.node as string)),
    Match.when(ACTION_TYPES.UPDATE_NODE_ATTRIBUTES, () =>
      this._doUpdateNodeAttributes(action.data.node as string, action.data.json as Record<string, unknown>)),
    Match.when(ACTION_TYPES.UPDATE_MODEL_ATTRIBUTES, () =>
      this._doUpdateModelAttributes(action.data.json as Record<string, unknown>)),
    Match.when(ACTION_TYPES.ADJUST_WEIGHTS, () =>
      this._doAdjustWeights(action.data.nodeId as string, action.data.weights as readonly number[])),
    Match.when(ACTION_TYPES.ADJUST_BORDER_SPLIT, () =>
      this._doAdjustBorderSplit(action.data.node as string, action.data.pos as number)),
    Match.when(ACTION_TYPES.ADD_NODE, () =>
      this._doAddNode(
        action.data.json as Record<string, unknown>,
        action.data.toNode as string,
        action.data.location as string,
        action.data.index as number,
        action.data.select as boolean | undefined
      )),
    Match.when(ACTION_TYPES.MOVE_NODE, () =>
      this._doMoveNode(
        action.data.fromNode as string,
        action.data.toNode as string,
        action.data.location as string,
        action.data.index as number,
        action.data.select as boolean | undefined
      )),
    Match.when(ACTION_TYPES.DELETE_TABSET, () =>
      this._doDeleteTabSet(action.data.node as string)),
    // TODO: Implement remaining actions
    Match.when(ACTION_TYPES.POPOUT_TAB, () => {
      console.warn(`Action POPOUT_TAB not yet implemented`);
      return this;
    }),
    Match.when(ACTION_TYPES.POPOUT_TABSET, () => {
      console.warn(`Action POPOUT_TABSET not yet implemented`);
      return this;
    }),
    Match.when(ACTION_TYPES.CLOSE_WINDOW, () => {
      console.warn(`Action CLOSE_WINDOW not yet implemented`);
      return this;
    }),
    Match.when(ACTION_TYPES.CREATE_WINDOW, () => {
      console.warn(`Action CREATE_WINDOW not yet implemented`);
      return this;
    }),
    Match.exhaustive
  );
}
```

**Additional Recommendation**: Type the `action.data` properly per action type using a discriminated union:

```typescript
type ActionData =
  | { type: typeof ACTION_TYPES.SELECT_TAB; data: { tabNode: string } }
  | { type: typeof ACTION_TYPES.RENAME_TAB; data: { node: string; text: string } }
  // ... etc
```

---

### 3. Model._calculateBorderInsets (MEDIUM)

**File**: `/packages/ui/ui/src/flex-layout/model/model.ts`
**Lines**: 1522-1535

```typescript
switch (border.getLocation()) {
  case "top":
    top = barSize + size;
    break;
  case "bottom":
    bottom = barSize + size;
    break;
  case "left":
    left = barSize + size;
    break;
  case "right":
    right = barSize + size;
    break;
}
```

**Analysis**:
- **Type**: Discriminated union (`BorderLocation.Type`)
- **Exhaustiveness**: TypeScript-exhaustive (no default case, all variants covered)
- **Pattern**: Accumulator mutation based on variant
- **Risk Level**: Low - all cases covered, TypeScript enforces exhaustiveness

**Recommended Match Pattern**:
```typescript
import * as Match from "effect/Match";

// Inside the for loop:
const inset = Match.value(border.getLocation()).pipe(
  Match.when("top", () => ({ top: barSize + size })),
  Match.when("bottom", () => ({ bottom: barSize + size })),
  Match.when("left", () => ({ left: barSize + size })),
  Match.when("right", () => ({ right: barSize + size })),
  Match.exhaustive
);

// Then merge the inset into the accumulator
```

---

## Type Guard Patterns (Lower Priority)

The following patterns use `.type ===` comparisons and are valid type guards. They are not switch statements but should be documented:

### Type Guards in model/model.ts (lines 51-66)

```typescript
export const isRowNode = (node: LayoutNode): node is JsonRowNode => node.type === "row";
export const isTabSetNode = (node: LayoutNode): node is JsonTabSetNode => node.type === "tabset";
export const isTabNode = (node: LayoutNode): node is JsonTabNode => node.type === "tab";
export const isBorderNode = (node: LayoutNode): node is JsonBorderNode => node.type === "border";
```

**Analysis**: These are proper TypeScript type guards and do not require `Match.value`. They narrow types correctly and are the idiomatic approach for user-defined type guards.

### Type Filtering in view/layout.tsx (multiple locations)

```typescript
if (tabNode.type === "tab") { ... }
if (tabSetNode.type === "tabset") { ... }
```

**Analysis**: These are filtering operations within `visitNodes()` callbacks. They're appropriate as simple conditionals since they're performing type narrowing for a single branch.

### Type Guard in view/row.tsx (lines 90-102)

```typescript
const isRowNode = (child: RowNodeRuntime | TabSetNodeRuntime): child is RowNodeRuntime => {
  return (child as RowNodeRuntime).type === "row";
};

const isTabSetNode = (child: RowNodeRuntime | TabSetNodeRuntime): child is TabSetNodeRuntime => {
  return (child as TabSetNodeRuntime).type === "tabset";
};
```

**Analysis**: Local type guards for union discrimination. The cast `as RowNodeRuntime` before accessing `.type` is a code smell - ideally the union would have a common `.type` property without casting.

### MutationObserver in view/popout-window.tsx (line 143)

```typescript
if (mutation.type === "childList") { ... }
```

**Analysis**: This checks DOM MutationRecord type, which is a browser API type. Not applicable for Effect Match.

---

## Priority Recommendations

| Priority | Location | Issue | Action |
|----------|----------|-------|--------|
| **P0** | `model.ts:701-762` | Non-exhaustive action dispatcher with default fallback | Refactor to `Match.exhaustive` |
| **P1** | `border-node.ts:122-132` | Switch on discriminated union | Refactor to `Match.value` |
| **P2** | `model.ts:1522-1535` | Switch on discriminated union | Refactor to `Match.value` |
| **P3** | `row.tsx:90-102` | Cast before type access | Fix type definitions to avoid cast |

---

## Implementation Notes

1. **Import Convention**: Per project rules, use namespace import:
   ```typescript
   import * as Match from "effect/Match";
   ```

2. **Exhaustiveness**: Always use `Match.exhaustive` as the final pipe element to get compile-time exhaustiveness checking.

3. **Action Type Safety**: The action dispatcher should be refactored alongside improving the `Action` type to be a proper discriminated union rather than `{ type: string; data: Record<string, unknown> }`.

4. **Effect Pattern Compliance**: Using `Match.value` aligns with the project's Effect-first approach and provides better runtime safety than TypeScript's control flow analysis alone.
