---
title: NlpToolkit.ts
nav_order: 59
parent: "@beep/nlp"
---

## NlpToolkit.ts overview

Driver-neutral NLP toolkit contract.

Since v0.0.0

---
## Exports Grouped by Category
- [tools](#tools)
  - [NlpToolkit](#nlptoolkit)
  - [NlpTools](#nlptools)
---

# tools

## NlpToolkit

Effect AI toolkit definition containing the full NLP tool surface.

Drivers provide the handler layer for this contract. For example,
`@beep/wink` provides a wink-backed implementation.

**Example**

```ts
import { NlpToolkit, NlpTools } from "@beep/nlp/Tools/NlpToolkit"

const toolkitToolNames = Object.keys(NlpToolkit.tools)
const summary = {
  hasTokenize: toolkitToolNames.includes("Tokenize"),
  sameToolCount: toolkitToolNames.length === NlpTools.length
}

console.log(summary)
// { hasTokenize: true, sameToolCount: true }
```

**Signature**

```ts
declare const NlpToolkit: Toolkit.Toolkit<{ readonly Analyze: Tool<"Analyze", { readonly parameters: typeof AnalyzeParameters; readonly success: toEncoded<typeof AiAnalysis>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly BagOfWords: Tool<"BagOfWords", { readonly parameters: typeof BagOfWordsParameters; readonly success: toEncoded<typeof BagOfWordsSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly BowCosineSimilarity: Tool<"BowCosineSimilarity", { readonly parameters: typeof BowCosineSimilarityParameters; readonly success: toEncoded<typeof BowCosineSimilaritySuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly ChunkBySentences: Tool<"ChunkBySentences", { readonly parameters: typeof ChunkBySentencesParameters; readonly success: toEncoded<typeof ChunkBySentencesSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly CorpusStats: Tool<"CorpusStats", { readonly parameters: typeof CorpusStatsParameters; readonly success: toEncoded<typeof AiCorpusStats>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly CreateCorpus: Tool<"CreateCorpus", { readonly parameters: typeof CreateCorpusParameters; readonly success: toEncoded<typeof AiCorpusSummary>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly DeleteCorpus: Tool<"DeleteCorpus", { readonly parameters: typeof DeleteCorpusParameters; readonly success: toEncoded<typeof DeleteCorpusSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly DocumentStats: Tool<"DocumentStats", { readonly parameters: typeof DocumentStatsParameters; readonly success: toEncoded<typeof AiDocumentStats>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly ExtractEntities: Tool<"ExtractEntities", { readonly parameters: typeof ExtractEntitiesParameters; readonly success: toEncoded<typeof ExtractEntitiesSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly ExtractKeywords: Tool<"ExtractKeywords", { readonly parameters: typeof ExtractKeywordsParameters; readonly success: toEncoded<typeof ExtractKeywordsSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly LearnCorpus: Tool<"LearnCorpus", { readonly parameters: typeof LearnCorpusParameters; readonly success: toEncoded<typeof LearnCorpusSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly LearnCustomEntities: Tool<"LearnCustomEntities", { readonly parameters: typeof LearnCustomEntitiesParameters; readonly success: toEncoded<typeof LearnCustomEntitiesSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly NGrams: Tool<"NGrams", { readonly parameters: typeof NGramsParameters; readonly success: toEncoded<typeof NGramsSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly Paragraphize: Tool<"Paragraphize", { readonly parameters: typeof ParagraphizeParameters; readonly success: toEncoded<typeof ParagraphizeSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly PhoneticMatch: Tool<"PhoneticMatch", { readonly parameters: typeof PhoneticMatchParameters; readonly success: toEncoded<typeof AiPhoneticMatch>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly QueryCorpus: Tool<"QueryCorpus", { readonly parameters: typeof QueryCorpusParameters; readonly success: toEncoded<typeof QueryCorpusSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly RankByRelevance: Tool<"RankByRelevance", { readonly parameters: typeof RankByRelevanceParameters; readonly success: toEncoded<typeof RankByRelevanceSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly RemoveStopWords: Tool<"RemoveStopWords", { readonly parameters: typeof RemoveStopWordsParameters; readonly success: toEncoded<typeof RemoveStopWordsSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly Sentences: Tool<"Sentences", { readonly parameters: typeof SentencesParameters; readonly success: toEncoded<typeof SentencesSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly Stem: Tool<"Stem", { readonly parameters: typeof StemParameters; readonly success: toEncoded<typeof StemSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly TextSimilarity: Tool<"TextSimilarity", { readonly parameters: typeof TextSimilarityParameters; readonly success: toEncoded<typeof TextSimilaritySuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly Tokenize: Tool<"Tokenize", { readonly parameters: typeof TokenizeParameters; readonly success: toEncoded<typeof TokenizeSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly TransformText: Tool<"TransformText", { readonly parameters: typeof TransformTextParameters; readonly success: toEncoded<typeof TransformTextSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly TverskySimilarity: Tool<"TverskySimilarity", { readonly parameters: typeof TverskySimilarityParameters; readonly success: toEncoded<typeof TverskySimilaritySuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly WordCount: Tool<"WordCount", { readonly parameters: typeof WordCountParameters; readonly success: toEncoded<typeof WordCountSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; }>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/NlpToolkit.ts#L140)

Since v0.0.0

## NlpTools

Canonical ordered NLP tool list used to build the toolkit and export
adapters.

The order is stable for export adapters that present tools to non-Effect
runtimes and for agents that need to inspect the available NLP surface.

**Example**

```ts
import { NlpTools } from "@beep/nlp/Tools/NlpToolkit"

const toolNames = NlpTools.map((tool) => tool.name)
const summary = {
  count: toolNames.length,
  hasTokenize: toolNames.includes("Tokenize")
}

console.log(summary)
// { count: 25, hasTokenize: true }
```

**Signature**

```ts
declare const NlpTools: NlpToolList
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/NlpToolkit.ts#L89)

Since v0.0.0