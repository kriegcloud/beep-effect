# Drizzle Adapter Analysis Report

**Date**: 2025-12-30
**Module**: `packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts`
**Purpose**: Model-to-Drizzle table conversion for ModelFactory

---

## Executive Summary

The drizzle adapter converts Effect DSL Models into strongly-typed Drizzle ORM table definitions. It handles type-safe column definitions, nullability derivation from Schema ASTs, and encoded type preservation.

---

## 1. Model-to-Drizzle Conversion Architecture

### Entry Point: `toDrizzle()`

```typescript
export const toDrizzle = <
  TName extends string,
  Columns extends Record<string, ColumnDef>,
  PK extends readonly string[],
  Id extends string,
  Fields extends DSL.Fields,
  M extends ModelStatics<TName, Columns, PK, Id, Fields>
>(model: M): PgTableWithColumns<{...}>
```

**Key Design Decisions:**
- **Input**: Takes a `ModelStatics` object
- **Output**: Fully-typed Drizzle `PgTableWithColumns`
- **Reusability**: Generic over model's metadata structure

### Type-Level Drizzle Builder Mapping

Modifier application order (critical):
1. Base builder (type-specific: `serial`, `integer`, `text`, etc.)
2. `.primaryKey()` (if applicable)
3. `.unique()` (if applicable)
4. `.notNull()` (if applicable)
5. `.$type<EncodedType>()` (purely type-level, applied last)

---

## 2. Field Metadata Extraction

### Column Builder Function

```typescript
const columnBuilder = <ColumnName, EncodedType>(
  name: ColumnName,
  def: ColumnDef,
  field: DSL.Fields[string]
) =>
  F.pipe(
    Match.value(def).pipe(
      Match.discriminatorsExhaustive("type")({
        string: thunk(pg.text(name)),
        integer: thunk(def.autoIncrement ? pg.serial(name) : pg.integer(name)),
        // ... other types
      })
    ),
    (column) => {
      if (def.primaryKey) column = column.primaryKey();
      if (def.unique) column = column.unique();
      const fieldIsNullable = isFieldNullable(field);
      if (!fieldIsNullable && !def.autoIncrement) column = column.notNull();
      return column.$type<EncodedType>();
    }
  );
```

### Nullability Derivation from Schema AST

Nullability is **NOT stored in ColumnDef**. Instead:
- Derived at conversion time by analyzing schema AST
- Checks for `S.NullOr()`, `S.UndefinedOr()`, `S.optional()` patterns
- Plain schemas are non-nullable

---

## 3. Column Type Mapping

| ColumnType | Drizzle Builder | With autoIncrement |
|------------|-----------------|-------------------|
| `"string"` | `pg.text(name)` | N/A |
| `"number"` | `pg.integer(name)` | N/A |
| `"integer"` | `pg.integer(name)` | `pg.serial(name)` |
| `"boolean"` | `pg.boolean(name)` | N/A |
| `"datetime"` | `pg.timestamp(name)` | N/A |
| `"uuid"` | `pg.uuid(name)` | N/A |
| `"json"` | `pg.jsonb(name)` | N/A |
| `"bigint"` | `pg.bigint(name, { mode: "bigint" })` | `pg.serial8()` |

---

## 4. Table Name Handling

### Snake Case Transformation

```typescript
const toSnakeCase = (str: string): string =>
  F.pipe(str, Str.replace(/([A-Z])/g, "_$1"), Str.toLowerCase, Str.replace(/^_/, ""));
```

Example: `"UserProfile"` -> `"user_profile"`

---

## 5. Variant Field Support

### DSLVariantField Handling

For models with variant fields (from `M.Generated()`, `M.Sensitive()`, etc.):

```typescript
const getFieldAST = (field: DSL.Fields[string]): AST.AST | null => {
  // Case 1: DSLVariantField - extract "select" variant
  if (isDSLVariantField(field)) {
    const selectSchema = field.schemas.select;
    // ...
  }
  // ...
};
```

**Why "select" variant?**
- Represents what gets stored in and retrieved from the database
- Other variants may exclude Generated or Sensitive fields

---

## 6. Type Preservation via .$type<T>()

### Encoded Type Extraction

```typescript
export type ExtractEncodedType<F> =
  [F] extends [DSLVariantField<infer Config, ColumnDef>]
    ? Config extends { select: infer SelectSchema }
      ? [SelectSchema] extends [S.Schema<infer _A, infer I, infer _R>]
        ? I  // Encoded type
        : unknown
      : unknown
    : // ...other cases
```

This ensures branded types are preserved through the adapter.

---

## 7. Extension Points for ModelFactory

### A. Column Metadata Lookup

```typescript
const field = model._fields[key];
return [key, columnBuilder(key, def, field)] as const;
```

### B. Type-Safe Column Access

```typescript
F.pipe(
  model.columns,
  Struct.entries,
  A.map(([key, def]) => {
    const field = model._fields[key];
    return [key, columnBuilder(key, def, field)] as const;
  })
)
```

For ModelFactory, ensure:
1. `_fields` and `columns` have identical keys
2. Both computed during model creation, not lazily
3. Keys must be valid SQL identifiers

### C. Validation Integration

ModelFactory should reuse Model class's validation:
- INV-MODEL-ID-001: Non-empty identifier
- INV-SQL-ID-001: Identifier length < 63 chars
- INV-SQL-ID-002: Valid SQL identifier characters
- INV-MODEL-AI-001: At most one autoIncrement field
- INV-SQL-PK-001: Primary key fields are non-nullable

---

## 8. Key Design Decisions for ModelFactory

### Must Preserve

1. Column metadata storage via `ColumnMetaSymbol` on fields
2. `_fields` mapping with complete schema AST
3. Validation constraints
4. Variant field support
5. Table name transformation

### Can Extend

1. Default value handling in `columnBuilder()` (currently not applied)
2. Foreign key application (FK metadata stored but not used)
3. Custom column transformations

### Should Avoid

1. Bypassing validation
2. Modifying `_fields` after initial creation
3. Storing nullability in ColumnDef (derive from AST)
4. Direct prototype mutation
