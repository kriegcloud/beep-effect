---
title: Analyze.ts
nav_order: 45
parent: "@beep/nlp"
---

## Analyze.ts overview

Analyze tool definition.

Since v0.0.0

---
## Exports Grouped by Category
- [tools](#tools)
  - [Analyze](#analyze)
---

# tools

## Analyze

Defines the agent-facing tool contract for running a composite linguistic
analysis over text.

Use this tool when a caller needs counts, sentence texts, and annotated
tokens from a single pass instead of invoking tokenization, sentence, and
statistics tools separately.

**Example**

```ts
import * as S from "effect/Schema"
import { Analyze } from "@beep/nlp/Tools/Analyze"

const parameters = S.decodeUnknownSync(Analyze.parametersSchema)({
  text: "The quick brown fox. It was fast."
})

parameters.text
```

**Signature**

```ts
declare const Analyze: Tool.Tool<"Analyze", { readonly parameters: typeof AnalyzeParameters; readonly success: S.toEncoded<typeof AiAnalysis>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/Analyze.ts#L50)

Since v0.0.0