---
title: QueryCorpus.ts
nav_order: 62
parent: "@beep/nlp"
---

## QueryCorpus.ts overview

QueryCorpus tool definition.

Since v0.0.0

---
## Exports Grouped by Category
- [tools](#tools)
  - [QueryCorpus](#querycorpus)
---

# tools

## QueryCorpus

Defines the agent-facing tool contract for querying a learned corpus session
without relearning its documents.

Use this tool after `LearnCorpus` when the caller needs vector-ranked corpus
results, optionally including each matched document's source text.

**Example**

```ts
import * as S from "effect/Schema"
import { QueryCorpus } from "@beep/nlp/Tools/QueryCorpus"

const parameters = S.decodeUnknownSync(QueryCorpus.parametersSchema)({
  corpusId: "support-docs",
  includeText: true,
  query: "refund policy",
  topN: 5
})

parameters.query
```

**Signature**

```ts
declare const QueryCorpus: Tool.Tool<"QueryCorpus", { readonly parameters: typeof QueryCorpusParameters; readonly success: S.toEncoded<typeof QueryCorpusSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/QueryCorpus.ts#L87)

Since v0.0.0