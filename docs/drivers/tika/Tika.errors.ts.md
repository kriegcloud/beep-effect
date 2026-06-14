---
title: Tika.errors.ts
nav_order: 2
parent: "@beep/tika"
---

## Tika.errors.ts overview

Typed technical errors for the Tika driver boundary.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [makeTikaError](#maketikaerror)
- [errors](#errors)
  - [TikaError (class)](#tikaerror-class)
  - [TikaErrorReason](#tikaerrorreason)
  - [TikaErrorReason (type alias)](#tikaerrorreason-type-alias)
---

# constructors

## makeTikaError

Create a Tika technical error with a typed reason.

**Example**

```ts
import { makeTikaError } from "@beep/tika"

const error = makeTikaError("engine-unavailable")
console.log(error.reason)
```

**Signature**

```ts
declare const makeTikaError: (reason: TikaErrorReason, options?: { readonly cause?: string; readonly statusCode?: NonNegativeInt; }) => TikaError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/tika/src/Tika.errors.ts#L114)

Since v0.0.0

# errors

## TikaError (class)

Technical failure raised inside the Tika driver boundary.

**Example**

```ts
import { TikaError } from "@beep/tika"

const error = TikaError.fromReason("engine-unavailable")
console.log(error.reason)
```

**Signature**

```ts
declare class TikaError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/tika/src/Tika.errors.ts#L72)

Since v0.0.0

## TikaErrorReason

Technical Tika failure reasons.

**Example**

```ts
import { TikaErrorReason } from "@beep/tika"

console.log(TikaErrorReason)
```

**Signature**

```ts
declare const TikaErrorReason: AnnotatedSchema<LiteralKit<readonly ["config", "engine-unavailable", "response-decoding", "response-status", "timeout", "transport"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/tika/src/Tika.errors.ts#L29)

Since v0.0.0

## TikaErrorReason (type alias)

Type for `TikaErrorReason`.

**Example**

```ts
import type { TikaErrorReason } from "@beep/tika"

const reason: TikaErrorReason = "engine-unavailable"
console.log(reason)
```

**Signature**

```ts
type TikaErrorReason = typeof TikaErrorReason.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/tika/src/Tika.errors.ts#L56)

Since v0.0.0