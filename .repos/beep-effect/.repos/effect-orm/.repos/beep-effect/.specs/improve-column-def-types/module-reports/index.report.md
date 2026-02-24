# index.ts Analysis Report

## Overview

`index.ts` (~20 lines) is the primary export hub aggregating types, combinators, adapters, and utilities for the SQL DSL.

**Location**: `packages/common/schema/src/integrations/sql/dsl/index.ts`

## Public Exports

### From `./adapters/drizzle`
- `toDrizzle` — DSL Model → Drizzle PgTable

### From `./combinators` (namespace `DSL`)
- Type setters: `uuid`, `string`, `integer`, `number`, `boolean`, `json`, `datetime`
- Constraint setters: `primaryKey`, `unique`, `autoIncrement`
- Default setter: `defaultValue`

### From `./derive-column-type`
- `deriveColumnType` — Runtime column type derivation
- `deriveSchemaColumnType` — Schema-based derivation

### From `./errors`
- All error classes (8 total)

### From `./Field`
- Types: `DSLField`, `DSLVariantField`, `SchemaColumnError`
- Functions: `Field`, `extractASTFromInput`
- Symbols: `ColumnMetaSymbol`, `VariantFieldSymbol`

### From `./literals`
- `ModelVariant`, `ColumnType`

### From `./Model`
- Types: `ExtractColumnsType`, `ExtractPrimaryKeys`, `ModelClass`, `ModelStatics`
- Classes: `Model`

### From `./nullability`
- `isNullable`, `isSchemaTypeNullable`

### From `./types`
- 40+ type definitions including ColumnDef, ColumnDefSchema, all member schemas

### From `./validate`
- All validation functions

## ColumnDef-Related Exports

### Type Parameters Using ColumnDef
1. `DSLField<A, I, R, C extends ColumnDef>`
2. `DSLVariantField<A, C extends ColumnDef>`
3. `FieldConfig<C extends Partial<ColumnDef>>`
4. `ExactColumnDef<C extends Partial<ColumnDef>>`
5. `ValidateSchemaColumn<SchemaEncoded, ColType, ResultType>`
6. `DerivedColumnDefFromSchema<Schema, C>`
7. `ColumnDefSchema.Generic<T, PrimaryKey, Unique, AutoIncrement>`
8. `ModelClass` & `ModelStatics` — `Columns extends Record<string, ColumnDef>`

### Schema Classes
All 8 member schemas: `StringColumnDefSchema`, `NumberColumnDefSchema`, `IntegerColumnDefSchema`, `BooleanColumnDefSchema`, `DatetimeColumnDefSchema`, `UuidColumnDefSchema`, `JsonColumnDefSchema`, `BigintColumnDefSchema`

## Recommendations for ColumnDef Removal

1. **Generic Parameter Removal** — Remove `C extends ColumnDef` from all types
2. **Metadata Storage Migration** — Replace ColumnMetaSymbol storage with alternative
3. **Type-Level Column Definition** — Embed properties directly on DSLField
4. **Schema Classes Impact** — Refactor 8 column schema classes
5. **Model Class Constraints** — Update `Columns extends Record<string, ColumnDef>`
6. **Combinator Functions** — Replace MergeColumnDef/ResolveColumnDef patterns
7. **Drizzle Adapter** — Update toDrizzle() to work with new format
