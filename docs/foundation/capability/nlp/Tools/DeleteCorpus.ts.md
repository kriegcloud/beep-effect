---
title: DeleteCorpus.ts
nav_order: 51
parent: "@beep/nlp"
---

## DeleteCorpus.ts overview

DeleteCorpus tool definition.

Since v0.0.0

---
## Exports Grouped by Category
- [tools](#tools)
  - [DeleteCorpus](#deletecorpus)
---

# tools

## DeleteCorpus

Defines the agent-facing tool contract for deleting a managed corpus session
and releasing its in-memory index state.

Use this tool when a temporary corpus is no longer needed or a caller must
discard learned documents before recreating the corpus id.

**Example**

```ts
import * as S from "effect/Schema"
import { DeleteCorpus } from "@beep/nlp/Tools/DeleteCorpus"

const parameters = S.decodeUnknownSync(DeleteCorpus.parametersSchema)({
  corpusId: "support-docs"
})

parameters.corpusId
```

**Signature**

```ts
declare const DeleteCorpus: Tool.Tool<"DeleteCorpus", { readonly parameters: typeof DeleteCorpusParameters; readonly success: S.toEncoded<typeof DeleteCorpusSuccess>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Tools/DeleteCorpus.ts#L58)

Since v0.0.0