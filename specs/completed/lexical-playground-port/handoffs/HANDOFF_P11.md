# P11: shadcn-native Lexical Editor Migration

## Overview

**Phase**: P11 - Full shadcn Integration
**Objective**: Migrate from custom CSS/UI to 100% shadcn-native Lexical editor
**Duration**: 8-10 days (without collaboration), 13-17 days (with)
**Risk Level**: Medium

## Background

A complete shadcn-based Lexical editor implementation has been identified at [shadcn-editor](https://shadcn-editor.vercel.app/). The source code is cloned to `tmp/shadcn-editor/` for reference. This implementation provides:

- 100% shadcn UI components (Button, Dialog, DropdownMenu, etc.)
- CSS Variables + Tailwind v4 theming
- Modular plugin architecture
- Registry-based installation via shadcn CLI

## Synthesis Summary

See `specs/lexical-playground-port/outputs/00-SYNTHESIS.md` for complete analysis.

### Key Metrics

| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| Files | 248 | 128 | 48% reduction |
| CSS Files | 5 | 1 | 80% reduction |
| Custom Nodes | 20 | 8 | 60% reduction |
| UI Components | Custom | 100% shadcn | Modern tooling |

### Migration Scope

**Replace (100% compatible)**:
- 21 core Lexical plugins
- 9 custom nodes (Emoji, Image, Mention, Tweet, YouTube, Layout, Keyword, Autocomplete)

**Rebuild (shadcn-native)**:
- 12 UI-heavy plugins (Toolbar, Floating, Actions, etc.)
- All custom UI components (Button, Dialog, DropDown, Switch, TextInput)

**Keep (Custom)**:
- DateTimeNode, PageBreakNode (business critical)
- Evaluate: PollNode, ExcalidrawNode, EquationNode, StickyNode, FigmaNode

**Delete**:
- 5 CSS files (index.css, PlaygroundEditorTheme.css, CommentEditorTheme.css, StickyEditorTheme.css, CommentPlugin/index.css)
- Custom UI components duplicating shadcn

## Sub-Phases

### P11-A: Foundation (2 days)

**Objective**: Establish base structure, CSS variables, Tailwind v4 configuration

**Tasks**:
1. Copy shadcn-editor base structure:
   - `tmp/shadcn-editor/registry/new-york-v4/editor/themes/` → target
   - `tmp/shadcn-editor/registry/new-york-v4/editor/editor-ui/` → target
   - `tmp/shadcn-editor/registry/new-york-v4/editor/context/` → target
   - `tmp/shadcn-editor/registry/new-york-v4/editor/editor-hooks/` → target

2. Configure CSS Variables in globals.css:
   ```css
   :root {
     --radius: 0.625rem;
     --background: oklch(1 0 0);
     --foreground: oklch(0.145 0 0);
     /* ... full OKLCH variable set */
   }
   .dark {
     --background: oklch(0.145 0 0);
     /* ... dark mode overrides */
   }
   ```

3. Update Tailwind configuration for v4

4. Create minimal editor entry point with base nodes

**Exit Criteria**:
- `bun run check` passes
- Editor renders without plugins
- Dark mode toggles correctly

**Next Phase Handoff**: Create HANDOFF_P11-B.md

### P11-B: Core Plugin Migration (1-2 days)

**Objective**: Copy and wire 21 core plugins + 9 compatible nodes

**Tasks**:
1. Copy plugins from `tmp/shadcn-editor/registry/new-york-v4/editor/plugins/`:
   - RichTextPlugin, HistoryPlugin, ListPlugin, TablePlugin
   - LinkPlugin, AutoLinkPlugin, CheckListPlugin, CodeHighlightPlugin
   - TabIndentationPlugin, TabFocusPlugin, ImagesPlugin, MentionsPlugin
   - EmojisPlugin, KeywordsPlugin, LayoutPlugin, DraggableBlockPlugin
   - MarkdownShortcutPlugin, AutoFocusPlugin, ClickableLinkPlugin
   - HorizontalRulePlugin, HashtagPlugin

2. Copy nodes from `tmp/shadcn-editor/registry/new-york-v4/editor/nodes/`:
   - AutocompleteNode, EmojiNode, ImageNode, KeywordNode
   - LayoutContainerNode, LayoutItemNode, MentionNode
   - TweetNode, YouTubeNode

3. Create plugins.tsx composition layer

4. Register all nodes in nodes array

**Exit Criteria**:
- Toolbar renders
- Text formatting works (bold, italic, etc.)
- Serialization roundtrip successful
- `bun run check && bun run test` passes

**Next Phase Handoff**: Create HANDOFF_P11-C.md

### P11-C: UI Plugin Migration (1-2 days)

**Objective**: Replace custom UI with shadcn components

**Tasks**:
1. Copy floating plugins:
   - FloatingTextFormatToolbarPlugin
   - FloatingLinkEditorPlugin

2. Copy toolbar plugins (17 files from `plugins/toolbar/`):
   - BlockFormatToolbarPlugin, FontFormatToolbarPlugin
   - FontSizeToolbarPlugin, FontFamilyToolbarPlugin
   - FontColorToolbarPlugin, LinkToolbarPlugin
   - ElementFormatToolbarPlugin, SubSuperToolbarPlugin
   - ClearFormattingToolbarPlugin, HistoryToolbarPlugin
   - CodeLanguageToolbarPlugin, BlockInsertPlugin

3. Copy picker plugins (from `plugins/picker/`):
   - ComponentPickerMenuPlugin, HeadingPickerPlugin
   - ImagePickerPlugin, TablePickerPlugin, etc.

4. Replace custom UI components:
   - Delete `ui/Button.tsx` → use `@/components/ui/button`
   - Delete `ui/Dialog.tsx` → use `@/components/ui/dialog`
   - Delete `ui/DropDown.tsx` → use `@/components/ui/dropdown-menu`
   - Delete `ui/Switch.tsx` → use `@/components/ui/switch`
   - Delete `ui/TextInput.tsx` → use `@/components/ui/input`

**Exit Criteria**:
- Floating toolbar appears on selection
- "/" command menu works
- Modal dialogs render correctly
- All formatting buttons work

**Next Phase Handoff**: Create HANDOFF_P11-D.md

### P11-D: Custom Feature Integration (1-2 days)

**Objective**: Evaluate and migrate custom features

**Tasks**:
1. Decision checkpoint for custom nodes:
   - **KEEP**: DateTimeNode, PageBreakNode
   - **EVALUATE**: PollNode, ExcalidrawNode, EquationNode, StickyNode, FigmaNode

2. Migrate keeper nodes to new structure

3. Adapt remaining plugins to shadcn patterns:
   - CommentPlugin (if keeping)
   - TreeViewPlugin
   - AutocompletePlugin integration with picker

4. Document decisions in DECISIONS.md

**Exit Criteria**:
- All kept custom features work
- All features serializable
- Decisions documented

**Next Phase Handoff**: Create HANDOFF_P11-E.md

### P11-E: Theme & CSS Migration (1 day)

**Objective**: Consolidate to single CSS file + icons

**Tasks**:
1. Delete old CSS files:
   - `apps/todox/src/app/lexical/index.css`
   - `apps/todox/src/app/lexical/themes/PlaygroundEditorTheme.css`
   - `apps/todox/src/app/lexical/themes/CommentEditorTheme.css`
   - `apps/todox/src/app/lexical/themes/StickyEditorTheme.css`
   - `apps/todox/src/app/lexical/plugins/CommentPlugin/index.css`

2. Create `editor-theme.css` with only Lexical-required classes:
   - Code block styling (`.EditorTheme__code`)
   - Syntax highlighting tokens (`.EditorTheme__token*`)
   - Table styling (`.EditorTheme__table*`)

3. Replace icons with Lucide React:
   - Install: `bun add lucide-react`
   - Map all icon usage

**Exit Criteria**:
- Only 1 CSS file remains
- Dark mode works via CSS variables
- All icons display correctly

**Next Phase Handoff**: Create HANDOFF_P11-F.md

### P11-F: Testing & Documentation (1 day)

**Objective**: Verify migration and update docs

**Tasks**:
1. Run test suite: `bun run test`
2. Visual testing:
   - Light/dark mode switching
   - Toolbar responsiveness
   - All formatting options
   - Image upload/resize
   - Table creation/editing
   - Embed rendering

3. Update documentation:
   - Update CLAUDE.md with new patterns
   - Create plugin extension guide
   - Update README with migration notes

4. Update CURRENT_STATUS.md

**Exit Criteria**:
- All tests pass
- Visual verification complete
- Documentation updated

---

## Resources

### Reference Material

| Resource | Location |
|----------|----------|
| shadcn-editor source | `tmp/shadcn-editor/` |
| Exploration reports | `specs/lexical-playground-port/outputs/` |
| Synthesis document | `specs/lexical-playground-port/outputs/00-SYNTHESIS.md` |

### MCP Tools

```typescript
// shadcn-mcp - Registry exploration
mcp__shadcn__list_items_in_registries({ registries: ["@shadcn-editor"] })
mcp__shadcn__search_items_in_registries({ registries: ["@shadcn-editor"], query: "toolbar" })
mcp__shadcn__view_items_in_registries({ items: ["@shadcn-editor/toolbar-plugin"] })
mcp__shadcn__get_add_command_for_items({ items: ["@shadcn-editor/editor-x"] })
```

### Skills

| Skill | Use Case |
|-------|----------|
| `.claude/skills/new-feature` | Implementing custom features |
| `.claude/skills/write-test` | Writing tests for migrations |
| `.claude/skills/reflect` | End-of-phase reflection |

### Commands

```bash
bun run check                 # TypeScript validation
bun run lint:fix              # Code formatting
bun run test                  # Test suite
bun run build                 # Build project
```

---

## Orchestrator Guidelines

### Role

You are the **orchestrator** for P11 migration. You coordinate work by:
1. Reading synthesized reports (NOT raw source files)
2. Spawning sub-agents to write files
3. Tracking progress via TodoWrite
4. Creating handoff documents for subsequent phases

### Sub-Agent Delegation

**For file creation/modification**, spawn agents with:
```
Task tool → subagent_type: "effect-code-writer" or "Explore"
```

**For research**, spawn agents with:
```
Task tool → subagent_type: "Explore" or "codebase-researcher"
```

### Context Window Management

**CRITICAL**: If you reach 10% of context window remaining:
1. STOP current work immediately
2. Document current state in handoff
3. Create continuation prompt
4. Save to `HANDOFF_P11-CONTINUATION.md`

### Reflection Protocol

At the end of each sub-phase:
1. Use `/reflect` skill to capture learnings
2. Update spec with improvements
3. Create next phase handoff document
4. Mark phase complete only when handoff exists

---

## Success Criteria

### Must Have
- [ ] All core features work
- [ ] Serialization compatible with current data
- [ ] Light/dark mode functional
- [ ] TypeScript errors resolved
- [ ] Tests pass

### Should Have
- [ ] DateTimeNode and PageBreakNode working
- [ ] Documentation updated

### Could Have
- [ ] All custom features migrated (Poll, Excalidraw, etc.)
- [ ] Collaboration support

---

## File Checklist

### Phase A
- [ ] `editor-theme.ts` - Theme object with Tailwind classes
- [ ] `editor-theme.css` - Lexical-only CSS classes
- [ ] `content-editable.tsx` - Editor content area
- [ ] `toolbar-context.tsx` - Toolbar state context
- [ ] `use-modal.tsx`, `use-update-toolbar.ts` - Hooks

### Phase B
- [ ] 21 core plugin files
- [ ] 9 node files
- [ ] `plugins.tsx` - Composition layer
- [ ] `nodes.ts` - Node registration

### Phase C
- [ ] 17 toolbar plugin files
- [ ] 15 picker plugin files
- [ ] 2 floating plugin files
- [ ] Updated component imports

### Phase D
- [ ] Custom node migrations
- [ ] DECISIONS.md

### Phase E
- [ ] Deleted 5 CSS files
- [ ] Created editor-theme.css
- [ ] Icon migration complete

### Phase F
- [ ] Tests passing
- [ ] Documentation updated
- [ ] CURRENT_STATUS.md updated
