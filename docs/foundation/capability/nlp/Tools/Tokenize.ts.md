---
title: Tokenize.ts
nav_order: 68
parent: "@beep/nlp"
---

## Tokenize.ts overview

Tokenize tool definition.

Since v0.0.0

---
## Exports Grouped by Category
- [tools](#tools)
  - [Tokenize](#tokenize)
---

# tools

## Tokenize

Defines the agent-facing tool contract for tokenizing text into annotated
linguistic tokens.

Use this tool when a caller needs token text, lemmas, stems, part-of-speech
tags, stop-word flags, punctuation flags, and character offsets for each
token in a document.

**Example**

```ts
import * as S from "effect/Schema"
import { Tokenize } from "@beep/nlp/Tools/Tokenize"

const parameters = S.decodeUnknownSync(Tokenize.parametersSchema)({
  text: "The quick brown fox jumps."
})

parameters.text
```

**Signature**

```ts
declare const Tokenize: Tool.Tool<"Tokenize", { readonly parameters: typeof TokenizeParameters; readonly success: S.toEncoded<typeof TokenizeSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/Tokenize.ts#L60)

Since v0.0.0