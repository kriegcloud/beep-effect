# SYNTHESIS: shadcn-editor Migration Strategy for beep-effect2

**Status**: Phase Planning Complete
**Recommended Approach**: Phased migration with registry-based installation
**Estimated Effort**: 8-10 days without collaboration, 13-17 days with
**Risk Level**: Medium (well-scoped dependencies)

---

## Executive Summary

The shadcn-editor provides a **production-ready, 100% shadcn-native Lexical integration** that reduces the current codebase from 248 files to 128 files (48% reduction), eliminates 5 CSS files, and modernizes to Tailwind v4 + CSS variables. The source is available in `tmp/shadcn-editor/` with a complete registry system for modular installation.

### Key Metrics

| Metric | Current | shadcn-editor | Improvement |
|--------|---------|---------------|------------|
| **Files** | 248 | 128 | 48% reduction |
| **CSS Files** | 5 | 1 | 80% reduction |
| **Custom Nodes** | 20 | 8 | 60% reduction (12 kept via custom) |
| **Plugins** | 43 mixed | 21 core + modular | Better organization |
| **UI Components** | Custom | 100% shadcn | Modern tooling |
| **Styling** | CSS + Tailwind v3 | CSS variables + Tailwind v4 | Better dark mode |

### What Changes

- **Reuse**: 21 core plugins + 9 custom nodes transfer directly (100% compatible)
- **Rebuild**: 12 UI-heavy plugins (toolbar, floating, actions) → shadcn-native
- **Keep**: 8 custom nodes (Poll, Excalidraw, DateTime, etc.) stay as-is initially
- **Delete**: 5 CSS files, custom UI components (Button, Dialog, etc.)
- **Add**: CSS variables system, Tailwind v4, modern icon library (Lucide)

---

## 1. Architecture Comparison

### Current Architecture (Monolithic)

```
apps/todox/src/app/lexical/
├── index.tsx (monolithic entry)
├── plugins/ (43 files mixed organization)
├── nodes/ (20 files, some redundant)
├── ui/ (7 custom components duplicating shadcn)
├── themes/ (5 CSS files, manual light/dark)
└── utils/ (12 utility files)
```

### shadcn-editor Architecture (Modular)

```
registry/new-york-v4/editor/
├── index.tsx (clean entry point)
├── plugins/
│   ├── plugins.tsx (composition layer)
│   ├── toolbar/ (17 focused files)
│   ├── actions/ (11 modular files)
│   ├── picker/ (15 menu files)
│   └── embeds/ (4 embed files)
├── nodes/ (8 custom implementations)
├── context/ (toolbar state)
├── editor-hooks/ (reusable hooks)
├── editor-ui/ (only custom: resizer, content-editable)
└── themes/ (single editor-theme.ts + CSS)
```

### Key Structural Benefits

1. **Plugin Organization**: Toolbar plugins grouped, reduces cognitive load
2. **Reusability**: Hooks for common patterns (useUpdateToolbar, useModal)
3. **Tree-shaking**: Unused plugins can be removed from bundle
4. **Theme Flexibility**: CSS variables enable multi-theme support
5. **Component Composition**: Nested plugins reduce prop drilling

---

## 2. Migration Strategy: Phased Approach

### Recommended Method: Registry-Based Installation

Use the **shadcn CLI** with the @shadcn-editor registry:

```bash
# 1. Add registry to components.json
{
  "registries": {
    "@shadcn-editor": {
      "url": "https://shadcn-editor.vercel.app/r"
    }
  }
}

# 2. Install foundation block
npx shadcn@latest add @shadcn-editor/editor-x

# 3. Or install individual plugins as needed
npx shadcn@latest add @shadcn-editor/toolbar-plugin
```

---

## 3. Component Inventory

### Nodes: Directly Replaceable (9 nodes)

| Node | Status | Notes |
|------|--------|-------|
| AutocompleteNode | ✅ Replace | Identical API |
| EmojiNode | ✅ Replace | Identical API |
| ImageNode | ✅ Replace | Enhanced in shadcn |
| KeywordNode | ✅ Replace | Identical API |
| LayoutContainerNode | ✅ Replace | Identical API |
| LayoutItemNode | ✅ Replace | Identical API |
| MentionNode | ✅ Replace | Identical API |
| TweetNode | ✅ Replace | Identical API |
| YouTubeNode | ✅ Replace | Identical API |

### Nodes: Keep Custom (8 nodes)

| Node | Decision | Notes |
|------|----------|-------|
| **DateTimeNode** | KEEP | Business critical |
| **PageBreakNode** | KEEP | Printing support |
| PollNode | EVALUATE | Specialty feature |
| ExcalidrawNode | EVALUATE | Drawing integration |
| EquationNode | EVALUATE | KaTeX math |
| SpecialTextNode | EVALUATE | Styling variant |
| StickyNode | EVALUATE | UI feature |
| FigmaNode | EVALUATE | Design embed |

### Plugins: Core (21 - 100% compatible)

RichTextPlugin, HistoryPlugin, ListPlugin, TablePlugin, LinkPlugin, AutoLinkPlugin, CheckListPlugin, CodeHighlightPlugin, TabIndentationPlugin, TabFocusPlugin, ImagesPlugin, MentionsPlugin, EmojisPlugin, KeywordsPlugin, LayoutPlugin, DraggableBlockPlugin, MarkdownShortcutPlugin, AutoFocusPlugin, ClickableLinkPlugin, HorizontalRulePlugin, HashtagPlugin

### Plugins: Needs Rebuild (12)

ToolbarPlugin, FloatingLinkEditorPlugin, FloatingTextFormatToolbarPlugin, ComponentPickerMenuPlugin, ContextMenuPlugin, CodeActionMenuPlugin, ActionsPlugin, TableActionMenuPlugin, TableHoverActionsPlugin, CommentPlugin, TreeViewPlugin, AutocompletePlugin

### UI Components: Delete (Use shadcn)

Button.tsx → shadcn Button
Dialog.tsx → shadcn Dialog
DropDown.tsx → shadcn DropdownMenu
Switch.tsx → shadcn Switch
TextInput.tsx → shadcn Input

---

## 4. Theming & Styling

### CSS Variables Strategy (OKLCH)

```css
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  /* ... */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
}
```

### Files to Delete (5)
- index.css
- PlaygroundEditorTheme.css
- CommentEditorTheme.css
- StickyEditorTheme.css
- CommentPlugin/index.css

### New CSS Structure (1 file)
- editor-theme.css (Lexical-required classes only)

---

## 5. Phase Structure

| Phase | Duration | Activities |
|-------|----------|------------|
| **A: Foundation** | 2 days | Copy base structure, CSS variables, Tailwind v4 |
| **B: Core Plugins** | 1-2 days | Copy 21 plugins, 9 nodes, wire composition |
| **C: UI Plugins** | 1-2 days | Floating plugins, toolbar plugins, shadcn replacement |
| **D: Custom Features** | 1-2 days | Evaluate keeper nodes, adapt 12 plugins |
| **E: Theme & CSS** | 1 day | Delete old CSS, icon migration, dark mode |
| **F: Testing & Docs** | 1 day | Unit/integration tests, documentation |
| **G: Collaboration** | 3-5 days | Optional: real-time cursors, presence |

**Total**: 8-10 days (without collaboration)

---

## 6. Tools & Resources

### shadcn-mcp Integration

```typescript
// List available plugins
mcp__shadcn__list_items_in_registries({
  registries: ["@shadcn-editor"]
})

// Search for plugins
mcp__shadcn__search_items_in_registries({
  registries: ["@shadcn-editor"],
  query: "toolbar"
})
```

### Source Reference

Full source: `tmp/shadcn-editor/`

Key directories:
- `registry/new-york-v4/editor/` - Main editor
- `registry/new-york-v4/editor/plugins/` - 40+ plugins
- `registry/new-york-v4/editor/nodes/` - 9 nodes
- `public/r/` - 91 registry JSON files

### Skills to Use

- `.claude/skills/new-feature` - Custom feature implementation
- `.claude/skills/write-test` - Testing migrations
- `shadcn-mcp` - Registry exploration

---

## 7. Critical Decisions

| Decision | Options | Impact | Timeline |
|----------|---------|--------|----------|
| Keep Poll? | Keep/Remove | 1 day if keep | Phase D |
| Excalidraw? | Keep/Remove | 1 day if keep | Phase D |
| Equation? | Keep/Remove | 1 day if keep | Phase D |
| Comments? | Rebuild/Remove | 2 days if rebuild | Phase D |
| Collaboration? | Include/Defer | +5-7 days | Post-Phase F |

---

## 8. Success Criteria

### Must Have
- All core features work
- Lexical v0.35.0 API compatible
- Editor state serialization works
- Light/dark modes functional
- TypeScript coverage complete
- Tests pass

### Should Have
- Custom feature set (Poll, Excalidraw, DateTime)
- Enhanced documentation

### Could Have
- Collaboration support
- Multiple color themes

---

## Key References

| Document | Location |
|----------|----------|
| Core Structure Report | `outputs/01-editor-core-structure.md` |
| Plugin Architecture Report | `outputs/02-plugin-architecture.md` |
| Theming Report | `outputs/03-theming-styling.md` |
| Node System Report | `outputs/04-node-system.md` |
| Migration Comparison | `outputs/05-migration-comparison.md` |
| Registry System Report | `outputs/06-registry-system.md` |
| shadcn-editor source | `tmp/shadcn-editor/` |

---

## Conclusion

The shadcn-editor migration is **technically feasible and strategically beneficial**:

- **Reduces complexity**: 48% fewer files, 80% less CSS
- **Improves maintainability**: Modular architecture
- **Modernizes tooling**: Tailwind v4, CSS variables, Lucide icons
- **Preserves functionality**: 21 plugins + 9 nodes transfer directly

**Recommended action**: Proceed with Phase A foundation work (2 days) to establish clean baseline.
