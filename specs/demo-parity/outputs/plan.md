# Demo Parity Implementation Plan

## Executive Summary

This plan converts the feature gaps identified in the master research report into an actionable checklist for achieving 100% feature parity with the legacy FlexLayout demo. The Effect port is at ~75% functional parity with complete coverage for single-window layouts and core tab management.

**Key Metrics:**
- **P0 (Critical Path):** COMPLETE - No blocking issues
- **P1 (Core Demo):** 5 features, ~28 hours estimated
- **P2 (Enhanced UX):** 6 features, ~15 hours estimated
- **P3 (Deferred):** 9 features, ~76+ hours (intentionally deferred)

---

## Pre-Implementation Checklist

- [ ] Verify legacy demo runs at http://localhost:5173/ (`cd tmp/FlexLayout && npm run dev`)
- [ ] Backup current demo page: `cp apps/todox/src/app/demo/page.tsx apps/todox/src/app/demo/page.tsx.bak`
- [ ] Run baseline verification: `bun run check --filter @beep/ui`
- [ ] Ensure flex-layout builds: `bun run build --filter @beep/ui`
- [ ] Compare current demo side-by-side with legacy demo

---

## P0: Critical Path (COMPLETE)

All critical path features have been implemented. The following are confirmed working:

| Feature | Status | Verification |
|---------|--------|--------------|
| Model creation (fromJson/fromJsonSync) | COMPLETE | Demo page initializes model |
| Tab selection (SELECT_TAB) | COMPLETE | Demo page handles tab clicks |
| Tab addition (ADD_NODE) | COMPLETE | Demo page external drag adds tabs |
| Tab movement (MOVE_NODE) | COMPLETE | Demo page tab drag between tabsets |
| Tab deletion (DELETE_TAB) | COMPLETE | Demo page delete button |
| Tree traversal (walkNodes) | COMPLETE | extractTabSets() in demo |
| Drag-drop detection (P1-P3 zones) | COMPLETE | findDropTargetNode() with dropInfo |
| External drag integration | COMPLETE | File drag from OS works |
| React component rendering | COMPLETE | Layout component renders |

---

## P1: Core Demo Features

### 1.1 Splitter Constraint Algorithms

- **Files**:
  - `packages/ui/ui/src/flex-layout/view/row.tsx`
  - `packages/ui/ui/src/flex-layout/model/row-node.ts`
  - `packages/ui/ui/src/flex-layout/view/splitter.tsx`
- **Dependencies**: None
- **Complexity**: High (12h estimated)
- **Acceptance**:
  - Splitter resize respects min/max width/height constraints
  - Weight distribution algorithm produces correct results
  - Panels cannot be resized smaller than minWidth/minHeight
  - Visual feedback shows when constraint is hit
- **Sub-tasks**:
  - [ ] Port `calcMinMaxSize()` algorithm from legacy `RowNode.ts`
  - [ ] Port `setLayoutMetrics()` constraint enforcement from legacy
  - [ ] Implement `adjustChildren()` with weight redistribution
  - [ ] Add constraint feedback in `Splitter.tsx` (cursor change when at limit)
  - [ ] Test with various min/max configurations
  - [ ] Verify realtime resize works with constraints

### 1.2 Theme CSS Variable Integration

- **Files**:
  - `packages/ui/ui/src/flex-layout/` (new styles directory or existing CSS)
  - `packages/ui/ui/src/flex-layout/view/layout.tsx`
  - `apps/todox/src/app/demo/page.tsx`
- **Dependencies**: None
- **Complexity**: Low (4h estimated)
- **Acceptance**:
  - All 6 themes render correctly (light, dark, underline, gray, rounded, custom)
  - Theme switching in demo works without page reload
  - CSS variables map to existing project theme system
  - No style conflicts with existing Tailwind/MUI styles
- **Sub-tasks**:
  - [ ] Create CSS variable mapping file for FlexLayout themes
  - [ ] Port theme CSS from `tmp/FlexLayout/style/*.css` to Effect-friendly format
  - [ ] Add theme selector to demo page
  - [ ] Implement `classNameMapper` prop for CSS modules compatibility
  - [ ] Test all 6 themes side-by-side with legacy

### 1.3 Component Factory for Demo

- **Files**:
  - `apps/todox/src/app/demo/` (new component files)
  - `apps/todox/src/app/demo/page.tsx`
- **Dependencies**: 1.2 (Theme CSS for proper styling)
- **Complexity**: Medium (6h estimated)
- **Acceptance**:
  - At least 5 component types render in tabs
  - Factory function maps component strings to React components
  - Components are visually comparable to legacy demo
- **Sub-tasks**:
  - [ ] Create `GridComponent` (HTML table, no external deps)
  - [ ] Create `TextComponent` (simple text display)
  - [ ] Create `JsonViewComponent` (syntax highlighting)
  - [ ] Create `SimpleFormComponent` (React-only form)
  - [ ] Create `SubLayoutComponent` (recursive Layout)
  - [ ] Wire factory function to demo page
  - [ ] Document component API for future extensions

### 1.4 Tab Path Tracking

- **Files**:
  - `packages/ui/ui/src/flex-layout/view/tab.tsx`
  - `packages/ui/ui/src/flex-layout/view/tab-button.tsx`
  - `packages/ui/ui/src/flex-layout/view/tab-set.tsx`
  - `packages/ui/ui/src/flex-layout/model/tab-node.ts`
- **Dependencies**: None
- **Complexity**: Low (2h estimated)
- **Acceptance**:
  - Each tab has a unique path attribute (e.g., `/0/1/0`)
  - Path updates correctly after moves
  - `data-layout-path` attribute present on rendered elements
  - DevTools inspection shows correct paths
- **Sub-tasks**:
  - [ ] Verify `setPaths()` is called during render
  - [ ] Add `data-layout-path` attribute to Tab and TabButton
  - [ ] Ensure path updates after MOVE_NODE
  - [ ] Add path display to demo info panel

### 1.5 Use the Layout Component

- **Files**:
  - `apps/todox/src/app/demo/page.tsx`
- **Dependencies**: 1.1, 1.2, 1.3 (All P1 features)
- **Complexity**: Medium (4h estimated)
- **Acceptance**:
  - Demo page uses actual `<Layout>` component instead of custom implementation
  - All drag-drop works through Layout's native handlers
  - Model changes trigger proper re-renders
  - Splitter resize works
- **Sub-tasks**:
  - [ ] Replace custom TabSetDropZone with Layout component
  - [ ] Implement factory function for Layout
  - [ ] Wire onModelChange callback
  - [ ] Wire onAction callback for logging
  - [ ] Test all existing demo features still work
  - [ ] Add onContextMenu handler (P2 prep)

---

## P2: Enhanced UX

### 2.1 Tab Close Buttons

- **Files**:
  - `packages/ui/ui/src/flex-layout/view/tab-button.tsx`
  - `apps/todox/src/app/demo/page.tsx`
- **Dependencies**: 1.5 (Use Layout Component)
- **Complexity**: Low (2h estimated)
- **Acceptance**:
  - Close button (X) visible on tabs when `tabEnableClose: true`
  - Clicking close button triggers DELETE_TAB action
  - Hover state on close button
  - Tab content shifts to accommodate close button
- **Sub-tasks**:
  - [ ] Verify close button renders in TabButton
  - [ ] Wire click handler to onAction
  - [ ] Test with enableClose: false (should hide button)
  - [ ] Style close button hover state

### 2.2 Tab Rename (Double-Click)

- **Files**:
  - `packages/ui/ui/src/flex-layout/view/tab-button.tsx`
  - `packages/ui/ui/src/flex-layout/model/actions.model.ts`
- **Dependencies**: 1.5 (Use Layout Component)
- **Complexity**: Medium (3h estimated)
- **Acceptance**:
  - Double-clicking tab name enters edit mode
  - Inline text input for renaming
  - Enter/blur commits rename via RENAME_TAB action
  - Escape cancels rename
- **Sub-tasks**:
  - [ ] Add double-click handler to tab button
  - [ ] Implement inline editing state in Layout
  - [ ] Wire to RENAME_TAB action
  - [ ] Handle Enter, Escape, and blur events
  - [ ] Test rapid double-clicks don't cause issues

### 2.3 Maximize/Restore Toggle

- **Files**:
  - `packages/ui/ui/src/flex-layout/view/tab-set.tsx`
  - `apps/todox/src/app/demo/page.tsx`
- **Dependencies**: 1.5 (Use Layout Component)
- **Complexity**: Low (2h estimated)
- **Acceptance**:
  - Maximize button visible on tabsets when `tabSetEnableMaximize: true`
  - Clicking maximize expands tabset to fill layout
  - Maximize icon changes to restore icon when maximized
  - Clicking restore returns to normal layout
- **Sub-tasks**:
  - [ ] Verify maximize button renders in TabSet
  - [ ] Wire click handler to MAXIMIZE_TOGGLE action
  - [ ] Test maximize/restore cycle
  - [ ] Verify edge dock is hidden during maximize

### 2.4 Context Menus

- **Files**:
  - `packages/ui/ui/src/flex-layout/view/popup-menu.tsx`
  - `apps/todox/src/app/demo/page.tsx`
- **Dependencies**: 1.5 (Use Layout Component)
- **Complexity**: Medium (4h estimated)
- **Acceptance**:
  - Right-click on tab shows context menu
  - Menu includes: Close, Rename, Float, Maximize
  - Menu items dispatch appropriate actions
  - Menu closes on item selection or click outside
- **Sub-tasks**:
  - [ ] Implement onContextMenu callback in demo
  - [ ] Create context menu component (or use existing PopupMenu)
  - [ ] Wire menu items to actions
  - [ ] Test menu positioning near edges
  - [ ] Add keyboard navigation (optional)

### 2.5 Tab Overflow Menu/Scroll

- **Files**:
  - `packages/ui/ui/src/flex-layout/view/tab-set.tsx`
  - `packages/ui/ui/src/flex-layout/view/tab-overflow-hook.tsx`
- **Dependencies**: 1.5 (Use Layout Component)
- **Complexity**: High (4h estimated)
- **Acceptance**:
  - When too many tabs to display, overflow icon appears
  - Clicking overflow shows menu with hidden tabs
  - Selecting from menu activates that tab
  - Tab strip scrolls if configured
- **Sub-tasks**:
  - [ ] Verify useTabOverflow hook calculates hidden tabs
  - [ ] Implement onShowOverflowMenu callback
  - [ ] Style overflow menu
  - [ ] Test with 10+ tabs in single tabset
  - [ ] Test resize behavior with overflow

### 2.6 Change Listener Integration

- **Files**:
  - `packages/ui/ui/src/flex-layout/model/model.ts`
  - `packages/ui/ui/src/flex-layout/view/layout.tsx`
- **Dependencies**: None
- **Complexity**: Low (3h estimated)
- **Acceptance**:
  - `model.addChangeListener()` properly calls listeners on changes
  - Multiple listeners can be registered
  - Listeners receive the action that caused the change
  - `removeChangeListener()` works correctly
- **Sub-tasks**:
  - [ ] Review current stub implementation in Model
  - [ ] Ensure change listeners fire after doAction
  - [ ] Add listener cleanup in Layout componentWillUnmount
  - [ ] Test multiple listeners don't interfere

---

## P3: Deferred Features

These features are intentionally deferred. They are not required for demo parity with single-window use cases.

| Feature | Effort | Rationale for Deferral |
|---------|--------|------------------------|
| LayoutWindow infrastructure | 20h | Multi-window support not needed for initial demo |
| POPOUT_TAB action | 8h | Requires LayoutWindow |
| POPOUT_TABSET action | 8h | Requires LayoutWindow |
| CLOSE_WINDOW action | 4h | Requires LayoutWindow |
| CREATE_WINDOW action | 6h | Requires LayoutWindow |
| Popout window rendering | 12h | Requires complete LayoutWindow |
| Effect Stream integration | 8h | Nice-to-have, not demo parity |
| Advanced splitter config | 4h | Basic constraints sufficient |
| Serialization round-trip tests | 6h | Can be added post-demo |

**Total Deferred:** 76+ hours

---

## Verification Strategy

### After P1 Completion

- [ ] **Manual Test: Basic Operations**
  1. Load demo page at `/demo`
  2. Drag item from sidebar to create new tab
  3. Drag tab between tabsets
  4. Resize splitter between tabsets
  5. Verify splitter respects min/max constraints

- [ ] **Manual Test: Themes**
  1. Switch through all 6 themes
  2. Verify colors apply correctly
  3. Check no style conflicts with page

- [ ] **Manual Test: Component Factory**
  1. Verify grid, text, json, form components render
  2. Test nested sub-layout component
  3. Confirm component content is interactive

- [ ] **Commands:**
  ```bash
  bun run check --filter @beep/ui
  bun run build --filter @beep/ui
  bun run lint:fix
  ```

### After P2 Completion

- [ ] **Manual Test: Tab Operations**
  1. Click close button on tab - should delete
  2. Double-click tab name - should enter edit mode
  3. Rename tab and press Enter - should update
  4. Press Escape during rename - should cancel

- [ ] **Manual Test: Maximize**
  1. Click maximize button on tabset
  2. Verify tabset fills layout
  3. Click restore button
  4. Verify original layout restored

- [ ] **Manual Test: Menus**
  1. Right-click tab - context menu appears
  2. Select "Close" - tab closes
  3. Add many tabs - overflow menu appears
  4. Select from overflow - correct tab activates

- [ ] **Commands:**
  ```bash
  bun run check --filter @beep/ui
  bun run test --filter @beep/ui
  ```

### Final Verification

- [ ] **Side-by-Side Comparison**
  1. Open legacy demo at http://localhost:5173/
  2. Open Effect demo at /demo
  3. Compare all interactions feature-by-feature
  4. Document any visual differences

- [ ] **Full Build Verification:**
  ```bash
  bun run build
  bun run check
  bun run test
  ```

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Splitter constraint bugs cause layout breakage | High | High | Port algorithm exactly from legacy, extensive manual testing |
| Theme CSS conflicts with existing Tailwind/MUI | Medium | Medium | Namespace all FlexLayout classes, use CSS modules |
| Layout component integration breaks existing demo | Medium | High | Keep backup of current demo, incremental integration |
| Performance regression from immutable model | Low | High | Benchmark against legacy if performance issues reported |
| TypeScript strict mode reveals hidden bugs | Medium | Medium | Fix incrementally, add type guards as needed |

---

## Implementation Order

The following order balances dependencies, risk, and value:

1. **1.4 Tab Path Tracking** (Low risk, foundational)
2. **1.1 Splitter Constraint Algorithms** (High risk, tackle early)
3. **1.2 Theme CSS Variable Integration** (Enables visual testing)
4. **1.3 Component Factory for Demo** (Enables content testing)
5. **1.5 Use the Layout Component** (Integration milestone)
6. **2.1 Tab Close Buttons** (Quick win)
7. **2.3 Maximize/Restore Toggle** (Quick win)
8. **2.2 Tab Rename** (Medium complexity)
9. **2.6 Change Listener Integration** (Low risk)
10. **2.4 Context Menus** (Nice to have)
11. **2.5 Tab Overflow Menu** (Nice to have, high complexity)

---

## Technical Debt to Address During Implementation

These issues should be fixed opportunistically during feature work:

| Issue | Location | Fix During |
|-------|----------|------------|
| Native Map instantiations (10 occurrences) | Model, various nodes | 1.1 Splitter work |
| Non-exhaustive action dispatcher | actions.model.ts | 1.5 Layout integration |
| Array method violations (40+ occurrences) | Throughout flex-layout | All tasks (incremental) |
| Double-cast type bridges (90 occurrences) | Throughout flex-layout | Post-P1 (dedicated cleanup) |

---

## Notes for Implementers

1. **Effect Patterns**: All new code must use namespace imports (`import * as A from "effect/Array"`) and avoid native array/string methods.

2. **CSS Strategy**: Start with raw CSS files matching legacy structure, evaluate Tailwind migration after demo parity achieved.

3. **Testing**: Add unit tests for Model action handlers. Integration tests can wait until P2.

4. **Demo Data**: Use same JSON structure as legacy demo for true parity comparison.

5. **Context Preservation**: This is a multi-session task. Use `HANDOFF_P[N].md` files when context approaches 50%.

---

*Created: 2026-01-10*
*Based on: master-research-report.md, README.md (success criteria)*
