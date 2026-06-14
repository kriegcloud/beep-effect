---
title: WinkTools.service.ts
nav_order: 12
parent: "@beep/wink"
---

## WinkTools.service.ts overview

Live NLP toolkit composed from wink-backed services and tool definitions.

Since v0.0.0

---
## Exports Grouped by Category
- [layers](#layers)
  - [WinkNlpToolkitLive](#winknlptoolkitlive)
---

# layers

## WinkNlpToolkitLive

Live toolkit handler layer backed by the wink NLP runtime.

Provide this layer to programs that execute `NlpToolkit` tools; it wires
tokenization, similarity, vectorization, corpus management, and utility
services behind the typed toolkit handlers.

**Example**

```ts
import { Effect } from "effect"
import { WinkNlpToolkitLive } from "@beep/wink"
import { exportTools } from "@beep/nlp/Tools/ToolExport"

const exported = await Effect.runPromise(
  exportTools.pipe(Effect.provide(WinkNlpToolkitLive))
)

exported.some((tool) => tool.name === "Tokenize")
```

**Signature**

```ts
declare const WinkNlpToolkitLive: Layer.Layer<Tool.HandlersFor<{ readonly Analyze: Tool.Tool<"Analyze", { readonly parameters: typeof AnalyzeParameters; readonly success: S.toEncoded<typeof AiAnalysis>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly BagOfWords: Tool.Tool<"BagOfWords", { readonly parameters: typeof BagOfWordsParameters; readonly success: S.toEncoded<typeof BagOfWordsSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly BowCosineSimilarity: Tool.Tool<"BowCosineSimilarity", { readonly parameters: typeof BowCosineSimilarityParameters; readonly success: S.toEncoded<typeof BowCosineSimilaritySuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly ChunkBySentences: Tool.Tool<"ChunkBySentences", { readonly parameters: typeof ChunkBySentencesParameters; readonly success: S.toEncoded<typeof ChunkBySentencesSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly CorpusStats: Tool.Tool<"CorpusStats", { readonly parameters: typeof CorpusStatsParameters; readonly success: S.toEncoded<typeof AiCorpusStats>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly CreateCorpus: Tool.Tool<"CreateCorpus", { readonly parameters: typeof CreateCorpusParameters; readonly success: S.toEncoded<typeof AiCorpusSummary>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly DeleteCorpus: Tool.Tool<"DeleteCorpus", { readonly parameters: typeof DeleteCorpusParameters; readonly success: S.toEncoded<typeof DeleteCorpusSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly DocumentStats: Tool.Tool<"DocumentStats", { readonly parameters: typeof DocumentStatsParameters; readonly success: S.toEncoded<typeof AiDocumentStats>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly ExtractEntities: Tool.Tool<"ExtractEntities", { readonly parameters: typeof ExtractEntitiesParameters; readonly success: S.toEncoded<typeof ExtractEntitiesSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly ExtractKeywords: Tool.Tool<"ExtractKeywords", { readonly parameters: typeof ExtractKeywordsParameters; readonly success: S.toEncoded<typeof ExtractKeywordsSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly LearnCorpus: Tool.Tool<"LearnCorpus", { readonly parameters: typeof LearnCorpusParameters; readonly success: S.toEncoded<typeof LearnCorpusSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly LearnCustomEntities: Tool.Tool<"LearnCustomEntities", { readonly parameters: typeof LearnCustomEntitiesParameters; readonly success: S.toEncoded<typeof LearnCustomEntitiesSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly NGrams: Tool.Tool<"NGrams", { readonly parameters: typeof NGramsParameters; readonly success: S.toEncoded<typeof NGramsSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly Paragraphize: Tool.Tool<"Paragraphize", { readonly parameters: typeof ParagraphizeParameters; readonly success: S.toEncoded<typeof ParagraphizeSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly PhoneticMatch: Tool.Tool<"PhoneticMatch", { readonly parameters: typeof PhoneticMatchParameters; readonly success: S.toEncoded<typeof AiPhoneticMatch>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly QueryCorpus: Tool.Tool<"QueryCorpus", { readonly parameters: typeof QueryCorpusParameters; readonly success: S.toEncoded<typeof QueryCorpusSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly RankByRelevance: Tool.Tool<"RankByRelevance", { readonly parameters: typeof RankByRelevanceParameters; readonly success: S.toEncoded<typeof RankByRelevanceSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly RemoveStopWords: Tool.Tool<"RemoveStopWords", { readonly parameters: typeof RemoveStopWordsParameters; readonly success: S.toEncoded<typeof RemoveStopWordsSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly Sentences: Tool.Tool<"Sentences", { readonly parameters: typeof SentencesParameters; readonly success: S.toEncoded<typeof SentencesSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly Stem: Tool.Tool<"Stem", { readonly parameters: typeof StemParameters; readonly success: S.toEncoded<typeof StemSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly TextSimilarity: Tool.Tool<"TextSimilarity", { readonly parameters: typeof TextSimilarityParameters; readonly success: S.toEncoded<typeof TextSimilaritySuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly Tokenize: Tool.Tool<"Tokenize", { readonly parameters: typeof TokenizeParameters; readonly success: S.toEncoded<typeof TokenizeSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly TransformText: Tool.Tool<"TransformText", { readonly parameters: typeof TransformTextParameters; readonly success: S.toEncoded<typeof TransformTextSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly TverskySimilarity: Tool.Tool<"TverskySimilarity", { readonly parameters: typeof TverskySimilarityParameters; readonly success: S.toEncoded<typeof TverskySimilaritySuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly WordCount: Tool.Tool<"WordCount", { readonly parameters: typeof WordCountParameters; readonly success: S.toEncoded<typeof WordCountSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; }>, WinkEngineError | CorpusManagerError | SimilarityError | VectorizerError | WinkUtilsError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/WinkTools.service.ts#L345)

Since v0.0.0