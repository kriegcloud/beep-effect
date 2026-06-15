---
title: Vectorization.ts
nav_order: 17
parent: "@beep/nlp"
---

## Vectorization.ts overview

Driver-neutral vectorization models used by NLP retrieval services.

Since v0.0.0

---
## Exports Grouped by Category
- [configuration](#configuration)
  - [DefaultBM25Config](#defaultbm25config)
- [models](#models)
  - [BM25Config (class)](#bm25config-class)
  - [BM25Norm](#bm25norm)
  - [BM25Norm (type alias)](#bm25norm-type-alias)
  - [BagOfWords (class)](#bagofwords-class)
  - [DocumentVector (class)](#documentvector-class)
  - [TermFrequency (class)](#termfrequency-class)
---

# configuration

## DefaultBM25Config

Default BM25 hyperparameters used by live vectorizers.

**Example**

```ts
import { DefaultBM25Config } from "@beep/nlp/Core/Vectorization"

console.log(DefaultBM25Config.norm)
```

**Signature**

```ts
declare const DefaultBM25Config: BM25Config
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Vectorization.ts#L97)

Since v0.0.0

# models

## BM25Config (class)

Resolved BM25 hyperparameters used by vectorization and corpus management.

**Example**

```ts
import { BM25Config } from "@beep/nlp/Core/Vectorization"

const config = BM25Config.make({
  b: 0.75,
  k: 1,
  k1: 1.2,
  norm: "none"
})

console.log(config.k1)
```

**Signature**

```ts
declare class BM25Config
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Vectorization.ts#L72)

Since v0.0.0

## BM25Norm

BM25 normalization mode used by vectorizer and corpus services.

**Example**

```ts
import * as S from "effect/Schema"
import { BM25Norm } from "@beep/nlp/Core/Vectorization"

const norm = S.decodeSync(BM25Norm)("l2")
console.log(norm)
```

**Signature**

```ts
declare const BM25Norm: LiteralKit<readonly ["none", "l1", "l2"], undefined> & SchemaStatics<LiteralKit<readonly ["none", "l1", "l2"], undefined>> & LiteralKitStatics<readonly ["none", "l1", "l2"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Vectorization.ts#L37)

Since v0.0.0

## BM25Norm (type alias)

Runtime TypeScript union decoded by `BM25Norm`.

**Signature**

```ts
type BM25Norm = typeof BM25Norm.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Vectorization.ts#L50)

Since v0.0.0

## BagOfWords (class)

Bag-of-words term-frequency representation for a document or query.

**Example**

```ts
import { DocumentId } from "@beep/nlp/Core/Document"
import { BagOfWords } from "@beep/nlp/Core/Vectorization"

const bow = BagOfWords.make({
  bow: { effect: 2, schema: 1 },
  documentId: DocumentId.make("doc-a")
})

console.log(bow.bow.effect)
```

**Signature**

```ts
declare class BagOfWords
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Vectorization.ts#L154)

Since v0.0.0

## DocumentVector (class)

Dense vector representation for a document or query.

**Example**

```ts
import { DocumentId } from "@beep/nlp/Core/Document"
import { DocumentVector } from "@beep/nlp/Core/Vectorization"

const vector = DocumentVector.make({
  documentId: DocumentId.make("doc-a"),
  terms: ["effect", "schema"],
  vector: [0.7, 0.3]
})

console.log(vector.vector.length)
```

**Signature**

```ts
declare class DocumentVector
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Vectorization.ts#L124)

Since v0.0.0

## TermFrequency (class)

Term-frequency entry reported for a learned vectorized document.

**Example**

```ts
import { TermFrequency } from "@beep/nlp/Core/Vectorization"

const tf = TermFrequency.make({
  frequency: 3,
  term: "effect"
})

console.log(`${tf.term}:${tf.frequency}`)
```

**Signature**

```ts
declare class TermFrequency
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Vectorization.ts#L182)

Since v0.0.0