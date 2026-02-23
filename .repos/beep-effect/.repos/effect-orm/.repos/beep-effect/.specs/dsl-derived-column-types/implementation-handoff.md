# DSL Derived Column Types - Implementation Handoff

## Context

You are continuing work on the `beep-effect` monorepo. A previous research phase has been completed that analyzed Effect Schema AST structures to enable automatic column type derivation. Your task is to implement the `deriveColumnType` function and integrate it into the Field DSL.

## Research Summary

### Problem Statement

Currently, when a field is defined without an explicit `type` property, it defaults to `"string"`:

```typescript
// Current behavior - always defaults to "string"
const field = Field(S.Int)({});      // type: "string" (wrong!)
const field = Field(S.Boolean)({});  // type: "string" (wrong!)
```

The goal is to derive sensible defaults from the schema's AST:

```typescript
// Target behavior - derives from schema AST
const field = Field(S.Int)({});      // type: "integer" (derived!)
const field = Field(S.Boolean)({});  // type: "boolean" (derived!)
```

### Approved AST → ColumnType Mapping

| AST Type          | Condition                                | Derived ColumnType          | Notes                       |
|-------------------|------------------------------------------|-----------------------------|-----------------------------|
| `StringKeyword`   | —                                        | `"string"`                  | Direct TEXT mapping         |
| `NumberKeyword`   | —                                        | `"number"`                  | DOUBLE PRECISION for floats |
| `BooleanKeyword`  | —                                        | `"boolean"`                 | Direct BOOLEAN mapping      |
| `BigIntKeyword`   | —                                        | `"bigint"`                  | **NEW TYPE NEEDED**         |
| `Literal`         | `typeof literal === "string"`            | `"string"`                  | TEXT                        |
| `Literal`         | `typeof literal === "number"`            | `"integer"`                 | INTEGER                     |
| `Literal`         | `typeof literal === "boolean"`           | `"boolean"`                 | BOOLEAN                     |
| `Literal`         | `literal === null`                       | **ERROR**                   | Cannot be column type alone |
| `Enums`           | All string values                        | `"string"`                  | TEXT with CHECK             |
| `Enums`           | Numeric values                           | `"integer"`                 | INTEGER with CHECK          |
| `TemplateLiteral` | —                                        | `"string"`                  | TEXT                        |
| `TupleType`       | —                                        | `"json"`                    | JSONB                       |
| `TypeLiteral`     | —                                        | `"json"`                    | JSONB for objects           |
| `Union`           | All `Literal` members (string)           | `"string"`                  | Enum-like, attach metadata  |
| `Union`           | Nullable (`S.NullOr`)                    | Derive from non-null member | Pass through                |
| `Union`           | Heterogeneous                            | `"json"`                    | Fallback                    |
| `Refinement`      | `SchemaId === UUID`                      | `"uuid"`                    | PostgreSQL UUID             |
| `Refinement`      | `SchemaId === Int`                       | `"integer"`                 | INTEGER                     |
| `Refinement`      | Other                                    | Derive from `ast.from`      | Recurse                     |
| `Transformation`  | `identifier === "Date"/"DateFromString"` | `"datetime"`                | TIMESTAMP                   |
| `Transformation`  | `identifier === "DateTimeUtc"`           | `"datetime"`                | TIMESTAMPTZ                 |
| `Transformation`  | `identifier === "BigInt"`                | `"bigint"`                  | BIGINT                      |
| `Transformation`  | Other                                    | Derive from `ast.from`      | Use encoded side            |
| `Suspend`         | —                                        | Derive from `ast.f()`       | Resolve lazy type           |
| `Declaration`     | `identifier === "DateFromSelf"`          | `"datetime"`                | TIMESTAMP                   |
| `Declaration`     | Other                                    | `"json"`                    | Safe fallback               |
| `ObjectKeyword`   | —                                        | `"json"`                    | JSONB                       |
| `UnknownKeyword`  | —                                        | `"json"`                    | Safe fallback               |
| `AnyKeyword`      | —                                        | `"json"`                    | Safe fallback               |

### Invalid Schemas (Should Throw)

| Schema           | AST Type           | Error Message                                     |
|------------------|--------------------|---------------------------------------------------|
| `S.Never`        | `NeverKeyword`     | `"Never type cannot be used as column"`           |
| `S.Void`         | `VoidKeyword`      | `"Void type cannot be used as column"`            |
| `S.Undefined`    | `UndefinedKeyword` | `"Undefined type cannot be used as column alone"` |
| `S.Null` (alone) | `Literal(null)`    | `"Null literal cannot be column type alone"`      |
| `S.Symbol`       | `SymbolKeyword`    | `"Symbol type cannot be stored in SQL"`           |
| `S.UniqueSymbol` | `UniqueSymbol`     | `"Unique symbols cannot be stored in SQL"`        |

### Key Decisions

1. **Use ENCODED side (`ast.from`)** for column type derivation - this matches what gets stored in the database
2. **Add `"bigint"` to ColumnType literals** for proper BigInt support
3. **Hybrid enum approach**: Derive `"string"` for enum-like unions but attach `enumValues` metadata
4. **Branded types**: Unwrap to underlying type, ignore the brand
5. **Explicit type overrides**: Always honor explicit `config.column.type` over derived defaults
6. **Fallback**: Unrecognized AST types fallback to `"string"` (lenient approach)

---

## Implementation Tasks

### Task 1: Add "bigint" to ColumnType Literals

**File**: `packages/common/schema/src/integrations/sql/dsl/literals.ts`

Add `"bigint"` to the ColumnType schema:

```typescript
export class ColumnType extends BS.StringLiteralKit(
  "string",
  "number",
  "integer",
  "boolean",
  "datetime",
  "uuid",
  "json",
  "bigint"  // ADD THIS
).annotations(
  $I.annotations("ColumnType", {
    description: "One of the possible column types in a domain model schema.",
  })
) {}
```

### Task 2: Create deriveColumnType Function

**File**: `packages/common/schema/src/integrations/sql/dsl/derive-column-type.ts` (new file)

Create a function that derives ColumnType from Effect Schema AST. Use the existing `nullability.ts` as a reference pattern.

**Requirements**:
- Use `effect/Match` for exhaustive pattern matching (follow codebase conventions)
- Use WeakSet for circular reference detection (same pattern as `isNullable`)
- Check annotations for special schema IDs (UUID, Int, etc.)
- Handle all AST types from the mapping table above
- Throw clear errors for invalid schemas

**Key imports and patterns**:
```typescript
import * as AST from "effect/SchemaAST"
import * as Match from "effect/Match"
import * as O from "effect/Option"
import * as A from "effect/Array"
import * as F from "effect/Function"
import { ColumnType } from "./literals"

// Schema ID symbols to detect
const UUIDSchemaId = Symbol.for("effect/SchemaId/UUID")
const IntSchemaId = Symbol.for("effect/SchemaId/Int")
```

### Task 3: Integrate into Field.ts

**File**: `packages/common/schema/src/integrations/sql/dsl/Field.ts`

Update line 146 to use derived type instead of hardcoded `"string"`:

```typescript
// Current (line 146):
type: config?.column?.type ?? "string",

// New:
type: config?.column?.type ?? deriveColumnType(getSchemaAST(input)),
```

You'll need to:
1. Import the new `deriveColumnType` function
2. Extract the AST from the input (handle both Schema and VariantField cases)
3. Ensure explicit `type` config still overrides the derived default

### Task 4: Update Drizzle Adapter

**File**: `packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts`

Add support for the new `"bigint"` column type:

1. Add to `DrizzleBaseBuilderFor` type mapping (~line 43-59)
2. Add to runtime `columnBuilder` switch (~line 217-226):
   ```typescript
   case "bigint":
     return pg.bigint(name, { mode: "bigint" })
   ```

### Task 5: Update Type Compatibility

**File**: `packages/common/schema/src/integrations/sql/dsl/types.ts`

Update `ColumnTypeToTS` and `TSToColumnTypes` to include bigint:

```typescript
// In ColumnTypeToTS
T extends "bigint" ? bigint : ...

// In TSToColumnTypes
T extends bigint ? "bigint" : ...
```

### Task 6: Write Comprehensive Tests

**File**: `packages/common/schema/test/integrations/sql/dsl/derive-column-type.test.ts` (new file)

Test cases to cover:

```typescript
describe("deriveColumnType", () => {
  // Primitive keywords
  it("derives string for S.String", ...)
  it("derives number for S.Number", ...)
  it("derives integer for S.Int", ...)
  it("derives boolean for S.Boolean", ...)
  it("derives bigint for S.BigInt", ...)

  // Special refinements
  it("derives uuid for S.UUID", ...)
  it("derives integer for S.Int (not number)", ...)

  // Transformations
  it("derives datetime for S.Date", ...)
  it("derives datetime for S.DateFromString", ...)
  it("derives datetime for S.DateTimeUtc", ...)
  it("derives bigint for S.BigIntFromString", ...)

  // Structural types
  it("derives json for S.Struct", ...)
  it("derives json for S.Array", ...)
  it("derives json for S.Tuple", ...)

  // Unions
  it("derives from non-null member in S.NullOr", ...)
  it("derives string for string literal union", ...)
  it("derives json for heterogeneous union", ...)

  // Branded types
  it("unwraps branded types to underlying", ...)

  // Error cases
  it("throws for S.Never", ...)
  it("throws for S.Void", ...)
  it("throws for S.Undefined alone", ...)
  it("throws for S.Null alone", ...)
  it("throws for S.Symbol", ...)

  // Override behavior
  it("explicit type overrides derived", ...)

  // Edge cases
  it("handles circular schemas via S.suspend", ...)
  it("handles chained refinements", ...)
  it("handles nested transformations", ...)
})
```

### Task 7: Update Exports

**File**: `packages/common/schema/src/integrations/sql/dsl/index.ts`

Export the new function:
```typescript
export { deriveColumnType } from "./derive-column-type"
```

---

## Reference Files

Read these files to understand existing patterns:

1. **Nullability pattern (reference implementation)**:
   `packages/common/schema/src/integrations/sql/dsl/nullability.ts`

2. **Current Field implementation**:
   `packages/common/schema/src/integrations/sql/dsl/Field.ts`

3. **Type definitions**:
   `packages/common/schema/src/integrations/sql/dsl/types.ts`

4. **Current literals**:
   `packages/common/schema/src/integrations/sql/dsl/literals.ts`

5. **Drizzle adapter**:
   `packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts`

6. **Existing tests**:
   `packages/common/schema/test/integrations/sql/dsl/drizzle-typed-columns.test.ts`
   `packages/common/schema/test/integrations/sql/dsl/poc.test.ts`

7. **Research documents** (for detailed AST structures):
   `docs/research/effect-schema-ast-type-system.md`
   `docs/research/effect-schema-column-type-mapping.md`

---

## Codebase Conventions

Follow these conventions from CLAUDE.md:

1. **No native array methods** - Use `A.map`, `A.filter`, `A.some`, etc. from `effect/Array`
2. **No native string methods** - Use `Str.*` from `effect/String`
3. **No switch statements** - Use `effect/Match` for pattern matching
4. **No native Date** - Use `effect/DateTime` if needed
5. **Effect-first patterns** - Use `Effect.gen`, `Option`, `Either` appropriately
6. **Import conventions**:
   ```typescript
   import * as AST from "effect/SchemaAST"
   import * as Match from "effect/Match"
   import * as O from "effect/Option"
   import * as A from "effect/Array"
   import * as F from "effect/Function"
   import * as S from "effect/Schema"
   ```

---

## Verification Commands

After implementation, run:

```bash
# Run tests for the DSL package
bun test packages/common/schema/test/integrations/sql/dsl/

# Type check
bun run check

# Build
bun run build

# Lint
bun run lint:fix
```

---

## Success Criteria

1. Fields without explicit `type` derive sensible defaults from Schema AST
2. Explicit `type` in FieldConfig overrides derived defaults
3. Invalid schemas throw clear error messages
4. All existing tests pass
5. New comprehensive test suite for derived column types
6. Type-level inference works correctly (IDE shows correct types)
7. No regressions in Drizzle adapter column building
8. `"bigint"` ColumnType added and working end-to-end
