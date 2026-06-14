---
title: CreateCorpus.ts
nav_order: 50
parent: "@beep/nlp"
---

## CreateCorpus.ts overview

CreateCorpus tool definition.

Since v0.0.0

---
## Exports Grouped by Category
- [tools](#tools)
  - [CreateCorpus](#createcorpus)
---

# tools

## CreateCorpus

Defines the agent-facing tool contract for creating a stateful BM25-style
corpus session.

Use this tool before `LearnCorpus`, `QueryCorpus`, or `CorpusStats` when the
caller needs a reusable in-memory corpus with optional BM25 parameter
overrides.

**Example**

```ts
import * as S from "effect/Schema"
import { CreateCorpus } from "@beep/nlp/Tools/CreateCorpus"

const parameters = S.decodeUnknownSync(CreateCorpus.parametersSchema)({
  bm25Config: { b: 0.75, k: 1, k1: 1.2 },
  corpusId: "support-docs"
})

parameters.corpusId
```

**Signature**

```ts
declare const CreateCorpus: Tool.Tool<"CreateCorpus", { readonly parameters: typeof CreateCorpusParameters; readonly success: S.toEncoded<typeof AiCorpusSummary>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/CreateCorpus.ts#L75)

Since v0.0.0