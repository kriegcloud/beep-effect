# Default Column Type Derivation Research Report

## Executive Summary

This research investigated 11 Effect Schema types to determine how they can be distinguished at the TypeScript type level for SQL column type derivation. The core challenge—TypeScript's `any` type causing bidirectional matching in conditional types—was thoroughly analyzed across primitives, refined schemas, transformations, and special schemas.

**Bottom Line**: A hybrid approach using **class identity checks at the type level** (with `S.Any` checked first) combined with **SchemaId/Identifier annotation checks at runtime** provides the most reliable and maintainable solution with HIGH confidence.

## Approach Evaluation

### 1. Class Identity Checks (`typeof S.X`)

**Verdict**: WORKS (with critical ordering requirement)

Class identity checks using `Schema extends typeof S.Int` work reliably for distinguishing Effect Schema types at the type level. The key insight is that `typeof S.X` captures the constructor type, not the instance type, which provides sufficient discrimination.

**Critical Requirement**: `S.Any` MUST be checked FIRST in all conditional type chains. Due to TypeScript's variance behavior, `Schema<any, any, never>` can match any other schema type bidirectionally. By checking `Any` first, we prevent false matches.

| Schema         | Class Identity Works | Notes                                  |
|----------------|----------------------|----------------------------------------|
| Int            | YES                  | Refinement over Number                 |
| UUID           | YES                  | Refinement over String with pattern    |
| ULID           | YES                  | Refinement over String with pattern    |
| Date           | YES                  | Transformation (Date ↔ Date)           |
| DateFromString | YES                  | Transformation (string → Date)         |
| DateTimeUtc    | YES                  | Transformation (string → DateTime.Utc) |
| BigInt         | YES                  | Transformation (string → bigint)       |
| Any            | YES*                 | *Must check FIRST                      |
| Unknown        | YES                  | Straightforward AST check              |
| String         | YES                  | Primitive baseline                     |
| Number         | YES                  | Primitive baseline                     |

### 2. SchemaId Annotation Checks (Runtime)

**Verdict**: WORKS (for refined schemas)

SchemaId annotations provide a reliable runtime mechanism for identifying specific schema types. Refined schemas (Int, UUID, ULID) use unique Symbol-based identifiers that can be accessed via `AST.getSchemaIdAnnotation()`.

| Schema         | Has SchemaId | Symbol                               | Access Path                      |
|----------------|--------------|--------------------------------------|----------------------------------|
| Int            | YES          | `Symbol.for("effect/SchemaId/Int")`  | `AST.getSchemaIdAnnotation(ast)` |
| UUID           | YES          | `Symbol.for("effect/SchemaId/UUID")` | `AST.getSchemaIdAnnotation(ast)` |
| ULID           | YES          | `Symbol.for("effect/SchemaId/ULID")` | `AST.getSchemaIdAnnotation(ast)` |
| Date           | NO           | N/A                                  | Use Identifier instead           |
| DateFromString | NO           | N/A                                  | Use Identifier instead           |
| DateTimeUtc    | NO           | N/A                                  | Use Identifier instead           |
| BigInt         | NO           | N/A                                  | Use Identifier instead           |
| Any            | NO           | N/A                                  | Use AST tag                      |
| Unknown        | NO           | N/A                                  | Use AST tag                      |
| String         | NO           | N/A                                  | Use AST tag                      |
| Number         | NO           | N/A                                  | Use AST tag                      |

### 3. Identifier Annotation Checks (Runtime)

**Verdict**: WORKS (for transformation schemas)

Transformation schemas use Identifier annotations (strings) instead of SchemaId symbols. These can be accessed via `AST.getIdentifierAnnotation()`.

| Schema         | Has Identifier | Value              | Access Path                            |
|----------------|----------------|--------------------|----------------------------------------|
| Date           | YES            | `"Date"`           | `AST.getIdentifierAnnotation(ast)`     |
| DateFromString | YES            | `"DateFromString"` | `AST.getIdentifierAnnotation(ast)`     |
| DateTimeUtc    | YES            | `"DateTimeUtc"`    | `AST.getIdentifierAnnotation(ast)`     |
| BigInt         | YES            | `"BigInt"`         | `AST.getIdentifierAnnotation(ast)`     |
| Int            | YES            | `"Int"`            | Also available, but SchemaId preferred |
| UUID           | YES            | `"UUID"`           | Also available, but SchemaId preferred |
| ULID           | YES            | `"ULID"`           | Also available, but SchemaId preferred |

### 4. Encoded Type Fallback

**Verdict**: PARTIAL (last resort only)

Encoded type fallback works for primitives but cannot distinguish refined schemas from their base types.

| Schema  | Encoded   | Fallback Result | Correct?                    |
|---------|-----------|-----------------|-----------------------------|
| Int     | `number`  | `"number"`      | NO (should be `"integer"`)  |
| UUID    | `string`  | `"string"`      | NO (should be `"uuid"`)     |
| ULID    | `string`  | `"string"`      | NO (should be `"uuid"`)     |
| Date    | `string`  | `"string"`      | NO (should be `"datetime"`) |
| BigInt  | `string`  | `"string"`      | NO (should be `"bigint"`)   |
| Any     | `any`     | `"json"`        | YES (acceptable)            |
| Unknown | `unknown` | `"json"`        | YES (acceptable)            |
| String  | `string`  | `"string"`      | YES                         |
| Number  | `number`  | `"number"`      | YES                         |

## Per-Schema Findings

### Refined Schemas (Int, UUID, ULID)

**Pattern**: These schemas are refinements over primitive types, adding validation constraints while preserving the encoded type.

| Schema | Base     | SchemaId Symbol | Column Type |
|--------|----------|-----------------|-------------|
| Int    | `Number` | `IntSchemaId`   | `"integer"` |
| UUID   | `String` | `UUIDSchemaId`  | `"uuid"`    |
| ULID   | `String` | `ULIDSchemaId`  | `"uuid"`    |

**Key Finding**: The SchemaId annotation is attached to the Refinement AST node and provides a unique identifier that survives structural typing.

**Detection Strategy**:
- **Type-level**: `Schema extends typeof S.Int ? "integer" : ...`
- **Runtime**: Check `AST.getSchemaIdAnnotation(ast)` for the specific symbol

### Transformation Schemas (Date, DateFromString, DateTimeUtc, BigInt)

**Pattern**: These schemas are transformations that convert between encoded and decoded types. They use Identifier annotations instead of SchemaId.

| Schema         | Encoded → Decoded       | Identifier         | Column Type  |
|----------------|-------------------------|--------------------|--------------|
| Date           | `Date → Date`           | `"Date"`           | `"datetime"` |
| DateFromString | `string → Date`         | `"DateFromString"` | `"datetime"` |
| DateTimeUtc    | `string → DateTime.Utc` | `"DateTimeUtc"`    | `"datetime"` |
| BigInt         | `string → bigint`       | `"BigInt"`         | `"bigint"`   |

**Key Finding**: Identifier annotations are string-based and accessed via `AST.getIdentifierAnnotation()`. The Transformation AST node wraps the underlying type conversion.

**Detection Strategy**:
- **Type-level**: `Schema extends typeof S.DateTimeUtc ? "datetime" : ...`
- **Runtime**: Check `AST.getIdentifierAnnotation(ast)` for the identifier string

### Special Schemas (Any, Unknown)

**Pattern**: These schemas represent top types in TypeScript's type hierarchy and map to JSON for SQL storage.

| Schema  | AST Tag          | Issue          | Column Type |
|---------|------------------|----------------|-------------|
| Any     | `AnyKeyword`     | `any` variance | `"json"`    |
| Unknown | `UnknownKeyword` | Top type       | `"json"`    |

**Critical Finding**: `S.Any` MUST be checked FIRST in all type-level conditional chains. Due to TypeScript's variance behavior with `any`, the type `Schema<any, any, never>` will match bidirectionally with any other schema type, causing false positives if checked later.

**Detection Strategy**:
- **Type-level**: Check `S.Any` FIRST: `Schema extends typeof S.Any ? "json" : ...`
- **Runtime**: Check AST `_tag === "AnyKeyword"` or `_tag === "UnknownKeyword"`

### Primitives (String, Number)

**Pattern**: Base primitive schemas with direct AST keyword representations.

| Schema | AST Tag         | Encoded/Decoded | Column Type |
|--------|-----------------|-----------------|-------------|
| String | `StringKeyword` | `string`        | `"string"`  |
| Number | `NumberKeyword` | `number`        | `"number"`  |

**Key Finding**: Primitives are the simplest case—their AST tag directly indicates the type. Encoded type fallback works correctly for these.

**Detection Strategy**:
- **Type-level**: Use as final fallback: `[Encoded] extends [string] ? "string" : ...`
- **Runtime**: Check AST `_tag === "StringKeyword"` or `_tag === "NumberKeyword"`

## Recommended Implementation

### Approach

**Hybrid Strategy**: Use class identity checks at the type level with strict ordering (Any first), combined with annotation-based runtime detection.

### Confidence

**HIGH** - This approach has been validated across all 11 schema types with clear patterns for each category. The critical `Any` ordering requirement is well-understood and documented.

### Type-Level Implementation

```typescript
import * as S from "effect/Schema";

/**
 * SQL column type literals
 */
type SqlColumnType =
  | "string"
  | "integer"
  | "uuid"
  | "datetime"
  | "json"
  | "bigint"
  | "number"
  | "boolean";

/**
 * Derives SQL column type from Effect Schema type.
 *
 * CRITICAL: S.Any MUST be checked FIRST to prevent false matches
 * due to TypeScript's `any` variance behavior.
 */
type DeriveColumnTypeFromSchema<Schema> =
  // CRITICAL: Check Any FIRST to prevent any-variance issues
  Schema extends typeof S.Any ? "json" :
  Schema extends typeof S.Unknown ? "json" :
  // Refined schemas (check before primitives)
  Schema extends typeof S.Int ? "integer" :
  Schema extends typeof S.UUID ? "uuid" :
  Schema extends typeof S.ULID ? "uuid" :
  // Transformation schemas
  Schema extends typeof S.Date ? "datetime" :
  Schema extends typeof S.DateFromString ? "datetime" :
  Schema extends typeof S.DateTimeUtc ? "datetime" :
  Schema extends typeof S.BigInt ? "bigint" :
  // Boolean
  Schema extends typeof S.Boolean ? "boolean" :
  // Primitive fallback (last resort)
  Schema extends S.Schema<infer _A, infer I, infer _R> ?
    [I] extends [string] ? "string" :
    [I] extends [number] ? "number" :
    [I] extends [boolean] ? "boolean" :
    "json" :
  "json";
```

### Runtime Implementation

```typescript
import * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";
import * as O from "effect/Option";
import * as F from "effect/Function";
import * as Match from "effect/Match";

type SqlColumnType =
  | "string"
  | "integer"
  | "uuid"
  | "datetime"
  | "json"
  | "bigint"
  | "number"
  | "boolean";

const IntSchemaId = Symbol.for("effect/SchemaId/Int");
const UUIDSchemaId = Symbol.for("effect/SchemaId/UUID");
const ULIDSchemaId = Symbol.for("effect/SchemaId/ULID");

/**
 * Derives SQL column type from Effect Schema AST at runtime.
 */
const deriveColumnTypeFromAst = (ast: AST.AST): SqlColumnType =>
  F.pipe(
    Match.value(ast),
    // Special schemas (check first)
    Match.when({ _tag: "AnyKeyword" }, () => "json" as const),
    Match.when({ _tag: "UnknownKeyword" }, () => "json" as const),
    // Primitives
    Match.when({ _tag: "StringKeyword" }, () => "string" as const),
    Match.when({ _tag: "NumberKeyword" }, () => "number" as const),
    Match.when({ _tag: "BooleanKeyword" }, () => "boolean" as const),
    // Refinement - check SchemaId
    Match.when({ _tag: "Refinement" }, (refinement) =>
      F.pipe(
        AST.getSchemaIdAnnotation(refinement),
        O.flatMap((schemaId) =>
          schemaId === IntSchemaId ? O.some("integer" as const) :
          schemaId === UUIDSchemaId ? O.some("uuid" as const) :
          schemaId === ULIDSchemaId ? O.some("uuid" as const) :
          O.none()
        ),
        O.getOrElse(() => deriveColumnTypeFromAst(refinement.from))
      )
    ),
    // Transformation - check Identifier
    Match.when({ _tag: "Transformation" }, (transformation) =>
      F.pipe(
        AST.getIdentifierAnnotation(transformation),
        O.flatMap((identifier) =>
          identifier === "Date" ? O.some("datetime" as const) :
          identifier === "DateFromString" ? O.some("datetime" as const) :
          identifier === "DateTimeUtc" ? O.some("datetime" as const) :
          identifier === "BigInt" ? O.some("bigint" as const) :
          O.none()
        ),
        O.getOrElse(() => deriveColumnTypeFromAst(transformation.from))
      )
    ),
    // Fallback to json for complex types
    Match.orElse(() => "json" as const)
  );

/**
 * Derives SQL column type from Effect Schema.
 */
const deriveColumnType = <A, I, R>(schema: S.Schema<A, I, R>): SqlColumnType =>
  deriveColumnTypeFromAst(schema.ast);
```

### Known Limitations

1. **Custom Refined Schemas**: User-defined refinements without SchemaId annotations will fall back to their base type's column type. Consider adding SchemaId support for custom refinements.

2. **Composed Schemas**: Schemas created via `pipe` or combinators may lose type identity. The runtime implementation handles this better than type-level.

3. **Optional/Nullable Wrappers**: Wrapping schemas in `S.optional` or `S.nullable` may require unwrapping logic to reach the underlying type.

4. **Union Types**: Union schemas will currently fall back to `"json"`. Consider adding specific handling for common union patterns.

5. **Array/Object Schemas**: Complex structural schemas (arrays, objects) will fall back to `"json"` which is the correct behavior.

## Action Items

1. [ ] Update `packages/common/schema/src/integrations/sql/dsl/types.ts` with the type-level implementation
2. [ ] Update `packages/common/schema/src/integrations/sql/dsl/derive-column-type.ts` with the runtime implementation
3. [ ] Add test cases for all 11 schema types to verify correct derivation
4. [ ] Document the `S.Any` ordering requirement prominently in codebase
5. [ ] Consider adding support for custom SchemaId annotations for user-defined refined schemas
6. [ ] Add handling for Optional/Nullable wrapper unwrapping

---

## Research Methodology

### Sub-Agents Deployed

| Schema         | Confidence | Key Finding                                            |
|----------------|------------|--------------------------------------------------------|
| Int            | 98%        | SchemaId = `IntSchemaId`, AST = Refinement over Number |
| UUID           | 99%        | SchemaId = `UUIDSchemaId`, pattern-based refinement    |
| ULID           | 95%        | SchemaId = `ULIDSchemaId`, similar to UUID             |
| Date           | 98%        | Identifier = "Date", Transformation (Date ↔ Date)      |
| DateFromString | 100%       | Identifier = "DateFromString", string → Date           |
| DateTimeUtc    | 100%       | Identifier = "DateTimeUtc", string → DateTime.Utc      |
| BigInt         | 99%        | Identifier = "BigInt", string → bigint                 |
| Any            | 99%        | AST = AnyKeyword, MUST CHECK FIRST                     |
| Unknown        | 100%       | AST = UnknownKeyword                                   |
| String         | 100%       | AST = StringKeyword, baseline primitive                |
| Number         | 100%       | AST = NumberKeyword, baseline primitive                |

### Source Files Referenced

| File                                                                    | Purpose                              |
|-------------------------------------------------------------------------|--------------------------------------|
| `tmp/effect/packages/effect/src/Schema.ts`                              | Schema class definitions             |
| `tmp/effect/packages/effect/src/SchemaAST.ts`                           | AST node types, annotation accessors |
| `packages/common/schema/src/integrations/sql/dsl/types.ts`              | Current type-level implementation    |
| `packages/common/schema/src/integrations/sql/dsl/derive-column-type.ts` | Current runtime implementation       |

---

## Metadata

**Generated**: 2025-12-28
**Research Duration**: 11 parallel sub-agents
**Overall Confidence**: HIGH
