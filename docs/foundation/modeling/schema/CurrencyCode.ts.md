---
title: CurrencyCode.ts
nav_order: 45
parent: "@beep/schema"
---

## CurrencyCode.ts overview

CurrencyCode - ISO 4217 currency code value object

A branded type representing a valid ISO 4217 currency code (3 uppercase letters).
Uses S.brand for compile-time type safety.

Since v0.0.0

---
## Exports Grouped by Category
- [constants](#constants)
  - [AUD](#aud)
  - [CAD](#cad)
  - [CHF](#chf)
  - [CNY](#cny)
  - [EUR](#eur)
  - [GBP](#gbp)
  - [HKD](#hkd)
  - [JPY](#jpy)
  - [SGD](#sgd)
  - [USD](#usd)
- [models](#models)
  - [CurrencyCode](#currencycode)
  - [CurrencyCode (type alias)](#currencycode-type-alias)
- [validation](#validation)
  - [isCurrencyCode](#iscurrencycode)
---

# constants

## AUD

ISO 4217 constant for Australian Dollar.

**Example**

```ts
import { AUD } from "@beep/schema/CurrencyCode"

console.log(AUD)
```

**Signature**

```ts
declare const AUD: string & Brand<"CurrencyCode">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CurrencyCode.ts#L166)

Since v0.0.0

## CAD

ISO 4217 constant for Canadian Dollar.

**Example**

```ts
import { CAD } from "@beep/schema/CurrencyCode"

console.log(CAD)
```

**Signature**

```ts
declare const CAD: string & Brand<"CurrencyCode">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CurrencyCode.ts#L152)

Since v0.0.0

## CHF

ISO 4217 constant for Swiss Franc.

**Example**

```ts
import { CHF } from "@beep/schema/CurrencyCode"

console.log(CHF)
```

**Signature**

```ts
declare const CHF: string & Brand<"CurrencyCode">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CurrencyCode.ts#L138)

Since v0.0.0

## CNY

ISO 4217 constant for Chinese Yuan.

**Example**

```ts
import { CNY } from "@beep/schema/CurrencyCode"

console.log(CNY)
```

**Signature**

```ts
declare const CNY: string & Brand<"CurrencyCode">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CurrencyCode.ts#L180)

Since v0.0.0

## EUR

ISO 4217 constant for Euro.

**Example**

```ts
import { EUR } from "@beep/schema/CurrencyCode"

console.log(EUR)
```

**Signature**

```ts
declare const EUR: string & Brand<"CurrencyCode">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CurrencyCode.ts#L96)

Since v0.0.0

## GBP

ISO 4217 constant for British Pound Sterling.

**Example**

```ts
import { GBP } from "@beep/schema/CurrencyCode"

console.log(GBP)
```

**Signature**

```ts
declare const GBP: string & Brand<"CurrencyCode">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CurrencyCode.ts#L110)

Since v0.0.0

## HKD

ISO 4217 constant for Hong Kong Dollar.

**Example**

```ts
import { HKD } from "@beep/schema/CurrencyCode"

console.log(HKD)
```

**Signature**

```ts
declare const HKD: string & Brand<"CurrencyCode">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CurrencyCode.ts#L194)

Since v0.0.0

## JPY

ISO 4217 constant for Japanese Yen.

**Example**

```ts
import { JPY } from "@beep/schema/CurrencyCode"

console.log(JPY)
```

**Signature**

```ts
declare const JPY: string & Brand<"CurrencyCode">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CurrencyCode.ts#L124)

Since v0.0.0

## SGD

ISO 4217 constant for Singapore Dollar.

**Example**

```ts
import { SGD } from "@beep/schema/CurrencyCode"

console.log(SGD)
```

**Signature**

```ts
declare const SGD: string & Brand<"CurrencyCode">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CurrencyCode.ts#L208)

Since v0.0.0

## USD

ISO 4217 constant for United States Dollar.

**Example**

```ts
import { USD } from "@beep/schema/CurrencyCode"

console.log(USD) // "USD"
```

**Signature**

```ts
declare const USD: string & Brand<"CurrencyCode">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CurrencyCode.ts#L82)

Since v0.0.0

# models

## CurrencyCode

Schema for a valid ISO 4217 currency code (exactly 3 uppercase ASCII letters).

**Example**

```ts
import * as S from "effect/Schema"
import { CurrencyCode } from "@beep/schema/CurrencyCode"

const code = S.decodeUnknownSync(CurrencyCode)("USD")
console.log(code) // "USD"
```

**Signature**

```ts
declare const CurrencyCode: AnnotatedSchema<S.brand<S.String, "CurrencyCode">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CurrencyCode.ts#L31)

Since v0.0.0

## CurrencyCode (type alias)

{@inheritDoc CurrencyCode}

**Example**

```ts
import type { CurrencyCode } from "@beep/schema/CurrencyCode"

const currency: CurrencyCode = "EUR" as CurrencyCode
```

**Signature**

```ts
type CurrencyCode = typeof CurrencyCode.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CurrencyCode.ts#L51)

Since v0.0.0

# validation

## isCurrencyCode

Type guard for `CurrencyCode`.

**Example**

```ts
import { isCurrencyCode } from "@beep/schema/CurrencyCode"

console.log(isCurrencyCode("USD")) // true
console.log(isCurrencyCode("usd")) // false
```

**Signature**

```ts
declare const isCurrencyCode: <I>(input: I) => input is I & string & Brand<"CurrencyCode">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CurrencyCode.ts#L67)

Since v0.0.0