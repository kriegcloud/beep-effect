---
title: RankByRelevance.ts
nav_order: 63
parent: "@beep/nlp"
---

## RankByRelevance.ts overview

RankByRelevance tool definition.

Since v0.0.0

---
## Exports Grouped by Category
- [tools](#tools)
  - [RankByRelevance](#rankbyrelevance)
---

# tools

## RankByRelevance

Defines the agent-facing tool contract for ranking candidate texts by
relevance to a query.

Use this tool for one-shot retrieval over an in-memory candidate list when a
persistent corpus is unnecessary.

**Example**

```ts
import * as S from "effect/Schema"
import { RankByRelevance } from "@beep/nlp/Tools/RankByRelevance"

const parameters = S.decodeUnknownSync(RankByRelevance.parametersSchema)({
  query: "refund policy",
  texts: ["Shipping rules", "Refund policy details"],
  topN: 1
})

parameters.query
```

**Signature**

```ts
declare const RankByRelevance: Tool.Tool<"RankByRelevance", { readonly parameters: typeof RankByRelevanceParameters; readonly success: S.toEncoded<typeof RankByRelevanceSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/RankByRelevance.ts#L76)

Since v0.0.0