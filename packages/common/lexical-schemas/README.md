# @beep/lexical-schemas

100% type-safe Effect Schema validation for Lexical editor state.

## Purpose

This package provides Effect Schemas for validating Lexical's serialized editor state, enabling type-safe persistence and runtime validation. It replaces the unsafe `S.optional(S.Any)` pattern with proper discriminated union schemas that provide:

- **Runtime validation** - Validate editor content from databases or APIs
- **Type safety** - Full TypeScript inference for all node types
- **Pattern matching** - Exhaustive discriminated union handling
- **Error reporting** - Detailed parse errors with field-level diagnostics

This is a **common layer** package consumed by `apps/notes` and potentially other packages that need to persist rich text content.

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/lexical-schemas": "workspace:*"
```

## Key Exports

| Export | Description |
|--------|-------------|
| `SerializedEditorState` | Top-level editor state schema |
| `SerializedLexicalNode` | Discriminated union of all node types |
| `SerializedRootNode` | Root container node schema |
| `decodeEditorStateUnknownSync` | Synchronous validation from unknown input |
| `decodeEditorStateSync` | Synchronous validation from typed input |
| `encodeEditorStateSync` | Encode to JSON for persistence |

## Usage

### Basic Validation

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

### Effect-Based Validation

```typescript
import { SerializedEditorState } from "@beep/lexical-schemas";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const validateEditorContent = (input: unknown) =>
  Effect.gen(function* () {
    const editorState = yield* S.decodeUnknown(SerializedEditorState)(input);
    return editorState;
  });

// With error handling
const program = validateEditorContent(jsonInput).pipe(
  Effect.catchTag("ParseError", (error) =>
    Effect.fail({ _tag: "InvalidEditorContent" as const, cause: error })
  )
);
```

### Pattern Matching on Node Types

Use `effect/Match` with `Match.tag` for exhaustive pattern matching on discriminated unions:

```typescript
import * as Match from "effect/Match";
import * as A from "effect/Array";
import * as F from "effect/Function";
import type { SerializedLexicalNode } from "@beep/lexical-schemas";

const describeNode = (node: SerializedLexicalNode.Type): string =>
  Match.value(node).pipe(
    Match.tag("text", (n) => `Text: "${n.text}"`),
    Match.tag("paragraph", (n) =>
      `Paragraph with ${F.pipe(n.children, A.length)} children`
    ),
    Match.tag("heading", (n) => `Heading ${n.tag}`),
    Match.tag("list", (n) => `${n.listType} list`),
    Match.tag("link", (n) => `Link to ${n.url}`),
    Match.orElse((n) => n.type)
  );
```

### Traversing Editor State

```typescript
import * as A from "effect/Array";
import * as F from "effect/Function";
import type { SerializedEditorState } from "@beep/lexical-schemas";

const extractAllText = (state: SerializedEditorState.Type): string[] => {
  const collectText = (nodes: readonly SerializedLexicalNode.Type[]): string[] =>
    F.pipe(
      nodes,
      A.flatMap((node) => {
        if (node.type === "text") return [node.text];
        if ("children" in node) return collectText(node.children);
        return [];
      })
    );

  return collectText(state.root.children);
};
```

### Replacing S.Any in Your Schemas

```typescript
// Before (no validation):
import * as S from "effect/Schema";

const DocumentSchema = S.Struct({
  title: S.String,
  contentRich: S.optional(S.Any), // Unsafe!
});

// After (full validation):
import { SerializedEditorState } from "@beep/lexical-schemas";
import * as S from "effect/Schema";

const DocumentSchema = S.Struct({
  title: S.String,
  contentRich: S.optional(SerializedEditorState),
});
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

## Extension Guide

To add custom node types, extend the union in `src/nodes/element.ts`:

```typescript
// In element.ts, add to the S.Union inside SerializedLexicalNode:
S.Struct({
  type: S.tag("callout"),  // Use S.tag for discriminator
  version: S.Number,
  calloutType: S.Union(S.Literal("info"), S.Literal("warning"), S.Literal("error")),
  children: S.Array(SerializedLexicalNode),
  direction: TextDirectionType,
  format: ElementFormatType,
  indent: S.Number,
  textFormat: S.optional(S.Number),
  textStyle: S.optional(S.String),
}),

// Then add to the namespace Type union:
export declare namespace SerializedLexicalNode {
  type CalloutNode = {
    readonly type: "callout";
    readonly version: number;
    readonly calloutType: "info" | "warning" | "error";
    readonly children: ReadonlyArray<Type>;
    readonly direction: "ltr" | "rtl" | null;
    readonly format: "left" | "start" | "center" | "right" | "end" | "justify" | "";
    readonly indent: number;
    readonly textFormat?: number;
    readonly textStyle?: string;
  };

  export type Type =
    | TextNode
    | LineBreakNode
    // ... existing types
    | CalloutNode;  // Add here
}
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `effect` | Effect Schema runtime and utilities |
| `@beep/identity` | Package identity annotations |
| `@beep/schema` | Base schema utilities (peer) |
| `@beep/invariant` | Assertion helpers (peer) |

## Integration

This package is consumed by:
- `apps/notes` - Rich text content validation for note documents
- Any package needing to persist Lexical editor state

## Development

```bash
# Type check
bun run --filter @beep/lexical-schemas check

# Lint
bun run --filter @beep/lexical-schemas lint

# Fix linting issues
bun run --filter @beep/lexical-schemas lint:fix

# Run tests
bun run --filter @beep/lexical-schemas test

# Build
bun run --filter @beep/lexical-schemas build
```

## Notes

- All schemas use `S.suspend` for recursive node references
- Node types are discriminated by the `type` field
- Use `Match.tag` for pattern matching (not `Match.when({ type: "..." })`)
- Container nodes have `children: S.Array(SerializedLexicalNode)`
- Leaf nodes (text, linebreak, tab, code-highlight, horizontalrule) have no children
- Text formatting uses bitwise flags (see Text Formatting table)

## License

MIT
