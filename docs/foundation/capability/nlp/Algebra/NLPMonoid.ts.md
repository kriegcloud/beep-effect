---
title: NLPMonoid.ts
nav_order: 3
parent: "@beep/nlp"
---

## NLPMonoid.ts overview

Algebra/NLPMonoid - NLP-specific monoid structures.

Defines monoid instances specifically for NLP data structures, building on
the general monoid framework in `Monoid`. These provide mathematically
sound aggregation for:
- Tokens (words and their features)
- Sentences (sequences of tokens)
- Documents (collections of sentences)
- Linguistic annotations (POS tags, named entities, etc.)

Each monoid satisfies the monoid laws (associativity + left/right identity),
except `SentenceConcat`, which is a "near-monoid" (identity only) due to
punctuation normalization. Laws are verified in test/Algebra/NLPMonoid.test.ts.

Effect v4 `@beep/nlp` implementation. Map
and set carriers use Effect-native collection semantics at package
boundaries.

Since v0.0.0

---
## Exports Grouped by Category
- [combinators](#combinators)
  - [AnnotationMap](#annotationmap)
  - [DependencyParse](#dependencyparse)
  - [DocumentFrequency](#documentfrequency)
  - [DocumentStats](#documentstats)
  - [DocumentText](#documenttext)
  - [NGramFrequency](#ngramfrequency)
  - [NamedEntityList](#namedentitylist)
  - [SentenceArray](#sentencearray)
  - [SentenceConcat](#sentenceconcat)
  - [TermFrequency](#termfrequency)
  - [TextAnalysisMonoid](#textanalysismonoid)
  - [TokenBagOfWords](#tokenbagofwords)
  - [TokenConcat](#tokenconcat)
  - [TokenSetUnion](#tokensetunion)
  - [Vocabulary](#vocabulary)
  - [WeightedTokens](#weightedtokens)
- [models](#models)
  - [BagOfWords](#bagofwords)
  - [BagOfWords (type alias)](#bagofwords-type-alias)
  - [DependencyEdge (class)](#dependencyedge-class)
  - [DocumentStatistics (class)](#documentstatistics-class)
  - [NamedEntity (class)](#namedentity-class)
  - [TextAnalysis (class)](#textanalysis-class)
- [utilities](#utilities)
  - [aggregateSentences](#aggregatesentences)
  - [aggregateStats](#aggregatestats)
  - [aggregateTokens](#aggregatetokens)
  - [bagOfWordsToTF](#bagofwordstotf)
  - [computeTFIDF](#computetfidf)
---

# combinators

## AnnotationMap

Linguistic annotation monoid (left-biased map merge).

On key conflict the first (left) value wins. Useful for combining POS tags,
NER labels, dependency parses, etc. keyed by position.

**Example**

```ts
import * as MutableHashMap from "effect/MutableHashMap"
import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"

const Tags = NLPMonoid.AnnotationMap<number, string>()
const tags = Tags.combine(MutableHashMap.make([0, "NOUN"]), MutableHashMap.make([0, "PROPN"], [1, "VERB"]))

console.log(Array.from(tags))
// [[0, "NOUN"], [1, "VERB"]]
```

**Signature**

```ts
declare const AnnotationMap: <K, V>() => Monoid.Monoid<MutableHashMap.MutableHashMap<K, V>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/NLPMonoid.ts#L336)

Since v0.0.0

## DependencyParse

Dependency parse monoid (concatenate edges).

**Example**

```ts
import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"

const edges = NLPMonoid.DependencyParse.combine(
  [{ dependent: 1, head: 0, relation: "nsubj" }],
  [{ dependent: 2, head: 0, relation: "obj" }]
)

console.log(edges.map((edge) => edge.relation))
// ["nsubj", "obj"]
```

**Signature**

```ts
declare const DependencyParse: Monoid.Monoid<ReadonlyArray<DependencyEdge>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/NLPMonoid.ts#L453)

Since v0.0.0

## DocumentFrequency

Document frequency monoid (counts presence across documents; union with addition).

**Example**

```ts
import * as MutableHashMap from "effect/MutableHashMap"
import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"

const frequencies = NLPMonoid.DocumentFrequency.combine(
  MutableHashMap.make(["effect", 2], ["schema", 1]),
  MutableHashMap.make(["effect", 1], ["nlp", 1])
)

console.log(Array.from(frequencies))
// [["effect", 3], ["schema", 1], ["nlp", 1]]
```

**Signature**

```ts
declare const DocumentFrequency: Monoid.Monoid<MutableHashMap.MutableHashMap<string, number>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/NLPMonoid.ts#L501)

Since v0.0.0

## DocumentStats

Document statistics monoid (sum counts component-wise).

**Example**

```ts
import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"

const totals = NLPMonoid.DocumentStats.combine(
  { charCount: 12, sentenceCount: 1, wordCount: 3 },
  { charCount: 18, sentenceCount: 2, wordCount: 4 }
)

console.log(totals)
// { wordCount: 7, sentenceCount: 3, charCount: 30 }
```

**Signature**

```ts
declare const DocumentStats: Monoid.Monoid<DocumentStatistics>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/NLPMonoid.ts#L302)

Since v0.0.0

## DocumentText

Document text monoid (join paragraphs with a blank line).

**Example**

```ts
import * as Monoid from "@beep/nlp/Algebra/Monoid"
import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"

const document = Monoid.fold(NLPMonoid.DocumentText)(["Intro paragraph.", "Details paragraph."])

console.log(document)
// "Intro paragraph.\n\nDetails paragraph."
```

**Signature**

```ts
declare const DocumentText: Monoid.Monoid<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/NLPMonoid.ts#L250)

Since v0.0.0

## NGramFrequency

N-gram frequency monoid (bag-of-words over space-joined n-gram keys).

**Example**

```ts
import * as MutableHashMap from "effect/MutableHashMap"
import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"

const ngrams = NLPMonoid.NGramFrequency.combine(
  MutableHashMap.make(["effect schema", 2]),
  MutableHashMap.make(["effect schema", 1], ["schema docs", 1])
)

console.log(Array.from(ngrams))
// [["effect schema", 3], ["schema docs", 1]]
```

**Signature**

```ts
declare const NGramFrequency: Monoid.Monoid<MutableHashMap.MutableHashMap<string, number>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/NLPMonoid.ts#L577)

Since v0.0.0

## NamedEntityList

Named entity list monoid (concatenation; preserves order, allows duplicates).

**Example**

```ts
import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"

const entities = NLPMonoid.NamedEntityList.combine(
  [{ endPos: 6, startPos: 0, text: "Effect", type: "LIBRARY" }],
  [{ endPos: 19, startPos: 7, text: "Schema", type: "MODULE" }]
)

console.log(entities.map((entity) => entity.text))
// ["Effect", "Schema"]
```

**Signature**

```ts
declare const NamedEntityList: Monoid.Monoid<ReadonlyArray<NamedEntity>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/NLPMonoid.ts#L401)

Since v0.0.0

## SentenceArray

Sentence array monoid (concatenation; preserves order and boundaries).

**Example**

```ts
import * as Monoid from "@beep/nlp/Algebra/Monoid"
import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"

const sentences = Monoid.fold(NLPMonoid.SentenceArray)([
  ["First sentence."],
  ["Second sentence.", "Third sentence."]
])

console.log(sentences)
// ["First sentence.", "Second sentence.", "Third sentence."]
```

**Signature**

```ts
declare const SentenceArray: Monoid.Monoid<ReadonlyArray<string>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/NLPMonoid.ts#L227)

Since v0.0.0

## SentenceConcat

Sentence concatenation "near-monoid".

Combines sentences with a space and ensures the left sentence ends with
terminal punctuation. NOTE: this satisfies the identity laws but NOT strict
associativity (punctuation normalization is not associative), so it is a
pragmatic near-monoid for text joining.

**Example**

```ts
import * as Monoid from "@beep/nlp/Algebra/Monoid"
import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"

const paragraph = Monoid.fold(NLPMonoid.SentenceConcat)(["Effect parses text", "Schemas validate output"])

console.log(paragraph)
// "Effect parses text. Schemas validate output"
```

**Signature**

```ts
declare const SentenceConcat: Monoid.Monoid<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/NLPMonoid.ts#L197)

Since v0.0.0

## TermFrequency

Term frequency monoid (alias of `TokenBagOfWords`; semantic distinction).

**Example**

```ts
import * as MutableHashMap from "effect/MutableHashMap"
import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"

const termCounts = NLPMonoid.TermFrequency.combine(
  MutableHashMap.make(["effect", 1]),
  MutableHashMap.make(["effect", 2], ["docs", 1])
)

console.log(Array.from(termCounts))
// [["effect", 3], ["docs", 1]]
```

**Signature**

```ts
declare const TermFrequency: Monoid.Monoid<MutableHashMap.MutableHashMap<string, number>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/NLPMonoid.ts#L479)

Since v0.0.0

## TextAnalysisMonoid

Text analysis monoid (product monoid over the linguistic features).

**Example**

```ts
import * as HashSet from "effect/HashSet"
import * as MutableHashMap from "effect/MutableHashMap"
import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"

const combined = NLPMonoid.TextAnalysisMonoid.combine(
  {
    bow: MutableHashMap.make(["effect", 1]),
    entities: [{ endPos: 6, startPos: 0, text: "Effect", type: "LIBRARY" }],
    sentenceCount: 1,
    vocabulary: HashSet.make("effect")
  },
  {
    bow: MutableHashMap.make(["schema", 2]),
    entities: [],
    sentenceCount: 2,
    vocabulary: HashSet.make("schema")
  }
)

console.log({
  bow: Array.from(combined.bow),
  sentenceCount: combined.sentenceCount,
  vocabulary: Array.from(combined.vocabulary).sort()
})
// { bow: [["effect", 1], ["schema", 2]], sentenceCount: 3, vocabulary: ["effect", "schema"] }
```

**Signature**

```ts
declare const TextAnalysisMonoid: Monoid.Monoid<TextAnalysis>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/NLPMonoid.ts#L656)

Since v0.0.0

## TokenBagOfWords

Token bag-of-words monoid (union with frequency addition).

A monoid homomorphism from the free monoid `Token*` to the multiset monoid.

**Example**

```ts
import * as MutableHashMap from "effect/MutableHashMap"
import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"

const left = MutableHashMap.make(["effect", 2])
const right = MutableHashMap.make(["effect", 1], ["schema", 1])
const counts = NLPMonoid.TokenBagOfWords.combine(left, right)

console.log(Array.from(counts))
// [["effect", 3], ["schema", 1]]
```

**Signature**

```ts
declare const TokenBagOfWords: Monoid.Monoid<MutableHashMap.MutableHashMap<string, number>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/NLPMonoid.ts#L143)

Since v0.0.0

## TokenConcat

Token concatenation monoid (join with a space).

This folds a token sequence back into plain text.

**Example**

```ts
import * as Monoid from "@beep/nlp/Algebra/Monoid"
import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"

const text = Monoid.fold(NLPMonoid.TokenConcat)(["effect", "schema", "docs"])

console.log(text)
// "effect schema docs"
```

**Signature**

```ts
declare const TokenConcat: Monoid.Monoid<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/NLPMonoid.ts#L120)

Since v0.0.0

## TokenSetUnion

Token set-union monoid (collect unique tokens; useful for vocabulary).

**Example**

```ts
import * as Monoid from "@beep/nlp/Algebra/Monoid"
import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"
import * as HashSet from "effect/HashSet"

const vocabulary = Monoid.fold(NLPMonoid.TokenSetUnion)([
  HashSet.make("effect", "schema"),
  HashSet.make("schema", "docs")
])

console.log(Array.from(vocabulary).sort())
// ["docs", "effect", "schema"]
```

**Signature**

```ts
declare const TokenSetUnion: Monoid.Monoid<TokenHashSet>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/NLPMonoid.ts#L169)

Since v0.0.0

## Vocabulary

Vocabulary monoid (unique terms; alias of `TokenSetUnion`).

**Example**

```ts
import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"
import * as HashSet from "effect/HashSet"

const vocabulary = NLPMonoid.Vocabulary.combine(
  HashSet.make("effect", "schema"),
  HashSet.make("schema", "nlp")
)

console.log(Array.from(vocabulary).sort())
// ["effect", "nlp", "schema"]
```

**Signature**

```ts
declare const Vocabulary: Monoid.Monoid<TokenHashSet>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/NLPMonoid.ts#L526)

Since v0.0.0

## WeightedTokens

Weighted token monoid (combine weights additively per token).

**Example**

```ts
import * as MutableHashMap from "effect/MutableHashMap"
import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"

const weights = NLPMonoid.WeightedTokens.combine(
  MutableHashMap.make(["effect", 0.4], ["schema", 0.8]),
  MutableHashMap.make(["effect", 0.3])
)

console.log(Array.from(weights))
// [["effect", 0.7], ["schema", 0.8]]
```

**Signature**

```ts
declare const WeightedTokens: Monoid.Monoid<MutableHashMap.MutableHashMap<string, number>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/NLPMonoid.ts#L552)

Since v0.0.0

# models

## BagOfWords

Bag-of-words frequency map carrier: term -\> frequency.

**Example**

```ts
import * as MutableHashMap from "effect/MutableHashMap"
import type * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"

const bow: NLPMonoid.BagOfWords = MutableHashMap.make(
  ["effect", 2],
  ["schema", 1]
)

console.log(Array.from(bow))
// [["effect", 2], ["schema", 1]]
```

**Signature**

```ts
declare const BagOfWords: MutableHashMapFromSelf<S.String, S.Finite>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/NLPMonoid.ts#L76)

Since v0.0.0

## BagOfWords (type alias)

Runtime type for the `BagOfWords` frequency-map carrier.

**Example**

```ts
import * as MutableHashMap from "effect/MutableHashMap"
import type { BagOfWords } from "@beep/nlp/Algebra/NLPMonoid"

const bow: BagOfWords = MutableHashMap.make(["effect", 1])

console.log(Array.from(bow))
// [["effect", 1]]
```

**Signature**

```ts
type BagOfWords = typeof BagOfWords.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/NLPMonoid.ts#L95)

Since v0.0.0

## DependencyEdge (class)

Dependency parse edge carrier: a syntactic dependency (head, dependent, relation).

**Example**

```ts
import type * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"

const edge: NLPMonoid.DependencyEdge = {
  dependent: 2,
  head: 1,
  relation: "amod"
}

console.log(edge.relation)
// "amod"
```

**Signature**

```ts
declare class DependencyEdge
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/NLPMonoid.ts#L423)

Since v0.0.0

## DocumentStatistics (class)

Document statistics carrier.

**Example**

```ts
import type * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"

const stats: NLPMonoid.DocumentStatistics = {
  charCount: 42,
  sentenceCount: 2,
  wordCount: 7
}

console.log(stats.wordCount)
// 7
```

**Signature**

```ts
declare class DocumentStatistics
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/NLPMonoid.ts#L272)

Since v0.0.0

## NamedEntity (class)

Named entity carrier.

**Example**

```ts
import type * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"

const entity: NLPMonoid.NamedEntity = {
  endPos: 13,
  startPos: 0,
  text: "Effect Schema",
  type: "PRODUCT"
}

console.log(entity.type)
// "PRODUCT"
```

**Signature**

```ts
declare class NamedEntity
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/NLPMonoid.ts#L370)

Since v0.0.0

## TextAnalysis (class)

Combined text analysis carrier (bag-of-words + entities + sentence count + vocabulary).

**Example**

```ts
import * as HashSet from "effect/HashSet"
import * as MutableHashMap from "effect/MutableHashMap"
import type * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"

const analysis: NLPMonoid.TextAnalysis = {
  bow: MutableHashMap.make(["effect", 2]),
  entities: [{ endPos: 6, startPos: 0, text: "Effect", type: "LIBRARY" }],
  sentenceCount: 1,
  vocabulary: HashSet.make("effect")
}

console.log(analysis.sentenceCount)
// 1
```

**Signature**

```ts
declare class TextAnalysis
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/NLPMonoid.ts#L609)

Since v0.0.0

# utilities

## aggregateSentences

Aggregate sentences into a single document string.

**Example**

```ts
import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"

const text = NLPMonoid.aggregateSentences(["Effect parses text", "Schemas validate output"])

console.log(text)
// "Effect parses text. Schemas validate output"
```

**Signature**

```ts
declare const aggregateSentences: (sentences: ReadonlyArray<string>) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/NLPMonoid.ts#L778)

Since v0.0.0

## aggregateStats

Aggregate document statistics.

**Example**

```ts
import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"

const totals = NLPMonoid.aggregateStats([
  { charCount: 10, sentenceCount: 1, wordCount: 2 },
  { charCount: 25, sentenceCount: 2, wordCount: 5 }
])

console.log(totals)
// { wordCount: 7, sentenceCount: 3, charCount: 35 }
```

**Signature**

```ts
declare const aggregateStats: (stats: ReadonlyArray<DocumentStatistics>) => DocumentStatistics
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/NLPMonoid.ts#L799)

Since v0.0.0

## aggregateTokens

Aggregate tokens into a bag of words.

**Example**

```ts
import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"

const counts = NLPMonoid.aggregateTokens(["effect", "schema", "effect"])

console.log(Array.from(counts))
// [["effect", 2], ["schema", 1]]
```

**Signature**

```ts
declare const aggregateTokens: (tokens: ReadonlyArray<string>) => BagOfWords
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/NLPMonoid.ts#L759)

Since v0.0.0

## bagOfWordsToTF

Convert a bag of words to term frequency (each count normalized by the total).

**Example**

```ts
import * as MutableHashMap from "effect/MutableHashMap"
import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"

const tf = NLPMonoid.bagOfWordsToTF(MutableHashMap.make(["effect", 3], ["schema", 1]))

console.log(Array.from(tf))
// [["effect", 0.75], ["schema", 0.25]]
```

**Signature**

```ts
declare const bagOfWordsToTF: (bow: BagOfWords) => TermNumberMap
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/NLPMonoid.ts#L692)

Since v0.0.0

## computeTFIDF

Compute TF-IDF scores from term frequency and document frequency.

`TF-IDF(t, d) = TF(t, d) * log(N / DF(t))`.

**Example**

```ts
import * as MutableHashMap from "effect/MutableHashMap"
import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"

const scores = NLPMonoid.computeTFIDF(
  MutableHashMap.make(["effect", 0.5], ["schema", 0.5]),
  MutableHashMap.make(["effect", 2], ["schema", 1]),
  4
)

console.log(Array.from(scores))
// [["effect", 0.34657359027997264], ["schema", 0.6931471805599453]]
```

**Signature**

```ts
declare const computeTFIDF: (tf: TermNumberMap, df: TermNumberMap, totalDocs: number) => TermNumberMap
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/NLPMonoid.ts#L729)

Since v0.0.0