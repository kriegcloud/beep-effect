---
title: WinkCorpus.service.ts
nav_order: 7
parent: "@beep/wink"
---

## WinkCorpus.service.ts overview

Stateful corpus management built on wink BM25 vectorization.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [CorpusManagerError (class)](#corpusmanagererror-class)
    - [fromMessage (static method)](#frommessage-static-method)
- [layers](#layers)
  - [WinkCorpusManagerLive](#winkcorpusmanagerlive)
- [services](#services)
  - [WinkCorpusManager (class)](#winkcorpusmanager-class)
---

# errors

## CorpusManagerError (class)

Typed failure for creating, learning, querying, or inspecting a managed corpus.

**Example**

```ts
import { CorpusManagerError } from "@beep/wink"

const error = CorpusManagerError.fromMessage("Corpus does not exist", "support-docs")
console.log(error.corpusId._tag)
```

**Signature**

```ts
declare class CorpusManagerError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/WinkCorpus.service.ts#L340)

Since v0.0.0

### fromMessage (static method)

Create a corpus-manager error without an external cause.

**Signature**

```ts
declare const fromMessage: (message: string, corpusId?: string) => CorpusManagerError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/WinkCorpus.service.ts#L379)

# layers

## WinkCorpusManagerLive

Live corpus manager layer requiring the wink engine and similarity services.

**Example**

```ts
import { Effect, Layer } from "effect"
import { WinkEngineLive } from "@beep/wink"
import { WinkSimilarityLive } from "@beep/wink"
import { WinkCorpusManager, WinkCorpusManagerLive } from "@beep/wink"

const createCorpus = Effect.gen(function* () {
  const manager = yield* WinkCorpusManager
  return yield* manager.createCorpus({ corpusId: "support-docs" })
})

Effect.runPromise(
  createCorpus.pipe(
    Effect.provide(WinkCorpusManagerLive.pipe(Layer.provideMerge(Layer.mergeAll(WinkEngineLive, WinkSimilarityLive))))
  )
).then((summary) => console.log(summary.corpusId))
```

**Signature**

```ts
declare const WinkCorpusManagerLive: Layer.Layer<WinkCorpusManager, CorpusManagerError, WinkEngine | WinkSimilarity>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/WinkCorpus.service.ts#L859)

Since v0.0.0

# services

## WinkCorpusManager (class)

Service for managing stateful BM25 corpora and query sessions.

**Example**

```ts
import { Effect } from "effect"
import { WinkLayerAllLive } from "@beep/wink"
import { WinkCorpusManager } from "@beep/wink"

const createCorpus = Effect.gen(function* () {
  const manager = yield* WinkCorpusManager
  return yield* manager.createCorpus({ corpusId: "support-docs" })
})

Effect.runPromise(createCorpus.pipe(Effect.provide(WinkLayerAllLive))).then((summary) =>
  console.log(summary.documentCount)
)
```

**Signature**

```ts
declare class WinkCorpusManager
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/WinkCorpus.service.ts#L830)

Since v0.0.0