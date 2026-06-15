---
title: ExtractKeywords.ts
nav_order: 54
parent: "@beep/nlp"
---

## ExtractKeywords.ts overview

ExtractKeywords tool definition.

Since v0.0.0

---
## Exports Grouped by Category
- [tools](#tools)
  - [ExtractKeywords](#extractkeywords)
---

# tools

## ExtractKeywords

Defines the agent-facing tool contract for extracting ranked keyword terms
from a text.

Use this tool when a caller needs compact topical terms for tagging,
routing, search facets, or retrieval hints.

**Example**

```ts
import * as S from "effect/Schema"
import { ExtractKeywords } from "@beep/nlp/Tools/ExtractKeywords"

const parameters = S.decodeUnknownSync(ExtractKeywords.parametersSchema)({
  text: "Effect provides typed errors and structured concurrency.",
  topN: 3
})

parameters.topN
```

**Signature**

```ts
declare const ExtractKeywords: Tool.Tool<"ExtractKeywords", { readonly parameters: typeof ExtractKeywordsParameters; readonly success: S.toEncoded<typeof ExtractKeywordsSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/ExtractKeywords.ts#L65)

Since v0.0.0