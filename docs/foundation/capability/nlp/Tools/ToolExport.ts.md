---
title: ToolExport.ts
nav_order: 69
parent: "@beep/nlp"
---

## ToolExport.ts overview

Positional export adapter for NLP tools.

Since v0.0.0

---
## Exports Grouped by Category
- [adapters](#adapters)
  - [exportTools](#exporttools)
- [errors](#errors)
  - [ExportedToolError (class)](#exportedtoolerror-class)
- [models](#models)
  - [ExportedTool (interface)](#exportedtool-interface)
---

# adapters

## exportTools

Effect that exports every NLP toolkit tool as a positional descriptor.

Use this adapter when an integration cannot call Effect AI toolkit handlers
directly and instead needs ordered argument names, JSON schemas, timeouts,
usage snippets, and a single Effectful handler per tool.

**Example**

```ts
import { Effect } from "effect"
import { exportTools } from "@beep/nlp/Tools/ToolExport"
import { WinkNlpToolkitLive } from "@beep/wink"

const toolNames = await Effect.runPromise(
  exportTools.pipe(
    Effect.map((tools) => tools.map((tool) => tool.name)),
    Effect.provide(WinkNlpToolkitLive)
  )
)

toolNames.includes("Tokenize")
```

**Signature**

```ts
declare const exportTools: Effect.Effect<ReadonlyArray<ExportedTool>, ExportedToolError, Tool.HandlersFor<{ readonly Analyze: Tool.Tool<"Analyze", { readonly parameters: typeof AnalyzeParameters; readonly success: S.toEncoded<typeof AiAnalysis>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly BagOfWords: Tool.Tool<"BagOfWords", { readonly parameters: typeof BagOfWordsParameters; readonly success: S.toEncoded<typeof BagOfWordsSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly BowCosineSimilarity: Tool.Tool<"BowCosineSimilarity", { readonly parameters: typeof BowCosineSimilarityParameters; readonly success: S.toEncoded<typeof BowCosineSimilaritySuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly ChunkBySentences: Tool.Tool<"ChunkBySentences", { readonly parameters: typeof ChunkBySentencesParameters; readonly success: S.toEncoded<typeof ChunkBySentencesSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly CorpusStats: Tool.Tool<"CorpusStats", { readonly parameters: typeof CorpusStatsParameters; readonly success: S.toEncoded<typeof AiCorpusStats>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly CreateCorpus: Tool.Tool<"CreateCorpus", { readonly parameters: typeof CreateCorpusParameters; readonly success: S.toEncoded<typeof AiCorpusSummary>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly DeleteCorpus: Tool.Tool<"DeleteCorpus", { readonly parameters: typeof DeleteCorpusParameters; readonly success: S.toEncoded<typeof DeleteCorpusSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly DocumentStats: Tool.Tool<"DocumentStats", { readonly parameters: typeof DocumentStatsParameters; readonly success: S.toEncoded<typeof AiDocumentStats>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly ExtractEntities: Tool.Tool<"ExtractEntities", { readonly parameters: typeof ExtractEntitiesParameters; readonly success: S.toEncoded<typeof ExtractEntitiesSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly ExtractKeywords: Tool.Tool<"ExtractKeywords", { readonly parameters: typeof ExtractKeywordsParameters; readonly success: S.toEncoded<typeof ExtractKeywordsSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly LearnCorpus: Tool.Tool<"LearnCorpus", { readonly parameters: typeof LearnCorpusParameters; readonly success: S.toEncoded<typeof LearnCorpusSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly LearnCustomEntities: Tool.Tool<"LearnCustomEntities", { readonly parameters: typeof LearnCustomEntitiesParameters; readonly success: S.toEncoded<typeof LearnCustomEntitiesSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly NGrams: Tool.Tool<"NGrams", { readonly parameters: typeof NGramsParameters; readonly success: S.toEncoded<typeof NGramsSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly Paragraphize: Tool.Tool<"Paragraphize", { readonly parameters: typeof ParagraphizeParameters; readonly success: S.toEncoded<typeof ParagraphizeSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly PhoneticMatch: Tool.Tool<"PhoneticMatch", { readonly parameters: typeof PhoneticMatchParameters; readonly success: S.toEncoded<typeof AiPhoneticMatch>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly QueryCorpus: Tool.Tool<"QueryCorpus", { readonly parameters: typeof QueryCorpusParameters; readonly success: S.toEncoded<typeof QueryCorpusSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly RankByRelevance: Tool.Tool<"RankByRelevance", { readonly parameters: typeof RankByRelevanceParameters; readonly success: S.toEncoded<typeof RankByRelevanceSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly RemoveStopWords: Tool.Tool<"RemoveStopWords", { readonly parameters: typeof RemoveStopWordsParameters; readonly success: S.toEncoded<typeof RemoveStopWordsSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly Sentences: Tool.Tool<"Sentences", { readonly parameters: typeof SentencesParameters; readonly success: S.toEncoded<typeof SentencesSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly Stem: Tool.Tool<"Stem", { readonly parameters: typeof StemParameters; readonly success: S.toEncoded<typeof StemSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly TextSimilarity: Tool.Tool<"TextSimilarity", { readonly parameters: typeof TextSimilarityParameters; readonly success: S.toEncoded<typeof TextSimilaritySuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly Tokenize: Tool.Tool<"Tokenize", { readonly parameters: typeof TokenizeParameters; readonly success: S.toEncoded<typeof TokenizeSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly TransformText: Tool.Tool<"TransformText", { readonly parameters: typeof TransformTextParameters; readonly success: S.toEncoded<typeof TransformTextSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly TverskySimilarity: Tool.Tool<"TverskySimilarity", { readonly parameters: typeof TverskySimilarityParameters; readonly success: S.toEncoded<typeof TverskySimilaritySuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly WordCount: Tool.Tool<"WordCount", { readonly parameters: typeof WordCountParameters; readonly success: S.toEncoded<typeof WordCountSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/ToolExport.ts#L395)

Since v0.0.0

# errors

## ExportedToolError (class)

Typed failure for the positional tool export adapter.

The error preserves the tool name, a caller-facing message, and the original
unknown cause when parameter decoding, toolkit startup, stream execution, or
result extraction fails.

**Example**

```ts
import { Effect } from "effect"
import { ExportedToolError } from "@beep/nlp/Tools/ToolExport"

const recovered = await Effect.runPromise(
  Effect.fail(
    ExportedToolError.fromCause(new Error("missing text"), "Tokenize", {
      message: "Invalid parameters for Tokenize"
    })
  ).pipe(
    Effect.catchTag("ExportedToolError", (error) =>
      Effect.succeed(`${error.toolName}: ${error.message}`)
    )
  )
)

if (recovered !== "Tokenize: Invalid parameters for Tokenize") {
  throw new Error(recovered)
}
```

**Signature**

```ts
declare class ExportedToolError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/ToolExport.ts#L112)

Since v0.0.0

# models

## ExportedTool (interface)

Runtime descriptor for a tool exported as a positional function contract.

The descriptor exposes stable argument ordering, JSON schemas, examples, and
an Effectful `handle` function that validates positional arguments before
delegating to the toolkit handler.

**Example**

```ts
import { Effect } from "effect"
import type { ExportedTool } from "@beep/nlp/Tools/ToolExport"

const tokenizeDescriptor = {
  description: "Tokenize text",
  handle: (args: ReadonlyArray<unknown>) => Effect.succeed(args[0]),
  name: "Tokenize",
  parameterNames: ["text"],
  parametersJsonSchema: {},
  returnsJsonSchema: {},
  timeoutMs: 30_000,
  usageExamples: ['const result = await Tokenize("Hello world.")']
} satisfies ExportedTool

tokenizeDescriptor.parameterNames
```

**Signature**

```ts
export interface ExportedTool {
  readonly description: string;
  readonly handle: (args: ReadonlyArray<unknown>) => Effect.Effect<unknown, ExportedToolError>;
  readonly name: string;
  readonly parameterNames: ReadonlyArray<string>;
  readonly parametersJsonSchema: object;
  readonly returnsJsonSchema: object;
  readonly timeoutMs: number;
  readonly usageExamples: ReadonlyArray<string>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/ToolExport.ts#L174)

Since v0.0.0