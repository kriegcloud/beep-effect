# Type-Level Generics for Literal Preservation - Research Report

## Executive Summary

This report documents TypeScript type-level patterns for implementing `ModelBuilder.create()` with literal type preservation. The implementation must merge default fields with user-provided fields while preserving specific column type literals ("uuid", "timestamp", etc.) throughout the composition chain.

**Key Finding**: The codebase employs a sophisticated combination of `const` type parameters, conditional types with tuple wrapping, and curried functions to capture and preserve literal types through multi-stage transformations.

## Problem Statement

We need to implement a ModelBuilder that:

1. Accepts default fields with literal column types (e.g., `{ id: { type: "uuid" } }`)
2. Accepts user fields that may override defaults with their own literal types
3. Produces a merged type where user overrides preserve their exact literal types
4. Ensures the type system recognizes `{ type: "uuid" }` as distinct from `{ type: "timestamp" }`

**Failure Mode**: Without proper patterns, TypeScript widens literal types to their union (`ColumnType.Type`), losing precision and breaking type-safe validation.

## Research Sources

### 1. DSL Implementation Files Examined

- **types.ts** (lines 1-1355): Core type-level utilities, column type derivation, validation types
- **combinators.ts** (lines 1-490): Pipe-friendly DSL combinators with `MergeColumnDef` pattern
- **Field.ts** (lines 1-334): Curried field factory with `const` type parameters
- **Model.ts** (lines 1-526): Model factory using `const` constraints for field preservation

### 2. Key Type-Level Patterns Identified

From analysis of the DSL implementation, five critical patterns enable literal preservation:

## Pattern 1: `const` Type Parameters for Literal Capture

### Signature Pattern

```typescript
// From Field.ts (line 103)
export type SchemaConfiguratorWithSchema<Schema extends S.Schema.All> =
  <const C extends Partial<ColumnDef> = {}>(
    config?: FieldConfig<C>
  ) => /* return type */

// From Field.ts (line 247)
export function Field<A, I, R>(
  input: S.Schema<A, I, R>
): <const C extends Partial<ColumnDef> = {}>(
  config?: FieldConfig<C>
) => DSLField</* ... */>
```

### How It Works

The `const` modifier on type parameters instructs TypeScript to:
1. **Infer the narrowest possible literal type** from the argument
2. **Prevent automatic widening** to the base type
3. **Preserve exact object shapes** including literal property values

**Without `const`**:
```typescript
// User writes: Field(S.String)({ column: { type: "uuid" } })
// TypeScript infers: C = { column: { type: ColumnType.Type } }
//                                            ^^^^^^^^^^^^^^^^ widened to union!
```

**With `const`**:
```typescript
// User writes: Field(S.String)({ column: { type: "uuid" } })
// TypeScript infers: C = { column: { type: "uuid" } }
//                                            ^^^^^^ preserved as literal!
```

### Integration with ColumnDef

```typescript
// From types.ts (line 815-827)
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

The generic parameters allow `ColumnDef<"uuid", true, false, false>` to be a distinct type from `ColumnDef<"timestamp", false, false, false>`, enabling precise type checking.

## Pattern 2: Conditional Types for Override Merging

### The `MergeColumnDef` Type

From combinators.ts (lines 96-114):

```typescript
type MergeColumnDef<
  Existing extends Partial<ColumnDef>,
  New extends Partial<ColumnDef>
> = ExactColumnDef<{
  readonly type: New extends { type: infer T }
    ? T
    : Existing extends { type: infer T }
      ? T
      : "string";
  readonly primaryKey: New extends { primaryKey: infer PK }
    ? PK
    : Existing extends { primaryKey: infer PK }
      ? PK
      : false;
  readonly unique: New extends { unique: infer U }
    ? U
    : Existing extends { unique: infer U }
      ? U
      : false;
  readonly autoIncrement: New extends { autoIncrement: infer AI }
    ? AI
    : Existing extends { autoIncrement: infer AI }
      ? AI
      : false;
  readonly defaultValue: New extends { defaultValue: infer DV }
    ? DV
    : Existing extends { defaultValue: infer DV }
      ? DV
      : undefined;
}>;
```

### Merge Semantics

This type implements a **property-level override strategy**:

1. **Check `New` first**: If the property exists in `New`, use that type
2. **Fall back to `Existing`**: If not in `New`, check `Existing`
3. **Use default**: If neither has the property, apply the default literal

**Critical Insight**: Using `infer` within conditional types preserves the exact inferred type, including literal refinements.

### Example Type Flow

```typescript
// Starting state
type DefaultField = ColumnDef<"uuid", true, false, false>;
type UserField = Partial<ColumnDef> & { type: "timestamp" };

// After MergeColumnDef<DefaultField, UserField>
type Merged = ColumnDef<"timestamp", true, false, false>;
//                       ^^^^^^^^^^^ user override preserved
//                                   ^^^^ default preserved
```

## Pattern 3: Tuple Wrapping to Prevent Distribution

### The Problem: Distributive Conditional Types

By default, TypeScript distributes conditional types over unions:

```typescript
// Without tuple wrapping
type Test<T> = T extends string ? "yes" : "no";
type Result = Test<"a" | "b">;
// Distributes to: Test<"a"> | Test<"b"> = "yes" | "yes" = "yes"
```

This breaks pattern matching when checking for specific interfaces.

### The Solution: Tuple Wrapping

From types.ts (lines 976-987):

```typescript
export type ShouldIncludeField<V extends string, F> =
  [F] extends [DSLVariantField<infer Config, any>]  // ← Tuple wrapper
    ? V extends keyof Config
      ? true
      : false
    : [F] extends [VariantSchema.Field<infer Config>]  // ← Tuple wrapper
      ? V extends keyof Config
        ? true
        : false
      : true;
```

**How Tuple Wrapping Works**:

```typescript
// Without tuple wrapping - distributes
type Bad<T> = T extends DSLField ? "field" : "not";
type Test1 = Bad<DSLField | Schema>;
// Distributes: Bad<DSLField> | Bad<Schema> = "field" | "not"

// With tuple wrapping - checks entire union
type Good<T> = [T] extends [DSLField] ? "field" : "not";
type Test2 = Good<DSLField | Schema>;
// No distribution: [DSLField | Schema] extends [DSLField] = false = "not"
```

**Usage in DSL**: Tuple wrapping ensures that when checking if a field is a `DSLVariantField`, the type system doesn't distribute over union types, allowing exact type matches.

## Pattern 4: Type Parameter Capture Through Currying

### Two-Stage Type Inference

The Field factory uses currying to capture type information at different stages:

```typescript
// Stage 1: Capture the schema type
export function Field<Schema extends S.Schema.All>(
  schema: Schema  // ← Schema type parameter captured here
): /* Stage 2 function */

// Stage 2: Capture the config literals
SchemaConfiguratorWithSchema<Schema> =
  <const C extends Partial<ColumnDef> = {}>(
    config?: FieldConfig<C>  // ← Config literals captured here
  ) => DSLField</* uses both Schema and C */>;
```

### Why Currying Matters

**Single-function approach** (doesn't work):
```typescript
function Field<Schema, const C>(
  schema: Schema,
  config?: FieldConfig<C>
): DSLField<Schema, C>
//          ^^^^^^ Type parameter 'Schema' shadows captured type
```

TypeScript cannot apply `const` to the first parameter while also capturing its type for the second parameter's constraints.

**Curried approach** (works):
```typescript
// Call 1: Captures Schema type, returns configurator
Field(S.String)

// Call 2: const C captures exact literal config
({ column: { type: "uuid" } })
//                  ^^^^^^ preserved as literal!
```

### Type Flow Through Currying

From Field.ts (lines 103-116):

```typescript
export type SchemaConfiguratorWithSchema<Schema extends S.Schema.All> =
  <const C extends Partial<ColumnDef> = {}>(
    config?: FieldConfig<C>
  ) => C extends { type: ColumnType.Type }
    ? ValidateSchemaColumn<
        S.Schema.Encoded<Schema>,
        C["type"],  // ← Literal type from const C
        DSLField<
          S.Schema.Type<Schema>,
          S.Schema.Encoded<Schema>,
          S.Schema.Context<Schema>,
          ExactColumnDef<C>  // ← Exact config with literals
        >
      >
    : DSLField<
        S.Schema.Type<Schema>,
        S.Schema.Encoded<Schema>,
        S.Schema.Context<Schema>,
        DerivedColumnDefFromSchema<Schema, C>  // ← Schema-derived types
      >;
```

**Key Insight**: The first call captures `Schema` as a type parameter, allowing the second call's `const C` to reference it in conditional types while preserving literal types.

## Pattern 5: `MergeColumnDef` - Field Override Implementation

### Complete Type Definition

From combinators.ts (lines 96-114), repeated for analysis:

```typescript
type MergeColumnDef<
  Existing extends Partial<ColumnDef>,
  New extends Partial<ColumnDef>
> = ExactColumnDef<{
  readonly type: New extends { type: infer T }
    ? T
    : Existing extends { type: infer T }
      ? T
      : "string";
  readonly primaryKey: New extends { primaryKey: infer PK }
    ? PK
    : Existing extends { primaryKey: infer PK }
      ? PK
      : false;
  readonly unique: New extends { unique: infer U }
    ? U
    : Existing extends { unique: infer U }
      ? U
      : false;
  readonly autoIncrement: New extends { autoIncrement: infer AI }
    ? AI
    : Existing extends { autoIncrement: infer AI }
      ? AI
      : false;
  readonly defaultValue: New extends { defaultValue: infer DV }
    ? DV
    : Existing extends { defaultValue: infer DV }
      ? DV
      : undefined;
}>;
```

### Usage in Combinators

Each combinator (uuid, string, integer, etc.) uses `MergeColumnDef` to layer new properties onto existing column metadata:

```typescript
// From combinators.ts (lines 176-182)
export const uuid = <A, I, R, C extends ColumnDef = never>(
  self: S.Schema<A, I, R> | DSLField<A, I, R, C>
): ValidateSchemaColumn<
  I,
  "uuid",
  DSLField<A, I, R, MergeColumnDef<
    ResolveColumnDef<S.Schema<A, I, R>, C>,
    { type: "uuid" }
  >>
> => attachColumnDef(self, ColumnType.parameterize.uuid) as any;
```

### Resolver Pattern: `ResolveColumnDef`

From combinators.ts (line 79):

```typescript
type ResolveColumnDef<Schema, C> =
  [C] extends [never]
    ? DerivedDefaultColumnDef<Schema>
    : C;
```

**Logic**:
1. **If `C` is `never`** (no existing metadata): Derive column type from schema
2. **Otherwise**: Use the existing column definition

This allows chaining: `S.String.pipe(DSL.uuid, DSL.primaryKey)` where each step merges onto the previous.

### Merge Example: Chained Combinators

```typescript
// Start: S.String (no column metadata)
// C = never

// Step 1: DSL.uuid
ResolveColumnDef<S.String, never>
  = DerivedDefaultColumnDef<S.String>
  = { type: "string", primaryKey: false, unique: false, autoIncrement: false, defaultValue: undefined }

MergeColumnDef<
  { type: "string", primaryKey: false, unique: false, autoIncrement: false, defaultValue: undefined },
  { type: "uuid" }
>
  = { type: "uuid", primaryKey: false, unique: false, autoIncrement: false, defaultValue: undefined }

// Step 2: DSL.primaryKey
MergeColumnDef<
  { type: "uuid", primaryKey: false, unique: false, autoIncrement: false, defaultValue: undefined },
  { primaryKey: true }
>
  = { type: "uuid", primaryKey: true, unique: false, autoIncrement: false, defaultValue: undefined }
  //        ^^^^^^ literal preserved        ^^^^ override applied
```

## Recommended Approach for ModelBuilder

### Architecture Overview

Based on the DSL patterns, the ModelBuilder should employ:

1. **Curried factory function** for capturing type parameters at different stages
2. **`const` type parameters** for preserving literal types in user config
3. **`MergeColumnDef`-style merging** for combining defaults with user fields
4. **Tuple wrapping** for conditional type checks on field unions

### Proposed Type Signature

```typescript
export const ModelBuilder = {
  /**
   * Stage 1: Capture default fields
   */
  create: <const Defaults extends Record<string, DSLField<any, any, any, ColumnDef>>>(
    defaults: Defaults
  ) => ({
    /**
     * Stage 2: Capture user fields with const preservation
     */
    with: <const UserFields extends Record<string, DSLField<any, any, any, ColumnDef>>>(
      userFields: UserFields
    ) => {
      // Merged type: user fields override defaults, preserving literals
      type Merged = MergeFields<Defaults, UserFields>;
      return /* Merged fields */;
    }
  })
};
```

### Type-Level Field Merging

```typescript
/**
 * Merges user fields over defaults, preserving literal column types.
 *
 * Strategy:
 * 1. Spread defaults
 * 2. Spread user fields (overrides defaults)
 * 3. Use conditional types to merge ColumnDef for each field
 */
type MergeFields<
  Defaults extends Record<string, DSLField<any, any, any, ColumnDef>>,
  UserFields extends Record<string, DSLField<any, any, any, ColumnDef>>
> = {
  // All fields from defaults
  readonly [K in keyof Defaults]:
    K extends keyof UserFields
      ? MergeField<Defaults[K], UserFields[K]>  // Override
      : Defaults[K];  // Keep default
} & {
  // User-only fields (not in defaults)
  readonly [K in Exclude<keyof UserFields, keyof Defaults>]: UserFields[K];
};

/**
 * Merges two DSLFields, with UserField taking precedence.
 * Preserves literal types through conditional extraction.
 */
type MergeField<
  DefaultField extends DSLField<any, any, any, ColumnDef>,
  UserField extends DSLField<any, any, any, ColumnDef>
> =
  // Extract column defs
  DefaultField extends DSLField<infer A, infer I, infer R, infer DefaultCol>
    ? UserField extends DSLField<infer UA, infer UI, infer UR, infer UserCol>
      ? DSLField<
          UA,  // Use user schema types
          UI,
          UR,
          MergeColumnDef<DefaultCol, UserCol>  // Merge column metadata
        >
      : UserField  // Fallback to user field as-is
    : UserField;  // Fallback to user field as-is
```

### Implementation Example

```typescript
// Usage
const defaults = ModelBuilder.create({
  id: S.String.pipe(DSL.uuid, DSL.primaryKey),
  createdAt: S.String.pipe(DSL.datetime),
});

const customModel = defaults.with({
  // Override 'createdAt' with timestamp type
  createdAt: S.String.pipe(DSL.datetime, DSL.defaultValue("now()")),
  // Add new field
  name: S.String.pipe(DSL.string),
});

// Type result:
// {
//   id: DSLField<string, string, never, ColumnDef<"uuid", true, false, false>>,
//   createdAt: DSLField<string, string, never, ColumnDef<"datetime", false, false, false>>,
//   //                                                    ^^^^^^^^^^^ user override preserved
//   name: DSLField<string, string, never, ColumnDef<"string", false, false, false>>,
// }
```

## Trade-offs and Alternatives

### Approach 1: Curried Factory (Recommended)

**Pros**:
- Preserves literal types through `const` parameters
- Follows Effect DSL patterns (Field, Model)
- Composable and extensible
- Type-safe merging with compile-time validation

**Cons**:
- Requires two-step call syntax
- More complex type definitions
- Requires understanding of `const` type parameters

**When to Use**: This is the standard pattern for Effect-based DSLs. Use when literal preservation and type safety are critical.

### Approach 2: Single-Function with Variadic Generics

```typescript
function createModel<
  const D extends Record<string, any>,
  const U extends Record<string, any>
>(defaults: D, userFields: U): MergeFields<D, U>
```

**Pros**:
- Simpler call site
- Single function signature

**Cons**:
- Cannot apply `const` to first parameter and capture its type for second
- Literal types may be widened in defaults
- Less composable

**When to Use**: For simpler cases where literal preservation in defaults is not critical.

### Approach 3: Builder Class with Method Chaining

```typescript
class ModelBuilder<Fields> {
  withDefaults<const D>(defaults: D): ModelBuilder<Fields & D>
  withFields<const U>(fields: U): ModelBuilder<MergeFields<Fields, U>>
  build(): Fields
}
```

**Pros**:
- Fluent API
- Step-by-step configuration
- Mutable-style builder pattern

**Cons**:
- Not idiomatic for Effect (prefers immutable functions)
- Requires class instantiation overhead
- Type complexity in method chaining

**When to Use**: When API ergonomics favor method chaining over functional composition.

## Integration with beep-effect Architecture

### Alignment with DSL Patterns

The ModelBuilder should follow these DSL conventions:

1. **Export from `@beep/schema/integrations/sql/dsl`**: Place alongside Model, Field factories
2. **Use DSL.Fields constraint**: Accept `DSL.Fields` type for compatibility with Model
3. **Preserve column metadata**: Use `ColumnMetaSymbol` for runtime access
4. **Support variant fields**: Handle both `DSLField` and `DSLVariantField`

### Integration Point

```typescript
// In packages/common/schema/src/integrations/sql/dsl/index.ts
export { ModelBuilder } from "./model-builder.ts";

// Usage in application code
import { Model, Field, ModelBuilder } from "@beep/schema/integrations/sql/dsl";

// Define reusable defaults
const auditFields = ModelBuilder.create({
  createdAt: Field(BS.DateTimeUtcFromAllAcceptable)({
    column: { type: "datetime", defaultValue: "now()" }
  }),
  updatedAt: Field(BS.DateTimeUtcFromAllAcceptable)({
    column: { type: "datetime" }
  }),
});

// Compose into Model
class User extends Model<User>("User")(auditFields.with({
  id: Field(S.UUID)({ column: { type: "uuid", primaryKey: true } }),
  email: Field(S.String)({ column: { type: "string", unique: true } }),
}).fields) {}
```

### Compatibility with Existing Types

The ModelBuilder output must be compatible with:

- `DSL.Fields` constraint in Model factory (line 434 in Model.ts)
- `ExtractColumnsType<Fields>` for column metadata extraction (line 42 in Model.ts)
- `ExtractPrimaryKeys<Fields>` for PK derivation (line 55 in Model.ts)
- Variant field extraction types (lines 961-1019 in types.ts)

## References

### DSL Implementation Files

- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/schema/src/integrations/sql/dsl/types.ts`
  - Lines 96-114: `MergeColumnDef` pattern
  - Lines 815-827: `ColumnDef` interface with generic parameters
  - Lines 976-987: Tuple wrapping in `ShouldIncludeField`

- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/schema/src/integrations/sql/dsl/combinators.ts`
  - Lines 79: `ResolveColumnDef` resolver pattern
  - Lines 96-114: `MergeColumnDef` implementation
  - Lines 176-182: `uuid` combinator with merge logic

- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/schema/src/integrations/sql/dsl/Field.ts`
  - Lines 103-116: `SchemaConfiguratorWithSchema` with `const` parameter
  - Lines 200-240: Curried Field factory implementation
  - Lines 247-254: Function overloads capturing type parameters

- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/schema/src/integrations/sql/dsl/Model.ts`
  - Line 434: `const Fields extends DSL.Fields` parameter
  - Lines 42-51: `ExtractColumnsType` using conditional types
  - Lines 55-67: `ExtractPrimaryKeys` with field filtering

### TypeScript Documentation

- **const type parameters**: TypeScript 5.0+ feature for literal preservation
- **Conditional types**: https://www.typescriptlang.org/docs/handbook/2/conditional-types.html
- **Tuple types**: https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types
- **Type inference**: https://www.typescriptlang.org/docs/handbook/type-inference.html

### Effect Patterns

- Effect Schema class identity checks (lines 295-433 in types.ts)
- VariantSchema integration patterns (lines 354-409 in Model.ts)
- Schema annotation metadata storage (lines 105-122 in Model.ts)

## Conclusion

The DSL implementation demonstrates a robust approach to literal type preservation through:

1. **`const` type parameters** for capturing exact literal values
2. **Curried functions** for multi-stage type inference
3. **Conditional types** with property-level merging via `MergeColumnDef`
4. **Tuple wrapping** to prevent distributive conditional types
5. **Type-level resolver patterns** for handling optional metadata

The recommended ModelBuilder implementation should follow these patterns to ensure:
- Type safety with compile-time validation
- Literal preservation through composition
- Compatibility with existing DSL infrastructure
- Idiomatic Effect-style functional API

These patterns scale to complex use cases while maintaining excellent type inference and error messages, making them ideal for the ModelBuilder feature.
