# Target Lexical Editor Analysis

Analysis of the existing Lexical editor implementation in `apps/todox/src/app/lexical/`.

## Executive Summary

The target editor is a comprehensive Lexical playground implementation with 40+ plugins, 31 custom node types, and support for real-time collaboration via Yjs WebSocket. It provides a full-featured document editing experience with tables, images, embeds, equations, and more. The architecture follows the Lexical plugin pattern with context providers for shared state management.

## Architecture Overview

### Component Hierarchy

```
PlaygroundApp (SettingsContext, FlashMessageContext)
    |
    v
App (LexicalCollaboration, LexicalExtensionComposer, SharedHistoryContext, TableContext, ToolbarContext)
    |
    v
Editor (40+ plugins, ContentEditable, floating UI elements)
```

### Entry Points

| Component | File | Purpose |
|-----------|------|---------|
| `PlaygroundApp` | `App.tsx` | Root with all context providers |
| `App` | `App.tsx` | Lexical composer setup and extension definition |
| `Editor` | `Editor.tsx` | Main editor component with plugin composition |

## Custom Nodes (31 Types)

The editor supports an extensive set of custom nodes:

### Text & Structure Nodes
| Node | File | Purpose |
|------|------|---------|
| `HeadingNode` | `@lexical/rich-text` | H1-H6 headings |
| `QuoteNode` | `@lexical/rich-text` | Block quotes |
| `ListNode` | `@lexical/list` | Ordered/unordered lists |
| `ListItemNode` | `@lexical/list` | List items |
| `CodeNode` | `@lexical/code` | Code blocks |
| `CodeHighlightNode` | `@lexical/code` | Syntax highlighting tokens |

### Interactive Nodes
| Node | File | Purpose |
|------|------|---------|
| `PollNode` | `nodes/PollNode.tsx` | Interactive polls |
| `StickyNode` | `nodes/StickyNode.tsx` | Sticky notes overlay |
| `ImageNode` | `nodes/ImageNode.tsx` | Images with captions |
| `ExcalidrawNode` | `nodes/ExcalidrawNode/` | Excalidraw drawings |

### Embed Nodes
| Node | File | Purpose |
|------|------|---------|
| `TweetNode` | `nodes/embeds/TweetNode.tsx` | Twitter/X embeds |
| `YouTubeNode` | `nodes/embeds/YouTubeNode.tsx` | YouTube video embeds |
| `FigmaNode` | `nodes/FigmaNode.tsx` | Figma design embeds |

### Table Nodes
| Node | File | Purpose |
|------|------|---------|
| `TableNode` | `@lexical/table` | Table container |
| `TableCellNode` | `@lexical/table` | Table cells |
| `TableRowNode` | `@lexical/table` | Table rows |

### Layout & Formatting Nodes
| Node | File | Purpose |
|------|------|---------|
| `LayoutContainerNode` | `nodes/LayoutContainerNode.ts` | Multi-column layouts |
| `LayoutItemNode` | `nodes/LayoutItemNode.ts` | Column items |
| `CollapsibleContainerNode` | `plugins/CollapsiblePlugin/` | Collapsible sections |
| `CollapsibleTitleNode` | `plugins/CollapsiblePlugin/` | Collapsible header |
| `CollapsibleContentNode` | `plugins/CollapsiblePlugin/` | Collapsible body |
| `PageBreakNode` | `nodes/PageBreakNode/` | Page break markers |
| `HorizontalRuleNode` | `@lexical/extension` | Horizontal dividers |

### Text Enhancement Nodes
| Node | File | Purpose |
|------|------|---------|
| `MentionNode` | `nodes/MentionNode.ts` | @mentions |
| `HashtagNode` | `@lexical/hashtag` | #hashtags |
| `EmojiNode` | `nodes/EmojiNode.tsx` | Custom emoji rendering |
| `KeywordNode` | `nodes/KeywordNode.ts` | Highlighted keywords |
| `EquationNode` | `nodes/EquationNode.tsx` | LaTeX equations |
| `DateTimeNode` | `nodes/DateTimeNode/` | Date/time stamps |
| `AutocompleteNode` | `nodes/AutocompleteNode.ts` | Autocomplete suggestions |

### Link Nodes
| Node | File | Purpose |
|------|------|---------|
| `LinkNode` | `@lexical/link` | Standard links |
| `AutoLinkNode` | `@lexical/link` | Auto-detected links |
| `MarkNode` | `@lexical/mark` | Text highlighting/marks |
| `OverflowNode` | `@lexical/overflow` | Overflow handling |

## Plugin System

### Plugin Categories

#### 1. Render/Essential Plugins
Always-active plugins that provide core functionality:

```typescript
<DragDropPaste />
<AutoFocusPlugin />
<ClearEditorPlugin />
<ComponentPickerPlugin />  // "/" command menu
<EmojiPickerPlugin />
<AutoEmbedPlugin />
<MentionsPlugin />
<EmojisPlugin />
<HashtagPlugin />
<KeywordsPlugin />
<AutoLinkPlugin />
<DateTimePlugin />
```

#### 2. Settings-Gated Plugins
Plugins controlled by settings context:

```typescript
{isMaxLength && <MaxLengthPlugin maxLength={30} />}
{isCodeHighlighted && (isCodeShiki ? <CodeHighlightShikiPlugin /> : <CodeHighlightPrismPlugin />)}
{isAutocomplete && <AutocompletePlugin />}
{selectionAlwaysOnDisplay && <SelectionAlwaysOnDisplay />}
{shouldUseLexicalContextMenu && <ContextMenuPlugin />}
{showTreeView && <TreeViewPlugin />}
{showTableOfContents && <TableOfContentsPlugin />}
```

#### 3. Rich Text Plugins
Plugins for rich text editing mode:

```typescript
<RichTextPlugin />
<MarkdownShortcutPlugin />
<ListPlugin hasStrictIndent={listStrictIndent} />
<CheckListPlugin />
<TablePlugin />
<TableCellResizer />
<TableScrollShadowPlugin />
<ImagesPlugin />
<LinkPlugin />
<PollPlugin />
<TwitterPlugin />
<YouTubePlugin />
<FigmaPlugin />
<ClickableLinkPlugin />
<EquationsPlugin />
<ExcalidrawPlugin />
<TabFocusPlugin />
<TabIndentationPlugin maxIndent={7} />
<CollapsiblePlugin />
<PageBreakPlugin />
<LayoutPlugin />
```

#### 4. Floating UI Plugins
Plugins with floating/anchored UI elements:

```typescript
{floatingAnchorElem && (
  <>
    <FloatingLinkEditorPlugin anchorElem={floatingAnchorElem} />
    <TableCellActionMenuPlugin anchorElem={floatingAnchorElem} />
  </>
)}

{floatingAnchorElem && !isSmallWidthViewport && (
  <>
    <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
    <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
    <TableHoverActionsV2Plugin anchorElem={floatingAnchorElem} />
    <FloatingTextFormatToolbarPlugin anchorElem={floatingAnchorElem} />
  </>
)}
```

#### 5. Collaboration Plugins
Plugins for real-time collaboration:

```typescript
{isCollab ? (
  useCollabV2 ? (
    <>
      <CollabV2 id={COLLAB_DOC_ID} shouldBootstrap={!skipCollaborationInit} />
      <VersionsPlugin id={COLLAB_DOC_ID} />
    </>
  ) : (
    <CollaborationPlugin id={COLLAB_DOC_ID} providerFactory={createWebsocketProvider} />
  )
) : (
  <HistoryPlugin externalHistoryState={historyState} />
)}

<CommentPlugin providerFactory={isCollab ? createWebsocketProviderWithDoc : undefined} />
```

## Toolbar Architecture

### ToolbarContext

The toolbar uses a context-based state management system:

```typescript
interface ToolbarContextShape {
  // Toolbar state management
  readonly toolbarState: ToolbarState;
  readonly updateToolbarState: <Key extends ToolbarStateKey>(key: Key, value: ToolbarStateValue<Key>) => void;

  // Active editor reference
  readonly activeEditor: LexicalEditor;
  readonly setActiveEditor: (editor: LexicalEditor) => void;

  // Block type accessors
  readonly blockType: BlockType;
  readonly setBlockType: (blockType: BlockType) => void;

  // Update callback
  readonly $updateToolbar: () => void;

  // Modal display
  readonly showModal: ShowModalFn;
}
```

### Toolbar State Properties

```typescript
const INITIAL_TOOLBAR_STATE = {
  bgColor: "#fff",
  blockType: "paragraph" as BlockType,
  canRedo: false,
  canUndo: false,
  codeLanguage: "",
  codeTheme: "",
  elementFormat: "left" as ElementFormatType,
  fontColor: "#000",
  fontFamily: "Arial",
  fontSize: "15px",
  fontSizeInputValue: "15",
  isBold: false,
  isCode: false,
  isHighlight: false,
  isImageCaption: false,
  isItalic: false,
  isLink: false,
  isRTL: false,
  isStrikethrough: false,
  isSubscript: false,
  isSuperscript: false,
  isUnderline: false,
  isLowercase: false,
  isUppercase: false,
  isCapitalize: false,
  rootType: "root" as RootType,
  listStartNumber: null as number | null,
  selectedElementKey: null as string | null,
};
```

### Selection Change Handling

The toolbar updates via `SELECTION_CHANGE_COMMAND`:

```typescript
useEffect(() => {
  return editor.registerCommand(
    SELECTION_CHANGE_COMMAND,
    (_payload, newEditor) => {
      setActiveEditor(newEditor);
      $updateToolbar();
      return false;
    },
    COMMAND_PRIORITY_CRITICAL
  );
}, [editor, $updateToolbar, setActiveEditor]);
```

## Extension Points for AI Integration

### 1. ComponentPickerPlugin (Slash Commands)

The "/" trigger command menu is the ideal place to add AI commands:

```typescript
// In ComponentPickerPlugin/index.tsx
const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
  allowWhitespace: true,
  minLength: 0,
});

// Add new AI options to getBaseOptions()
new ComponentPickerOption("Ask AI", {
  icon: <i className="icon sparkles" />,
  keywords: ["ai", "assistant", "help", "generate"],
  onSelect: () => {
    // Open AI dialog or trigger AI command
  },
}),
```

### 2. FloatingTextFormatToolbarPlugin

Can be extended to add AI button alongside formatting options:

```typescript
// Current toolbar buttons: bold, italic, underline, strikethrough, etc.
// Add AI button similar to source implementation

<button
  type="button"
  onClick={openAiPanel}
  className={cn(popupItemBase, popupItemSpaced)}
  title="AI Assistant"
>
  <i className={cn(formatIconBase, "sparkles")} />
</button>
```

### 3. Custom AI Command System

Create dedicated commands for AI operations:

```typescript
// Define AI commands
export const INSERT_AI_TEXT_COMMAND = createCommand<string>('INSERT_AI_TEXT');
export const REPLACE_WITH_AI_COMMAND = createCommand<string>('REPLACE_WITH_AI');
export const OPEN_AI_PANEL_COMMAND = createCommand<void>('OPEN_AI_PANEL');

// Register handlers
editor.registerCommand(
  INSERT_AI_TEXT_COMMAND,
  (text) => {
    // Insert AI-generated text at cursor
    return true;
  },
  COMMAND_PRIORITY_NORMAL
);
```

### 4. Toolbar Plugin Extension

Add AI section to the main toolbar:

```typescript
// In ToolbarPlugin/index.tsx, add AI dropdown
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="sm">
      <SparklesIcon className="h-4 w-4" />
      <span>AI</span>
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={() => triggerAi("improve")}>
      Improve Writing
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => triggerAi("summarize")}>
      Summarize
    </DropdownMenuItem>
    // ... more options
  </DropdownMenuContent>
</DropdownMenu>
```

## Collaboration Setup

### WebSocket Provider

```typescript
// collaboration.ts
const WEBSOCKET_ENDPOINT = params.get("collabEndpoint") || "ws://localhost:1234";
const WEBSOCKET_SLUG = "playground";
const WEBSOCKET_ID = params.get("collabId") || "0";

export function createWebsocketProvider(id: string, yjsDocMap: Map<string, Doc>): Provider {
  let doc = yjsDocMap.get(id);
  if (P.isUndefined(doc)) {
    doc = new Doc();
    yjsDocMap.set(id, doc);
  } else {
    doc.load();
  }
  return createWebsocketProviderWithDoc(id, doc);
}

export function createWebsocketProviderWithDoc(id: string, doc: Doc): Provider {
  return new WebsocketProvider(
    WEBSOCKET_ENDPOINT,
    `${WEBSOCKET_SLUG}/${WEBSOCKET_ID}/${id}`,
    doc,
    { connect: false }
  );
}
```

### Collaboration Plugin Usage

```typescript
<CollaborationPlugin
  id={COLLAB_DOC_ID}
  providerFactory={createWebsocketProvider}
  shouldBootstrap={!skipCollaborationInit}
/>
```

## Key Integration Considerations

### Selection Preservation

The target editor doesn't have a PreserveSelectionPlugin. This needs to be added for AI features:

```typescript
// Need to implement similar to source
export const SAVE_SELECTION_COMMAND = createCommand<null>('SAVE_SELECTION');
export const RESTORE_SELECTION_COMMAND = createCommand<null>('RESTORE_SELECTION');

export function PreserveSelectionPlugin() {
  const [editor] = useLexicalComposerContext();
  const savedSelection = useRef<RangeSelection | null>(null);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(SAVE_SELECTION_COMMAND, () => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          savedSelection.current = selection.clone();
        }
        return true;
      }, COMMAND_PRIORITY_LOW),
      editor.registerCommand(RESTORE_SELECTION_COMMAND, () => {
        if (savedSelection.current) {
          $setSelection(savedSelection.current);
        }
        return true;
      }, COMMAND_PRIORITY_LOW)
    );
  }, [editor]);

  return null;
}
```

### Floating Element Positioning

The target uses `setFloatingElemPosition` utility:

```typescript
// utils/setFloatingElemPosition.ts
export function setFloatingElemPosition(
  targetRect: DOMRect | null,
  floatingElem: HTMLElement,
  anchorElem: HTMLElement,
  isLink = false
): void {
  // Position calculation logic
}
```

For AI toolbar, consider using `@floating-ui` like the source for more robust positioning.

### Existing Floating UI Pattern

```typescript
// FloatingTextFormatToolbarPlugin uses a simple pattern
const $updateTextFormatFloatingToolbar = useCallback(() => {
  const selection = $getSelection();
  const popupElem = popupRef.current;
  const nativeSelection = getDOMSelection(editor._window);

  if (/* valid selection */) {
    const rangeRect = getDOMRangeRect(nativeSelection, rootElement);
    setFloatingElemPosition(rangeRect, popupElem, anchorElem, isLink);
  }
}, [editor, anchorElem, isLink]);
```

## Recommended Implementation Strategy

### Phase 1: Infrastructure
1. Add `PreserveSelectionPlugin` to plugin set
2. Create AI command definitions
3. Set up AI context provider for state management

### Phase 2: UI Integration
1. Add AI button to `FloatingTextFormatToolbarPlugin`
2. Create `FloatingAiToolbarPlugin` for AI operations
3. Add AI options to `ComponentPickerPlugin`

### Phase 3: Toolbar Integration
1. Add AI dropdown to main `ToolbarPlugin`
2. Integrate with existing toolbar context

### Phase 4: Collaboration Awareness
1. Add AI typing presence indicators
2. Handle concurrent AI operations
3. Sync AI results via Yjs

## File Locations for Modification

| Feature | File(s) to Modify |
|---------|-------------------|
| Slash commands | `plugins/ComponentPickerPlugin/index.tsx` |
| Selection toolbar | `plugins/FloatingTextFormatToolbarPlugin/index.tsx` |
| Main toolbar | `plugins/ToolbarPlugin/index.tsx` |
| Plugin registration | `Editor.tsx` |
| Node definitions | `nodes/PlaygroundNodes.ts` |
| Collaboration | `collaboration.ts` |
| Utility functions | `utils/` directory |

## Technical Constraints

1. **React 19** - Using latest React with new features
2. **Next.js 16** - App Router with RSC support
3. **Lexical latest** - Using `defineExtension` and `LexicalExtensionComposer`
4. **Effect patterns** - Must use Effect for error handling and services
5. **@beep/* imports** - Must use package aliases, not relative paths
6. **TypeScript strict** - No `any`, no `@ts-ignore`
