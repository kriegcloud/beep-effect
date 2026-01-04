# Field Module Analysis Report

**Date**: 2025-12-30
**Module**: `packages/common/schema/src/integrations/sql/dsl/Field.ts`
**Purpose**: Comprehensive technical analysis for ModelFactory implementation

---

## Executive Summary

The `Field` function is a **curried factory** that attaches SQL column metadata to Effect Schemas and VariantSchema.Field types. It uses sophisticated type-level machinery to derive precise column types from schema class identity (distinguishing `S.Int` from `S.Number`, `S.UUID` from `S.String`) and validates schema/column type compatibility at compile-time.

**Key insight for ModelFactory**: Fields are immutable once created - metadata is attached via symbols and annotations, then the schema object is sealed. Composing fields (merging defaults into new field instances) requires careful handling of the metadata attachment pattern.

---

## 1. Field Function Signature & Curried API

### Curried Pattern

Field uses a **two-stage curried API**:

```typescript
// Stage 1: Pass a schema or variant field -> returns Configurator
const configurator = Field(S.String);

// Stage 2: Pass column config -> returns final DSLField
const field = configurator({ column: { type: "uuid", primaryKey: true } });
```

### Overloads

The function has **three overloads**:

1. **Plain Effect Schema**
   - Takes any Effect Schema type
   - Returns `SchemaConfiguratorWithSchema<Schema>`

2. **Local VariantSchema.Field**
   - Detects local VariantSchema implementations
   - Returns `LocalVariantConfiguratorWithSchema<VC>`

3. **@effect/experimental VariantSchema.Field**
   - Detects @effect/experimental VariantSchema.Field
   - Handles M.Generated, M.Sensitive, M.FieldOption, etc.
   - Returns `ExperimentalVariantConfiguratorWithSchema<VC>`

---

## 2. Type-Level Machinery

### Column Type Derivation

When no explicit type is provided, the module derives the type using **two-level approach**:

**Type-Level** (`DerivedColumnDefFromSchema`):
- `S.Int` -> `"integer"` (not generic `"number"`)
- `S.UUID`, `S.ULID` -> `"uuid"` (not generic `"string"`)
- `S.Date`, `S.DateFromString`, `S.DateTimeUtc` -> `"datetime"`
- `S.BigInt`, `S.BigIntFromSelf` -> `"bigint"`
- Falls back to `DeriveColumnTypeFromEncoded` for unknown schema types

**Runtime-Level** (`deriveColumnType` in derive-column-type.ts):
- Analyzes schema AST structure
- Uses pattern matching on AST tags
- Handles refinements, transformations, unions
- Detects Schema IDs for UUID, Int, Date, BigInt

### Schema/Column Compatibility Validation

**ValidateSchemaColumn**: Returns compile error type if incompatible (not runtime exception)

---

## 3. Metadata Attachment Pattern

### Dual Storage Strategy

The Field function attaches column metadata using **two mechanisms**:

**For Plain Schemas**:
```typescript
const annotated = schema.annotations({ [ColumnMetaSymbol]: columnDef });
const result = Object.assign(annotated, { [ColumnMetaSymbol]: columnDef });
```

**For VariantFields**:
```typescript
const result = Object.create(Object.getPrototypeOf(input));
Object.assign(result, input);
result[ColumnMetaSymbol] = columnDef;
result[VariantFieldSymbol] = true;
```

### Symbols Used

1. **ColumnMetaSymbol**: Stores ColumnDef (type, primaryKey, unique, autoIncrement, defaultValue)
2. **VariantFieldSymbol**: Boolean flag indicating DSL-wrapped variant field
3. **ForeignKeySymbol**: Stores FieldReference for foreign key constraints

---

## 4. Field Composition & Merging

### Combinators Approach

The module provides pipe-friendly combinators as an alternative:

```typescript
const idField = S.String.pipe(
  DSL.uuid,           // Type setter
  DSL.primaryKey,     // Constraint setter
  DSL.unique          // Constraint setter
);
```

### Internal Composition Helper

**attachColumnDef**:
1. Extracts existing metadata if present
2. Merges with new properties (new overrides existing)
3. Attaches to new schema instance via annotations + direct property
4. Returns new DSLField (no mutation)

**Merge Strategy**: New values override existing; fallback to defaults (false, undefined).

---

## 5. VariantField Handling

### VariantSchema.Field Structure

A VariantField contains 6 variant-specific schemas:
- `select`: Database row schema (all fields)
- `insert`: For INSERT (excludes Generated)
- `update`: For UPDATE (all fields)
- `json`: JSON output (excludes Sensitive)
- `jsonCreate`: JSON create input (excludes Generated/GeneratedByApp/Sensitive)
- `jsonUpdate`: JSON update input (excludes Generated/GeneratedByApp/Sensitive)

---

## 6. Implications for ModelFactory

### What ModelFactory Must Handle

1. **Creating new field instances with defaults pre-applied**
   - Cannot mutate existing Field results
   - Each factory call returns a factory function, not cached fields

2. **Merging default fields into user-provided fields**
   - User fields override defaults via object spread
   - Leverage Model's existing `getColumnDef()` extraction

3. **Preserving variant field structure**
   - Don't lose variant config (select, insert, update, json, jsonCreate, jsonUpdate)

4. **Type-level constraint tracking**
   - Factory function signature needs to be type-safe while remaining flexible

### Recommended Implementation Pattern

```typescript
const ModelBuilder = {
  create: (config: {
    defaultFields: Record<string, S.Schema.All | DSLField | DSLVariantField>;
    tableNameFn?: (name: string) => string;
  }) => {
    return <Self = never>(identifier: string) => {
      return <const Fields extends DSL.Fields>(
        userFields: Fields,
        annotations?: S.Annotations.Schema<Self>
      ) => {
        const mergedFields: DSL.Fields = {
          ...config.defaultFields,
          ...userFields,
        };
        return Model<Self>(identifier)(mergedFields, annotations);
      };
    };
  },
};
```

---

## 7. Key Design Patterns

1. **Symbol-Based Metadata**: Unique symbols for type-safe storage
2. **Immutable Composition**: Never mutate Field objects
3. **Lazy Type Derivation**: Type-level + Runtime-level
4. **Variant Field Passthrough**: Preserve prototype chain
5. **Dual Metadata Storage**: Both annotations and direct property
6. **Thunks for Circular Deps**: Use `() => Target` in references
