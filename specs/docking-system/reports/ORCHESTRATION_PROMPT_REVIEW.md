# ORCHESTRATION_PROMPT.md Review Report

## Summary

The ORCHESTRATION_PROMPT.md demonstrates solid orchestration fundamentals with clear "never write code" enforcement and reasonable task definitions, but lacks critical recovery protocols, self-improvement integration hooks, and handoff documentation requirements specified in the META_SPEC_TEMPLATE.

## Issues Found

### Issue 1: Missing Recovery Protocol for Sub-Agent Failures

- **File**: ORCHESTRATION_PROMPT.md
- **Line(s)**: 247-255
- **Category**: Recovery Mechanisms
- **Severity**: Major
- **Problem**: The Recovery Protocol section is minimal and lacks specific guidance on when to abandon a task versus retry, how to capture partial progress, and escalation paths to the human operator. The current protocol only addresses generic errors without considering:
  - Type check failures that indicate architectural issues
  - Sub-agent context exhaustion mid-task
  - Conflicts between legacy reference and Effect patterns
- **Suggested Fix**: Replace lines 247-255 with:
```markdown
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
```

---

### Issue 2: No Explicit Reflection Capture Instruction After Each Task

- **File**: ORCHESTRATION_PROMPT.md
- **Line(s)**: 222-243
- **Category**: Self-Improvement Integration
- **Severity**: Major
- **Problem**: The Context Compression Protocol section instructs the orchestrator to compress results but does not require updating REFLECTION_LOG.md after each task. The META_SPEC_TEMPLATE emphasizes that "every execution improves future executions" through dual outputs: work product AND process learning. Currently, reflection is only captured at phase boundaries (line 153-161), not at task completion.
- **Suggested Fix**: Add to line 229 after "Continue or escalate":
```markdown
5. **Update REFLECTION_LOG.md**: If any prompt refinement or methodology insight emerged, append to the Reflection Log immediately. Do NOT defer this to phase completion.
```

---

### Issue 3: Missing Line Number References in Legacy File References

- **File**: ORCHESTRATION_PROMPT.md
- **Line(s)**: 49, 83, 119, 176, 203
- **Category**: Task Definition Quality
- **Severity**: Minor
- **Problem**: Some sub-agent prompts include line number ranges (line 49: "lines 200-280"), but others reference entire files without line numbers (line 83, 119, 176, 203). This inconsistency was already identified in REFLECTION_LOG.md lines 51-52 as a needed update, but the orchestration prompt has not been corrected. The REFLECTION_LOG explicitly states: "Sub-agent prompts should specify exact line ranges for legacy reference files".
- **Suggested Fix**: Update the following lines:
  - Line 83: `tmp/FlexLayout/src/model/RowNode.ts (legacy reference)` should become:
    `tmp/FlexLayout/src/model/RowNode.ts (legacy reference, lines 100-200 for canDrop, lines 240-300 for findDropTargetNode)`
  - Line 119: `tmp/FlexLayout/src/model/Model.ts (legacy reference, search for findDropTargetNode)` should become:
    `tmp/FlexLayout/src/model/Model.ts (legacy reference, lines 420-480 for findDropTargetNode)`
  - Line 176: `tmp/FlexLayout/demo/App.tsx (legacy demo reference)` should become:
    `tmp/FlexLayout/demo/App.tsx (legacy demo reference, lines 50-150 for drag handlers)`
  - Line 203: `tmp/FlexLayout/src/view/Layout.tsx (search for outlineDiv)` should become:
    `tmp/FlexLayout/src/view/Layout.tsx (legacy reference, lines 180-250 for outlineDiv rendering)`

---

### Issue 4: Task Tool Invocation Not Specified

- **File**: ORCHESTRATION_PROMPT.md
- **Line(s)**: 276
- **Category**: Task Definition Quality
- **Severity**: Major
- **Problem**: Line 276 mentions `Task tool with subagent_type: "effect-code-writer"` but this tool invocation pattern is not standardized or explained. The document assumes familiarity with a specific tool API without defining the expected interface. If the orchestrator or sub-agent implementation changes, this reference becomes stale.
- **Suggested Fix**: Add a new section after line 11 (after Critical Orchestration Rules):
```markdown
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
```

---

### Issue 5: P2 Tasks Lack Verification Commands

- **File**: ORCHESTRATION_PROMPT.md
- **Line(s)**: 165-218
- **Category**: Task Definition Quality
- **Severity**: Minor
- **Problem**: P1 tasks (lines 39-106) each include verification commands (`bun run check --filter @beep/ui`), but P2 tasks (lines 167-218) do not include any verification commands. This inconsistency could lead to P2 sub-agents completing tasks without validation.
- **Suggested Fix**: Add verification commands to Task 4 and Task 5:

For Task 4 (after line 193):
```markdown
After implementing, run:
bun run check --filter @beep/ui
bun run lint:fix --filter @beep/todox
```

For Task 5 (after line 217):
```markdown
After implementing, run: bun run check --filter @beep/ui
```

---

### Issue 6: Missing Handoff Template Structure

- **File**: ORCHESTRATION_PROMPT.md
- **Line(s)**: 153-161
- **Category**: Phase Management
- **Severity**: Minor
- **Problem**: The Phase Transition section instructs creation of `handoffs/HANDOFF_P1.md` but does not reference the expected structure from META_SPEC_TEMPLATE. The handoff document structure (META_SPEC_TEMPLATE lines 174-199) includes specific sections: Session Summary table, Lessons Learned, Prompt Improvements, P[N] Orchestrator Prompt, etc. The current instruction is too vague.
- **Suggested Fix**: Replace lines 153-161 with:
```markdown
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
```

---

### Issue 7: No Context Window Preservation Metrics

- **File**: ORCHESTRATION_PROMPT.md
- **Line(s)**: 3, 9
- **Category**: Orchestration Best Practices
- **Severity**: Suggestion
- **Problem**: Lines 3 and 9 mention preserving context window but provide no concrete metrics or thresholds. The orchestrator has no guidance on when context is becoming exhausted or when to proactively compress. The META_SPEC_TEMPLATE mentions tracking "Lines per handoff" as a complexity measure.
- **Suggested Fix**: Add after line 11:
```markdown
6. **Monitor context usage** - If sub-agent output exceeds 500 lines, compress before storing
7. **Proactive compression** - If total accumulated context exceeds 2000 lines, write to handoff and reset
```

---

### Issue 8: File Reference Quick Index Uses Relative Paths

- **File**: ORCHESTRATION_PROMPT.md
- **Line(s)**: 258-270
- **Category**: Task Definition Quality
- **Severity**: Minor
- **Problem**: The File Reference Quick Index uses relative paths (`model/tab-set-node.ts`) which are ambiguous. The full paths should be used for clarity, especially since different files are in different packages.
- **Suggested Fix**: Update the table at lines 260-270:
```markdown
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
```

---

### Issue 9: No Authorization Gates for Risky Operations

- **File**: ORCHESTRATION_PROMPT.md
- **Line(s)**: N/A (missing entirely)
- **Category**: Orchestration Best Practices
- **Severity**: Minor
- **Problem**: The ORCHESTRATION_TEMPLATE.md (lines 505-516) includes an "Authorization Gates" section that requires explicit user approval before risky operations. This is absent from the docking-system orchestration prompt. Without gates, the orchestrator might execute multi-package changes or commits without human verification.
- **Suggested Fix**: Add new section before line 274 "Start Execution":
```markdown
## Authorization Gates

**STOP and request user approval before:**

1. Creating new files outside the flex-layout directory
2. Modifying files in apps/todox beyond the demo page
3. Committing changes
4. Proceeding from P1 to P2

**Never auto-proceed without explicit "continue" from user.**
```

---

### Issue 10: Accumulated Improvements from REFLECTION_LOG Not Applied

- **File**: ORCHESTRATION_PROMPT.md
- **Line(s)**: 49-67 (Task 1 prompt)
- **Category**: Self-Improvement Integration
- **Severity**: Minor
- **Problem**: The REFLECTION_LOG.md (lines 51-58) documents specific improvements that should be applied to ORCHESTRATION_PROMPT.md, but they have not been implemented:
  - "Include method signatures at start of each prompt" - signatures are at the END (line 59-60)
  - "Add Effect import patterns to all code prompts" - only Task 1 has import patterns (lines 63-65), Task 3 (lines 114-133) lacks them
- **Suggested Fix**:
  1. Move method signature in Task 1 from lines 59-60 to immediately after "IMPLEMENT canDrop()":
  ```markdown
  IMPLEMENT canDrop() on TabSetNode class with this signature:
  canDrop(dragNode: IDraggable, x: number, y: number): DropInfo | undefined

  Implementation steps:
  1. Check if drops are enabled...
  ```

  2. Add Effect import patterns to Task 3 prompt (after line 126):
  ```markdown
  Use Effect patterns:
  - import * as O from "effect/Option"
  - import * as A from "effect/Array"
  - No native array methods
  - Immutable patterns only
  ```

---

## Improvements Not Implemented (Opportunities)

1. **Parallel Task Execution Guidance**: Tasks 1, 2, 3 are marked as sequential but Task 1 and Task 2 could potentially be parallelized since they modify different files. The orchestration prompt does not provide guidance on identifying parallelizable tasks.

2. **Rollback Strategy**: Unlike ORCHESTRATION_TEMPLATE.md (lines 447-464), this prompt has no rollback guidance if a task partially succeeds but verification fails.

3. **Progress Persistence**: The prompt references `outputs/progress.md` but does not specify its format or what should be tracked beyond generic "current state".

4. **Error Message Database**: The Recovery Protocol could reference common error patterns specific to Effect development (e.g., "Type 'Effect<A, E, R>' is not assignable" errors) with known solutions.

5. **Sub-Agent Result Validation**: The prompt does not specify how to validate that sub-agent output meets requirements before accepting it. The orchestrator should verify method existence and type correctness, not just "did check pass".

## Verdict

**NEEDS_FIXES**

The orchestration prompt is functional but has several gaps compared to the META_SPEC_TEMPLATE patterns:
- Missing robust recovery protocols (Issue 1 - Major)
- Inadequate self-improvement integration (Issue 2 - Major)
- Inconsistent task definition quality (Issues 3, 5, 10 - Minor)
- Missing safety mechanisms like authorization gates (Issue 9 - Minor)

The Major issues (1, 2, 4) should be addressed before active use. Minor issues can be addressed incrementally during execution.
