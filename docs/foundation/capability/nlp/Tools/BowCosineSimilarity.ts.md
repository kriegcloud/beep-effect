---
title: BowCosineSimilarity.ts
nav_order: 47
parent: "@beep/nlp"
---

## BowCosineSimilarity.ts overview

BowCosineSimilarity tool definition.

Since v0.0.0

---
## Exports Grouped by Category
- [tools](#tools)
  - [BowCosineSimilarity](#bowcosinesimilarity)
---

# tools

## BowCosineSimilarity

Defines the agent-facing tool contract for comparing two texts by
bag-of-words cosine similarity.

Use this tool when exact lexical overlap matters more than corpus-weighted
BM25 similarity, such as duplicate detection or keyword-overlap checks.

**Example**

```ts
import * as S from "effect/Schema"
import { BowCosineSimilarity } from "@beep/nlp/Tools/BowCosineSimilarity"

const parameters = S.decodeUnknownSync(BowCosineSimilarity.parametersSchema)({
  text1: "shipping refund policy",
  text2: "refund and shipping rules"
})

parameters.text2
```

**Signature**

```ts
declare const BowCosineSimilarity: Tool.Tool<"BowCosineSimilarity", { readonly parameters: typeof BowCosineSimilarityParameters; readonly success: S.toEncoded<typeof BowCosineSimilaritySuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/BowCosineSimilarity.ts#L69)

Since v0.0.0