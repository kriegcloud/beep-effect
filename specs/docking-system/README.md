# Docking System Implementation Spec

> Port of FlexLayout drag-and-drop docking capabilities to Effect Schema-based architecture

## Quick Reference

| Item                  | Location                                               |
|-----------------------|--------------------------------------------------------|
| **Effect Port**       | `packages/ui/ui/src/flex-layout/`                      |
| **Legacy Reference**  | `tmp/FlexLayout/`                                      |
| **Demo Page**         | `apps/todox/src/app/demo/page.tsx`                     |
| **Entry Point**       | [`ORCHESTRATION_PROMPT.md`](./ORCHESTRATION_PROMPT.md) |
| **Reflection Log**    | [`REFLECTION_LOG.md`](./REFLECTION_LOG.md)             |
| **Technical Context** | [`CONTEXT.md`](./CONTEXT.md)                           |
| **Agent Prompts**     | [`AGENT_PROMPTS.md`](./AGENT_PROMPTS.md)               |
| **Current Handoff**   | [`handoffs/HANDOFF_P0.md`](./handoffs/HANDOFF_P0.md)   |
| **Progress Tracker**  | [`outputs/progress.md`](./outputs/progress.md)         |

## Objective

Complete the drag-and-drop docking system for `@beep/ui`'s flex-layout module. The legacy `flexlayout-react` library provides full docking capabilities (edge docking, tab reordering, split creation). The Effect Schema port has the foundational models but lacks runtime drop-target detection and visual feedback.

## Current State (P0 Complete, P1 Ready)

### Already Implemented

| Component             | File                     | Status                                           |
|-----------------------|--------------------------|--------------------------------------------------|
| `DockLocation`        | `dock-location.ts`       | `getLocation`, `getDockRect`, `split`, `reflect` |
| `DropInfo`            | `drop-info.ts`           | Schema class with node, rect, location, index    |
| `DropTarget` protocol | `model/drop-target.ts`   | `IDropTarget` interface + Schema class           |
| `Draggable` protocol  | `model/draggable.ts`     | `IDraggable` interface + Schema class            |
| `Actions`             | `model/actions.model.ts` | `ADD_NODE`, `MOVE_NODE` action creators          |
| `Model.doAction`      | `model/model.ts`         | Action dispatch with immutable state updates     |
| Node schemas          | `model/*.ts`             | `TabNode`, `TabSetNode`, `RowNode`, `BorderNode` |

### Not Yet Implemented

| Component                    | Required For             | Priority |
|------------------------------|--------------------------|----------|
| `TabSetNode.canDrop()`       | Center + edge docking    | P0       |
| `RowNode.canDrop()`          | Layout edge docking      | P0       |
| `BorderNode.canDrop()`       | Border panel docking     | P1       |
| `Model.findDropTargetNode()` | Recursive drop detection | P0       |
| Visual drag overlay          | UX feedback              | P0       |
| Outline indicator div        | Drop zone visualization  | P0       |

## Architecture Overview

### Drop Target Detection Flow

```
Layout.onDragOver(event)  <-- Entry point from React
       │
       ▼
Model.findDropTargetNode(x, y, dragNode)  <-- Top-level API
       │
       ├─► BorderSet.canDrop() ─► BorderNode.canDrop()
       │
       └─► Root RowNode.findDropTargetNode()
              │
              ├─► Children (recursive)
              │      │
              │      ├─► TabSetNode.canDrop()
              │      │      │
              │      │      └─► DockLocation.getLocation(rect, x, y)
              │      │             │
              │      │             ├─► CENTER: Add tab to tabset
              │      │             └─► TOP/BOTTOM/LEFT/RIGHT: Split tabset
              │      │
              │      └─► RowNode.canDrop()
              │             └─► Edge docking at layout boundaries
              │
              └─► Returns: DropInfo | undefined
```

### Key Algorithm: DockLocation.getLocation

```typescript
// Normalize mouse position to 0-1 range within rect
x = (x - rect.x) / rect.width;
y = (y - rect.y) / rect.height;

// CENTER zone: inner 50% square
if (x >= 0.25 && x < 0.75 && y >= 0.25 && y < 0.75) {
  return DockLocation.CENTER;
}

// Edge detection via diagonal split
const bl = y >= x;      // bottom-left half
const br = y >= 1 - x;  // bottom-right half

if (bl) return br ? BOTTOM : LEFT;
return br ? RIGHT : TOP;
```

## Files to Modify

### Priority 0 (Core Functionality)

> P0 files form the implementation chain: TabSetNode.canDrop -> RowNode methods -> Model delegation

1. **`model/tab-set-node.ts`** - Implement `canDrop()` method (leaf container)
2. **`model/row-node.ts`** - Implement `canDrop()` and `findDropTargetNode()` (recursive traversal)
3. **`model/model.ts`** - Add `findDropTargetNode()` delegation (top-level entry point)
4. **`view/layout.tsx`** - Wire drag event handlers (connects model to React)

### Priority 1 (Visual Feedback)

> P1 files depend on P0 completion - they consume DropInfo to render UI

5. **`apps/todox/src/app/demo/page.tsx`** - Drag overlay + outline indicator
6. **`view/drop-indicator.tsx`** (new) - React component for drop zone visualization

## Success Criteria

> **Note**: Update checkboxes as phases complete.

- [ ] Tabs can be dragged between tabsets
- [ ] Tabs can be docked to edges (creating splits)
- [ ] Visual outline shows valid drop zones during drag
- [ ] External items can be dragged into layout
- [ ] All operations dispatch proper actions through `Model.doAction()`

## Output Structure

| Directory   | Purpose                              |
|-------------|--------------------------------------|
| `outputs/`  | Phase outputs and progress tracking  |
| `handoffs/` | Inter-phase transition documents     |
| `reports/`  | Review and audit reports             |

## Context Preservation Strategy

This spec uses compressed handoffs to preserve orchestrator context:

1. **Sub-agent delegation**: File reading, code writing, testing delegated via prompts in AGENT_PROMPTS.md
2. **Compressed summaries**: Sub-agent results summarized in `outputs/` before continuing
3. **Phase handoffs**: `handoffs/HANDOFF_P[N].md` captures state between sessions
4. **No direct code writing**: Orchestrator coordinates, never implements

## Entry Point

Start with [`ORCHESTRATION_PROMPT.md`](./ORCHESTRATION_PROMPT.md) to begin execution.
