---
title: ExtractEntities.ts
nav_order: 53
parent: "@beep/nlp"
---

## ExtractEntities.ts overview

ExtractEntities tool definition.

Since v0.0.0

---
## Exports Grouped by Category
- [tools](#tools)
  - [ExtractEntities](#extractentities)
---

# tools

## ExtractEntities

Defines the agent-facing tool contract for extracting built-in and custom
named entities from text.

Use this tool when a caller needs entity values, entity types, token
boundaries, and character offsets for dates, money, emails, URLs, or learned
custom patterns.

**Example**

```ts
import * as S from "effect/Schema"
import { ExtractEntities } from "@beep/nlp/Tools/ExtractEntities"

const parameters = S.decodeUnknownSync(ExtractEntities.parametersSchema)({
  includeCustom: true,
  text: "Email john@example.com before 2026-01-15."
})

parameters.includeCustom
```

**Signature**

```ts
declare const ExtractEntities: Tool.Tool<"ExtractEntities", { readonly parameters: typeof ExtractEntitiesParameters; readonly success: S.toEncoded<typeof ExtractEntitiesSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/ExtractEntities.ts#L77)

Since v0.0.0