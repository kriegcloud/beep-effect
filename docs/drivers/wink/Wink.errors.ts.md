---
title: Wink.errors.ts
nav_order: 2
parent: "@beep/wink"
---

## Wink.errors.ts overview

Wink runtime errors.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [WinkEngineError (class)](#winkengineerror-class)
  - [WinkEntityError (class)](#winkentityerror-class)
  - [WinkError](#winkerror)
  - [WinkError (type alias)](#winkerror-type-alias)
  - [WinkTokenizationError (class)](#winktokenizationerror-class)
---

# errors

## WinkEngineError (class)

Typed failure for initializing or reading from the wink runtime.

**Example**

```ts
import { WinkEngineError } from "@beep/wink"

const error = WinkEngineError.fromCause(new Error("missing model"), "initialize")
console.log(error.operation)
```

**Signature**

```ts
declare class WinkEngineError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/Wink.errors.ts#L38)

Since v0.0.0

## WinkEntityError (class)

Typed failure for learning or updating wink custom entity patterns.

**Example**

```ts
import { WinkEntityError } from "@beep/wink"

const error = WinkEntityError.fromCause(new Error("invalid pattern"), "learnCustomEntities", {
  entityName: "ProductName"
})

console.log(error.entityName._tag)
```

**Signature**

```ts
declare class WinkEntityError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/Wink.errors.ts#L140)

Since v0.0.0

## WinkError

Tagged schema union for all wink runtime failures exposed by this module.

**Example**

```ts
import * as S from "effect/Schema"
import { WinkEngineError, WinkError } from "@beep/wink"

const isWinkError = S.is(WinkError)
const error = WinkEngineError.fromCause(new Error("missing model"), "initialize")

console.log(isWinkError(error))
```

**Signature**

```ts
declare const WinkError: AnnotatedSchema<S.Union<readonly [typeof WinkEngineError, typeof WinkEntityError, typeof WinkTokenizationError]> & TaggedUnionUtils<"_tag", readonly [typeof WinkEngineError, typeof WinkEntityError, typeof WinkTokenizationError], [typeof WinkEngineError, typeof WinkEntityError, typeof WinkTokenizationError]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/Wink.errors.ts#L193)

Since v0.0.0

## WinkError (type alias)

Type-level companion for the `WinkError` schema union.

**Example**

```ts
import { WinkError } from "@beep/wink"
import type { WinkError as WinkErrorSchema } from "@beep/wink"

const schema: WinkErrorSchema = WinkError
console.log(typeof schema)
```

**Signature**

```ts
type WinkError = typeof WinkError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/Wink.errors.ts#L215)

Since v0.0.0

## WinkTokenizationError (class)

Typed failure for wink document reads, token collection, and token counts.

**Example**

```ts
import { WinkTokenizationError } from "@beep/wink"

const error = WinkTokenizationError.fromCause(new Error("bad input"), "tokens", {
  text: "raw text"
})

console.log(error.text._tag)
```

**Signature**

```ts
declare class WinkTokenizationError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/Wink.errors.ts#L87)

Since v0.0.0