# P11-C: UI Plugins (Toolbar Modularization)

## Overview

**Phase**: P11-C - UI Plugins
**Objective**: Modularize the monolithic ToolbarPlugin into smaller, composable components using shadcn UI patterns
**Estimated Duration**: 1-2 days
**Prerequisite**: P11-B Core Plugin Migration (COMPLETE)

---

## P11-B Completion Summary

### Tasks Completed

| Task | Files | Status |
|------|-------|--------|
| Node updates (exportJSON) | 8 nodes | COMPLETE |
| Embed organization | TweetNode, YouTubeNode → embeds/ | COMPLETE |
| Plugin UI updates | 17 files | COMPLETE |
| DropdownMenu render→asChild fix | 5 files (12 instances) | COMPLETE |
| Type error fixes | validation.ts | COMPLETE |

### Key Learnings from P11-B

1. **Don't wholesale copy** - Existing plugins work fine, focus on UI component replacement
2. **asChild pattern required** - shadcn DropdownMenuTrigger needs Button as direct child, not render prop
3. **@lexical/headless type issue** - Use `as any` cast for nodes array due to nested dependency
4. **Preserve superior nodes** - ImageNode, MentionNode, custom nodes have better features
5. **exportJSON pattern** - Always include explicit type/version for serialization

### Files Updated in P11-B

**Nodes (8):**
- KeywordNode.ts, EmojiNode.tsx, AutocompleteNode.tsx
- LayoutContainerNode.ts, LayoutItemNode.ts, MentionNode.ts
- embeds/TweetNode.tsx, embeds/YouTubeNode.tsx

**Plugins/UI (17):**
- ActionsPlugin, AutoEmbedPlugin, CommentPlugin, ImagesPlugin
- InsertLayoutDialog, PollPlugin, TableActionMenuPlugin
- TableHoverActionsV2Plugin, TablePlugin, ToolbarPlugin
- VersionsPlugin, ColorPicker, DropdownColorPicker
- ExcalidrawModal, KatexEquationAlterer, PollComponent, Settings

---

## P11-C Tasks

### Task C1: Analyze Current ToolbarPlugin

**Purpose**: Understand the monolithic toolbar structure before splitting.

**Sub-agent prompt:**
```
Task: "Analyze ToolbarPlugin structure"

TARGET: apps/todox/src/app/lexical/plugins/ToolbarPlugin/index.tsx

INSTRUCTIONS:
1. Read the current ToolbarPlugin file
2. Identify distinct functional areas:
   - Text formatting (bold, italic, underline, etc.)
   - Block type selection (paragraph, headings, lists)
   - Insert actions (link, image, table, etc.)
   - Alignment controls
   - Font/color pickers
3. Document the state dependencies between areas
4. Identify which areas can be extracted as independent components
5. Output a proposed modular structure

OUTPUT FORMAT:
- List of proposed components with their responsibilities
- Shared state that needs to remain in parent
- Recommended extraction order (least dependencies first)
```

### Task C2: Extract Text Formatting Toolbar

**Purpose**: Create a standalone component for text formatting controls.

**Sub-agent prompt:**
```
Task: "Extract TextFormatToolbar component"

SOURCE: apps/todox/src/app/lexical/plugins/ToolbarPlugin/index.tsx
TARGET: apps/todox/src/app/lexical/plugins/ToolbarPlugin/components/TextFormatToolbar.tsx

INSTRUCTIONS:
1. Extract bold, italic, underline, strikethrough, code, subscript, superscript buttons
2. Use shadcn ToggleGroup for grouped buttons
3. Use useToolbarContext() for state
4. Follow shadcn-editor pattern from tmp/shadcn-editor/registry/new-york-v4/editor/plugins/toolbar/

REQUIREMENTS:
- Use @beep/ui components (Toggle, ToggleGroup)
- Import from useToolbarContext for isBold, isItalic, etc.
- Follow existing keyboard shortcuts (Ctrl+B, Ctrl+I, etc.)
- Export as named component
```

### Task C3: Extract Block Type Selector

**Purpose**: Create a standalone component for block type selection.

**Sub-agent prompt:**
```
Task: "Extract BlockTypeSelector component"

SOURCE: apps/todox/src/app/lexical/plugins/ToolbarPlugin/index.tsx
TARGET: apps/todox/src/app/lexical/plugins/ToolbarPlugin/components/BlockTypeSelector.tsx

INSTRUCTIONS:
1. Extract heading/paragraph/list selection dropdown
2. Use shadcn Select component
3. Use useToolbarContext() for blockType state
4. Include icons for each block type

REQUIREMENTS:
- Use @beep/ui Select, SelectTrigger, SelectContent, SelectItem
- Handle h1-h6, paragraph, bullet list, numbered list, check list, quote, code
- Follow existing callback patterns for block type changes
```

### Task C4: Extract Insert Toolbar

**Purpose**: Create a standalone component for insert actions.

**Sub-agent prompt:**
```
Task: "Extract InsertToolbar component"

SOURCE: apps/todox/src/app/lexical/plugins/ToolbarPlugin/index.tsx
TARGET: apps/todox/src/app/lexical/plugins/ToolbarPlugin/components/InsertToolbar.tsx

INSTRUCTIONS:
1. Extract insert actions (link, image, table, horizontal rule, etc.)
2. Use shadcn DropdownMenu for insert menu
3. Connect to existing modal dialogs (InsertImageDialog, InsertTableDialog)

REQUIREMENTS:
- Use @beep/ui DropdownMenu components
- Preserve existing insert logic and dialogs
- Include keyboard shortcuts in menu items
```

### Task C5: Create Modular Toolbar Composition

**Purpose**: Compose extracted components into the main toolbar.

**Sub-agent prompt:**
```
Task: "Compose modular ToolbarPlugin"

TARGET: apps/todox/src/app/lexical/plugins/ToolbarPlugin/index.tsx

INSTRUCTIONS:
1. Import extracted components (TextFormatToolbar, BlockTypeSelector, InsertToolbar)
2. Compose them in the main toolbar layout
3. Use shadcn Separator between component groups
4. Ensure responsive behavior with proper flex/grid
5. Remove duplicated code that's now in child components

REQUIREMENTS:
- Main toolbar should be <100 lines after extraction
- All state management stays in ToolbarContext
- Components are self-contained with clear responsibilities
- Export both composed Toolbar and individual components
```

### Task C6: Update Floating Toolbars

**Purpose**: Apply same modular pattern to floating toolbars.

**Sub-agent prompt:**
```
Task: "Update floating toolbar components"

TARGETS:
- apps/todox/src/app/lexical/plugins/FloatingTextFormatToolbarPlugin/
- apps/todox/src/app/lexical/plugins/FloatingLinkEditorPlugin/

INSTRUCTIONS:
1. Reuse TextFormatToolbar component in floating toolbar
2. Update to use shadcn Popover for positioning
3. Ensure consistent styling with main toolbar

REQUIREMENTS:
- Share components between main and floating toolbars
- Maintain existing positioning logic
- Use shadcn Popover/Tooltip for floating UI
```

---

## Exit Criteria

Before marking P11-C complete:

- [ ] ToolbarPlugin analyzed and structure documented
- [ ] TextFormatToolbar extracted and working
- [ ] BlockTypeSelector extracted and working
- [ ] InsertToolbar extracted and working
- [ ] Main ToolbarPlugin composed from modules
- [ ] Floating toolbars updated (if time permits)
- [ ] `bun run check --filter=@beep/todox` passes
- [ ] Text formatting works in editor
- [ ] Block type selection works
- [ ] Insert actions work
- [ ] `/reflect` has been run
- [ ] HANDOFF_P11-D.md has been created

---

## Verification Commands

```bash
# Type check
bun run check --filter=@beep/todox

# Manual verification
# Start dev server and test:
# 1. Bold/italic/underline formatting
# 2. Heading/list selection
# 3. Insert image/table/link
bun run dev --filter=@beep/todox
```

---

## Resources

### Reference Material

| Resource | Location |
|----------|----------|
| shadcn-editor toolbar | `tmp/shadcn-editor/registry/new-york-v4/editor/plugins/toolbar/` |
| Current ToolbarPlugin | `apps/todox/src/app/lexical/plugins/ToolbarPlugin/` |
| ToolbarContext | `apps/todox/src/app/lexical/context/toolbar-context.tsx` |
| @beep/ui components | `packages/ui/src/components/` |

### shadcn Components to Use

| Component | Usage |
|-----------|-------|
| ToggleGroup | Text format buttons |
| Select | Block type dropdown |
| DropdownMenu | Insert menu |
| Separator | Visual dividers |
| Tooltip | Button hints |
| Popover | Floating toolbars |

### Existing Patterns

- Theme: `apps/todox/src/app/lexical/themes/editor-theme.ts`
- Context: `apps/todox/src/app/lexical/context/toolbar-context.tsx`
- Hooks: `apps/todox/src/app/lexical/hooks/`

---

## Orchestrator Notes

1. **Sequential execution**: C1 must complete before C2-C4
2. **Parallel after C1**: C2, C3, C4 can run in parallel
3. **C5 depends on C2-C4**: Composition requires all components
4. **C6 optional**: Can be deferred to P11-D if time-constrained
5. **Import paths**: Always use `@beep/ui` for shadcn components

---

## Context Window Management

If you reach approximately 10% of context window remaining:

1. STOP immediately
2. Create `HANDOFF_P11-C-CONTINUATION.md` with:
   - Which tasks are complete (C1-C6)
   - Which files have been written
   - What remains
   - Exact continuation instructions
3. Output continuation prompt for next session
