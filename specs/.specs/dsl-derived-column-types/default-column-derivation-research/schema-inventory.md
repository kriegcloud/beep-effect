# Schema Inventory for Column Type Derivation Research

This document catalogs all Effect Schema types that require investigation for type-level column type derivation.

## Problem Statement

The current type-level derivation (`DeriveColumnTypeFromSchema<Schema>`) uses `typeof S.Int`, `typeof S.UUID`, etc. to check schema class identity. However, TypeScript's handling of `any` causes `typeof S.Any` to match too broadly, making all schemas derive as `"json"`.

## Schemas Requiring Investigation

### Category 1: Primitive Schemas (Baseline - Should Work)

These use `DeriveColumnTypeFromEncoded<I>` fallback and should work correctly:

| Schema | Encoded Type | Expected Column Type | Status |
|--------|--------------|---------------------|--------|
| `S.String` | `string` | `"string"` | Verify |
| `S.Number` | `number` | `"number"` | Verify |
| `S.Boolean` | `boolean` | `"boolean"` | Verify |
| `S.BigIntFromSelf` | `bigint` | `"bigint"` | Verify |

### Category 2: Refined Schemas (Class Identity Required)

These share the same encoded type as their base but need different column types:

| Schema | Encoded Type | Expected Column Type | Base Schema | Issue |
|--------|--------------|---------------------|-------------|-------|
| `S.Int` | `number` | `"integer"` | `S.Number` | Distinguishable from `S.Number`? |
| `S.UUID` | `string` | `"uuid"` | `S.String` | Distinguishable from `S.String`? |
| `S.ULID` | `string` | `"uuid"` | `S.String` | Distinguishable from `S.String`? |
| `S.Positive` | `number` | `"number"` | `S.Number` | Should stay as `"number"` |
| `S.Negative` | `number` | `"number"` | `S.Number` | Should stay as `"number"` |
| `S.Finite` | `number` | `"number"` | `S.Number` | Should stay as `"number"` |

### Category 3: Transformation Schemas (Class Identity Required)

These transform between different encoded and decoded types:

| Schema | Encoded Type | Decoded Type | Expected Column Type | Issue |
|--------|--------------|--------------|---------------------|-------|
| `S.Date` | `string` | `Date` | `"datetime"` | Can identify via class? |
| `S.DateFromString` | `string` | `Date` | `"datetime"` | Can identify via class? |
| `S.DateFromNumber` | `number` | `Date` | `"number"` | Different encoded type |
| `S.DateTimeUtc` | `string` | `DateTime.Utc` | `"datetime"` | Can identify via class? |
| `S.DateTimeUtcFromSelf` | `DateTime.Utc` | `DateTime.Utc` | `"datetime"` | Special case |
| `S.BigInt` | `string` | `bigint` | `"bigint"` | Can identify via class? |
| `S.BigIntFromNumber` | `number` | `bigint` | `"number"` | Different encoded type |

### Category 4: Structural Schemas (Should Work)

These encode to object/array and should derive `"json"`:

| Schema | Encoded Type | Expected Column Type | Status |
|--------|--------------|---------------------|--------|
| `S.Struct({...})` | `object` | `"json"` | Verify |
| `S.Array(...)` | `unknown[]` | `"json"` | Verify |
| `S.Record({...})` | `object` | `"json"` | Verify |
| `S.Tuple(...)` | `unknown[]` | `"json"` | Verify |

### Category 5: Special Schemas (Problematic)

These are the problematic schemas that may cause `any`/`unknown` to match incorrectly:

| Schema | Encoded Type | Expected Column Type | Issue |
|--------|--------------|---------------------|-------|
| `S.Any` | `any` | `"json"` | `typeof S.Any` matches everything |
| `S.Unknown` | `unknown` | `"json"` | `typeof S.Unknown` matches too broadly |
| `S.Object` | `object` | `"json"` | May match structural schemas |

### Category 6: Union Schemas (Complex Unwrapping Required)

These require unwrapping to derive the inner type:

| Schema | Inner Schema | Expected Column Type | Issue |
|--------|--------------|---------------------|-------|
| `S.NullOr(S.String)` | `S.String` | `"string"` | UnwrapNullable works? |
| `S.NullOr(S.Int)` | `S.Int` | `"integer"` | After unwrap, class identity? |
| `S.NullOr(S.UUID)` | `S.UUID` | `"uuid"` | After unwrap, class identity? |
| `S.NullOr(S.Date)` | `S.Date` | `"datetime"` | After unwrap, class identity? |
| `S.Literal("a", "b")` | N/A | `"string"` | Literal string union |
| `S.Literal(1, 2, 3)` | N/A | `"integer"` | Literal number union |
| `S.Union(S.String, S.Number)` | N/A | `"json"` | Heterogeneous union |

### Category 7: VariantSchema Fields

These come from `@effect/sql/Model` and wrap inner schemas:

| VariantField | Inner Schema | Expected Column Type | Issue |
|--------------|--------------|---------------------|-------|
| `M.Generated(S.Int)` | `S.Int` | `"integer"` | Extract "select" variant, then class identity |
| `M.Generated(S.UUID)` | `S.UUID` | `"uuid"` | Extract "select" variant |
| `M.Generated(S.Date)` | `S.Date` | `"datetime"` | Extract "select" variant |
| `M.FieldOption(S.Int)` | `S.Int` | `"integer"` | Has `OptionFromNullOr` wrapper |
| `M.FieldOption(S.UUID)` | `S.UUID` | `"uuid"` | Has `OptionFromNullOr` wrapper |
| `M.Sensitive(S.Int)` | `S.Int` | `"integer"` | Similar to Generated |
| `M.GeneratedByApp(S.UUID)` | `S.UUID` | `"uuid"` | Similar to Generated |

### Category 8: Chained Refinements

These have multiple refinements stacked:

| Schema | Base | Expected Column Type | Issue |
|--------|------|---------------------|-------|
| `S.Int.pipe(S.positive())` | `S.Int` | `"integer"` | Multiple filter layers |
| `S.Int.pipe(S.between(0, 100))` | `S.Int` | `"integer"` | Multiple filter layers |
| `S.Int.pipe(S.brand("PostId"))` | `S.Int` | `"integer"` | Brand wraps filter |
| `S.UUID.pipe(S.brand("UUIDId"))` | `S.UUID` | `"uuid"` | Brand wraps filter |
| `S.String.pipe(S.maxLength(100))` | `S.String` | `"string"` | Simple refinement |

## Key Questions for Research

1. **Can we distinguish `S.Int` from `S.Number` at the type level?**
   - Both have `number` as encoded type
   - `S.Int` is defined as `Number$.pipe(int({ identifier: "Int" }))`
   - What properties differentiate them?

2. **How does `typeof S.Any` behave in conditional types?**
   - `S.Any` is `Schema<any, any, never>`
   - Why does `SomeSchema extends typeof S.Any` match everything?

3. **What AST properties can be used for runtime derivation?**
   - `schemaId` annotations (e.g., `IntSchemaId`, `UUIDSchemaId`)
   - `identifier` annotations
   - AST node types (`Refinement`, `Transformation`, etc.)

4. **How do we properly unwrap chained refinements at the type level?**
   - `S.filter<Inner>` and `S.refine<A, From>` types
   - Need to recurse through the chain

5. **How do we handle VariantSchema extraction at the type level?**
   - Extract "select" variant's schema
   - Then apply schema-level derivation

## Files for Reference

- Effect Schema source: `tmp/effect/packages/effect/src/Schema.ts`
- Effect SchemaAST source: `tmp/effect/packages/effect/src/SchemaAST.ts`
- Current types implementation: `packages/common/schema/src/integrations/sql/dsl/types.ts`
- Test file: `packages/common/schema/test/integrations/sql/dsl/derive-column-type.test.ts`
- Comprehensive test file: `packages/common/schema/test/integrations/sql/dsl/field-model-comprehensive.test.ts`
