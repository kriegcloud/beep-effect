---
title: LearnCustomEntities.ts
nav_order: 57
parent: "@beep/nlp"
---

## LearnCustomEntities.ts overview

LearnCustomEntities tool definition.

Since v0.0.0

---
## Exports Grouped by Category
- [tools](#tools)
  - [LearnCustomEntities](#learncustomentities)
---

# tools

## LearnCustomEntities

Defines the agent-facing tool contract for learning custom entity patterns
that augment built-in entity extraction.

Use this tool before `ExtractEntities` when a domain needs bracket-token
patterns such as `[PROPN]`, `[CARDINAL]`, or `[$]` to identify custom labels.

**Example**

```ts
import * as S from "effect/Schema"
import { LearnCustomEntities } from "@beep/nlp/Tools/LearnCustomEntities"

const parameters = S.decodeUnknownSync(LearnCustomEntities.parametersSchema)({
  entities: [{ name: "PRODUCT_CODE", patterns: ["[PROPN]", "[CARDINAL]"] }],
  groupName: "support-entities",
  mode: "append"
})

parameters.entities[0]?.name
```

**Signature**

```ts
declare const LearnCustomEntities: Tool.Tool<"LearnCustomEntities", { readonly parameters: typeof LearnCustomEntitiesParameters; readonly success: S.toEncoded<typeof LearnCustomEntitiesSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/LearnCustomEntities.ts#L99)

Since v0.0.0