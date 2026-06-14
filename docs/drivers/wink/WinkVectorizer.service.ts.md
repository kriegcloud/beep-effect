---
title: WinkVectorizer.service.ts
nav_order: 14
parent: "@beep/wink"
---

## WinkVectorizer.service.ts overview

Wink BM25 vectorizer service and related domain models.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [VectorizerError (class)](#vectorizererror-class)
- [layers](#layers)
  - [WinkVectorizerLive](#winkvectorizerlive)
- [services](#services)
  - [ScopedVectorizer (interface)](#scopedvectorizer-interface)
  - [WinkVectorizer (class)](#winkvectorizer-class)
---

# errors

## VectorizerError (class)

Typed failure for learning documents or querying wink BM25 vector data.

**Example**

```ts
import { VectorizerError } from "@beep/wink"

const error = VectorizerError.fromMessage("Document index is out of range", "tf")
console.log(error.message)
```

**Signature**

```ts
declare class VectorizerError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/WinkVectorizer.service.ts#L175)

Since v0.0.0

# layers

## WinkVectorizerLive

Live BM25 vectorizer layer that depends on the wink engine.

**Example**

```ts
import { Effect, Layer } from "effect"
import { WinkEngineLive } from "@beep/wink"
import { WinkVectorizer, WinkVectorizerLive } from "@beep/wink"

const readDefaultConfig = Effect.gen(function* () {
  const vectorizer = yield* WinkVectorizer
  return yield* vectorizer.getConfig
})

Effect.runPromise(
  readDefaultConfig.pipe(Effect.provide(WinkVectorizerLive.pipe(Layer.provide(WinkEngineLive))))
).then((config) => console.log(config.k1))
```

**Signature**

```ts
declare const WinkVectorizerLive: Layer.Layer<WinkVectorizer, WinkEngineError | VectorizerError, WinkEngine>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/WinkVectorizer.service.ts#L412)

Since v0.0.0

# services

## ScopedVectorizer (interface)

Isolated vectorizer surface passed to scoped BM25 workflows.

**Example**

```ts
import { Effect } from "effect"
import type { ScopedVectorizer } from "@beep/wink"

const readFirstDocumentTerms = (scoped: ScopedVectorizer) =>
  scoped.getDocumentTermFrequencies(0).pipe(Effect.map((terms) => terms.length))

console.log(typeof readFirstDocumentTerms)
```

**Signature**

```ts
export interface ScopedVectorizer {
  readonly getDocumentTermFrequencies: (
    docIndex: number
  ) => Effect.Effect<ReadonlyArray<TermFrequency>, VectorizerError>;
  readonly learnDocument: (document: Document) => Effect.Effect<void, VectorizerError>;
  readonly vectorizeDocument: (document: Document) => Effect.Effect<DocumentVector, VectorizerError>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/WinkVectorizer.service.ts#L91)

Since v0.0.0

## WinkVectorizer (class)

Service for learning documents and producing BM25 vectors, bags, and term frequencies.

**Example**

```ts
import { Effect } from "effect"
import { WinkEngineLive } from "@beep/wink"
import { WinkVectorizer, WinkVectorizerLive } from "@beep/wink"

const readConfig = Effect.gen(function* () {
  const vectorizer = yield* WinkVectorizer
  return yield* vectorizer.getConfig
})

Effect.runPromise(
  readConfig.pipe(Effect.provide(WinkVectorizerLive), Effect.provide(WinkEngineLive))
).then((config) => console.log(config.norm))
```

**Signature**

```ts
declare class WinkVectorizer
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/WinkVectorizer.service.ts#L388)

Since v0.0.0