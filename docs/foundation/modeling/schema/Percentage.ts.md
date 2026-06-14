---
title: Percentage.ts
nav_order: 169
parent: "@beep/schema"
---

## Percentage.ts overview

Percentage - Value object for percentage values (0-100)

A branded type representing a valid percentage value constrained to 0-100.
Supports decimal values (e.g., 12.5%, 99.99%).
Uses Schema.brand for compile-time type safety.

Since v0.0.0

---
## Exports Grouped by Category
- [constants](#constants)
  - [FIFTY](#fifty)
  - [HUNDRED](#hundred)
  - [TWENTY](#twenty)
  - [ZERO](#zero)
- [formatting](#formatting)
  - [format](#format)
- [models](#models)
  - [Percentage](#percentage)
  - [Percentage (type alias)](#percentage-type-alias)
- [utilities](#utilities)
  - [complement](#complement)
  - [fromDecimal](#fromdecimal)
  - [toDecimal](#todecimal)
- [validation](#validation)
  - [isFull](#isfull)
  - [isPercentage](#ispercentage)
  - [isZero](#iszero)
---

# constants

## FIFTY

Percentage constant for 50%.

**Example**

```ts
import { FIFTY } from "@beep/schema/Percentage"

console.log(FIFTY)
```

**Signature**

```ts
declare const FIFTY: number & Brand<"Percentage">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Percentage.ts#L114)

Since v0.0.0

## HUNDRED

Percentage constant for 100%.

**Example**

```ts
import { HUNDRED } from "@beep/schema/Percentage"

console.log(HUNDRED)
```

**Signature**

```ts
declare const HUNDRED: number & Brand<"Percentage">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Percentage.ts#L128)

Since v0.0.0

## TWENTY

Percentage constant for 20%.

**Example**

```ts
import { TWENTY } from "@beep/schema/Percentage"

console.log(TWENTY)
```

**Signature**

```ts
declare const TWENTY: number & Brand<"Percentage">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Percentage.ts#L100)

Since v0.0.0

## ZERO

Percentage constant for 0%.

**Example**

```ts
import { ZERO } from "@beep/schema/Percentage"

console.log(ZERO) // 0
```

**Signature**

```ts
declare const ZERO: number & Brand<"Percentage">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Percentage.ts#L86)

Since v0.0.0

# formatting

## format

Format a percentage as a display string with configurable decimal places.

**Example**

```ts
import { format, FIFTY } from "@beep/schema/Percentage"

console.log(format(FIFTY, 0)) // "50%"
console.log(format(FIFTY, 2)) // "50.00%"
```

**Signature**

```ts
declare const format: { (percentage: Percentage): (decimalPlaces?: undefined | number) => string; (percentage: Percentage, decimalPlaces?: undefined | number): string; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Percentage.ts#L223)

Since v0.0.0

# models

## Percentage

Schema for a valid percentage value between 0 and 100 (inclusive).

**Example**

```ts
import * as S from "effect/Schema"
import { Percentage } from "@beep/schema/Percentage"

const value = S.decodeUnknownSync(Percentage)(75.5)
console.log(value) // 75.5
```

**Signature**

```ts
declare const Percentage: AnnotatedSchema<S.brand<S.Finite, "Percentage">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Percentage.ts#L32)

Since v0.0.0

## Percentage (type alias)

{@inheritDoc Percentage}

**Example**

```ts
import type { Percentage } from "@beep/schema/Percentage"

const discount: Percentage = 25 as Percentage
```

**Signature**

```ts
type Percentage = typeof Percentage.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Percentage.ts#L55)

Since v0.0.0

# utilities

## complement

Get the complement of a percentage (100 - value).

**Example**

```ts
import { complement, TWENTY } from "@beep/schema/Percentage"

const result = complement(TWENTY)
console.log(result) // 80
```

**Signature**

```ts
declare const complement: (percentage: Percentage) => Percentage
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Percentage.ts#L207)

Since v0.0.0

## fromDecimal

Convert a decimal (0-1 range) to a percentage value.

**Example**

```ts
import { fromDecimal } from "@beep/schema/Percentage"

const pct = fromDecimal(0.75)
console.log(pct) // 75
```

**Signature**

```ts
declare const fromDecimal: (decimal: number) => Percentage
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Percentage.ts#L159)

Since v0.0.0

## toDecimal

Convert a percentage to its decimal representation (0-1 range).

**Example**

```ts
import { toDecimal, FIFTY } from "@beep/schema/Percentage"

console.log(toDecimal(FIFTY)) // 0.5
```

**Signature**

```ts
declare const toDecimal: (percentage: Percentage) => number
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Percentage.ts#L143)

Since v0.0.0

# validation

## isFull

Check if a percentage value is 100%.

**Example**

```ts
import { isFull, HUNDRED, FIFTY } from "@beep/schema/Percentage"

console.log(isFull(HUNDRED)) // true
console.log(isFull(FIFTY)) // false
```

**Signature**

```ts
declare const isFull: (percentage: Percentage) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Percentage.ts#L191)

Since v0.0.0

## isPercentage

Type guard for `Percentage`.

**Example**

```ts
import { isPercentage } from "@beep/schema/Percentage"

console.log(isPercentage(50)) // true
console.log(isPercentage(150)) // false
```

**Signature**

```ts
declare const isPercentage: <I>(input: I) => input is I & number & Brand<"Percentage">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Percentage.ts#L71)

Since v0.0.0

## isZero

Check if a percentage value is zero.

**Example**

```ts
import { isZero, ZERO, FIFTY } from "@beep/schema/Percentage"

console.log(isZero(ZERO)) // true
console.log(isZero(FIFTY)) // false
```

**Signature**

```ts
declare const isZero: (percentage: Percentage) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Percentage.ts#L175)

Since v0.0.0