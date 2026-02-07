# P11-D: Custom Features Evaluation

## Overview

**Phase**: P11-D - Custom Features
**Objective**: Evaluate and document decisions for custom Lexical features unique to this project
**Estimated Duration**: 1 day
**Prerequisite**: P11-C Toolbar Modularization (COMPLETE)

---

## P11-C Completion Summary

### Tasks Completed

| Task | Files Created | Status |
|------|---------------|--------|
| ToolbarPlugin analysis | 1383 lines analyzed | COMPLETE |
| Phase 1 extraction | UndoRedoControls, TextFormatButtonGroup, ColorPickerGroup | COMPLETE |
| Phase 2 extraction | FontControls, AdvancedTextFormattingMenu | COMPLETE |
| Toolbar composition | Main index.tsx updated | COMPLETE |

### Results

- **Render section reduction**: ~60% (500 lines → 200 lines)
- **Components extracted**: 5
- **Type check**: Passing

### Components Created in P11-C

| Component | Location | Purpose |
|-----------|----------|---------|
| UndoRedoControls | components/UndoRedoControls.tsx | Undo/redo buttons with keyboard shortcuts |
| TextFormatButtonGroup | components/TextFormatButtonGroup.tsx | Bold, italic, underline, code toggles |
| ColorPickerGroup | components/ColorPickerGroup.tsx | Font color and background color pickers |
| FontControls | components/FontControls.tsx | Font family dropdown + font size controls |
| AdvancedTextFormattingMenu | components/AdvancedTextFormattingMenu.tsx | Strikethrough, subscript, superscript, case transforms |

---

## P11-D Tasks

### Task D1: Audit Custom Nodes

**Purpose**: Document all custom nodes unique to this project (not from Lexical core or shadcn-editor).

**Custom Nodes to Evaluate:**

| Node | File | Decision Needed |
|------|------|-----------------|
| DateTimeNode | nodes/DateTimeNode/ | KEEP - business critical |
| PageBreakNode | nodes/PageBreakNode.tsx | KEEP - print support |
| PollNode | nodes/PollNode.tsx | EVALUATE - usage frequency |
| ExcalidrawNode | nodes/ExcalidrawNode/ | EVALUATE - complexity vs value |
| EquationNode | nodes/EquationNode.tsx | EVALUATE - KaTeX dependency |
| StickyNode | nodes/StickyNode.tsx | EVALUATE - styling complexity |
| FigmaNode | nodes/FigmaNode.tsx | EVALUATE - Figma integration |
| SpecialTextNode | nodes/SpecialTextNode.ts | KEEP - text decorations |

**Sub-agent prompt:**
```
Task: "Audit custom Lexical nodes"

INSTRUCTIONS:
1. For each custom node listed above, read the source file
2. Document:
   - Purpose and functionality
   - Dependencies (external packages, CSS, etc.)
   - Usage frequency (search for imports)
   - Complexity level (simple/medium/high)
3. Make KEEP/REMOVE/REFACTOR recommendation for each
4. Output as markdown table with reasoning

OUTPUT FORMAT:
| Node | Purpose | Dependencies | Complexity | Recommendation | Reasoning |
```

### Task D2: Evaluate Plugin Dependencies

**Purpose**: Identify plugins that depend on custom nodes and assess impact.

**Plugins to Evaluate:**

| Plugin | Custom Node Dependency |
|--------|------------------------|
| PollPlugin | PollNode |
| ExcalidrawPlugin | ExcalidrawNode |
| EquationsPlugin | EquationNode |
| StickyPlugin | StickyNode |
| DateTimePlugin | DateTimeNode |

**Sub-agent prompt:**
```
Task: "Map plugin-to-node dependencies"

INSTRUCTIONS:
1. Read each plugin file
2. Identify which custom nodes it uses
3. Document any shared utilities or components
4. Assess if plugin can be removed without breaking editor

OUTPUT FORMAT:
Dependency graph showing plugin → node → component relationships
```

### Task D3: Document InsertContentMenu Actions

**Purpose**: The InsertContentMenu has 14 insert actions with inconsistent patterns. Document and prioritize.

**Actions to Document:**

1. Insert Image (modal)
2. Insert Inline Image (direct)
3. Insert Table (modal)
4. Insert Poll (modal)
5. Insert Horizontal Rule (direct)
6. Insert Page Break (direct)
7. Insert Excalidraw (direct)
8. Insert Collapsible (direct)
9. Insert DateTime (direct)
10. Insert Embed (loop over types)
11. Insert Equation (modal)
12. Insert GIF (direct)
13. Insert Sticky Note (direct)
14. Insert Layout (modal)

**Sub-agent prompt:**
```
Task: "Document InsertContentMenu patterns"

TARGET: apps/todox/src/app/lexical/plugins/ToolbarPlugin/index.tsx (InsertContentMenu section ~1217-1368)

INSTRUCTIONS:
1. For each insert action, document:
   - Action name
   - Pattern used (modal vs direct dispatch)
   - Command/dialog used
   - Custom node created
2. Identify which actions could be removed without breaking core functionality
3. Recommend standardized pattern for remaining actions

OUTPUT:
1. Table of all actions with patterns
2. Dependency analysis (which nodes/plugins each action requires)
3. Recommended "core" vs "optional" classification
```

### Task D4: Make Final Decisions

**Purpose**: Based on D1-D3 analysis, make final decisions for each custom feature.

**Decision Framework:**

| Category | Criteria | Action |
|----------|----------|--------|
| **KEEP** | Business critical, unique value | Document and maintain |
| **OPTIONAL** | Nice to have, complex dependencies | Extract to separate package |
| **REMOVE** | Low usage, high maintenance | Remove with deprecation notice |

**Sub-agent prompt:**
```
Task: "Finalize custom feature decisions"

INPUTS:
- D1 node audit results
- D2 plugin dependency map
- D3 InsertContentMenu analysis

INSTRUCTIONS:
1. Categorize each custom feature (KEEP/OPTIONAL/REMOVE)
2. For KEEP features: No action needed
3. For OPTIONAL features: Document extraction plan
4. For REMOVE features: List cleanup steps
5. Update CURRENT_STATUS.md with decisions

OUTPUT:
Decision matrix with rationale for each custom feature
```

---

## Exit Criteria

Before marking P11-D complete:

- [ ] All custom nodes audited with decisions
- [ ] Plugin dependencies documented
- [ ] InsertContentMenu actions classified
- [ ] Final decisions made (KEEP/OPTIONAL/REMOVE)
- [ ] CURRENT_STATUS.md updated with decisions
- [ ] `/reflect` has been run
- [ ] HANDOFF_P11-E.md has been created

---

## Verification Commands

```bash
# Type check (should still pass)
bun run check --filter=@beep/todox

# Search for custom node usage
grep -r "DateTimeNode" apps/todox/src/app/lexical/ --include="*.tsx"
grep -r "PollNode" apps/todox/src/app/lexical/ --include="*.tsx"
```

---

## Resources

### Custom Node Locations

| Node | Path |
|------|------|
| DateTimeNode | `apps/todox/src/app/lexical/nodes/DateTimeNode/` |
| PageBreakNode | `apps/todox/src/app/lexical/nodes/PageBreakNode.tsx` |
| PollNode | `apps/todox/src/app/lexical/nodes/PollNode.tsx` |
| ExcalidrawNode | `apps/todox/src/app/lexical/nodes/ExcalidrawNode/` |
| EquationNode | `apps/todox/src/app/lexical/nodes/EquationNode.tsx` |
| StickyNode | `apps/todox/src/app/lexical/nodes/StickyNode.tsx` |
| FigmaNode | `apps/todox/src/app/lexical/nodes/FigmaNode.tsx` |
| SpecialTextNode | `apps/todox/src/app/lexical/nodes/SpecialTextNode.ts` |

### Plugin Locations

| Plugin | Path |
|--------|------|
| PollPlugin | `apps/todox/src/app/lexical/plugins/PollPlugin/` |
| ExcalidrawPlugin | `apps/todox/src/app/lexical/plugins/ExcalidrawPlugin/` |
| EquationsPlugin | `apps/todox/src/app/lexical/plugins/EquationsPlugin/` |
| DateTimePlugin | (inline in nodes or separate?) |

---

## Orchestrator Notes

1. **Sequential execution**: D1 → D2 → D3 → D4 (each depends on previous)
2. **Conservative approach**: Default to KEEP unless strong reason to remove
3. **Focus on documentation**: This phase is primarily about understanding, not changing
4. **Defer removal to P11-E**: Actual cleanup happens in CSS/theme phase

---

## Context Window Management

If you reach approximately 10% of context window remaining:

1. STOP immediately
2. Create `HANDOFF_P11-D-CONTINUATION.md` with:
   - Which tasks are complete (D1-D4)
   - Decisions made so far
   - What remains
   - Exact continuation instructions
3. Output continuation prompt for next session
