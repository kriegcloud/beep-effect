---
title: Sentences.ts
nav_order: 65
parent: "@beep/nlp"
---

## Sentences.ts overview

Sentences tool definition.

Since v0.0.0

---
## Exports Grouped by Category
- [tools](#tools)
  - [Sentences](#sentences)
---

# tools

## Sentences

Defines the agent-facing tool contract for splitting text into sentence
records with offsets and token counts.

Use this tool before chunking, summarization, or citation workflows that need
stable sentence boundaries rather than raw token streams.

**Example**

```ts
import * as S from "effect/Schema"
import { Sentences } from "@beep/nlp/Tools/Sentences"

const parameters = S.decodeUnknownSync(Sentences.parametersSchema)({
  text: "Hello world. How are you?"
})

parameters.text
```

**Signature**

```ts
declare const Sentences: Tool.Tool<"Sentences", { readonly parameters: typeof SentencesParameters; readonly success: S.toEncoded<typeof SentencesSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/Sentences.ts#L59)

Since v0.0.0