# Model.ts Analysis Report

## Overview

`Model.ts` (~493 lines) is the centerpiece of the DSL module implementing a type-safe factory pattern for creating SQL table models with variant schema support.

**Location**: `packages/common/schema/src/integrations/sql/dsl/Model.ts`

## Model() Factory

```typescript
export const Model = <Self = never>(identifier: string) => <const Fields extends DSL.Fields>(
  fields: Fields,
  annotations?: S.Annotations.Schema<Self>
): ModelClassWithVariants<...> => { ... }
```

### Execution Flow

1. **Extract columns** — `extractColumns(fields)` → `ExtractColumnsType<Fields>`
2. **Validate invariants** — 5 model-level + 5 field-level invariants
3. **Derive primary key** — Filters columns where `primaryKey === true`
4. **Convert to snake_case** — `identifier: "UserProfile"` → `tableName: "user_profile"`
5. **Create VariantSchema** — Initializes with 6 variants (select as default)
6. **Convert fields to VariantFields** — Wraps plain fields via `VS.FieldOnly`
7. **Create base class** — Extends `S.Class<Self>(identifier)`
8. **Add variant accessors** — Lazy getters with caching

## Mapped Types

### ExtractColumnsType<Fields> (Lines 41-50)

```typescript
export type ExtractColumnsType<Fields extends DSL.Fields> = {
  readonly [K in keyof Fields]:
    [Fields[K]] extends [DSLVariantField<UnsafeAny, infer C>] ? C
    : [Fields[K]] extends [DSLField<UnsafeAny, UnsafeAny, UnsafeAny, infer C>] ? C
    : ColumnDef<"string", false, false, false>;
};
```

**ColumnDef Usage**: Fallback to default `ColumnDef<"string", false, false, false>`

### ExtractPrimaryKeys<Fields> (Lines 54-66)

```typescript
export type ExtractPrimaryKeys<Fields extends DSL.Fields> = {
  [K in keyof Fields]:
    [Fields[K]] extends [DSLVariantField<UnsafeAny, infer C>]
      ? C extends { primaryKey: true } ? K : never
    : [Fields[K]] extends [DSLField<UnsafeAny, UnsafeAny, UnsafeAny, infer C>]
      ? C extends { primaryKey: true } ? K : never
      : never;
}[keyof Fields];
```

**ColumnDef Usage**: Checks `C extends { primaryKey: true }`

## defaultColumnDef (Lines 90-95)

```typescript
const defaultColumnDef: ColumnDef<"string", false, false, false> = {
  type: "string" as const,
  primaryKey: false,
  unique: false,
  autoIncrement: false,
};
```

## ColumnDef Usages

| Location | Usage Pattern | Complexity |
|----------|---------------|------------|
| Line 25 | Import type | Low |
| Line 49 | Fallback in ExtractColumnsType | Medium |
| Lines 90-95 | defaultColumnDef constant | Low |
| Line 104 | getColumnDef return type | Low |
| Line 116 | AST annotation extraction | High |
| Line 129 | Mapped in extractColumns | Low |
| Line 136 | derivePrimaryKey parameter | Low |
| Line 163 | validateModelInvariants parameter | High |
| Lines 252, 298 | Validation access | Medium |
| Line 444 | Type assertion in validateModelInvariants | Medium |

## Challenges

1. **Type vs Runtime Mismatch** — Type-level (ExtractColumnsType) vs runtime (extractColumns) must stay aligned
2. **Nullable Handling Removed** — Derived from schema AST, not stored in ColumnDef
3. **VariantSchema Integration** — Three cases: DSLVariantField, VariantSchema.Field, plain Schema
4. **Fallback Behavior** — Unknown fields become `"string"` type (potentially mismatched with runtime)

## Recommendations for Migration

1. **Update defaultColumnDef signature** — Use `ColumnDefSchema.Generic<"string", false, false, false>`
2. **Normalize ColumnDef usage** — Explicit typing in extractColumns
3. **Update validateModelInvariants signature** — `columns: Record<string, ColumnDefSchema.Generic>`
4. **Review ExtractColumnsType fallback** — Consider stricter fallback or documentation
5. **Clarify nullable handling** — Add JSDoc explaining it's NOT in ColumnDef
