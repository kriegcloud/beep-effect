# DSL.Model Variant Types Fix - Handoff Prompt

## Problem Statement

The DSL.Model VariantSchema integration is functionally complete (all 59 tests pass), but the **type-level inference for variant accessors is broken**. The variant schemas (`.select`, `.insert`, etc.) are typed as generic indexed types instead of preserving the specific field structure.

### Observed Behavior

```typescript
class ComplexUser extends Model<ComplexUser>("ComplexUser")({
  id: Field(M.Generated(S.String), { column: { type: "uuid", primaryKey: true } }),
  email: Field(S.String, { column: { type: "string", unique: true } }),
  passwordHash: Field(M.Sensitive(S.String), { column: { type: "string" } }),
  tenantId: Field(M.GeneratedByApp(S.String), { column: { type: "uuid" } }),
  bio: Field(M.FieldOption(S.String), { column: { type: "string", nullable: true } }),
}) {}

// ACTUAL TYPE (broken):
ComplexUser.select.fields
// ^? S.Struct<{
//      readonly [x: string]: S.Struct.Field;
//      readonly [x: number]: S.Struct.Field;
//      readonly [x: symbol]: S.Struct.Field;
//    }>

// EXPECTED TYPE:
ComplexUser.select.fields
// ^? {
//      id: S.String,
//      email: S.String,
//      passwordHash: S.String,
//      tenantId: S.String,
//      bio: S.OptionFromNullOr<S.String>
//    }
```

### Root Cause

The `ModelClassWithVariants` interface uses `ExtractVariantFields<V, Fields>` to compute variant field types, but this mapped type is not being properly applied. The type inference chain is breaking somewhere between:

1. `Model<Self>("Name")({ fields })` return type
2. `ModelClassWithVariants<Self, Fields, ...>` interface
3. `readonly select: S.Struct<ExtractVariantFields<"select", Fields>>`

The result is that TypeScript falls back to the generic `S.Struct.Fields` constraint instead of computing the specific field structure.

---

## Files to Investigate

### Primary Files

1. **`packages/common/schema/src/integrations/sql/dsl/types.ts`**
   - `ModelClassWithVariants` interface - defines variant accessors
   - `ExtractVariantFields<V, Fields>` - mapped type for filtering fields
   - `ShouldIncludeField<V, F>` - predicate for field inclusion
   - `ExtractFieldSchema<V, F>` - extracts schema from field for variant

2. **`packages/common/schema/src/integrations/sql/dsl/Model.ts`**
   - `Model()` function return type
   - How `ModelClassWithVariants` is applied to the class

### Reference Implementations

1. **`packages/common/schema/src/core/VariantSchema.ts`** (lines 155-169, 466-508)
   - `ExtractFields<V, Fields>` - working type-level field extraction
   - `Class()` return type - properly typed variant accessors

2. **`node_modules/@effect/sql/src/Model.ts`**
   - `Model.Class()` return type with variant accessors

---

## Current Type Definitions

### ModelClassWithVariants (from types.ts)

```typescript
export interface ModelClassWithVariants<
  Self,
  Fields extends S.Struct.Fields,
  TName extends string,
  Columns extends Record<string, ColumnDef>,
  PK extends readonly string[],
  Id extends string
> extends ModelClass<Self, Fields, TName, Columns, PK, Id> {
  readonly select: S.Struct<ExtractVariantFields<"select", Fields>>;
  readonly insert: S.Struct<ExtractVariantFields<"insert", Fields>>;
  readonly update: S.Struct<ExtractVariantFields<"update", Fields>>;
  readonly json: S.Struct<ExtractVariantFields<"json", Fields>>;
  readonly jsonCreate: S.Struct<ExtractVariantFields<"jsonCreate", Fields>>;
  readonly jsonUpdate: S.Struct<ExtractVariantFields<"jsonUpdate", Fields>>;
}
```

### ExtractVariantFields (from types.ts)

```typescript
export type ExtractVariantFields<
  V extends ModelVariant,
  Fields extends S.Struct.Fields
> = {
  readonly [K in keyof Fields as ShouldIncludeField<V, Fields[K]> extends true ? K : never]:
    ExtractFieldSchema<V, Fields[K]>;
};

type ShouldIncludeField<V extends string, F> =
  F extends DSLVariantField<infer Config, any>
    ? V extends keyof Config ? true : false
    : true;

type ExtractFieldSchema<V extends string, F> =
  F extends DSLVariantField<infer Config, any>
    ? V extends keyof Config ? Config[V] : never
    : F extends DSLField<any, any, any, any> ? F : F;
```

### Model() Return Type (from Model.ts)

```typescript
export const Model = <Self = never>(identifier: string) =>
  <const Fields extends S.Struct.Fields>(
    fields: Fields,
    annotations?: S.Annotations.Schema<Self>
  ): [Self] extends [never]
    ? MissingSelfGeneric<...>
    : ModelClassWithVariants<Self, Fields, string, ExtractColumnsType<Fields>, readonly string[], typeof identifier>
```

---

## Known Issues

### Issue 1: Fields Generic Not Preserved Through Model()

The `const Fields` generic parameter may not be flowing correctly through the function chain. The `S.Class()` call might be widening the type.

### Issue 2: DSLVariantField Detection in Mapped Type

The `ShouldIncludeField` predicate checks for `DSLVariantField<infer Config, any>`, but the actual runtime fields may be:
- `VariantSchema.Field<Config>` from `@effect/experimental` (for M.Generated, M.Sensitive)
- `DSLVariantField<Config, C>` from the DSL wrapper
- Plain `DSLField<A, I, R, C>` or `S.Schema`

The type may not be correctly detecting all variant field cases.

### Issue 3: ExtractFieldSchema Not Extracting Correctly

When extracting the schema for a variant from `Config[V]`, the result may not be correctly typed. Need to verify:
- That `Config` is properly inferred from the variant field
- That `Config[V]` returns the correct schema type
- That the schema type is compatible with `S.Struct.Field`

---

## Suggested Approach

### Step 1: Verify Field Type Detection

Create type-level tests to verify `ShouldIncludeField` works:

```typescript
import * as M from "@effect/sql/Model";
import * as ExpVS from "@effect/experimental/VariantSchema";

// Test: Does ShouldIncludeField detect M.Generated correctly?
type TestGenerated = ShouldIncludeField<"insert", M.Generated<S.String>>;
//   ^? Should be: false (Generated excludes insert)

type TestPlain = ShouldIncludeField<"insert", DSLField<string, string, never, ColumnDef>>;
//   ^? Should be: true
```

### Step 2: Fix VariantField Type Detection

The issue may be that `DSLVariantField` is too narrow. The predicate needs to also check for:

```typescript
type ShouldIncludeField<V extends string, F> =
  // Check DSLVariantField wrapper
  F extends DSLVariantField<infer Config, any>
    ? V extends keyof Config ? true : false
  // Check raw VariantSchema.Field (from @effect/experimental)
  : F extends ExpVS.Field<infer Config>
    ? V extends keyof Config ? true : false
  // Plain fields included in all variants
  : true;
```

### Step 3: Reference VariantSchema.ExtractFields

The working implementation in `VariantSchema.ts` (lines 155-169) should be the template:

```typescript
export type ExtractFields<V extends string, Fields extends Struct.Fields, IsDefault = false> = {
  readonly [K in keyof Fields as [Fields[K]] extends [Field<infer Config>]
    ? V extends keyof Config
      ? K
      : never
    : K]: [Fields[K]] extends [Struct<infer _>]
    ? Extract<V, Fields[K], IsDefault>
    : [Fields[K]] extends [Field<infer Config>]
      ? [Config[V]] extends [S.Schema.All | S.PropertySignature.All]
        ? Config[V]
        : never
      : [Fields[K]] extends [S.Schema.All | S.PropertySignature.All]
        ? Fields[K]
        : never;
};
```

Key differences to note:
- Uses `[Fields[K]] extends [Field<...>]` pattern (wrapped in tuple for distributive conditional type control)
- Handles nested `Struct` recursively
- Falls back to original field for plain schemas

### Step 4: Ensure const Generic Preservation

The `Model()` function must preserve literal types:

```typescript
export const Model = <Self = never>(identifier: string) =>
  <const Fields extends S.Struct.Fields>(  // 'const' is critical
    fields: Fields,
    ...
  ): ModelClassWithVariants<Self, Fields, ...>  // Fields must flow through
```

Check that intermediate transformations don't widen `Fields` to `S.Struct.Fields`.

---

## Verification

After fixing, these type assertions should work:

```typescript
class User extends Model<User>("User")({
  id: Field(M.Generated(S.String), { column: { type: "uuid" } }),
  name: Field(S.String, { column: { type: "string" } }),
}) {}

// Verify select has all fields
type SelectFields = typeof User.select.fields;
type SelectKeys = keyof SelectFields;
//   ^? "id" | "name"

// Verify insert excludes Generated
type InsertFields = typeof User.insert.fields;
type InsertKeys = keyof InsertFields;
//   ^? "name" (no "id")

// Verify field schema types are preserved
type IdType = SelectFields["id"];
//   ^? S.String (not S.Struct.Field)
```

---

## Commands

```bash
# Type check
bun run check --filter=@beep/schema

# Run tests
cd packages/common/schema && bun test test/integrations/sql/dsl/

# Inspect types interactively
cd packages/common/schema && bunx tsc --noEmit --pretty
```

---

## Success Criteria

1. `User.select.fields` shows `{ id: S.String, name: S.String }` not generic index signature
2. `User.insert.fields` shows `{ name: S.String }` (no `id` for Generated)
3. `User.json.fields` excludes Sensitive fields
4. All 59 existing tests continue to pass
5. Type check passes

---

## Context Files

- Implementation: `packages/common/schema/src/integrations/sql/dsl/`
- Tests: `packages/common/schema/test/integrations/sql/dsl/`
- VariantSchema reference: `packages/common/schema/src/core/VariantSchema.ts`
- Original prompt: `.specs/dsl-variant-schema-feature/dsl-variant-schema-feature.prompt.md`
