---
title: WordCount.ts
nav_order: 72
parent: "@beep/nlp"
---

## WordCount.ts overview

WordCount tool definition.

Since v0.0.0

---
## Exports Grouped by Category
- [tools](#tools)
  - [WordCount](#wordcount)
---

# tools

## WordCount

Defines the agent-facing tool contract for counting word-like tokens and
characters in text.

Use this tool for sizing, routing, or budgeting decisions that depend on the
approximate word and character volume of an input.

**Example**

```ts
import * as S from "effect/Schema"
import { WordCount } from "@beep/nlp/Tools/WordCount"

const parameters = S.decodeUnknownSync(WordCount.parametersSchema)({
  text: "Hello brave new world."
})

parameters.text
```

**Signature**

```ts
declare const WordCount: Tool.Tool<"WordCount", { readonly parameters: typeof WordCountParameters; readonly success: S.toEncoded<typeof WordCountSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/WordCount.ts#L59)

Since v0.0.0