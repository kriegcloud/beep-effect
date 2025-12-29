---
name: dsl-derived-column-types-implementation
version: 3
created: 2025-12-28T00:00:00Z
iterations: 2
status: FINAL
---

# DSL Derived Column Types - Implementation Prompt

## Context

You are implementing a feature for the `beep-effect` monorepo's SQL DSL system. The DSL wraps Effect Schemas with SQL column metadata for Drizzle ORM integration.

**Current State**: The Field factory defaults column `type` to `"string"` when not explicitly specified (see `Field.ts:146`). This is incorrect—`Field(S.Int)({})` produces `type: "string"` instead of `type: "integer"`.

**Target State**: Derive sensible column type defaults from the Effect Schema's AST structure, following the same pattern used for nullability derivation in `nullability.ts`.

**Package Location**: `packages/common/schema/src/integrations/sql/dsl/`

**Related Research**: Detailed AST analysis exists in:
- `docs/research/effect-schema-ast-type-system.md` (1190 lines)
- `docs/research/effect-schema-column-type-mapping.md`

## Objective

Implement a `deriveColumnType` function that analyzes Effect Schema AST to determine the appropriate SQL column type, then integrate it into the Field factory.

**Measurable Outcomes**:
1. `Field(S.String)({})` derives `type: "string"`
2. `Field(S.Int)({})` derives `type: "integer"` (not `"number"`)
3. `Field(S.UUID)({})` derives `type: "uuid"`
4. `Field(S.Boolean)({})` derives `type: "boolean"`
5. `Field(S.Date)({})` derives `type: "datetime"`
6. `Field(S.BigInt)({})` derives `type: "bigint"` (new ColumnType)
7. `Field(S.Struct({...}))({})` derives `type: "json"`
8. `Field(S.NullOr(S.Int))({})` derives `type: "integer"` (from non-null member)
9. Explicit `{ column: { type: "uuid" } }` overrides any derivation
10. Invalid schemas (`S.Never`, `S.Void`, `S.Symbol`) throw clear errors
11. All existing tests continue to pass
12. New test file covers all derivation cases

## Role

You are a senior Effect TypeScript developer with expertise in:
- Effect Schema AST analysis and pattern matching
- Drizzle ORM PostgreSQL column types
- Type-level programming in TypeScript
- The beep-effect codebase conventions

You write Effect-idiomatic code using `Match`, `Option`, `Array` utilities. You never use native JavaScript methods for arrays, strings, or objects.

## Constraints

### MUST Follow (from AGENTS.md)

1. **Effect-Only Collections**: Use `A.map`, `A.filter`, `A.some`, `A.every` from `effect/Array`. NEVER use native `.map()`, `.filter()`, etc.

2. **Effect-Only Strings**: Use `Str.*` from `effect/String`. NEVER use native `.split()`, `.includes()`, etc.

3. **No Switch Statements**: Use `effect/Match` for pattern matching. Use `Match.value(x).pipe(Match.tag(...), Match.exhaustive)` pattern. **Note**: The existing `nullability.ts` uses switch statements (legacy code), but per AGENTS.md requirements, your new implementation MUST use `effect/Match` instead.

4. **No Native Date**: Use `effect/DateTime` if date operations are needed.

5. **Import Conventions**:
   ```typescript
   import * as AST from "effect/SchemaAST"
   import * as Match from "effect/Match"
   import * as O from "effect/Option"
   import * as A from "effect/Array"
   import * as F from "effect/Function"
   import * as S from "effect/Schema"
   import * as P from "effect/Predicate"
   ```

6. **Namespace Imports Only**: Never destructure Effect modules. Always use namespace prefix (`A.map`, not `map`).

7. **Error Handling for Invalid Schemas**: Since `deriveColumnType` is a synchronous function called during Field construction (not inside an Effect pipeline), use plain `throw new Error("message")` for invalid schemas. This follows the pattern of immediate validation errors. The function signature returns `ColumnType.Type` directly, not wrapped in Effect.

### Architecture Constraints

1. **Derive from ENCODED side**: Use `ast.from` for Transformations (what gets stored in DB)
2. **Unwrap Refinements recursively**: `S.Int` is a Refinement, check SchemaId first, then recurse into `ast.from`
3. **Resolve Suspend lazily**: Call `ast.f()` to get the actual AST, use WeakSet for circular detection
4. **Honor explicit config**: `config?.column?.type` always overrides derived type
5. **Follow nullability.ts pattern**: Same recursive structure, WeakSet usage, side parameter

### Complete AST → ColumnType Mapping Table

This is the authoritative reference for all AST type derivations:

| AST `_tag` | Condition | Derived ColumnType | Notes |
|------------|-----------|-------------------|-------|
| `StringKeyword` | — | `"string"` | Direct TEXT mapping |
| `NumberKeyword` | — | `"number"` | DOUBLE PRECISION for floats |
| `BooleanKeyword` | — | `"boolean"` | Direct BOOLEAN mapping |
| `BigIntKeyword` | — | `"bigint"` | **NEW TYPE** |
| `Literal` | `typeof literal === "string"` | `"string"` | TEXT |
| `Literal` | `typeof literal === "number"` | `"integer"` | INTEGER for numeric literals |
| `Literal` | `typeof literal === "boolean"` | `"boolean"` | BOOLEAN |
| `Literal` | `literal === null` | **THROW** | "Null literal cannot be column type alone" |
| `Enums` | All string values | `"string"` | TEXT with CHECK |
| `Enums` | Numeric values | `"integer"` | INTEGER with CHECK |
| `TemplateLiteral` | — | `"string"` | TEXT (e.g., `S.TemplateLiteral(S.Literal("prefix"), S.String)`) |
| `TupleType` | — | `"json"` | JSONB for arrays |
| `TypeLiteral` | — | `"json"` | JSONB for objects |
| `Union` | All `Literal` members (string) | `"string"` | Enum-like string union |
| `Union` | Contains `Literal(null)` | Derive from non-null member | S.NullOr handling |
| `Union` | Heterogeneous types | `"json"` | Fallback to JSONB |
| `Refinement` | `SchemaId === UUID` | `"uuid"` | Check `AST.getSchemaIdAnnotation` |
| `Refinement` | `SchemaId === Int` | `"integer"` | INTEGER for S.Int |
| `Refinement` | Other | Recurse into `ast.from` | Unwrap and derive |
| `Transformation` | `identifier === "Date"/"DateFromString"` | `"datetime"` | TIMESTAMP |
| `Transformation` | `identifier === "DateTimeUtc"` | `"datetime"` | TIMESTAMPTZ |
| `Transformation` | `identifier === "BigInt"/"BigIntFromString"` | `"bigint"` | BIGINT |
| `Transformation` | Other | Recurse into `ast.from` | Use encoded side |
| `Suspend` | — | Call `ast.f()` and recurse | Resolve lazy type |
| `Declaration` | `identifier === "DateFromSelf"` | `"datetime"` | TIMESTAMP |
| `Declaration` | `identifier === "BigIntFromSelf"` | `"bigint"` | BIGINT |
| `Declaration` | Other | `"json"` | Safe fallback |
| `ObjectKeyword` | — | `"json"` | JSONB |
| `UnknownKeyword` | — | `"json"` | Safe fallback |
| `AnyKeyword` | — | `"json"` | Safe fallback |

**Invalid Schemas (THROW ERROR)**:

| AST `_tag` | Error Message |
|------------|---------------|
| `NeverKeyword` | "Never type cannot be used as column" |
| `VoidKeyword` | "Void type cannot be used as column" |
| `UndefinedKeyword` | "Undefined type cannot be used as column alone" |
| `SymbolKeyword` | "Symbol type cannot be stored in SQL" |
| `UniqueSymbol` | "Unique symbols cannot be stored in SQL" |

### Forbidden Patterns

```typescript
// ❌ NEVER
items.map(x => x.name)           // Native array method
str.split(",")                   // Native string method
switch (ast._tag) { ... }        // Switch statement
new Date()                       // Native Date
import { map } from "effect/Array"  // Destructured import

// ✅ ALWAYS
F.pipe(items, A.map(x => x.name))
F.pipe(str, Str.split(","))
Match.value(ast).pipe(Match.tag(...), Match.exhaustive)
DateTime.unsafeNow()
import * as A from "effect/Array"
```

## Resources

### Files to Read First (in order)

1. **Reference Pattern** - `packages/common/schema/src/integrations/sql/dsl/nullability.ts`
   - Shows exact pattern for AST analysis with WeakSet, recursion, Match usage

2. **Integration Point** - `packages/common/schema/src/integrations/sql/dsl/Field.ts`
   - Line 146: `type: config?.column?.type ?? "string"` is what you're replacing
   - Understand how to extract AST from Schema vs VariantField inputs

3. **Type Definitions** - `packages/common/schema/src/integrations/sql/dsl/types.ts`
   - `ColumnTypeToTS` and `TSToColumnTypes` need bigint support
   - Understand `DSLField`, `DSLVariantField`, `ColumnDef`

4. **Literals** - `packages/common/schema/src/integrations/sql/dsl/literals.ts`
   - Add `"bigint"` to ColumnType StringLiteralKit

5. **Drizzle Adapter** - `packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts`
   - `DrizzleBaseBuilderFor` type needs bigint case
   - `columnBuilder` function needs bigint runtime case

6. **Existing Tests** - `packages/common/schema/test/integrations/sql/dsl/drizzle-typed-columns.test.ts`
   - Understand test patterns and assertions used

### AST Detection Patterns

**UUID Detection**:
```typescript
const UUIDSchemaId = Symbol.for("effect/SchemaId/UUID")
// Check: AST.getSchemaIdAnnotation(ast) returns Option containing this symbol
```

**Int Detection**:
```typescript
const IntSchemaId = Symbol.for("effect/SchemaId/Int")
// Check: AST.getSchemaIdAnnotation(ast) for Refinement nodes
```

**Date/DateTime Detection**:
```typescript
// Check AST.getIdentifierAnnotation(ast) for:
// "Date", "DateFromString", "DateFromSelf", "DateTimeUtc", "DateTimeUtcFromSelf"
```

**BigInt Detection** (two distinct cases):
```typescript
// Case 1: S.BigIntFromSelf - AST is BigIntKeyword directly
// ast._tag === "BigIntKeyword"
// This is the "from self" case - bigint in, bigint out

// Case 2: S.BigInt (or S.BigIntFromString) - AST is Transformation
// ast._tag === "Transformation"
// AST.getIdentifierAnnotation returns O.some("BigInt") or O.some("BigIntFromString")
// The encoded side (ast.from) is StringKeyword
// You want to detect the identifier, NOT recurse to encoded side for this case
```

## Output Specification

### Deliverable 1: `derive-column-type.ts` (New File)

**Location**: `packages/common/schema/src/integrations/sql/dsl/derive-column-type.ts`

```typescript
import * as AST from "effect/SchemaAST"
import * as Match from "effect/Match"
import * as O from "effect/Option"
import * as A from "effect/Array"
import * as F from "effect/Function"
import * as P from "effect/Predicate"
import type { ColumnType } from "./literals"

/**
 * Derives the SQL column type from an Effect Schema AST.
 * Analyzes the encoded side of transformations (what gets stored in DB).
 *
 * @param ast - The AST node to analyze
 * @param visited - WeakSet for circular reference detection
 * @returns The derived ColumnType literal
 * @throws Error for invalid schema types (Never, Void, Symbol, etc.)
 *
 * @example
 * ```ts
 * deriveColumnType(S.String.ast)     // "string"
 * deriveColumnType(S.Int.ast)        // "integer"
 * deriveColumnType(S.UUID.ast)       // "uuid"
 * deriveColumnType(S.Boolean.ast)    // "boolean"
 * deriveColumnType(S.Date.ast)       // "datetime"
 * deriveColumnType(S.BigInt.ast)     // "bigint"
 * deriveColumnType(S.Struct({}).ast) // "json"
 * ```
 */
export const deriveColumnType = (
  ast: AST.AST,
  visited: WeakSet<AST.AST> = new WeakSet()
): ColumnType.Type => {
  // Implementation using Match.value pattern
  // Follow nullability.ts structure
}

/**
 * Convenience wrapper for Schema inputs.
 */
export const deriveSchemaColumnType = (
  schema: { readonly ast: AST.AST }
): ColumnType.Type => deriveColumnType(schema.ast)
```

### Deliverable 2: Updated `literals.ts`

Add `"bigint"` to ColumnType:

```typescript
export class ColumnType extends BS.StringLiteralKit(
  "string",
  "number",
  "integer",
  "boolean",
  "datetime",
  "uuid",
  "json",
  "bigint"  // ADD
).annotations(...)
```

### Deliverable 3: Updated `Field.ts`

```typescript
import { deriveColumnType } from "./derive-column-type"

// In the Field implementation, replace line 146:
// FROM: type: config?.column?.type ?? "string",
// TO:   type: config?.column?.type ?? deriveColumnType(extractAST(input)),

// Add helper to extract AST from various input types:
const extractAST = (input: S.Schema.All | VariantSchema.Field<any>): AST.AST => {
  if (isAnyVariantField(input)) {
    // Extract from the "select" variant's schema
    return input.schemas.select.ast
  }
  return input.ast
}
```

### Deliverable 4: Updated `types.ts`

Add bigint to type mappings:

```typescript
// In ColumnTypeToTS
T extends "bigint" ? bigint : ...

// In TSToColumnTypes
T extends bigint ? "bigint" : ...
```

### Deliverable 5: Updated `adapters/drizzle.ts`

```typescript
// In DrizzleBaseBuilderFor type (around line 50):
: T extends "bigint" ? PgBigInt53BuilderInitial<Name>

// In Match.discriminatorsExhaustive pattern (around line 218):
// Add to the existing discriminators object:
bigint: thunk(pg.bigint(name, { mode: "bigint" }))
```

### Deliverable 6: `derive-column-type.test.ts` (New File)

**Location**: `packages/common/schema/test/integrations/sql/dsl/derive-column-type.test.ts`

```typescript
import { describe, it, expect } from "vitest"
import * as S from "effect/Schema"
import { deriveColumnType, deriveSchemaColumnType } from "@beep/schema/integrations/sql/dsl"

describe("deriveColumnType", () => {
  describe("primitive keywords", () => {
    it("derives 'string' for S.String", () => {
      expect(deriveSchemaColumnType(S.String)).toBe("string")
    })
    it("derives 'number' for S.Number", () => {
      expect(deriveSchemaColumnType(S.Number)).toBe("number")
    })
    it("derives 'boolean' for S.Boolean", () => {
      expect(deriveSchemaColumnType(S.Boolean)).toBe("boolean")
    })
    it("derives 'bigint' for S.BigIntFromSelf", () => {
      expect(deriveSchemaColumnType(S.BigIntFromSelf)).toBe("bigint")
    })
  })

  describe("refinements with SchemaId", () => {
    it("derives 'integer' for S.Int", () => {
      expect(deriveSchemaColumnType(S.Int)).toBe("integer")
    })
    it("derives 'uuid' for S.UUID", () => {
      expect(deriveSchemaColumnType(S.UUID)).toBe("uuid")
    })
  })

  describe("transformations", () => {
    it("derives 'datetime' for S.Date", () => {
      expect(deriveSchemaColumnType(S.Date)).toBe("datetime")
    })
    it("derives 'datetime' for S.DateFromString", () => {
      expect(deriveSchemaColumnType(S.DateFromString)).toBe("datetime")
    })
    it("derives 'bigint' for S.BigInt", () => {
      expect(deriveSchemaColumnType(S.BigInt)).toBe("bigint")
    })
  })

  describe("structural types", () => {
    it("derives 'json' for S.Struct", () => {
      expect(deriveSchemaColumnType(S.Struct({ a: S.String }))).toBe("json")
    })
    it("derives 'json' for S.Array", () => {
      expect(deriveSchemaColumnType(S.Array(S.String))).toBe("json")
    })
  })

  describe("unions", () => {
    it("derives from non-null member in S.NullOr", () => {
      expect(deriveSchemaColumnType(S.NullOr(S.Int))).toBe("integer")
    })
    it("derives 'string' for string literal union", () => {
      expect(deriveSchemaColumnType(S.Literal("a", "b", "c"))).toBe("string")
    })
  })

  describe("branded types", () => {
    it("unwraps to underlying type", () => {
      const UserId = S.String.pipe(S.brand("UserId"))
      expect(deriveSchemaColumnType(UserId)).toBe("string")
    })
  })

  describe("error cases", () => {
    it("throws for S.Never", () => {
      expect(() => deriveSchemaColumnType(S.Never)).toThrow("Never type cannot be used as column")
    })
    it("throws for S.Void", () => {
      expect(() => deriveSchemaColumnType(S.Void)).toThrow("Void type cannot be used as column")
    })
    it("throws for S.Symbol", () => {
      expect(() => deriveSchemaColumnType(S.SymbolFromSelf)).toThrow("Symbol type cannot be stored in SQL")
    })
  })

  describe("edge cases", () => {
    it("handles chained refinements", () => {
      const PositiveInt = S.Int.pipe(S.positive())
      expect(deriveSchemaColumnType(PositiveInt)).toBe("integer")
    })

    it("handles circular schemas via S.suspend", () => {
      interface Node { value: string; next: Node | null }
      const Node: S.Schema<Node> = S.Struct({
        value: S.String,
        next: S.NullOr(S.suspend(() => Node))
      })
      // Struct always derives to "json"
      expect(deriveSchemaColumnType(Node)).toBe("json")
    })

    it("handles TemplateLiteral", () => {
      const Prefixed = S.TemplateLiteral(S.Literal("prefix_"), S.String)
      expect(deriveSchemaColumnType(Prefixed)).toBe("string")
    })

    it("handles heterogeneous unions as json", () => {
      const Mixed = S.Union(S.String, S.Number)
      expect(deriveSchemaColumnType(Mixed)).toBe("json")
    })
  })
})
```

### Deliverable 7: Updated `index.ts`

```typescript
export { deriveColumnType, deriveSchemaColumnType } from "./derive-column-type"
```

## Examples

### Example 1: Primitive Keyword Matching

```typescript
// Input AST structure for S.String:
{ _tag: "StringKeyword", annotations: {...} }

// Match pattern:
Match.value(ast).pipe(
  Match.tag("StringKeyword", () => "string" as const),
  // ...
)
```

### Example 2: Refinement with SchemaId

```typescript
// Input AST structure for S.UUID:
{
  _tag: "Refinement",
  from: { _tag: "StringKeyword" },
  annotations: { [SchemaIdAnnotationId]: Symbol.for("effect/SchemaId/UUID") }
}

// Detection pattern:
Match.tag("Refinement", (ast) => {
  const schemaId = AST.getSchemaIdAnnotation(ast)
  return F.pipe(
    schemaId,
    O.match({
      onNone: () => deriveColumnType(ast.from, visited),  // Recurse
      onSome: (id) => {
        if (id === UUIDSchemaId) return "uuid" as const
        if (id === IntSchemaId) return "integer" as const
        return deriveColumnType(ast.from, visited)
      }
    })
  )
})
```

### Example 3: Nullable Union Handling

```typescript
// Input AST structure for S.NullOr(S.Int):
{
  _tag: "Union",
  types: [
    { _tag: "Refinement", from: { _tag: "NumberKeyword" }, annotations: {IntSchemaId} },
    { _tag: "Literal", literal: null }
  ]
}

// Detection pattern:
Match.tag("Union", (ast) => {
  // Find non-null member
  const nonNullMember = F.pipe(
    ast.types,
    A.findFirst((t) => !(AST.isLiteral(t) && t.literal === null))
  )
  return F.pipe(
    nonNullMember,
    O.match({
      onNone: () => { throw new Error("Union contains only null") },
      onSome: (member) => deriveColumnType(member, visited)
    })
  )
})
```

## Verification Checklist

### Implementation Completeness
- [ ] `deriveColumnType` function created in new file
- [ ] All 18+ AST types handled (see mapping table in research)
- [ ] WeakSet used for circular reference detection
- [ ] `Match.value` with `Match.tag` used (no switch statements)
- [ ] Effect Array/Option/Function utilities used (no native methods)

### ColumnType Additions
- [ ] `"bigint"` added to `literals.ts` ColumnType
- [ ] `bigint` case added to `types.ts` ColumnTypeToTS
- [ ] `bigint` case added to `types.ts` TSToColumnTypes
- [ ] `bigint` case added to `drizzle.ts` DrizzleBaseBuilderFor
- [ ] `bigint` case added to `drizzle.ts` columnBuilder

### Field.ts Integration
- [ ] `deriveColumnType` imported
- [ ] AST extraction helper handles Schema and VariantField
- [ ] Line 146 updated to use derived type with explicit override
- [ ] Explicit `type` config still takes precedence

### Test Coverage
- [ ] All primitive keywords tested
- [ ] UUID, Int refinements tested
- [ ] Date, BigInt transformations tested
- [ ] Struct, Array structural types tested
- [ ] NullOr union tested
- [ ] Branded types tested
- [ ] Error cases tested (Never, Void, Symbol)
- [ ] Edge cases tested (chained refinements, nested transformations)

### Verification Commands
```bash
bun test packages/common/schema/test/integrations/sql/dsl/
bun run check
bun run build
bun run lint:fix
```

---

## Metadata

### Research Sources
- Files Explored:
  - `packages/common/schema/src/integrations/sql/dsl/nullability.ts` (reference pattern)
  - `packages/common/schema/src/integrations/sql/dsl/Field.ts` (integration point)
  - `packages/common/schema/src/integrations/sql/dsl/types.ts` (type definitions)
  - `packages/common/schema/src/integrations/sql/dsl/literals.ts` (ColumnType enum)
  - `packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts` (Drizzle mapping)
  - `packages/common/schema/AGENTS.md` (package guidelines)
- Documentation:
  - Effect Match module documentation
  - Effect SchemaAST annotation access patterns
  - `docs/research/effect-schema-ast-type-system.md`
  - `docs/research/effect-schema-column-type-mapping.md`
- Packages:
  - `@beep/schema` AGENTS.md consulted

### Refinement History
| Iteration | Issues Found | Fixes Applied |
|-----------|--------------|---------------|
| 0         | Initial      | N/A           |
| 1         | HIGH: Conflicting pattern reference (nullability.ts uses switch vs Match requirement); MEDIUM: Missing error handling strategy; MEDIUM: Incomplete AST type coverage; LOW: Missing TemplateLiteral/circular/heterogeneous tests | Clarified nullability.ts is legacy; added error handling guidance; added complete AST mapping table inline; added BigInt distinction; added circular schema, TemplateLiteral, and heterogeneous union tests |
| 2         | LOW: drizzle.ts example showed switch-style but actual code uses Match | Fixed drizzle.ts example to show Match.discriminatorsExhaustive pattern. **PASS - Ready for finalization** |
