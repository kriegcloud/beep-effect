# @beep/lexical-schemas - Agent Guide

Type-safe Effect Schema validation for Lexical editor state serialization.

## Package Purpose

This package provides 100% type-safe schemas for validating Lexical's serialized editor state. It replaces unsafe `S.optional(S.Any)` patterns with proper discriminated union schemas that enable:

- Runtime validation of editor content
- Type-safe database persistence
- Compile-time type narrowing for node types
- Protection against invalid/malformed editor state

## Key Schemas

### SerializedEditorState

The top-level schema for complete editor state:

```typescript
import { SerializedEditorState } from "@beep/lexical-schemas";

// Validate from unknown input
const state = S.decodeUnknownSync(SerializedEditorState)(jsonFromDb);
```

### SerializedLexicalNode

Recursive discriminated union of all node types. Use `S.suspend` pattern internally.

**Discriminator:** `type` field

**Supported types:**
- Core: `text`, `linebreak`, `tab`, `paragraph`, `root`
- Rich text: `heading`, `quote`
- Lists: `list`, `listitem`
- Code: `code`, `code-highlight`
- Links: `link`, `autolink`
- Decorators: `horizontalrule`

## Schema Patterns

### Recursive Structure

The schemas use `S.suspend` for recursive children:

```typescript
// Correct pattern (from element.ts)
export class SerializedLexicalNode extends S.suspend(
  (): S.Schema<SerializedLexicalNode.Type> =>
    S.Union(
      // Leaf nodes
      S.Struct({ type: S.Literal("text"), ... }),
      // Container nodes (recursive)
      S.Struct({
        type: S.Literal("paragraph"),
        children: S.Array(SerializedLexicalNode), // Self-reference
        ...
      }),
    )
).annotations({ ... }) {}
```

### Type Namespace Pattern

Each schema class has a companion namespace for type exports:

```typescript
export declare namespace SerializedLexicalNode {
  export type Type = TextNode | LineBreakNode | ParagraphNode | ...;
  export type Encoded = typeof SerializedLexicalNode.Encoded;
}
```

## File Structure

```
src/
├── nodes/
│   ├── base.ts        # Base types (ElementFormatType, TextModeType, etc.)
│   ├── text.ts        # SerializedTextNode
│   ├── linebreak.ts   # SerializedLineBreakNode
│   ├── tab.ts         # SerializedTabNode
│   ├── element.ts     # SerializedLexicalNode (main union), Root, Paragraph
│   ├── plugins/       # Extended node type helpers
│   │   └── index.ts   # HeadingTagType, ListTypeEnum, etc.
│   └── index.ts       # Re-exports
├── state.ts           # SerializedEditorState
├── errors.ts          # LexicalSchemaValidationError
└── index.ts           # Main barrel export
```

## Usage Guidelines

### DO

- Use `decodeEditorStateUnknownSync` for validating external input
- Use `Match.value` with `Match.exhaustive` for pattern matching
- Add new node types to the union in `element.ts`
- Keep type namespace declarations in sync with schema changes

### DON'T

- Use `S.Any` for editor content
- Use `switch` statements for node type dispatch
- Define container nodes outside the `S.suspend` callback
- Forget to update namespace types when adding new node types

## Testing

Test fixtures are in `test/fixtures/`:
- `empty-editor.json` - Empty editor state
- `simple-text.json` - Basic text content
- `formatted-text.json` - Bold, italic, combined formatting
- `nested-paragraphs.json` - Multiple paragraphs with linebreaks
- `extended-nodes.json` - Headings, lists, code, links

Run tests:
```bash
bun test packages/common/lexical-schemas
```

## Integration with apps/notes

Replace the current unsafe schema:

```typescript
// apps/notes/src/server/api/routers/document.ts

// Before:
contentRich: S.optional(S.Any)  // No validation!

// After:
import { SerializedEditorState } from "@beep/lexical-schemas";
contentRich: S.optional(SerializedEditorState)
```

## Adding Custom Node Types

1. Define the schema inline in the `S.Union` within `element.ts`
2. Add the type to the namespace `Type` union
3. Update tests with fixtures
4. Document in README.md

Example for a custom "callout" node:

```typescript
// In element.ts S.Union:
S.Struct({
  type: S.Literal("callout"),
  version: S.Number,
  calloutType: S.Union(S.Literal("info"), S.Literal("warning")),
  children: S.Array(SerializedLexicalNode),
  direction: TextDirectionType,
  format: ElementFormatType,
  indent: S.Number,
}),

// In namespace:
type CalloutNode = {
  readonly type: "callout";
  readonly calloutType: "info" | "warning";
  // ...
};

export type Type = ... | CalloutNode;
```

## Dependencies

- `effect` - Effect Schema
- `@beep/invariant` - Assertion helpers (peer)

## Related Packages

- `@beep/schema` - Base schema utilities
- `apps/notes` - Notes app using this for content validation
