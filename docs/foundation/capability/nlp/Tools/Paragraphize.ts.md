---
title: Paragraphize.ts
nav_order: 60
parent: "@beep/nlp"
---

## Paragraphize.ts overview

Paragraphize tool definition.

Since v0.0.0

---
## Exports Grouped by Category
- [tools](#tools)
  - [Paragraphize](#paragraphize)
---

# tools

## Paragraphize

Defines the agent-facing tool contract for splitting text into paragraphs on
blank-line boundaries.

Use this tool before chunking or summarization workflows that need
paragraph-level segments rather than raw sentences or tokens.

**Example**

```ts
import * as S from "effect/Schema"
import { Paragraphize } from "@beep/nlp/Tools/Paragraphize"

const parameters = S.decodeUnknownSync(Paragraphize.parametersSchema)({
  text: "First paragraph.\n\nSecond paragraph."
})

parameters.text
```

**Signature**

```ts
declare const Paragraphize: Tool.Tool<"Paragraphize", { readonly parameters: typeof ParagraphizeParameters; readonly success: S.toEncoded<typeof ParagraphizeSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/Paragraphize.ts#L59)

Since v0.0.0