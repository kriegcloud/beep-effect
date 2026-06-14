---
title: DocumentStats.ts
nav_order: 52
parent: "@beep/nlp"
---

## DocumentStats.ts overview

DocumentStats tool definition.

Since v0.0.0

---
## Exports Grouped by Category
- [tools](#tools)
  - [DocumentStats](#documentstats)
---

# tools

## DocumentStats

Defines the agent-facing tool contract for computing document-level text
statistics.

Use this tool when a caller needs quick counts for characters, words,
sentences, or average sentence length before deciding how to chunk or route
a document.

**Example**

```ts
import * as S from "effect/Schema"
import { DocumentStats } from "@beep/nlp/Tools/DocumentStats"

const parameters = S.decodeUnknownSync(DocumentStats.parametersSchema)({
  text: "One short sentence. Another follows."
})

parameters.text
```

**Signature**

```ts
declare const DocumentStats: Tool.Tool<"DocumentStats", { readonly parameters: typeof DocumentStatsParameters; readonly success: S.toEncoded<typeof AiDocumentStats>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/DocumentStats.ts#L50)

Since v0.0.0