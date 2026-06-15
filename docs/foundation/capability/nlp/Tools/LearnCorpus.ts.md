---
title: LearnCorpus.ts
nav_order: 56
parent: "@beep/nlp"
---

## LearnCorpus.ts overview

LearnCorpus tool definition.

Since v0.0.0

---
## Exports Grouped by Category
- [tools](#tools)
  - [LearnCorpus](#learncorpus)
---

# tools

## LearnCorpus

Defines the agent-facing tool contract for incrementally learning documents
into an existing corpus session.

Use this tool after `CreateCorpus` to add searchable documents, optionally
skipping duplicate document ids during repeated ingestion.

**Example**

```ts
import * as S from "effect/Schema"
import { LearnCorpus } from "@beep/nlp/Tools/LearnCorpus"

const parameters = S.decodeUnknownSync(LearnCorpus.parametersSchema)({
  corpusId: "support-docs",
  dedupeById: true,
  documents: [{ id: "refunds", text: "Refund policy details." }]
})

parameters.documents[0]?.text
```

**Signature**

```ts
declare const LearnCorpus: Tool.Tool<"LearnCorpus", { readonly parameters: typeof LearnCorpusParameters; readonly success: S.toEncoded<typeof LearnCorpusSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/LearnCorpus.ts#L81)

Since v0.0.0