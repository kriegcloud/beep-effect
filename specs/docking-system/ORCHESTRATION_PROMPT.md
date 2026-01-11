# Docking System Orchestration Prompt

> You are an orchestration agent. You NEVER write code directly. You manage sub-agents to preserve your context window.

## Critical Orchestration Rules

1. **NEVER write code directly** - Always delegate to sub-agents via Task tool
2. **NEVER read large files directly** - Delegate file reads to Explore agents
3. **Preserve context** - Summarize sub-agent outputs before continuing
4. **Incremental progress** - Complete one task fully before starting next
5. **Update handoffs** - After each phase, update `handoffs/HANDOFF_P[N].md`
6. **Monitor context usage** - If sub-agent output exceeds 500 lines, compress before storing
7. **Proactive compression** - If total accumulated context exceeds 2000 lines, write to handoff and reset

## Sub-Agent Delegation Protocol

When delegating to sub-agents, use the Task tool with these parameters:

```
Task(
  prompt: [sub-agent prompt from task section],
  subagent_type: "effect-code-writer",
  max_iterations: 5,
  context_files: [list of files from READ section]
)
```

If the Task tool is not available, copy the sub-agent prompt verbatim into a new agent session with explicit instruction to read the specified files first.

## Current Phase: P1 (Drop Target Detection)

### Phase Overview

Implement the core drop-target detection chain that enables drag-and-drop operations:

```
TabSetNode.canDrop() → RowNode.canDrop() → Model.findDropTargetNode()
```

### Pre-Existing State

| Component                          | Status | Notes                                    |
|------------------------------------|--------|------------------------------------------|
| `DockLocation.getLocation()`       | DONE   | Returns dock position from coordinates   |
| `DockLocation.getDockRect()`       | DONE   | Returns outline rect for dock position   |
| `DropInfo` class                   | DONE   | Schema class for drop target results     |
| `IDropTarget` interface            | DONE   | Protocol for drop-capable nodes          |
| `TabNode`, `TabSetNode`, `RowNode` | DONE   | Effect Schema models with runtime fields |

### P1 Tasks

Execute in order, delegating each to a sub-agent:

---

#### Task 1: Implement `TabSetNode.canDrop()`

**Sub-agent prompt:**
```
You are implementing the canDrop method for TabSetNode in the beep-effect flex-layout system.

READ these files first:
- packages/ui/ui/src/flex-layout/model/tab-set-node.ts (target file)
- packages/ui/ui/src/flex-layout/dock-location.ts (DockLocation.getLocation)
- packages/ui/ui/src/flex-layout/drop-info.ts (DropInfo class)
- tmp/FlexLayout/src/model/TabSetNode.ts (legacy reference, lines 200-280)

IMPLEMENT canDrop() on TabSetNode class with this signature:
canDrop(dragNode: IDraggable, x: number, y: number): DropInfo | undefined

Implementation steps:
1. Check if drops are enabled (isEnableDrop)
2. Check if dragNode === this (can't drop on self)
3. Use DockLocation.getLocation(this.rect, x, y) to get dock position
4. For CENTER: return DropInfo with location=CENTER, index=selected+1
5. For edges: return DropInfo with location and outline from getDockRect()
6. Return undefined if drop not allowed

Use Effect patterns:
- import * as O from "effect/Option"
- No native array methods
- Immutable patterns only

After implementing, run: bun run check --filter @beep/ui
```

**Expected output:** `TabSetNode.canDrop()` method implemented and type-checked

---

#### Task 2: Implement `RowNode.canDrop()` and `findDropTargetNode()`

**Sub-agent prompt:**
```
You are implementing drop detection on RowNode for the beep-effect flex-layout system.

READ these files first:
- packages/ui/ui/src/flex-layout/model/row-node.ts (target file)
- packages/ui/ui/src/flex-layout/model/tab-set-node.ts (TabSetNode.canDrop for reference)
- tmp/FlexLayout/src/model/RowNode.ts (legacy reference, lines 100-200 for canDrop, lines 240-300 for findDropTargetNode)

IMPLEMENT two methods on RowNode:

1. canDrop(dragNode: IDraggable, x: number, y: number): DropInfo | undefined
   - Only allows edge docking at layout boundaries
   - Use DockLocation.getLocation for position detection
   - Return DropInfo with appropriate outline rect

2. findDropTargetNode(dragNode: IDraggable, x: number, y: number): DropInfo | undefined
   - Recursively check all children for drop targets
   - For TabSetNode children: call child.canDrop()
   - For RowNode children: call child.findDropTargetNode()
   - Return first valid DropInfo found

Use Effect patterns:
- import * as A from "effect/Array"
- Use A.findFirst for child iteration
- Immutable patterns only

After implementing, run: bun run check --filter @beep/ui
```

**Expected output:** `RowNode.canDrop()` and `findDropTargetNode()` implemented

---

#### Task 3: Implement `Model.findDropTargetNode()`

**Sub-agent prompt:**
```
You are implementing the top-level drop detection on Model for the beep-effect flex-layout system.

READ these files first:
- packages/ui/ui/src/flex-layout/model/model.ts (target file)
- packages/ui/ui/src/flex-layout/model/row-node.ts (RowNode.findDropTargetNode)
- tmp/FlexLayout/src/model/Model.ts (legacy reference, lines 420-480 for findDropTargetNode)

IMPLEMENT on Model class:

findDropTargetNode(dragNode: IDraggable, x: number, y: number): DropInfo | undefined
  1. First check BorderSet (if borders enabled) - call borderSet.canDrop()
  2. Then delegate to root RowNode: this.root.findDropTargetNode(dragNode, x, y)
  3. Return first valid DropInfo or undefined

The Model already has:
- this.root: RowNode (the root layout node)
- BorderSet handling may be deferred to P2

Use Effect patterns:
- import * as O from "effect/Option"
- import * as A from "effect/Array"
- No native array methods
- Immutable patterns only

After implementing, run: bun run check --filter @beep/ui
```

**Expected output:** `Model.findDropTargetNode()` implemented

---

### P1 Verification

After all three tasks complete, run verification:

```bash
bun run check --filter @beep/ui
bun run build --filter @beep/ui
bun run test --filter @beep/ui
```

### Phase Transition

When P1 completes:

1. Create `handoffs/HANDOFF_P1.md` following this structure:
   ```markdown
   # Docking System Handoff - P1 Phase

   ## Session Summary: P1 Completed
   | Metric | Before | After | Status |

   ## Lessons Learned
   ### What Worked Well
   ### What Needed Adjustment
   ### Prompt Improvements

   ## P1 Changes
   - Files modified: [list]
   - Methods added: [list]
   - Verification results: [pass/fail]

   ## Remaining Work: P2 Items
   [Reference Task 4, Task 5 from ORCHESTRATION_PROMPT.md]

   ## Notes for Next Agent
   ```

2. Update `outputs/progress.md` with current state

3. Append learnings to `REFLECTION_LOG.md`

4. Begin P2: Visual Feedback (see below)

---

## P2 Tasks (After P1 Complete)

### Task 4: Update Demo Page with Drag Handlers

**Sub-agent prompt:**
```
You are integrating drag-and-drop into the flex-layout demo page.

READ these files first:
- apps/todox/src/app/demo/page.tsx (target file)
- packages/ui/ui/src/flex-layout/view/layout.tsx (Layout component)
- tmp/FlexLayout/demo/App.tsx (legacy demo reference, lines 50-150 for drag handlers)

IMPLEMENT drag handling:
1. Add onDragEnter, onDragOver, onDrop, onDragLeave handlers
2. Track current DropInfo in state
3. Render outline indicator div when DropInfo present
4. On drop: dispatch appropriate action via model.doAction()

Key patterns from legacy:
- DragState class tracks dragNode, dragJson, fnNewNodeDropped
- preventDefault() on drag events to allow dropping
- Outline div uses absolute positioning with transition

Use React 19 patterns:
- "use client" directive
- useState for drag state
- useCallback for handlers

After implementing, run:
bun run check --filter @beep/ui
bun run lint:fix --filter @beep/todox
```

### Task 5: Add Visual Drop Indicator

**Sub-agent prompt:**
```
You are creating a visual drop indicator component for flex-layout.

READ these files first:
- packages/ui/ui/src/flex-layout/drop-info.ts (DropInfo schema)
- tmp/FlexLayout/src/view/Layout.tsx (legacy reference, lines 180-250 for outlineDiv rendering)

CREATE: packages/ui/ui/src/flex-layout/view/drop-indicator.tsx

Requirements:
1. Accept DropInfo as prop
2. Render absolutely positioned div at dropInfo.rect coordinates
3. Apply dropInfo.className for styling
4. Animate transitions when rect changes
5. Export as React component

Style the indicator:
- Semi-transparent background (e.g., rgba(0, 100, 200, 0.3))
- Dashed border
- Smooth position/size transitions

After implementing, run: bun run check --filter @beep/ui
```

---

## Context Compression Protocol

After each sub-agent completes:

1. **Extract key changes**: What files were modified? What methods added?
2. **Verify success**: Did `bun run check` pass?
3. **Compress to handoff**: Write 5-10 line summary to `outputs/task-[N].md`
4. **Continue or escalate**: Proceed to next task or report blockers
5. **Update REFLECTION_LOG.md**: If any prompt refinement or methodology insight emerged, append to the Reflection Log immediately. Do NOT defer this to phase completion.

### Example Compression

```markdown
## Task 1 Result: TabSetNode.canDrop

**Status:** COMPLETE
**Files:** packages/ui/ui/src/flex-layout/model/tab-set-node.ts
**Changes:**
- Added canDrop(dragNode, x, y) method
- Uses DockLocation.getLocation for position detection
- Returns DropInfo for valid drops, undefined otherwise
**Verification:** bun run check --filter @beep/ui passed
```

---

## Recovery Protocol

If a task fails:

1. **Capture error verbatim**: Record exact error message and stack trace
2. **Classify failure type**:
   - **Type Error**: Missing import or incorrect signature - fix and retry
   - **Logic Error**: Algorithm mismatch with legacy - re-read legacy reference
   - **Architecture Error**: Fundamental incompatibility - escalate to human
   - **Context Exhaustion**: Sub-agent ran out of tokens - compress and retry with smaller scope
3. **Determine retry strategy**:
   - For Type/Logic errors: Create focused sub-agent prompt for the specific issue
   - For Architecture errors: STOP and document the issue in `outputs/blockers.md`
   - For Context issues: Split task into smaller sub-tasks
4. **Re-verify**: Run check again after fix
5. **Log to REFLECTION_LOG.md**: Record what caused the failure and fix applied

### Escalation Criteria

STOP execution and escalate to human when:
- Same error occurs 3+ times after fixes
- Error suggests missing functionality in upstream dependencies
- Sub-agent produces code that contradicts Effect patterns

---

## File Reference Quick Index

| Purpose            | Path                                                     |
|--------------------|----------------------------------------------------------|
| Tab container node | `packages/ui/ui/src/flex-layout/model/tab-set-node.ts`   |
| Row/split node     | `packages/ui/ui/src/flex-layout/model/row-node.ts`       |
| Main model         | `packages/ui/ui/src/flex-layout/model/model.ts`          |
| Dock position      | `packages/ui/ui/src/flex-layout/dock-location.ts`        |
| Drop result        | `packages/ui/ui/src/flex-layout/drop-info.ts`            |
| Demo page          | `apps/todox/src/app/demo/page.tsx`                       |
| Legacy TabSetNode  | `tmp/FlexLayout/src/model/TabSetNode.ts`                 |
| Legacy RowNode     | `tmp/FlexLayout/src/model/RowNode.ts`                    |
| Legacy Layout view | `tmp/FlexLayout/src/view/Layout.tsx`                     |

---

## Authorization Gates

**STOP and request user approval before:**

1. Creating new files outside the flex-layout directory
2. Modifying files in apps/todox beyond the demo page
3. Committing changes
4. Proceeding from P1 to P2

**Never auto-proceed without explicit "continue" from user.**

---

## Start Execution

Begin with Task 1. Use the Task tool with `subagent_type: "effect-code-writer"` for code implementation tasks. Compress each result before proceeding.
