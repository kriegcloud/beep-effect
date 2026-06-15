---
title: Wink.layer.ts
nav_order: 3
parent: "@beep/wink"
---

## Wink.layer.ts overview

Wink layer composition helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [layers](#layers)
  - [WinkCorpusManagerLive](#winkcorpusmanagerlive)
  - [WinkEngineLive](#winkenginelive)
  - [WinkEngineRefLive](#winkenginereflive)
  - [WinkLayerAllLive](#winklayeralllive)
  - [WinkLayerLive](#winklayerlive)
  - [WinkSimilarityLive](#winksimilaritylive)
  - [WinkTokenization](#winktokenization)
  - [WinkTokenizationLive](#winktokenizationlive)
  - [WinkUtilsLive](#winkutilslive)
  - [WinkVectorizerLive](#winkvectorizerlive)
- [services](#services)
  - [WinkEngine](#winkengine)
---

# layers

## WinkCorpusManagerLive

Live layer for stateful corpus indexing and query services.

**Example**

```ts
import { Layer } from "effect"
import { WinkCorpusManagerLive, WinkEngineLive, WinkSimilarityLive } from "@beep/wink"

const runnable = WinkCorpusManagerLive.pipe(
  Layer.provideMerge(Layer.mergeAll(WinkEngineLive, WinkSimilarityLive))
)
```

**Signature**

```ts
declare const WinkCorpusManagerLive: Layer.Layer<WinkCorpusManager, CorpusManagerError, WinkEngineService | WinkSimilarity>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/Wink.layer.ts#L90)

Since v0.0.0

## WinkEngineLive

Live layer that initializes `wink-nlp` with the English lite web model.

**Example**

```ts
import { Effect } from "effect"
import { WinkEngine, WinkEngineLive } from "@beep/wink"

const readHelpers = Effect.gen(function* () {
  const engine = yield* WinkEngine
  return yield* engine.its
})

Effect.runPromise(readHelpers.pipe(Effect.provide(WinkEngineLive))).then((its) =>
  console.log(typeof its.normal)
)
```

**Signature**

```ts
declare const WinkEngineLive: Layer.Layer<WinkEngineService, WinkEngineError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/Wink.layer.ts#L132)

Since v0.0.0

## WinkEngineRefLive

Live layer for compatibility access to the shared wink engine state ref.

**Example**

```ts
import { Effect, Layer } from "effect"
import { WinkEngineRef } from "@beep/wink"
import { WinkEngineLive, WinkEngineRefLive } from "@beep/wink"

const readRef = Effect.gen(function* () {
  const ref = yield* WinkEngineRef
  return ref.getRef()
})

const runnable = readRef.pipe(Effect.provide(WinkEngineRefLive.pipe(Layer.provide(WinkEngineLive))))
```

**Signature**

```ts
declare const WinkEngineRefLive: Layer.Layer<WinkEngineRef, never, WinkEngineService>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/Wink.layer.ts#L153)

Since v0.0.0

## WinkLayerAllLive

Full live wink layer bundle including corpus management and shared utilities.

**Example**

```ts
import { Effect } from "effect"
import { WinkCorpusManager } from "@beep/wink"
import { WinkLayerAllLive } from "@beep/wink"

const create = Effect.gen(function* () {
  const corpus = yield* WinkCorpusManager
  return yield* corpus.createCorpus({ corpusId: "docs" })
})

Effect.runPromise(create.pipe(Effect.provide(WinkLayerAllLive))).then((summary) =>
  console.log(summary.corpusId)
)
```

**Signature**

```ts
declare const WinkLayerAllLive: Layer.Layer<Tokenization | WinkEngineService | WinkCorpusManager | WinkSimilarity | WinkEngineRef | WinkVectorizer | WinkUtils, WinkEngineError | CorpusManagerError | SimilarityError | VectorizerError | WinkUtilsError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/Wink.layer.ts#L72)

Since v0.0.0

## WinkLayerLive

Live layer bundle for the engine-backed tokenization surface.

**Example**

```ts
import { Effect } from "effect"
import { Tokenization } from "@beep/nlp/Core"
import { WinkLayerLive } from "@beep/wink"

const count = Effect.gen(function* () {
  const tokenization = yield* Tokenization
  return yield* tokenization.tokenCount("Wink tokenizes this sentence.")
})

Effect.runPromise(count.pipe(Effect.provide(WinkLayerLive))).then(console.log)
```

**Signature**

```ts
declare const WinkLayerLive: Layer.Layer<Tokenization | WinkEngineService, WinkEngineError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/Wink.layer.ts#L40)

Since v0.0.0

## WinkSimilarityLive

Live layer for wink-backed vector, set, and bag-of-words similarity.

**Example**

```ts
import { Effect } from "effect"
import { WinkSimilarity } from "@beep/wink"
import { WinkSimilarityLive } from "@beep/wink"

const program = Effect.gen(function* () {
  const similarity = yield* WinkSimilarity
  return similarity
})

Effect.runPromise(program.pipe(Effect.provide(WinkSimilarityLive))).then((service) =>
  console.log(typeof service.vectorCosine)
)
```

**Signature**

```ts
declare const WinkSimilarityLive: Layer.Layer<WinkSimilarity, SimilarityError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/Wink.layer.ts#L176)

Since v0.0.0

## WinkTokenization

Engine-dependent layer that implements the core tokenization service.

**Example**

```ts
import { Layer } from "effect"
import { WinkEngineLive, WinkTokenization } from "@beep/wink"

const runnable = WinkTokenization.pipe(Layer.provide(WinkEngineLive))
```

**Signature**

```ts
declare const WinkTokenization: Layer.Layer<Tokenization, never, WinkEngineService>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/Wink.layer.ts#L191)

Since v0.0.0

## WinkTokenizationLive

Live tokenization layer with the wink engine already provided.

**Example**

```ts
import { Effect } from "effect"
import { Tokenization } from "@beep/nlp/Core"
import { WinkTokenizationLive } from "@beep/wink"

const program = Effect.gen(function* () {
  const tokenization = yield* Tokenization
  return yield* tokenization.tokenize("Tokenize this.")
})

Effect.runPromise(program.pipe(Effect.provide(WinkTokenizationLive))).then((tokens) =>
  console.log(tokens.length)
)
```

**Signature**

```ts
declare const WinkTokenizationLive: Layer.Layer<Tokenization, WinkEngineError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/Wink.layer.ts#L214)

Since v0.0.0

## WinkUtilsLive

Live layer for `wink-nlp-utils` string and token helper wrappers.

**Example**

```ts
import { Effect } from "effect"
import { WinkUtils } from "@beep/wink"
import { WinkUtilsLive } from "@beep/wink"

const program = Effect.gen(function* () {
  const utils = yield* WinkUtils
  return yield* utils.removeExtraSpaces("too    much")
})

Effect.runPromise(program.pipe(Effect.provide(WinkUtilsLive))).then(console.log)
```

**Signature**

```ts
declare const WinkUtilsLive: Layer.Layer<WinkUtils, WinkUtilsError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/Wink.layer.ts#L235)

Since v0.0.0

## WinkVectorizerLive

Live layer for BM25 vectorization backed by the wink engine.

**Example**

```ts
import { Effect, Layer } from "effect"
import { WinkVectorizer } from "@beep/wink"
import { WinkEngineLive, WinkVectorizerLive } from "@beep/wink"

const readConfig = Effect.gen(function* () {
  const vectorizer = yield* WinkVectorizer
  return yield* vectorizer.getConfig
})

const runnable = readConfig.pipe(Effect.provide(WinkVectorizerLive.pipe(Layer.provide(WinkEngineLive))))
```

**Signature**

```ts
declare const WinkVectorizerLive: Layer.Layer<WinkVectorizer, WinkEngineError | VectorizerError, WinkEngineService>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/Wink.layer.ts#L256)

Since v0.0.0

# services

## WinkEngine

Service tag for direct access to the underlying wink runtime.

**Example**

```ts
import { Effect } from "effect"
import { WinkEngine, WinkEngineLive } from "@beep/wink"

const count = Effect.gen(function* () {
  const engine = yield* WinkEngine
  return yield* engine.getWinkTokenCount("Direct wink engine access.")
})

Effect.runPromise(count.pipe(Effect.provide(WinkEngineLive))).then(console.log)
```

**Signature**

```ts
declare const WinkEngine: typeof WinkEngineService
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/Wink.layer.ts#L110)

Since v0.0.0