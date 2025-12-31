# DSL Module Current State Report: Comprehensive Architecture Analysis

**Date**: 2025-12-30
**Purpose**: Foundation document for ModelFactory.create() implementation
**Scope**: DSL module architecture, patterns, constraints, and extension points

---

## Executive Summary

The DSL module is a sophisticated type-safe abstraction layer for Effect Schemas that enables building SQL-backed models with compile-time column type validation and runtime metadata attachment. It implements a two-phase curried API pattern where Fields attach metadata to schemas, and Models compose those fields into typed, queryable classes with six variant schemas for different contexts (select, insert, update, json, jsonCreate, jsonUpdate).

For the ModelFactory feature, the key insight is that field composition is already solved through immutable metadata attachment and the combinator pattern. ModelFactory's primary responsibility is to merge user-provided fields with defaults at the model creation level, leveraging Model's existing field processing pipeline.

---

## 1. Architectural Layers

### 1.1 Field Layer: Metadata Attachment

**Function**: `Field(schema) -> (config) -> DSLField`

The Field function is a curried factory that:
- Attaches SQL column metadata to Effect Schemas via symbol-based storage
- Derives precise column types from schema class identity
- Validates schema/column type compatibility at compile-time
- Uses dual storage: both Effect Schema annotations and direct property access

**Key Symbols**:
- `ColumnMetaSymbol`: Stores ColumnDef (type, primaryKey, unique, autoIncrement, defaultValue)
- `VariantFieldSymbol`: Boolean flag identifying DSL-wrapped variant fields
- `ForeignKeySymbol`: Stores FieldReference for foreign key constraints

### 1.2 Model Layer: Class Construction

**Function**: `Model<Self>(identifier) -> (fields, annotations) -> ModelClassWithVariants`

- Processes fields in a three-stage pipeline: extraction -> validation -> variant generation
- Extracts column metadata from all fields via `getColumnDef()`
- Creates a class with static properties: `tableName`, `columns`, `primaryKey`, `identifier`, `_fields`

### 1.3 Variant Layer: Multi-Use Schema Generation

**Six Variants via ModelVariant.Type**:
- `select`: All fields (database row representation)
- `insert`: Excludes Generated fields
- `update`: All fields
- `json`: Excludes Sensitive fields
- `jsonCreate`: Excludes Generated/GeneratedByApp/Sensitive
- `jsonUpdate`: Excludes Generated/GeneratedByApp/Sensitive

### 1.4 Drizzle Adapter Layer: ORM Translation

- Maps 8 column types to Drizzle builders
- Derives nullability from schema AST at conversion time
- Preserves encoded types via `.$type<T>()`

---

## 2. Field Metadata System

### 2.1 Column Type Derivation: Three-Tiered Inference

**Tier 1: Schema Class Identity**
- `S.Int` -> `"integer"` (not `"number"`)
- `S.UUID` -> `"uuid"` (not `"string"`)
- `S.DateTimeUtc` -> `"datetime"`
- `S.BigInt` -> `"bigint"`

**Tier 2: Encoded Type Fallback**
- Analyzes schema AST structure
- Handles refinements, transformations, unions

**Tier 3: Fallback Chain**
- Default to `"string"` if all else fails

### 2.2 Field Composition & Merging

**Combinator Pattern**:
- Type setters: `DSL.uuid`, `DSL.integer`, `DSL.datetime`
- Constraint setters: `DSL.primaryKey`, `DSL.unique`, `DSL.autoIncrement`
- Value setters: `DSL.defaultValue(value)`, `DSL.references(target, field)`

**Merge Hierarchy**: explicit > derived > default

---

## 3. Type-Level Machinery

### 3.1 Schema/Column Compatibility Validation

**ValidateSchemaColumn<SchemaEncoded, ColType, ResultType>**:
- Compile-time validation (returns helpful error type if incompatible)

### 3.2 Field Type Parameters

**DSLField<A, I, R, C>**:
- `A`: Type, `I`: Encoded, `R`: Context, `C`: ColumnDef

**DSLVariantField<Config, C>**:
- Carries column configuration AND variant config

---

## 4. Validation & Invariants

**Invariants Checked**:
- INV-MODEL-ID-001: Model identifier cannot be empty
- INV-SQL-ID-001: Identifier length <= 63 characters
- INV-SQL-ID-002: Valid SQL identifier characters
- INV-MODEL-AI-001: At most one autoIncrement field
- INV-SQL-PK-001: Primary key fields cannot be nullable

---

## 5. Table Factory Patterns (Context for ModelFactory)

### 5.1 Table.make Pattern (Drizzle-First)

```typescript
Table.make(entityId)(userColumns)
```

**Default Columns**: id, _rowId, createdAt, updatedAt, deletedAt, createdBy, updatedBy, deletedBy, version, source

**Type Safety**: `Omit<>` prevents overriding defaults

### 5.2 makeFields Pattern (Schema-First Parallel)

Mirrors Table.make but for Effect Schema layer.

---

## 6. Extension Points for ModelFactory

### 6.1 Field Merging Integration

```typescript
const mergedFields = { ...defaultFields, ...userFields };
Model<Self>(identifier)(mergedFields, annotations);
```

### 6.2 Type Safety Strategy

- Accept `defaultFields: Fields extends DSL.Fields`
- Accept `userFields: Partial<Fields>`
- Leverage Model's existing validation

### 6.3 Drizzle Integration

Merged fields have:
- Complete `_fields` mapping
- Parallel `columns` record
- Valid SQL identifier keys

---

## 7. Critical Constraints

### 7.1 Field Immutability
Fields are immutable once created. Composition returns new instances.

### 7.2 Nullability Handling
NOT stored in ColumnDef. Derived at conversion time from schema AST.

### 7.3 AutoIncrement Constraint
At most one per model. Only valid for integer/bigint types.

---

## 8. Test Patterns

### Type-Level Testing
```typescript
expectTypeOf(field).toExtend<DSLField<string, string, never>>();
```

### Runtime Metadata Testing
```typescript
expect(field[ColumnMetaSymbol].primaryKey).toBe(true);
```

### Variant Integration Testing
```typescript
expect(hasField(Model.select.fields, "field")).toBe(true);
```

---

## 9. Key Implementation Guidance

### For ModelFactory.create()

```typescript
ModelFactory.create(config: {
  defaultFields: Record<string, DSL.Field | DSL.VariantField>;
  tableNameFn?: (name: string) => string;
}) => <Self = never>(identifier: string) =>
      <const Fields extends DSL.Fields>(
        userFields: Fields,
        annotations?: S.Annotations.Schema<Self>
      ) => ModelClassWithVariants
```

**Implementation Strategy**:
1. Return a curried function (matches Model's API)
2. Merge defaultFields and userFields via object spread
3. Call Model() with merged fields
4. Reuse Model's validation
5. Return the Model class directly

---

## 10. Quick Reference: Critical Patterns

### Field Creation
```typescript
Field(S.String)({ column: { type: "uuid", primaryKey: true } })
S.String.pipe(DSL.uuid, DSL.primaryKey)
```

### Model Definition
```typescript
class User extends Model<User>("User")({
  id: Field(S.String)({ column: { primaryKey: true } }),
  name: Field(S.String)({}),
}) {}
```

### Default Field Merging
```typescript
const merged = { ...defaultFields, ...userFields };
Model<Self>(identifier)(merged, annotations);
```

---

**Document Complete**: This synthesis provides comprehensive guidance for implementing ModelFactory.create().
