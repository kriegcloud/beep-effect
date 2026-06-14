---
title: index.ts
nav_order: 55
parent: "@beep/nlp"
---

## index.ts overview

NLP AI tools.

Since v0.0.0

---
## Exports Grouped by Category
- [adapters](#adapters)
  - [CreateCorpus](#createcorpus)
- [layers](#layers)
  - [CorpusStats](#corpusstats)
- [tool-schemas](#tool-schemas)
  - [AiAnalysis](#aianalysis)
  - [AiCorpusConfig](#aicorpusconfig)
  - [AiCorpusIdf](#aicorpusidf)
  - [AiCorpusMatrixShape](#aicorpusmatrixshape)
  - [AiCorpusRankedDocument](#aicorpusrankeddocument)
  - [AiCorpusStats](#aicorpusstats)
  - [AiCorpusSummary](#aicorpussummary)
  - [AiDocumentStats](#aidocumentstats)
  - [AiEntity](#aientity)
  - [AiKeyword](#aikeyword)
  - [AiNGram](#aingram)
  - [AiPhoneticMatch](#aiphoneticmatch)
  - [AiRankedText](#airankedtext)
  - [AiSentence](#aisentence)
  - [AiSentenceChunk](#aisentencechunk)
  - [AiToken](#aitoken)
  - [AiToolError](#aitoolerror)
- [tools](#tools)
  - [Analyze](#analyze)
  - [BagOfWords](#bagofwords)
  - [BowCosineSimilarity](#bowcosinesimilarity)
  - [ChunkBySentences](#chunkbysentences)
  - [DeleteCorpus](#deletecorpus)
  - [DocumentStats](#documentstats)
  - [ExtractEntities](#extractentities)
  - [ExtractKeywords](#extractkeywords)
  - [LearnCorpus](#learncorpus)
  - [LearnCustomEntities](#learncustomentities)
  - [NGrams](#ngrams)
  - [NlpToolkit](#nlptoolkit)
  - [NlpTools](#nlptools)
  - [Paragraphize](#paragraphize)
  - [PhoneticMatch](#phoneticmatch)
  - [QueryCorpus](#querycorpus)
  - [RankByRelevance](#rankbyrelevance)
  - [RemoveStopWords](#removestopwords)
  - [Sentences](#sentences)
  - [Stem](#stem)
  - [TextSimilarity](#textsimilarity)
  - [Tokenize](#tokenize)
  - [TransformText](#transformtext)
  - [TverskySimilarity](#tverskysimilarity)
  - [WordCount](#wordcount)
  - [exportTools](#exporttools)
---

# adapters

## CreateCorpus

Create corpus export.

**Example**

```ts
import { CreateCorpus } from "@beep/nlp/Tools"

console.log(CreateCorpus)
```

**Signature**

```ts
declare const CreateCorpus: Tool<"CreateCorpus", { readonly parameters: typeof CreateCorpusParameters; readonly success: toEncoded<typeof AiCorpusSummarySource>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L383)

Since v0.0.0

# layers

## CorpusStats

Corpus stats layer.

**Example**

```ts
import { CorpusStats } from "@beep/nlp/Tools"

console.log(CorpusStats)
```

**Signature**

```ts
declare const CorpusStats: Tool<"CorpusStats", { readonly parameters: typeof CorpusStatsParameters; readonly success: toEncoded<typeof AiCorpusStatsSource>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L369)

Since v0.0.0

# tool-schemas

## AiAnalysis

Ai analysis tool schema.

**Example**

```ts
import { AiAnalysis } from "@beep/nlp/Tools"

console.log(AiAnalysis)
```

**Signature**

```ts
declare const AiAnalysis: typeof AiAnalysisSource
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L68)

Since v0.0.0

## AiCorpusConfig

Ai corpus config tool schema.

**Example**

```ts
import { AiCorpusConfig } from "@beep/nlp/Tools"

console.log(AiCorpusConfig)
```

**Signature**

```ts
declare const AiCorpusConfig: typeof AiCorpusConfigSource
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L82)

Since v0.0.0

## AiCorpusIdf

Ai corpus idf tool schema.

**Example**

```ts
import { AiCorpusIdf } from "@beep/nlp/Tools"

console.log(AiCorpusIdf)
```

**Signature**

```ts
declare const AiCorpusIdf: typeof AiCorpusIdfSource
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L96)

Since v0.0.0

## AiCorpusMatrixShape

Ai corpus matrix shape tool schema.

**Example**

```ts
import { AiCorpusMatrixShape } from "@beep/nlp/Tools"

console.log(AiCorpusMatrixShape)
```

**Signature**

```ts
declare const AiCorpusMatrixShape: typeof AiCorpusMatrixShapeSource
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L110)

Since v0.0.0

## AiCorpusRankedDocument

Ai corpus ranked document tool schema.

**Example**

```ts
import { AiCorpusRankedDocument } from "@beep/nlp/Tools"

console.log(AiCorpusRankedDocument)
```

**Signature**

```ts
declare const AiCorpusRankedDocument: typeof AiCorpusRankedDocumentSource
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L124)

Since v0.0.0

## AiCorpusStats

Ai corpus stats tool schema.

**Example**

```ts
import { AiCorpusStats } from "@beep/nlp/Tools"

console.log(AiCorpusStats)
```

**Signature**

```ts
declare const AiCorpusStats: typeof AiCorpusStatsSource
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L138)

Since v0.0.0

## AiCorpusSummary

Ai corpus summary tool schema.

**Example**

```ts
import { AiCorpusSummary } from "@beep/nlp/Tools"

console.log(AiCorpusSummary)
```

**Signature**

```ts
declare const AiCorpusSummary: typeof AiCorpusSummarySource
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L152)

Since v0.0.0

## AiDocumentStats

Ai document stats tool schema.

**Example**

```ts
import { AiDocumentStats } from "@beep/nlp/Tools"

console.log(AiDocumentStats)
```

**Signature**

```ts
declare const AiDocumentStats: typeof AiDocumentStatsSource
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L166)

Since v0.0.0

## AiEntity

Ai entity tool schema.

**Example**

```ts
import { AiEntity } from "@beep/nlp/Tools"

console.log(AiEntity)
```

**Signature**

```ts
declare const AiEntity: typeof AiEntitySource
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L180)

Since v0.0.0

## AiKeyword

Ai keyword tool schema.

**Example**

```ts
import { AiKeyword } from "@beep/nlp/Tools"

console.log(AiKeyword)
```

**Signature**

```ts
declare const AiKeyword: typeof AiKeywordSource
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L194)

Since v0.0.0

## AiNGram

Ai n gram tool schema.

**Example**

```ts
import { AiNGram } from "@beep/nlp/Tools"

console.log(AiNGram)
```

**Signature**

```ts
declare const AiNGram: typeof AiNGramSource
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L208)

Since v0.0.0

## AiPhoneticMatch

Ai phonetic match tool schema.

**Example**

```ts
import { AiPhoneticMatch } from "@beep/nlp/Tools"

console.log(AiPhoneticMatch)
```

**Signature**

```ts
declare const AiPhoneticMatch: typeof AiPhoneticMatchSource
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L222)

Since v0.0.0

## AiRankedText

Ai ranked text tool schema.

**Example**

```ts
import { AiRankedText } from "@beep/nlp/Tools"

console.log(AiRankedText)
```

**Signature**

```ts
declare const AiRankedText: typeof AiRankedTextSource
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L236)

Since v0.0.0

## AiSentence

Ai sentence tool schema.

**Example**

```ts
import { AiSentence } from "@beep/nlp/Tools"

console.log(AiSentence)
```

**Signature**

```ts
declare const AiSentence: typeof AiSentenceSource
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L250)

Since v0.0.0

## AiSentenceChunk

Ai sentence chunk tool schema.

**Example**

```ts
import { AiSentenceChunk } from "@beep/nlp/Tools"

console.log(AiSentenceChunk)
```

**Signature**

```ts
declare const AiSentenceChunk: typeof AiSentenceChunkSource
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L264)

Since v0.0.0

## AiToken

Ai token tool schema.

**Example**

```ts
import { AiToken } from "@beep/nlp/Tools"

console.log(AiToken)
```

**Signature**

```ts
declare const AiToken: typeof AiTokenSource
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L299)

Since v0.0.0

## AiToolError

Ai tool error schema.

**Example**

```ts
import { AiToolError } from "@beep/nlp/Tools"

const failure = AiToolError.make({
  message: "Corpus not found",
  operation: "query",
  retryable: false,
  toolName: "QueryCorpus"
})

console.log(failure.toolName)
```

**Signature**

```ts
declare const AiToolError: typeof AiToolErrorSource
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L285)

Since v0.0.0

# tools

## Analyze

Analyze tool.

**Example**

```ts
import { Analyze } from "@beep/nlp/Tools"

console.log(Analyze)
```

**Signature**

```ts
declare const Analyze: Tool<"Analyze", { readonly parameters: typeof AnalyzeParameters; readonly success: toEncoded<typeof AiAnalysisSource>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L313)

Since v0.0.0

## BagOfWords

Bag of words tool.

**Example**

```ts
import { BagOfWords } from "@beep/nlp/Tools"

console.log(BagOfWords)
```

**Signature**

```ts
declare const BagOfWords: Tool<"BagOfWords", { readonly parameters: typeof BagOfWordsParameters; readonly success: toEncoded<typeof BagOfWordsSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L327)

Since v0.0.0

## BowCosineSimilarity

Bow cosine similarity tool.

**Example**

```ts
import { BowCosineSimilarity } from "@beep/nlp/Tools"

console.log(BowCosineSimilarity)
```

**Signature**

```ts
declare const BowCosineSimilarity: Tool<"BowCosineSimilarity", { readonly parameters: typeof BowCosineSimilarityParameters; readonly success: toEncoded<typeof BowCosineSimilaritySuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L341)

Since v0.0.0

## ChunkBySentences

Chunk by sentences tool.

**Example**

```ts
import { ChunkBySentences } from "@beep/nlp/Tools"

console.log(ChunkBySentences)
```

**Signature**

```ts
declare const ChunkBySentences: Tool<"ChunkBySentences", { readonly parameters: typeof ChunkBySentencesParameters; readonly success: toEncoded<typeof ChunkBySentencesSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L355)

Since v0.0.0

## DeleteCorpus

Delete corpus tool.

**Example**

```ts
import { DeleteCorpus } from "@beep/nlp/Tools"

console.log(DeleteCorpus)
```

**Signature**

```ts
declare const DeleteCorpus: Tool<"DeleteCorpus", { readonly parameters: typeof DeleteCorpusParameters; readonly success: toEncoded<typeof DeleteCorpusSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L397)

Since v0.0.0

## DocumentStats

Document stats tool.

**Example**

```ts
import { DocumentStats } from "@beep/nlp/Tools"

console.log(DocumentStats)
```

**Signature**

```ts
declare const DocumentStats: Tool<"DocumentStats", { readonly parameters: typeof DocumentStatsParameters; readonly success: toEncoded<typeof AiDocumentStatsSource>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L411)

Since v0.0.0

## ExtractEntities

Extract entities tool.

**Example**

```ts
import { ExtractEntities } from "@beep/nlp/Tools"

console.log(ExtractEntities)
```

**Signature**

```ts
declare const ExtractEntities: Tool<"ExtractEntities", { readonly parameters: typeof ExtractEntitiesParameters; readonly success: toEncoded<typeof ExtractEntitiesSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L425)

Since v0.0.0

## ExtractKeywords

Extract keywords tool.

**Example**

```ts
import { ExtractKeywords } from "@beep/nlp/Tools"

console.log(ExtractKeywords)
```

**Signature**

```ts
declare const ExtractKeywords: Tool<"ExtractKeywords", { readonly parameters: typeof ExtractKeywordsParameters; readonly success: toEncoded<typeof ExtractKeywordsSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L439)

Since v0.0.0

## LearnCorpus

Learn corpus tool.

**Example**

```ts
import { LearnCorpus } from "@beep/nlp/Tools"

console.log(LearnCorpus)
```

**Signature**

```ts
declare const LearnCorpus: Tool<"LearnCorpus", { readonly parameters: typeof LearnCorpusParameters; readonly success: toEncoded<typeof LearnCorpusSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L453)

Since v0.0.0

## LearnCustomEntities

Learn custom entities tool.

**Example**

```ts
import { LearnCustomEntities } from "@beep/nlp/Tools"

console.log(LearnCustomEntities)
```

**Signature**

```ts
declare const LearnCustomEntities: Tool<"LearnCustomEntities", { readonly parameters: typeof LearnCustomEntitiesParameters; readonly success: toEncoded<typeof LearnCustomEntitiesSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L467)

Since v0.0.0

## NGrams

N grams tool.

**Example**

```ts
import { NGrams } from "@beep/nlp/Tools"

console.log(NGrams)
```

**Signature**

```ts
declare const NGrams: Tool<"NGrams", { readonly parameters: typeof NGramsParameters; readonly success: toEncoded<typeof NGramsSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L481)

Since v0.0.0

## NlpToolkit

Nlp toolkit tool.

**Example**

```ts
import { NlpToolkit } from "@beep/nlp/Tools"

console.log(NlpToolkit)
```

**Signature**

```ts
declare const NlpToolkit: Toolkit<{ readonly Analyze: Tool<"Analyze", { readonly parameters: typeof AnalyzeParameters; readonly success: toEncoded<typeof AiAnalysisSource>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly BagOfWords: Tool<"BagOfWords", { readonly parameters: typeof BagOfWordsParameters; readonly success: toEncoded<typeof BagOfWordsSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly BowCosineSimilarity: Tool<"BowCosineSimilarity", { readonly parameters: typeof BowCosineSimilarityParameters; readonly success: toEncoded<typeof BowCosineSimilaritySuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly ChunkBySentences: Tool<"ChunkBySentences", { readonly parameters: typeof ChunkBySentencesParameters; readonly success: toEncoded<typeof ChunkBySentencesSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly CorpusStats: Tool<"CorpusStats", { readonly parameters: typeof CorpusStatsParameters; readonly success: toEncoded<typeof AiCorpusStatsSource>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly CreateCorpus: Tool<"CreateCorpus", { readonly parameters: typeof CreateCorpusParameters; readonly success: toEncoded<typeof AiCorpusSummarySource>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly DeleteCorpus: Tool<"DeleteCorpus", { readonly parameters: typeof DeleteCorpusParameters; readonly success: toEncoded<typeof DeleteCorpusSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly DocumentStats: Tool<"DocumentStats", { readonly parameters: typeof DocumentStatsParameters; readonly success: toEncoded<typeof AiDocumentStatsSource>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly ExtractEntities: Tool<"ExtractEntities", { readonly parameters: typeof ExtractEntitiesParameters; readonly success: toEncoded<typeof ExtractEntitiesSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly ExtractKeywords: Tool<"ExtractKeywords", { readonly parameters: typeof ExtractKeywordsParameters; readonly success: toEncoded<typeof ExtractKeywordsSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly LearnCorpus: Tool<"LearnCorpus", { readonly parameters: typeof LearnCorpusParameters; readonly success: toEncoded<typeof LearnCorpusSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly LearnCustomEntities: Tool<"LearnCustomEntities", { readonly parameters: typeof LearnCustomEntitiesParameters; readonly success: toEncoded<typeof LearnCustomEntitiesSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly NGrams: Tool<"NGrams", { readonly parameters: typeof NGramsParameters; readonly success: toEncoded<typeof NGramsSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly Paragraphize: Tool<"Paragraphize", { readonly parameters: typeof ParagraphizeParameters; readonly success: toEncoded<typeof ParagraphizeSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly PhoneticMatch: Tool<"PhoneticMatch", { readonly parameters: typeof PhoneticMatchParameters; readonly success: toEncoded<typeof AiPhoneticMatchSource>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly QueryCorpus: Tool<"QueryCorpus", { readonly parameters: typeof QueryCorpusParameters; readonly success: toEncoded<typeof QueryCorpusSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly RankByRelevance: Tool<"RankByRelevance", { readonly parameters: typeof RankByRelevanceParameters; readonly success: toEncoded<typeof RankByRelevanceSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly RemoveStopWords: Tool<"RemoveStopWords", { readonly parameters: typeof RemoveStopWordsParameters; readonly success: toEncoded<typeof RemoveStopWordsSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly Sentences: Tool<"Sentences", { readonly parameters: typeof SentencesParameters; readonly success: toEncoded<typeof SentencesSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly Stem: Tool<"Stem", { readonly parameters: typeof StemParameters; readonly success: toEncoded<typeof StemSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly TextSimilarity: Tool<"TextSimilarity", { readonly parameters: typeof TextSimilarityParameters; readonly success: toEncoded<typeof TextSimilaritySuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly Tokenize: Tool<"Tokenize", { readonly parameters: typeof TokenizeParameters; readonly success: toEncoded<typeof TokenizeSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly TransformText: Tool<"TransformText", { readonly parameters: typeof TransformTextParameters; readonly success: toEncoded<typeof TransformTextSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly TverskySimilarity: Tool<"TverskySimilarity", { readonly parameters: typeof TverskySimilarityParameters; readonly success: toEncoded<typeof TverskySimilaritySuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly WordCount: Tool<"WordCount", { readonly parameters: typeof WordCountParameters; readonly success: toEncoded<typeof WordCountSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; }>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L664)

Since v0.0.0

## NlpTools

Nlp tools tool.

**Example**

```ts
import { NlpTools } from "@beep/nlp/Tools"

console.log(NlpTools)
```

**Signature**

```ts
declare const NlpTools: NlpToolList
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L679)

Since v0.0.0

## Paragraphize

Paragraphize tool.

**Example**

```ts
import { Paragraphize } from "@beep/nlp/Tools"

console.log(Paragraphize)
```

**Signature**

```ts
declare const Paragraphize: Tool<"Paragraphize", { readonly parameters: typeof ParagraphizeParameters; readonly success: toEncoded<typeof ParagraphizeSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L495)

Since v0.0.0

## PhoneticMatch

Phonetic match tool.

**Example**

```ts
import { PhoneticMatch } from "@beep/nlp/Tools"

console.log(PhoneticMatch)
```

**Signature**

```ts
declare const PhoneticMatch: Tool<"PhoneticMatch", { readonly parameters: typeof PhoneticMatchParameters; readonly success: toEncoded<typeof AiPhoneticMatchSource>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L509)

Since v0.0.0

## QueryCorpus

Query corpus tool.

**Example**

```ts
import { QueryCorpus } from "@beep/nlp/Tools"

console.log(QueryCorpus)
```

**Signature**

```ts
declare const QueryCorpus: Tool<"QueryCorpus", { readonly parameters: typeof QueryCorpusParameters; readonly success: toEncoded<typeof QueryCorpusSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L523)

Since v0.0.0

## RankByRelevance

Rank by relevance tool.

**Example**

```ts
import { RankByRelevance } from "@beep/nlp/Tools"

console.log(RankByRelevance)
```

**Signature**

```ts
declare const RankByRelevance: Tool<"RankByRelevance", { readonly parameters: typeof RankByRelevanceParameters; readonly success: toEncoded<typeof RankByRelevanceSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L537)

Since v0.0.0

## RemoveStopWords

Remove stop words tool.

**Example**

```ts
import { RemoveStopWords } from "@beep/nlp/Tools"

console.log(RemoveStopWords)
```

**Signature**

```ts
declare const RemoveStopWords: Tool<"RemoveStopWords", { readonly parameters: typeof RemoveStopWordsParameters; readonly success: toEncoded<typeof RemoveStopWordsSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L551)

Since v0.0.0

## Sentences

Sentences tool.

**Example**

```ts
import { Sentences } from "@beep/nlp/Tools"

console.log(Sentences)
```

**Signature**

```ts
declare const Sentences: Tool<"Sentences", { readonly parameters: typeof SentencesParameters; readonly success: toEncoded<typeof SentencesSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L565)

Since v0.0.0

## Stem

Stem tool.

**Example**

```ts
import { Stem } from "@beep/nlp/Tools"

console.log(Stem)
```

**Signature**

```ts
declare const Stem: Tool<"Stem", { readonly parameters: typeof StemParameters; readonly success: toEncoded<typeof StemSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L579)

Since v0.0.0

## TextSimilarity

Text similarity tool.

**Example**

```ts
import { TextSimilarity } from "@beep/nlp/Tools"

console.log(TextSimilarity)
```

**Signature**

```ts
declare const TextSimilarity: Tool<"TextSimilarity", { readonly parameters: typeof TextSimilarityParameters; readonly success: toEncoded<typeof TextSimilaritySuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L593)

Since v0.0.0

## Tokenize

Tokenize tool.

**Example**

```ts
import { Tokenize } from "@beep/nlp/Tools"

console.log(Tokenize)
```

**Signature**

```ts
declare const Tokenize: Tool<"Tokenize", { readonly parameters: typeof TokenizeParameters; readonly success: toEncoded<typeof TokenizeSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L607)

Since v0.0.0

## TransformText

Transform text tool.

**Example**

```ts
import { TransformText } from "@beep/nlp/Tools"

console.log(TransformText)
```

**Signature**

```ts
declare const TransformText: Tool<"TransformText", { readonly parameters: typeof TransformTextParameters; readonly success: toEncoded<typeof TransformTextSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L621)

Since v0.0.0

## TverskySimilarity

Tversky similarity tool.

**Example**

```ts
import { TverskySimilarity } from "@beep/nlp/Tools"

console.log(TverskySimilarity)
```

**Signature**

```ts
declare const TverskySimilarity: Tool<"TverskySimilarity", { readonly parameters: typeof TverskySimilarityParameters; readonly success: toEncoded<typeof TverskySimilaritySuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L635)

Since v0.0.0

## WordCount

Word count tool.

**Example**

```ts
import { WordCount } from "@beep/nlp/Tools"

console.log(WordCount)
```

**Signature**

```ts
declare const WordCount: Tool<"WordCount", { readonly parameters: typeof WordCountParameters; readonly success: toEncoded<typeof WordCountSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L649)

Since v0.0.0

## exportTools

Export tools tool.

**Example**

```ts
import { exportTools } from "@beep/nlp/Tools"

console.log(exportTools)
```

**Signature**

```ts
declare const exportTools: Effect<ReadonlyArray<ExportedTool>, ExportedToolError, HandlersFor<{ readonly Analyze: Tool<"Analyze", { readonly parameters: typeof AnalyzeParameters; readonly success: toEncoded<typeof AiAnalysisSource>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly BagOfWords: Tool<"BagOfWords", { readonly parameters: typeof BagOfWordsParameters; readonly success: toEncoded<typeof BagOfWordsSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly BowCosineSimilarity: Tool<"BowCosineSimilarity", { readonly parameters: typeof BowCosineSimilarityParameters; readonly success: toEncoded<typeof BowCosineSimilaritySuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly ChunkBySentences: Tool<"ChunkBySentences", { readonly parameters: typeof ChunkBySentencesParameters; readonly success: toEncoded<typeof ChunkBySentencesSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly CorpusStats: Tool<"CorpusStats", { readonly parameters: typeof CorpusStatsParameters; readonly success: toEncoded<typeof AiCorpusStatsSource>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly CreateCorpus: Tool<"CreateCorpus", { readonly parameters: typeof CreateCorpusParameters; readonly success: toEncoded<typeof AiCorpusSummarySource>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly DeleteCorpus: Tool<"DeleteCorpus", { readonly parameters: typeof DeleteCorpusParameters; readonly success: toEncoded<typeof DeleteCorpusSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly DocumentStats: Tool<"DocumentStats", { readonly parameters: typeof DocumentStatsParameters; readonly success: toEncoded<typeof AiDocumentStatsSource>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly ExtractEntities: Tool<"ExtractEntities", { readonly parameters: typeof ExtractEntitiesParameters; readonly success: toEncoded<typeof ExtractEntitiesSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly ExtractKeywords: Tool<"ExtractKeywords", { readonly parameters: typeof ExtractKeywordsParameters; readonly success: toEncoded<typeof ExtractKeywordsSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly LearnCorpus: Tool<"LearnCorpus", { readonly parameters: typeof LearnCorpusParameters; readonly success: toEncoded<typeof LearnCorpusSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly LearnCustomEntities: Tool<"LearnCustomEntities", { readonly parameters: typeof LearnCustomEntitiesParameters; readonly success: toEncoded<typeof LearnCustomEntitiesSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly NGrams: Tool<"NGrams", { readonly parameters: typeof NGramsParameters; readonly success: toEncoded<typeof NGramsSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly Paragraphize: Tool<"Paragraphize", { readonly parameters: typeof ParagraphizeParameters; readonly success: toEncoded<typeof ParagraphizeSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly PhoneticMatch: Tool<"PhoneticMatch", { readonly parameters: typeof PhoneticMatchParameters; readonly success: toEncoded<typeof AiPhoneticMatchSource>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly QueryCorpus: Tool<"QueryCorpus", { readonly parameters: typeof QueryCorpusParameters; readonly success: toEncoded<typeof QueryCorpusSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly RankByRelevance: Tool<"RankByRelevance", { readonly parameters: typeof RankByRelevanceParameters; readonly success: toEncoded<typeof RankByRelevanceSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly RemoveStopWords: Tool<"RemoveStopWords", { readonly parameters: typeof RemoveStopWordsParameters; readonly success: toEncoded<typeof RemoveStopWordsSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly Sentences: Tool<"Sentences", { readonly parameters: typeof SentencesParameters; readonly success: toEncoded<typeof SentencesSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly Stem: Tool<"Stem", { readonly parameters: typeof StemParameters; readonly success: toEncoded<typeof StemSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly TextSimilarity: Tool<"TextSimilarity", { readonly parameters: typeof TextSimilarityParameters; readonly success: toEncoded<typeof TextSimilaritySuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly Tokenize: Tool<"Tokenize", { readonly parameters: typeof TokenizeParameters; readonly success: toEncoded<typeof TokenizeSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly TransformText: Tool<"TransformText", { readonly parameters: typeof TransformTextParameters; readonly success: toEncoded<typeof TransformTextSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly TverskySimilarity: Tool<"TverskySimilarity", { readonly parameters: typeof TverskySimilarityParameters; readonly success: toEncoded<typeof TverskySimilaritySuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; readonly WordCount: Tool<"WordCount", { readonly parameters: typeof WordCountParameters; readonly success: toEncoded<typeof WordCountSuccess>; readonly failure: typeof AiToolErrorSource; readonly failureMode: "return"; }, never>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/index.ts#L694)

Since v0.0.0