# Adapters Analysis Report

## Overview

The adapters provide bidirectional conversion between Effect Schema DSL Models and Drizzle ORM structures. **CRITICAL** for refactoring — heavy ColumnDef usage.

**Location**: `packages/common/schema/src/integrations/sql/dsl/adapters/`

## Files

1. **drizzle.ts** (~312 lines) — DSL Models → Drizzle PgTables
2. **drizzle-to-effect-schema.ts** (~270 lines) — Drizzle Tables → Effect Schemas

## drizzle.ts

### toDrizzle() Function (Lines 273-311)

```typescript
export const toDrizzle = <
  TName extends string,
  Columns extends Record<string, ColumnDef>,
  PK extends readonly string[],
  Id extends string,
  Fields extends DSL.Fields,
  M extends ModelStatics<TName, Columns, PK, Id, Fields>,
>(model: M): PgTableWithColumns<...>
```

**Behavior**:
1. Takes DSL Model with columns metadata and field schemas
2. Iterates through `model.columns` and `model._fields` in parallel
3. For each column, calls `columnBuilder(key, def, field)` to construct Drizzle column
4. Returns `PgTableWithColumns` with fully typed columns

### Type Mappers — Nested Composition Pattern

```
DrizzleBaseBuilderFor<Name, T, AI>
  → ApplyNotNull<T, Col, EncodedType>
    → ApplyPrimaryKey<T, Col>
      → ApplyHasDefault<T, Col>
        → ApplyAutoincrement<T, Col>
          → Apply$Type<T, EncodedType>
```

**Critical**: Order is important (constraints before `.$type<T>()`)

### DrizzleBaseBuilderFor Mapping (Lines 45-63)

| ColumnType | Drizzle Builder |
|------------|-----------------|
| `"string"` | PgTextBuilderInitial |
| `"number"` | PgIntegerBuilderInitial |
| `"integer"` | PgSerialBuilderInitial or PgIntegerBuilderInitial |
| `"boolean"` | PgBooleanBuilderInitial |
| `"datetime"` | PgTimestampBuilderInitial |
| `"uuid"` | PgUUIDBuilderInitial |
| `"json"` | PgJsonbBuilderInitial |
| `"bigint"` | PgBigInt53BuilderInitial |

### ApplyNotNull Logic (Lines 76-82)

1. If `Col.primaryKey = true` → apply NotNull
2. Else if `Col.autoIncrement = true` → DON'T apply (Serial handles it)
3. Else if `IsEncodedNullable<EncodedType> = true` → DON'T apply
4. Else → apply NotNull

**Key Insight**: Nullability derived from **schema encoding**, NOT from ColumnDef.nullable

### columnBuilder() Runtime (Lines 215-244)

Uses `Match.discriminatorsExhaustive("type")` for 8-way dispatch:
```typescript
if (def.primaryKey) column = column.primaryKey();
if (def.unique) column = column.unique();
const fieldIsNullable = isFieldNullable(field);  // From schema AST
if (!fieldIsNullable && !def.autoIncrement) column = column.notNull();
return column.$type<EncodedType>();
```

## drizzle-to-effect-schema.ts

**No direct ColumnDef usage** — works with Drizzle Column metadata.

### Functions

- `createInsertSchema()` — Creates schema for INSERT operations
- `createSelectSchema()` — Creates schema for SELECT operations
- `mapColumnToSchema()` — Maps Drizzle Column → Effect Schema

## ColumnDef Usage in drizzle.ts

| Location | Usage Pattern | Complexity |
|----------|---------------|------------|
| DrizzleTypedBuilderFor type param | Constraint | High |
| ApplyNotNull | Col.primaryKey, Col.autoIncrement checks | High |
| ApplyPrimaryKey | Col.primaryKey check | Low |
| ApplyHasDefault | Col.autoIncrement, Col.defaultValue | Medium |
| ApplyAutoincrement | Col.autoIncrement check | Low |
| columnBuilder() runtime | 8-way type discriminator + 3 constraints | High |

## Challenges

1. **Nested Type Composition** — 5 levels deep creates inference burden
2. **Nullability Duality** — Schema AST vs ColumnDef constraints
3. **Serial Column Handling** — autoIncrement bypasses notNull application
4. **PropertySignature Variance** — Must handle both declaration and transformation AST types

## Recommendations

1. **Flatten nesting** — Consider single "apply modifiers" type
2. **Runtime validation** — Validate ColumnDef against schema before processing
3. **Test coverage** — Test all 16 modifier combinations (primaryKey × autoIncrement × unique × defaultValue)
