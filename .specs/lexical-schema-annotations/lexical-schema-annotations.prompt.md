---
name: lexical-schema-annotations
version: 1
created: 2025-12-11T00:00:00Z
iterations: 0
---

# Lexical Schema Annotations - Refined Prompt

## Context

You are working in the `@beep/lexical-schemas` package within the `beep-effect` monorepo. This package provides type-safe Effect Schema validation for Lexical editor state serialization. Currently, schemas in this package use inconsistent annotation patterns. Some schemas already use the `$I.annotations()` utility from the identity composer system (`@beep/identity/packages`), while others use manual `.annotations()` calls with incomplete metadata.

### Current State

**File with correct pattern:** `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/lexical-schemas/src/nodes/plugins/index.ts`
- Already imports `$LexicalSchemasId` from `@beep/identity/packages`
- Already defines `const $I = $LexicalSchemasId.create("nodes/plugins")`
- Has examples of both patterns:
  - **CORRECT**: `ListTagType` uses `$I.annotations("ListTagType", { description: "..." })`
  - **INCORRECT**: `TableCellHeaderState` uses manual `.annotations({ identifier: "...", description: "..." })`

**Files needing updates:**
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/lexical-schemas/src/nodes/base.ts`
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/lexical-schemas/src/nodes/element.ts`
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/lexical-schemas/src/nodes/text.ts`
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/lexical-schemas/src/nodes/linebreak.ts`
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/lexical-schemas/src/nodes/tab.ts`
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/lexical-schemas/src/state.ts`
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/lexical-schemas/src/errors.ts`

### Existing Patterns

The identity composer pattern (`$I.annotations()`) automatically generates:
- `schemaId`: Symbol for unique schema identification
- `identifier`: Schema identifier string
- `title`: Human-readable title derived from identifier

The second argument to `$I.annotations()` accepts additional annotation properties like `description`, `examples`, `documentation`, etc.

## Objective

**Primary Goal**: Standardize all schema annotations in `@beep/lexical-schemas` to use the `$I.annotations()` pattern from the identity composer system.

**Secondary Goal**: Ensure all schemas have complete annotation metadata including: `examples`, `documentation`, `description`, `arbitrary`, `equivalence`, `pretty`, `parseIssueTitle`, and `message` annotations.

**Success Criteria**:
1. Every file with schemas has a `$I` constant defined using `$LexicalSchemasId.create("<module-path>")`
2. Every schema uses `$I.annotations("<SchemaName>", { ... })` instead of manual `.annotations({ identifier: "...", ... })`
3. All schemas have the 8 required annotation properties defined
4. No compilation errors after changes
5. All existing tests continue to pass

## Role

You are an expert Effect-TS developer specializing in schema engineering and codebase standardization. You understand:
- Effect Schema annotation patterns and AST metadata
- Identity composer system from `@beep/identity`
- Lexical editor serialization schemas
- Effect utilities (`Arbitrary`, `Pretty`, `Equivalence`)
- Creating reusable annotation helper functions to reduce boilerplate

## Constraints

### Forbidden Patterns
- Manual `.annotations({ identifier: "...", schemaId: ..., title: "..." })` - use `$I.annotations()` instead
- Incomplete annotation metadata - all 8 required properties must be present
- Inconsistent `$I` creation across files - always use `$LexicalSchemasId.create("<module-path>")`
- Using native Array methods - use `A.map`, `A.filter` from `effect/Array`
- Using native String methods - use `Str.split`, `Str.trim` from `effect/String`

### Required Patterns
- Import `$LexicalSchemasId` from `@beep/identity/packages` at top of each schema file
- Define `const $I = $LexicalSchemasId.create("<relative-module-path>")` once per file
- Use `$I.annotations("<SchemaName>", { ...extras })` for all schema annotations
- All schemas must have: `examples`, `documentation`, `description`, `arbitrary`, `equivalence`, `pretty`, `parseIssueTitle`, `message`
- Annotation utilities should be created in `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/lexical-schemas/src/annotation-utils.ts`

### Module Path Conventions
- For files in `src/nodes/*.ts`: use `"nodes/<filename>"` (e.g., `"nodes/base"`, `"nodes/text"`)
- For files in `src/nodes/plugins/*.ts`: use `"nodes/plugins/<filename>"` (e.g., `"nodes/plugins/index"`)
- For files in `src/*.ts`: use `"<filename>"` (e.g., `"state"`, `"errors"`)

## Resources

### Files to Read
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/lexical-schemas/src/nodes/plugins/index.ts` - Reference implementation with `$I.annotations()` pattern
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/lexical-schemas/src/nodes/base.ts` - Base types needing updates
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/lexical-schemas/src/nodes/element.ts` - Main union needing updates
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/lexical-schemas/src/nodes/text.ts` - Text node needing updates
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/lexical-schemas/src/nodes/linebreak.ts` - Line break node
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/lexical-schemas/src/nodes/tab.ts` - Tab node
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/lexical-schemas/src/state.ts` - Editor state schema
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/lexical-schemas/src/errors.ts` - Error schemas
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/lexical-schemas/AGENTS.md` - Package-specific guidelines
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/identity/src/Identifier.ts` - Identity composer implementation
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/schema/src/core/annotations/default.ts` - Annotation types and helpers

### Documentation References
- Effect Schema Annotations: `effect/Schema` module, `AST.Annotations` interface
- Effect Arbitrary: `effect/Arbitrary` for generating test data
- Effect Pretty: `effect/Pretty` for human-readable output
- Effect Equivalence: `effect/Equivalence` for equality checks

## Output Specification

### Phase 1: Analysis & Planning

Create a comprehensive checklist in a file at `/home/elpresidank/YeeBois/projects/beep-effect/.specs/lexical-schema-annotations/schema-checklist.md`:

```markdown
# Schema Annotation Checklist

## File: nodes/base.ts
Module Path: `"nodes/base"`

### Schemas to Update
- [ ] ElementFormatType
  - [ ] examples
  - [ ] documentation
  - [ ] description (✓ exists)
  - [ ] arbitrary
  - [ ] equivalence
  - [ ] pretty
  - [ ] parseIssueTitle
  - [ ] message
- [ ] TextDirectionType
  - [ ] examples
  - [ ] documentation
  - [ ] description (✓ exists)
  - [ ] arbitrary
  - [ ] equivalence
  - [ ] pretty
  - [ ] parseIssueTitle
  - [ ] message
- [ ] TextModeType
  - [ ] examples
  - [ ] documentation
  - [ ] description (✓ exists)
  - [ ] arbitrary
  - [ ] equivalence
  - [ ] pretty
  - [ ] parseIssueTitle
  - [ ] message
- [ ] SerializedLexicalNodeBase
  - [ ] examples
  - [ ] documentation
  - [ ] description (✓ exists)
  - [ ] arbitrary
  - [ ] equivalence
  - [ ] pretty
  - [ ] parseIssueTitle
  - [ ] message

### Annotation Utilities Needed
- [ ] `literalKitAnnotations` - for ElementFormatType, TextDirectionType, TextModeType
- [ ] `baseNodeAnnotations` - for SerializedLexicalNodeBase

## File: nodes/text.ts
Module Path: `"nodes/text"`

### Schemas to Update
- [ ] SerializedTextNode
  - [ ] examples (✓ exists in jsonSchema)
  - [ ] documentation
  - [ ] description (✓ exists)
  - [ ] arbitrary
  - [ ] equivalence
  - [ ] pretty
  - [ ] parseIssueTitle
  - [ ] message

### Annotation Utilities Needed
- [ ] `nodeAnnotations` - for all node types with children

[... continue for all files ...]
```

### Phase 2: Annotation Utilities

Create `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/lexical-schemas/src/annotation-utils.ts`:

```typescript
/**
 * Annotation utilities for Lexical schemas.
 *
 * Provides reusable annotation generators to reduce boilerplate across schema definitions.
 *
 * @module
 * @category Internal
 * @since 0.1.0
 */

import type * as Arbitrary from "effect/Arbitrary";
import * as Equivalence from "effect/Equivalence";
import * as Pretty from "effect/Pretty";
import * as S from "effect/Schema";

/**
 * Creates standard annotations for literal/enum-style schemas.
 */
export const literalAnnotations = <A>(params: {
  readonly examples: ReadonlyArray<A>;
  readonly description: string;
  readonly documentation?: string;
  readonly message?: string;
}) => ({
  description: params.description,
  documentation: params.documentation,
  examples: params.examples,
  message: params.message ?? (() => `Invalid value. Expected one of: ${params.examples.join(", ")}`),
  parseIssueTitle: () => "Invalid literal value",
  // arbitrary, pretty, equivalence will be generated by Effect Schema automatically for literals
});

/**
 * Creates standard annotations for node schemas with examples.
 */
export const nodeAnnotations = <A>(params: {
  readonly description: string;
  readonly documentation?: string;
  readonly examples?: ReadonlyArray<A>;
  readonly message?: string;
}) => ({
  description: params.description,
  documentation: params.documentation,
  examples: params.examples,
  message: params.message ?? (() => "Invalid node structure"),
  parseIssueTitle: () => "Node validation failed",
  // arbitrary, pretty, equivalence will be generated by Effect Schema automatically
});

/**
 * Creates annotations for error schemas.
 */
export const errorAnnotations = (params: {
  readonly description: string;
  readonly documentation?: string;
}) => ({
  description: params.description,
  documentation: params.documentation,
  message: () => "Error validation failed",
  parseIssueTitle: () => "Invalid error structure",
});
```

### Phase 3: Schema File Updates

For each file, apply these transformations:

**Step 1**: Add imports at the top
```typescript
import { $LexicalSchemasId } from "@beep/identity/packages";
```

**Step 2**: Define module-scoped `$I` constant
```typescript
const $I = $LexicalSchemasId.create("<module-path>");
```

**Step 3**: Update each schema's `.annotations()` call
```typescript
// BEFORE
export class ElementFormatType extends BS.LiteralKit(
  "left", "start", "center", "right", "end", "justify", ""
).annotations({
  identifier: "ElementFormatType",
  description: "Block-level text alignment format",
}) {}

// AFTER
export class ElementFormatType extends BS.LiteralKit(
  "left", "start", "center", "right", "end", "justify", ""
).annotations($I.annotations("ElementFormatType", {
  description: "Block-level text alignment format",
  documentation: "Defines how block-level elements are aligned within their container. Supports standard CSS alignment values.",
  examples: ["left", "center", "right", "justify"],
  message: () => "Invalid element format. Expected one of: left, start, center, right, end, justify, or empty string.",
  parseIssueTitle: () => "Invalid element format type",
  // arbitrary, pretty, equivalence auto-generated by Effect Schema for LiteralKit
})) {}
```

### Phase 4: Verification

After all updates:
1. Run type checking: `bun run check`
2. Run tests: `bun run test packages/common/lexical-schemas`
3. Run linting: `bun run lint`
4. Verify all schemas compile without errors

## Execution Strategy

### Task Breakdown

**DO NOT EXECUTE THESE TASKS**. This is a planning document to be used by sub-agents.

1. **Inventory Phase** (Single Agent)
   - Read all 7 schema files
   - Extract all schema definitions
   - Create comprehensive checklist in `schema-checklist.md`
   - Identify common patterns for utilities

2. **Utility Creation Phase** (Single Agent)
   - Create `annotation-utils.ts`
   - Define reusable annotation helpers
   - Add JSDoc documentation
   - Export all utilities

3. **Parallel Update Phase** (7 Agents in Parallel)
   - Agent 1: Update `nodes/base.ts`
   - Agent 2: Update `nodes/element.ts`
   - Agent 3: Update `nodes/text.ts`
   - Agent 4: Update `nodes/linebreak.ts`
   - Agent 5: Update `nodes/tab.ts`
   - Agent 6: Update `state.ts`
   - Agent 7: Update `errors.ts`

4. **Verification Phase** (Single Agent)
   - Run `bun run check`
   - Run `bun run test packages/common/lexical-schemas`
   - Run `bun run lint`
   - Report results

## Examples

### Example 1: Simple Literal Schema

**Before:**
```typescript
export class TextModeType extends BS.LiteralKit("normal", "token", "segmented").annotations({
  identifier: "TextModeType",
  description: "Text mode for navigation and deletion behavior",
}) {}
```

**After:**
```typescript
import { $LexicalSchemasId } from "@beep/identity/packages";

const $I = $LexicalSchemasId.create("nodes/base");

export class TextModeType extends BS.LiteralKit("normal", "token", "segmented").annotations(
  $I.annotations("TextModeType", {
    description: "Text mode for navigation and deletion behavior",
    documentation: "Controls how text nodes behave during navigation and deletion: 'normal' for standard behavior, 'token' for atomic deletion, 'segmented' for character-by-character navigation with word-based deletion.",
    examples: ["normal", "token", "segmented"],
    message: () => "Invalid text mode. Expected: normal, token, or segmented.",
    parseIssueTitle: () => "Invalid text mode type",
  })
) {}
```

### Example 2: Struct Schema

**Before:**
```typescript
export class SerializedEditorState extends S.Struct({
  root: SerializedRootNode,
}).annotations({
  identifier: "SerializedEditorState",
  description: "Top-level Lexical editor state for database persistence",
  title: "Lexical Editor State",
  jsonSchema: {
    examples: [
      {
        root: {
          type: "root",
          version: 1,
          children: [],
          direction: null,
          format: "",
          indent: 0,
        },
      },
    ],
  },
}) {}
```

**After:**
```typescript
import { $LexicalSchemasId } from "@beep/identity/packages";

const $I = $LexicalSchemasId.create("state");

export class SerializedEditorState extends S.Struct({
  root: SerializedRootNode,
}).annotations(
  $I.annotations("SerializedEditorState", {
    description: "Top-level Lexical editor state for database persistence",
    documentation: "The complete serialized state of a Lexical editor, containing the root node and all nested content. This is the primary structure persisted to the database.",
    examples: [
      {
        root: {
          type: "root",
          version: 1,
          children: [],
          direction: null,
          format: "",
          indent: 0,
        },
      },
    ],
    message: () => "Invalid editor state structure",
    parseIssueTitle: () => "Editor state validation failed",
  })
) {}
```

### Example 3: Tagged Error Schema

**Before:**
```typescript
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

**After:**
```typescript
import { $LexicalSchemasId } from "@beep/identity/packages";

const $I = $LexicalSchemasId.create("errors");

export class LexicalSchemaValidationError extends S.TaggedError<LexicalSchemaValidationError>()(
  "LexicalSchemaValidationError",
  {
    message: S.String,
    nodeType: S.optional(S.String),
    path: S.optional(S.Array(S.String)),
  },
  $I.annotations("LexicalSchemaValidationError", {
    description: "Error validating Lexical editor state schema",
    documentation: "Thrown when validation of Lexical editor state fails. Includes the validation error message, optional node type, and path to the invalid node.",
    examples: [
      {
        _tag: "LexicalSchemaValidationError",
        message: "Invalid node type",
        nodeType: "unknown",
        path: ["root", "children", "0"],
      },
    ],
    message: () => "Lexical schema validation failed",
    parseIssueTitle: () => "Schema validation error",
  })
) {}
```

## Verification Checklist

After implementation, verify:

- [ ] All schema files import `$LexicalSchemasId` from `@beep/identity/packages`
- [ ] All schema files define `const $I = $LexicalSchemasId.create("<module-path>")`
- [ ] Module paths follow conventions (e.g., `"nodes/base"`, `"state"`, `"errors"`)
- [ ] All schemas use `$I.annotations()` instead of manual `.annotations()`
- [ ] All schemas have `description` annotation
- [ ] All schemas have `documentation` annotation
- [ ] All schemas have `examples` annotation
- [ ] All schemas have `message` annotation
- [ ] All schemas have `parseIssueTitle` annotation
- [ ] `annotation-utils.ts` file exists with helper functions
- [ ] `bun run check` passes with no type errors
- [ ] `bun run test packages/common/lexical-schemas` passes all tests
- [ ] `bun run lint` passes with no errors
- [ ] No manual `identifier`, `schemaId`, or `title` properties remain

---

## Metadata

### Research Sources

**Files Explored:**
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/lexical-schemas/src/nodes/plugins/index.ts` - Reference implementation with correct `$I.annotations()` pattern
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/lexical-schemas/src/nodes/base.ts` - Base type schemas needing updates
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/lexical-schemas/src/nodes/element.ts` - Main recursive union schema
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/lexical-schemas/src/nodes/text.ts` - Text node with existing jsonSchema examples
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/lexical-schemas/src/state.ts` - Editor state schema with partial annotations
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/lexical-schemas/src/errors.ts` - TaggedError schemas
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/lexical-schemas/AGENTS.md` - Package-specific patterns and constraints
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/identity/src/Identifier.ts` - Identity composer implementation details
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/identity/src/packages.ts` - All package identity composers including `$LexicalSchemasId`
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/schema/src/core/annotations/default.ts` - Standard annotation types and symbols
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/schema/src/primitives/string/email.ts` - Example of complete annotation pattern

**Documentation Referenced:**
- Effect Schema AST annotations - Standard annotation properties
- Identity composer system - `$I.annotations()` utility usage
- Package AGENTS.md - Effect-first constraints and patterns

**Package Guidelines:**
- `@beep/lexical-schemas/AGENTS.md` - Recursive schema patterns, S.suspend usage, type namespace conventions
- Root `AGENTS.md` - Effect-first patterns, import conventions, forbidden native methods

### Refinement History

| Iteration | Issues Found | Fixes Applied |
|-----------|--------------|---------------|
| 0         | Initial draft | N/A          |
