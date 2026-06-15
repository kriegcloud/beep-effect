---
title: Drizzle.errors.ts
nav_order: 1
parent: "@beep/drizzle"
---

## Drizzle.errors.ts overview

Technical errors raised by the Drizzle driver boundary.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [DrizzleError (class)](#drizzleerror-class)
  - [DrizzleErrorContext (class)](#drizzleerrorcontext-class)
---

# errors

## DrizzleError (class)

Technical failure raised by the `@beep/drizzle` driver boundary.

`operation` identifies the driver operation that failed. Optional query
context is captured when Drizzle's native Effect query error exposes it.

**Example**

```ts
import { DrizzleError } from "@beep/drizzle"
import * as O from "effect/Option"

const error = DrizzleError.make({
  operation: "execute",
  cause: O.none(),
  query: O.none(),
  params: O.none()
})

console.log(error)
```

**Signature**

```ts
declare class DrizzleError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/drizzle/src/Drizzle.errors.ts#L239)

Since v0.0.0

## DrizzleErrorContext (class)

Optional query context captured while normalizing Drizzle driver failures.

**Example**

```ts
import { DrizzleErrorContext } from "@beep/drizzle"

const context = DrizzleErrorContext.make({
  query: "select 1",
  params: []
})

console.log(context)
```

**Signature**

```ts
declare class DrizzleErrorContext
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/drizzle/src/Drizzle.errors.ts#L36)

Since v0.0.0