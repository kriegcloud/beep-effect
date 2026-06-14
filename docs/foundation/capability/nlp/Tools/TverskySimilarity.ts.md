---
title: TverskySimilarity.ts
nav_order: 71
parent: "@beep/nlp"
---

## TverskySimilarity.ts overview

TverskySimilarity tool definition.

Since v0.0.0

---
## Exports Grouped by Category
- [tools](#tools)
  - [TverskySimilarity](#tverskysimilarity)
---

# tools

## TverskySimilarity

Defines the agent-facing tool contract for asymmetric Tversky similarity
over token sets.

Use this tool when one text should be treated as the reference and omission
versus extra-token penalties need separate `alpha` and `beta` weights.

**Example**

```ts
import * as S from "effect/Schema"
import { TverskySimilarity } from "@beep/nlp/Tools/TverskySimilarity"

const parameters = S.decodeUnknownSync(TverskySimilarity.parametersSchema)({
  alpha: 0.7,
  beta: 0.3,
  text1: "refund policy shipping",
  text2: "refund policy"
})

parameters.alpha
```

**Signature**

```ts
declare const TverskySimilarity: Tool.Tool<"TverskySimilarity", { readonly parameters: typeof TverskySimilarityParameters; readonly success: S.toEncoded<typeof TverskySimilaritySuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/TverskySimilarity.ts#L84)

Since v0.0.0