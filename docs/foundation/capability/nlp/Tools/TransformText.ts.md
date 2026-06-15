---
title: TransformText.ts
nav_order: 70
parent: "@beep/nlp"
---

## TransformText.ts overview

TransformText tool definition.

Since v0.0.0

---
## Exports Grouped by Category
- [tools](#tools)
  - [TransformText](#transformtext)
---

# tools

## TransformText

Defines the agent-facing tool contract for applying ordered text
normalization operations.

Use this tool when a caller needs deterministic cleanup such as lowercasing,
trimming, whitespace normalization, punctuation removal, or stop-word
removal before another NLP operation.

**Example**

```ts
import * as S from "effect/Schema"
import { TransformText } from "@beep/nlp/Tools/TransformText"

const parameters = S.decodeUnknownSync(TransformText.parametersSchema)({
  operations: ["trim", "lowercase", "removeExtraSpaces"],
  text: "  Refund   POLICY  "
})

parameters.operations
```

**Signature**

```ts
declare const TransformText: Tool.Tool<"TransformText", { readonly parameters: typeof TransformTextParameters; readonly success: S.toEncoded<typeof TransformTextSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/TransformText.ts#L95)

Since v0.0.0