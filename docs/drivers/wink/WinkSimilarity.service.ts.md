---
title: WinkSimilarity.service.ts
nav_order: 10
parent: "@beep/wink"
---

## WinkSimilarity.service.ts overview

Wink similarity services and domain models.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [SimilarityError (class)](#similarityerror-class)
- [layers](#layers)
  - [WinkSimilarityLive](#winksimilaritylive)
- [services](#services)
  - [WinkSimilarity (class)](#winksimilarity-class)
---

# errors

## SimilarityError (class)

Typed failure for wink-backed vector, set, or bag-of-words similarity.

**Example**

```ts
import { SimilarityError } from "@beep/wink"

const error = SimilarityError.fromCause(new Error("bad vector"), "vectorCosine")
console.log(error.operation)
```

**Signature**

```ts
declare class SimilarityError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/WinkSimilarity.service.ts#L67)

Since v0.0.0

# layers

## WinkSimilarityLive

Live layer for wink similarity utilities.

**Example**

```ts
import { Effect } from "effect"
import { DocumentId } from "@beep/nlp/Core/Document"
import { DocumentTermSet, TverskyParams } from "@beep/nlp/Core/Similarity"
import { WinkSimilarity, WinkSimilarityLive } from "@beep/wink"

const program = Effect.gen(function* () {
  const similarity = yield* WinkSimilarity
  return yield* similarity.setTversky(
    DocumentTermSet.make({ documentId: DocumentId.make("left"), terms: ["nlp"] }),
    DocumentTermSet.make({ documentId: DocumentId.make("right"), terms: ["nlp", "search"] }),
    TverskyParams.make({ alpha: 0.5, beta: 0.5 })
  )
})

Effect.runPromise(program.pipe(Effect.provide(WinkSimilarityLive))).then((score) =>
  console.log(score.method)
)
```

**Signature**

```ts
declare const WinkSimilarityLive: Layer.Layer<WinkSimilarity, SimilarityError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/WinkSimilarity.service.ts#L285)

Since v0.0.0

# services

## WinkSimilarity (class)

Service for computing cosine and Tversky scores using wink similarity helpers.

**Example**

```ts
import { Effect } from "effect"
import { DocumentId } from "@beep/nlp/Core/Document"
import { DocumentTermSet, TverskyParams } from "@beep/nlp/Core/Similarity"
import { WinkSimilarity, WinkSimilarityLive } from "@beep/wink"

const compare = Effect.gen(function* () {
  const similarity = yield* WinkSimilarity
  return yield* similarity.setTversky(
    DocumentTermSet.make({ documentId: DocumentId.make("doc-a"), terms: ["effect", "schema"] }),
    DocumentTermSet.make({ documentId: DocumentId.make("doc-b"), terms: ["effect", "docs"] }),
    TverskyParams.make({ alpha: 0.5, beta: 0.5 })
  )
})

Effect.runPromise(compare.pipe(Effect.provide(WinkSimilarityLive))).then((score) =>
  console.log(score.score)
)
```

**Signature**

```ts
declare class WinkSimilarity
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/WinkSimilarity.service.ts#L256)

Since v0.0.0