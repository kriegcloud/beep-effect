---
title: TextSimilarity.ts
nav_order: 67
parent: "@beep/nlp"
---

## TextSimilarity.ts overview

TextSimilarity tool definition.

Since v0.0.0

---
## Exports Grouped by Category
- [tools](#tools)
  - [TextSimilarity](#textsimilarity)
---

# tools

## TextSimilarity

Defines the agent-facing tool contract for comparing two texts with BM25
vectorization and cosine similarity.

Use this tool when the caller needs a normalized semantic-ish similarity
score for two standalone texts without creating a persistent corpus.

**Example**

```ts
import * as S from "effect/Schema"
import { TextSimilarity } from "@beep/nlp/Tools/TextSimilarity"

const parameters = S.decodeUnknownSync(TextSimilarity.parametersSchema)({
  text1: "Cats are wonderful pets.",
  text2: "Felines make great companions."
})

parameters.text1
```

**Signature**

```ts
declare const TextSimilarity: Tool.Tool<"TextSimilarity", { readonly parameters: typeof TextSimilarityParameters; readonly success: S.toEncoded<typeof TextSimilaritySuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/TextSimilarity.ts#L69)

Since v0.0.0