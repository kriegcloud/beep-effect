---
title: _schemas.ts
nav_order: 44
parent: "@beep/nlp"
---

## _schemas.ts overview

AI-facing output models for NLP tools.

Since v0.0.0

---
## Exports Grouped by Category
- [tool-schemas](#tool-schemas)
  - [AiAnalysis (class)](#aianalysis-class)
  - [AiCorpusConfig (class)](#aicorpusconfig-class)
  - [AiCorpusIdf (class)](#aicorpusidf-class)
  - [AiCorpusMatrixShape (class)](#aicorpusmatrixshape-class)
  - [AiCorpusRankedDocument (class)](#aicorpusrankeddocument-class)
  - [AiCorpusStats (class)](#aicorpusstats-class)
  - [AiCorpusSummary (class)](#aicorpussummary-class)
  - [AiDocumentStats (class)](#aidocumentstats-class)
  - [AiEntity (class)](#aientity-class)
  - [AiKeyword (class)](#aikeyword-class)
  - [AiNGram (class)](#aingram-class)
  - [AiPhoneticMatch (class)](#aiphoneticmatch-class)
  - [AiRankedText (class)](#airankedtext-class)
  - [AiSentence (class)](#aisentence-class)
  - [AiSentenceChunk (class)](#aisentencechunk-class)
  - [AiToken (class)](#aitoken-class)
  - [AiToolError (class)](#aitoolerror-class)
---

# tool-schemas

## AiAnalysis (class)

Output schema for a composite linguistic analysis of a text.

The model bundles document-level counts, detected sentence texts, and the
full annotated token stream so a single tool call can return the data that
tokenization, sentence, and statistics tools would otherwise produce.

**Example**

```ts
import * as S from "effect/Schema"
import { AiAnalysis } from "@beep/nlp/Tools/_schemas"

const analysis = S.decodeUnknownSync(AiAnalysis)({
  characterCount: 12,
  sentenceCount: 1,
  sentences: ["Hello world."],
  tokenCount: 3,
  tokens: [
    {
      end: 5,
      isPunctuation: false,
      isStopWord: false,
      lemma: "hello",
      pos: "INTJ",
      start: 0,
      stem: "hello",
      text: "Hello"
    }
  ],
  wordCount: 2
})

analysis.tokenCount
```

**Signature**

```ts
declare class AiAnalysis
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/_schemas.ts#L138)

Since v0.0.0

## AiCorpusConfig (class)

Output schema for the resolved BM25 configuration of a managed corpus.

The values reflect the configuration actually used by the corpus after
defaults and caller overrides are applied.

**Example**

```ts
import * as S from "effect/Schema"
import { AiCorpusConfig } from "@beep/nlp/Tools/_schemas"

const config = S.decodeUnknownSync(AiCorpusConfig)({
  b: 0.75,
  k: 1,
  k1: 1.2,
  norm: "none"
})

config.k1
```

**Signature**

```ts
declare class AiCorpusConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/_schemas.ts#L503)

Since v0.0.0

## AiCorpusIdf (class)

Output schema for an inverse document frequency value in a corpus.

IDF entries help explain why specific terms influence retrieval scores.

**Example**

```ts
import * as S from "effect/Schema"
import { AiCorpusIdf } from "@beep/nlp/Tools/_schemas"

const idf = S.decodeUnknownSync(AiCorpusIdf)({
  idf: 2.31,
  term: "refund"
})

idf.term
```

**Signature**

```ts
declare class AiCorpusIdf
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/_schemas.ts#L610)

Since v0.0.0

## AiCorpusMatrixShape (class)

Output schema for the dimensions of an optional document-term matrix.

Rows correspond to learned documents and columns correspond to vocabulary
terms in the matrix payload.

**Example**

```ts
import * as S from "effect/Schema"
import { AiCorpusMatrixShape } from "@beep/nlp/Tools/_schemas"

const shape = S.decodeUnknownSync(AiCorpusMatrixShape)({
  cols: 480,
  rows: 12
})

shape.rows
```

**Signature**

```ts
declare class AiCorpusMatrixShape
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/_schemas.ts#L642)

Since v0.0.0

## AiCorpusRankedDocument (class)

Output schema for one ranked document returned from a corpus query.

The optional `text` field is present only when the query requested source
text inclusion.

**Example**

```ts
import * as S from "effect/Schema"
import { AiCorpusRankedDocument } from "@beep/nlp/Tools/_schemas"

const document = S.decodeUnknownSync(AiCorpusRankedDocument)({
  id: "refunds",
  index: 0,
  score: 0.94,
  text: "Refund policy details."
})

document.score
```

**Signature**

```ts
declare class AiCorpusRankedDocument
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/_schemas.ts#L577)

Since v0.0.0

## AiCorpusStats (class)

Output schema for detailed corpus diagnostics and retrieval statistics.

Use this model for corpus inspection responses that may include vocabulary,
IDF values, and the optional document-term matrix.

**Example**

```ts
import * as S from "effect/Schema"
import { AiCorpusStats } from "@beep/nlp/Tools/_schemas"

const stats = S.decodeUnknownSync(AiCorpusStats)({
  averageDocumentLength: 8.5,
  corpusId: "support-docs",
  documentTermMatrix: [[0.2, 0.8]],
  idfValues: [{ idf: 2.31, term: "refund" }],
  matrixShape: { cols: 2, rows: 1 },
  terms: ["refund", "policy"],
  totalDocuments: 1,
  vocabularySize: 2
})

stats.terms
```

**Signature**

```ts
declare class AiCorpusStats
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/_schemas.ts#L680)

Since v0.0.0

## AiCorpusSummary (class)

Output schema for a managed corpus session summary.

Returned by corpus creation and useful for confirming the stable corpus id,
resolved BM25 config, current document count, and vocabulary size.

**Example**

```ts
import * as S from "effect/Schema"
import { AiCorpusSummary } from "@beep/nlp/Tools/_schemas"

const summary = S.decodeUnknownSync(AiCorpusSummary)({
  config: { b: 0.75, k: 1, k1: 1.2, norm: "l2" },
  corpusId: "support-docs",
  createdAtMs: 1_783_000_000_000,
  documentCount: 12,
  vocabularySize: 480
})

summary.corpusId
```

**Signature**

```ts
declare class AiCorpusSummary
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/_schemas.ts#L540)

Since v0.0.0

## AiDocumentStats (class)

Output schema for high-level document statistics.

The counts are intended for routing and sizing decisions, such as deciding
whether a text should be chunked before retrieval or summarization.

**Example**

```ts
import * as S from "effect/Schema"
import { AiDocumentStats } from "@beep/nlp/Tools/_schemas"

const stats = S.decodeUnknownSync(AiDocumentStats)({
  avgSentenceLength: 4,
  charCount: 31,
  sentenceCount: 2,
  wordCount: 8
})

stats.wordCount
```

**Signature**

```ts
declare class AiDocumentStats
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/_schemas.ts#L246)

Since v0.0.0

## AiEntity (class)

Output schema for an extracted named entity.

The model carries entity text, type labels, token boundaries, character
offsets, and whether the match came from built-in or custom entity logic.

**Example**

```ts
import * as S from "effect/Schema"
import { AiEntity } from "@beep/nlp/Tools/_schemas"

const entity = S.decodeUnknownSync(AiEntity)({
  end: 20,
  endTokenIndex: 2,
  source: "builtin",
  start: 4,
  startTokenIndex: 1,
  type: "EMAIL",
  value: "john@example.com"
})

entity.type
```

**Signature**

```ts
declare class AiEntity
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/_schemas.ts#L355)

Since v0.0.0

## AiKeyword (class)

Output schema for a keyword candidate and its importance score.

Higher scores represent stronger keyword relevance within the extraction
result returned by `ExtractKeywords`.

**Example**

```ts
import * as S from "effect/Schema"
import { AiKeyword } from "@beep/nlp/Tools/_schemas"

const keyword = S.decodeUnknownSync(AiKeyword)({
  score: 0.87,
  term: "structured concurrency"
})

keyword.score
```

**Signature**

```ts
declare class AiKeyword
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/_schemas.ts#L212)

Since v0.0.0

## AiNGram (class)

Output schema for an extracted n-gram and its frequency count.

Use this model for entries returned by the `NGrams` tool in bag, edge, or
set modes.

**Example**

```ts
import * as S from "effect/Schema"
import { AiNGram } from "@beep/nlp/Tools/_schemas"

const ngram = S.decodeUnknownSync(AiNGram)({
  count: 2,
  value: "ref"
})

ngram.value
```

**Signature**

```ts
declare class AiNGram
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/_schemas.ts#L392)

Since v0.0.0

## AiPhoneticMatch (class)

Output schema for phonetic overlap between two text inputs.

The code arrays show which phonetic keys were generated for each side and
which keys contributed to the overlap score.

**Example**

```ts
import * as S from "effect/Schema"
import { AiPhoneticMatch } from "@beep/nlp/Tools/_schemas"

const match = S.decodeUnknownSync(AiPhoneticMatch)({
  algorithm: "soundex",
  leftCodes: ["S315"],
  rightCodes: ["S315"],
  score: 1,
  sharedCodes: ["S315"]
})

match.sharedCodes
```

**Signature**

```ts
declare class AiPhoneticMatch
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/_schemas.ts#L427)

Since v0.0.0

## AiRankedText (class)

Output schema for one ranked text candidate.

The `index` points back to the caller-provided candidate array and `score`
ranks the candidate relative to the query.

**Example**

```ts
import * as S from "effect/Schema"
import { AiRankedText } from "@beep/nlp/Tools/_schemas"

const ranked = S.decodeUnknownSync(AiRankedText)({
  index: 1,
  score: 0.92
})

ranked.index
```

**Signature**

```ts
declare class AiRankedText
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/_schemas.ts#L318)

Since v0.0.0

## AiSentence (class)

Output schema for a detected sentence with source offsets and token count.

Use this model when an NLP result needs sentence text plus enough metadata to
preserve ordering and trace each sentence back to the source document.

**Example**

```ts
import * as S from "effect/Schema"
import { AiSentence } from "@beep/nlp/Tools/_schemas"

const sentence = S.decodeUnknownSync(AiSentence)({
  end: 12,
  index: 0,
  start: 0,
  text: "Hello world.",
  tokenCount: 3
})

sentence.index
```

**Signature**

```ts
declare class AiSentence
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/_schemas.ts#L177)

Since v0.0.0

## AiSentenceChunk (class)

Output schema for a sentence-aligned text chunk.

Chunk boundaries are expressed in sentence indexes so callers can preserve
document order and avoid slicing through a sentence.

**Example**

```ts
import * as S from "effect/Schema"
import { AiSentenceChunk } from "@beep/nlp/Tools/_schemas"

const chunk = S.decodeUnknownSync(AiSentenceChunk)({
  charCount: 28,
  endSentenceIndex: 1,
  sentenceCount: 2,
  startSentenceIndex: 0,
  text: "First sentence. Second one."
})

chunk.sentenceCount
```

**Signature**

```ts
declare class AiSentenceChunk
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/_schemas.ts#L283)

Since v0.0.0

## AiToken (class)

Output schema for one token emitted by tokenization-oriented tools.

The model keeps both linguistic annotations and source offsets so callers can
map normalized NLP data back to the original text.

**Example**

```ts
import * as S from "effect/Schema"
import { AiToken } from "@beep/nlp/Tools/_schemas"

const token = S.decodeUnknownSync(AiToken)({
  end: 5,
  isPunctuation: false,
  isStopWord: false,
  lemma: "quick",
  pos: "ADJ",
  start: 1,
  stem: "quick",
  text: "quick"
})

token.lemma
```

**Signature**

```ts
declare class AiToken
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/_schemas.ts#L82)

Since v0.0.0

## AiToolError (class)

Structured failure schema returned by AI-facing NLP tools.

Tool implementations should fail with this model for expected operational
failures so AI clients can inspect the tool, operation, stable reason, and
retry hint without parsing logs or natural-language exception text.

**Example**

```ts
import { AiToolError } from "@beep/nlp/Tools/_schemas"

const failure = AiToolError.make({
  message: "Corpus not found",
  operation: "query",
  reason: "CorpusNotFound",
  retryable: false,
  toolName: "QueryCorpus"
})

console.log(failure.retryable)
// false
```

**Signature**

```ts
declare class AiToolError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/_schemas.ts#L466)

Since v0.0.0