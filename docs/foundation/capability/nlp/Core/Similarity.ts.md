---
title: Similarity.ts
nav_order: 14
parent: "@beep/nlp"
---

## Similarity.ts overview

Driver-neutral similarity models used by NLP comparison services.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [DocumentTermSet (class)](#documenttermset-class)
  - [SimilarityMethod](#similaritymethod)
  - [SimilarityMethod (type alias)](#similaritymethod-type-alias)
  - [SimilarityScore (class)](#similarityscore-class)
  - [TverskyParams (class)](#tverskyparams-class)
---

# models

## DocumentTermSet (class)

Normalized terms for one document in set-based similarity comparisons.

**Example**

```ts
import { DocumentId } from "@beep/nlp/Core/Document"
import { DocumentTermSet } from "@beep/nlp/Core/Similarity"

const terms = DocumentTermSet.make({
  documentId: DocumentId.make("doc-a"),
  terms: ["effect", "schema", "nlp"]
})

console.log(terms.terms.length)
```

**Signature**

```ts
declare class DocumentTermSet
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Similarity.ts#L93)

Since v0.0.0

## SimilarityMethod

Similarity method identifiers exposed by NLP comparison services.

**Example**

```ts
import { SimilarityMethod } from "@beep/nlp/Core/Similarity"

console.log(SimilarityMethod.is["vector.cosine"]("vector.cosine"))
```

**Signature**

```ts
declare const SimilarityMethod: LiteralKit<readonly ["vector.cosine", "set.tversky", "bow.cosine"], undefined> & SchemaStatics<LiteralKit<readonly ["vector.cosine", "set.tversky", "bow.cosine"], undefined>> & LiteralKitStatics<readonly ["vector.cosine", "set.tversky", "bow.cosine"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Similarity.ts#L35)

Since v0.0.0

## SimilarityMethod (type alias)

Runtime TypeScript union decoded by `SimilarityMethod`.

**Signature**

```ts
type SimilarityMethod = typeof SimilarityMethod.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Similarity.ts#L48)

Since v0.0.0

## SimilarityScore (class)

Normalized similarity score returned from an NLP comparison.

**Example**

```ts
import * as O from "effect/Option"
import { DocumentId } from "@beep/nlp/Core/Document"
import { SimilarityScore } from "@beep/nlp/Core/Similarity"

const score = SimilarityScore.make({
  document1Id: DocumentId.make("doc-a"),
  document2Id: DocumentId.make("doc-b"),
  method: "set.tversky",
  parameters: O.some({ alpha: 0.7, beta: 0.3 }),
  score: 0.8
})

console.log(score.method)
```

**Signature**

```ts
declare class SimilarityScore
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Similarity.ts#L126)

Since v0.0.0

## TverskyParams (class)

Weights controlling the asymmetric Tversky set similarity index.

**Example**

```ts
import { TverskyParams } from "@beep/nlp/Core/Similarity"

const params = TverskyParams.make({ alpha: 0.7, beta: 0.3 })
console.log(params.alpha + params.beta)
```

**Signature**

```ts
declare class TverskyParams
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Similarity.ts#L64)

Since v0.0.0