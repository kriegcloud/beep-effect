# Docking System Handoff - P0 (Initial State)

> This document captures the state at spec creation. Use this to understand starting conditions.

## Session Summary: Discovery & Analysis

| Metric | Value |
|--------|-------|
| Date | 2026-01-10 |
| Phase | P0 (Scaffolding) |
| Status | Ready for P1 execution |

## Discovery Results

### Legacy FlexLayout Analysis

The legacy `flexlayout-react` library (in `tmp/FlexLayout/`) was analyzed via:
1. Playwright browser automation of demo at `http://localhost:5173/`
2. Source code reading of key files

**Key findings:**

1. **DragState class** tracks global drag state:
   - `dragSource`: Internal, External, or Add
   - `dragNode`: The node being dragged
   - `dragJson`: JSON config for new tabs
   - `fnNewNodeDropped`: Callback after drop

2. **Drop detection chain**:
   ```
   Model.findDropTargetNode(x, y, dragNode)
     → BorderSet.canDrop() (if borders enabled)
     → Root RowNode.findDropTargetNode()
       → Recursive child iteration
         → TabSetNode.canDrop() or RowNode.canDrop()
   ```

3. **DockLocation.getLocation algorithm**:
   - Normalizes mouse position to 0-1 within rect
   - CENTER zone: inner 50% square (0.25-0.75)
   - Edge zones via diagonal split

4. **Visual feedback**:
   - `outlineDiv`: Absolutely positioned overlay
   - CSS transitions for smooth animation
   - Semi-transparent dashed border style

### Effect Port State

Already implemented in `packages/ui/ui/src/flex-layout/`:

| Component | File | Status |
|-----------|------|--------|
| `DockLocation` | `dock-location.ts` | COMPLETE - all methods |
| `DropInfo` | `drop-info.ts` | COMPLETE - schema class |
| `DropTargetNode` | `drop-info.ts` | COMPLETE - protocol class |
| `IDropTarget` | `model/drop-target.ts` | COMPLETE - interface |
| `IDraggable` | `model/draggable.ts` | COMPLETE - interface |
| `Actions` | `model/actions.model.ts` | COMPLETE - ADD_NODE, MOVE_NODE |
| `Model.doAction` | `model/model.ts` | COMPLETE - action dispatch |
| Node schemas | `model/*.ts` | COMPLETE - TabNode, TabSetNode, RowNode |

Not yet implemented:

| Component | File | Required For |
|-----------|------|--------------|
| `TabSetNode.canDrop()` | `model/tab-set-node.ts` | Tab docking |
| `RowNode.canDrop()` | `model/row-node.ts` | Edge docking |
| `RowNode.findDropTargetNode()` | `model/row-node.ts` | Recursive search |
| `Model.findDropTargetNode()` | `model/model.ts` | Top-level entry |
| `Rect.contains()` | `rect.ts` | Point-in-rect test |
| Visual overlay | demo page | UX feedback |

## Files Reference

### Effect Port (Modify)
```
packages/ui/ui/src/flex-layout/
├── model/tab-set-node.ts    # Add canDrop
├── model/row-node.ts        # Add canDrop, findDropTargetNode
├── model/model.ts           # Add findDropTargetNode
└── rect.ts                  # Add contains method
```

### Demo (Modify)
```
apps/todox/src/app/demo/page.tsx  # Add drag handlers
```

### Legacy Reference (Read-only)
```
tmp/FlexLayout/
├── src/model/TabSetNode.ts:200-280
├── src/model/RowNode.ts:150-220
├── src/model/Model.ts:400-450
└── src/view/Layout.tsx:500-800
```

> **Note**: Line numbers are approximate and may shift. Search for method names (`canDrop`, `findDropTargetNode`) if exact lines don't match.

## Lessons Learned

### What Worked Well
- Playwright browser automation effectively demonstrated FlexLayout drop behavior
- Source code analysis identified the exact algorithm in `DockLocation.getLocation`
- Incremental discovery (DragState -> drop chain -> visual feedback) provided clear understanding

### What Needed Adjustment
- Initial focus on Layout.tsx was too broad; should start with model classes
- Legacy code line references need verification (may shift between versions)

### Prompt Improvements
- **Original**: "Analyze FlexLayout drop handling"
- **Refined**: "Trace the drop detection chain from Model.findDropTargetNode() through RowNode/TabSetNode.canDrop(), capturing method signatures and algorithm pseudocode"

## Task List for Phase 1 (Core Functionality)

1. [ ] **[P0]** Add `Rect.contains()` method
2. [ ] **[P0]** Implement `TabSetNode.canDrop()`
3. [ ] **[P0]** Implement `RowNode.canDrop()`
4. [ ] **[P0]** Implement `RowNode.findDropTargetNode()`
5. [ ] **[P0]** Implement `Model.findDropTargetNode()`
6. [ ] Verify with `bun run check --filter @beep/ui`

## Task List for Phase 2 (Visual Feedback)

1. [ ] Create `DropIndicator` React component
2. [ ] Add drag event handlers to demo page
3. [ ] Track `DropInfo` state during drag
4. [ ] Render drop indicator overlay
5. [ ] Execute drop via `Model.doAction()`
6. [ ] Add external drag support

## Improved Sub-Agent Prompts

### Prompt: Implement Rect.contains()
```
READ: packages/ui/ui/src/flex-layout/rect.ts
READ: tmp/FlexLayout/src/Rect.ts (for reference)

Add a `contains(x: number, y: number): boolean` method to the Rect class that returns true if the point (x, y) is within the rect bounds (inclusive of left/top edges, exclusive of right/bottom).

Use Effect patterns: pure function, no mutation.
Verify: bun run check --filter @beep/ui
```

### Prompt: Implement TabSetNode.canDrop()
```
READ: packages/ui/ui/src/flex-layout/model/tab-set-node.ts
READ: packages/ui/ui/src/flex-layout/dock-location.ts
READ: tmp/FlexLayout/src/model/TabSetNode.ts:200-280

Implement `canDrop(x: number, y: number, dragNode: IDraggable, rect: Rect): O.Option<DropInfo>` following the legacy algorithm:
1. Check rect.contains(x, y) - return O.none() if false
2. Call DockLocation.getLocation(rect, x, y)
3. Return O.some(DropInfo.make({ node: this, rect: DockLocation.getDockRect(...), location, index: -1 }))

Use Effect patterns: O.Option for nullable return, pipe for composition.
Verify: bun run check --filter @beep/ui
```

## Notes for Next Agent

1. **Start with utility work**: Add `Rect.contains()` first as it's needed by drop detection
2. **Follow the chain**: TabSetNode.canDrop -> RowNode methods -> Model method
3. **Use Effect patterns**: A.findFirst for iteration, O.getOrElse for Options
4. **Check type guards**: Ensure `isTabSetNode`/`isRowNode` exist in `packages/ui/ui/src/flex-layout/model/index.ts` exports. If missing, add them as `Schema.is()` predicates.
5. **Run checks frequently**: `bun run check --filter @beep/ui` after each change

## Orchestration Strategy

- **Code implementation**: Use Task tool with `effect-code-writer` skill (`.claude/skills/effect-code-writer.md`) for all implementation
- **File exploration**: Use Read tool directly or delegate to Task tool for multi-file reads
- **Result compression**: Store sub-agent summaries in `outputs/p1-results.md` before continuing
- **Handoff update**: Update `handoffs/HANDOFF_P1.md` after phase completion with learnings

## Verification Commands

```bash
# Type checking
bun run check --filter @beep/ui

# Run tests (if any exist for flex-layout)
bun run test --filter @beep/ui

# Lint
bun run lint --filter @beep/ui

# Build
bun run build --filter @beep/ui
```

## Success Criteria for Phase 1

- [ ] `Rect.contains()` exists and handles edge cases (point on boundary)
- [ ] `TabSetNode.canDrop()` returns valid DropInfo for all 5 dock locations (CENTER, TOP, BOTTOM, LEFT, RIGHT)
- [ ] `RowNode.canDrop()` detects edge docking at layout boundaries
- [ ] `RowNode.findDropTargetNode()` recursively searches children
- [ ] `Model.findDropTargetNode()` delegates to root row
- [ ] `bun run check --filter @beep/ui` passes with no type errors

## P1 Orchestrator Reference

See [`../ORCHESTRATION_PROMPT.md`](../ORCHESTRATION_PROMPT.md) for the execution prompt. Focus on "Current Phase: P1" section and execute Tasks 1-3 in order.
