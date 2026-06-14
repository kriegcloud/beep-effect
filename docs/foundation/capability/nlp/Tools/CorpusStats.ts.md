---
title: CorpusStats.ts
nav_order: 49
parent: "@beep/nlp"
---

## CorpusStats.ts overview

CorpusStats tool definition.

Since v0.0.0

---
## Exports Grouped by Category
- [tools](#tools)
  - [CorpusStats](#corpusstats)
---

# tools

## CorpusStats

Defines the agent-facing tool contract for inspecting a learned corpus'
vocabulary and vector statistics.

Use this tool for diagnostics, explainability, or retrieval tuning when a
caller needs IDF values, vocabulary size, and optional matrix details.

**Example**

```ts
import * as S from "effect/Schema"
import { CorpusStats } from "@beep/nlp/Tools/CorpusStats"

const parameters = S.decodeUnknownSync(CorpusStats.parametersSchema)({
  corpusId: "support-docs",
  includeIdf: true,
  includeMatrix: false,
  topIdfTerms: 20
})

parameters.includeIdf
```

**Signature**

```ts
declare const CorpusStats: Tool.Tool<"CorpusStats", { readonly parameters: typeof CorpusStatsParameters; readonly success: S.toEncoded<typeof AiCorpusStats>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/CorpusStats.ts#L61)

Since v0.0.0