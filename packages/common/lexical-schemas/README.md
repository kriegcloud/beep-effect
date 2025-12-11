# @beep/lexical-schemas

100% type-safe Effect Schema validation for Lexical editor state.

## Overview

This package provides Effect Schemas for validating Lexical's serialized editor state, enabling type-safe persistence and runtime validation. It replaces the unsafe `S.optional(S.Any)` pattern with proper discriminated union schemas.

## Installation

```bash
bun add @beep/lexical-schemas
```

## Quick Start

```typescript
import { SerializedEditorState, decodeEditorStateUnknownSync } from "@beep/lexical-schemas";
import * as S from "effect/Schema";

// Validate editor state from JSON (e.g., from database or API)
const editorState = decodeEditorStateUnknownSync(jsonInput);

// Type-safe access to nodes
const rootChildren = editorState.root.children;

// Encode back to JSON for persistence
const encoded = S.encodeSync(SerializedEditorState)(editorState);
```

## Schema Hierarchy

```
SerializedEditorState
└── root: SerializedRootNode
    └── children: SerializedLexicalNode[]
        ├── text          - Text leaf with formatting
        ├── linebreak     - Line break character
        ├── tab           - Tab character
        ├── paragraph     - Paragraph container
        ├── heading       - Heading (h1-h6)
        ├── quote         - Blockquote
        ├── list          - Ordered/unordered/checkbox list
        ├── listitem      - List item
        ├── code          - Code block
        ├── code-highlight- Syntax-highlighted code token
        ├── link          - Hyperlink
        ├── autolink      - Auto-detected link
        └── horizontalrule- Horizontal separator
```

## Usage Examples

### Validating Editor State

```typescript
import { decodeEditorStateUnknownSync } from "@beep/lexical-schemas";

// From API/database
const json = await fetchEditorContent();
try {
  const editorState = decodeEditorStateUnknownSync(json);
  // editorState is fully typed!
} catch (error) {
  // ParseError with detailed path information
  console.error("Invalid editor state:", error);
}
```

### Pattern Matching on Node Types

```typescript
import * as Match from "effect/Match";
import type { SerializedLexicalNode } from "@beep/lexical-schemas";

const describeNode = (node: SerializedLexicalNode.Type): string =>
  Match.value(node).pipe(
    Match.when({ type: "text" }, (n) => `Text: "${n.text}"`),
    Match.when({ type: "paragraph" }, (n) => `Paragraph with ${n.children.length} children`),
    Match.when({ type: "heading" }, (n) => `Heading ${n.tag}`),
    Match.when({ type: "list" }, (n) => `${n.listType} list`),
    Match.when({ type: "link" }, (n) => `Link to ${n.url}`),
    Match.orElse((n) => n.type)
  );
```

### Replacing S.Any in Your Routes

```typescript
// Before (no validation):
contentRich: S.optional(S.Any)

// After (full validation):
import { SerializedEditorState } from "@beep/lexical-schemas";
contentRich: S.optional(SerializedEditorState)
```

## Supported Node Types

### Core Nodes

| Type | Description | Container |
|------|-------------|-----------|
| `text` | Text content with formatting | No |
| `linebreak` | Line break (`\n`) | No |
| `tab` | Tab character | No |
| `paragraph` | Standard text container | Yes |
| `root` | Top-level editor container | Yes |

### Rich Text Nodes (lexical-rich-text)

| Type | Description | Container |
|------|-------------|-----------|
| `heading` | Heading levels h1-h6 | Yes |
| `quote` | Blockquote | Yes |

### List Nodes (lexical-list)

| Type | Description | Container |
|------|-------------|-----------|
| `list` | Ordered/unordered/checkbox list | Yes |
| `listitem` | Individual list item | Yes |

### Code Nodes (lexical-code)

| Type | Description | Container |
|------|-------------|-----------|
| `code` | Code block with language | Yes |
| `code-highlight` | Syntax-highlighted token | No |

### Link Nodes (lexical-link)

| Type | Description | Container |
|------|-------------|-----------|
| `link` | Hyperlink | Yes |
| `autolink` | Auto-detected link | Yes |

### Decorator Nodes

| Type | Description | Container |
|------|-------------|-----------|
| `horizontalrule` | Horizontal separator | No |

## Text Formatting

Text nodes use a 32-bit bitmask for formatting:

| Format | Value | Description |
|--------|-------|-------------|
| Bold | 0x001 | **Bold text** |
| Italic | 0x002 | *Italic text* |
| Strikethrough | 0x004 | ~~Strikethrough~~ |
| Underline | 0x008 | Underlined text |
| Code | 0x010 | `Inline code` |
| Highlight | 0x020 | Highlighted text |
| Subscript | 0x040 | Subscript |
| Superscript | 0x080 | Superscript |

Formats can be combined: `format: 3` = bold + italic.

## API Reference

### Main Exports

- `SerializedEditorState` - Top-level editor state schema
- `SerializedLexicalNode` - Union of all node types
- `decodeEditorStateUnknownSync` - Validate unknown input
- `decodeEditorStateSync` - Validate typed input
- `encodeEditorStateSync` - Encode to JSON

### Type Helpers

```typescript
import type { SerializedEditorState, SerializedLexicalNode } from "@beep/lexical-schemas";

// Full editor state type
type EditorState = SerializedEditorState.Type;

// Any node type (for pattern matching)
type AnyNode = SerializedLexicalNode.Type;
```

## Extension Guide

To add custom node types, extend the union:

```typescript
import * as S from "effect/Schema";
import { SerializedLexicalNode } from "@beep/lexical-schemas";

const CustomCalloutNode = S.Struct({
  type: S.Literal("callout"),
  version: S.Number,
  calloutType: S.Union(S.Literal("info"), S.Literal("warning"), S.Literal("error")),
  children: S.Array(SerializedLexicalNode),
  // ... other fields
});

const ExtendedLexicalNode = S.Union(
  SerializedLexicalNode,
  CustomCalloutNode
);
```

## License

MIT
