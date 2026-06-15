---
title: ChunkBySentences.ts
nav_order: 48
parent: "@beep/nlp"
---

## ChunkBySentences.ts overview

ChunkBySentences tool definition.

Since v0.0.0

---
## Exports Grouped by Category
- [tools](#tools)
  - [ChunkBySentences](#chunkbysentences)
---

# tools

## ChunkBySentences

Defines the agent-facing tool contract for splitting text into chunks that
preserve sentence boundaries.

Use this tool for retrieval, summarization, or prompt-packing workflows that
need bounded chunks without cutting through detected sentences.

**Example**

```ts
import * as S from "effect/Schema"
import { ChunkBySentences } from "@beep/nlp/Tools/ChunkBySentences"

const parameters = S.decodeUnknownSync(ChunkBySentences.parametersSchema)({
  maxChunkChars: 1200,
  text: "First sentence. Second sentence. Third sentence."
})

parameters.maxChunkChars
```

**Signature**

```ts
declare const ChunkBySentences: Tool.Tool<"ChunkBySentences", { readonly parameters: typeof ChunkBySentencesParameters; readonly success: S.toEncoded<typeof ChunkBySentencesSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/ChunkBySentences.ts#L67)

Since v0.0.0