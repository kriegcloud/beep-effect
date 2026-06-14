---
title: Sanity.errors.ts
nav_order: 3
parent: "@beep/sanity"
---

## Sanity.errors.ts overview

Typed technical errors for the Sanity driver boundary.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [SanityError (class)](#sanityerror-class)
  - [SanityErrorOptions (class)](#sanityerroroptions-class)
  - [SanityErrorReason](#sanityerrorreason)
  - [SanityErrorReason (type alias)](#sanityerrorreason-type-alias)
---

# errors

## SanityError (class)

Technical failure raised by the Sanity driver boundary.

**Example**

```ts
import { SanityError } from "@beep/sanity"

const error = SanityError.fromReason("response status", {
  status: 404,
  url: "https://api.sanity.io/v2025-05-14/data/query/production"
})

console.log(error.reason) // "response status"
```

**Signature**

```ts
declare class SanityError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/sanity/src/Sanity.errors.ts#L82)

Since v0.0.0

## SanityErrorOptions (class)

Options used when constructing Sanity driver errors.

**Example**

```ts
import { SanityErrorOptions } from "@beep/sanity"

const options = SanityErrorOptions.make({
  status: 500,
  url: "https://api.sanity.io/v2025-05-14/data/query/production"
})

console.log(options.status) // 500
```

**Signature**

```ts
declare class SanityErrorOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/sanity/src/Sanity.errors.ts#L140)

Since v0.0.0

## SanityErrorReason

Technical error reasons emitted by the Sanity driver.

**Example**

```ts
import { SanityErrorReason } from "@beep/sanity"
import * as S from "effect/Schema"

const isReason = S.is(SanityErrorReason)

console.log(isReason("transport")) // true
console.log(isReason("unexpected")) // false
```

**Signature**

```ts
declare const SanityErrorReason: AnnotatedSchema<LiteralKit<readonly ["config", "request encoding", "response decoding", "response status", "transport"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/sanity/src/Sanity.errors.ts#L35)

Since v0.0.0

## SanityErrorReason (type alias)

Type for `SanityErrorReason`.

**Example**

```ts
import type { SanityErrorReason } from "@beep/sanity"

const reason: SanityErrorReason = "response decoding"

console.log(reason) // "response decoding"
```

**Signature**

```ts
type SanityErrorReason = typeof SanityErrorReason.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/sanity/src/Sanity.errors.ts#L62)

Since v0.0.0