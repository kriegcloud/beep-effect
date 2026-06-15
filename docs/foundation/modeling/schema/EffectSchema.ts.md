---
title: EffectSchema.ts
nav_order: 65
parent: "@beep/schema"
---

## EffectSchema.ts overview

Schema helpers for validating Effect runtime values.

This module delegates runtime detection to `Effect.isEffect`, which is the
canonical guard provided by the Effect library.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [EffectSchema (type alias)](#effectschema-type-alias)
- [validation](#validation)
  - [EffectSchema](#effectschema)
  - [isEffect](#iseffect)
---

# models

## EffectSchema (type alias)

{@inheritDoc EffectSchema}

**Example**

```ts
import { Effect } from "effect"
import type { EffectSchema } from "@beep/schema/EffectSchema"

const program: EffectSchema = Effect.succeed("done")

console.log(program)
```

**Signature**

```ts
type EffectSchema = typeof EffectSchema.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EffectSchema.ts#L98)

Since v0.0.0

# validation

## EffectSchema

Declared schema for Effect runtime values.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { EffectSchema } from "@beep/schema/EffectSchema"

const program = Effect.succeed("done")
const decoded = S.decodeUnknownSync(EffectSchema)(program)

console.log(decoded)
```

**Signature**

```ts
declare const EffectSchema: AnnotatedSchema<S.declare<Effect.Effect<unknown, unknown, unknown>, Effect.Effect<unknown, unknown, unknown>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EffectSchema.ts#L76)

Since v0.0.0

## isEffect

Type guard that checks whether a value is an Effect runtime value.

This reuses `Effect.isEffect`, the canonical Effect guard, so schema
validation stays aligned with the library's own effect detection semantics.

**Example**

```ts
import { Effect } from "effect"
import { isEffect } from "@beep/schema/EffectSchema"

const program = Effect.succeed(1)

console.log(isEffect(program)) // true
console.log(isEffect("hello")) // false
```

**Signature**

```ts
declare const isEffect: (u: unknown) => u is Effect.Effect<any, any, any>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EffectSchema.ts#L56)

Since v0.0.0