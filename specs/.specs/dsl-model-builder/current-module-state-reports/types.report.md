# Types Module Analysis Report

**Date**: 2025-12-30
**Module**: `packages/common/schema/src/integrations/sql/dsl/types.ts`
**Purpose**: Type system architecture for ModelFactory implementation

---

## Executive Summary

The types module defines a comprehensive type system for the DSL, including column type derivation, field metadata structures, and variant schema extraction. Understanding this system is essential for implementing ModelFactory with proper type safety.

---

## 1. Column Type System

### Supported Column Types

8 column types via `ColumnType.Type`:
- **Primitive**: `"string"`, `"number"`, `"integer"`, `"boolean"`, `"bigint"`
- **Specialized**: `"uuid"`, `"datetime"`
- **Complex**: `"json"`

### Field Metadata Symbols

```typescript
ColumnMetaSymbol  // Symbol.for("...column-meta")
VariantFieldSymbol // Symbol.for("...variant-field")
ForeignKeySymbol  // Symbol.for("...foreign-key")
```

---

## 2. DSL Field Types

### DSLField<A, I, R, C>

Wraps plain Effect Schemas with column metadata:
- `A`: Type (what you work with in TypeScript)
- `I`: Encoded type (what gets stored in database)
- `R`: Context (Effect requirements)
- `C`: ColumnDef type parameter

### DSLVariantField<Config, C>

Wraps VariantSchema.Field with column metadata:
- Carries both column configuration AND variant config
- Enables multi-variant models

---

## 3. Type-Level Column Type Derivation

### Three-Tiered Inference

**Tier 1: Schema Class Identity Detection**
- `S.Int` -> `"integer"` (NOT generic `"number"`)
- `S.UUID` -> `"uuid"` (NOT generic `"string"`)
- `S.Date` -> `"datetime"`

**Tier 2: Encoded Type Fallback**
- `any`/`unknown` -> `"json"`
- `Date` -> `"datetime"`
- `readonly unknown[]` -> `"json"`
- Primitives: `string`, `number`, `boolean`, `bigint`

**Tier 3: Type Parameter Derivation**
- Final fallback using the schema's type parameter

### Nullable Type Handling

**StripNullable<T>**: Removes `null | undefined` wrappers for lenient compatibility checks.

---

## 4. Column Definition Schema Architecture

### Arity Pattern

**Base Factory** (for types WITHOUT autoIncrement):
- String, Number, Boolean, Datetime, UUID, JSON
- Properties: `type`, `primaryKey`, `unique`

**AutoIncrement Factory** (for types WITH autoIncrement):
- Integer, Bigint
- Properties: `type`, `primaryKey`, `unique`, `autoIncrement`

### ExactColumnDef<C>

Extracts exact types from partial configs:
```typescript
type ExactColumnDef<C extends Partial<ColumnDef>> = {
  readonly type: C extends { type: infer T } ? T : ColumnType.Type;
  readonly primaryKey: C extends { primaryKey: infer PK } ? PK : false;
  // ...
};
```

---

## 5. Variant Field Extraction

### ModelVariant.Type

6 variants:
- `"select"`: All fields (database row representation)
- `"insert"`: Excludes Generated fields
- `"update"`: All fields
- `"json"`: Excludes Sensitive fields
- `"jsonCreate"`: Excludes Generated/GeneratedByApp/Sensitive
- `"jsonUpdate"`: Excludes Generated/GeneratedByApp/Sensitive

### ExtractVariantFields<V, Fields>

Filters fields based on variant membership using `ShouldIncludeField`:
- DSLVariantField: Include if V is in Config keys
- Plain field: Include in ALL variants

---

## 6. ModelClassWithVariants Interface

```typescript
interface ModelClassWithVariants<Self, Fields, TName, Columns, PK, Id> {
  readonly select: S.Struct<ExtractVariantFields<"select", Fields>>;
  readonly insert: S.Struct<ExtractVariantFields<"insert", Fields>>;
  readonly update: S.Struct<ExtractVariantFields<"update", Fields>>;
  readonly json: S.Struct<ExtractVariantFields<"json", Fields>>;
  readonly jsonCreate: S.Struct<ExtractVariantFields<"jsonCreate", Fields>>;
  readonly jsonUpdate: S.Struct<ExtractVariantFields<"jsonUpdate", Fields>>;
}
```

---

## 7. Encoded Type Extraction for Drizzle

### ExtractEncodedType<F>

Extracts the encoded type (what gets stored in DB):
- **DSLVariantField**: Uses `"select"` variant's encoded type
- **DSLField**: Uses schema's encoded type I
- **Plain Schema**: Uses schema's encoded type I

Used by `toDrizzle` adapter for `.$type<T>()`.

---

## 8. Key Type Patterns

### Tuple Wrapping for Distributivity Control

```typescript
[F] extends [DSLVariantField<infer Config, any>]
```

Prevents TypeScript's distributive conditional type behavior.

### Guard-Before-Access Pattern

```typescript
V extends keyof Config  // Guard FIRST
  ? [Config[V]] extends [S.Schema.All]  // Then safe access
    ? Config[V]
    : never
  : never
```

Ensures safe property access.

---

## 9. Critical Implementation Notes for ModelFactory

### Type Parameter Capture Strategy

1. Accept default fields: `defaults: Fields extends DSL.Fields`
2. Accept user fields: `userFields: Partial<Fields>`
3. Merge at type level using conditional types
4. Return merged Fields type to Model()

### Default Value Handling

Use `defaultValueSchema` pattern:
```typescript
S.optionalWith(
  S.Union(schema, S.declare((u) => F.isFunction(u))),
  { exact: true }
)
```

### Column Metadata Extraction at Runtime

Follow Model's three-tier extraction pattern:
1. Direct property access via ColumnMetaSymbol
2. AST annotation check
3. Fallback to default ColumnDef
