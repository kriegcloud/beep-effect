---
title: Number.ts
nav_order: 163
parent: "@beep/schema"
---

## Number.ts overview

Numeric refinement helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [NonNegNum (type alias)](#nonnegnum-type-alias)
  - [NonNegativeInt (type alias)](#nonnegativeint-type-alias)
- [validation](#validation)
  - [NonNegNum](#nonnegnum)
  - [NonNegativeInt](#nonnegativeint)
  - [isNegative](#isnegative)
  - [isNonNegative](#isnonnegative)
  - [isNonPositive](#isnonpositive)
  - [isPositive](#ispositive)
  - [isPostgresSerialInt](#ispostgresserialint)
---

# models

## NonNegNum (type alias)

Type for `NonNegNum`.

**Example**

```ts
import type { NonNegNum } from "@beep/schema/Number"

const index: NonNegNum = 0 as NonNegNum
```

**Signature**

```ts
type NonNegNum = typeof NonNegNum.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Number.ts#L163)

Since v0.0.0

## NonNegativeInt (type alias)

Type for `NonNegativeInt`.

**Example**

```ts
import type { NonNegativeInt } from "@beep/schema/Number"

const index: NonNegativeInt = 0 as NonNegativeInt
```

**Signature**

```ts
type NonNegativeInt = typeof NonNegativeInt.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Number.ts#L213)

Since v0.0.0

# validation

## NonNegNum

Branded schema for non-negative number (zero or greater).

**Example**

```ts
import * as S from "effect/Schema"
import { NonNegNum } from "@beep/schema/Number"

S.decodeUnknownSync(NonNegNum)(0)
S.decodeUnknownSync(NonNegNum)(100)
```

**Signature**

```ts
declare const NonNegNum: AnnotatedSchema<S.Finite>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Number.ts#L144)

Since v0.0.0

## NonNegativeInt

Branded schema for non-negative integers (zero or greater).

**Example**

```ts
import * as S from "effect/Schema"
import { NonNegativeInt } from "@beep/schema/Number"

S.decodeUnknownSync(NonNegativeInt)(0)
S.decodeUnknownSync(NonNegativeInt)(100)
```

**Signature**

```ts
declare const NonNegativeInt: AnnotatedSchema<S.brand<S.brand<S.Int, "Int">, "NonNegativeInt">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Number.ts#L180)

Since v0.0.0

## isNegative

Refinement that accepts negative numbers (less than zero).

**Example**

```ts
import * as S from "effect/Schema"
import { isNegative } from "@beep/schema/Number"

const NegNum = S.Finite.check(isNegative)
const value = S.decodeUnknownSync(NegNum)(-1)
console.log(value) // -1
```

**Signature**

```ts
declare const isNegative: Filter<number>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Number.ts#L109)

Since v0.0.0

## isNonNegative

Refinement that accepts non-negative numbers (zero or greater).

**Example**

```ts
import * as S from "effect/Schema"
import { isNonNegative } from "@beep/schema/Number"

const NonNeg = S.Finite.check(isNonNegative)
S.decodeUnknownSync(NonNeg)(0)
S.decodeUnknownSync(NonNeg)(42)
```

**Signature**

```ts
declare const isNonNegative: Filter<number>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Number.ts#L91)

Since v0.0.0

## isNonPositive

Refinement that accepts non-positive numbers (zero or less).

**Example**

```ts
import * as S from "effect/Schema"
import { isNonPositive } from "@beep/schema/Number"

const NonPos = S.Finite.check(isNonPositive)
S.decodeUnknownSync(NonPos)(0)
S.decodeUnknownSync(NonPos)(-10)
```

**Signature**

```ts
declare const isNonPositive: Filter<number>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Number.ts#L127)

Since v0.0.0

## isPositive

Refinement that accepts positive numbers (greater than zero).

**Example**

```ts
import * as S from "effect/Schema"
import { isPositive } from "@beep/schema/Number"

const PosNum = S.Finite.check(isPositive)
const value = S.decodeUnknownSync(PosNum)(5)
console.log(value) // 5
```

**Signature**

```ts
declare const isPositive: Filter<number>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Number.ts#L29)

Since v0.0.0

## isPostgresSerialInt

Refinement that accepts integers in PostgreSQL `serial` column range.

**Example**

```ts
import * as S from "effect/Schema"
import { isPostgresSerialInt } from "@beep/schema/Number"

const Serial = S.Int.check(isPostgresSerialInt)
const id = S.decodeUnknownSync(Serial)(1)
console.log(id)
```

**Signature**

```ts
declare const isPostgresSerialInt: FilterGroup<number>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Number.ts#L47)

Since v0.0.0