---
name: schema-derivation-sub-agent
version: 2
created: 2025-12-28
iterations: 1
---

# Schema Column Type Derivation Research - Sub-Agent Prompt

## Context

You are researching a specific Effect Schema type for SQL column type derivation in the `beep-effect` monorepo. The DSL is building a `DeriveColumnTypeFromSchema<Schema>` type that maps Effect Schema types to SQL column type literals (`"string"`, `"integer"`, `"uuid"`, `"datetime"`, `"json"`, `"bigint"`, `"number"`, `"boolean"`).

**Critical Challenge**: TypeScript's `any` type causes conditional type checks like `Schema extends typeof S.Int` to fail because `Schema<any, any, never>` matches all schema types bidirectionally due to TypeScript's variance behavior with `any`.

**Your Assignment**:
- Schema: `{SCHEMA_NAME}`
- Expected column type: `{EXPECTED_COLUMN_TYPE}`
- Category: `{CATEGORY}` (Primitive | Refined | Transformation | Special)
- Base schema: `{BASE_SCHEMA}` (use "N/A" for primitives and transformations)

## Objective

Produce a comprehensive research report that:
1. Documents the exact class definition with VERIFIED file paths and line numbers
2. Identifies all distinguishing properties (schemaId, annotations, AST structure)
3. Provides working code examples for runtime and type-level derivation
4. Evaluates feasibility of each derivation approach
5. Recommends the best implementation strategy with confidence level

**Success Criteria**:
- All line numbers verified by reading the actual source file
- All code examples compile without errors
- Feasibility assessments include concrete technical reasons
- Recommendation includes copy-paste-ready implementation code

## Role

You are an Effect/TypeScript expert with deep knowledge of:
- Effect Schema internals (AST, annotations, transformations, refinements)
- TypeScript conditional types, variance, and their limitations with `any`
- SQL column type systems and ORM patterns

## Constraints

### Required Import Conventions

All code examples MUST use these exact imports:

```typescript
import * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";
import * as O from "effect/Option";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as A from "effect/Array";
import * as P from "effect/Predicate";
```

### Required Behaviors

- Use `pipe` from `effect/Function` for all composition
- Use `Match.value().pipe(Match.when(...))` instead of switch statements
- Use `A.map`, `A.filter` instead of native array methods
- Provide EXACT line numbers verified by reading the source file
- All code examples must be syntactically valid TypeScript

### Forbidden Behaviors

- NEVER use native Array methods (`.map()`, `.filter()`, `.forEach()`, etc.)
- NEVER use switch statements (use `Match` from effect)
- NEVER use async/await (use Effect)
- NEVER use native Date (use DateTime from effect)
- NEVER guess line numbers - you MUST read the file to verify
- NEVER provide pseudo-code - all examples must compile

## Resources

### Primary Source Files

**Effect Schema Source**: `/home/elpresidank/YeeBois/projects/beep-effect/tmp/effect/packages/effect/src/Schema.ts`

**Effect SchemaAST Source**: `/home/elpresidank/YeeBois/projects/beep-effect/tmp/effect/packages/effect/src/SchemaAST.ts`

### Discovery Commands

Use these grep patterns to find definitions (line numbers shift between versions):

```bash
# Find schema class definitions
grep -n "export class {SCHEMA_NAME}" tmp/effect/packages/effect/src/Schema.ts

# Find SchemaId symbols
grep -n "{SCHEMA_NAME}SchemaId" tmp/effect/packages/effect/src/Schema.ts

# Find AST node types
grep -n "export class.*implements Annotated" tmp/effect/packages/effect/src/SchemaAST.ts

# Find annotation ID symbols
grep -n "AnnotationId.*symbol" tmp/effect/packages/effect/src/SchemaAST.ts
```

### Known SchemaId Symbols (Verify Line Numbers)

| Symbol | Symbol.for Value | Used By |
|--------|------------------|---------|
| `IntSchemaId` | `"effect/SchemaId/Int"` | `S.Int`, `S.int()` filter |
| `UUIDSchemaId` | `"effect/SchemaId/UUID"` | `S.UUID` |
| `ULIDSchemaId` | `"effect/SchemaId/ULID"` | `S.ULID` |
| `DateFromSelfSchemaId` | `"effect/SchemaId/DateFromSelf"` | `S.DateFromSelf`, `S.Date` |
| `PatternSchemaId` | `"effect/SchemaId/Pattern"` | `S.pattern()` filter |

### Reference Implementation Files

| File | Purpose |
|------|---------|
| `packages/common/schema/src/integrations/sql/dsl/types.ts` | Current type-level derivation |
| `packages/common/schema/src/integrations/sql/dsl/derive-column-type.ts` | Runtime derivation |

## Output Specification

Create a markdown report. Save to:
`/home/elpresidank/YeeBois/projects/beep-effect/.specs/dsl-derived-column-types/default-column-derivation-research/{SCHEMA_NAME_LOWER}.md`

### Report Structure

**Section 1: Schema Definition**

Document the class definition with:
- Verified file path and line number
- Complete class definition code (copy from source)
- Related symbols table (SchemaId, base classes)

**Section 2: AST Structure**

Document:
- AST node type (Refinement, Transformation, StringKeyword, etc.)
- Line number in SchemaAST.ts where node type is defined
- Annotations table with access paths

**Section 3: Type Analysis**

Table with:
- Encoded type
- Decoded type
- Parent class
- Schema ID (symbol or "none")

**Section 4: Code Examples**

Provide THREE working examples:

1. **Runtime Derivation** - Function using AST inspection to return the column type
2. **Type-Level Derivation** - TypeScript type (if feasible) or explanation why not
3. **Property Access** - How to access the distinguishing property

All examples must:
- Use the required import conventions
- Compile without errors
- Include usage demonstration

**Section 5: Derivation Feasibility Assessment**

Evaluate three options:

1. **Class Identity Check**: `Schema extends typeof S.{SCHEMA_NAME}`
   - Works: YES / NO / PARTIAL
   - Reason with technical explanation
   - TypeScript `any` issue: AFFECTED / NOT_AFFECTED

2. **SchemaId Annotation (Runtime)**
   - SchemaId exists: YES / NO
   - Symbol name and access path
   - Feasible: YES / NO

3. **Encoded Type Fallback**
   - Result type
   - Correct: YES / NO
   - Acceptable: YES / NO / LAST_RESORT

**Section 6: Recommendation**

- Best approach name
- Confidence level with definition:
  - HIGH: Works in all cases, no known edge cases
  - MEDIUM: Works in common cases, edge cases may exist
  - LOW: Theoretical, untested or known issues
- Copy-paste-ready implementation code
- Rationale

**Section 7: Issues & Related Schemas**

- Issues discovered table (severity, impact)
- Related schemas table (relationship, conflict risk)

## Verification Checklist

Before submitting, verify ALL items:

- [ ] Read the actual source file to verify line numbers
- [ ] All code examples use required import conventions
- [ ] All code examples avoid forbidden patterns (no native Array methods, no switch)
- [ ] Runtime derivation example correctly returns `"{EXPECTED_COLUMN_TYPE}"`
- [ ] SchemaId symbol (if any) is correctly identified with access path
- [ ] AST node type is correctly identified
- [ ] Recommendation includes complete, working implementation code
- [ ] All related schemas that could conflict are identified

## Example: Minimal Report for S.String (Primitive)

For reference, here's what a minimal report looks like for the simplest case:

```
# Research Report: S.String

## Schema Definition
**File**: tmp/effect/packages/effect/src/Schema.ts
**Line**: 1219 (verify this!)

class String$ extends make<string>(AST.stringKeyword) {}
export { String$ as String }

## AST Structure
**Node Type**: StringKeyword
**Annotations**: identifier="string"

## Feasibility
- Class identity: PARTIAL (works but `any` can match)
- SchemaId: NO (primitives don't have schemaId)
- Encoded fallback: YES (string → "string")

## Recommendation
Use encoded type fallback: `[I] extends [string] ? "string" : ...`
Confidence: HIGH
```

---

## Metadata

### Refinement History

| Iteration | Issues Found | Fixes Applied |
|-----------|--------------|---------------|
| 0 | Initial draft | N/A |
| 1 | Line numbers unverified, missing forbidden patterns, incomplete imports | Added discovery commands, forbidden patterns section, complete import block |
