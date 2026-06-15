---
title: Transformations.ts
nav_order: 215
parent: "@beep/schema"
---

## Transformations.ts overview

Lossy schema transformation helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [destructiveTransform](#destructivetransform)
---

# utilities

## destructiveTransform

Applies a lossy transform by inferring the target type from a callback result.

This helper intentionally does not require an inverse transform. Decoding runs
the source schema first, then applies `transform`. Encoding passes the
transformed value through unchanged. Supports both data-first and data-last
calling conventions.

**Example**

```ts
import * as S from "effect/Schema"
import { pipe } from "effect"
import { destructiveTransform } from "@beep/schema/Transformations"

// data-first
const StringLength = destructiveTransform(S.String, (value) => value.length)
console.log(StringLength)

// data-last (pipeable)
const Piped = pipe(S.String, destructiveTransform((value) => value.length))
console.log(Piped)
```

**Signature**

```ts
declare const destructiveTransform: { <Self extends S.Top, B>(transform: (input: Self["Type"]) => B): (self: Self) => DestructiveTransform<Self, B>; <Self extends S.Top, B>(self: Self, transform: (input: Self["Type"]) => B): DestructiveTransform<Self, B>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Transformations.ts#L47)

Since v0.0.0