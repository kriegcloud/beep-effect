# types.ts Analysis Report

## Overview

This is the core type definitions module for the SQL DSL integration in the beep-effect schema system (~1,170 lines). It serves as the bridge between Effect Schema abstractions and SQL column definitions.

**Location**: `packages/common/schema/src/integrations/sql/dsl/types.ts`

## Key Responsibilities

1. **Schema/column compatibility validation** - Type-level checks ensuring Effect schemas map validly to SQL column types
2. **Column type derivation** - Algorithms to infer SQL column types from schema encoded types or schema class identity
3. **ColumnDef schema factories** - Eight member schemas forming a discriminated union
4. **DSL field wrappers** - DSLField and DSLVariantField interfaces that attach column metadata to schemas
5. **Variant field extraction** - Types for computing variant-specific schema fields from DSL field definitions
6. **Model class interfaces** - Definitions for ModelClass and ModelClassWithVariants

## ColumnDef Interface (Legacy) — Lines 847-858

```typescript
export interface ColumnDef<
  ColType extends ColumnType.Type = ColumnType.Type,
  PrimaryKey extends boolean = boolean,
  Unique extends boolean = boolean,
  AutoIncrement extends boolean = boolean,
> {
  readonly type: ColType;
  readonly primaryKey?: PrimaryKey;
  readonly unique?: Unique;
  readonly defaultValue?: undefined | string | (() => string);
  readonly autoIncrement?: AutoIncrement;
}
```

**Why "Legacy"**: This interface is replaced by `ColumnDefSchema` (the discriminated union), which provides:
- Schema-based default values
- Type-safety: autoIncrement only for integer/bigint
- Discriminated union ensuring only valid member types

## ColumnDefSchema (Replacement) — Lines 754-842

### Member Schemas (8 total)

**Without autoIncrement** (6 schemas):
- `StringColumnDefSchema`
- `NumberColumnDefSchema`
- `BooleanColumnDefSchema`
- `DatetimeColumnDefSchema`
- `UuidColumnDefSchema`
- `JsonColumnDefSchema`

**With autoIncrement** (2 schemas):
- `IntegerColumnDefSchema`
- `BigintColumnDefSchema`

### Generic Interfaces Pattern

Each member has a `.Generic` interface:
```typescript
export declare namespace StringColumnDefSchema {
  export interface Generic<
    PrimaryKey extends boolean = boolean,
    Unique extends boolean = boolean,
  > {
    readonly type: Type["type"];
    readonly primaryKey?: PrimaryKey | undefined;
    readonly unique?: Unique | undefined;
    readonly defaultValue?: Type["defaultValue"];
  }
}
```

### GenericMap (Lines 785-798)

Maps ColumnType literals to member Generic interfaces:
```typescript
export type GenericMap<PrimaryKey, Unique, AutoIncrement> = {
  readonly string: StringColumnDefSchema.Generic<PrimaryKey, Unique>;
  readonly integer: IntegerColumnDefSchema.Generic<PrimaryKey, Unique, AutoIncrement>;
  // ... etc
};
```

### ColumnDefSchema.Generic Mapped Type (Lines 829-834)

```typescript
export type Generic<
  T extends ColumnType.Type = ColumnType.Type,
  PrimaryKey extends boolean = boolean,
  Unique extends boolean = boolean,
  AutoIncrement extends boolean = boolean,
> = GenericMap<PrimaryKey, Unique, AutoIncrement>[T];
```

## ColumnDef Usages Within File

| Lines | Location | Usage Pattern |
|-------|----------|---------------|
| 444 | `DerivedColumnDefFromSchema` | Generic constraint: `C extends Partial<ColumnDef>` |
| 864 | `ExactColumnDef` | Generic constraint: `C extends Partial<ColumnDef>` |
| 872 | `FieldConfig` | Generic constraint: `C extends Partial<ColumnDef>` |
| 888 | `DSLField` | Generic constraint: `C extends ColumnDef` |
| 907 | `DSLVariantField` | Generic constraint: `C extends ColumnDef` |
| 942 | `isDSLVariantField` | Generic constraint: `C extends ColumnDef` |
| 955 | `FieldResult` | Generic constraint: `C extends ColumnDef` |
| 1061 | `ModelClassWithVariants` | Generic constraint: `Columns extends Record<string, ColumnDef>` |
| 1089 | `ModelClass` | Generic constraint: `Columns extends Record<string, ColumnDef>` |
| 1116 | `ModelStatics` | Generic constraint: `Columns extends Record<string, ColumnDef>` |

## Key Type Utilities

| Type | Purpose |
|------|---------|
| `DeriveColumnTypeFromSchema<Schema>` | Type-level column type derivation |
| `DerivedColumnDefFromSchema<Schema, C>` | Creates ColumnDef with derived type |
| `ExactColumnDef<C>` | Extracts exact ColumnDef from partial config |
| `ValidateSchemaColumn<Encoded, ColType, Result>` | Schema/column compatibility validation |
| `ExtractEncodedType<F>` | Extracts encoded type from DSL field |

## Challenges

1. **Schema Class Identity Detection** — Can't use `Schema extends typeof S.Any` (bivariant), must check `IsAny<A>` on Type parameter
2. **Branded Types** — Check primitives BEFORE objects to correctly handle branded strings
3. **Arity Mismatch** — Integer/bigint have 3 params (with autoIncrement); others have 2
4. **Nullable Handling** — Removed from ColumnDef, derived from Schema AST instead

## Recommendations

1. Mark ColumnDef as `@deprecated` with migration path to ColumnDefSchema.Generic
2. Document that `nullable` is derived from schema AST, not stored in ColumnDef
3. Add JSDoc for SupportsAutoIncrement helper type
