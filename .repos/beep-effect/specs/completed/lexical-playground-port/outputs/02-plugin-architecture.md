# shadcn-Editor Plugin Architecture Analysis

## Executive Summary

The shadcn-editor uses a **component-based plugin architecture** built on top of Lexical with React 19 and Next.js 16. It leverages **shadcn/ui components** and **Lucide icons** to create a rich, modular editing experience.

## 1. Available Plugins (80+ files)

### Plugin Categories

#### **Core Plugins (5)**
- `RichTextPlugin` - Base text editing
- `HistoryPlugin` - Undo/redo
- `ClearEditorPlugin` - Clear content
- `TablePlugin` - Table support
- `ListPlugin` - List support

#### **Toolbar Plugins (17)**
- `HistoryToolbarPlugin` - Undo/redo buttons
- `BlockFormatToolbarPlugin` - Format selector (paragraph, h1-h3, lists, code, quote)
- `BlockInsertPlugin` - Insert blocks menu
- `FontFormatToolbarPlugin` - Bold, italic, underline, strikethrough
- `FontSizeToolbarPlugin` - Font size adjustment
- `FontFamilyToolbarPlugin` - Font family selection
- `FontColorToolbarPlugin` - Text color picker
- `FontBackgroundToolbarPlugin` - Background color picker
- `LinkToolbarPlugin` - Link insertion
- `ElementFormatToolbarPlugin` - Text alignment
- `SubSuperToolbarPlugin` - Subscript/superscript
- `CodeLanguageToolbarPlugin` - Code block language selector
- `ClearFormattingToolbarPlugin` - Clear formatting

#### **Block Insert Plugins (5)**
- `InsertImage` - Image insertion
- `InsertTable` - Table insertion
- `InsertHorizontalRule` - Divider
- `InsertColumnsLayout` - Column layouts
- `InsertEmbeds` - Embed content

#### **Floating Plugins (2)**
- `FloatingTextFormatToolbarPlugin` - Selection-triggered formatting toolbar
- `FloatingLinkEditorPlugin` - Link editing popup

#### **Picker Plugins (14)**
- Block format pickers: Heading, Paragraph, Quote, Code, CheckList, NumberedList, BulletedList
- Embed pickers: YouTube, Twitter, Images
- Layout pickers: Alignment, Columns
- Divider picker
- Table pickers (static and dynamic)

#### **Action Plugins (11)**
- `ImportExportPlugin` - Import/export JSON
- `MarkdownTogglePlugin` - Markdown view
- `ShareContentPlugin` - Share functionality
- `SpeechToTextPlugin` - Voice input
- `TreeViewPlugin` - Document structure
- `EditModeTogglePlugin` - Read-only mode
- `ClearEditorPlugin` - Clear all
- `CharacterLimitPlugin` - Character count with limit
- `CounterCharacterPlugin` - Character counter
- `MaxLengthPlugin` - Max length enforcement

#### **Feature Plugins (15)**
- `ComponentPickerMenuPlugin` - "/" command menu
- `AutocompletePlugin` - Autocomplete suggestions
- `AutoLinkPlugin` - Auto-link detection
- `LinkPlugin` - Link support
- `MentionsPlugin` - @mentions
- `KeywordsPlugin` - Keyword detection
- `EmojisPlugin` - Emoji support
- `EmojiPickerPlugin` - Emoji picker
- `ImagesPlugin` - Image support
- `LayoutPlugin` - Column layouts
- `DraggableBlockPlugin` - Block drag-and-drop
- `DragDropPastePlugin` - Drag/drop paste
- `TabFocusPlugin` - Tab navigation
- `TypingPerfPlugin` - Performance monitoring
- `ListMaxIndentLevelPlugin` - Indent limiting

#### **Embed Plugins (4)**
- `YouTubePlugin` - YouTube embed with command
- `TwitterPlugin` - Twitter embed
- `AutoEmbedPlugin` - Auto-detect embeds
- `CodeHighlightPlugin` - Syntax highlighting

#### **Context Plugins (2)**
- `ContextMenuPlugin` - Right-click context menu
- `CodeActionMenuPlugin` - Code block action menu

## 2. File Organization & Structure

```
registry/new-york-v4/editor/
├── plugins/                          # 80 plugin files
│   ├── plugins.tsx                   # Main plugin orchestrator
│   ├── toolbar/                      # Toolbar plugins (17 files)
│   │   ├── toolbar-plugin.tsx        # Context provider
│   │   ├── block-format/             # Block format utilities (9 files)
│   │   │   ├── block-format-data.tsx # Icon & label mappings
│   │   │   ├── format-paragraph.tsx
│   │   │   ├── format-heading.tsx
│   │   │   └── format-*.tsx          # Other formats
│   │   ├── block-insert/             # Insert utilities (5 files)
│   │   │   ├── insert-image.tsx
│   │   │   ├── insert-table.tsx
│   │   │   └── insert-*.tsx
│   │   └── *-toolbar-plugin.tsx      # Individual toolbar plugins
│   ├── actions/                      # Action plugins (11 files)
│   │   ├── actions-plugin.tsx        # Wrapper
│   │   └── *-plugin.tsx
│   ├── picker/                       # Picker plugins (15 files)
│   │   ├── component-picker-option.tsx  # Base class
│   │   └── *-picker-plugin.tsx
│   ├── embeds/                       # Embed plugins (3 files)
│   │   ├── youtube-plugin.tsx
│   │   ├── twitter-plugin.tsx
│   │   └── auto-embed-plugin.tsx
│   ├── floating-text-format-plugin.tsx
│   ├── floating-link-editor-plugin.tsx
│   ├── component-picker-menu-plugin.tsx
│   └── ...
├── context/                          # React Context
│   └── toolbar-context.tsx          # Toolbar state management
├── editor-hooks/                    # Custom hooks
│   ├── use-update-toolbar.ts        # Toolbar update hook
│   ├── use-modal.tsx                # Modal management
│   └── use-debounce.ts              # Debounce utility
└── editor-ui/                       # Custom UI components
    ├── color-picker.tsx             # Advanced color picker
    ├── image-resizer.tsx            # Image resize UI
    └── content-editable.tsx         # Main editor content area
```

## 3. Plugin Interface & Pattern

### Base Plugin Pattern

All plugins follow the **React FC (Functional Component)** pattern:

```typescript
// Simple pass-through wrapper
export function PluginName() {
  return <LexicalPluginComponent />
}

// Plugin with editor interaction
export function PluginName() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(COMMAND, handler, PRIORITY)
  }, [editor])

  return null  // Most return null (headless plugins)
}
```

### Plugin Composition Pattern

Plugins are composed in `plugins.tsx`:

```typescript
<ToolbarPlugin>
  {({ blockType }) => (
    <div className="toolbar">
      <HistoryToolbarPlugin />
      <BlockFormatDropDown>
        <FormatParagraph />
        <FormatHeading levels={["h1", "h2", "h3"]} />
      </BlockFormatDropDown>
    </div>
  )}
</ToolbarPlugin>

<FloatingTextFormatToolbarPlugin
  anchorElem={floatingAnchorElem}
  setIsLinkEditMode={setIsLinkEditMode}
/>
```

## 4. Toolbar Plugins Pattern

### Example: FontFormatToolbarPlugin

```typescript
export function FontFormatToolbarPlugin() {
  const { activeEditor } = useToolbarContext()
  const [activeFormats, setActiveFormats] = useState<string[]>([])

  const $updateToolbar = useCallback((selection: BaseSelection) => {
    if ($isRangeSelection(selection)) {
      const formats: string[] = []
      FORMATS.forEach(({ format }) => {
        if (selection.hasFormat(format as TextFormatType)) {
          formats.push(format)
        }
      })
      setActiveFormats(formats)
    }
  }, [])

  useUpdateToolbarHandler($updateToolbar)

  return (
    <ToggleGroup
      type="multiple"
      value={activeFormats}
      onValueChange={setActiveFormats}
    >
      {FORMATS.map(({ format, icon: Icon, label }) => (
        <ToggleGroupItem
          key={format}
          value={format}
          onClick={() => {
            activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, format)
          }}
        >
          <Icon className="size-4" />
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
```

### Toolbar Data Mapping

Block format data is centralized in `block-format-data.tsx`:

```typescript
export const blockTypeToBlockName = {
  paragraph: { label: "Paragraph", icon: <TextIcon /> },
  h1: { label: "Heading 1", icon: <Heading1Icon /> },
  h2: { label: "Heading 2", icon: <Heading2Icon /> },
  h3: { label: "Heading 3", icon: <Heading3Icon /> },
  number: { label: "Numbered List", icon: <ListOrderedIcon /> },
  bullet: { label: "Bulleted List", icon: <ListIcon /> },
  check: { label: "Check List", icon: <ListTodoIcon /> },
  code: { label: "Code Block", icon: <CodeIcon /> },
  quote: { label: "Quote", icon: <QuoteIcon /> },
}
```

## 5. Floating Plugins Pattern

### FloatingTextFormatToolbarPlugin

Shows formatting toolbar when text is selected:

```typescript
function FloatingTextFormat({
  editor,
  anchorElem,
  isBold, isItalic, isUnderline, isStrikethrough,
  isCode, isSubscript, isSuperscript, isLink,
  setIsLinkEditMode,
}: {...}): JSX.Element {
  const popupCharStylesEditorRef = useRef<HTMLDivElement | null>(null)

  const $updateTextFormatFloatingToolbar = useCallback(() => {
    const selection = $getSelection()
    const nativeSelection = window.getSelection()

    if (selection !== null && nativeSelection !== null &&
        !nativeSelection.isCollapsed) {
      const rangeRect = getDOMRangeRect(nativeSelection, rootElement)
      setFloatingElemPosition(
        rangeRect,
        popupCharStylesEditorElem,
        anchorElem,
        isLink
      )
    }
  }, [editor, anchorElem, isLink])

  return (
    <div ref={popupCharStylesEditorRef} className="floating-toolbar">
      <ToggleGroup>
        <ToggleGroupItem onClick={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")
        }>
          <BoldIcon />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
```

## 6. Component Picker Menu Plugin Pattern

Uses Lexical's `LexicalTypeaheadMenuPlugin` for "/" command menu:

```typescript
export function ComponentPickerMenuPlugin({
  baseOptions = [],
  dynamicOptionsFn,
}: {
  baseOptions?: Array<ComponentPickerOption>
  dynamicOptionsFn?: ({ queryString }: { queryString: string }) => Array<ComponentPickerOption>
}): JSX.Element {
  const [editor] = useLexicalComposerContext()
  const [queryString, setQueryString] = useState<string | null>(null)

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
  })

  return (
    <LexicalTypeaheadMenuPlugin<ComponentPickerOption>
      onQueryChange={setQueryString}
      onSelectOption={(option) => {
        option.onSelect(queryString || "", editor, showModal)
        return true
      }}
      triggerFn={checkForTriggerMatch}
      options={queryString ? dynamicOptionsFn?.({ queryString }) || [] : baseOptions}
    />
  )
}
```

## 7. shadcn Components Used in Plugins

| Component | Usage | Example |
|-----------|-------|---------|
| **Button** | Toolbar buttons, actions | `<Button><Icon /></Button>` |
| **ToggleGroup** | Multi-select formatting | `<ToggleGroup type="multiple">` |
| **Select** | Dropdown menus | `<Select value={blockType}>` |
| **Input** | Text input (link URL) | `<Input value={url} />` |
| **Command** | Command menu for "/" picker | `<Command><CommandList>` |
| **Popover** | Floating UI (color picker) | `<Popover>` |
| **Dialog** | Modal dialogs | `<Dialog>` |
| **Separator** | Visual dividers | `<Separator orientation="vertical" />` |
| **Tooltip** | Hover hints | Via shadcn tooltip |

## 8. Plugin State Management

### Toolbar Context Pattern

```typescript
const Context = createContext<{
  activeEditor: LexicalEditor
  $updateToolbar: () => void
  blockType: string
  setBlockType: (blockType: string) => void
  showModal: (title: string, showModal: (onClose: () => void) => JSX.Element) => void
}>({...})

export function useToolbarContext() {
  return useContext(Context)
}
```

### Modal Management Hook

```typescript
export function useEditorModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState("")
  const [modalContent, setModalContent] = useState<React.ReactNode>(null)

  const showModal = useCallback((title: string, content: (onClose: () => void) => JSX.Element) => {
    setModalTitle(title)
    setIsOpen(true)
    setModalContent(() => content(() => setIsOpen(false)))
  }, [])

  return [modal, showModal] as const
}
```

## 9. Icons & Icon Sources

### Lucide React Icons Used

**Formatting Icons:**
- `BoldIcon`, `ItalicIcon`, `UnderlineIcon`, `StrikethroughIcon`
- `SubscriptIcon`, `SuperscriptIcon`
- `CodeIcon`

**Block Format Icons:**
- `TextIcon` (paragraph)
- `Heading1Icon`, `Heading2Icon`, `Heading3Icon`
- `ListIcon` (bulleted)
- `ListOrderedIcon` (numbered)
- `ListTodoIcon` (checklist)
- `QuoteIcon` (quote)

**Editor Icons:**
- `LinkIcon`, `TableIcon`, `ImageIcon`, `PlusIcon`
- `ScissorsIcon` (divider)
- `Columns3Icon` (layout)
- `GripVerticalIcon` (draggable)

**Action Icons:**
- `UndoIcon`, `RedoIcon`
- `EraserIcon`, `DownloadIcon`, `UploadIcon`
- `MicIcon`, `FileTextIcon`, `SendIcon`
- `Trash2Icon`, `Pencil`, `Check`, `X`

## 10. Key Technical Patterns

### Pattern 1: Selection Change Listening

```typescript
useUpdateToolbarHandler($updateToolbar)

export function useUpdateToolbarHandler(
  callback: (selection: BaseSelection) => void
) {
  const [editor] = useLexicalComposerContext()
  const { activeEditor } = useToolbarContext()

  useEffect(() => {
    return activeEditor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        const selection = $getSelection()
        if (selection) callback(selection)
        return false
      },
      COMMAND_PRIORITY_CRITICAL
    )
  }, [editor, callback])
}
```

### Pattern 2: Command Registration

```typescript
export const INSERT_YOUTUBE_COMMAND: LexicalCommand<string> = createCommand(
  "INSERT_YOUTUBE_COMMAND"
)

useEffect(() => {
  return editor.registerCommand<string>(
    INSERT_YOUTUBE_COMMAND,
    (payload) => {
      const youTubeNode = $createYouTubeNode(payload)
      $insertNodeToNearestRoot(youTubeNode)
      return true
    },
    COMMAND_PRIORITY_EDITOR
  )
}, [editor])
```

## Summary Table

| Aspect | Details |
|--------|---------|
| **Total Plugins** | 80+ components |
| **Main Categories** | Toolbar, Floating, Actions, Pickers, Embeds, Context |
| **UI Library** | shadcn/ui components |
| **Icons** | lucide-react (40+ icons) |
| **State Management** | React Context + Local useState |
| **Lexical Integration** | Commands, listeners, mutation tracking |
| **Custom Components** | ColorPicker, ImageResizer, CodeButton |
