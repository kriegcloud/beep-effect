# Codebase Context: Lexical Playground

> Analysis of the ported Lexical Playground codebase at `apps/todox/src/app/lexical/`.

---

## File Statistics

| Metric | Count |
|--------|-------|
| Total TS/TSX files | 143 |
| Total CSS files | 32 |
| Total lines of code | ~40,000 |
| Unique components | 88 |

---

## Directory Structure

```
apps/todox/src/app/lexical/
├── index.tsx              # Client entry point
├── index.css              # Global styles
├── App.tsx                # Main app component
├── Editor.tsx             # Core editor (50+ plugins)
├── Settings.tsx           # Settings UI
├── settings.ts            # Default settings
├── setupEnv.ts            # Environment setup
├── buildHTMLConfig.tsx    # HTML serialization
├── collaboration.ts       # WebSocket provider
├── commenting/            # Comment models
│   └── models.ts
├── context/               # React contexts
│   ├── FlashMessageContext.tsx
│   ├── SettingsContext.tsx
│   ├── SharedHistoryContext.tsx
│   └── ToolbarContext.tsx
├── hooks/                 # Custom hooks
│   ├── useFlashMessage.tsx
│   ├── useModal.tsx
│   └── useReport.ts
├── nodes/                 # Custom Lexical nodes (25 total)
│   ├── AutocompleteNode.tsx
│   ├── DateTimeNode/
│   ├── EmojiNode.tsx
│   ├── EquationNode.tsx
│   ├── ExcalidrawNode/
│   ├── FigmaNode.tsx
│   ├── ImageNode.tsx
│   ├── KeywordNode.ts
│   ├── LayoutContainerNode.ts
│   ├── LayoutItemNode.ts
│   ├── MentionNode.ts
│   ├── PageBreakNode/
│   ├── PlaygroundNodes.ts
│   ├── PollNode.tsx
│   ├── SpecialTextNode.tsx
│   ├── StickyNode.tsx
│   ├── TweetNode.tsx
│   └── YouTubeNode.tsx
├── plugins/               # Lexical plugins (51 total)
│   ├── ActionsPlugin/
│   ├── AutocompletePlugin/
│   ├── AutoEmbedPlugin/
│   ├── AutoLinkPlugin/
│   ├── CodeActionMenuPlugin/
│   ├── CodeHighlightPrismPlugin/
│   ├── CodeHighlightShikiPlugin/
│   ├── CollapsiblePlugin/
│   ├── CommentPlugin/
│   ├── ComponentPickerPlugin/
│   ├── ContextMenuPlugin/
│   ├── DateTimePlugin/
│   ├── DocsPlugin/
│   ├── DragDropPastePlugin/
│   ├── DraggableBlockPlugin/
│   ├── EmojiPickerPlugin/
│   ├── EmojisPlugin/
│   ├── EquationsPlugin/
│   ├── ExcalidrawPlugin/
│   ├── FigmaPlugin/
│   ├── FloatingLinkEditorPlugin/
│   ├── FloatingTextFormatToolbarPlugin/
│   ├── ImagesPlugin/
│   ├── KeywordsPlugin/
│   ├── LayoutPlugin/
│   ├── LinkPlugin/
│   ├── MarkdownShortcutPlugin/
│   ├── MarkdownTransformers/
│   ├── MaxLengthPlugin/
│   ├── MentionsPlugin/
│   ├── PageBreakPlugin/
│   ├── PasteLogPlugin/
│   ├── PollPlugin/
│   ├── ShortcutsPlugin/
│   ├── SpecialTextPlugin/
│   ├── SpeechToTextPlugin/
│   ├── StickyPlugin/
│   ├── TabFocusPlugin/
│   ├── TableActionMenuPlugin/
│   ├── TableCellResizer/
│   ├── TableHoverActionsPlugin/
│   ├── TableHoverActionsV2Plugin/
│   ├── TableOfContentsPlugin/
│   ├── TablePlugin.tsx
│   ├── TableScrollShadowPlugin/
│   ├── TestRecorderPlugin/
│   ├── ToolbarPlugin/
│   ├── TreeViewPlugin/
│   ├── TwitterPlugin/
│   ├── TypingPerfPlugin/
│   ├── VersionsPlugin/
│   └── YouTubePlugin/
├── schema/                # Effect schemas (from recent refactor)
│   ├── index.ts
│   ├── schemas.ts
│   ├── doc.schema.ts
│   ├── errors.ts
│   ├── url.schema.ts
│   └── swipe.schema.ts
├── server/                # Server-side code
│   └── validation.ts      # Headless editor validation
├── themes/                # Editor themes
│   ├── CommentEditorTheme.ts
│   ├── CommentEditorTheme.css
│   ├── PlaygroundEditorTheme.ts
│   ├── PlaygroundEditorTheme.css
│   ├── StickyEditorTheme.ts
│   └── StickyEditorTheme.css
├── ui/                    # UI components
│   ├── Button.tsx
│   ├── ColorPicker.tsx
│   ├── ContentEditable.tsx
│   ├── Dialog.tsx
│   ├── DropDown.tsx
│   ├── DropdownColorPicker.tsx
│   ├── EquationEditor.tsx
│   ├── ExcalidrawModal.tsx
│   ├── FileInput.tsx
│   ├── FlashMessage.tsx
│   ├── ImageResizer.tsx
│   ├── KatexEquationAlterer.tsx
│   ├── KatexRenderer.tsx
│   ├── Modal.tsx
│   ├── Select.tsx
│   ├── Switch.tsx
│   └── TextInput.tsx
└── utils/                 # Utilities
    ├── index.ts
    ├── docSerialization.ts
    ├── emoji-list.ts
    ├── focusUtils.ts
    ├── getDOMRangeRect.ts
    ├── getSelectedNode.ts
    ├── getThemeSelector.ts
    ├── joinClasses.ts
    ├── setFloatingElemPosition.ts
    ├── setFloatingElemPositionForLinkEditor.ts
    ├── swipe.ts
    └── url.ts
```

---

## Entry Point Flow

```
index.tsx → App.tsx → Editor.tsx → 50+ Plugins
```

---

## Context Providers (4)

1. **FlashMessageContext** - Toast/notification management
2. **SettingsContext** - Global editor settings
3. **SharedHistoryContext** - Undo/redo across instances
4. **ToolbarContext** - Toolbar state sharing

---

## Server-Side Code

**File**: `server/validation.ts` (121 lines)

Creates a headless Lexical editor for server-side validation:
- HTTP server on port 1235
- `/setEditorState` - Sets editor state
- `/validateEditorState` - Validates without mutation
- CORS enabled

**Migration Required**: Convert to Next.js API routes.

---

## UI Components to Replace with shadcn

| Lexical Component | shadcn Equivalent | Notes |
|-------------------|-------------------|-------|
| `ui/Modal.tsx` | `Dialog` | Use @base-ui/react primitives |
| `ui/Button.tsx` | `Button` | Match variant system |
| `ui/DropDown.tsx` | `DropdownMenu` | Complex menu hierarchy |
| `ui/Select.tsx` | `Select` | Standard select |
| `ui/Switch.tsx` | `Switch` | Toggle component |
| `ui/ColorPicker.tsx` | Custom + `Popover` | May need custom implementation |
| `ui/Dialog.tsx` | `AlertDialog` | Confirmation dialogs |

---

## CSS Files by Category

### Theme CSS (Keep, may need Tailwind integration)
- `themes/PlaygroundEditorTheme.css`
- `themes/CommentEditorTheme.css`
- `themes/StickyEditorTheme.css`

### Component CSS (Convert to Tailwind)
- `ui/Button.css`
- `ui/ColorPicker.css`
- `ui/ContentEditable.css`
- `ui/Dialog.css`
- `ui/EquationEditor.css`
- `ui/ExcalidrawModal.css`
- `ui/FlashMessage.css`
- `ui/Input.css`
- `ui/KatexEquationAlterer.css`
- `ui/Modal.css`
- `ui/Select.css`

### Plugin CSS (Convert to Tailwind)
- `plugins/CodeActionMenuPlugin/index.css`
- `plugins/CodeActionMenuPlugin/components/PrettierButton/index.css`
- `plugins/CollapsiblePlugin/Collapsible.css`
- `plugins/CommentPlugin/index.css`
- `plugins/DraggableBlockPlugin/index.css`
- `plugins/FloatingLinkEditorPlugin/index.css`
- `plugins/FloatingTextFormatToolbarPlugin/index.css`
- `plugins/TableCellResizer/index.css`
- `plugins/TableHoverActionsV2Plugin/index.css`
- `plugins/TableOfContentsPlugin/index.css`
- `plugins/ToolbarPlugin/fontSize.css`
- `plugins/VersionsPlugin/index.css`

### Node CSS (Convert to Tailwind)
- `nodes/DateTimeNode/DateTimeNode.css`
- `nodes/ImageNode.css`
- `nodes/PageBreakNode/index.css`
- `nodes/PollNode.css`
- `nodes/StickyNode.css`

### Root CSS
- `index.css` - Global styles

---

## Technology Dependencies

- **Core**: Lexical, @lexical/react, @lexical/headless
- **UI**: React 19
- **Styling**: CSS (to be converted to Tailwind)
- **Collaboration**: Yjs (Doc-based)
- **Math**: KaTeX
- **Diagrams**: Excalidraw integration
- **State**: React Context API

---

## Notable Patterns

1. **Plugin Architecture**: All plugins export default component/function
2. **Node System**: Custom nodes extend `LexicalNode`
3. **Theme System**: Centralized definitions with CSS overrides
4. **Server-Side**: Headless editor for validation without DOM
5. **Settings**: Extensive configuration via `settings.ts`
