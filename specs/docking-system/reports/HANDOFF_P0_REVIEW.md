# HANDOFF_P0.md Review Report

## Summary

The handoff document captures discovery results and task lists adequately but deviates significantly from the META_SPEC_TEMPLATE structure, lacks critical self-reflection components, and contains inconsistencies with the parent README.md.

## Issues Found

### Issue 1: Missing Handoff Structure Header Format
- **File**: handoffs/HANDOFF_P0.md
- **Line(s)**: 1-11
- **Category**: Handoff Completeness
- **Severity**: Major
- **Problem**: The header does not follow the META_SPEC_TEMPLATE structure. Template specifies format `# [Spec Name] Handoff - P[N] Phase` with a structured summary table showing `| Metric | Before | After | Status |`. The current document uses `| Metric | Value |` without before/after comparison, which is essential for tracking progress.
- **Suggested Fix**: Replace lines 5-11 with:
```markdown
## Session Summary: P0 Scaffolding

| Metric | Before | After | Status |
|--------|--------|-------|--------|
| Date | N/A | 2026-01-10 | Complete |
| Phase | N/A | P0 (Scaffolding) | Complete |
| canDrop implementations | 0 | 0 | Not started |
| findDropTargetNode | Missing | Missing | P1 target |
| Visual overlay | None | None | P2 target |
```

### Issue 2: Missing Lessons Learned Section
- **File**: handoffs/HANDOFF_P0.md
- **Line(s)**: After line 97 (before Task List)
- **Category**: Handoff Completeness
- **Severity**: Critical
- **Problem**: META_SPEC_TEMPLATE mandates a "Lessons Learned" section with subsections: "What Worked Well", "What Needed Adjustment", "Prompt Improvements". This is the core self-improving mechanism of the spec pattern. The document jumps directly from Files Reference to Task Lists without capturing any discovery learnings.
- **Suggested Fix**: Insert after line 97:
```markdown
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
```

### Issue 3: Inconsistent Priority Labeling
- **File**: handoffs/HANDOFF_P0.md
- **Line(s)**: 99-115
- **Category**: Task Documentation
- **Severity**: Minor
- **Problem**: Task lists are labeled "P1" and "P2" but parent README.md uses "P0" for priority labels (e.g., `| TabSetNode.canDrop() | Center + edge docking | P0 |`). This creates confusion between "Phase number" (P1 = phase 1) and "Priority level" (P0 = highest priority). The tasks themselves don't indicate priority.
- **Suggested Fix**: Clarify by renaming sections and adding priority markers:
```markdown
## Task List for Phase 1 (P0 Priority - Core Functionality)

1. [ ] **[P0]** Add `Rect.contains()` method
2. [ ] **[P0]** Implement `TabSetNode.canDrop()`
3. [ ] **[P0]** Implement `RowNode.canDrop()`
4. [ ] **[P0]** Implement `RowNode.findDropTargetNode()`
5. [ ] **[P0]** Implement `Model.findDropTargetNode()`
6. [ ] Verify with `bun run check --filter @beep/ui`

## Task List for Phase 2 (P1 Priority - Visual Feedback)
```

### Issue 4: Missing Improved Sub-Agent Prompts Section
- **File**: handoffs/HANDOFF_P0.md
- **Line(s)**: Missing (should be before line 117)
- **Category**: Handoff Completeness
- **Severity**: Major
- **Problem**: META_SPEC_TEMPLATE requires "Improved Sub-Agent Prompts" section with ready-to-use prompts for each task. Current "Notes for Next Agent" (lines 117-123) provides guidance but not executable prompts.
- **Suggested Fix**: Insert before line 117:
```markdown
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
```

### Issue 5: Missing Verification Commands Section
- **File**: handoffs/HANDOFF_P0.md
- **Line(s)**: Missing (should be after Notes for Next Agent)
- **Category**: Actionability
- **Severity**: Minor
- **Problem**: META_SPEC_TEMPLATE requires a "Verification Commands" section. While line 106 mentions `bun run check --filter @beep/ui`, there's no dedicated section with all relevant commands.
- **Suggested Fix**: Add after line 130:
```markdown
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
```

### Issue 6: Missing Success Criteria Section
- **File**: handoffs/HANDOFF_P0.md
- **Line(s)**: Missing (should be after Verification Commands)
- **Category**: Actionability
- **Severity**: Major
- **Problem**: META_SPEC_TEMPLATE requires "Success Criteria" section. Parent README.md has success criteria but handoff doesn't reference or adapt them for P1 phase scope.
- **Suggested Fix**: Add after Verification Commands:
```markdown
## Success Criteria for P1

- [ ] `Rect.contains()` exists and handles edge cases (point on boundary)
- [ ] `TabSetNode.canDrop()` returns valid DropInfo for all 5 dock locations (CENTER, TOP, BOTTOM, LEFT, RIGHT)
- [ ] `RowNode.canDrop()` detects edge docking at layout boundaries
- [ ] `RowNode.findDropTargetNode()` recursively searches children
- [ ] `Model.findDropTargetNode()` delegates to root row
- [ ] `bun run check --filter @beep/ui` passes with no type errors
```

### Issue 7: Incomplete File Reference - Missing Type Guards
- **File**: handoffs/HANDOFF_P0.md
- **Line(s)**: 122
- **Category**: Technical Context
- **Severity**: Minor
- **Problem**: Line 122 states "Ensure isTabSetNode/isRowNode exist in exports" but doesn't provide the file path where these should be checked or the expected import path.
- **Suggested Fix**: Replace line 122 with:
```markdown
4. **Check type guards**: Ensure `isTabSetNode`/`isRowNode` exist in `packages/ui/ui/src/flex-layout/model/index.ts` exports. If missing, add them as `Schema.is()` predicates.
```

### Issue 8: Orchestration Strategy Lacks Specific Agent Types
- **File**: handoffs/HANDOFF_P0.md
- **Line(s)**: 125-130
- **Category**: Actionability
- **Severity**: Minor
- **Problem**: "Orchestration Strategy" mentions `effect-code-writer` agent but doesn't clarify what this is (a Claude skill? a Task prompt?). Also mentions "explore agents" without definition. This assumes prior knowledge that won't persist between sessions.
- **Suggested Fix**: Replace lines 125-130 with:
```markdown
## Orchestration Strategy

- **Code implementation**: Use Task tool with `effect-code-writer` skill (`.claude/skills/effect-code-writer.md`) for all implementation
- **File exploration**: Use Read tool directly or delegate to Task tool for multi-file reads
- **Result compression**: Store sub-agent summaries in `outputs/p1-results.md` before continuing
- **Handoff update**: Update `handoffs/HANDOFF_P1.md` after phase completion with learnings
```

### Issue 9: Legacy File References May Be Stale
- **File**: handoffs/HANDOFF_P0.md
- **Line(s)**: 92-97
- **Category**: Technical Context
- **Severity**: Minor
- **Problem**: Line references like `src/model/TabSetNode.ts:200-280` are fragile - code changes will invalidate these. No instructions for how to re-locate the relevant code if lines shift.
- **Suggested Fix**: Add after line 97:
```markdown
> **Note**: Line numbers are approximate and may shift. Search for method names (`canDrop`, `findDropTargetNode`) if exact lines don't match.
```

### Issue 10: Missing P1 Orchestrator Prompt Reference
- **File**: handoffs/HANDOFF_P0.md
- **Line(s)**: Missing
- **Category**: Handoff Completeness
- **Severity**: Major
- **Problem**: META_SPEC_TEMPLATE shows every handoff should either include or reference a `P[N]_ORCHESTRATOR_PROMPT.md`. The document says "Ready for P1 execution" but provides no orchestrator prompt or reference to one.
- **Suggested Fix**: Either create `handoffs/P1_ORCHESTRATOR_PROMPT.md` or add to end of HANDOFF_P0.md:
```markdown
## P1 Orchestrator Prompt

See [`P1_ORCHESTRATOR_PROMPT.md`](./P1_ORCHESTRATOR_PROMPT.md) for the execution prompt.

If not yet created, use `ORCHESTRATION_PROMPT.md` from spec root and focus on "Task List for Phase 1" items only.
```

## Improvements Not Implemented (Opportunities)

1. **Dependency graph visualization**: The task list doesn't show dependencies between items (e.g., `Rect.contains()` must come before `canDrop()` methods). A simple ASCII DAG would help.

2. **Estimated effort per task**: No time/complexity estimates to help planning.

3. **Rollback strategy**: No guidance on what to do if a task introduces regressions.

4. **Test coverage expectations**: Tasks mention verification but not whether tests should be written alongside.

5. **Cross-reference to REFLECTION_LOG.md**: If one exists for this spec, it should be referenced for accumulated learnings.

6. **Border handling**: README.md mentions `BorderNode.canDrop()` as P1 priority but handoff P1 tasks don't include it. Either add it or explicitly note it's deferred to a later phase.

## Verdict

**NEEDS_FIXES**

The document captures the technical discovery well but fails to follow the self-improving spec pattern that makes handoffs valuable across sessions. The missing "Lessons Learned", "Improved Sub-Agent Prompts", and "Success Criteria" sections are structural requirements of the META_SPEC_TEMPLATE. Without these, the next agent loses the accumulated learning that distinguishes a spec-driven approach from ad-hoc task execution.

Critical fixes required:
1. Add Lessons Learned section (Issue 2)
2. Add Improved Sub-Agent Prompts section (Issue 4)
3. Add Success Criteria section (Issue 6)
4. Add/reference P1 Orchestrator Prompt (Issue 10)
