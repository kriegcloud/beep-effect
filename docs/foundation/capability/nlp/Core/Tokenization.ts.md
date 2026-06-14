---
title: Tokenization.ts
nav_order: 16
parent: "@beep/nlp"
---

## Tokenization.ts overview

Tokenization service contract.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [TokenizationError (class)](#tokenizationerror-class)
- [getters](#getters)
  - [sentences](#sentences)
  - [tokenCount](#tokencount)
  - [tokenize](#tokenize)
  - [tokenizeToDocument](#tokenizetodocument)
- [services](#services)
  - [Tokenization (class)](#tokenization-class)
---

# errors

## TokenizationError (class)

Tokenization error.

**Example**

```ts
import { TokenizationError } from "@beep/nlp/Core/Tokenization"

const error = TokenizationError.make({
  operation: "tokenize",
  cause: new Error("tokenizer unavailable")
})
console.log(error.operation) // "tokenize"
```

**Signature**

```ts
declare class TokenizationError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Tokenization.ts#L42)

Since v0.0.0

# getters

## sentences

Split text into sentences using the configured service.

**Example**

```ts
import { Chunk, Effect } from "effect"
import * as O from "effect/Option"
import { Document, DocumentId } from "@beep/nlp/Core/Document"
import { Tokenization, sentences } from "@beep/nlp/Core/Tokenization"

const service = Tokenization.of({
  tokenize: () => Effect.succeed([]),
  sentences: () => Effect.succeed([]),
  document: (text) =>
    Effect.succeed(Document.make({
      id: DocumentId.make("doc-001"),
      text,
      tokens: Chunk.empty(),
      sentences: Chunk.empty(),
      sentiment: O.none()
    })),
  tokenCount: () => Effect.succeed(0)
})
const program = Effect.provideService(sentences("Effect works."), Tokenization, service)
Effect.runPromise(program).then((sentences) => console.log(sentences.length)) // 0
```

**Signature**

```ts
declare const sentences: (text: string) => Effect.Effect<ReadonlyArray<Sentence>, TokenizationError, Tokenization>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Tokenization.ts#L139)

Since v0.0.0

## tokenCount

Count tokens using the configured service.

**Example**

```ts
import { Chunk, Effect } from "effect"
import * as O from "effect/Option"
import { Document, DocumentId } from "@beep/nlp/Core/Document"
import { Tokenization, tokenCount } from "@beep/nlp/Core/Tokenization"

const service = Tokenization.of({
  tokenize: () => Effect.succeed([]),
  sentences: () => Effect.succeed([]),
  document: (text) =>
    Effect.succeed(Document.make({
      id: DocumentId.make("doc-001"),
      text,
      tokens: Chunk.empty(),
      sentences: Chunk.empty(),
      sentiment: O.none()
    })),
  tokenCount: (text) => Effect.succeed(text.split(" ").length)
})
const program = Effect.provideService(tokenCount("typed effects"), Tokenization, service)
Effect.runPromise(program).then(console.log) // 2
```

**Signature**

```ts
declare const tokenCount: (text: string) => Effect.Effect<number, TokenizationError, Tokenization>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Tokenization.ts#L221)

Since v0.0.0

## tokenize

Tokenize text into tokens using the configured service.

**Example**

```ts
import { Chunk, Effect } from "effect"
import * as O from "effect/Option"
import { Document, DocumentId } from "@beep/nlp/Core/Document"
import { Tokenization, tokenize } from "@beep/nlp/Core/Tokenization"

const service = Tokenization.of({
  tokenize: () => Effect.succeed([]),
  sentences: () => Effect.succeed([]),
  document: (text) =>
    Effect.succeed(Document.make({
      id: DocumentId.make("doc-001"),
      text,
      tokens: Chunk.empty(),
      sentences: Chunk.empty(),
      sentiment: O.none()
    })),
  tokenCount: () => Effect.succeed(0)
})
const program = Effect.provideService(tokenize("typed effects"), Tokenization, service)
Effect.runPromise(program).then((tokens) => console.log(tokens.length)) // 0
```

**Signature**

```ts
declare const tokenize: (text: string) => Effect.Effect<ReadonlyArray<Token>, TokenizationError, Tokenization>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Tokenization.ts#L101)

Since v0.0.0

## tokenizeToDocument

Build a document using the configured service.

**Example**

```ts
import { Chunk, Effect } from "effect"
import * as O from "effect/Option"
import { Document, DocumentId } from "@beep/nlp/Core/Document"
import { Tokenization, tokenizeToDocument } from "@beep/nlp/Core/Tokenization"

const service = Tokenization.of({
  tokenize: () => Effect.succeed([]),
  sentences: () => Effect.succeed([]),
  document: (text, id = "doc-001") =>
    Effect.succeed(Document.make({
      id: DocumentId.make(id),
      text,
      tokens: Chunk.empty(),
      sentences: Chunk.empty(),
      sentiment: O.none()
    })),
  tokenCount: () => Effect.succeed(0)
})
const program = Effect.map(
  Effect.provideService(tokenizeToDocument("Effect works.", "doc-001"), Tokenization, service),
  (document) => document.id
)
Effect.runPromise(program).then(console.log) // "doc-001"
```

**Signature**

```ts
declare const tokenizeToDocument: (text: string, id?: string | (string & Brand<"DocumentId">) | undefined) => Effect.Effect<Document, TokenizationError, Tokenization>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Tokenization.ts#L180)

Since v0.0.0

# services

## Tokenization (class)

Tokenization service.

**Example**

```ts
import { Tokenization } from "@beep/nlp/Core/Tokenization"

console.log(Tokenization.key)
```

**Signature**

```ts
declare class Tokenization
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Tokenization.ts#L66)

Since v0.0.0