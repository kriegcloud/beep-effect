# Docking System Sub-Agent Prompts

> Reusable prompts for delegating specific tasks to sub-agents

## Usage Pattern

```typescript
// Using Task tool with appropriate subagent_type
Task({
  subagent_type: "effect-code-writer",  // For code implementation
  prompt: "<paste prompt from below>",
  description: "Implement canDrop on TabSetNode"
})
```

---

## P1: Drop Target Detection

### Agent 1A: TabSetNode.canDrop Implementation

**subagent_type:** `effect-code-writer`

```
ROLE:
You are an expert Effect TypeScript developer working in the beep-effect monorepo. You follow strict Effect patterns including namespace imports, single-letter aliases, and PascalCase schema constructors.

CONTEXT:
You are implementing drag-and-drop detection for TabSetNode in the beep-effect flex-layout system. TabSetNode is a container that holds multiple TabNodes. When a user drags a tab over a TabSetNode, we need to detect:
1. If they're hovering over the CENTER (add tab to this tabset)
2. If they're hovering over an edge (split the tabset)

FILES TO READ FIRST:
1. packages/ui/ui/src/flex-layout/model/tab-set-node.ts - The target file
2. packages/ui/ui/src/flex-layout/dock-location.ts - DockLocation.getLocation algorithm
3. packages/ui/ui/src/flex-layout/drop-info.ts - DropInfo class definition
4. packages/ui/ui/src/flex-layout/model/drop-target.ts - IDropTarget interface
5. tmp/FlexLayout/src/model/TabSetNode.ts:200-300 - Legacy implementation reference

TASK:
Add the canDrop method to TabSetNode class implementing IDropTarget:

canDrop(dragNode: IDraggable, x: number, y: number): DropInfo | undefined

Implementation requirements:
1. Return undefined if:
   - this.isEnableDrop() returns false
   - dragNode is this node (can't drop on self)

2. Get dock location: const location = DockLocation.getLocation(this.rect, x, y)

3. For CENTER location:
   - Get outline rect: this.rect (the full tabset rect)
   - Calculate index: O.getOrElse(this.selected, () => 0) + 1
   - Return new DropInfo with these values

4. For edge locations (TOP, BOTTOM, LEFT, RIGHT):
   - Get outline rect: location.getDockRect(this.rect)
   - Index: location.indexPlus
   - Return new DropInfo

5. Set className: "flexlayout__tabset_drop_target"

EFFECT PATTERNS (REQUIRED):
- Use namespace imports: import * as O from "effect/Option";
- Use single-letter aliases per project convention (A for Array, O for Option, etc.)
- Use O.getOrElse for Option handling
- NEVER use native JavaScript array/string methods
- Route ALL operations through Effect utilities (A.map, A.filter, etc.)

AFTER IMPLEMENTING:
Run: bun run check --filter @beep/ui

EXPECTED SUCCESS OUTPUT:
- No type errors
- Exit code 0

IF ERRORS OCCUR:
- Report the exact error message
- Include file path and line number
- Refer to the "Fix Type Error Agent" prompt in this file with the exact error message

REFLECTION (after completion):
Document in your response:
1. What approach worked well that should be reused?
2. What obstacles were encountered?
3. Any improvements to this prompt for future use?
```

---

### Agent 1B: RowNode Drop Detection

**subagent_type:** `effect-code-writer`

```
ROLE:
You are an expert Effect TypeScript developer working in the beep-effect monorepo. You follow strict Effect patterns including namespace imports, single-letter aliases, and PascalCase schema constructors.

CONTEXT:
You are implementing drop detection for RowNode in the beep-effect flex-layout system. RowNode can contain TabSetNodes or other RowNodes arranged horizontally or vertically. It needs two methods:
1. canDrop - For edge docking at layout boundaries
2. findDropTargetNode - Recursive search through children

FILES TO READ FIRST:
1. packages/ui/ui/src/flex-layout/model/row-node.ts - Target file
2. packages/ui/ui/src/flex-layout/model/tab-set-node.ts - See canDrop pattern
3. packages/ui/ui/src/flex-layout/model/drop-target.ts - IDropTarget interface
4. tmp/FlexLayout/src/model/RowNode.ts - Legacy reference

TASK:
Add two methods to RowNode class:

1. canDrop(dragNode: IDraggable, x: number, y: number): DropInfo | undefined
   - Only allow edge docking at the OUTER edges of this row
   - Check if point is in edge zone (outer 10% of rect)
   - Use DockLocation.getLocation to determine which edge
   - Return DropInfo with appropriate outline rect
   - Return undefined if not in edge zone

2. findDropTargetNode(dragNode: IDraggable, x: number, y: number): DropInfo | undefined
   - Use A.findFirst to search this.children array:
     A.findFirst(this.children, child => child.rect.contains(x, y))
   - For matching child:
     - If isTabSetNode(child): return child.canDrop(dragNode, x, y)
     - If isRowNode(child): return child.findDropTargetNode(dragNode, x, y)
   - If no child matches: return this.canDrop(dragNode, x, y)
   - Return undefined if nothing found

HELPER NEEDED:
Add a contains method to Rect if not present:
contains(x: number, y: number): boolean {
  return x >= this.x && x < this.x + this.width &&
         y >= this.y && y < this.y + this.height;
}
Note: Simple boolean predicates are acceptable. For array/string operations, use Effect utilities.

EFFECT PATTERNS (REQUIRED):
- Use namespace imports: import * as A from "effect/Array";
- Use A.findFirst to iterate children (NEVER use native array iteration)
- Use type guards: isTabSetNode(child), isRowNode(child)
- NEVER use native JavaScript array/string methods

AFTER IMPLEMENTING:
Run: bun run check --filter @beep/ui

EXPECTED SUCCESS OUTPUT:
- No type errors
- Exit code 0

IF ERRORS OCCUR:
- Report the exact error message
- Include file path and line number
- Refer to the "Fix Type Error Agent" prompt in this file with the exact error message

REFLECTION (after completion):
Document in your response:
1. What approach worked well that should be reused?
2. What obstacles were encountered?
3. Any improvements to this prompt for future use?
```

---

### Agent 1C: Model.findDropTargetNode

**subagent_type:** `effect-code-writer`

```
ROLE:
You are an expert Effect TypeScript developer working in the beep-effect monorepo. You follow strict Effect patterns including namespace imports, single-letter aliases, and PascalCase schema constructors.

CONTEXT:
You are implementing the top-level drop detection on Model. This is the entry point called by the Layout view during drag operations. It delegates to the root RowNode.

FILES TO READ FIRST:
1. packages/ui/ui/src/flex-layout/model/model.ts - Target file
2. packages/ui/ui/src/flex-layout/model/row-node.ts - See findDropTargetNode
3. packages/ui/ui/src/flex-layout/model/index.ts - Check existing exports
4. tmp/FlexLayout/src/model/Model.ts - Search for findDropTargetNode

TASK:
Add findDropTargetNode method to Model class:

findDropTargetNode(dragNode: IDraggable, x: number, y: number): DropInfo | undefined
  1. TODO (P2): Check BorderSet first if borders are enabled
     // if (this.borderSet) { const result = this.borderSet.canDrop(...); if (result) return result; }

  2. Delegate to root RowNode:
     return this.root.findDropTargetNode(dragNode, x, y);

NOTES:
- The Model has a 'root' field of type RowNode
- BorderSet handling can be a TODO comment for P2
- Keep implementation minimal - just delegation

AFTER IMPLEMENTING:
Run: bun run check --filter @beep/ui

EXPECTED SUCCESS OUTPUT:
- No type errors
- Exit code 0

IF ERRORS OCCUR:
- Report the exact error message
- Include file path and line number
- Refer to the "Fix Type Error Agent" prompt in this file with the exact error message

REFLECTION (after completion):
Document in your response:
1. What approach worked well that should be reused?
2. What obstacles were encountered?
3. Any improvements to this prompt for future use?
```

---

## P2: Visual Feedback

### Agent 2A: Drop Indicator Component

**subagent_type:** `effect-code-writer`

```
ROLE:
You are an expert React and TypeScript developer working in the beep-effect monorepo. You create clean, type-safe React components following project conventions.

CONTEXT:
You are creating a React component that shows visual feedback during drag operations. When a user drags a tab over a valid drop target, we show an outline indicator at the target position.

FILES TO READ FIRST:
1. packages/ui/ui/src/flex-layout/drop-info.ts - DropInfo props
2. packages/ui/ui/src/flex-layout/rect.ts - Rect class
3. tmp/FlexLayout/src/view/Layout.tsx - Search for outlineDiv styles

CREATE FILE: packages/ui/ui/src/flex-layout/view/drop-indicator.tsx

REQUIREMENTS:
1. "use client" directive at top (React 19)

2. Props interface:
   interface DropIndicatorProps {
     dropInfo: DropInfo | null;
   }

3. Render:
   - If dropInfo is null, return null
   - Otherwise render a div with:
     - position: absolute
     - left: dropInfo.rect.x
     - top: dropInfo.rect.y
     - width: dropInfo.rect.width
     - height: dropInfo.rect.height
     - className: dropInfo.className
     - pointerEvents: none (don't interfere with drag)

4. Add CSS transition for smooth animation:
   transition: all 150ms ease-out

5. Style suggestions:
   - background: rgba(0, 120, 215, 0.2)
   - border: 2px dashed rgba(0, 120, 215, 0.6)
   - borderRadius: 4px

EXPORT:
export const DropIndicator: React.FC<DropIndicatorProps>

Also add barrel export to: packages/ui/ui/src/flex-layout/view/index.ts

REFLECTION (after completion):
Document in your response:
1. What approach worked well that should be reused?
2. What obstacles were encountered?
3. Any improvements to this prompt for future use?
```

---

### Agent 2B: Demo Page Drag Integration

**subagent_type:** `effect-code-writer`

```
ROLE:
You are an expert React and TypeScript developer working in the beep-effect monorepo. You follow project conventions and create clean, type-safe implementations.

CONTEXT:
You are integrating drag-and-drop handlers into the flex-layout demo page. The demo already renders a Model with TabSets. Now we need to:
1. Handle drag events to detect drop targets
2. Show visual feedback during drag
3. Execute drops when user releases

FILES TO READ FIRST:
1. apps/todox/src/app/demo/page.tsx - Target file
2. packages/ui/ui/src/flex-layout/model/model.ts - Model.findDropTargetNode
3. packages/ui/ui/src/flex-layout/view/drop-indicator.tsx - DropIndicator component
4. tmp/FlexLayout/demo/App.tsx - Legacy demo reference
5. tmp/FlexLayout/src/view/Layout.tsx:500-700 - Drag handlers

TASK:
Enhance the demo page with drag handling:

1. Add state (import { useState } from 'react'):
   const [currentDropInfo, setCurrentDropInfo] = useState<DropInfo | null>(null);
   const [isDragging, setIsDragging] = useState(false);

2. Add drag handlers:
   - onDragStart: Store the dragged node, set isDragging true
   - onDragOver: Call model.findDropTargetNode(dragNode, e.clientX, e.clientY)
                 Update currentDropInfo state
                 e.preventDefault() to allow drop
   - onDragLeave: Clear currentDropInfo when leaving layout area
   - onDrop: If currentDropInfo exists, dispatch action via model.doAction()
             Use Actions.MOVE_NODE for internal drags
             Clear state

3. Render DropIndicator:
   <DropIndicator dropInfo={currentDropInfo} />

4. Make tabs draggable:
   For each tab render: draggable={true} onDragStart={...}

NOTES:
- The layout container needs onDragOver, onDrop, onDragLeave
- Use e.clientX/clientY for mouse position
- May need to offset by container's bounding rect

AFTER IMPLEMENTING:
Run: bun run check --filter @beep/todox

EXPECTED SUCCESS OUTPUT:
- No type errors
- Exit code 0

IF ERRORS OCCUR:
- Report the exact error message
- Include file path and line number
- Refer to the "Fix Type Error Agent" prompt in this file with the exact error message

Run: bun run dev (test manually)

REFLECTION (after completion):
Document in your response:
1. What approach worked well that should be reused?
2. What obstacles were encountered?
3. Any improvements to this prompt for future use?
```

---

### Agent 2C: External Drag Support

**subagent_type:** `effect-code-writer`

```
ROLE:
You are an expert Effect TypeScript developer working in the beep-effect monorepo. You follow strict Effect patterns including namespace imports, single-letter aliases, PascalCase schema constructors, and ALWAYS validate external data with Schema.

CONTEXT:
You are adding support for dragging external items into the flex-layout. Users should be able to drag new tabs from a palette into the layout.

FILES TO READ FIRST:
1. apps/todox/src/app/demo/page.tsx - Current demo
2. packages/ui/ui/src/flex-layout/model/actions.model.ts - Actions.ADD_NODE
3. tmp/FlexLayout/demo/App.tsx - See onDragStart for "Add Drag" button

TASK:
Add external drag support to demo:

1. Create a "New Tab" button/element that is draggable

2. On drag start, set drag data:
   e.dataTransfer.setData('application/json', JSON.stringify({
     type: 'new-tab',
     name: 'New Tab',
     component: 'placeholder'
   }));

3. In onDrop handler:
   - Check if this is an external drag (dataTransfer has our data)
   - If so, use Actions.ADD_NODE instead of MOVE_NODE
   - Parse the JSON to create the new tab config

4. Update drop handler to support both internal and external:
   if (isExternalDrag) {
     const rawData = e.dataTransfer.getData('application/json');
     // REQUIRED: Validate external data with Schema
     import * as S from "effect/Schema";
     const NewTabConfig = S.Struct({
       type: S.Literal('new-tab'),
       name: S.String,
       component: S.String
     });
     const parseResult = S.decodeUnknownSync(NewTabConfig)(JSON.parse(rawData));
     model.doAction(Actions.addNode(parseResult, dropInfo.node.getId(), dropInfo.location, dropInfo.index));
   } else {
     model.doAction(Actions.moveNode(dragNodeId, dropInfo.node.getId(), dropInfo.location, dropInfo.index));
   }

EFFECT PATTERNS (REQUIRED):
- ALWAYS validate external data with Schema before use
- Use S.decodeUnknownSync for synchronous validation
- Define schemas with PascalCase constructors (S.Struct, S.String, S.Literal)
- NEVER trust raw JSON.parse output without validation

AFTER IMPLEMENTING:
Run: bun run check --filter @beep/todox

EXPECTED SUCCESS OUTPUT:
- No type errors
- Exit code 0

IF ERRORS OCCUR:
- Report the exact error message
- Include file path and line number
- Refer to the "Fix Type Error Agent" prompt in this file with the exact error message

Test by dragging the new element into the layout

REFLECTION (after completion):
Document in your response:
1. What approach worked well that should be reused?
2. What obstacles were encountered?
3. Any improvements to this prompt for future use?
```

---

## Utility Agents

### Agent: Rect.contains Method

**subagent_type:** `effect-code-writer`

```
FILES TO READ:
- packages/ui/ui/src/flex-layout/rect.ts

TASK:
Add a contains method to the Rect class if not already present:

contains(x: number, y: number): boolean {
  return x >= this.x && x < this.x + this.width &&
         y >= this.y && y < this.y + this.height;
}

This is used by findDropTargetNode to check if a point is within a node's bounds.
```

---

### Agent: Type Guards

**subagent_type:** `effect-code-writer`

```
FILES TO READ:
- packages/ui/ui/src/flex-layout/model/index.ts
- packages/ui/ui/src/flex-layout/model/model.ts

TASK:
Verify or add type guards for node types:

export const isTabSetNode = (node: unknown): node is TabSetNode =>
  node instanceof TabSetNode;

export const isRowNode = (node: unknown): node is RowNode =>
  node instanceof RowNode;

export const isTabNode = (node: unknown): node is TabNode =>
  node instanceof TabNode;

export const isBorderNode = (node: unknown): node is BorderNode =>
  node instanceof BorderNode;

These should be exported from model/index.ts for use in findDropTargetNode.
```

---

## Verification Agent

**subagent_type:** `general-purpose`

```
TASK: Verify docking system implementation

Run these commands and report results:

1. Type check:
   bun run check --filter @beep/ui

2. Build:
   bun run build --filter @beep/ui

3. Test:
   bun run test --filter @beep/ui

4. Lint:
   bun run lint:fix --filter @beep/ui

5. Check demo builds:
   bun run check --filter @beep/todox

Report:
- Any errors from each command
- Count of warnings
- Overall pass/fail status
```

---

## Error Recovery Agents

### Fix Type Error Agent

**subagent_type:** `effect-code-writer`

```
CONTEXT:
A type error occurred during docking system implementation.

ERROR MESSAGE:
[PASTE EXACT ERROR HERE]

FILE:
[PASTE FILE PATH]

TASK:
1. Read the file with the error
2. Analyze the type mismatch
3. Fix the type error following Effect patterns:
   - Prefer Option<T> over T | undefined for optional fields
   - Use proper type narrowing with type guards
   - Ensure all imports are correct
4. Run: bun run check --filter @beep/ui
5. Report the fix applied
```

### Fix Missing Import Agent

**subagent_type:** `effect-code-writer`

```
CONTEXT:
A missing import error occurred.

ERROR:
Cannot find module 'X' or its corresponding type declarations

FILE:
[PASTE FILE PATH]

TASK:
1. Identify what needs to be imported
2. Find the correct import path in the codebase:
   - Check packages/ui/ui/src/flex-layout/index.ts
   - Check model/index.ts for model exports
3. Add the missing import
4. Run: bun run check --filter @beep/ui
5. Report the import added
```

---

## Learning Accumulation Protocol

After each sub-agent completes:
1. Extract learnings from the agent's reflection section
2. Append to REFLECTION_LOG.md with timestamp and agent ID
3. If prompt improvements are suggested, update the relevant prompt in this file
4. Reference improved prompts in HANDOFF_P[N+1].md

### Reflection Entry Template

```markdown
### YYYY-MM-DD - Agent [ID] Reflection
- **Task**: [Brief description]
- **What Worked**: [Approach that succeeded]
- **Obstacles**: [Issues encountered]
- **Prompt Improvement**: [Suggested change]
```
