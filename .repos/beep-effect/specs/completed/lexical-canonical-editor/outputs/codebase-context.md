# Lexical Canonical Editor - Codebase Context

**Date**: 2026-02-14
**Phase**: 1 (Discovery)

---

## Lexical POC Structure

### Directory Map

```
apps/todox/src/app/lexical/
├── page.tsx                    # Next.js page entry (dynamic import, SSR disabled)
├── App.tsx                     # Root component: contexts, extension, Editor
├── Editor.tsx                  # Main editor: mounts all plugins conditionally
├── Settings.tsx                # Settings panel UI (toggle switches)
├── settings.ts                 # DEFAULT_SETTINGS object (24 boolean flags)
├── setupEnv.ts                 # URL param overrides, Effect Schema parsing
├── buildHTMLConfig.tsx         # HTML import/export config (paste handling)
├── collaboration.ts            # WebSocket provider factory (y-websocket/yjs)
│
├── context/
│   ├── index.ts                # Barrel exports
│   ├── AiContext.tsx            # AI panel state (streaming, insertion mode)
│   ├── FlashMessageContext.tsx  # Toast/flash notification context
│   ├── LiveblocksProvider.tsx   # Liveblocks RoomProvider (AI presence)
│   ├── SettingsContext.tsx      # Settings state management
│   ├── SharedHistoryContext.tsx # Shared undo/redo history
│   └── toolbar-context.tsx     # Unified toolbar state context
│
├── hooks/
│   ├── index.ts
│   ├── useDebounce.ts
│   ├── useFlashMessage.tsx
│   ├── useModal.tsx
│   ├── useReport.ts
│   └── useUpdateToolbar.ts     # Toolbar state sync with selection
│
├── nodes/
│   ├── PlaygroundNodes.ts      # Node registry (34 node classes)
│   ├── AutocompleteNode.tsx
│   ├── EmojiNode.tsx
│   ├── EquationNode.tsx / EquationComponent.tsx / equation-utils.ts
│   ├── FigmaNode.tsx
│   ├── ImageNode.tsx / ImageComponent.tsx / image-utils.ts
│   ├── KeywordNode.ts
│   ├── LayoutContainerNode.ts / LayoutItemNode.ts
│   ├── MentionNode.ts
│   ├── PollNode.tsx / PollComponent.tsx / poll-utils.ts
│   ├── StickyNode.tsx / StickyComponent.tsx / sticky-utils.ts
│   ├── DateTimeNode/
│   ├── ExcalidrawNode/
│   ├── PageBreakNode/
│   └── embeds/ (TweetNode.tsx, YouTubeNode.tsx)
│
├── plugins/                    # 53 plugin entries (see catalog)
│
├── themes/
│   ├── index.ts                # Barrel: editorTheme, commentEditorTheme, stickyEditorTheme
│   ├── editor-theme.ts         # EditorThemeClasses with Tailwind + shadcn variables (206 lines)
│   └── editor-theme.css        # CSS-only features (code syntax, complex selectors)
│
├── ui/
│   ├── ColorPicker.tsx
│   ├── ContentEditable.tsx
│   ├── DropdownColorPicker.tsx
│   ├── EquationEditor.tsx
│   ├── ExcalidrawModal.tsx
│   ├── FileInput.tsx
│   ├── FlashMessage.tsx
│   ├── ImageResizer.tsx
│   ├── KatexEquationAlterer.tsx
│   └── KatexRenderer.tsx
│
├── utils/
│   ├── index.ts
│   ├── docSerialization.ts     # Effect-based doc hash encode/decode
│   ├── emoji-list.ts
│   ├── focusUtils.ts
│   ├── getDOMRangeRect.ts
│   ├── getSelectedNode.ts
│   ├── getThemeSelector.ts
│   ├── setFloatingElemPosition.ts
│   ├── setFloatingElemPositionForLinkEditor.ts
│   ├── swipe.ts
│   └── url.ts
│
├── schema/
│   ├── index.ts
│   ├── editor.schema.ts        # Effect Schema for LexicalEditor
│   ├── doc.schema.ts           # Effect Schema for SerializedDocument
│   ├── errors.ts
│   ├── node-types.schema.ts
│   ├── nodes.schema.ts
│   ├── schemas.ts
│   ├── swipe.schema.ts
│   └── url.schema.ts
│
└── images/                     # Icons, emoji PNGs, sample images
```

### Plugin Catalog

| # | Plugin Name | Category | Email Compose Needed? | Notes |
|---|------------|----------|----------------------|-------|
| 1 | ToolbarPlugin | Formatting | Yes | Main formatting toolbar with font controls, colors, alignment, block types. Sub-components: FontControls, ColorPickerGroup, AdvancedTextFormattingMenu, UndoRedoControls, TextFormatButtonGroup |
| 2 | ShortcutsPlugin | Formatting | Yes | Keyboard shortcuts for formatting (bold, italic, etc.). Has `shortcuts.ts` config |
| 3 | FloatingTextFormatToolbarPlugin | Formatting | Yes | Floating bubble toolbar on text selection |
| 4 | FloatingLinkEditorPlugin | Formatting | Yes | Floating link editor for creating/editing links |
| 5 | LinkPlugin | Formatting | Yes | Core link functionality with attributes support |
| 6 | AutoLinkPlugin | Formatting | Yes | Auto-detects URLs and converts to links |
| 7 | MarkdownShortcutPlugin | Formatting | Yes | Typing markdown shortcuts (e.g., `**bold**`, `# heading`) |
| 8 | MarkdownTransformers | Formatting | Yes | Defines all markdown transformers (HR, IMAGE, EMOJI, EQUATION, TWEET, TABLE). Used by MarkdownShortcutPlugin and ActionsPlugin |
| 9 | EmojisPlugin | Formatting | Yes | Inline emoji rendering from text shortcuts |
| 10 | CodeHighlightPrismPlugin | Formatting | No | Prism-based code syntax highlighting |
| 11 | CodeHighlightShikiPlugin | Formatting | No | Shiki-based code syntax highlighting (alternative) |
| 12 | CodeActionMenuPlugin | Formatting | No | Code block action menu (copy, Prettier format) |
| 13 | MaxLengthPlugin | Formatting | No | Enforces maximum content length |
| 14 | DateTimePlugin | Formatting | No | Insert date/time stamps (uses Effect DateTime) |
| 15 | KeywordsPlugin | Formatting | No | Keyword highlighting/detection |
| 16 | ComponentPickerPlugin | Navigation | Yes | Slash-command menu (`/`) for inserting blocks |
| 17 | EmojiPickerPlugin | Navigation | Yes | Emoji picker triggered by `:` |
| 18 | MentionsPlugin | Navigation | Yes | `@mention` typeahead with user lookup |
| 19 | TabFocusPlugin | Navigation | Yes | Tab key focus management |
| 20 | PreserveSelectionPlugin | Navigation | Yes | Save/restore selection state |
| 21 | DraggableBlockPlugin | Navigation | No | Block-level drag handle for reordering |
| 22 | ContextMenuPlugin | Navigation | No | Custom right-click context menu |
| 23 | TablePlugin | Layout | No | Table creation dialog and TableContext provider |
| 24 | TableCellResizer | Layout | No | Drag-to-resize table columns |
| 25 | TableActionMenuPlugin | Layout | No | Table cell context menu (insert/delete rows/cols, merge) |
| 26 | TableHoverActionsPlugin | Layout | No | Table hover action buttons (v1, likely unused) |
| 27 | TableHoverActionsV2Plugin | Layout | No | Table hover action buttons (v2, active version) |
| 28 | TableScrollShadowPlugin | Layout | No | Horizontal scroll shadow indicators |
| 29 | TableOfContentsPlugin | Layout | No | Auto-generated document outline sidebar |
| 30 | LayoutPlugin | Layout | No | Multi-column layout containers |
| 31 | CollapsiblePlugin | Layout | No | Collapsible/accordion sections (3 node types) |
| 32 | PageBreakPlugin | Layout | No | Page break separator for print/export |
| 33 | ImagesPlugin | Media | Yes | Image insertion (URL, file upload, inline). Provides `INSERT_IMAGE_COMMAND` |
| 34 | DragDropPastePlugin | Media | Yes | Handles drag-and-drop and paste of files/images |
| 35 | ExcalidrawPlugin | Media | No | Excalidraw drawing embed |
| 36 | EquationsPlugin | Media | No | LaTeX equation insertion (KaTeX rendering) |
| 37 | PollPlugin | Media | No | Interactive poll creation |
| 38 | StickyPlugin | Media | No | Sticky note overlays |
| 39 | AiAssistantPlugin | AI/Autocomplete | No | Full AI writing assistant with streaming, commands, floating panel, collaborative awareness. Uses AiContext, PreserveSelectionPlugin, Liveblocks |
| 40 | AutocompletePlugin | AI/Autocomplete | No | Ghost text autocomplete suggestions |
| 41 | SpeechToTextPlugin | AI/Autocomplete | No | Speech recognition to text input |
| 42 | ActionsPlugin | Action | Yes | Bottom action bar: import/export, share, clear, lock, markdown toggle, speech-to-text. Uses Effect HttpClient, Schema, Clipboard, DateTime |
| 43 | AutoEmbedPlugin | Embed | No | Auto-embed URLs (YouTube, Twitter, Figma) |
| 44 | TwitterPlugin | Embed | No | Twitter/X embed rendering |
| 45 | YouTubePlugin | Embed | No | YouTube embed rendering |
| 46 | FigmaPlugin | Embed | No | Figma embed rendering |
| 47 | CommentPlugin | Collaboration | No | Inline comment threads with yjs collab support |
| 48 | VersionsPlugin | Collaboration | No | Version history with yjs snapshots and diff view. Uses Effect Match, MutableHashMap, DateTime, Option |
| 49 | TreeViewPlugin | Dev/Debug | No | Debug AST tree view |
| 50 | DocsPlugin | Dev/Debug | No | Dev-only documentation panel |
| 51 | PasteLogPlugin | Dev/Debug | No | Dev-only paste event logging |
| 52 | TestRecorderPlugin | Dev/Debug | No | Dev-only test step recorder |
| 53 | TypingPerfPlugin | Dev/Debug | No | Dev-only typing performance measurement |

**Total plugins**: 53
**Email compose plugins**: 16 (plugins 1-9, 16-20, 33-34, 42)

Additionally, Editor.tsx directly uses these `@lexical/react` built-in plugins: `AutoFocusPlugin`, `CharacterLimitPlugin`, `CheckListPlugin`, `ClearEditorPlugin`, `ClickableLinkPlugin`, `HistoryPlugin`, `ListPlugin`, `RichTextPlugin`/`PlainTextPlugin`, `SelectionAlwaysOnDisplay`, `TabIndentationPlugin`, `CollaborationPlugin`, `HashtagPlugin`.

### Node Types

| # | Node Class | Source | Category | Email Compose? |
|---|-----------|--------|----------|----------------|
| 1 | HeadingNode | `@lexical/rich-text` | Text Structure | Yes |
| 2 | ListNode | `@lexical/list` | Text Structure | Yes |
| 3 | ListItemNode | `@lexical/list` | Text Structure | Yes |
| 4 | QuoteNode | `@lexical/rich-text` | Text Structure | Yes |
| 5 | CodeNode | `@lexical/code` | Code | No |
| 6 | CodeHighlightNode | `@lexical/code` | Code | No |
| 7 | TableNode | `@lexical/table` | Table | No |
| 8 | TableCellNode | `@lexical/table` | Table | No |
| 9 | TableRowNode | `@lexical/table` | Table | No |
| 10 | HashtagNode | `@lexical/hashtag` | Inline | No |
| 11 | AutoLinkNode | `@lexical/link` | Inline | Yes |
| 12 | LinkNode | `@lexical/link` | Inline | Yes |
| 13 | OverflowNode | `@lexical/overflow` | Utility | No |
| 14 | MarkNode | `@lexical/mark` | Inline (comments) | No |
| 15 | HorizontalRuleNode | `@lexical/extension` | Layout | Yes |
| 16 | PollNode | Custom | Interactive | No |
| 17 | StickyNode | Custom | Interactive | No |
| 18 | ImageNode | Custom | Media | Yes |
| 19 | MentionNode | Custom | Inline | Yes |
| 20 | EmojiNode | Custom | Inline | Yes |
| 21 | ExcalidrawNode | Custom | Media | No |
| 22 | EquationNode | Custom | Media | No |
| 23 | AutocompleteNode | Custom | Utility | No |
| 24 | KeywordNode | Custom | Inline | No |
| 25 | TweetNode | Custom | Embed | No |
| 26 | YouTubeNode | Custom | Embed | No |
| 27 | FigmaNode | Custom | Embed | No |
| 28 | CollapsibleContainerNode | Custom | Layout | No |
| 29 | CollapsibleContentNode | Custom | Layout | No |
| 30 | CollapsibleTitleNode | Custom | Layout | No |
| 31 | PageBreakNode | Custom | Layout | No |
| 32 | LayoutContainerNode | Custom | Layout | No |
| 33 | LayoutItemNode | Custom | Layout | No |
| 34 | DateTimeNode | Custom | Inline | No |

**Email compose nodes**: 10 (HeadingNode, ListNode, ListItemNode, QuoteNode, AutoLinkNode, LinkNode, HorizontalRuleNode, ImageNode, MentionNode, EmojiNode)

### Themes

| Theme File | Purpose | Reusable? |
|------------|---------|-----------|
| `app/lexical/themes/editor-theme.ts` (206 lines) | Full EditorThemeClasses with Tailwind + shadcn variables, dark mode support, 3 variants (main, comment, sticky) | Yes - most complete, production-ready |
| `app/lexical/themes/editor-theme.css` (92 lines) | CSS-only features requiring pseudo-elements (code blocks, collapsibles, tables, checklists, horizontal rule) | Yes - required companion to the TS theme |
| `components/editor/themes/editor-theme.ts` (127 lines) | Simpler version of theme (missing table enhancements, dark mode, variants) | No - superseded by playground theme |
| `components/editor/themes/editor-theme.css` (92 lines) | Subset of CSS features | No - superseded by playground theme CSS |

### Settings System (24 Feature Flags)

| Setting | Default | Email Compose Relevant? |
|---------|---------|------------------------|
| `isRichText` | `true` | Yes - controls rich/plain text mode |
| `emptyEditor` | `false` | Yes - start empty vs prepopulated |
| `isCodeHighlighted` | `true` | No |
| `isCodeShiki` | `false` | No |
| `isCollab` | `false` | No |
| `isAutocomplete` | `false` | No |
| `isCharLimit` / `isCharLimitUtf8` | `false` | Maybe |
| `isMaxLength` | `false` | Maybe |
| `hasLinkAttributes` | `false` | Yes - target, rel attributes |
| `selectionAlwaysOnDisplay` | `false` | Maybe |
| All others | Various | No - playground/dev specific |

---

## Tiptap Integration Points

### Current Location

- Route: `/` (root page)
- Component file: `apps/todox/src/features/editor/editor.tsx`
- Integration: Tiptap editor is mounted inside `MailCompose` (compose dialog) and `MailDetails` (reply area), both rendered within `MailProvider` context on the `/` route
- Content format: **HTML string** (via `editor.getHTML()`)

### Component Hierarchy (Route to Editor)

```
apps/todox/src/app/page.tsx
  Page > React.Suspense > AuthGuard > PageContent
    MiniSidebarProvider > SidePanelProvider
      TopNavbar
      MainContent
        SidePanel > AIChatPanel
        SidebarProvider
          ToggleGroup (view mode: email default)
          MailProvider  (when viewMode === "email")
            MailContent
              MailList
              MailDetails
                Editor  (reply, no onChange, maxHeight: 320)
                Send Button (no handler)
              MailCompose  (conditional via openCompose boolean)
                InputBase (To)
                InputBase (Subject)
                Editor  (compose, onChange -> message state as HTML)
                Send Button (no handler - purely presentational)
```

### Feature List

| Feature | Toolbar Button? | Shortcut | API Method | Behavior | Conditional (`fullItem`)? |
|---------|-----------------|----------|------------|----------|--------------------------|
| Heading Selector | Yes (dropdown) | -- | `toggleHeading({level})` / `setParagraph()` | Dropdown: Paragraph, H1-H6 | No |
| Bold | Yes | Cmd+B | `toggleBold()` | Toggles bold mark | No |
| Italic | Yes | Cmd+I | `toggleItalic()` | Toggles italic mark | No |
| Underline | Yes | Cmd+U | `toggleUnderline()` | Toggles underline mark | No |
| Strikethrough | Yes | Cmd+S | `toggleStrike()` | Toggles strikethrough mark | No |
| Bullet List | Yes | Cmd+Shift+8 | `toggleBulletList()` | Toggles unordered list | No |
| Ordered List | Yes | Cmd+Shift+7 | `toggleOrderedList()` | Toggles numbered list | No |
| Align Left | Yes | Cmd+Shift+L | `toggleTextAlign("left")` | Left-align text | No |
| Align Center | Yes | Cmd+Shift+E | `toggleTextAlign("center")` | Center-align text | No |
| Align Right | Yes | Cmd+Shift+R | `toggleTextAlign("right")` | Right-align text | No |
| Align Justify | Yes | Cmd+Shift+J | `toggleTextAlign("justify")` | Justify text | No |
| Code (inline) | Yes | Cmd+E | `toggleCode()` | Toggles inline code mark | Yes (hidden by default) |
| Code Block | Yes | Cmd+Alt+C | `toggleCodeBlock()` | Syntax-highlighted code block | Yes (hidden by default) |
| Blockquote | Yes | Cmd+Shift+B | `toggleBlockquote()` | Toggles blockquote | Yes (hidden by default) |
| Horizontal Rule | Yes | -- | `setHorizontalRule()` | Inserts horizontal divider | Yes (hidden by default) |
| Insert Link | Yes (popover) | -- | `setLink({href})` | Opens popover with URL input | No |
| Remove Link | Yes | -- | `unsetLink()` | Removes link from selection | No |
| Insert Image | Yes (popover) | -- | `setImage({src, alt})` | Opens popover with URL + alt text | No |
| Hard Break | Yes | Shift+Enter | `setHardBreak()` | Line break within block | No |
| Clear Format | Yes | Cmd+Shift+X | `clearNodes().unsetAllMarks()` | Removes all formatting | No |
| Undo | Yes | Cmd+Z | `undo()` | Undo last action | Yes (hidden by default) |
| Redo | Yes | Cmd+Shift+Z | `redo()` | Redo last undone action | Yes (hidden by default) |
| Fullscreen | Yes | Escape (to exit) | State toggle | Toggles fullscreen mode | No |

**Note**: The `fullItem` prop controls whether advanced buttons (Code, Code Block, Blockquote, HR, Undo, Redo) are shown. In mail compose/reply usage, `fullItem` is NOT passed, defaulting to `false` -- users get a simplified toolbar.

### Bubble Toolbar (Floating on Selection)

| Feature | API Method | Behavior |
|---------|-----------|----------|
| Bold | `toggleBold()` | Toggle bold on selection |
| Italic | `toggleItalic()` | Toggle italic on selection |
| Underline | `toggleUnderline()` | Toggle underline on selection |
| Strike | `toggleStrike()` | Toggle strikethrough on selection |
| Insert Link | `setLink({href})` | Link popover on selection |
| Uppercase | `toggleTextTransform("uppercase")` | CSS text-transform |
| Lowercase | `toggleTextTransform("lowercase")` | CSS text-transform |
| Capitalize | `toggleTextTransform("capitalize")` | CSS text-transform |
| Clear Format | `clearNodes().unsetAllMarks()` | Remove all formatting |

### Tiptap Extensions Loaded

| Extension | Source | Notes |
|-----------|--------|-------|
| StarterKit | `@tiptap/starter-kit` | Bold, italic, strike, code, heading, horizontalRule, lists, blockquote, link, history, paragraph, text, document, hardBreak, dropcursor, gapcursor. Disables codeBlock. |
| TextAlign | `@tiptap/extension-text-align` | Types: heading, paragraph |
| Image | `@tiptap/extension-image` | Custom CSS class |
| Placeholder | `@tiptap/extensions` | Configurable placeholder text |
| CodeBlockLowlight | `@tiptap/extension-code-block-lowlight` | Uses lowlight with common languages |
| TextTransform (custom) | `./extension/text-transform.ts` | Mark for uppercase/lowercase/capitalize |
| ClearFormat (custom) | `./extension/clear-format.ts` | Mod-Shift-X clears all formatting |

### Fullscreen Toggle Implementation

- **Approach**: State-driven with CSS fixed positioning + MUI Portal + Backdrop
- **Implementation file**: `apps/todox/src/features/editor/editor.tsx:44,97-139`
- **State**: `const [fullscreen, setFullscreen] = useState(false)`
- **Toggle handler**: Unmounts editor first (`editor?.unmount()`), toggles state, forces re-render via `rerenderKey`
- **Exit**: `Escape` key listener registered when fullscreen active
- **CSS** (`styles.tsx:31-40`): Fixed positioning with 16px margins, modal z-index, background color
- **Portal**: MUI `Portal` + `Backdrop` wraps editor when fullscreen

### Send Button Integration

- **Content extraction**: `editor.getHTML()` called in `onUpdate` callback, debounced 200ms via `es-toolkit/debounce`
- **Format sent**: HTML string
- **Current state**: Send buttons in both MailCompose and MailDetails have **no onClick handler** -- purely presentational
- **State management**: `const [message, setMessage] = useState("")` stores HTML from `onChange`

---

## Existing Lexical Infrastructure

### components/blocks/editor-00/

| File | Purpose | Lines | Reusable? |
|------|---------|-------|-----------|
| editor.tsx | Main Editor component with LexicalComposer, dual onChange (EditorState + Serialized) | 55 | Yes - clean composition pattern |
| nodes.ts | Node registration array (4 nodes: Heading, Paragraph, Text, Quote) | 9 | Yes - minimal, extensible |
| plugins.tsx | Plugin composition with floating anchor setup, placeholder slots for toolbar/editor/actions | 34 | Partially - hardcoded placeholder text |

**Key Pattern**: Dual onChange API
```typescript
export function Editor({
  editorState,
  editorSerializedState,
  onChange,
  onSerializedChange,
}: {
  editorState?: EditorState;
  editorSerializedState?: SerializedEditorState;
  onChange?: (editorState: EditorState) => void;
  onSerializedChange?: (editorSerializedState: SerializedEditorState) => void;
}) { ... }
```

**Assessment**: Clean minimal scaffold designed for extension. Uses older `LexicalComposer` + `initialConfig` API (vs playground's `LexicalExtensionComposer`). Good external API pattern (dual onChange) worth preserving. Limited to 4 nodes and 2 plugins -- too minimal for email compose but demonstrates the right abstraction level.

### components/editor/

| File | Purpose | Lines | Reusable? |
|------|---------|-------|-----------|
| themes/editor-theme.ts | Tailwind/shadcn theme for Lexical (EditorThemeClasses) | 127 | Superseded by playground theme (206 lines) |
| themes/editor-theme.css | CSS for pseudo-elements (code blocks, collapsibles, tables) | 92 | Superseded by playground theme CSS |
| editor-ui/content-editable.tsx | Styled ContentEditable wrapper with placeholder | 30 | Yes - clean, configurable |

**Assessment**: Shared layer providing theme + ContentEditable consumed by `editor-00`. The theme is a simpler version of the playground's theme (missing dark mode, table enhancements, theme variants). Should be replaced by the playground theme. ContentEditable wrapper is reusable but functionally identical to the playground's version -- consolidate into one.

### Dependency Graph

```
editor-00/editor.tsx
  ├── imports editorTheme from components/editor/themes/editor-theme
  └── editor-00/plugins.tsx
      └── imports ContentEditable from components/editor/editor-ui/content-editable

app/lexical/ (playground)
  └── has its OWN theme and ContentEditable (no shared imports)
```

The playground does NOT import from shared editor utilities -- it has duplicated theme and ContentEditable.

### Reusable Patterns

1. **Dual onChange API** from `editor-00`: `onChange(EditorState)` + `onSerializedChange(SerializedEditorState)` -- clean external state management
2. **Floating anchor ref pattern**: Both `editor-00/plugins.tsx` and `app/lexical/Editor.tsx` use identical `onRef` pattern for floating elements
3. **ToolbarContext** from playground: Well-structured combined context (state + active editor + modal + update)
4. **`useUpdateToolbarHandler` hook**: Clean selection-change subscription pattern
5. **`getSelectedNode` utility**: Canonical node selection helper
6. **`getThemeSelector` utility**: Tailwind-safe CSS selector builder using `CSS.escape`
7. **Effect Schema declarations**: `editor.schema.ts` bridges Lexical types into Effect ecosystem via `S.declare`
8. **`buildHTMLConfig`**: Preserves font size, colors on paste
9. **Settings system**: Typed defaults with 24 feature flags
10. **Theme variant pattern**: `commentEditorTheme` and `stickyEditorTheme` via spread override

### Patterns to Replace

| Pattern | Source | Replacement |
|---------|--------|-------------|
| `LexicalComposer` + `initialConfig` | editor-00 | Use `defineExtension` + `LexicalExtensionComposer` (newer API from playground) |
| `console.error` in onError | editor-00 | Use Effect.logError or structured error handling |
| Duplicate theme files | components/editor/ vs app/lexical/ | Consolidate to playground theme (more complete) |
| Duplicate ContentEditable | components/editor/ vs app/lexical/ | Unify into single component with config props |

---

## Feature Mapping Table

| Tiptap Feature | Lexical Plugin | Availability | Priority | Notes |
|----------------|----------------|-------------|----------|-------|
| Bold | RichTextPlugin (built-in) + FloatingTextFormatToolbarPlugin | Available | Must-have | FORMAT_TEXT_COMMAND with "bold" |
| Italic | RichTextPlugin (built-in) + FloatingTextFormatToolbarPlugin | Available | Must-have | FORMAT_TEXT_COMMAND with "italic" |
| Underline | RichTextPlugin (built-in) + FloatingTextFormatToolbarPlugin | Available | Must-have | FORMAT_TEXT_COMMAND with "underline" |
| Strikethrough | RichTextPlugin (built-in) + FloatingTextFormatToolbarPlugin | Available | Must-have | FORMAT_TEXT_COMMAND with "strikethrough" |
| Heading Selector | ToolbarPlugin (BlockFormatDropDown) | Available | Must-have | Paragraph, H1-H6 via block format dropdown |
| Bullet List | ListPlugin (built-in) + ToolbarPlugin | Available | Must-have | INSERT_UNORDERED_LIST_COMMAND |
| Ordered List | ListPlugin (built-in) + ToolbarPlugin | Available | Must-have | INSERT_ORDERED_LIST_COMMAND |
| Align Left | ToolbarPlugin (ElementFormatToolbarPlugin) | Available | Must-have | FORMAT_ELEMENT_COMMAND |
| Align Center | ToolbarPlugin (ElementFormatToolbarPlugin) | Available | Must-have | FORMAT_ELEMENT_COMMAND |
| Align Right | ToolbarPlugin (ElementFormatToolbarPlugin) | Available | Must-have | FORMAT_ELEMENT_COMMAND |
| Align Justify | ToolbarPlugin (ElementFormatToolbarPlugin) | Available | Must-have | FORMAT_ELEMENT_COMMAND |
| Insert Link | LinkPlugin + FloatingLinkEditorPlugin | Available | Must-have | TOGGLE_LINK_COMMAND |
| Remove Link | LinkPlugin + FloatingLinkEditorPlugin | Available | Must-have | TOGGLE_LINK_COMMAND with null |
| Insert Image | ImagesPlugin | Available | Must-have | INSERT_IMAGE_COMMAND |
| Hard Break | RichTextPlugin (built-in) | Available | Must-have | INSERT_LINE_BREAK_COMMAND |
| Clear Format | ToolbarPlugin (ClearFormattingToolbarPlugin) | Available | Must-have | Clears nodes + unsets all marks |
| Undo | HistoryPlugin (built-in) | Available | Must-have | UNDO_COMMAND |
| Redo | HistoryPlugin (built-in) | Available | Must-have | REDO_COMMAND |
| Fullscreen Toggle | N/A (needs implementation) | Missing | Must-have | Tiptap uses React state + MUI Portal + CSS fixed. Need equivalent for Lexical. |
| Code (inline) | RichTextPlugin (built-in) | Available | Nice-to-have | FORMAT_TEXT_COMMAND with "code" |
| Code Block | CodeHighlightPrismPlugin / CodeHighlightShikiPlugin | Available | Nice-to-have | INSERT_CODE_BLOCK_COMMAND |
| Blockquote | RichTextPlugin (built-in) | Available | Nice-to-have | Already in block format dropdown |
| Horizontal Rule | HorizontalRuleNode + INSERT_HORIZONTAL_RULE_COMMAND | Available | Nice-to-have | Via component picker or toolbar |
| Bubble Toolbar (selection) | FloatingTextFormatToolbarPlugin | Available | Must-have | Selection-triggered formatting |
| Text Transform (upper/lower/capitalize) | N/A | Missing | Nice-to-have | Tiptap has custom TextTransform extension; Lexical theme supports CSS classes but no toggle command |
| Placeholder | Built-in ContentEditable | Available | Must-have | Part of ContentEditable component |
| Auto-link Detection | AutoLinkPlugin | Available | Nice-to-have | Auto-converts typed URLs to links |
| Keyboard Shortcuts | ShortcutsPlugin | Available | Must-have | Bold, italic, etc. shortcuts |

**Summary**: 22/25 features available in Lexical POC. 2 missing (Fullscreen Toggle, Text Transform command). 1 (Fullscreen Toggle) is must-have and needs implementation.

---

## Recommendations

### Plugin Selection for Email Compose MVP

**16 custom plugins** + **6 built-in `@lexical/react` plugins**:

Custom plugins to include:
1. ToolbarPlugin -- main toolbar (strip font size/family/color controls for email)
2. ShortcutsPlugin -- keyboard shortcuts
3. FloatingTextFormatToolbarPlugin -- selection bubble toolbar
4. FloatingLinkEditorPlugin -- link editing
5. LinkPlugin -- link support
6. AutoLinkPlugin -- auto URL detection
7. MarkdownShortcutPlugin -- markdown typing shortcuts
8. MarkdownTransformers -- markdown serialization support
9. EmojisPlugin -- emoji rendering
10. ComponentPickerPlugin -- slash command menu (optional, nice UX)
11. EmojiPickerPlugin -- emoji picker via `:`
12. MentionsPlugin -- @mentions (if email contacts needed)
13. TabFocusPlugin -- tab navigation
14. PreserveSelectionPlugin -- selection state preservation
15. ImagesPlugin -- image insertion
16. DragDropPastePlugin -- drag-and-drop file handling

Built-in plugins:
1. RichTextPlugin -- core editing
2. HistoryPlugin -- undo/redo
3. ListPlugin -- lists
4. AutoFocusPlugin -- auto-focus on mount
5. CheckListPlugin -- checkboxes
6. ClickableLinkPlugin -- clickable links

**Justification**: This set covers all 22 available tiptap features while adding slash commands and emoji picker for improved UX. Excludes all table, code highlighting, collaboration, AI, embed, and dev plugins.

### Architecture Recommendations

1. **Use `defineExtension` + `LexicalExtensionComposer`** (newer API from playground `App.tsx:114-121`), not the older `LexicalComposer` from `editor-00`

2. **Consolidate themes**: Use the playground theme (`app/lexical/themes/editor-theme.ts`, 206 lines) as the canonical theme. It is strictly more complete than the shared theme. Remove the duplicate at `components/editor/themes/`.

3. **Preserve dual-callback API** from `editor-00`: `onChange(EditorState)` + `onSerializedChange(SerializedEditorState)` is the right external API. Extend it with a `onMarkdownChange(string)` callback for the markdown wire format requirement.

4. **Create modular node sets**: Define composable categories (`coreNodes`, `emailNodes`, `fullNodes`) instead of one flat 34-node array. Email compose needs only ~10 nodes.

5. **Implement fullscreen toggle independently**: The tiptap version uses MUI Portal + Backdrop + CSS fixed positioning. For Lexical, implement the same pattern using the existing `Portal` component pattern from shadcn/ui, or a simpler CSS-only approach with a fullscreen class toggle.

6. **Wire format: Markdown**: The `MarkdownTransformers` plugin already defines transformers for HR, IMAGE, EMOJI, EQUATION, TWEET, TABLE. Use `$convertToMarkdownString` and `$convertFromMarkdownString` from `@lexical/markdown` for the required Lexical-to-Markdown serialization.

7. **Extract toolbar as configurable component**: The playground ToolbarPlugin has sub-components (FontControls, ColorPickerGroup, etc.). For email compose, only a subset is needed. Design the toolbar with a `features` prop or slot pattern for configurability.

### Risks and Open Questions

1. **Fullscreen toggle needs implementation** -- not available in Lexical POC. Must be built for the canonical editor. Recommend studying the tiptap implementation pattern (state + Portal + CSS fixed + Escape key).

2. **Text Transform missing** -- Tiptap has a custom TextTransform extension. The Lexical theme has CSS classes for capitalize/uppercase/lowercase but no toggle command exists. Low priority for email compose MVP.

3. **Content format mismatch** -- Tiptap currently outputs HTML. Switching to Markdown may lose fidelity for complex formatting (images with captions, nested structures). Test MarkdownTransformers thoroughly.

4. **Two Composer APIs** -- The codebase has both `LexicalComposer` (older) and `LexicalExtensionComposer` (newer). Choosing the newer API means the canonical editor will differ from `editor-00`, requiring a migration path if `editor-00` is still used.

5. **Theme duplication** -- Two separate theme files exist. Consolidation is straightforward but must verify no downstream imports break.

6. **Send button is non-functional** -- Both mail compose and mail details Send buttons have no onClick handler. The canonical editor's content extraction will need to integrate with a real send mechanism.
