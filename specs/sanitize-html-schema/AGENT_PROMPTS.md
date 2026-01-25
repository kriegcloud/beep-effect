# sanitize-html-schema: Agent Prompts

> Pre-configured prompts for each phase of the specification workflow.

---

## Phase 1: Discovery Prompts

### 1.1 Codebase Researcher - Type Mapping

```
Analyze the sanitize-html module to create a complete type inventory.

Research Tasks:
1. Read packages/common/utils/src/sanitize-html/types.ts
2. Document all interfaces: Attributes, TransformedTag, Frame, SanitizeOptions, etc.
3. Identify union types that use `false` to mean "allow all" (e.g., `false | string[]`)
4. List all callback/function types (Transformer, textFilter, exclusiveFilter)
5. Document the Defaults interface structure

Output Format:
Create outputs/types-inventory.md with:
- Each interface with all fields
- Type annotations for each field
- Notes on nullable/optional patterns
- Union types requiring S.TaggedClass treatment

Key Files:
- packages/common/utils/src/sanitize-html/types.ts
- packages/common/utils/src/sanitize-html/defaults.ts
```

### 1.2 Codebase Researcher - Options Matrix

```
Document all SanitizeOptions configuration fields.

Research Tasks:
1. Read packages/common/utils/src/sanitize-html/types.ts (SanitizeOptions interface)
2. Read packages/common/utils/src/sanitize-html/defaults.ts (default values)
3. For each of the ~27 options:
   - Field name
   - Type (exact TypeScript type)
   - Default value
   - Whether `false` means "allow all"
   - Whether it's required/optional

Output Format:
Create outputs/options-matrix.md with a table:
| Field | Type | Default | false=AllowAll | Required |
|-------|------|---------|----------------|----------|

Key patterns to identify:
- Options using `false | readonly string[]`
- Options using `undefined | Record<string, ...>`
- Callback options
- Boolean flags
```

### 1.3 Codebase Researcher - Dependency Graph

```
Map the internal dependencies of the sanitize-html module.

Research Tasks:
1. List all files in packages/common/utils/src/sanitize-html/
2. For each file, identify:
   - What it imports from other sanitize-html files
   - What external dependencies it uses
   - What it exports

Create dependency graph:
- filters/tag-filter.ts depends on: ?
- filters/attribute-filter.ts depends on: ?
- filters/class-filter.ts depends on: ?
- parser/html-parser.ts depends on: ?
- url/url-validator.ts depends on: ?
- sanitize-html.ts depends on: ?

Output Format:
Create outputs/dependency-graph.md with:
- ASCII dependency tree
- List of shared utilities
- External dependencies (effect modules used)
```

### 1.4 Codebase Researcher - Literal Kit Inventory

```
Catalog existing HTML literal-kits and identify gaps.

Research Tasks:
1. Read all files in packages/common/schema/src/integrations/html/literal-kits/
2. Document each literal-kit:
   - Class name
   - All literal values
   - Derived classes (e.g., MediaTag from HtmlTag)

3. Compare against sanitize-html requirements:
   - Tags used in defaults.ts vs HtmlTag literal-kit
   - Schemes used in defaults.ts vs AllowedScheme literal-kit
   - Attributes used in defaults.ts vs HtmlAttribute literal-kit

Output Format:
Create outputs/literal-kit-gaps.md with:
- Current literal-kit coverage
- Missing literals to add
- Recommendations for new derived kits
```

### 1.5 Effect Schema Expert - S.TaggedClass Patterns

```
Research S.TaggedClass patterns in the codebase for discriminated unions.

Research Tasks:
1. Find existing S.TaggedClass usage:
   grep -r "TaggedClass" packages/*/domain/src --include="*.ts"

2. Document patterns for:
   - Simple discriminated unions (2-3 variants)
   - Unions with payload variants
   - Unions with optional fields

3. Research Effect Schema documentation for:
   - S.TaggedClass best practices
   - S.Union composition
   - Matching discriminated unions with Match.value

Output: Provide pattern examples that can be applied to:
- AllowedTags (AllTags | NoneTags | SpecificTags)
- AllowedAttributes (AllAttributes | NoneAttributes | SpecificAttributes)
- DisallowedTagsMode (Discard | Escape | RecursiveEscape | CompletelyDiscard)
```

---

## Phase 2: Design Prompts

### 2.1 Effect Schema Expert - AllowedTags Design

```
Design the AllowedTags discriminated union schema.

Requirements:
- Must support: all tags allowed, no tags allowed, specific tags list
- Must integrate with existing HtmlTag literal-kit
- Must use S.TaggedClass for discrimination

Design:
1. AllTags variant - empty, means all tags allowed
2. NoneTags variant - empty, means no tags allowed (escape all)
3. SpecificTags variant - contains array of HtmlTag

Provide complete TypeScript code following Effect patterns:
- Namespace imports (import * as S from "effect/Schema")
- Proper annotations with $SchemaId
- Type exports with namespace declarations
```

### 2.2 Effect Schema Expert - SanitizeConfig Design

```
Design the main SanitizeConfig schema class.

Requirements:
- Must include all 27 options from SanitizeOptions interface
- Must use discriminated unions for variant types
- Must have sensible defaults matching current defaults.ts
- Must use S.Class with proper annotations

Structure:
1. Use AllowedTags, AllowedAttributes, etc. for variant options
2. Use S.optional/S.optionalWith for optional fields
3. Use literal-kits for constrained values
4. Handle callback types appropriately

Provide complete S.Class definition with all fields.
```

### 2.3 MCP Researcher - S.transform Patterns

```
Research Effect Schema S.transform and S.transformOrFail patterns.

Questions to answer:
1. How to create a transform that accepts multiple input types?
2. How to handle transformation errors?
3. How to compose transforms with branded output types?
4. Are there performance considerations?

Look for:
- Official Effect documentation on S.transform
- Examples of complex transforms in Effect codebase
- Patterns for decode-only transforms (encode is passthrough)
```

---

## Phase 3: Implementation Prompts

### 3.1 Effect Code Writer - Directory Structure

```
Create the directory structure for sanitize schema.

Location: packages/common/schema/src/integrations/html/sanitize/

Create:
1. config/ directory with index.ts
2. types/ directory with index.ts
3. branded/ directory with index.ts
4. Main index.ts barrel export

Each index.ts should have:
- Module-level JSDoc comment
- Empty exports ready for implementation
```

### 3.2 Effect Code Writer - SanitizedHtml Brand

```
Implement the SanitizedHtml branded string schema.

Location: packages/common/schema/src/integrations/html/sanitize/branded/sanitized-html.ts

Requirements:
- Use S.String as base
- Apply S.brand("SanitizedHtml")
- Add proper annotations (identifier, description)
- Export both schema and type

Follow patterns from:
- packages/common/schema/src/identity/entity-id/entity-id.ts
- Effect branding conventions

Include:
- @since 0.1.0
- @category sanitization
- Proper JSDoc
```

### 3.3 Effect Code Writer - AllowedTags Schema

```
Implement AllowedTags discriminated union.

Location: packages/common/schema/src/integrations/html/sanitize/config/allowed-tags.ts

Classes to create:
1. AllTags - empty TaggedClass
2. NoneTags - empty TaggedClass
3. SpecificTags - TaggedClass with tags: S.Array(HtmlTag)

Union:
export const AllowedTags = S.Union(AllTags, NoneTags, SpecificTags);

Requirements:
- Import HtmlTag from "../../../literal-kits"
- Use $SchemaId for annotations
- Export namespace declarations
- Follow Effect namespace import conventions
```

### 3.4 Effect Code Writer - Factory Function

```
Implement makeSanitizeSchema factory.

Location: packages/common/schema/src/integrations/html/sanitize/factory.ts

Signature:
export const makeSanitizeSchema = (config: SanitizeConfig.Type) =>
  S.transform(
    S.Union(S.String, S.Number, S.Null, S.Undefined),
    SanitizedHtml,
    { ... }
  );

Requirements:
1. Accept SanitizeConfig.Type
2. Handle null/undefined input → empty string
3. Handle number input → convert to string
4. Apply sanitization based on config
5. Return branded SanitizedHtml

The decode function should:
- Call internal sanitize() with config
- Return branded result

The encode function should:
- Simply return the string (passthrough)
```

---

## Phase 4: Testing Prompts

### 4.1 Test Writer - Schema Validation Tests

```
Create tests for discriminated union schemas.

Location: packages/common/schema/test/integrations/html/sanitize/

Tests for each schema:
1. AllowedTags
   - Decodes AllTags variant
   - Decodes NoneTags variant
   - Decodes SpecificTags with valid tags
   - Rejects invalid tag names

2. AllowedAttributes
   - Decodes AllAttributes variant
   - Decodes SpecificAttributes with global attrs
   - Decodes SpecificAttributes with byTag overrides

3. SanitizeConfig
   - Decodes with all required fields
   - Applies defaults for optional fields

Use @beep/testkit:
- effect() for each test
- strictEqual for assertions
- S.decodeSync for synchronous decode
```

### 4.2 Test Writer - Parity Tests

```
Create tests ensuring behavioral parity with existing sanitize-html.

Location: packages/common/schema/test/integrations/html/sanitize/parity.test.ts

Test cases:
1. Script tag removal
2. Style tag removal
3. Allowed tags passthrough
4. Attribute filtering
5. URL scheme validation
6. Class filtering
7. Style filtering
8. Nested tag handling
9. Null/undefined input
10. Number input conversion

For each test:
- Use old sanitizer from @beep/utils
- Use new schema from @beep/schema
- Compare outputs are identical

Template:
effect("parity: [test name]", () =>
  Effect.gen(function* () {
    const input = "...";
    const oldResult = oldSanitize(input, options);
    const newResult = S.decodeSync(schema)(input);
    strictEqual(newResult, oldResult);
  })
);
```

---

## Phase 5: Integration Prompts

### 5.1 Package Error Fixer

```
Fix all type and lint errors in @beep/schema package.

Run:
bun run check --filter @beep/schema
bun run lint --filter @beep/schema

For each error:
1. Identify the file and line
2. Understand the error type
3. Apply appropriate fix
4. Re-run verification

Common fixes:
- Missing imports
- Type mismatches
- Lint rule violations (biome)
- Missing namespace declarations
```

### 5.2 Code Reviewer - Final Review

```
Perform final code review of sanitize schema implementation.

Check:
1. All files use namespace imports (import * as S from "effect/Schema")
2. No native JS methods (array.map, string.split, etc.)
3. Proper annotations on all schemas
4. Consistent naming conventions
5. JSDoc on all exports
6. Barrel exports properly configured

Review files:
- packages/common/schema/src/integrations/html/sanitize/**/*.ts

Output: outputs/final-review.md with:
- Issues found
- Recommendations
- Sign-off status
```

---

## Handoff Prompt Templates

### End of Phase Template

```
Create handoff documents for Phase [N] completion.

1. Create handoffs/HANDOFF_P[N+1].md with:
   - Phase [N] Summary
   - Key Decisions Made
   - Implementation Completed
   - Issues Encountered
   - Next Phase Tasks
   - Verification Steps
   - Success Criteria

2. Create handoffs/P[N+1]_ORCHESTRATOR_PROMPT.md with:
   - Concise context (under 2000 tokens)
   - Clear mission statement
   - Specific tasks to complete
   - Critical patterns to follow
   - Files to reference
   - Verification commands
```

---

## Quick Reference

| Phase | Primary Agent | Prompt Section |
|-------|---------------|----------------|
| 1 Discovery | codebase-researcher | 1.1-1.4 |
| 1 Discovery | effect-schema-expert | 1.5 |
| 2 Design | effect-schema-expert | 2.1-2.2 |
| 2 Design | mcp-researcher | 2.3 |
| 3 Implementation | effect-code-writer | 3.1-3.4 |
| 4 Testing | test-writer | 4.1-4.2 |
| 5 Integration | package-error-fixer | 5.1 |
| 5 Integration | code-reviewer | 5.2 |
