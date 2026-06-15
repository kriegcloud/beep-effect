---
title: Int.ts
nav_order: 136
parent: "@beep/schema"
---

## Int.ts overview

Integer schemas and refinements.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [Int (type alias)](#int-type-alias)
  - [NegInt (type alias)](#negint-type-alias)
  - [NonPositiveInt (type alias)](#nonpositiveint-type-alias)
  - [PosInt (type alias)](#posint-type-alias)
  - [PostgresSerialInt (type alias)](#postgresserialint-type-alias)
- [schemas](#schemas)
  - [PostgresSerialInt](#postgresserialint)
- [validation](#validation)
  - [Int](#int)
  - [NegInt](#negint)
  - [NonNegativeInt](#nonnegativeint)
  - [NonPositiveInt](#nonpositiveint)
  - [PosInt](#posint)
---

# models

## Int (type alias)

Type for `Int`.

**Example**

```ts
import type { Int } from "@beep/schema/Int"

const add = (a: Int, b: Int): number => a + b
```

**Signature**

```ts
type Int = typeof Int.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Int.ts#L55)

Since v0.0.0

## NegInt (type alias)

Type for `NegInt`.

**Example**

```ts
import type { NegInt } from "@beep/schema/Int"

const debt: NegInt = -10 as NegInt
```

**Signature**

```ts
type NegInt = typeof NegInt.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Int.ts#L180)

Since v0.0.0

## NonPositiveInt (type alias)

Type for `NonPositiveInt`.

**Example**

```ts
import type { NonPositiveInt } from "@beep/schema/Int"

const offset: NonPositiveInt = 0 as NonPositiveInt
```

**Signature**

```ts
type NonPositiveInt = typeof NonPositiveInt.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Int.ts#L223)

Since v0.0.0

## PosInt (type alias)

Type for `PosInt`.

**Example**

```ts
import type { PosInt } from "@beep/schema/Int"

const count: PosInt = 1 as PosInt
```

**Signature**

```ts
type PosInt = typeof PosInt.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Int.ts#L98)

Since v0.0.0

## PostgresSerialInt (type alias)

Type for `PostgresSerialInt`.

**Example**

```ts
import type { PostgresSerialInt } from "@beep/schema/Int"

const id = 1 as PostgresSerialInt
console.log(id)
```

**Signature**

```ts
type PostgresSerialInt = typeof PostgresSerialInt.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Int.ts#L137)

Since v0.0.0

# schemas

## PostgresSerialInt

Branded schema for PostgreSQL `serial` column values.

**Example**

```ts
import * as S from "effect/Schema"
import { PostgresSerialInt } from "@beep/schema/Int"

const id = S.decodeUnknownSync(PostgresSerialInt)(1)
console.log(id)
```

**Signature**

```ts
declare const PostgresSerialInt: AnnotatedSchema<S.brand<S.brand<S.Int, "Int">, "PostgresSerialInt">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Int.ts#L115)

Since v0.0.0

# validation

## Int

Branded schema for finite integers.

**Example**

```ts
import * as S from "effect/Schema"
import { Int } from "@beep/schema/Int"

const value = S.decodeUnknownSync(Int)(42)
console.log(value) // 42
```

**Signature**

```ts
declare const Int: AnnotatedSchema<S.brand<S.Int, "Int">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Int.ts#L29)

Since v0.0.0

## NegInt

Branded schema for negative integers (less than zero).

**Example**

```ts
import * as S from "effect/Schema"
import { NegInt } from "@beep/schema/Int"

const value = S.decodeUnknownSync(NegInt)(-3)
console.log(value) // -3
```

**Signature**

```ts
declare const NegInt: AnnotatedSchema<S.brand<S.brand<S.Int, "Int">, "NegInt">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Int.ts#L154)

Since v0.0.0

## NonNegativeInt

Branded schema for non-negative integers (zero or greater).

**Example**

```ts
import * as S from "effect/Schema"
import { NonNegativeInt } from "@beep/schema/Int"

S.decodeUnknownSync(NonNegativeInt)(0)
S.decodeUnknownSync(NonNegativeInt)(100)
```

**Signature**

```ts
declare const NonNegativeInt: AnnotatedSchema<S.brand<S.brand<S.Int, "Int">, "NonNegativeInt">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Int.ts#L240)

Since v0.0.0

## NonPositiveInt

Branded schema for non-positive integers (zero or less).

**Example**

```ts
import * as S from "effect/Schema"
import { NonPositiveInt } from "@beep/schema/Int"

S.decodeUnknownSync(NonPositiveInt)(0)
S.decodeUnknownSync(NonPositiveInt)(-5)
```

**Signature**

```ts
declare const NonPositiveInt: AnnotatedSchema<S.brand<S.brand<S.Int, "Int">, "NonPositiveInt">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Int.ts#L197)

Since v0.0.0

## PosInt

Branded schema for positive integers (greater than zero).

**Example**

```ts
import * as S from "effect/Schema"
import { PosInt } from "@beep/schema/Int"

const value = S.decodeUnknownSync(PosInt)(5)
console.log(value) // 5
```

**Signature**

```ts
declare const PosInt: AnnotatedSchema<S.brand<S.brand<S.Int, "Int">, "PosInt">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Int.ts#L72)

Since v0.0.0