# DSL.Model Variant Types Fix - Handoff Document

## Status: Partial Fix Applied

This document describes the work completed, remaining issues, and the recommended approach based on analysis of `@effect/sql/Model` and `@effect/experimental/VariantSchema` source code.

---

## Work Completed

### 1. Tuple Wrapping Fixes Applied

The following changes were made to `packages/common/schema/src/integrations/sql/dsl/types.ts`:

#### `ShouldIncludeField` (lines 131-141)

**Before:**
```typescript
export type ShouldIncludeField<V extends string, F> = F extends DSLVariantField<infer Config, ColumnDef>
  ? V extends keyof Config
    ? true
    : false
  : true;
```

**After:**
```typescript
export type ShouldIncludeField<V extends string, F> =
  [F] extends [DSLVariantField<infer Config, ColumnDef>]
    ? V extends keyof Config
      ? true
      : false
    : true;
```

#### `ExtractFieldSchema` (lines 148-163)

**Before:**
```typescript
export type ExtractFieldSchema<V extends string, F> = F extends DSLVariantField<infer Config, ColumnDef>
  ? V extends keyof Config
    ? Config[V]
    : never
  : ...
```

**After:**
```typescript
export type ExtractFieldSchema<V extends string, F> =
  [F] extends [DSLVariantField<infer Config, ColumnDef>]
    ? V extends keyof Config  // Guard FIRST
      ? [Config[V]] extends [S.Schema.All | S.PropertySignature.All]  // THEN safe access
        ? Config[V]
        : never
      : never
    : [F] extends [DSLField<infer A, infer I, infer R, ColumnDef>]
      ? S.Schema<A, I, R>
      : [F] extends [S.Schema.All]
        ? F
        : [F] extends [S.PropertySignature.All]
          ? F
          : never;
```

### 2. Verification Results

- **Runtime Tests:** All 59 DSL tests pass
- **Type Check:** `bun run check --filter=@beep/schema` passes successfully

---

## Critical Discovery: The Root Cause

Analysis of `@effect/sql/Model` and `@effect/experimental/VariantSchema` reveals the fundamental issue: **The DSL uses `S.Struct.Fields` but should use `VariantSchema.Struct.Fields`**.

### The Key Difference

**Effect Schema's `S.Struct.Fields`:**
```typescript
// Only accepts Schema or PropertySignature
type Field = S.Schema.All | S.PropertySignature.All
```

**VariantSchema's `Struct.Fields`:**
```typescript
// INCLUDES Field<any> - the variant field type!
export type Fields = {
  readonly [key: string]:
    | Schema.Schema.All
    | Schema.PropertySignature.All
    | Field<any>        // <-- This is the key!
    | Struct<any>
    | undefined
}
```

The DSL's Model uses `S.Struct.Fields` as the constraint, but `Field(M.Generated(S.String), {...})` returns a type that extends `VariantSchema.Field`, which isn't in `S.Struct.Fields` but IS in `VariantSchema.Struct.Fields`.

---

## Reference Patterns from Effect Source

### Pattern 1: How @effect/sql/Model Works

`@effect/sql/Model` is remarkably simple - it just uses `VariantSchema.make()`:

```typescript
// From packages/sql/src/Model.ts
const {
  Class,
  Field,
  FieldExcept,
  FieldOnly,
  Struct,
  Union,
  extract,
  fieldEvolve,
  fieldFromKey
} = VariantSchema.make({
  variants: ["select", "insert", "update", "json", "jsonCreate", "jsonUpdate"],
  defaultVariant: "select"
})

// Then just re-exports them!
export { Class, Field, FieldExcept, FieldOnly, ... }
```

### Pattern 2: The Class Return Type

The `Class` factory in `VariantSchema.make()` returns an intersection type:

```typescript
readonly Class: <Self = never>(
  identifier: string
) => <const Fields extends Struct.Fields>(
  fields: Fields & Struct.Validate<Fields, Variants[number]>,
  annotations?: Schema.Annotations.Schema<Self>
) => [Self] extends [never] ? MissingSelfGeneric
  :
    // Base class with schema methods
    & ClassFromFields<Self, Fields, ExtractFields<Default, Fields, true>>
    // Variant accessors as static properties
    & { readonly [V in Variants[number]]: Extract<V, Struct<Fields>> }
```

Key observations:
1. Uses `Struct.Fields` (VariantSchema's, not Effect Schema's)
2. Uses `ExtractFields<Default, Fields, true>` for the base class schema fields
3. Adds variant accessors via mapped type intersection

### Pattern 3: ExtractFields Type (Canonical)

```typescript
export type ExtractFields<V extends string, Fields extends Struct.Fields, IsDefault = false> = {
  readonly [
    K in keyof Fields as [Fields[K]] extends [Field<infer Config>]
      ? V extends keyof Config ? K : never
      : K
  ]: [Fields[K]] extends [Struct<infer _>]
    ? Extract<V, Fields[K], IsDefault>
    : [Fields[K]] extends [Field<infer Config>]
      ? [Config[V]] extends [Schema.Schema.All | Schema.PropertySignature.All]
        ? Config[V]
        : never
      : [Fields[K]] extends [Schema.Schema.All | Schema.PropertySignature.All]
        ? Fields[K]
        : never
}
```

Note the patterns:
- Tuple wrapping: `[Fields[K]] extends [Field<infer Config>]`
- Key filtering in `as` clause
- Nested struct handling with recursive `Extract`
- Safe config access with guard

### Pattern 4: The Field and Struct Types

```typescript
export interface Field<in out A extends Field.Config> extends Pipeable {
  readonly [FieldTypeId]: FieldTypeId
  readonly schemas: A
}

export interface Struct<in out A extends Field.Fields> extends Pipeable {
  readonly [TypeId]: A
}
```

---

## Recommended Fix: Mirror VariantSchema Patterns

### Step 1: Create DSL Struct.Fields Type

Replace usage of `S.Struct.Fields` with a custom type that includes DSLVariantField:

```typescript
// In types.ts
export declare namespace DSL {
  export type Fields = {
    readonly [key: string]:
      | S.Schema.All
      | S.PropertySignature.All
      | DSLField<any, any, any, ColumnDef>
      | DSLVariantField<VariantSchema.Field.Config, ColumnDef>
      | undefined
  }
}
```

### Step 2: Update Model Return Type to Use Intersection Pattern

```typescript
export const Model = <Self = never>(identifier: string) =>
  <const Fields extends DSL.Fields>(
    fields: Fields,
    annotations?: S.Annotations.Schema<Self>
  ): [Self] extends [never]
    ? MissingSelfGeneric<`("${typeof identifier}")`>
    :
      // Base class functionality
      & ModelClass<Self, Fields, string, ExtractColumnsType<Fields>, readonly string[], typeof identifier>
      // Variant accessors via mapped type
      & { readonly [V in ModelVariant]: S.Struct<S.Simplify<ExtractVariantFields<V, Fields>>> }
```

### Step 3: Fix ExtractVariantFields to Check DSLVariantField First

The current implementation checks `DSLVariantField` but needs to also handle the case where the field is a raw `VariantSchema.Field` (from M.Generated, etc.):

```typescript
export type ExtractVariantFields<V extends ModelVariant, Fields extends DSL.Fields> = {
  readonly [K in keyof Fields as ShouldIncludeField<V, Fields[K]> extends true ? K : never]:
    ExtractFieldSchema<V, Fields[K]>
}

export type ShouldIncludeField<V extends string, F> =
  // Check DSLVariantField wrapper
  [F] extends [DSLVariantField<infer Config, ColumnDef>]
    ? V extends keyof Config ? true : false
  // Check raw VariantSchema.Field (from @effect/experimental)
  : [F] extends [VariantSchema.Field<infer Config>]
    ? V extends keyof Config ? true : false
  // Plain fields included in all variants
  : true

export type ExtractFieldSchema<V extends string, F> =
  // DSLVariantField (has column metadata)
  [F] extends [DSLVariantField<infer Config, ColumnDef>]
    ? V extends keyof Config
      ? [Config[V]] extends [S.Schema.All | S.PropertySignature.All] ? Config[V] : never
      : never
  // Raw VariantSchema.Field
  : [F] extends [VariantSchema.Field<infer Config>]
    ? V extends keyof Config
      ? [Config[V]] extends [S.Schema.All | S.PropertySignature.All] ? Config[V] : never
      : never
  // DSLField (plain schema with column metadata)
  : [F] extends [DSLField<infer A, infer I, infer R, ColumnDef>]
    ? S.Schema<A, I, R>
  // Plain Schema
  : [F] extends [S.Schema.All]
    ? F
  // PropertySignature
  : [F] extends [S.PropertySignature.All]
    ? F
  : never
```

### Step 4: Handle Base Class Schema Computation

The base class needs `S.Struct.Fields` for the constructor. Compute select variant fields first:

```typescript
export type SelectVariantFields<Fields extends DSL.Fields> =
  S.Simplify<ExtractVariantFields<"select", Fields>>

export interface ModelClass<Self, Fields extends DSL.Fields, ...>
  extends S.Schema<Self, S.Struct.Encoded<SelectVariantFields<Fields>>, S.Struct.Context<SelectVariantFields<Fields>>>,
    ModelStatics<...> {
  new (
    props: S.Struct.Constructor<SelectVariantFields<Fields>>,
    options?: { readonly disableValidation?: boolean }
  ): S.Struct.Type<SelectVariantFields<Fields>>

  readonly fields: SelectVariantFields<Fields>
  // ...
}
```

---

## Alternative: Leverage VariantSchema.make() Directly

Instead of reimplementing the type system, consider wrapping `VariantSchema.make()`:

```typescript
const VS = VariantSchema.make({
  variants: MODEL_VARIANTS,
  defaultVariant: "select" as const,
})

// Extend the Class to add column metadata
export const Model = <Self = never>(identifier: string) =>
  <const Fields extends VariantSchema.Struct.Fields>(
    fields: Fields,
    annotations?: S.Annotations.Schema<Self>
  ) => {
    // Use VS.Class for the base type system
    const BaseClass = VS.Class<Self>(identifier)(fields, annotations)

    // Add DSL-specific metadata
    const columns = extractColumnsFromFields(fields)
    // ...

    return BaseClass as typeof BaseClass & DSLStatics<Fields>
  }
```

This approach:
- Inherits all correct typing from VariantSchema
- Only adds DSL-specific metadata (columns, primaryKey, tableName)
- Avoids reimplementing complex type calculations

---

## Drizzle Adapter Investigation

The Drizzle table types showing `[p: string]: PgColumn<{...}>` is likely caused by:

1. `ExtractColumnsType` using `S.Struct.Fields` constraint
2. Column extraction failing to get specific types when DSLVariantField is involved

**Fix approach:**
```typescript
export type ExtractColumnsType<Fields extends DSL.Fields> = {
  readonly [K in keyof Fields]:
    // Check DSLVariantField first (has ColumnMetaSymbol)
    [Fields[K]] extends [DSLVariantField<any, infer C>]
      ? C
    // Then DSLField
    : [Fields[K]] extends [DSLField<any, any, any, infer C>]
      ? C
    // Fallback
    : ColumnDef<"string", false, false, false, false>
}
```

---

## Files to Modify

### Primary (Type Definitions)
- `packages/common/schema/src/integrations/sql/dsl/types.ts`
  - Add `DSL.Fields` namespace/type
  - Update `ModelClassWithVariants` to use intersection pattern
  - Update `ExtractVariantFields`, `ShouldIncludeField`, `ExtractFieldSchema`

### Secondary (Function Signatures)
- `packages/common/schema/src/integrations/sql/dsl/Model.ts`
  - Update Model function signature to use `DSL.Fields`
  - Update `ExtractColumnsType` and `ExtractPrimaryKeys`

### Adapters
- `packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts`
  - Verify column type extraction works with new types

### Tests
- `packages/common/schema/test/integrations/sql/dsl/variant-integration.test.ts`
  - Remove `@ts-nocheck` once types are fixed
  - Add type-level assertions

---

## Commands

```bash
# Type check
bun run check --filter=@beep/schema

# Run DSL tests
cd packages/common/schema && bun test test/integrations/sql/dsl/

# Interactive type inspection
cd packages/common/schema && bunx tsc --noEmit --pretty
```

---

## Summary

**What was fixed:**
- Tuple wrapping in `ShouldIncludeField` and `ExtractFieldSchema`
- Type check passes, all runtime tests pass

**Root cause identified:**
- DSL uses `S.Struct.Fields` which doesn't include `Field<any>`
- Should use `VariantSchema.Struct.Fields` pattern which does

**Recommended approach:**
1. Create `DSL.Fields` type that includes DSLVariantField
2. Mirror the intersection pattern from VariantSchema.Class return type
3. Fix variant extraction to handle both DSLVariantField and raw VariantSchema.Field
4. Consider leveraging VariantSchema.make() directly for core typing
