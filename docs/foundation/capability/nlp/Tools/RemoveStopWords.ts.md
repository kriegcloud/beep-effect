---
title: RemoveStopWords.ts
nav_order: 64
parent: "@beep/nlp"
---

## RemoveStopWords.ts overview

RemoveStopWords tool definition.

Since v0.0.0

---
## Exports Grouped by Category
- [tools](#tools)
  - [RemoveStopWords](#removestopwords)
---

# tools

## RemoveStopWords

Defines the agent-facing tool contract for removing stop words from text and
returning the remaining word tokens.

Use this tool when a caller needs content-bearing tokens for keyword
extraction, matching, or compact feature generation.

**Example**

```ts
import * as S from "effect/Schema"
import { RemoveStopWords } from "@beep/nlp/Tools/RemoveStopWords"

const parameters = S.decodeUnknownSync(RemoveStopWords.parametersSchema)({
  text: "the quick brown fox"
})

parameters.text
```

**Signature**

```ts
declare const RemoveStopWords: Tool.Tool<"RemoveStopWords", { readonly parameters: typeof RemoveStopWordsParameters; readonly success: S.toEncoded<typeof RemoveStopWordsSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/RemoveStopWords.ts#L60)

Since v0.0.0