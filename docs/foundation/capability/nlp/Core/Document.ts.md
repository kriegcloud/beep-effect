---
title: Document.ts
nav_order: 7
parent: "@beep/nlp"
---

## Document.ts overview

Core document model for NLP runtime services.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [Document (class)](#document-class)
  - [DocumentId](#documentid)
  - [DocumentId (type alias)](#documentid-type-alias)
  - [DocumentIndex (type alias)](#documentindex-type-alias)
- [validation](#validation)
  - [DocumentIndex](#documentindex)
  - [documentIndex](#documentindex-1)
---

# models

## Document (class)

Immutable document containing source text plus aligned tokens and sentences.

**Example**

```ts
import { Chunk } from "effect"
import * as O from "effect/Option"
import { Document as NLPDocument, DocumentId } from "@beep/nlp/Core/Document"

const document = NLPDocument.make({
  id: DocumentId.make("doc-001"),
  text: "Effect works.",
  tokens: Chunk.empty(),
  sentences: Chunk.empty(),
  sentiment: O.none()
})
console.log(document.tokenCount) // 0
```

**Signature**

```ts
declare class Document
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Document.ts#L193)

Since v0.0.0

## DocumentId

Stable non-empty identifier for a text document moving through NLP pipelines.

**Example**

```ts
import { DocumentId } from "@beep/nlp/Core/Document"

const id = DocumentId.make("doc-001")
console.log(id) // "doc-001"
```

**Signature**

```ts
declare const DocumentId: AnnotatedSchema<S.brand<S.NonEmptyString, "DocumentId">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Document.ts#L44)

Since v0.0.0

## DocumentId (type alias)

Runtime TypeScript type decoded by the `DocumentId` schema.

**Example**

```ts
import type { DocumentId } from "@beep/nlp/Core/Document"

const label = (id: DocumentId): string => `document:${id}`
console.log(typeof label) // "function"
```

**Signature**

```ts
type DocumentId = typeof DocumentId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Document.ts#L65)

Since v0.0.0

## DocumentIndex (type alias)

Zero-based position of a document inside an ordered corpus or batch.

**Example**

```ts
import type { DocumentIndex } from "@beep/nlp/Core/Document"

const next = (index: DocumentIndex): number => index + 1
console.log(typeof next) // "function"
```

**Signature**

```ts
type DocumentIndex = Brand.Branded<NonNegativeInt, "DocumentIndex">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Document.ts#L81)

Since v0.0.0

# validation

## DocumentIndex

Schema that decodes non-negative numbers into `DocumentIndex` values.

**Example**

```ts
import { DocumentIndex } from "@beep/nlp/Core/Document"

const index = DocumentIndex.make(3)
console.log(index) // 3
```

**Signature**

```ts
declare const DocumentIndex: AnnotatedSchema<S.brand<S.brand<S.brand<S.Int, "Int">, "NonNegativeInt">, "Int" | "NonNegativeInt" | "DocumentIndex">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Document.ts#L115)

Since v0.0.0

## documentIndex

Construct a branded document index after validating it is non-negative.

**Example**

```ts
import { documentIndex } from "@beep/nlp/Core/Document"

const first = documentIndex(0)
console.log(first) // 0
```

**Signature**

```ts
declare const documentIndex: Brand.Constructor<DocumentIndex>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Document.ts#L97)

Since v0.0.0