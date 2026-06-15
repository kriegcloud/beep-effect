---
title: BagOfWords.ts
nav_order: 46
parent: "@beep/nlp"
---

## BagOfWords.ts overview

BagOfWords tool definition.

Since v0.0.0

---
## Exports Grouped by Category
- [tools](#tools)
  - [BagOfWords](#bagofwords)
---

# tools

## BagOfWords

Defines the agent-facing tool contract for computing a bag-of-words
term-frequency table from text.

Use this tool when a caller needs normalized term counts for matching,
feature generation, or lightweight relevance scoring.

**Example**

```ts
import * as S from "effect/Schema"
import { BagOfWords } from "@beep/nlp/Tools/BagOfWords"

const parameters = S.decodeUnknownSync(BagOfWords.parametersSchema)({
  text: "the cat sat on the mat"
})

parameters.text
```

**Signature**

```ts
declare const BagOfWords: Tool.Tool<"BagOfWords", { readonly parameters: typeof BagOfWordsParameters; readonly success: S.toEncoded<typeof BagOfWordsSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/BagOfWords.ts#L60)

Since v0.0.0