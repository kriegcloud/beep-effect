---
title: PhoneticMatch.ts
nav_order: 61
parent: "@beep/nlp"
---

## PhoneticMatch.ts overview

PhoneticMatch tool definition.

Since v0.0.0

---
## Exports Grouped by Category
- [tools](#tools)
  - [PhoneticMatch](#phoneticmatch)
---

# tools

## PhoneticMatch

Defines the agent-facing tool contract for comparing two texts by phonetic
encodings.

Use this tool for fuzzy name or phrase matching where spelling differences
should still match similar-sounding tokens.

**Example**

```ts
import * as S from "effect/Schema"
import { PhoneticMatch } from "@beep/nlp/Tools/PhoneticMatch"

const parameters = S.decodeUnknownSync(PhoneticMatch.parametersSchema)({
  algorithm: "soundex",
  minTokenLength: 2,
  text1: "Stephen Hawking",
  text2: "Steven Hocking"
})

parameters.algorithm
```

**Signature**

```ts
declare const PhoneticMatch: Tool.Tool<"PhoneticMatch", { readonly parameters: typeof PhoneticMatchParameters; readonly success: S.toEncoded<typeof AiPhoneticMatch>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/PhoneticMatch.ts#L74)

Since v0.0.0