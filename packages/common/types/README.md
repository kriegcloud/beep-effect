# @beep/types

Compile-time-only TypeScript utility types for the beep-effect monorepo.

## Overview

A zero-runtime package that centralizes reusable TypeScript utility types across all slices. It exists to keep type idioms consistent, deduplicate helpers, and avoid cross-slice coupling through runtime code. This package deliberately ships only types with no runtime values, side effects, or environment assumptions.

## Installation

Internal monorepo package. Import via path alias:

```typescript
import type * as T from "@beep/types";
import type { UtilTypes, StringTypes, SchemaTypes } from "@beep/types";
```

## Type Modules

### Namespaced Exports

The following modules are exported as namespaces (e.g., `FnTypes`, `RecordTypes`):

#### `FnTypes` - Function Type Helpers
Function-focused helpers that wrap Effect predicates for type-safe refinements.

**Key Types:**
- `Guard<A, B>` - Predicate signature that narrows from `A` to refined subtype `B` (re-exports `effect/Predicate.Refinement`)
- `NotGuard<A, B>` - Higher-order helper that builds logical negation of a guard

**Example:**
```typescript
import type { FnTypes } from "@beep/types";

const isString: FnTypes.Guard<unknown, string> = (value): value is string =>
  typeof value === "string";
```

#### `LiteralTypes` - Literal Narrowing
Literal narrowing helpers for enforcing string/number literal constraints.

#### `ModelTypes` - Variant Schema Helpers
Variant Schema field map helpers with non-empty constraints for `@effect/experimental/VariantSchema`.

**Key Types:**
- `ModelStringKeyFields` - Variant Schema field map restricted to non-empty string keys
- `NonEmptyModelFields<Fields>` - Narrows field maps to only variants that provably contain entries

**Example:**
```typescript
import type { ModelTypes } from "@beep/types";
import type { Field } from "@effect/experimental/VariantSchema";

type EntityFields = ModelTypes.NonEmptyModelFields<{
  id: Field.Any;
  name: Field.Any;
}>;
```

#### `MutTypes` - Mutation Utilities
Mutation-oriented escape hatches (use sparingly, mostly for interop tests).

#### `Or` - Union Helpers
Small union helpers for `Maybe` and `Either` style unions.

#### `PromiseTypes` - Async Type Utilities
Async type utilities for effectful adapters.

**Example:**
```typescript
import type { PromiseTypes } from "@beep/types";

type MaybeAsyncConfig = PromiseTypes.Awaitable<{ port: number }>;
```

#### `RecordTypes` - Dictionary Utilities
Record/dictionary helpers with non-empty constraints, key picking, and safe value extraction.

**Key Types:**
- `AnyRecord` - Readonly record with arbitrary string or symbol keys
- `AnyRecordStringKey` - Readonly record where every key is a non-empty string
- `NonEmptyReadonlyRecord<T>` - Records with provably non-empty string keys
- `NonEmptyRecordWithStringKeys<R>` - Ensures record has string keys and at least one entry
- `RecordStringKeyValueString` - Readonly map with non-empty string keys and values
- `NonEmptyRecordStringKeyValues<R>` - Record where every value is a non-empty string literal
- `ReadonlyRecordValuesNonEmptyArray<T>` - Non-empty array of record values
- `ReadonlyRecordEntriesNonEmptyArray<T>` - Non-empty array of `[key, value]` tuples
- `NonEmptyReadonlyRecordStringValues<R>` - Non-empty array of string values from records with non-empty string values
- `ReversedRecord<T>` - Reverses record mapping (values become keys, keys become values)

**Example:**
```typescript
import type { RecordTypes } from "@beep/types";

type SafeMap = RecordTypes.NonEmptyReadonlyRecord<{ id: string }>;
type Headers = RecordTypes.RecordStringKeyValueString & {
  accept: "application/json"
};
```

#### `SchemaTypes` - Effect Schema Aliases
Type-only aliases for Effect Schema plumbing across packages.

**Key Types:**
- `AnySchema` - Effect Schema with arbitrary input/output and context types
- `AnySchemaNoContext` - Variant of `AnySchema` omitting the context parameter

**Example:**
```typescript
import type { SchemaTypes } from "@beep/types";

type AnyEffectStruct = SchemaTypes.AnySchema;
type PlainSchema = SchemaTypes.AnySchemaNoContext;
```

#### `StringTypes` - String Type Utilities
Compile-time string manipulations including non-empty constraints and case transformations.

**Key Types:**
- `NonEmptyString<T>` - String literal that is not the empty string
- `LowercaseNonEmptyString<T>` - Non-empty string literal that is entirely lowercase

**Example:**
```typescript
import type { StringTypes } from "@beep/types";

type DisplayName = StringTypes.NonEmptyString;
type Slug = StringTypes.LowercaseNonEmptyString<"user">;
```

#### `StructTypes` - Struct Shape Helpers
Struct/shape helpers with non-empty constraints for Effect Schema definitions.

**Key Types:**
- `StructFieldsWithStringKeys` - Effect Schema struct fields keyed by non-empty strings
- `NonEmptyStructFields<T>` - Narrows struct fields where keys are provably non-empty
- `NonEmptyReadonlyStructFieldKeys<T>` - Non-empty readonly array of struct field keys
- `ReadonlyNonEmptyRecordKeys<T>` - Non-empty readonly array of keys from non-empty record
- `StructFieldsOrPropertySignatures` - Accepts struct fields or Effect Schema property signatures
- `NonEmptyStructFieldsOrPropertySignatures<T>` - Ensures fields/signatures have non-empty keys

**Example:**
```typescript
import type { StructTypes } from "@beep/types";
import * as S from "effect/Schema";

const fields: StructTypes.StructFieldsWithStringKeys = {
  id: S.String,
  name: S.String
};
```

#### `TagTypes` - Tag/Brand Helpers
Tag/branding helpers for safer nominal typing, aligns with `effect/Brand`.

**Key Types:**
- `SnakeTag<S>` - Validates snake_case tags composed of lowercase letters and underscores
- `Underscore` - Convenience alias for `_` when building composite template literal tags

**Example:**
```typescript
import type { TagTypes } from "@beep/types";

type TenantTag = TagTypes.SnakeTag<"tenant_id">;
```

#### `Thunk<A>` - Zero-Argument Function Type
Direct export for zero-argument function signatures, commonly used for lazy evaluation.

**Type:**
- `Thunk<A>` - Function type `() => A` representing deferred computation

**Example:**
```typescript
import type { Thunk } from "@beep/types";

type LazyConfig = Thunk<{ port: number }>;
const getConfig: LazyConfig = () => ({ port: 3000 });
```

#### `UnsafeTypes` - Escape Hatches
Unavoidable `any`-adjacent helpers wrapped with explicit naming for audits. Use sparingly and review carefully.

#### `UtilTypes` - General-Purpose Utilities
Grab bag of general-purpose building blocks: non-empty maps, tuple helpers, key extraction.

**Key Types:**
- `NonEmptyStringLiteral<S>` - String literal that is not the empty string
- `ReadonlyStringMap<V>` - Readonly dictionary with string keys and value type `V`
- `NonEmptyReadonlyStringKeyRecord<T>` - Readonly record with at least one string key and no empty key
- `ReadonlyStringToStringMap` - Readonly `string -> string` map
- `NonEmptyStringToStringMap<T>` - Non-empty `string -> string` map with no empty keys/values
- `ValuesNonEmptyArray<T>` - Non-empty readonly array of record values
- `StructFieldMap` - Map from string keys to `S.Struct.Field`
- `NonEmptyStructFieldMap<T>` - Non-empty `StructFieldMap` with no empty-string key
- `NonEmptyStructFieldKeyList<T>` - Non-empty readonly array of struct field string keys

**Example:**
```typescript
import type { UtilTypes } from "@beep/types";
import * as S from "effect/Schema";

type Id = UtilTypes.NonEmptyStringLiteral<"foo">;
type Headers = UtilTypes.NonEmptyStringToStringMap<{
  "content-type": "application/json"
}>;

type Fields = UtilTypes.NonEmptyStructFieldMap<{
  id: S.Struct.Field;
  name: S.Struct.Field;
}>;
```

### Direct Exports (Non-Namespaced)

The following types are exported directly without namespace wrapping:

#### `built-in.types.ts`
- `Builtin` - Union of primitive types, Function, Date, Error, RegExp

#### `char.types.ts`
- `UpperLetter` - Template literal helpers for uppercase letters

#### `common.types.ts`
- `BrandWith` - Shared alias for brand/tag construction used by other type modules
- `Prettify<T>` - Flattens intersection types for better IntelliSense display

#### `deep-non-nullable.types.ts`
- `DeepNonNullable<T>` - Recursive non-nullable transformer

#### `primitive.types.ts`
- `PrimitiveTypes` - Union of string, number, boolean, bigint, symbol, undefined, null

#### `prop.type.ts`
- Property key utilities for Effect Schema struct builders (available via subpath export `@beep/types/prop.type`)

**Example:**
```typescript
import type { PrimitiveTypes, Builtin } from "@beep/types";

type SafeValue = Exclude<Builtin, null | undefined>;
```

## Architecture Guidelines

### What Belongs Here

- Pure type aliases and helpers broadly useful across multiple slices
- Zero-runtime constructs only: `type`, `interface`, `declare`, and `export type` namespaces
- Environment-agnostic types: no Node, DOM, React, or platform specifics
- Effect-adjacent type helpers as type-only imports (e.g., `import type * as S from "effect/Schema"`)

### What Must NOT Go Here

- No runtime values of any kind (no functions/consts/classes that exist at runtime)
- No side effects, I/O, or environment reads (no `process`, no globals, no dynamic imports)
- No framework/platform types that create coupling (no Node, DOM, React, Next types)
- No domain-specific types (keep those in the owning slice's `domain` layer)
- No imports from other internal slices (e.g., do not depend on `@beep/iam-*`, `@beep/documents-*`)
- No schema/runtime validators (do not export `effect/Schema` values here—types only are fine)

## Usage Patterns

### Import Guidelines

Prefer type-only imports to ensure the compiler erases them from emitted code:

```typescript
// Recommended: type-only imports
import type { UtilTypes } from "@beep/types";
import type * as T from "@beep/types";

// For Effect modules used in type definitions
import type * as S from "effect/Schema";
```

Never import as a value in contexts that would require bundlers to include this package at runtime.

### Subpath Exports

Individual type modules can be imported directly:

```typescript
import type * as UtilTypes from "@beep/types/util.types";
import type * as StringTypes from "@beep/types/string.types";
import type * as SchemaTypes from "@beep/types/schema.types";
```

## Examples

### Non-Empty String Literal

```typescript
import type { UtilTypes } from "@beep/types";

// "foo" is valid; "" becomes never
type Id = UtilTypes.NonEmptyStringLiteral<"foo">;
```

### Non-Empty Struct Fields for Effect Schema

```typescript
import type { UtilTypes } from "@beep/types";
import type * as S from "effect/Schema";

type F = UtilTypes.NonEmptyStructFieldMap<{
  id: S.Struct.Field;
  name: S.Struct.Field;
}>;
// F is accepted only when the map is provably non-empty and has no empty-string key
```

### Non-Empty String-to-String Map

```typescript
import type { UtilTypes } from "@beep/types";

type Headers = UtilTypes.NonEmptyStringToStringMap<{
  "content-type": "application/json";
}>;
```

### Effect Schema Type Glue

```typescript
import type { SchemaTypes, StringTypes, PromiseTypes } from "@beep/types";
import type * as S from "effect/Schema";

// Glue Effect Schema definitions into reusable typing
type AnyEffectStruct = SchemaTypes.AnySchema;

// Enforce compile-time non-empty string constraints
type DisplayName = StringTypes.NonEmptyString;

// Async type utilities for effect-style adapters
type MaybeAsyncConfig = PromiseTypes.Awaitable<{ port: number }>;
```

## How It Fits the Architecture

### Vertical Slice + Hexagonal

This package is cross-cutting and safe to import from any layer (`domain`, `application`, `api`, `db`, `ui`). Because it contains only types, it cannot accidentally introduce upward/downward runtime dependencies.

### Monorepo Path Alias

Resolved as `@beep/types` in `tsconfig.base.json`. Consumers should import type-only symbols to ensure the compiler erases them from emitted code.

### Ports & Adapters Friendly

Since nothing here executes, it won't leak infrastructure concerns into domain/application code.

## When to Add vs. Keep in Slice

### Add to `@beep/types` when:
- The helper is domain-agnostic, reusable, and purely compile-time
- The type is used across multiple slices or layers
- The type enforces architectural constraints (e.g., non-empty keys)

### Keep in a slice when:
- The type reflects specific domain concepts (entities, value objects)
- The type is tied to use-case I/O or port contracts
- The type is only used within that slice

### Promotion Rule

If a slice-level type proves broadly reusable and still meets the constraints above, consider promoting it here in a follow-up change.

## Testing

Unit tests can live in `test/` but should remain type-focused (e.g., compile-time assertions via `// @ts-expect-error`). Avoid introducing runtime-only test utilities.

```bash
bun run test --filter @beep/types
```

## Development Commands

```bash
# From package directory
bun run check
bun run lint
bun run lint:fix
bun run test
bun run coverage
bun run build
bun run lint:circular

# From monorepo root
bun run --filter @beep/types check
bun run --filter @beep/types lint
bun run --filter @beep/types test
bun run --filter @beep/types build
```

## Constraints Checklist (PR Reviewer Aid)

- [ ] Types only: no emitted JavaScript after build
- [ ] No platform/runtime imports: Node/DOM/React/Next absent
- [ ] No cross-slice imports: depends only on external typings and standard TS
- [ ] No domain leakage: names and shapes are generic, not business-specific
- [ ] Type-only imports: `import type` used for all external types (including Effect types)
- [ ] No runtime exports: inspect generated `build/esm` if unsure
- [ ] All imports are `import type` and namespace Effect modules correctly
- [ ] Helpers remain domain-neutral and additive

## Versioning and Changes

Because this package is widely consumed, prefer additive changes. For breaking changes, update consumers in the same PR or stage changes with clear migration notes.

## FAQ

**Can I put Zod/Effect Schema validators here?**
No—only type-level helpers. Put runtime validators in an appropriate runtime package.

**Can I add a branded domain ID type here?**
Prefer keeping domain IDs in the slice's `domain`. If an identifier pattern is truly generic and cross-cutting, discuss before promoting.

**Why type-only imports?**
They guarantee the package never contributes runtime code to bundles, keeping all layers clean and tree-shakable.

**How do I verify nothing emits at runtime?**
Run `bun run build --filter=@beep/types` and inspect the generated `build/esm` directory. All files should be empty or contain only type declarations.

## Related Packages

- `@beep/utils` - Runtime utility functions (Effect-based)
- `@beep/schema` - Effect Schema utilities and EntityId factories
- `@beep/invariant` - Assertion contracts and tagged error schemas
- `@beep/common/constants` - Schema-backed enums and constants

## Package Metadata

- **Name:** `@beep/types`
- **Version:** 0.0.0
- **License:** MIT
- **Repository:** [kriegcloud/beep-effect](https://github.com/kriegcloud/beep-effect)
- **Homepage:** [Package Directory](https://github.com/kriegcloud/beep-effect/tree/main/packages/common/types)
