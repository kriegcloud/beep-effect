---
title: Primitive.ts
nav_order: 175
parent: "@beep/schema"
---

## Primitive.ts overview

A primitive data type schema.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [Primitive (type alias)](#primitive-type-alias)
- [validation](#validation)
  - [Primitive](#primitive)
---

# models

## Primitive (type alias)

{@inheritDoc Primitive}

**Example**

```ts
import type { Primitive } from "@beep/schema/Primitive"

const value: Primitive = "hello"
```

**Signature**

```ts
type Primitive = typeof Primitive.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Primitive.ts#L47)

Since v0.0.0

# validation

## Primitive

Schema for JavaScript primitive types (`string | number | boolean | bigint | null | undefined`).

**Example**

```ts
import * as S from "effect/Schema"
import { Primitive } from "@beep/schema/Primitive"

S.decodeUnknownSync(Primitive)("hello")
S.decodeUnknownSync(Primitive)(42)
S.decodeUnknownSync(Primitive)(null)
```

**Signature**

```ts
declare const Primitive: AnnotatedSchema<S.Union<readonly [S.String, S.Finite, S.Boolean, S.BigInt, S.Null, S.Undefined]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Primitive.ts#L28)

Since v0.0.0