---
name: lexical-schema-research
version: 1
created: 2025-12-11T00:00:00Z
iterations: 0
---

# Lexical Editor State Schema - Refined Prompt

## Context

The `apps/notes` application currently uses Plate.js for rich text editing with Prisma-based persistence. The current schema validation is inadequate:

```typescript
// apps/notes/src/server/api/routers/document.ts:42
contentRich: S.optional(S.Any)  // ❌ No validation, accepts anything
```

This lack of type safety creates risks for:
- Invalid data persistence
- Runtime errors from malformed editor state
- Security vulnerabilities from unvalidated user input
- Data migration challenges

**Migration Goal**: Replace Plate.js with Lexical editor for improved performance and type safety. Before implementing the migration, robust Effect Schema validation must be created for Lexical's serialized editor state.

**Lexical Source**: The official Lexical repository has been cloned to `/home/elpresidank/YeeBois/projects/beep-effect/tmp/lexical`. Key type definitions:

- `tmp/lexical/packages/lexical/src/LexicalNode.ts` - SerializedLexicalNode base type
- `tmp/lexical/packages/lexical/src/LexicalEditorState.ts` - SerializedEditorState
- `tmp/lexical/packages/lexical/src/nodes/LexicalElementNode.ts` - SerializedElementNode (recursive)
- `tmp/lexical/packages/lexical/src/nodes/LexicalRootNode.ts` - SerializedRootNode
- `tmp/lexical/packages/lexical/src/nodes/LexicalTextNode.ts` - SerializedTextNode

## Objective

Create a 100% type-safe Effect Schema representation of Lexical's serialized editor state suitable for database persistence and runtime validation.

**Success Criteria**:

1. **Complete Type Coverage**: Schema validates all Lexical node types (root, element, text, paragraph, heading, list, etc.)
2. **Recursive Structure**: Uses `S.suspend` to handle recursive children relationships
3. **Discriminated Unions**: Uses `type` field discrimination for different node types
4. **Runtime Safe**: All schemas validate successfully against real Lexical serialized output
5. **Effect-First**: Follows all beep-effect conventions (no native methods, proper imports)
6. **Well-Documented**: Rich annotations for all schemas (identifier, description, examples)
7. **Extensible**: Easy to add custom node types for future editor extensions

## Role

You are an Effect Schema architect with deep expertise in:
- Recursive discriminated union schemas
- Effect Schema's `S.suspend` pattern for self-referential types
- Lexical editor architecture and serialization format
- Type-safe runtime validation for complex nested structures

Your task involves both research and implementation, requiring:
- Systematic exploration of Lexical source code to extract all node type definitions
- Analysis of Lexical's serialization format and type hierarchy
- Careful schema design following Effect and beep-effect conventions
- Validation against real Lexical output to ensure correctness

## Constraints

### Effect Schema Conventions (from @beep/schema)

**FORBIDDEN Patterns**:
- `any` types - use proper typing or `unknown`
- Native `Array` methods (`.map`, `.filter`, etc.) - use `A.map`, `A.filter` from `effect/Array`
- Native `String` methods (`.split`, `.trim`, etc.) - use `Str.split`, `Str.trim` from `effect/String`
- Native `Object` methods (`.keys`, `.values`, etc.) - use `Struct.keys`, `R.values` from `effect/Struct` and `effect/Record`
- `switch` statements - use `Match.value` with `Match.exhaustive` from `effect/Match`
- `async/await` - use `Effect.gen` for async operations
- Lowercase constructors - use `S.Struct`, `S.Array`, `S.String` (not `S.struct`, `S.array`, `S.string`)

**REQUIRED Patterns**:
- Effect namespace imports only: `import * as S from "effect/Schema"`
- Single-letter aliases for collections: `import * as A from "effect/Array"`
- `F.pipe` for all transformations: `import * as F from "effect/Function"`
- Rich annotations on all schemas: `identifier`, `description`, `jsonSchema`, `arbitrary`
- `S.suspend` for recursive/self-referential schemas
- `S.Union` with discriminated structs for tagged unions
- `Schema.TaggedError` for custom error types
- Pure schemas only (no I/O, platform APIs, filesystem, network, timers)

### Import Template

```typescript
import * as S from "effect/Schema";
import * as F from "effect/Function";
import * as A from "effect/Array";
import * as Str from "effect/String";
import * as O from "effect/Option";
import * as Match from "effect/Match";
import * as P from "effect/Predicate";
```

### Recursive Schema Pattern

Follow the pattern established in `packages/common/schema/src/primitives/json/json.ts`:

```typescript
// ✅ CORRECT: Recursive schema with S.suspend
export class Json extends S.suspend(
  (): S.Schema<Json.Type> =>
    S.Union(
      JsonLiteral,
      S.Array(Json),  // Self-reference
      S.Record({ key: S.String, value: Json })  // Self-reference
    )
).annotations(
  Id.annotations("json/Json", {
    description: "Recursive JSON value schema.",
  })
) {
  static readonly decodeSync = S.decodeSync(Json);
  static readonly encodeSync = S.encodeSync(Json);
}

export declare namespace Json {
  export type Type = JsonLiteral.Type | { readonly [key: string]: Type } | ReadonlyArray<Type>;
  export type Encoded = typeof Json.Encoded;
}
```

### Discriminated Union Pattern

For Lexical nodes, use `type` field as discriminator:

```typescript
// ✅ CORRECT: Discriminated union
const LexicalNode = S.Union(
  S.Struct({
    type: S.Literal("text"),
    version: S.Number,
    text: S.String,
    format: S.optional(S.Number),
    style: S.optional(S.String),
  }),
  S.Struct({
    type: S.Literal("paragraph"),
    version: S.Number,
    children: S.Array(LexicalNode),  // Recursive - wrap parent in S.suspend
  }),
  // ... more node types
).annotations({
  identifier: "LexicalNode",
  description: "Lexical editor node (discriminated by type field)",
});
```

## Resources

### Lexical Source Code (Primary Research Target)

**Base Type Definitions**:
- `/home/elpresidank/YeeBois/projects/beep-effect/tmp/lexical/packages/lexical/src/LexicalNode.ts`
  - Lines 74-84: `SerializedLexicalNode` base type
  - Study the `type`, `version`, and `[NODE_STATE_KEY]` fields

- `/home/elpresidank/YeeBois/projects/beep-effect/tmp/lexical/packages/lexical/src/LexicalEditorState.ts`
  - Lines 22-26: `SerializedEditorState<T>` interface
  - This is the top-level structure to persist

**Node Type Implementations**:
- `tmp/lexical/packages/lexical/src/nodes/LexicalRootNode.ts` - Root container
- `tmp/lexical/packages/lexical/src/nodes/LexicalElementNode.ts` - Generic container with children (recursive!)
- `tmp/lexical/packages/lexical/src/nodes/LexicalTextNode.ts` - Leaf text node
- `tmp/lexical/packages/lexical/src/nodes/LexicalParagraphNode.ts` - Paragraph block
- `tmp/lexical/packages/lexical/src/nodes/LexicalLineBreakNode.ts` - Line breaks
- `tmp/lexical/packages/lexical/src/nodes/LexicalTabNode.ts` - Tab characters
- `tmp/lexical/packages/lexical/src/nodes/LexicalDecoratorNode.ts` - Custom decorators

**Extended Node Types** (search for `exportJSON` implementations):
- `tmp/lexical/packages/lexical-*` - Plugin packages with additional node types
  - Headings, lists, quotes, code blocks, links, tables, etc.
  - Each plugin defines custom serialized node shapes

### Codebase Examples

**Recursive Schema Pattern**:
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/schema/src/primitives/json/json.ts`
  - Lines 98-109: `Json` class using `S.suspend` for recursion
  - Lines 42-44: Alternative pattern without class wrapper

- `/home/elpresidank/YeeBois/projects/beep-effect/tooling/utils/src/schemas/Json.ts`
  - Lines 42-44: Simpler `S.suspend` usage

**Discriminated Union Examples**:
- Search codebase for `S.Union` with `S.Literal` type fields
- Look for `Match.value` usage for pattern matching on discriminated unions

**Current (Broken) Schema**:
- `/home/elpresidank/YeeBois/projects/beep-effect/apps/notes/src/server/api/routers/document.ts`
  - Lines 37-46: The inadequate `S.optional(S.Any)` that must be replaced

### Documentation

- Lexical official docs: https://lexical.dev/docs/concepts/serialization
- Effect Schema docs (via MCP): Query for "recursive schemas", "discriminated unions", "S.suspend"
- `packages/common/schema/AGENTS.md` - Schema authoring guidelines
- `packages/common/schema/README.md` - Package overview

## Output Specification

### File Structure

Create schemas in a new package or within an appropriate existing package:

**Option A**: New package `packages/common/lexical-schemas/`
```
packages/common/lexical-schemas/
├── src/
│   ├── nodes/
│   │   ├── base.ts           # SerializedLexicalNode base schema
│   │   ├── text.ts           # SerializedTextNode
│   │   ├── element.ts        # SerializedElementNode (recursive)
│   │   ├── root.ts           # SerializedRootNode
│   │   ├── paragraph.ts      # SerializedParagraphNode
│   │   └── index.ts          # Re-exports
│   ├── state.ts              # SerializedEditorState
│   ├── index.ts              # Main export (LexicalEditorState schema)
│   └── errors.ts             # Schema.TaggedError types
├── test/
│   ├── fixtures/             # Real Lexical serialized output samples
│   └── validation.test.ts    # Schema validation tests
├── package.json
└── README.md
```

**Option B**: Extend `@beep/schema` (if schemas are generic enough)
```
packages/common/schema/src/integrations/lexical/
├── nodes/...
├── state.ts
└── index.ts
```

**Recommendation**: Start with Option A for iteration speed, migrate to Option B if schemas prove stable and generic.

### Code Patterns

**Base Node Schema**:
```typescript
// src/nodes/base.ts
import * as S from "effect/Schema";

/**
 * Base schema for all Lexical serialized nodes.
 *
 * @example
 * ```typescript
 * const node = S.decodeSync(SerializedLexicalNodeBase)({
 *   type: "text",
 *   version: 1
 * });
 * ```
 */
export class SerializedLexicalNodeBase extends S.Struct({
  type: S.String.annotations({
    description: "Node type discriminator (e.g., 'text', 'paragraph', 'root')"
  }),
  version: S.Number.annotations({
    description: "Schema version (typically 1, not recommended for use)"
  }),
  // NODE_STATE_KEY handled separately per node type if needed
}).annotations({
  identifier: "SerializedLexicalNodeBase",
  description: "Base fields present on all Lexical serialized nodes",
}) {}
```

**Recursive Element Node**:
```typescript
// src/nodes/element.ts
import * as S from "effect/Schema";
import { SerializedLexicalNodeBase } from "./base.js";

/**
 * Recursive schema for Lexical nodes (text, element, root, etc.).
 * Uses S.suspend to handle self-referential children arrays.
 */
export class SerializedLexicalNode extends S.suspend(
  (): S.Schema<SerializedLexicalNode.Type> =>
    S.Union(
      // Leaf nodes (no children)
      SerializedTextNode,
      SerializedLineBreakNode,

      // Container nodes (with children - recursive!)
      SerializedParagraphNode,
      SerializedHeadingNode,
      SerializedRootNode,
      // ... more node types
    )
).annotations({
  identifier: "SerializedLexicalNode",
  description: "Discriminated union of all Lexical node types (recursive)",
}) {
  static readonly decodeSync = S.decodeSync(SerializedLexicalNode);
  static readonly encodeSync = S.encodeSync(SerializedLexicalNode);
}

/**
 * Element node with children (recursive structure).
 */
export class SerializedElementNode extends S.Struct({
  type: S.Literal("element"),
  version: S.Number,
  children: S.Array(SerializedLexicalNode),  // Recursive!
  format: S.optional(S.Number),
  indent: S.optional(S.Number),
  direction: S.optional(S.Union(S.Literal("ltr"), S.Literal("rtl"), S.Null)),
}).annotations({
  identifier: "SerializedElementNode",
  description: "Generic container node with children array",
}) {}
```

**Top-Level State**:
```typescript
// src/state.ts
import * as S from "effect/Schema";
import { SerializedRootNode } from "./nodes/root.js";

/**
 * Complete Lexical editor state for persistence.
 *
 * @example
 * ```typescript
 * const editorState = S.decodeSync(SerializedEditorState)({
 *   root: {
 *     type: "root",
 *     version: 1,
 *     children: [
 *       { type: "paragraph", version: 1, children: [...] }
 *     ]
 *   }
 * });
 * ```
 */
export class SerializedEditorState extends S.Struct({
  root: SerializedRootNode
}).annotations({
  identifier: "SerializedEditorState",
  description: "Top-level Lexical editor state for database persistence",
  title: "Lexical Editor State",
}) {
  static readonly decodeSync = S.decodeSync(SerializedEditorState);
  static readonly encodeSync = S.encodeSync(SerializedEditorState);
}
```

**Error Schemas**:
```typescript
// src/errors.ts
import * as S from "effect/Schema";

export class LexicalSchemaValidationError extends S.TaggedError<LexicalSchemaValidationError>()(
  "LexicalSchemaValidationError",
  {
    message: S.String,
    nodeType: S.optional(S.String),
    path: S.optional(S.Array(S.String)),
  },
  {
    identifier: "LexicalSchemaValidationError",
    description: "Error validating Lexical editor state schema",
  }
) {}
```

### Testing Requirements

Create validation tests with real Lexical output:

```typescript
// test/validation.test.ts
import { describe, expect, test } from "bun:test";
import * as S from "effect/Schema";
import { SerializedEditorState } from "../src/index.js";

describe("SerializedEditorState", () => {
  test("validates empty editor state", () => {
    const input = {
      root: {
        type: "root",
        version: 1,
        children: [],
        format: "",
        indent: 0,
        direction: null,
      }
    };

    const result = S.decodeUnknownSync(SerializedEditorState)(input);
    expect(result).toBeDefined();
  });

  test("validates text node with formatting", () => {
    const input = {
      root: {
        type: "root",
        version: 1,
        children: [
          {
            type: "paragraph",
            version: 1,
            children: [
              {
                type: "text",
                version: 1,
                text: "Hello world",
                format: 1, // bold
                mode: "normal",
                style: "",
              }
            ]
          }
        ]
      }
    };

    const result = S.decodeUnknownSync(SerializedEditorState)(input);
    expect(result.root.children).toHaveLength(1);
  });

  test("rejects invalid node type", () => {
    const input = {
      root: {
        type: "invalid-type",
        version: 1,
        children: []
      }
    };

    expect(() => S.decodeUnknownSync(SerializedEditorState)(input)).toThrow();
  });
});
```

### Documentation Requirements

**README.md**:
- Purpose: Type-safe validation for Lexical editor state persistence
- Installation and imports
- Quick start examples
- Schema hierarchy diagram (text → visual)
- Extension guide (adding custom node types)

**JSDoc on all exports**:
- `@example` blocks showing decoding/encoding
- `@category` tags for organization
- `@since` version tags
- Link to Lexical docs for context

## Phases

### Phase 1: Research & Discovery (Explorer Agents)

**Deploy 3 parallel exploration agents**:

#### Agent 1: Lexical Core Node Types
```
Task: Extract all core Lexical node type definitions

Steps:
1. Read tmp/lexical/packages/lexical/src/LexicalNode.ts
   - Extract SerializedLexicalNode base interface
   - Document the type, version, and NODE_STATE_KEY fields

2. Read tmp/lexical/packages/lexical/src/nodes/*.ts
   - For each node class, extract the corresponding Serialized* type
   - Note which nodes have children (recursive) vs. leaf nodes
   - Document all fields per node type

3. Create a type hierarchy document:
   - SerializedLexicalNode (base)
     - SerializedTextNode (leaf)
     - SerializedLineBreakNode (leaf)
     - SerializedElementNode (container - recursive)
       - SerializedParagraphNode
       - SerializedRootNode
       - ... etc.

Deliverable: markdown document with complete type definitions and hierarchy
```

#### Agent 2: Lexical Plugin Node Types
```
Task: Research extended node types from Lexical plugins

Steps:
1. List all plugin packages: tmp/lexical/packages/lexical-*
2. For high-priority plugins, extract Serialized* types:
   - lexical-rich-text (headings, quotes)
   - lexical-list (lists, list items)
   - lexical-code (code blocks)
   - lexical-link (links)
   - lexical-table (tables)

3. Categorize by complexity:
   - Simple extensions (just add fields to base types)
   - Complex extensions (new recursive structures)

Deliverable: markdown document with plugin node types grouped by priority
```

#### Agent 3: Effect Schema Patterns Research
```
Task: Research Effect Schema best practices for this use case

Steps:
1. Use effect-researcher agent to query Effect docs:
   - "recursive discriminated union schemas"
   - "S.suspend for self-referential types"
   - "schema performance for deep nested structures"

2. Analyze @beep/schema recursive patterns:
   - packages/common/schema/src/primitives/json/json.ts
   - Look for other recursive schemas in the codebase

3. Research validation strategies:
   - How to provide helpful error messages for nested validation
   - Performance considerations for deeply nested structures
   - Best practices for schema versioning

Deliverable: markdown document with Effect Schema patterns and recommendations
```

**Phase 1 Success Criteria**:
- Complete inventory of all Lexical node types (core + plugins)
- Type hierarchy diagram showing inheritance and recursion
- Pattern recommendations for implementing schemas

### Phase 2: Core Schema Implementation

**Implement schemas in priority order**:

1. **Base Schemas** (no dependencies):
   - `SerializedLexicalNodeBase` - Common fields
   - `SerializedTextNode` - Leaf node (no children)
   - `SerializedLineBreakNode` - Leaf node

2. **Recursive Container** (depends on base + uses S.suspend):
   - `SerializedLexicalNode` - Union of all node types (recursive!)
   - `SerializedElementNode` - Generic container
   - `SerializedRootNode` - Top-level container
   - `SerializedParagraphNode` - Paragraph container

3. **Editor State** (depends on root):
   - `SerializedEditorState` - Top-level structure

**Phase 2 Success Criteria**:
- All core schemas compile without errors
- Schemas follow Effect conventions (no forbidden patterns)
- Rich annotations on all exports
- Static `decodeSync`/`encodeSync` helpers

### Phase 3: Validation & Testing

1. **Create Test Fixtures**:
   - Generate real Lexical editor output (use Lexical playground)
   - Save as JSON fixtures in `test/fixtures/`
   - Cover: empty state, text only, nested paragraphs, formatted text

2. **Write Validation Tests**:
   - Each fixture should decode successfully
   - Test error cases (invalid types, missing required fields)
   - Test round-trip (decode → encode → decode)

3. **Performance Testing**:
   - Test deeply nested structures (10+ levels)
   - Measure decode/encode time for large documents
   - Ensure validation is fast enough for real-time editing

**Phase 3 Success Criteria**:
- All fixtures validate successfully
- Error messages are helpful and specific
- Performance is acceptable (<100ms for typical documents)

### Phase 4: Extended Node Types (Plugin Support)

Based on Phase 1 research, implement high-priority plugin nodes:

1. **Rich Text Nodes**:
   - `SerializedHeadingNode` (h1-h6)
   - `SerializedQuoteNode`

2. **List Nodes**:
   - `SerializedListNode` (ordered/unordered)
   - `SerializedListItemNode`

3. **Code Nodes**:
   - `SerializedCodeNode`
   - `SerializedCodeHighlightNode`

4. **Link Nodes**:
   - `SerializedLinkNode`
   - `SerializedAutoLinkNode`

**Phase 4 Success Criteria**:
- Extended nodes integrate seamlessly into SerializedLexicalNode union
- Test fixtures validate with plugin nodes
- Documentation updated with extension examples

### Phase 5: Integration & Documentation

1. **Integration with apps/notes**:
   - Replace `S.optional(S.Any)` in `apps/notes/src/server/api/routers/document.ts`
   - Update to use `SerializedEditorState` schema
   - Ensure Prisma JSON field validates correctly

2. **Documentation**:
   - Complete README with examples
   - Architecture diagram (ASCII or mermaid)
   - Migration guide from Plate.js schema
   - Extension guide for custom node types

3. **PR Preparation**:
   - Run `bun run check` - type check
   - Run `bun run lint:fix` - fix linting
   - Run `bun run test` - all tests pass
   - Update CHANGELOG if applicable

**Phase 5 Success Criteria**:
- apps/notes integrates new schema successfully
- Documentation is comprehensive and clear
- All checks pass (type, lint, test)

## Examples

### Example Input (Lexical Serialized State)

```json
{
  "root": {
    "type": "root",
    "version": 1,
    "children": [
      {
        "type": "paragraph",
        "version": 1,
        "children": [
          {
            "type": "text",
            "version": 1,
            "text": "Hello ",
            "format": 0,
            "mode": "normal",
            "style": ""
          },
          {
            "type": "text",
            "version": 1,
            "text": "world",
            "format": 1,
            "mode": "normal",
            "style": ""
          }
        ],
        "format": "",
        "indent": 0,
        "direction": "ltr"
      }
    ],
    "format": "",
    "indent": 0,
    "direction": null
  }
}
```

### Example Output (Effect Schema Validation)

```typescript
import * as S from "effect/Schema";
import { SerializedEditorState } from "@beep/lexical-schemas";

// ✅ Successful decode
const editorState = S.decodeUnknownSync(SerializedEditorState)(jsonInput);
// Type: SerializedEditorState.Type (fully typed!)

// ❌ Validation error with helpful message
try {
  S.decodeUnknownSync(SerializedEditorState)({ root: { type: "invalid" } });
} catch (error) {
  // ParseError with detailed path and expected type
  console.error(error);
}
```

### Example Extension (Custom Node Type)

```typescript
// Adding a custom "callout" node type

import * as S from "effect/Schema";
import { SerializedElementNode } from "@beep/lexical-schemas/nodes/element";

export class SerializedCalloutNode extends S.Struct({
  type: S.Literal("callout"),
  version: S.Number,
  children: S.Array(SerializedLexicalNode),  // Recursive
  calloutType: S.Union(
    S.Literal("info"),
    S.Literal("warning"),
    S.Literal("error"),
    S.Literal("success")
  ),
  format: S.optional(S.Number),
  indent: S.optional(S.Number),
  direction: S.optional(S.Union(S.Literal("ltr"), S.Literal("rtl"), S.Null)),
}).annotations({
  identifier: "SerializedCalloutNode",
  description: "Callout block with semantic type (info, warning, error, success)",
}) {}

// Extend the main union
const ExtendedLexicalNode = S.Union(
  SerializedLexicalNode,
  SerializedCalloutNode
);
```

## Verification Checklist

**Schema Correctness**:
- [ ] All core Lexical node types have corresponding schemas
- [ ] Recursive structures use `S.suspend` correctly
- [ ] Discriminated unions use `type` field for discrimination
- [ ] All schemas have proper TypeScript types exported
- [ ] No `any` types used anywhere

**Effect Conventions**:
- [ ] No native Array methods (only `A.*` from `effect/Array`)
- [ ] No native String methods (only `Str.*` from `effect/String`)
- [ ] No `switch` statements (only `Match.value` with `Match.exhaustive`)
- [ ] All imports use namespace form (`import * as S from "effect/Schema"`)
- [ ] Uppercase constructors used (`S.Struct`, `S.Array`, `S.String`)

**Documentation**:
- [ ] All schemas have `identifier` annotation
- [ ] All schemas have `description` annotation
- [ ] All public exports have JSDoc with `@example`
- [ ] README.md is comprehensive with quick start guide
- [ ] Type hierarchy is documented (text or diagram)

**Testing**:
- [ ] Test fixtures include real Lexical serialized output
- [ ] Happy path tests pass (valid input decodes successfully)
- [ ] Error path tests pass (invalid input throws with helpful message)
- [ ] Round-trip tests pass (decode → encode → decode)
- [ ] Performance is acceptable for realistic documents

**Integration**:
- [ ] Schema integrates with `apps/notes` successfully
- [ ] Replaces `S.optional(S.Any)` with proper validation
- [ ] All type checks pass (`bun run check`)
- [ ] All lint checks pass (`bun run lint`)
- [ ] All tests pass (`bun run test`)

**Extensibility**:
- [ ] Custom node types can be added via union extension
- [ ] Documentation explains extension process with examples
- [ ] Plugin node types are modular (can be imported separately)

---

## Metadata

### Research Sources

**Files Explored**:
- `apps/notes/src/server/api/routers/document.ts` - Current inadequate schema (S.optional(S.Any))
- `tmp/lexical/packages/lexical/src/LexicalNode.ts` - SerializedLexicalNode base type
- `tmp/lexical/packages/lexical/src/LexicalEditorState.ts` - SerializedEditorState interface
- `tmp/lexical/packages/lexical/src/nodes/LexicalElementNode.ts` - Recursive container nodes
- `packages/common/schema/src/primitives/json/json.ts` - Recursive schema pattern with S.suspend
- `tooling/utils/src/schemas/Json.ts` - Alternative recursive pattern

**Documentation Referenced**:
- Lexical serialization: https://lexical.dev/docs/concepts/serialization
- Effect Schema recursive types: Query via MCP tools
- `packages/common/schema/AGENTS.md` - Schema authoring guidelines
- `apps/notes/AGENTS.md` - Notes app hybrid Effect adoption status

**Package Guidelines**:
- `packages/common/schema/AGENTS.md` - Pure schema patterns, BS namespace, recursive helpers
- `AGENTS.md` (root) - Effect-first conventions, forbidden native methods, Match patterns

### Refinement History

| Iteration | Issues Found | Fixes Applied |
|-----------|--------------|---------------|
| 0         | Initial draft | N/A          |
