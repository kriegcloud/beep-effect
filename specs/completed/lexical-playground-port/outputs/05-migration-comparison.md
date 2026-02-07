# Migration Comparison: Current Lexical vs shadcn-editor

## Executive Summary

Comprehensive gap analysis comparing the current Lexical implementation with shadcn-editor.

### Codebase Metrics

| Metric | Current | shadcn-editor | Change |
|--------|---------|---------------|--------|
| Total Files | ~248 | ~128 | **48% reduction** |
| CSS Files | 5 | 1 | **80% reduction** |
| Plugins | 43 | 21 core + 13 organized | Restructured |
| Custom Nodes | 20 | 8 | **60% reduction** |

## 1. Node Comparison

### Directly Replaceable (9 nodes - 100% compatible)

| Current Node | shadcn-editor Node | Status |
|--------------|-------------------|--------|
| AutocompleteNode | AutocompleteNode | ✅ Direct replacement |
| EmojiNode | EmojiNode | ✅ Direct replacement |
| ImageNode | ImageNode | ✅ Direct replacement |
| KeywordNode | KeywordNode | ✅ Direct replacement |
| LayoutContainerNode | LayoutContainerNode | ✅ Direct replacement |
| LayoutItemNode | LayoutItemNode | ✅ Direct replacement |
| MentionNode | MentionNode | ✅ Direct replacement |
| TweetNode | TweetNode | ✅ Direct replacement |
| YouTubeNode | YouTubeNode | ✅ Direct replacement |

### Needs Decision (8 nodes - custom features)

| Current Node | shadcn-editor | Recommendation |
|--------------|---------------|----------------|
| PollNode | ❌ Not present | Keep or remove? Business decision |
| ExcalidrawNode | ❌ Not present | Keep if drawing needed |
| EquationNode | ❌ Not present | Keep if math needed |
| DateTimeNode | ❌ Not present | **Keep** - business critical |
| SpecialTextNode | ❌ Not present | Evaluate usage |
| StickyNode | ❌ Not present | Keep if sticky notes needed |
| PageBreakNode | ❌ Not present | **Keep** - printing support |
| FigmaNode | ❌ Not present | Keep if design embeds needed |

### Standard Lexical Nodes (shared)

Both use: HeadingNode, ParagraphNode, TextNode, QuoteNode, ListNode, ListItemNode, LinkNode, TableNode, TableCellNode, TableRowNode, CodeNode, CodeHighlightNode, HorizontalRuleNode, AutoLinkNode, HashtagNode, OverflowNode

## 2. Plugin Comparison

### Directly Replaceable (21 plugins - 100% compatible)

| Plugin | Notes |
|--------|-------|
| RichTextPlugin | Core - identical |
| HistoryPlugin | Core - identical |
| ListPlugin | Core - identical |
| TablePlugin | Core - identical |
| LinkPlugin | Core - identical |
| AutoLinkPlugin | Core - identical |
| ClickableLinkPlugin | Core - identical |
| CheckListPlugin | Core - identical |
| HorizontalRulePlugin | Core - identical |
| TabIndentationPlugin | Core - identical |
| TabFocusPlugin | Core - identical |
| HashtagPlugin | Core - identical |
| CodeHighlightPlugin | Core - identical |
| MarkdownShortcutPlugin | Core - identical |
| AutoFocusPlugin | Core - identical |
| ImagesPlugin | Core - identical |
| MentionsPlugin | Core - identical |
| EmojisPlugin | Core - identical |
| KeywordsPlugin | Core - identical |
| LayoutPlugin | Core - identical |
| DraggableBlockPlugin | Core - identical |

### Needs Rebuild (12 plugins)

| Current Plugin | shadcn-editor Equivalent | Action |
|----------------|-------------------------|--------|
| ToolbarPlugin | Modular toolbar plugins | Rebuild with shadcn |
| FloatingLinkEditorPlugin | FloatingLinkEditorPlugin | Adapt to shadcn |
| FloatingTextFormatToolbarPlugin | FloatingTextFormatToolbarPlugin | Adapt to shadcn |
| ComponentPickerMenuPlugin | ComponentPickerMenuPlugin | Adapt to shadcn |
| ContextMenuPlugin | ContextMenuPlugin | Adapt to shadcn |
| CodeActionMenuPlugin | CodeActionMenuPlugin | Adapt to shadcn |
| ActionsPlugin | ActionsPlugin | Adapt to shadcn |
| TableActionMenuPlugin | Table toolbar plugins | Rebuild |
| TableHoverActionsPlugin | Built into Table plugins | Remove (merged) |
| CommentPlugin | ❌ Not present | Keep custom or remove |
| TreeViewPlugin | TreeViewPlugin | Adapt to shadcn |
| AutocompletePlugin | AutocompletePlugin | Adapt to shadcn |

### Should Remove (10 plugins - playground/debug)

| Plugin | Reason |
|--------|--------|
| DocsPlugin | Playground documentation |
| SpeechToTextPlugin | Rarely used feature |
| ShareContentPlugin | Playground feature |
| TypingPerfPlugin | Development debugging |
| TestRecorderPlugin | Development testing |
| ActionsDebugPlugin | Development debugging |
| CollaborationPlugin | Complex, may not need |
| StickyPlugin | If StickyNode removed |
| ExcalidrawPlugin | If ExcalidrawNode removed |
| EquationPlugin | If EquationNode removed |

## 3. UI Component Comparison

### Directly Replaceable

| Current | shadcn-editor | Action |
|---------|---------------|--------|
| ContentEditable | ContentEditable | ✅ Replace |
| ImageResizer | ImageResizer | ✅ Replace |
| - | ImageComponent | ✅ Enhanced version |

### Needs Adaptation

| Current | shadcn Equivalent | Action |
|---------|-------------------|--------|
| Button.tsx | shadcn Button | Delete, use shadcn |
| Dialog.tsx | shadcn Dialog | Delete, use shadcn |
| DropDown.tsx | shadcn DropdownMenu | Delete, use shadcn |
| Switch.tsx | shadcn Switch | Delete, use shadcn |
| TextInput.tsx | shadcn Input | Delete, use shadcn |
| ColorPicker.tsx | shadcn ColorPicker | Replace (enhanced) |

### Keep Custom

| Component | Reason |
|-----------|--------|
| EquationEditor | KaTeX integration |
| ExcalidrawModal | Excalidraw integration |
| FileInput | Custom file handling |
| FlashMessage | Custom notification |

## 4. Architecture Changes

### Current Architecture (Monolithic)

```
Editor.tsx
├── All 43 plugins imported directly
├── All nodes registered inline
├── Single toolbar implementation
└── Single CSS file per theme
```

### shadcn Architecture (Modular)

```
Editor/
├── index.tsx (Entry point)
├── plugins/
│   ├── plugins.tsx (Composition)
│   ├── toolbar/ (17 modular plugins)
│   ├── actions/ (11 modular plugins)
│   ├── picker/ (15 modular plugins)
│   └── embeds/ (4 modular plugins)
├── nodes/
├── context/
├── editor-hooks/
├── editor-ui/
└── themes/
```

**Benefits of shadcn Architecture**:
- Cleaner separation of concerns
- Easier feature toggling
- Better maintainability
- Smaller bundle with tree-shaking

## 5. CSS Migration

### Files to Delete (5)

| File | Reason |
|------|--------|
| `index.css` | UI styles → Tailwind |
| `PlaygroundEditorTheme.css` | Theme → Tailwind |
| `CommentEditorTheme.css` | → Merged to theme |
| `StickyEditorTheme.css` | → Merged to theme |
| `CommentPlugin/index.css` | → Tailwind |

### New CSS Structure (1 file)

| File | Content |
|------|---------|
| `editor-theme.css` | Only Lexical-required classes (code, tables, collapsibles) |

### Styling Approach

| Category | Method |
|----------|--------|
| Text formatting | Tailwind via theme object |
| Code blocks | CSS classes (syntax highlighting) |
| Tables | CSS classes (resizers, selection) |
| UI Components | shadcn components (Button, Dropdown, etc.) |
| Icons | Lucide React |

## 6. Critical Decisions Required

| Decision | Impact | Effort |
|----------|--------|--------|
| **Collaboration?** | +5-7 days if kept | High |
| **Custom Features?** | Each: 1-2 days | Medium |
| **Settings Panel?** | Dev-only rebuild | Low |
| **Code Highlighting?** | Consolidate to Shiki | Low |

## 7. Effort Estimation

| Phase | Activity | Days |
|-------|----------|------|
| **Phase 1** | Copy shadcn base, swap 9 nodes + 21 plugins | 2-3 |
| **Phase 2** | Custom features, rebuild 12 plugins | 3-5 |
| **Phase 3** | Polish, test, documentation | 2-3 |
| **Phase 4** | Collaboration (optional) | 5-7 |
| **TOTAL** | Without collab | **8-10 days** |

## 8. Migration Checklist

### Phase 1: Foundation
- [ ] Copy shadcn-editor base structure
- [ ] Set up Tailwind v4 + CSS variables
- [ ] Replace 9 compatible nodes
- [ ] Replace 21 compatible plugins
- [ ] Delete 5 CSS files, create editor-theme.css

### Phase 2: Custom Features
- [ ] Decide: Keep/remove Poll, Excalidraw, Equation, Sticky, Figma
- [ ] Migrate DateTimeNode
- [ ] Migrate PageBreakNode
- [ ] Rebuild 12 plugins with shadcn
- [ ] Migrate CommentPlugin (if keeping)

### Phase 3: Polish
- [ ] Delete unused UI components
- [ ] Replace icons with Lucide
- [ ] Visual testing
- [ ] Update documentation

### Phase 4: Optional
- [ ] Collaboration support
- [ ] Real-time cursors
- [ ] User presence

## 9. Risk Assessment

| Risk | Mitigation |
|------|------------|
| Breaking changes in Lexical API | Both use same Lexical version |
| Missing features | Keep custom nodes as-is initially |
| Theme incompatibility | CSS variables provide flexibility |
| Plugin conflicts | Test incrementally |

## Conclusion

The migration is **feasible and beneficial**:
- **48% file reduction**
- **80% CSS reduction**
- Better architecture
- Modern tooling (Tailwind v4, shadcn)
- Maintained type safety

**Recommended approach**: Phased migration starting with foundation, then custom features, allowing rollback at each phase.
