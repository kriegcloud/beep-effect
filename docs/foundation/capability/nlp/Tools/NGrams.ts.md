---
title: NGrams.ts
nav_order: 58
parent: "@beep/nlp"
---

## NGrams.ts overview

NGrams tool definition.

Since v0.0.0

---
## Exports Grouped by Category
- [tools](#tools)
  - [NGrams](#ngrams)
---

# tools

## NGrams

Defines the agent-facing tool contract for extracting fixed-size character
n-grams from text.

Use this tool when a workflow needs repeatable shingles, top-frequency
n-grams, or bag-style n-gram features for downstream matching.

**Example**

```ts
import * as S from "effect/Schema"
import { NGrams } from "@beep/nlp/Tools/NGrams"

const parameters = S.decodeUnknownSync(NGrams.parametersSchema)({
  mode: "bag",
  size: 3,
  text: "natural language processing",
  topN: 5
})

parameters.size
```

**Signature**

```ts
declare const NGrams: Tool.Tool<"NGrams", { readonly parameters: typeof NGramsParameters; readonly success: S.toEncoded<typeof NGramsSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/NGrams.ts#L87)

Since v0.0.0