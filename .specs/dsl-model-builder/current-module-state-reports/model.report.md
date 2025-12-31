# Model Module Analysis Report

**Date**: 2025-12-30
**Module**: `packages/common/schema/src/integrations/sql/dsl/Model.ts`
**Purpose**: Comprehensive analysis of Model factory for ModelFactory implementation

---

## Executive Summary

The `Model` function is a curried, generic factory that creates a class with SQL metadata. It processes fields, extracts column metadata, derives primary keys, and generates variant schemas for multi-use model definitions.

---

## 1. Model Function Signature

```typescript
export const Model =
  <Self = never>(identifier: string) =>
  <const Fields extends DSL.Fields>(
    fields: Fields,
    annotations?: S.Annotations.Schema<Self>
  ): [Self] extends [never]
    ? MissingSelfGeneric<...>
    : ModelClassWithVariants<...>
```

**Key traits:**
- **First call**: Takes identifier (model name), returns configurator
- **Second call**: Takes fields object and optional annotations, returns Model class
- **Type safety**: Uses `[Self] extends [never]` to enforce `class Self extends Model<Self>()` pattern
- **Returns**: `ModelClassWithVariants` interface (extends `S.Schema` with 6 variant accessors)

---

## 2. Field Processing Pipeline

### Stage 1: Column Metadata Extraction

```typescript
const extractColumns = <Fields extends DSL.Fields>(fields: Fields) =>
  F.pipe(
    fields,
    Struct.entries,
    A.map(([key, field]) => {
      const columnDef = getColumnDef(field);
      return [key, columnDef] as const;
    }),
    R.fromEntries
  );
```

**Column metadata sources** (via `getColumnDef`):
1. Direct property access: `ColumnMetaSymbol` on DSLField/DSLVariantField
2. AST annotations: Schema annotations for plain schemas
3. Fallback: Default ColumnDef with type="string"

### Stage 2: Primary Key Derivation

```typescript
const derivePrimaryKey = <Columns extends Record<string, ColumnDef>>(columns: Columns) =>
  F.pipe(
    columns,
    Struct.entries,
    A.filter(([_, def]) => def.primaryKey === true),
    A.map(([key]) => key)
  );
```

---

## 3. Class Extension Pattern

The Model function creates a base class and attaches static properties:

```typescript
class BaseClass extends S.Class<UnsafeAny>(identifier)(selectSchema.fields, annotations) {
  static readonly tableName = tableName;        // snake_case(identifier)
  static readonly columns = columns;            // ExtractColumnsType<Fields>
  static readonly primaryKey = primaryKey;      // readonly string[]
  static override readonly identifier = identifier;
  static readonly _fields = fields;             // Original DSL fields for Drizzle
}

// Add 6 variant accessors via lazy-evaluated Object.defineProperty
for (const variant of ModelVariant.Options) {
  Object.defineProperty(BaseClass, variant, {
    get: () => { /* extract and cache variant schema */ },
    enumerable: true,
    configurable: false,
  });
}
```

**Static properties:**
- `tableName`: Snake-cased identifier
- `columns`: Record mapping field names to ColumnDef
- `primaryKey`: Array of primary key field names
- `identifier`: Original model identifier
- `_fields`: Original DSL fields (used by toDrizzle)

---

## 4. VariantSchema Integration

### Variant Field Handling

```typescript
const toVariantFields = (fields: Fields, VS: VariantSchema) =>
  F.pipe(
    fields,
    R.map((field) => {
      // Case 1: DSLVariantField - extract underlying variant field
      if (isDSLVariantField(field)) {
        return VS.Field(field.schemas);
      }
      // Case 2: Raw VariantSchema.Field - pass through
      if (isAnyVariantField(field)) {
        return VS.Field(field.schemas);
      }
      // Case 3: Plain DSLField/Schema - wrap for all 6 variants
      const schema = extractSchema(field);
      return VS.FieldOnly(...ModelVariant.Options)(schema);
    })
  );
```

### Variant Cache Pattern

- Lazy-evaluated per variant via Object.defineProperty
- Cached in `variantCache` to avoid recomputation
- Annotations added with variant-specific identifier

---

## 5. Validation & Invariants

Model creation validates all invariants immediately:

**Invariants checked:**
- **INV-MODEL-ID-001**: Model identifier cannot be empty
- **INV-SQL-ID-001**: Identifier length <= 63 characters (PostgreSQL limit)
- **INV-SQL-ID-002**: Identifier valid characters (SQL identifiers)
- **INV-MODEL-AI-001**: At most one autoIncrement field
- **INV-SQL-PK-001**: Primary key fields cannot be nullable

**Error aggregation**: All errors collected, then thrown as `ModelValidationAggregateError`

---

## 6. Key Findings for ModelFactory

1. **No existing default fields pattern**: Fields are always explicit per model
2. **Metadata is immutable after extraction**: Happens at class creation time
3. **Field composition available via combinators**: `schema.pipe(DSL.uuid, DSL.primaryKey, ...)`
4. **Variant handling is centralized**: Six variants managed via VariantSchema integration
5. **Type safety is comprehensive**: Schema/column compatibility validated at compile time

---

## 7. Extension Points for ModelFactory

### A. Field Merging Integration

The Model function accepts a `fields` object. A factory could prepare this object:

```typescript
const makeModel = ModelBuilder.create({
  defaultFields: { createdAt: ..., updatedAt: ... }
});

// Later:
const mergedFields = { ...defaultFields, ...userFields };
Model<Self>(identifier)(mergedFields, annotations);
```

### B. Validation Reuse

ModelFactory should call the same validation functions:
- `validateModelInvariants(identifier, fields, columns)`

### C. Static Property Access

After creation, all static properties are available:
- `Model.tableName`, `Model.columns`, `Model.primaryKey`, `Model._fields`
