---
title: index.ts
nav_order: 3
parent: "@beep/langextract"
---

## index.ts overview

Adapters from LangExtract results to `@beep/nlp/Handoff`.

Since v0.0.0

---
## Exports Grouped by Category
- [interop](#interop)
  - [AnnotatedDocumentInput (class)](#annotateddocumentinput-class)
  - [toAnnotatedDocument](#toannotateddocument)
---

# interop

## AnnotatedDocumentInput (class)

Input required to build an NLP handoff document.

**Example**

```ts
import { AnnotatedDocumentInput } from "@beep/langextract/Handoff"
import { DocumentId } from "@beep/nlp/Core"

const input = AnnotatedDocumentInput.make({
  documentId: DocumentId.make("doc-1"),
  extractions: [],
  generatedBy: "@beep/langextract",
  text: "Ada Lovelace wrote notes.",
  timestamp: 0
})
console.log(input.documentId)
```

**Signature**

```ts
declare class AnnotatedDocumentInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/langextract/blob/main/src/Handoff/index.ts#L38)

Since v0.0.0

## toAnnotatedDocument

Convert grounded extractions into the generic NLP handoff envelope.

**Example**

```ts
import { toAnnotatedDocument } from "@beep/langextract/Handoff"
import { DocumentId } from "@beep/nlp/Core"

const annotated = toAnnotatedDocument({
  documentId: DocumentId.make("doc-1"),
  extractions: [],
  generatedBy: "@beep/langextract",
  text: "Ada Lovelace wrote notes.",
  timestamp: 0
})
console.log(annotated.version)
```

**Signature**

```ts
declare const toAnnotatedDocument: (input: AnnotatedDocumentInput) => Contract.AnnotatedDocument
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/langextract/blob/main/src/Handoff/index.ts#L108)

Since v0.0.0