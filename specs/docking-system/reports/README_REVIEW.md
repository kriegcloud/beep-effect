# README.md Review Report

## Summary

The docking-system README.md is a well-structured spec entry point that provides clear objectives and technical context. However, it deviates from the META_SPEC_TEMPLATE in several ways: missing required files in the quick reference, inconsistent phase labeling, and lacking some standard sections expected by the spec pattern.

## Issues Found

### Issue 1: Quick Reference Table Missing REFLECTION_LOG.md

- **File**: README.md
- **Line(s)**: 5-13
- **Category**: Entry Point
- **Severity**: Major
- **Problem**: The Quick Reference table does not include REFLECTION_LOG.md, which is a required file per specs/README.md compliance requirements. The spec does have this file but it is not documented in the entry point.
- **Suggested Fix**: Replace lines 5-13 with:
```markdown
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
```

### Issue 2: Inconsistent Phase Labeling in Header

- **File**: README.md
- **Line(s)**: 18
- **Category**: Status
- **Severity**: Minor
- **Problem**: The header says "Current State (Phase 3 Complete)" but the handoff document (HANDOFF_P0.md) and progress.md indicate P0 is complete and P1 is "NOT STARTED". This inconsistency could confuse agents about the actual project state.
- **Suggested Fix**: Replace line 18 with:
```markdown
## Current State (P0 Complete, P1 Ready)
```

### Issue 3: Missing Success Criteria Checkboxes Status

- **File**: README.md
- **Line(s)**: 106-112
- **Category**: Status
- **Severity**: Minor
- **Problem**: Success criteria are listed but none are checked, while the document header claims "Phase 3 Complete". The success criteria should accurately reflect what has been achieved.
- **Suggested Fix**: No immediate text change needed, but the success criteria should be updated as phases complete. Add a note:
```markdown
## Success Criteria

> **Note**: Update checkboxes as phases complete.

- [ ] Tabs can be dragged between tabsets
- [ ] Tabs can be docked to edges (creating splits)
- [ ] Visual outline shows valid drop zones during drag
- [ ] External items can be dragged into layout
- [ ] All operations dispatch proper actions through `Model.doAction()`
```

### Issue 4: Missing QUICK_START.md Reference

- **File**: README.md
- **Line(s)**: 5-13
- **Category**: Compliance
- **Severity**: Suggestion
- **Problem**: META_SPEC_TEMPLATE specifies QUICK_START.md (100-150 lines) as an optional but recommended file for "5-min getting started". The spec does not have this file and does not mention it. While optional, its absence means new agents must read the full ORCHESTRATION_PROMPT.md to begin.
- **Suggested Fix**: Either create a QUICK_START.md file or explicitly note in the README that the orchestration prompt serves this purpose. Add after line 125:
```markdown
> **Note**: For quick onboarding, the ORCHESTRATION_PROMPT.md includes task-specific prompts ready for immediate execution. No separate QUICK_START.md is provided.
```

### Issue 5: Missing Templates Directory Reference

- **File**: README.md
- **Line(s)**: N/A (missing content)
- **Category**: Compliance
- **Severity**: Minor
- **Problem**: META_SPEC_TEMPLATE shows a `templates/` directory as part of the standard structure. The docking-system spec does not have this directory (only `outputs/` and `handoffs/`). While not strictly required, the README should document what output structure is used.
- **Suggested Fix**: Add after line 121 (before "Entry Point"):
```markdown
## Output Structure

| Directory   | Purpose                              |
|-------------|--------------------------------------|
| `outputs/`  | Phase outputs and progress tracking  |
| `handoffs/` | Inter-phase transition documents     |
| `reports/`  | Review and audit reports             |
```

### Issue 6: Handoffs Directory Not Listed in Quick Reference

- **File**: README.md
- **Line(s)**: 5-13
- **Category**: Entry Point
- **Severity**: Minor
- **Problem**: The handoffs directory contains HANDOFF_P0.md which is critical for understanding the current state, but it is not referenced in the Quick Reference table.
- **Suggested Fix**: Already addressed in Issue 1 suggested fix, but specifically add:
```markdown
| **Current Handoff**   | [`handoffs/HANDOFF_P0.md`](./handoffs/HANDOFF_P0.md)   |
```

### Issue 7: Files to Modify Section Lacks Priority Justification

- **File**: README.md
- **Line(s)**: 92-104
- **Category**: Architecture
- **Severity**: Suggestion
- **Problem**: The "Files to Modify" section lists priorities (P0, P1) but does not explain WHY certain files are P0 vs P1. The dependency chain is implicit but should be explicit for agents.
- **Suggested Fix**: Replace lines 92-104 with:
```markdown
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
```

### Issue 8: Architecture Diagram Lacks Entry Point Annotation

- **File**: README.md
- **Line(s)**: 45-70
- **Category**: Architecture
- **Severity**: Suggestion
- **Problem**: The drop target detection flow diagram is comprehensive but does not annotate which node is the entry point for the Layout view to call. Adding this annotation would help implementers understand the integration point.
- **Suggested Fix**: Modify lines 45-52:
```markdown
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
```

### Issue 9: Context Preservation Strategy References Non-Existent Tool

- **File**: README.md
- **Line(s)**: 114-121
- **Category**: Compliance
- **Severity**: Minor
- **Problem**: Line 117 references "Task agents" but the codebase uses sub-agents via prompts as shown in AGENT_PROMPTS.md. The terminology should be consistent with the actual tooling pattern.
- **Suggested Fix**: Replace lines 114-121 with:
```markdown
## Context Preservation Strategy

This spec uses compressed handoffs to preserve orchestrator context:

1. **Sub-agent delegation**: File reading, code writing, testing delegated via prompts in AGENT_PROMPTS.md
2. **Compressed summaries**: Sub-agent results summarized in `outputs/` before continuing
3. **Phase handoffs**: `handoffs/HANDOFF_P[N].md` captures state between sessions
4. **No direct code writing**: Orchestrator coordinates, never implements
```

### Issue 10: Missing Link to outputs/progress.md

- **File**: README.md
- **Line(s)**: 5-13
- **Category**: Entry Point
- **Severity**: Minor
- **Problem**: The outputs/progress.md file exists and tracks implementation progress, but is not referenced in the Quick Reference table or anywhere in README.md.
- **Suggested Fix**: Add to Quick Reference table:
```markdown
| **Progress Tracker** | [`outputs/progress.md`](./outputs/progress.md)         |
```

## Improvements Not Implemented (Opportunities)

1. **Verification Commands Section**: Unlike CONTEXT.md which has verification commands, README.md lacks a quick reference to the key verification commands. Adding a small section would help agents quickly validate their work.

2. **Related Specs Reference**: The flex-layout-port spec is closely related but not linked. Adding a "Related Specs" section would help agents understand the broader context.

3. **Estimated LOC/Time**: META_SPEC_TEMPLATE examples show line counts and time estimates. Adding rough estimates would help with planning (e.g., "P1: ~200 LOC, ~30 min per task").

4. **Common Pitfalls Section**: The CONTEXT.md has "Common Errors & Fixes" but README.md does not surface the most critical ones. A brief mention would prevent repeated mistakes.

5. **Version/Date Information**: No creation date or last-updated timestamp. Adding this would help track spec freshness.

## Verdict

**NEEDS_FIXES**

The README.md is functional and provides good technical context, but has several compliance gaps with the META_SPEC_TEMPLATE pattern:
- Missing file references in Quick Reference (Major)
- Inconsistent phase labeling (Minor)
- Missing standard sections (Minor)

The spec can be executed as-is, but fixing these issues would improve navigability and consistency with the spec framework. The critical content (objective, architecture, files to modify, success criteria) is present and clear.
