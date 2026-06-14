---
title: PromiseSchema.ts
nav_order: 176
parent: "@beep/schema"
---

## PromiseSchema.ts overview

Schema helpers for validating native JavaScript `Promise` values.

This module intentionally avoids `instanceof Promise` so values created in
other realms can still validate. The runtime guard checks the standard
`then`, `catch`, and `finally` methods alongside the built-in promise
object tag to reject plain thenable objects.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [PromiseSchema (type alias)](#promiseschema-type-alias)
- [validation](#validation)
  - [PromiseSchema](#promiseschema)
  - [isPromise](#ispromise)
---

# models

## PromiseSchema (type alias)

{@inheritDoc PromiseSchema}

**Example**

```ts
import type { PromiseSchema } from "@beep/schema/PromiseSchema"

const task: PromiseSchema = globalThis.Promise.resolve("done")

console.log(task)
```

**Signature**

```ts
type PromiseSchema = typeof PromiseSchema.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PromiseSchema.ts#L112)

Since v0.0.0

# validation

## PromiseSchema

Declared schema for native JavaScript `Promise` values.

**Example**

```ts
import * as S from "effect/Schema"
import { PromiseSchema } from "@beep/schema/PromiseSchema"

const task = globalThis.Promise.resolve("done")
const decoded = S.decodeUnknownSync(PromiseSchema)(task)

console.log(decoded)
```

**Signature**

```ts
declare const PromiseSchema: AnnotatedSchema<S.declare<Promise<unknown>, Promise<unknown>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PromiseSchema.ts#L91)

Since v0.0.0

## isPromise

Type guard that checks whether a value is a native JavaScript `Promise`.

This guard is cross-realm aware and rejects plain thenable objects by
requiring the built-in promise tag in addition to the standard promise
instance methods.

**Example**

```ts
import { isPromise } from "@beep/schema/PromiseSchema"

const nativePromise = globalThis.Promise.resolve(1)
const thenable = {
  then: () => undefined,
  catch: () => undefined,
  finally: () => undefined,
}

console.log(isPromise(nativePromise)) // true
console.log(isPromise(thenable)) // false
```

**Signature**

```ts
declare const isPromise: (u: unknown) => u is globalThis.Promise<unknown>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PromiseSchema.ts#L64)

Since v0.0.0