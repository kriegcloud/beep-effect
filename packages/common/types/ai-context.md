---
path: packages/common/types
summary: Compile-time TypeScript utilities for Effect codebases - schema types, string transforms, struct helpers
tags: [types, compile-time, effect-schema, zero-runtime]
---

# @beep/types

Compile-time-only type utilities that keep shared type idioms aligned across slices. No runtime symbols leave this package - all exports are erased by bundlers when using `import type`.

## Architecture

```
|-------------------|     |-------------------|     |-------------------|
|   Direct Exports  |     | Namespaced Types  |     |    Consumers      |
|-------------------|     |-------------------|     |-------------------|
| Builtin           |     | SchemaTypes       |---->| @beep/schema      |
| Primitive         |     | StringTypes       |     | @beep/utils       |
| DeepNonNullable   |     | StructTypes       |---->| Domain packages   |
| UpperLetter       |     | RecordTypes       |     | Server factories  |
|-------------------|     | ModelTypes        |     |-------------------|
                          | UnsafeTypes       |
                          | TagTypes          |
                          | LiteralTypes      |
                          | MutTypes          |
                          | Or                |
                          | PromiseTypes      |
                          | UtilTypes         |
                          |-------------------|
```

## Core Modules

| Module | Namespace | Purpose |
|--------|-----------|---------|
| `schema.types.ts` | `SchemaTypes` | Effect Schema aliases (`AnySchema`, `AnySchemaNoContext`) |
| `string.types.ts` | `StringTypes` | Non-empty strings, Snake/Pascal case transforms |
| `struct.types.ts` | `StructTypes` | Struct shape helpers, non-empty maps, key guards |
| `record.types.ts` | `RecordTypes` | Dictionary utils, non-empty records, key picking |
| `model.types.ts` | `ModelTypes` | VariantSchema field map helpers with non-empty constraints |
| `unsafe.types.ts` | `UnsafeTypes` | Explicit `any`-adjacent helpers for auditing |
| `tag.types.ts` | `TagTypes` | Brand/tag constructors aligned with `effect/Brand` |
| `literal.types.ts` | `LiteralTypes` | Literal narrowing, case transformations |
| `mut.types.ts` | `MutTypes` | Mutation escape hatches (use sparingly) |
| `or.types.ts` | `Or` | Union helpers (`Maybe`, `Either` style) |
| `promise.types.ts` | `PromiseTypes` | Async utilities (`Awaitable<T>`) |
| `util.types.ts` | `UtilTypes` | Non-empty maps, tuple helpers, key extraction |
| `built-in.types.ts` | Direct | `Builtin` union (primitive, Function, Date, Error, RegExp) |
| `primitive.types.ts` | Direct | `Primitive` union (string, number, boolean, etc.) |
| `deep-non-nullable.types.ts` | Direct | `DeepNonNullable<T>` recursive transformer |

## Usage Patterns

### Schema Type Glue

```typescript
import type { SchemaTypes, StructTypes } from "@beep/types";
import type * as S from "effect/Schema";

// Reference any Effect Schema without context
type AnyValidator = SchemaTypes.AnySchema;

// Non-empty struct field constraints
type Fields = StructTypes.NonEmptyStructFields<{ id: S.Struct.Field }>;
```

### String Transformations

```typescript
import type { StringTypes, LiteralTypes } from "@beep/types";

// Compile-time non-empty string enforcement
type DisplayName = StringTypes.NonEmptyString;

// Snake to PascalCase at type level
type EntityName = LiteralTypes.CaseTransform.SnakeToPascal<"user_session">;
// Result: "UserSession"
```

### VariantSchema Field Maps

```typescript
import type { ModelTypes } from "@beep/types";
import type { Field } from "@effect/experimental/VariantSchema";

// Guarantee field map is non-empty
type EntityFields = ModelTypes.NonEmptyModelFields<{
  id: Field.Any;
  name: Field.Any;
}>;
```

### Unsafe Type Wrappers

```typescript
import type { UnsafeTypes } from "@beep/types";

// Explicit naming for audit trails when any is unavoidable
type DrizzleClient = UnsafeTypes.UnknownRecord;
type GenericHandler = UnsafeTypes.UnsafeAny;
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Zero runtime footprint | All `export type` ensures bundlers erase everything |
| Namespaced exports | Prevents naming collisions, aids discoverability |
| `import type` requirement | Guarantees no accidental runtime coupling |
| Domain-agnostic | Slice-specific types belong in their own packages |
| Explicit unsafe naming | `UnsafeTypes.UnsafeAny` makes `any` usage auditable |

## Dependencies

**Internal**: None (foundational package)

**External**:
- `effect` - Type references for Schema, Brand
- `@effect/experimental` - VariantSchema Field types

## Related

- **AGENTS.md** - Detailed contributor guidance and authoring guardrails
- `@beep/schema` - Runtime schema utilities that consume these types
- `@beep/utils` - Runtime helpers aligned with type-level contracts
