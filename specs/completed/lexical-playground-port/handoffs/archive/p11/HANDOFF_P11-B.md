# P11-B: Core Plugin Migration

## Overview

**Phase**: P11-B - Core Plugins
**Objective**: Copy and wire 21 core Lexical plugins + 9 compatible custom nodes
**Estimated Duration**: 1-2 days
**Prerequisite**: P11-A Foundation (COMPLETE)

---

## P11-A Completion Summary

### Files Created

| File | Purpose |
|------|---------|
| `apps/todox/src/app/lexical/themes/editor-theme.ts` | Theme object with Tailwind classes (3 variants: editorTheme, commentEditorTheme, stickyEditorTheme) |
| `apps/todox/src/app/lexical/themes/editor-theme.css` | Minimal CSS for Lexical-required classes (599 lines) |
| `apps/todox/src/app/lexical/themes/index.ts` | Barrel exports with backward compatibility |
| `apps/todox/src/app/lexical/hooks/useDebounce.ts` | Debounce utility using es-toolkit |
| `apps/todox/src/app/lexical/hooks/useUpdateToolbar.ts` | Selection change listener for toolbar sync |
| `apps/todox/src/app/lexical/hooks/index.ts` | Hooks barrel export |
| `apps/todox/src/app/lexical/context/toolbar-context.tsx` | Unified toolbar context with activeEditor pattern |
| `apps/todox/src/app/lexical/context/index.ts` | Context barrel export |

### Key Learnings from P11-A

1. **Existing CSS variables preserved** - globals.css already had themed OKLCH variables
2. **25% CSS reduction** - 800 lines reduced to 599 via Tailwind classes
3. **Unified toolbar context** - Combined legacy + shadcn-editor patterns
4. **es-toolkit preferred** - Used instead of lodash for debounce

### Verification Status

- `bun run check --filter=@beep/todox` - **PASSING**

---

## P11-B Tasks

### Task B1: Copy Core Plugins (Batch 1)

**Plugins to copy:**
1. RichTextPlugin
2. HistoryPlugin
3. ListPlugin
4. TablePlugin
5. LinkPlugin

**Source**: `tmp/shadcn-editor/registry/new-york-v4/editor/plugins/`
**Target**: `apps/todox/src/app/lexical/plugins/`

**Sub-agent prompt:**
```
Task: "Copy core Lexical plugins batch 1"

REFERENCE MATERIAL:
- Source: tmp/shadcn-editor/registry/new-york-v4/editor/plugins/
- Target: apps/todox/src/app/lexical/plugins/

PLUGINS TO COPY:
1. RichTextPlugin (rich-text-plugin.tsx)
2. HistoryPlugin (history-plugin.tsx)
3. ListPlugin (list-plugin.tsx)
4. TablePlugin (table-plugin.tsx or table/)
5. LinkPlugin (link-plugin.tsx)

INSTRUCTIONS:
1. Read each source plugin file
2. Adapt imports for this project's structure (@beep/todox paths)
3. Update any UI components to use shadcn (Button, Dialog, etc.)
4. Write to target location
5. Create index.ts barrel export if needed

Note: These are pure Lexical plugins with minimal UI - focus on correct wiring.
```

### Task B2: Copy Core Plugins (Batch 2)

**Plugins to copy:**
1. AutoLinkPlugin
2. CheckListPlugin
3. CodeHighlightPlugin
4. TabIndentationPlugin
5. TabFocusPlugin
6. MarkdownShortcutPlugin
7. AutoFocusPlugin
8. ClickableLinkPlugin
9. HorizontalRulePlugin
10. HashtagPlugin

**Sub-agent prompt:**
```
Task: "Copy core Lexical plugins batch 2"

REFERENCE MATERIAL:
- Source: tmp/shadcn-editor/registry/new-york-v4/editor/plugins/
- Target: apps/todox/src/app/lexical/plugins/

PLUGINS TO COPY:
1. AutoLinkPlugin
2. CheckListPlugin
3. CodeHighlightPlugin
4. TabIndentationPlugin
5. TabFocusPlugin
6. MarkdownShortcutPlugin
7. AutoFocusPlugin
8. ClickableLinkPlugin
9. HorizontalRulePlugin
10. HashtagPlugin

INSTRUCTIONS:
1. Read each source plugin
2. Adapt imports for @beep/todox structure
3. Write to target with consistent naming
4. Update barrel exports
```

### Task B3: Copy Compatible Custom Nodes

**Nodes to copy (100% compatible):**
1. AutocompleteNode
2. EmojiNode
3. ImageNode
4. KeywordNode
5. LayoutContainerNode
6. LayoutItemNode
7. MentionNode
8. TweetNode
9. YouTubeNode

**Source**: `tmp/shadcn-editor/registry/new-york-v4/editor/nodes/`
**Target**: `apps/todox/src/app/lexical/nodes/`

**Sub-agent prompt:**
```
Task: "Copy compatible custom nodes"

REFERENCE MATERIAL:
- Source: tmp/shadcn-editor/registry/new-york-v4/editor/nodes/
- Target: apps/todox/src/app/lexical/nodes/

NODES TO COPY:
1. AutocompleteNode
2. EmojiNode
3. ImageNode
4. KeywordNode
5. LayoutContainerNode
6. LayoutItemNode
7. MentionNode
8. TweetNode
9. YouTubeNode

INSTRUCTIONS:
1. Read each source node file
2. Compare with existing nodes in target (may need merge strategy)
3. Adapt imports for project structure
4. Ensure serialization (importJSON/exportJSON) is preserved
5. Write to target location
6. Update PlaygroundNodes.ts registration

IMPORTANT: Some nodes may already exist in target - compare and decide:
- If shadcn version is newer/better: replace
- If existing has custom features: merge
- Document decisions made
```

### Task B4: Create plugins.tsx Composition Layer

**Purpose**: Single composition file that wires all plugins together.

**Sub-agent prompt:**
```
Task: "Create plugin composition layer"

REFERENCE MATERIAL:
- Source: tmp/shadcn-editor/registry/new-york-v4/editor/plugins/plugins.tsx
- Target: apps/todox/src/app/lexical/plugins/plugins.tsx

INSTRUCTIONS:
1. Read the shadcn-editor plugins.tsx pattern
2. Create a composition component that:
   - Renders all core plugins
   - Accepts configuration props for optional features
   - Uses ToolbarContextProvider from context/
3. Ensure proper ordering (some plugins depend on others)
4. Export the composition component

The goal is to have a single <Plugins /> component that can be dropped into the editor.
```

### Task B5: Update nodes.ts Registration

**Purpose**: Ensure all new nodes are registered in the nodes array.

**Sub-agent prompt:**
```
Task: "Update node registration"

TARGET: apps/todox/src/app/lexical/nodes/PlaygroundNodes.ts

INSTRUCTIONS:
1. Read current PlaygroundNodes.ts
2. Add imports for all new nodes from B3
3. Register in the nodes array
4. Ensure no duplicate registrations
5. Verify type compatibility with LexicalComposer
```

---

## Exit Criteria

Before marking P11-B complete:

- [ ] All 21 core plugins copied and adapted
- [ ] All 9 compatible nodes copied/merged
- [ ] plugins.tsx composition layer created
- [ ] PlaygroundNodes.ts updated with new nodes
- [ ] `bun run check --filter=@beep/todox` passes
- [ ] Editor renders with basic toolbar
- [ ] Text formatting works (bold, italic, underline)
- [ ] `/reflect` has been run
- [ ] HANDOFF_P11-C.md has been created

---

## Verification Commands

```bash
# Type check
bun run check --filter=@beep/todox

# Test suite (if tests exist)
bun run test --filter=@beep/todox

# Manual verification
# Start dev server and navigate to /lexical
bun run dev --filter=@beep/todox
```

---

## Resources

### Reference Material

| Resource | Location |
|----------|----------|
| shadcn-editor plugins | `tmp/shadcn-editor/registry/new-york-v4/editor/plugins/` |
| shadcn-editor nodes | `tmp/shadcn-editor/registry/new-york-v4/editor/nodes/` |
| Current plugins | `apps/todox/src/app/lexical/plugins/` |
| Current nodes | `apps/todox/src/app/lexical/nodes/` |
| Synthesis doc | `specs/lexical-playground-port/outputs/00-SYNTHESIS.md` |

### MCP Tools

```typescript
// shadcn registry search
mcp__shadcn__search_items_in_registries({ registries: ["@shadcn-editor"], query: "plugin" })
mcp__shadcn__view_items_in_registries({ items: ["@shadcn-editor/rich-text-plugin"] })
```

### Existing Patterns

- Theme: `apps/todox/src/app/lexical/themes/editor-theme.ts`
- Context: `apps/todox/src/app/lexical/context/toolbar-context.tsx`
- Hooks: `apps/todox/src/app/lexical/hooks/`

---

## Orchestrator Notes

1. **Parallel execution**: B1 and B2 (plugin batches) can run in parallel
2. **Sequential**: B3 depends on B1/B2 completing, B4 depends on all plugins
3. **Merge strategy**: For existing nodes, prefer shadcn version unless existing has custom features
4. **Import paths**: Always use `@beep/todox/...` path aliases, never relative `../../../`

---

## Context Window Management

If you reach approximately 10% of context window remaining:

1. STOP immediately
2. Create `HANDOFF_P11-B-CONTINUATION.md` with:
   - Which tasks are complete (B1-B5)
   - Which files have been written
   - What remains
   - Exact continuation instructions
3. Output continuation prompt for next session
