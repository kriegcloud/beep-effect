---
title: Stem.ts
nav_order: 66
parent: "@beep/nlp"
---

## Stem.ts overview

Stem tool definition.

Since v0.0.0

---
## Exports Grouped by Category
- [tools](#tools)
  - [Stem](#stem)
---

# tools

## Stem

Defines the agent-facing tool contract for reducing word tokens to their
stems.

Use this tool when a caller needs normalized stem forms for matching,
deduplication, or lightweight indexing.

**Example**

```ts
import * as S from "effect/Schema"
import { Stem } from "@beep/nlp/Tools/Stem"

const parameters = S.decodeUnknownSync(Stem.parametersSchema)({
  text: "running runners ran"
})

parameters.text
```

**Signature**

```ts
declare const Stem: Tool.Tool<"Stem", { readonly parameters: typeof StemParameters; readonly success: S.toEncoded<typeof StemSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/Stem.ts#L59)

Since v0.0.0