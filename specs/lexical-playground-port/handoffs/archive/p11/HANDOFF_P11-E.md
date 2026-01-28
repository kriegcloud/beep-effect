# P11-E: Theme & CSS Cleanup

## Overview

**Phase**: P11-E - Theme & CSS
**Objective**: Delete old CSS files, implement P11-D decisions, consolidate styling
**Estimated Duration**: 1 day
**Prerequisite**: P11-D Custom Features Evaluation (COMPLETE)

---

## P11-D Completion Summary

### Decisions Made

| Category | Items | Action |
|----------|-------|--------|
| **KEEP** | DateTimeNode, PageBreakNode, EquationNode | No changes needed |
| **OPTIONAL** | PollNode, ExcalidrawNode, FigmaNode, StickyNode | Document as feature flags |
| **REMOVE** | SpecialTextNode, Insert GIF action | Delete in P11-E |

### Documents Created
- `specs/lexical-playground-port/P11-D_DECISIONS.md` - Full decision matrix

---

## P11-E Tasks

### Task E1: Delete Old CSS Files

**Files to Delete (5):**

| File | Lines | Purpose (Now Replaced) |
|------|-------|------------------------|
| `lexical/index.css` | 1770 | Global styles → editor-theme.css |
| `themes/PlaygroundEditorTheme.css` | 789 | Theme classes → editor-theme.ts |
| `themes/CommentEditorTheme.css` | 7 | Comment styles → editor-theme.ts |
| `themes/StickyEditorTheme.css` | 7 | Sticky styles → editor-theme.ts |
| `plugins/CommentPlugin/index.css` | 437 | Comment plugin → Tailwind classes |

**Sub-agent prompt:**
```
Task: "Delete old CSS files"

INSTRUCTIONS:
1. Delete each file listed above
2. Update any imports that reference these files
3. Verify no broken imports after deletion

FILES TO DELETE:
- apps/todox/src/app/lexical/index.css
- apps/todox/src/app/lexical/themes/PlaygroundEditorTheme.css
- apps/todox/src/app/lexical/themes/CommentEditorTheme.css
- apps/todox/src/app/lexical/themes/StickyEditorTheme.css
- apps/todox/src/app/lexical/plugins/CommentPlugin/index.css

VERIFICATION:
- grep -r "index.css" apps/todox/src/app/lexical/
- grep -r "PlaygroundEditorTheme.css" apps/todox/src/app/lexical/
- bun run check --filter=@beep/todox
```

### Task E2: Remove SpecialTextNode

**Files to Modify:**

| File | Change |
|------|--------|
| `nodes/SpecialTextNode.ts` | DELETE |
| `nodes/PlaygroundNodes.ts` | Remove import and registration |
| Any files importing SpecialTextNode | Remove imports |

**Sub-agent prompt:**
```
Task: "Remove SpecialTextNode"

INSTRUCTIONS:
1. Search for all SpecialTextNode usages: grep -r "SpecialTextNode" apps/todox/
2. Remove from PlaygroundNodes.ts registration
3. Delete nodes/SpecialTextNode.ts
4. Remove any remaining imports
5. Verify type check passes

REASONING: SpecialTextNode has unclear purpose, constrains text insertion, and adds node type fragmentation.
```

### Task E3: Remove Insert GIF Action

**File to Modify:**
- `plugins/ToolbarPlugin/index.tsx` (InsertContentMenu section)

**Sub-agent prompt:**
```
Task: "Remove Insert GIF action"

TARGET: apps/todox/src/app/lexical/plugins/ToolbarPlugin/index.tsx

INSTRUCTIONS:
1. Find the Insert GIF dropdown item in InsertContentMenu
2. Remove the menu item (it's redundant - uses hardcoded cat.gif)
3. Keep the catTypingGif asset import if used elsewhere, otherwise remove
4. Verify type check passes

REASONING: Insert GIF is redundant - it's just INSERT_IMAGE_COMMAND with a hardcoded asset. Users can use Insert Image instead.
```

### Task E4: Update Theme Imports

**Purpose**: Ensure all components use the new editor-theme.ts.

**Sub-agent prompt:**
```
Task: "Update theme imports"

INSTRUCTIONS:
1. Search for old theme imports:
   - grep -r "PlaygroundEditorTheme" apps/todox/src/app/lexical/
   - grep -r "CommentEditorTheme" apps/todox/src/app/lexical/
   - grep -r "StickyEditorTheme" apps/todox/src/app/lexical/
2. Replace with imports from themes/editor-theme.ts:
   - editorTheme (main)
   - commentEditorTheme
   - stickyEditorTheme
3. Verify theme objects are properly structured

NEW IMPORTS:
import { editorTheme, commentEditorTheme, stickyEditorTheme } from "../themes/editor-theme";
```

### Task E5: Consolidate Editor Styles

**Purpose**: Ensure editor-theme.css has all necessary styles.

**Sub-agent prompt:**
```
Task: "Audit editor-theme.css completeness"

TARGET: apps/todox/src/app/lexical/themes/editor-theme.css

INSTRUCTIONS:
1. Read editor-theme.css (599 lines)
2. Compare with deleted CSS files for any missing critical styles
3. Verify these categories are covered:
   - Syntax highlighting (code blocks)
   - Table styling
   - Checkbox styling
   - List styling
   - Link styling
4. Report any missing styles that need to be added

OUTPUT:
List of missing styles (if any) with recommended additions
```

---

## Exit Criteria

Before marking P11-E complete:

- [ ] 5 old CSS files deleted
- [ ] SpecialTextNode removed
- [ ] Insert GIF action removed
- [ ] Theme imports updated
- [ ] editor-theme.css verified complete
- [ ] `bun run check --filter=@beep/todox` passes
- [ ] Editor renders correctly (visual verification)
- [ ] `/reflect` has been run
- [ ] HANDOFF_P11-F.md has been created

---

## Verification Commands

```bash
# Type check
bun run check --filter=@beep/todox

# Verify CSS deletions
ls apps/todox/src/app/lexical/themes/
# Should only have: editor-theme.css, editor-theme.ts, index.ts

# Verify no broken imports
grep -r "PlaygroundEditorTheme.css" apps/todox/src/app/lexical/
grep -r "CommentEditorTheme.css" apps/todox/src/app/lexical/
grep -r "StickyEditorTheme.css" apps/todox/src/app/lexical/
grep -r "SpecialTextNode" apps/todox/src/app/lexical/

# Manual verification
bun run dev --filter=@beep/todox
# Navigate to /lexical and verify editor renders correctly
```

---

## Expected Metrics After P11-E

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| CSS Files | 6 | 1 | -83% |
| CSS Lines | ~3000 | ~600 | -80% |
| Custom Nodes | 8 | 7 | -12.5% |
| Insert Actions | 16 | 15 | -6% |

---

## Orchestrator Notes

1. **Sequential execution**: E1 → E2 → E3 → E4 → E5 (dependencies between tasks)
2. **Visual verification required**: After E1, manually check editor renders
3. **Backup before deletion**: Consider git stash if unsure
4. **E5 is audit only**: May not require changes if editor-theme.css is complete

---

## Context Window Management

If you reach approximately 10% of context window remaining:

1. STOP immediately
2. Create `HANDOFF_P11-E-CONTINUATION.md` with:
   - Which tasks are complete (E1-E5)
   - Which files have been deleted/modified
   - What remains
   - Exact continuation instructions
3. Output continuation prompt for next session
