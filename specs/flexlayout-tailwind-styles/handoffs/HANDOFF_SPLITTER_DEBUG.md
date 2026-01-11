# Handoff: FlexLayout Splitter Resize Debugging

## Session Date
2026-01-11

## Context
Continuing from FlexLayout Tailwind styles migration. User reported splitters (drag handles between panels) don't resize panels, though drag-and-drop of tabs works fine.

## Completed Work

### 1. Schema Bug Fixed
**File**: `packages/ui/ui/src/flexlayout-react/model/IJsonModel.ts`
**Line 316**: Changed `"tab"` to `"tabset"` in `TabSetAttributes` schema

```typescript
// BEFORE (buggy)
type: F.pipe("tab" as const, (literal) =>

// AFTER (fixed)
type: F.pipe("tabset" as const, (literal) =>
```

This fixed Schema validation errors that appeared in console:
```
ParseError: (@beep/ui/flex-layout/model/IJsonModel/JsonTabSetNode)
└─ ["type"]
   └─ Expected "tab", actual "tabset"
```

### 2. Debug Logging Added
**File**: `packages/ui/ui/src/flexlayout-react/view/Splitter.tsx`

Added console.log statements to trace drag flow:
- `onPointerDown` - logs index, horizontal, clientX/Y, initialSizes, pBounds
- `onDragMove` - logs x, y, calculated position
- `onDragEnd` - logs outlineDiv offsetLeft/offsetTop
- `updateLayout` - logs calculated value, orientation, init, weights

### 3. Drag Flow Verified Working
Console logs confirm entire flow executes correctly:
```
[Splitter] onPointerDown {index: 1, horizontal: true, clientX: 270, clientY: 499.5}
[Splitter] initialSizes {initialSizes: Array(4), sum: 1061, startPosition: 265}
[Splitter] pBounds [165, 706]
[Splitter] onDragMove {x: 370, y: 499.5}
[Splitter] onDragMove HORZ: setting left to 365
[Splitter] onDragEnd
[Splitter] onDragEnd: outlineDiv.current exists, offsetLeft: 365 offsetTop: 0
[Splitter] updateLayout called, realtime: false
[Splitter] updateLayout: value = 365 orientation: horz
[Splitter] updateLayout: RowNode, init = {initialSizes: Array(4), sum: 1061, startPosition: 265}
[Splitter] updateLayout: calculated weights = [31.10..., 12.25..., 20.34...]
```

## Remaining Issue

**Problem**: Despite `layout.doAction(Actions.adjustWeights(node.getId(), weights))` being called with valid weights, the visual layout doesn't update. Splitter position remains unchanged.

**Hypothesis**: The issue is in how the Model processes the `ADJUST_WEIGHTS` action, or React isn't triggering a re-render after model state changes.

## Critical: Cross-Reference Original Source Code

**IMPORTANT**: The original FlexLayout source at `tmp/FlexLayout/` is the authoritative reference.

**Why this matters**:
- The original FlexLayout logic is **sound and working** - splitter resize works in upstream
- Our port introduced bugs during Effect/TypeScript migration
- Despite having unsafe/poorly typed code, the original works correctly
- Bugs are likely **port-specific**, not fundamental logic issues

**Debugging approach**:
1. For any failing functionality, first verify it works in original FlexLayout demo
2. Compare our ported code side-by-side with `tmp/FlexLayout/src/` equivalents
3. Pay attention to: action reducers, state mutation patterns, callback registration
4. Look for differences in how state changes propagate to React

## Investigation Needed

1. **Cross-reference `Model.ts`**: Compare our ADJUST_WEIGHTS handler with `tmp/FlexLayout/src/model/Model.ts`
2. **Identify port-specific changes**: Look for differences in state mutation, listener invocation
3. **Check Model.ts action reducer** for `Actions.ADJUST_WEIGHTS` handling
4. **Verify Model triggers re-render** - check if `onModelChange` callback fires
5. **Check RowNode weight application** - ensure `setWeight()` propagates correctly
6. **Review Layout.tsx** - verify `doAction` implementation and state update flow

## Key Files

### Our Port (Modified)
| File | Purpose |
|------|---------|
| `packages/ui/ui/src/flexlayout-react/model/IJsonModel.ts` | Schema definitions (MODIFIED - fixed TabSetAttributes) |
| `packages/ui/ui/src/flexlayout-react/view/Splitter.tsx` | Splitter drag logic (MODIFIED - debug logging) |
| `packages/ui/ui/src/flexlayout-react/view/Layout.tsx` | Main layout component, `doAction` implementation |
| `packages/ui/ui/src/flexlayout-react/model/Model.ts` | Model state, action reducer |
| `packages/ui/ui/src/flexlayout-react/model/RowNode.ts` | Row node with `calculateSplit`, `getSplitterBounds` |
| `packages/ui/ui/src/flexlayout-react/model/Actions.ts` | Action creators including `adjustWeights` |

### Original Source (Reference)
| File | Purpose |
|------|---------|
| `tmp/FlexLayout/src/model/Model.ts` | **Compare action reducer implementation** |
| `tmp/FlexLayout/src/view/Layout.tsx` | **Compare doAction and re-render logic** |
| `tmp/FlexLayout/src/model/RowNode.ts` | Compare weight calculation |
| `tmp/FlexLayout/src/view/Splitter.tsx` | Compare splitter drag handling |

## Testing Approach

Playwright browser automation with JavaScript `dispatchEvent`:
```javascript
// Native mouse API doesn't trigger React synthetic events
// Use dispatchEvent with PointerEvent instead
splitter.dispatchEvent(new PointerEvent('pointerdown', {...}));
document.dispatchEvent(new PointerEvent('pointermove', {...}));
document.dispatchEvent(new PointerEvent('pointerup', {...}));
```

## Dev Server
- Port: 3000
- App: `@beep/todox`
- Route: `/demo`

## Next Steps

1. Read `Model.ts` to find `ADJUST_WEIGHTS` action handler
2. Add logging to action handler to verify it's being called
3. Check if weights are actually being set on child nodes
4. Verify React re-render is triggered after model mutation
5. If model mutation works, check if Layout component re-renders with new weights

## Commands
```bash
# Start dev server
bun run --filter=@beep/todox dev

# Type check
bun run check --filter=@beep/ui
```
