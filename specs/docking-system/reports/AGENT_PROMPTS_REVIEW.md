# AGENT_PROMPTS.md Review Report

## Summary

The AGENT_PROMPTS.md file provides a comprehensive set of sub-agent prompts for the docking system implementation but contains several Effect pattern violations, missing self-improvement hooks, and orchestration clarity issues that should be addressed before execution.

## Issues Found

### Issue 1: Missing Role Assignment in Agent Prompts

- **File**: AGENT_PROMPTS.md
- **Line(s)**: 24-69, 77-122, 130-158, 168-210, 218-263, 271-308, 318-331, 339-360, 368-392, 402-421, 428-445
- **Category**: Prompt Engineering
- **Severity**: Major
- **Problem**: None of the agent prompts include explicit role assignment. Best practices for prompt engineering require starting with a clear role definition (e.g., "You are an expert Effect TypeScript developer specializing in...").
- **Suggested Fix**: Add role assignment to each prompt. For example, at line 25, change:
  ```
  CONTEXT:
  You are implementing drag-and-drop detection...
  ```
  to:
  ```
  ROLE:
  You are an expert Effect TypeScript developer working in the beep-effect monorepo. You follow strict Effect patterns including namespace imports, single-letter aliases, and PascalCase schema constructors.

  CONTEXT:
  You are implementing drag-and-drop detection...
  ```

### Issue 2: Incomplete Effect Import Guidance

- **File**: AGENT_PROMPTS.md
- **Line(s)**: 61-64
- **Category**: Effect Patterns
- **Severity**: Major
- **Problem**: The Effect patterns section only mentions `O` (Option) but does not provide the complete import statement format required by the project. The project requires full namespace imports with the exact path format `import * as O from "effect/Option"`.
- **Suggested Fix**: Replace lines 61-64:
  ```
  EFFECT PATTERNS TO USE:
  - import * as O from "effect/Option"
  - O.getOrElse for Option handling
  - No native methods
  ```
  with:
  ```
  EFFECT PATTERNS (REQUIRED):
  - Use namespace imports: import * as O from "effect/Option";
  - Use single-letter aliases per project convention (A for Array, O for Option, etc.)
  - Use O.getOrElse for Option handling
  - NEVER use native JavaScript array/string methods
  - Route ALL operations through Effect utilities (A.map, A.filter, etc.)
  ```

### Issue 3: Native Method Usage in Helper Code

- **File**: AGENT_PROMPTS.md
- **Line(s)**: 109-112
- **Category**: Effect Patterns
- **Severity**: Critical
- **Problem**: The suggested `contains` method implementation uses raw boolean expressions instead of Effect Boolean utilities. While this is acceptable for simple predicates, the broader context shows native method usage patterns that conflict with project rules.
- **Suggested Fix**: The `contains` method is acceptable as-is since it returns a primitive boolean and doesn't involve array/string operations. However, add a clarifying note:
  ```
  HELPER NEEDED:
  Add a contains method to Rect if not present:
  contains(x: number, y: number): boolean {
    return x >= this.x && x < this.x + this.width &&
           y >= this.y && y < this.y + this.height;
  }
  Note: Simple boolean predicates are acceptable. For array/string operations, use Effect utilities.
  ```

### Issue 4: Missing Array Iteration Pattern Guidance

- **File**: AGENT_PROMPTS.md
- **Line(s)**: 100-104
- **Category**: Effect Patterns
- **Severity**: Major
- **Problem**: The instruction "Iterate through this.children array" suggests using native iteration. The Effect patterns require using `A.findFirst` or similar, which is mentioned later but the primary instruction is misleading.
- **Suggested Fix**: Replace lines 100-104:
  ```
  2. findDropTargetNode(dragNode: IDraggable, x: number, y: number): DropInfo | undefined
     - Iterate through this.children array
     - For each child that contains the point (child.rect.contains(x, y)):
       - If child is TabSetNode: return child.canDrop(dragNode, x, y)
       - If child is RowNode: return child.findDropTargetNode(dragNode, x, y)
  ```
  with:
  ```
  2. findDropTargetNode(dragNode: IDraggable, x: number, y: number): DropInfo | undefined
     - Use A.findFirst to search this.children array:
       A.findFirst(this.children, child => child.rect.contains(x, y))
     - For matching child:
       - If isTabSetNode(child): return child.canDrop(dragNode, x, y)
       - If isRowNode(child): return child.findDropTargetNode(dragNode, x, y)
  ```

### Issue 5: Missing Verification Command Details

- **File**: AGENT_PROMPTS.md
- **Line(s)**: 67-68, 119-121, 155-157
- **Category**: Prompt Engineering
- **Severity**: Minor
- **Problem**: The verification commands lack expected output format. Agents should know what success looks like.
- **Suggested Fix**: Enhance verification sections. For example, at lines 67-68:
  ```
  AFTER IMPLEMENTING:
  Run: bun run check --filter @beep/ui
  Report success or any type errors.
  ```
  change to:
  ```
  AFTER IMPLEMENTING:
  Run: bun run check --filter @beep/ui

  EXPECTED SUCCESS OUTPUT:
  - No type errors
  - Exit code 0

  IF ERRORS OCCUR:
  - Report the exact error message
  - Include file path and line number
  - Propose a fix based on the error type
  ```

### Issue 6: Missing Error Recovery Instructions in Main Prompts

- **File**: AGENT_PROMPTS.md
- **Line(s)**: 24-69, 77-122, 130-158
- **Category**: Prompt Engineering
- **Severity**: Major
- **Problem**: The main implementation prompts (1A, 1B, 1C) don't include error recovery instructions. They reference error recovery agents at the bottom but don't instruct main agents to use them.
- **Suggested Fix**: Add error recovery reference to each main prompt. After the "AFTER IMPLEMENTING" section, add:
  ```
  IF TYPE ERRORS OCCUR:
  Refer to the "Fix Type Error Agent" prompt in this file with the exact error message.

  IF IMPORT ERRORS OCCUR:
  Refer to the "Fix Missing Import Agent" prompt in this file.
  ```

### Issue 7: Inconsistent File Path Format

- **File**: AGENT_PROMPTS.md
- **Line(s)**: 31-35, 84-87, 136-138
- **Category**: Orchestration
- **Severity**: Minor
- **Problem**: File paths mix relative paths from project root. While correct, the project CLAUDE.md specifies using `@beep/*` aliases. The prompts should clarify this is for file system navigation, not imports.
- **Suggested Fix**: Add clarification at the start of each FILES TO READ section:
  ```
  FILES TO READ FIRST (paths relative to project root):
  1. packages/ui/ui/src/flex-layout/model/tab-set-node.ts - The target file
  ...
  Note: For imports in code, use @beep/ui path aliases as configured in tsconfig.
  ```

### Issue 8: Missing Self-Reflection Capture Points

- **File**: AGENT_PROMPTS.md
- **Line(s)**: entire file
- **Category**: Self-Improvement
- **Severity**: Major
- **Problem**: The prompts lack self-reflection hooks. According to META_SPEC_TEMPLATE.md, every phase should produce both work product and process learning. None of the prompts ask agents to capture learnings.
- **Suggested Fix**: Add a reflection section to each agent prompt template:
  ```
  REFLECTION (after completion):
  Document in your response:
  1. What approach worked well that should be reused?
  2. What obstacles were encountered?
  3. Any improvements to this prompt for future use?

  These learnings will be captured in REFLECTION_LOG.md.
  ```

### Issue 9: Missing Learning Accumulation Mechanism

- **File**: AGENT_PROMPTS.md
- **Line(s)**: entire file
- **Category**: Self-Improvement
- **Severity**: Minor
- **Problem**: No instructions for how learnings from sub-agents should be accumulated into the REFLECTION_LOG.md or used to improve prompts in handoffs.
- **Suggested Fix**: Add a section at the end of the file:
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
  ```

### Issue 10: Type Guard Implementation Uses instanceof

- **File**: AGENT_PROMPTS.md
- **Line(s)**: 347-357
- **Category**: Effect Patterns
- **Severity**: Suggestion
- **Problem**: The type guards use `instanceof` checks. While functional, Effect-based codebases often use tagged unions with `_tag` fields for more robust type discrimination.
- **Suggested Fix**: Consider using tagged unions if the node classes support it:
  ```
  // If nodes have _tag field:
  export const isTabSetNode = (node: { _tag: string }): node is TabSetNode =>
    node._tag === "TabSetNode";

  // Otherwise instanceof is acceptable:
  export const isTabSetNode = (node: unknown): node is TabSetNode =>
    node instanceof TabSetNode;
  ```

### Issue 11: Demo Page Prompt Uses useState Without Import Guidance

- **File**: AGENT_PROMPTS.md
- **Line(s)**: 236-237
- **Category**: Orchestration
- **Severity**: Minor
- **Problem**: The prompt mentions `useState` without specifying the import. Next.js 16 with React 19 may have different patterns.
- **Suggested Fix**: Add import guidance:
  ```
  1. Add state (import { useState } from 'react'):
     const [currentDropInfo, setCurrentDropInfo] = useState<DropInfo | null>(null);
     const [isDragging, setIsDragging] = useState(false);
  ```

### Issue 12: External Drag JSON.parse Without Validation

- **File**: AGENT_PROMPTS.md
- **Line(s)**: 299
- **Category**: Effect Patterns
- **Severity**: Major
- **Problem**: The prompt suggests using raw `JSON.parse` without Schema validation. The project requires validating external data with `@beep/schema`.
- **Suggested Fix**: Replace lines 298-300:
  ```
  if (isExternalDrag) {
    const config = JSON.parse(e.dataTransfer.getData('application/json'));
  ```
  with:
  ```
  if (isExternalDrag) {
    const rawData = e.dataTransfer.getData('application/json');
    // Validate with schema
    const NewTabConfig = S.Struct({
      type: S.Literal('new-tab'),
      name: S.String,
      component: S.String
    });
    const parseResult = S.decodeUnknownSync(NewTabConfig)(JSON.parse(rawData));
  ```

### Issue 13: Missing Output Format Specification

- **File**: AGENT_PROMPTS.md
- **Line(s)**: 24-69, 77-122, 130-158
- **Category**: Prompt Engineering
- **Severity**: Minor
- **Problem**: The prompts don't specify the expected output format. Should the agent return code in a code block? Should it provide before/after comparisons?
- **Suggested Fix**: Add output format section to each prompt:
  ```
  OUTPUT FORMAT:
  1. Show the complete method implementation in a TypeScript code block
  2. List all imports added
  3. Confirm verification command results
  4. Document any deviations from the spec with reasoning
  ```

## Improvements Not Implemented (Opportunities)

1. **Parallelization hints**: The prompts could indicate which agents can run in parallel vs. sequentially (e.g., Agent 1A, 1B can run in parallel; Agent 1C depends on both).

2. **Dependency graph**: A visual dependency graph showing agent execution order would improve clarity.

3. **Test prompts**: No prompts for writing tests. The META_SPEC_TEMPLATE suggests tests should be part of the workflow.

4. **Rollback instructions**: No guidance on how to undo changes if a phase fails catastrophically.

5. **Context window management**: The META_SPEC_TEMPLATE emphasizes preserving context window, but these prompts don't include guidance on keeping responses concise.

6. **Line number specificity**: While file paths are provided, specific line numbers for modification targets would reduce agent exploration time.

7. **Success metrics**: No quantitative success criteria (e.g., "all 5 type checks must pass", "0 lint errors").

## Verdict

**NEEDS_FIXES**

The AGENT_PROMPTS.md file provides solid foundational prompts but requires fixes in the following priority order:

1. **Critical**: Fix Issue 12 (JSON.parse without validation)
2. **Major**: Fix Issues 1, 2, 4, 6, 8 (role assignment, Effect patterns, error recovery, self-reflection)
3. **Minor**: Fix Issues 5, 7, 11, 13 (verification details, file paths, imports, output format)

After addressing the critical and major issues, the prompts will be ready for execution.
