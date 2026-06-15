---
title: WinkUtils.service.ts
nav_order: 13
parent: "@beep/wink"
---

## WinkUtils.service.ts overview

Wink utility wrappers for string, token, and n-gram helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [WinkUtilsError (class)](#winkutilserror-class)
- [layers](#layers)
  - [WinkUtilsLive](#winkutilslive)
- [services](#services)
  - [WinkUtils (class)](#winkutils-class)
---

# errors

## WinkUtilsError (class)

Typed failure for `wink-nlp-utils` string, token, and n-gram helpers.

**Example**

```ts
import { WinkUtilsError } from "@beep/wink"

const error = WinkUtilsError.fromCause(new Error("bad helper output"), "bagOfNGrams")
console.log(error.operation)
```

**Signature**

```ts
declare class WinkUtilsError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/WinkUtils.service.ts#L150)

Since v0.0.0

# layers

## WinkUtilsLive

Live layer for the `wink-nlp-utils` wrappers.

**Example**

```ts
import { Effect } from "effect"
import { WinkUtils, WinkUtilsLive } from "@beep/wink"

const ngrams = Effect.gen(function* () {
  const utils = yield* WinkUtils
  return yield* utils.bagOfNGrams("effect schema effect", 1)
})

Effect.runPromise(ngrams.pipe(Effect.provide(WinkUtilsLive))).then((result) =>
  console.log(result.uniqueNGrams)
)
```

**Signature**

```ts
declare const WinkUtilsLive: Layer.Layer<WinkUtils, WinkUtilsError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/WinkUtils.service.ts#L337)

Since v0.0.0

# services

## WinkUtils (class)

Service wrapping `wink-nlp-utils` string cleanup, phonetic, and n-gram helpers.

**Example**

```ts
import { Effect } from "effect"
import { WinkUtils, WinkUtilsLive } from "@beep/wink"

const cleanup = Effect.gen(function* () {
  const utils = yield* WinkUtils
  return yield* utils.removeHTMLTags("<p>Effect NLP</p>")
})

Effect.runPromise(cleanup.pipe(Effect.provide(WinkUtilsLive))).then(console.log)
```

**Signature**

```ts
declare class WinkUtils
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/WinkUtils.service.ts#L314)

Since v0.0.0