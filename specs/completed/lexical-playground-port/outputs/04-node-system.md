# shadcn-Editor Node System Analysis

## Executive Summary

The shadcn-editor implements **9 custom nodes** plus standard Lexical nodes, following consistent architecture patterns for serialization, DOM creation, and React integration.

## 1. Custom Nodes Defined

### Core Custom Nodes

1. **MentionNode** - User mentions with blue background styling
2. **ImageNode** - Complex decorator with nested editor for captions and resizing
3. **EmojiNode** - Emoji with custom class-based styling
4. **KeywordNode** - Immutable keyword tokens
5. **LayoutContainerNode** - CSS Grid container for layouts
6. **LayoutItemNode** - Grid layout items
7. **TweetNode** - Async Twitter widget embedding
8. **YouTubeNode** - YouTube iframe embedding
9. **AutocompleteNode** - Session-scoped autocomplete suggestions

### Base Classes Used

- `TextNode` - For text-like entities (Mention, Emoji, Keyword, Autocomplete)
- `DecoratorNode` - For complex interactive nodes (ImageNode)
- `DecoratorBlockNode` - For block-level embeds (Tweet, YouTube)
- `ElementNode` - For structural containers (LayoutContainer, LayoutItem)

## 2. Node Architecture Pattern

All nodes follow a consistent structure:

```typescript
export class CustomNode extends BaseNode {
  // Private state properties (prefixed with __)
  __customProperty: string

  // Static type identifier
  static getType(): string {
    return "custom"
  }

  // Clone for immutable updates
  static clone(node: CustomNode): CustomNode {
    return new CustomNode(node.__customProperty, node.__key)
  }

  // Constructor
  constructor(customProperty: string, key?: NodeKey) {
    super(key)
    this.__customProperty = customProperty
  }

  // DOM creation
  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement("span")
    dom.className = config.theme.customClass
    return dom
  }

  // DOM update (return true to replace, false to keep)
  updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig): boolean {
    return false
  }

  // JSON serialization
  static importJSON(serializedNode: SerializedCustomNode): CustomNode {
    return $createCustomNode(serializedNode.customProperty)
  }

  exportJSON(): SerializedCustomNode {
    return {
      ...super.exportJSON(),
      type: "custom",
      customProperty: this.__customProperty,
      version: 1,
    }
  }
}
```

## 3. Node Implementation Examples

### EmojiNode (TextNode-based)

```typescript
export class EmojiNode extends TextNode {
  __className: string

  static getType(): string {
    return "emoji"
  }

  static clone(node: EmojiNode): EmojiNode {
    return new EmojiNode(node.__className, node.__text, node.__key)
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement("span")
    const inner = super.createDOM(config)
    dom.className = this.__className
    inner.className = "emoji-inner"
    dom.appendChild(inner)
    return dom
  }

  exportJSON(): SerializedEmojiNode {
    return {
      ...super.exportJSON(),
      className: this.getClassName(),
    }
  }
}
```

### ImageNode (DecoratorNode-based)

```typescript
export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string
  __altText: string
  __width: "inherit" | number
  __height: "inherit" | number
  __maxWidth: number
  __showCaption: boolean
  __caption: LexicalEditor  // Nested editor for captions!
  __captionsEnabled: boolean

  static getType(): string {
    return "image"
  }

  exportJSON(): SerializedImageNode {
    return {
      type: "image",
      altText: this.__altText,
      caption: this.__caption.getEditorState().toJSON(),
      height: this.__height,
      maxWidth: this.__maxWidth,
      showCaption: this.__showCaption,
      src: this.__src,
      width: this.__width,
      version: 1,
    }
  }

  // DecoratorNode returns React component
  decorate(): JSX.Element {
    return (
      <Suspense fallback={null}>
        <ImageComponent nodeKey={this.__key} {...this.__data} />
      </Suspense>
    )
  }
}
```

### YouTubeNode (DecoratorBlockNode-based)

```typescript
export class YouTubeNode extends DecoratorBlockNode {
  __id: string

  static getType(): string {
    return "youtube"
  }

  static clone(node: YouTubeNode): YouTubeNode {
    return new YouTubeNode(node.__id, node.__format, node.__key)
  }

  updateDOM(): false {
    return false
  }

  decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element {
    const embedBlockTheme = config.theme.embedBlock || {}
    const className = {
      base: embedBlockTheme.base || "",
      focus: embedBlockTheme.focus || "",
    }
    return (
      <YouTubeComponent
        className={className}
        format={this.__format}
        nodeKey={this.getKey()}
        videoID={this.__id}
      />
    )
  }
}
```

### LayoutContainerNode (ElementNode-based)

```typescript
export class LayoutContainerNode extends ElementNode {
  __templateColumns: string

  static getType(): string {
    return "layout-container"
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement("div")
    dom.style.gridTemplateColumns = this.__templateColumns
    if (typeof config.theme.layoutContainer === "string") {
      addClassNamesToElement(dom, config.theme.layoutContainer)
    }
    return dom
  }

  updateDOM(prevNode: LayoutContainerNode, dom: HTMLElement): boolean {
    if (prevNode.__templateColumns !== this.__templateColumns) {
      dom.style.gridTemplateColumns = this.__templateColumns
    }
    return false
  }

  canBeEmpty(): boolean {
    return false
  }
}
```

## 4. Node Registration

Nodes are registered in `nodes.ts`:

```typescript
export const nodes: ReadonlyArray<Klass<LexicalNode> | LexicalNodeReplacement> = [
  // Built-in nodes
  HeadingNode,
  ParagraphNode,
  TextNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  LinkNode,

  // Extended nodes
  OverflowNode,
  HashtagNode,

  // Tables
  TableNode,
  TableCellNode,
  TableRowNode,

  // Code
  CodeNode,
  CodeHighlightNode,

  // Custom decorators
  HorizontalRuleNode,
  MentionNode,
  ImageNode,
  EmojiNode,
  KeywordNode,
  LayoutContainerNode,
  LayoutItemNode,

  // Embeds
  AutoLinkNode,
  TweetNode,
  YouTubeNode,

  // UI
  AutocompleteNode,
]
```

## 5. Serialization Strategy

### JSON Serialization

```typescript
// Export
exportJSON(): SerializedCustomNode {
  return {
    ...super.exportJSON(),
    type: "custom",
    customProperty: this.__customProperty,
    version: 1,
  }
}

// Import
static importJSON(serializedNode: SerializedCustomNode): CustomNode {
  return $createCustomNode(serializedNode.customProperty)
    .updateFromJSON(serializedNode)
}
```

### HTML Serialization

```typescript
exportDOM(editor: LexicalEditor): DOMExportOutput {
  const element = document.createElement("span")
  element.setAttribute("data-lexical-mention", "true")
  element.textContent = this.__mention
  return { element }
}

static importDOM(): DOMConversionMap | null {
  return {
    span: (domNode: HTMLElement) => {
      if (!domNode.hasAttribute("data-lexical-mention")) {
        return null
      }
      return {
        conversion: $convertMentionElement,
        priority: 1,
      }
    },
  }
}
```

## 6. shadcn Integration

### Theme-Based Styling

All nodes use theme classes from `EditorConfig`:

```typescript
createDOM(config: EditorConfig): HTMLElement {
  const dom = document.createElement("span")
  const className = config.theme.mention  // From theme object
  if (className) {
    dom.className = className
  }
  return dom
}
```

### Decorator Components

Complex nodes render React components with shadcn UI:

```typescript
// ImageComponent uses shadcn Button, Input
function ImageComponent({ nodeKey, src, altText, showCaption, caption }) {
  return (
    <div className="relative">
      <img src={src} alt={altText} />
      {showCaption && (
        <div className="caption">
          <NestedLexicalEditor initialState={caption} />
        </div>
      )}
      <ImageResizer nodeKey={nodeKey} />
    </div>
  )
}

// YouTubeComponent uses Tailwind classes
function YouTubeComponent({ videoID, format, className }) {
  return (
    <BlockWithAlignableContents
      format={format}
      className={className}
    >
      <iframe
        className="aspect-video w-full"
        src={`https://www.youtube-nocookie.com/embed/${videoID}`}
        allowFullScreen
      />
    </BlockWithAlignableContents>
  )
}
```

## 7. Node Lifecycle Methods

| Method | Purpose |
|--------|---------|
| `getType()` | Static method returning unique node identifier |
| `clone()` | Create a copy of the node |
| `createDOM()` | Generate DOM representation |
| `updateDOM()` | Update existing DOM (returns `true` to replace, `false` to keep) |
| `importJSON()` | Deserialize from state |
| `exportJSON()` | Serialize to state |
| `importDOM()` | HTML to node conversion |
| `exportDOM()` | Node to HTML conversion |
| `decorate()` | For DecoratorNodes: return React component |

## 8. Key Patterns

### Pattern 1: Immutable Updates

```typescript
setCustomProperty(property: string): this {
  const self = this.getWritable()
  self.__customProperty = property
  return self
}

getCustomProperty(): string {
  const self = this.getLatest()
  return self.__customProperty
}
```

### Pattern 2: Factory Functions

```typescript
export function $createMentionNode(mentionName: string): MentionNode {
  const mentionNode = new MentionNode(mentionName)
  mentionNode.setMode("segmented").toggleDirectionless()
  return $applyNodeReplacement(mentionNode)
}

export function $isMentionNode(
  node: LexicalNode | null | undefined
): node is MentionNode {
  return node instanceof MentionNode
}
```

### Pattern 3: Mode Configuration

```typescript
// In constructor
this.setMode("token")  // or "segmented"
this.toggleDirectionless()
```

### Pattern 4: Nested Editors (ImageNode)

```typescript
__caption: LexicalEditor

constructor(...) {
  this.__caption = createEditor({
    nodes: [],
    onError: (error) => console.error(error),
  })
}

exportJSON() {
  return {
    caption: this.__caption.getEditorState().toJSON(),
  }
}
```

## Summary

| Aspect | Details |
|--------|---------|
| **Custom Nodes** | 9 custom implementations |
| **Base Classes** | TextNode, DecoratorNode, DecoratorBlockNode, ElementNode |
| **Serialization** | JSON (primary), HTML (import/export), Markdown (transformers) |
| **React Integration** | DecoratorNode.decorate() returns JSX |
| **Theme Integration** | Via EditorConfig.theme class mappings |
| **Nested Editors** | Supported (ImageNode captions) |
| **Immutable Pattern** | getWritable()/getLatest() for safe updates |
