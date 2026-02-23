# Agent Prompts: Lexical Schemas Spec

This document contains copy-paste ready prompts for each sub-agent type used in the lexical-schemas specification. Each prompt is designed to be self-contained and includes all necessary context for the agent to execute its task.

---

## Agent: domain-schemas (effect-code-writer)

This agent creates domain envelope schemas that validate Lexical serialization structure without importing from the `lexical` package.

### Prompt

```
You are an Effect code writer agent tasked with creating domain envelope schemas for Lexical editor serialization.

## Mission
Create structural validation schemas for `SerializedEditorState` at the domain layer. These schemas validate the recursive tree structure without knowing specific node types.

## Critical Constraints
- MUST NOT import from `lexical` or any `@lexical/*` package
- Use `import * as S from "effect/Schema"`
- Use `S.suspend(() => Schema)` for recursive children
- Follow Effect patterns from `.claude/rules/effect-patterns.md`
- Use PascalCase constructors (S.Struct, S.String, S.Number, S.Literal, S.Union)

## Location
Create new file: `packages/documents/domain/src/value-objects/SerializedEditorState.ts`

## Schemas to Create

### SerializedLexicalNodeEnvelope
Base node schema:
- `type`: S.String (any node type string)
- `version`: S.Number
- `$`: S.optional(S.Record({ key: S.String, value: S.Unknown })) (optional state)

### SerializedTextNodeEnvelope
Extends base with text node fields:
- All fields from SerializedLexicalNodeEnvelope
- `text`: S.String
- `format`: S.Number (bitmask: bold=1, italic=2, strikethrough=4, underline=8, code=16, subscript=32, superscript=64, highlight=128)
- `detail`: S.Number
- `mode`: S.Literal("normal", "token", "segmented")
- `style`: S.String

### SerializedElementNodeEnvelope
Extends base with element node fields:
- All fields from SerializedLexicalNodeEnvelope
- `children`: S.Array(S.suspend(() => SerializedLexicalNodeEnvelope)) (recursive)
- `direction`: S.Union(S.Literal("ltr"), S.Literal("rtl"), S.Null)
- `format`: S.Literal("", "left", "start", "center", "right", "end", "justify")
- `indent`: S.Number
- `textFormat`: S.optional(S.Number) (optional bitmask)
- `textStyle`: S.optional(S.String) (optional CSS)

### SerializedRootNodeEnvelope
Root node (element node with type="root"):
- All fields from SerializedElementNodeEnvelope
- Constrain `type` to S.Literal("root")

### SerializedEditorStateEnvelope
Top-level editor state:
- `root`: SerializedRootNodeEnvelope

## Implementation Pattern

```typescript
import * as S from "effect/Schema";

// Base node
export class SerializedLexicalNodeEnvelope extends S.Class<SerializedLexicalNodeEnvelope>("SerializedLexicalNodeEnvelope")({
  type: S.String,
  version: S.Number,
  $: S.optional(S.Record({ key: S.String, value: S.Unknown })),
}) {}

// Element node (recursive)
export class SerializedElementNodeEnvelope extends S.Class<SerializedElementNodeEnvelope>("SerializedElementNodeEnvelope")({
  type: S.String,
  version: S.Number,
  $: S.optional(S.Record({ key: S.String, value: S.Unknown })),
  children: S.Array(S.suspend((): S.Schema<any> => SerializedLexicalNodeEnvelope)),
  direction: S.Union(S.Literal("ltr"), S.Literal("rtl"), S.Null),
  format: S.Literal("", "left", "start", "center", "right", "end", "justify"),
  indent: S.Number,
  textFormat: S.optional(S.Number),
  textStyle: S.optional(S.String),
}) {}

// Continue pattern for other schemas...
```

## Next Steps After Schema Creation

1. Export schemas from `packages/documents/domain/src/value-objects/index.ts`
2. Update `packages/documents/domain/src/entities/document/document.model.ts` line 25:
   Change from: `contentRich: BS.FieldOptionOmittable(S.Unknown),`
   To: `contentRich: BS.FieldOptionOmittable(SerializedEditorStateEnvelope),`
3. Add import at top: `import { SerializedEditorStateEnvelope } from "../../value-objects/SerializedEditorState.js";`

## Reference Documents
- Read `specs/pending/lexical-schemas/handoffs/HANDOFF_P1.md` for complete Lexical type reference
- Read `.claude/rules/effect-patterns.md` for required Effect patterns
- Read `apps/todox/src/app/lexical/schema/schemas.ts` for existing base schema patterns

## Verification
After implementation, the domain-tests agent will verify schemas work correctly.
```

---

## Agent: app-schemas (effect-code-writer)

This agent creates application-layer discriminated union schemas for all Lexical node types.

### Prompt

```
You are an Effect code writer agent tasked with creating application-layer node schemas for Lexical.

## Mission
Extend the existing base schemas in `apps/todox/src/app/lexical/schema/` to support all 30+ node types from PlaygroundNodes with full discriminated union validation.

## Critical Constraints
- MUST extend existing `SerializedLexicalNode` from `apps/todox/src/app/lexical/schema/schemas.ts`
- Use `import * as S from "effect/Schema"`
- Follow the proven pattern from `SerializedImageNode` in `apps/todox/src/app/lexical/schema/nodes.schema.ts`
- Use PascalCase constructors (S.Struct, S.String, S.Number, S.Literal, S.Union)
- Create discriminated union on `type` field for node dispatch

## Locations

### Extend Base Schemas
File: `apps/todox/src/app/lexical/schema/schemas.ts`

Add these base node types:
```typescript
// Element node base (has children - recursive)
export class SerializedElementNode extends SerializedLexicalNode.extend<SerializedElementNode>($I`SerializedElementNode`)(
  {
    children: S.Array(S.suspend((): S.Schema<any> => SerializedLexicalNode)),
    direction: S.Union(S.Literal("ltr"), S.Literal("rtl"), S.Null),
    format: S.Literal("", "left", "start", "center", "right", "end", "justify"),
    indent: S.Number,
    textFormat: S.optionalWith(S.Number, { as: "Option" }),
    textStyle: S.optionalWith(S.String, { as: "Option" }),
  },
  $I.annotations("SerializedElementNode", {
    description: "Serialized element node (has children)",
  })
) {}

// Text node base
export class SerializedTextNode extends SerializedLexicalNode.extend<SerializedTextNode>($I`SerializedTextNode`)(
  {
    text: S.String,
    format: S.Number, // bitmask: bold=1, italic=2, strikethrough=4, underline=8, code=16, subscript=32, superscript=64, highlight=128
    detail: S.Number,
    mode: S.Literal("normal", "token", "segmented"),
    style: S.String,
  },
  $I.annotations("SerializedTextNode", {
    description: "Serialized text node",
  })
) {}
```

### Create Node Type Schemas
File: `apps/todox/src/app/lexical/schema/node-types.schema.ts` (NEW)

Create schemas for all node types. Use the pattern from `SerializedImageNode` in `nodes.schema.ts`:

```typescript
import { $TodoxId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { SerializedElementNode, SerializedTextNode } from "./schemas";

const $I = $TodoxId.create("app/lexical/schema/node-types.schema");

// Root node
export class SerializedRootNode extends SerializedElementNode.extend<SerializedRootNode>($I`SerializedRootNode`)(
  {
    type: S.Literal("root"),
  },
  $I.annotations("SerializedRootNode", {
    description: "Serialized root node",
  })
) {}

// Heading node
export class SerializedHeadingNode extends SerializedElementNode.extend<SerializedHeadingNode>($I`SerializedHeadingNode`)(
  {
    type: S.Literal("heading"),
    tag: S.Literal("h1", "h2", "h3", "h4", "h5", "h6"),
  },
  $I.annotations("SerializedHeadingNode", {
    description: "Serialized heading node",
  })
) {}

// Continue for all node types...
```

## Node Types to Implement

Reference `apps/todox/src/app/lexical/nodes/PlaygroundNodes.ts` for complete list. Key types:

**Block Elements (extend SerializedElementNode):**
- HeadingNode (type: "heading", tag: h1-h6)
- QuoteNode (type: "quote")
- CodeNode (type: "code", language: string | null | undefined)
- ParagraphNode (type: "paragraph")

**List Elements (extend SerializedElementNode):**
- ListNode (type: "list", listType: "bullet"|"number"|"check", start: number, tag: "ol"|"ul")
- ListItemNode (type: "listitem", checked: boolean | undefined, value: number)

**Table Elements (extend SerializedElementNode):**
- TableNode (type: "table", colWidths?: number[], rowStriping?: boolean)
- TableRowNode (type: "tablerow", height?: number)
- TableCellNode (type: "tablecell", colSpan: number, rowSpan: number, headerState: number, width?: number, backgroundColor?: string)

**Inline Elements (extend SerializedElementNode):**
- LinkNode (type: "link", url: string, rel?: string, target?: string, title?: string)
- AutoLinkNode (type: "autolink", extends LinkNode, isUnlinked: boolean)
- MarkNode (type: "mark", ids: string[])

**Text Variations (extend SerializedTextNode):**
- CodeHighlightNode (type: "code-highlight", highlightType: string | null | undefined)
- TabNode (type: "tab")

**Leaf Nodes (extend SerializedLexicalNode, no children or text):**
- LineBreakNode (type: "linebreak")
- HorizontalRuleNode (type: "horizontalrule")

**Media/Special (extend SerializedElementNode or SerializedLexicalNode):**
- ImageNode (type: "image") - ALREADY EXISTS in nodes.schema.ts
- ExcalidrawNode, TweetNode, YouTubeNode, FigmaNode, EquationNode, etc.

## Create Discriminated Union

After all node schemas are created, add to end of `node-types.schema.ts`:

```typescript
// Discriminated union on type field
export const SerializedLexicalNodeUnion = S.Union(
  SerializedRootNode,
  SerializedHeadingNode,
  SerializedQuoteNode,
  SerializedCodeNode,
  SerializedParagraphNode,
  SerializedListNode,
  SerializedListItemNode,
  SerializedTableNode,
  SerializedTableRowNode,
  SerializedTableCellNode,
  SerializedLinkNode,
  SerializedAutoLinkNode,
  SerializedMarkNode,
  SerializedCodeHighlightNode,
  SerializedTabNode,
  SerializedLineBreakNode,
  SerializedHorizontalRuleNode,
  SerializedImageNode, // from nodes.schema.ts
  // ... all other node types
).annotations({
  identifier: "SerializedLexicalNodeUnion",
  description: "Discriminated union of all Lexical node types",
});
```

## Update SerializedEditorState

In `apps/todox/src/app/lexical/schema/schemas.ts`, update `SerializedEditorState`:

```typescript
export class SerializedEditorState extends S.Class<SerializedEditorState>($I`SerializedEditorState`)(
  {
    root: SerializedRootNode, // Use typed root instead of generic SerializedLexicalNode
  },
  $I.annotations("SerializedEditorState", {
    description: "SerializedEditorState",
  })
) {}
```

## Reference Documents
- Read `specs/pending/lexical-schemas/handoffs/HANDOFF_P1.md` for complete Lexical type reference
- Read `.claude/rules/effect-patterns.md` for required Effect patterns
- Read `apps/todox/src/app/lexical/schema/nodes.schema.ts` for the proven SerializedImageNode pattern
- Read `apps/todox/src/app/lexical/nodes/PlaygroundNodes.ts` for all registered node types

## Verification
After implementation, the app-tests agent will verify schemas work correctly with encode/decode round-trips.
```

---

## Agent: domain-tests (test-writer)

This agent writes tests for domain envelope schemas.

### Prompt

```
You are a test writer agent tasked with writing tests for domain envelope schemas.

## Mission
Write comprehensive tests for the domain envelope schemas in `packages/documents/domain/test/value-objects/SerializedEditorState.test.ts`

## Critical Constraints
- MUST use `@beep/testkit` (import { effect, strictEqual } from "@beep/testkit")
- NEVER use raw `bun:test` with Effect.runPromise
- Use `import * as Effect from "effect/Effect"`
- Use `import * as S from "effect/Schema"`
- Follow test patterns from `.claude/rules/effect-patterns.md` Testing section

## Test File Location
Create: `packages/documents/domain/test/value-objects/SerializedEditorState.test.ts`

## Test Cases to Implement

### Valid Lexical JSON Passes Validation

Test that a valid SerializedEditorState passes through the envelope schema:

```typescript
import { effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { SerializedEditorStateEnvelope } from "../../src/value-objects/SerializedEditorState.js";

effect("valid Lexical JSON passes SerializedEditorStateEnvelope validation", () =>
  Effect.gen(function* () {
    const validJSON = {
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
                format: 0,
                detail: 0,
                mode: "normal",
                style: "",
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
      },
    };

    const result = yield* S.decodeUnknown(SerializedEditorStateEnvelope)(validJSON);
    strictEqual(result.root.type, "root");
    strictEqual(result.root.children.length, 1);
  })
);
```

### Missing Root Fails Validation

```typescript
effect("missing root fails validation", () =>
  Effect.gen(function* () {
    const invalidJSON = { notRoot: {} };

    const result = yield* S.decodeUnknown(SerializedEditorStateEnvelope)(invalidJSON).pipe(
      Effect.flip
    );

    // Verify it failed
    strictEqual(result._tag, "ParseError");
  })
);
```

### Invalid Direction Fails Validation

Test that non-valid direction values are rejected:

```typescript
effect("invalid direction fails validation", () =>
  Effect.gen(function* () {
    const invalidJSON = {
      root: {
        type: "root",
        version: 1,
        children: [],
        direction: "invalid", // Must be "ltr" | "rtl" | null
        format: "",
        indent: 0,
      },
    };

    const result = yield* S.decodeUnknown(SerializedEditorStateEnvelope)(invalidJSON).pipe(
      Effect.flip
    );

    strictEqual(result._tag, "ParseError");
  })
);
```

### Invalid Format Fails Validation

Test that non-valid format values are rejected:

```typescript
effect("invalid format fails validation", () =>
  Effect.gen(function* () {
    const invalidJSON = {
      root: {
        type: "root",
        version: 1,
        children: [],
        direction: "ltr",
        format: "invalid", // Must be "" | "left" | "start" | "center" | "right" | "end" | "justify"
        indent: 0,
      },
    };

    const result = yield* S.decodeUnknown(SerializedEditorStateEnvelope)(invalidJSON).pipe(
      Effect.flip
    );

    strictEqual(result._tag, "ParseError");
  })
);
```

### Recursive Children Validation

Test that nested children are validated recursively:

```typescript
effect("recursive children validation works", () =>
  Effect.gen(function* () {
    const validJSON = {
      root: {
        type: "root",
        version: 1,
        children: [
          {
            type: "paragraph",
            version: 1,
            children: [
              {
                type: "paragraph",
                version: 1,
                children: [
                  {
                    type: "text",
                    version: 1,
                    text: "Nested text",
                    format: 0,
                    detail: 0,
                    mode: "normal",
                    style: "",
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
      },
    };

    const result = yield* S.decodeUnknown(SerializedEditorStateEnvelope)(validJSON);
    strictEqual(result.root.children[0].children[0].children[0].text, "Nested text");
  })
);
```

### Empty Children Array Valid

```typescript
effect("empty children array is valid", () =>
  Effect.gen(function* () {
    const validJSON = {
      root: {
        type: "root",
        version: 1,
        children: [],
        direction: "ltr",
        format: "",
        indent: 0,
      },
    };

    const result = yield* S.decodeUnknown(SerializedEditorStateEnvelope)(validJSON);
    strictEqual(result.root.children.length, 0);
  })
);
```

### Text Node Format Bitmask Valid

Test that text node format bitmasks are accepted:

```typescript
effect("text node format bitmask valid", () =>
  Effect.gen(function* () {
    const validJSON = {
      root: {
        type: "root",
        version: 1,
        children: [
          {
            type: "text",
            version: 1,
            text: "Bold italic",
            format: 3, // bold (1) + italic (2) = 3
            detail: 0,
            mode: "normal",
            style: "",
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
      },
    };

    const result = yield* S.decodeUnknown(SerializedEditorStateEnvelope)(validJSON);
    strictEqual(result.root.children[0].format, 3);
  })
);
```

## Reference Documents
- Read `.claude/rules/effect-patterns.md` Testing section for test patterns
- Read existing tests in `packages/documents/domain/test/` for structure

## Verification
Run: `bun run test --filter=@beep/documents-domain`
```

---

## Agent: app-tests (test-writer)

This agent writes tests for application-layer node schemas.

### Prompt

```
You are a test writer agent tasked with writing tests for application-layer Lexical node schemas.

## Mission
Write comprehensive tests for the discriminated union node schemas in `apps/todox/src/app/lexical/schema/test/`

## Critical Constraints
- MUST use `@beep/testkit` (import { effect, strictEqual } from "@beep/testkit")
- NEVER use raw `bun:test` with Effect.runPromise
- Use `import * as Effect from "effect/Effect"`
- Use `import * as S from "effect/Schema"`
- Follow test patterns from `.claude/rules/effect-patterns.md` Testing section

## Test File Locations
Create test files mirroring source structure:
- `apps/todox/src/app/lexical/schema/test/node-types.schema.test.ts`

## Test Cases to Implement

### Encode/Decode Round-Trips

Test that each node type schema can encode and decode correctly:

```typescript
import { effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { SerializedHeadingNode, SerializedParagraphNode, SerializedTextNode } from "../node-types.schema";

effect("SerializedHeadingNode encode/decode round-trip", () =>
  Effect.gen(function* () {
    const heading = {
      type: "heading" as const,
      version: 1,
      tag: "h1" as const,
      children: [],
      direction: "ltr" as const,
      format: "" as const,
      indent: 0,
    };

    const encoded = yield* S.encode(SerializedHeadingNode)(heading);
    const decoded = yield* S.decode(SerializedHeadingNode)(encoded);

    strictEqual(decoded.type, "heading");
    strictEqual(decoded.tag, "h1");
  })
);

effect("SerializedParagraphNode encode/decode round-trip", () =>
  Effect.gen(function* () {
    const paragraph = {
      type: "paragraph" as const,
      version: 1,
      children: [],
      direction: "ltr" as const,
      format: "" as const,
      indent: 0,
    };

    const encoded = yield* S.encode(SerializedParagraphNode)(paragraph);
    const decoded = yield* S.decode(SerializedParagraphNode)(encoded);

    strictEqual(decoded.type, "paragraph");
  })
);

// Continue for all node types...
```

### Discriminated Union Dispatch

Test that the union correctly dispatches on `type` field:

```typescript
import { SerializedLexicalNodeUnion } from "../node-types.schema";

effect("discriminated union dispatches on type field", () =>
  Effect.gen(function* () {
    const headingJSON = {
      type: "heading",
      version: 1,
      tag: "h2",
      children: [],
      direction: "ltr",
      format: "",
      indent: 0,
    };

    const result = yield* S.decodeUnknown(SerializedLexicalNodeUnion)(headingJSON);
    strictEqual(result.type, "heading");

    if (result.type === "heading") {
      strictEqual(result.tag, "h2");
    }
  })
);

effect("discriminated union rejects unknown type", () =>
  Effect.gen(function* () {
    const invalidJSON = {
      type: "unknown-node-type",
      version: 1,
    };

    const result = yield* S.decodeUnknown(SerializedLexicalNodeUnion)(invalidJSON).pipe(
      Effect.flip
    );

    strictEqual(result._tag, "ParseError");
  })
);
```

### Edge Cases

Test edge cases for specific node types:

```typescript
effect("ListNode with empty children is valid", () =>
  Effect.gen(function* () {
    const listJSON = {
      type: "list",
      version: 1,
      listType: "bullet",
      start: 1,
      tag: "ul",
      children: [],
      direction: "ltr",
      format: "",
      indent: 0,
    };

    const result = yield* S.decodeUnknown(SerializedLexicalNodeUnion)(listJSON);
    strictEqual(result.type, "list");
  })
);

effect("LinkNode with optional fields", () =>
  Effect.gen(function* () {
    const linkJSON = {
      type: "link",
      version: 1,
      url: "https://example.com",
      children: [],
      direction: "ltr",
      format: "",
      indent: 0,
      // rel, target, title are optional
    };

    const result = yield* S.decodeUnknown(SerializedLexicalNodeUnion)(linkJSON);
    strictEqual(result.type, "link");
    if (result.type === "link") {
      strictEqual(result.url, "https://example.com");
    }
  })
);

effect("TableCellNode with all optional fields", () =>
  Effect.gen(function* () {
    const cellJSON = {
      type: "tablecell",
      version: 1,
      colSpan: 1,
      rowSpan: 1,
      headerState: 0,
      children: [],
      direction: "ltr",
      format: "",
      indent: 0,
      // width, backgroundColor are optional
    };

    const result = yield* S.decodeUnknown(SerializedLexicalNodeUnion)(cellJSON);
    strictEqual(result.type, "tablecell");
  })
);
```

### Text Format Bitmask

Test text node format bitmask values:

```typescript
effect("text node format bitmask values", () =>
  Effect.gen(function* () {
    const boldItalicJSON = {
      type: "text",
      version: 1,
      text: "Bold and italic",
      format: 3, // bold (1) + italic (2)
      detail: 0,
      mode: "normal",
      style: "",
    };

    const result = yield* S.decodeUnknown(SerializedLexicalNodeUnion)(boldItalicJSON);
    strictEqual(result.type, "text");
    if (result.type === "text") {
      strictEqual(result.format, 3);
    }
  })
);
```

### Null Direction Valid

Test that null direction is accepted:

```typescript
effect("null direction is valid", () =>
  Effect.gen(function* () {
    const paragraphJSON = {
      type: "paragraph",
      version: 1,
      children: [],
      direction: null,
      format: "",
      indent: 0,
    };

    const result = yield* S.decodeUnknown(SerializedLexicalNodeUnion)(paragraphJSON);
    strictEqual(result.type, "paragraph");
  })
);
```

## Reference Documents
- Read `.claude/rules/effect-patterns.md` Testing section for test patterns
- Read `apps/todox/src/app/lexical/schema/node-types.schema.ts` for schema implementations

## Verification
Run: `bun run test --filter=@beep/todox`
```

---

## Agent: verifier (package-error-fixer)

This agent runs verification gates and fixes any errors found.

### Prompt

```
You are a package error fixer agent tasked with running verification gates and fixing any errors.

## Mission
Run all verification commands for the affected packages and fix any type or lint errors found.

## Critical Constraints
- Run commands from project root using `bun run <script>`
- Fix errors following `.claude/rules/effect-patterns.md` and `.claude/rules/code-standards.md`
- NEVER use `any`, `@ts-ignore`, or unchecked casts
- Run lint:fix only AFTER check passes

## Verification Commands

Run these commands in sequence:

### Type Checking

```bash
bun run check --filter=@beep/documents-domain
bun run check --filter=@beep/documents-tables
bun run check --filter=@beep/todox
```

### Linting

Only run after all type checks pass:

```bash
bun run lint:fix --filter=@beep/documents-domain
bun run lint:fix --filter=@beep/todox
```

## Error Fixing Strategy

### Type Errors

If type errors occur:

1. **Missing imports**: Add proper imports with namespace pattern
   ```typescript
   import * as S from "effect/Schema";
   import * as Effect from "effect/Effect";
   ```

2. **Recursive type issues**: Ensure `S.suspend` has explicit type annotation
   ```typescript
   children: S.Array(S.suspend((): S.Schema<any> => SerializedLexicalNodeEnvelope))
   ```

3. **PascalCase constructor errors**: Ensure using PascalCase (S.Struct, S.String, not s.struct, s.string)

4. **EntityId branding**: If ID fields exist, ensure proper branding from `@beep/shared-domain`

5. **Class extension**: Ensure `.extend` syntax matches pattern from `SerializedImageNode`

### Lint Errors

If lint errors occur:

1. **Unused imports**: Remove or use the import
2. **Prefer const**: Change `let` to `const` where possible
3. **Biome formatting**: Let `lint:fix` handle automatically

### Dependency Errors

If cascading errors from upstream packages:

1. Identify actual error source from error messages (package path)
2. Fix upstream package first
3. Re-run verification for downstream packages

## Expected Results

All commands should exit with code 0 (success). If any command fails:

1. Read error output carefully
2. Identify root cause
3. Fix error following Effect patterns
4. Re-run verification
5. Repeat until all checks pass

## Verification Complete Checklist

- [ ] `bun run check --filter=@beep/documents-domain` passes
- [ ] `bun run check --filter=@beep/documents-tables` passes
- [ ] `bun run check --filter=@beep/todox` passes
- [ ] `bun run lint:fix --filter=@beep/documents-domain` passes
- [ ] `bun run lint:fix --filter=@beep/todox` passes

## Reference Documents
- Read `.claude/rules/effect-patterns.md` for Effect patterns
- Read `.claude/rules/code-standards.md` for style standards
- Read `.claude/rules/general.md` for verification behavior

## Report Format

After all verifications pass, report:

```
Verification Complete

Type Checks:
✓ @beep/documents-domain
✓ @beep/documents-tables
✓ @beep/todox

Lint Checks:
✓ @beep/documents-domain
✓ @beep/todox

All quality gates passed.
```

If errors persist after multiple attempts, report the specific error with file/line and request guidance.
```

---

## Usage Notes

1. Each prompt is self-contained and can be copy-pasted directly to the appropriate agent type
2. Agents should be spawned using `TeamCreate` for parallel execution where possible
3. The verifier agent should run AFTER all other agents complete their work
4. All prompts reference the critical rule files (`.claude/rules/effect-patterns.md`, etc.)
5. Test agents should run AFTER schema agents but BEFORE verifier agent
6. Domain work and application work can be parallelized (domain-schemas + domain-tests in parallel with app-schemas + app-tests)
