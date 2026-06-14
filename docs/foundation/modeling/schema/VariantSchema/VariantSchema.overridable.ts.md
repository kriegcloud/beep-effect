---
title: VariantSchema.overridable.ts
nav_order: 219
parent: "@beep/schema"
---

## VariantSchema.overridable.ts overview

Internal schema module support.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [Overridable](#overridable)
  - [Override](#override)
  - [Overrideable](#overrideable)
- [schemas](#schemas)
  - [Overridable (interface)](#overridable-interface)
  - [Overrideable (interface)](#overrideable-interface)
---

# constructors

## Overridable

Adds an Effect-backed constructor default while preserving explicit override
values.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import * as VariantSchema from "@beep/schema/VariantSchema"

const field = VariantSchema.Overridable(S.String, {
  defaultValue: Effect.succeed("generated")
})

console.log(field.ast._tag)
```

**Signature**

```ts
declare const Overridable: { <S extends S.Top & S.WithoutConstructorDefault>(options: { readonly defaultValue: Effect.Effect<S["~type.make.in"]>; }): (schema: S) => Overridable<S>; <S extends S.Top & S.WithoutConstructorDefault>(schema: S, options: { readonly defaultValue: Effect.Effect<S["~type.make.in"]>; }): Overridable<S>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/VariantSchema/VariantSchema.overridable.ts#L82)

Since v0.0.0

## Override

Marks a value as an explicit override for an overridable schema field.

**Example**

```ts
import * as VariantSchema from "@beep/schema/VariantSchema"

const value = VariantSchema.Override("custom")
console.log(value)
```

**Signature**

```ts
declare const Override: <A>(value: A) => A & Brand<"Override">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/VariantSchema/VariantSchema.overridable.ts#L25)

Since v0.0.0

## Overrideable

Upstream-compatible alias for `Overridable`.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import * as VariantSchema from "@beep/schema/VariantSchema"

const field = VariantSchema.Overrideable(S.String, {
  defaultValue: Effect.succeed("generated")
})

console.log(field.ast._tag)
```

**Signature**

```ts
declare const Overrideable: { <S extends S.Top & S.WithoutConstructorDefault>(options: { readonly defaultValue: Effect.Effect<S["~type.make.in"]>; }): (schema: S) => Overridable<S>; <S extends S.Top & S.WithoutConstructorDefault>(schema: S, options: { readonly defaultValue: Effect.Effect<S["~type.make.in"]>; }): Overridable<S>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/VariantSchema/VariantSchema.overridable.ts#L155)

Since v0.0.0

# schemas

## Overridable (interface)

Schema type for fields that receive an Effect-backed constructor default but
can still be supplied explicitly as overrides.

**Example**

```ts
import type { Overridable } from "@beep/schema/VariantSchema"
import * as S from "effect/Schema"

declare const field: Overridable<typeof S.String>
console.log(field.ast._tag)
```

**Signature**

```ts
export interface Overridable<S extends S.Top & S.WithoutConstructorDefault>
  extends S.Bottom<
    S["Type"] & Brand<"Override">,
    S["Encoded"],
    S["DecodingServices"],
    S["EncodingServices"],
    S["ast"],
    Overridable<S>,
    S["~type.make.in"],
    (S["Type"] & Brand<"Override">) | undefined,
    S["~type.parameters"],
    (S["Type"] & Brand<"Override">) | undefined,
    S["~type.mutability"],
    "required",
    "with-default",
    S["~encoded.mutability"],
    S["~encoded.optionality"]
  > {}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/VariantSchema/VariantSchema.overridable.ts#L43)

Since v0.0.0

## Overrideable (interface)

Upstream-compatible alias for `Overridable`.

**Example**

```ts
import type { Overrideable } from "@beep/schema/VariantSchema"
import * as S from "effect/Schema"

declare const field: Overrideable<typeof S.String>
console.log(field.ast._tag)
```

**Example**

```ts
import * as Effect from "effect/Effect"
import * as S from "effect/Schema"
import * as VariantSchema from "@beep/schema/VariantSchema"

const field = VariantSchema.Overrideable(S.String, {
  defaultValue: Effect.succeed("generated")
})

console.log(field)
```

**Signature**

```ts
export interface Overrideable<S extends S.Top & S.WithoutConstructorDefault> extends Overridable<S> {}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/VariantSchema/VariantSchema.overridable.ts#L134)

Since v0.0.0