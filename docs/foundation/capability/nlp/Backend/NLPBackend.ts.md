---
title: NLPBackend.ts
nav_order: 6
parent: "@beep/nlp"
---

## NLPBackend.ts overview

Pluggable NLP backend interface.

Defines the abstract contract every NLP backend (wink-nlp, CoreNLP, spaCy, an
LLM adapter, ...) implements so the capability can swap engines while keeping a
stable API. Backends form a category: objects are backends, morphisms are
adapters/wrappers, and composition enables fallback strategies.

Effect v4 `@beep/nlp` implementation notes:
`Data.TaggedError` becomes `@beep/schema#TaggedErrorClass` scoped by a
`$NlpId` composer, `Context.GenericTag` becomes the
`Context.Service` class form used across this package, and `Object.keys`
becomes `Struct.keys`.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [initError](#initerror)
  - [notSupported](#notsupported)
  - [operationError](#operationerror)
- [errors](#errors)
  - [BackendInitError (class)](#backendiniterror-class)
  - [BackendNotSupported (class)](#backendnotsupported-class)
  - [BackendOperationError (class)](#backendoperationerror-class)
  - [NLPBackendError](#nlpbackenderror)
- [models](#models)
  - [BackendCapabilities (class)](#backendcapabilities-class)
  - [NLPBackendShape (interface)](#nlpbackendshape-interface)
- [services](#services)
  - [NLPBackend (class)](#nlpbackend-class)
- [type-level](#type-level)
  - [NLPBackendError (type alias)](#nlpbackenderror-type-alias)
- [utilities](#utilities)
  - [getSupportedCapabilities](#getsupportedcapabilities)
  - [supportsCapability](#supportscapability)
---

# constructors

## initError

Construct a `BackendInitError` from an unknown initialization cause.

**Example**

```ts
import { initError } from "@beep/nlp/Backend/NLPBackend"

const error = initError("wink-nlp", new Error("missing model"))
console.log(error.backend) // "wink-nlp"
```

**Signature**

```ts
declare const initError: (backend: string, cause: unknown) => BackendInitError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Backend/NLPBackend.ts#L423)

Since v0.0.0

## notSupported

Construct a `BackendNotSupported` failure with a default message.

**Example**

```ts
import { notSupported } from "@beep/nlp/Backend/NLPBackend"

const error = notSupported("minimal", "dependencyParsing")
console.log(error.message.includes("dependencyParsing")) // true
```

**Signature**

```ts
declare const notSupported: (backend: string, operation: string, message?: string) => BackendNotSupported
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Backend/NLPBackend.ts#L402)

Since v0.0.0

## operationError

Construct a `BackendOperationError` for a failed backend operation.

**Example**

```ts
import { operationError } from "@beep/nlp/Backend/NLPBackend"

const error = operationError("wink-nlp", "tokenize", new Error("bad input"))
console.log(error.operation) // "tokenize"
```

**Signature**

```ts
declare const operationError: (backend: string, operation: string, cause: unknown) => BackendOperationError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Backend/NLPBackend.ts#L444)

Since v0.0.0

# errors

## BackendInitError (class)

Failure raised when a backend fails to initialize.

**Example**

```ts
import { BackendInitError } from "@beep/nlp/Backend/NLPBackend"

const error = BackendInitError.make({
  backend: "wink-nlp",
  cause: new Error("model load failed"),
  message: "Backend wink-nlp failed to initialize"
})
console.log(error.backend) // "wink-nlp"
```

**Signature**

```ts
declare class BackendInitError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Backend/NLPBackend.ts#L79)

Since v0.0.0

## BackendNotSupported (class)

Failure raised when a backend does not support a requested operation.

**Example**

```ts
import { BackendNotSupported } from "@beep/nlp/Backend/NLPBackend"

const error = BackendNotSupported.make({
  backend: "minimal",
  operation: "parseDependencies",
  message: "Dependency parsing is unavailable"
})
console.log(error._tag) // "BackendNotSupported"
```

**Signature**

```ts
declare class BackendNotSupported
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Backend/NLPBackend.ts#L49)

Since v0.0.0

## BackendOperationError (class)

Failure raised when a backend operation fails at runtime.

**Example**

```ts
import { BackendOperationError } from "@beep/nlp/Backend/NLPBackend"

const error = BackendOperationError.make({
  backend: "wink-nlp",
  operation: "posTag",
  cause: new Error("tokenizer failed"),
  message: "Backend wink-nlp operation posTag failed"
})
console.log(error.operation) // "posTag"
```

**Signature**

```ts
declare class BackendOperationError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Backend/NLPBackend.ts#L110)

Since v0.0.0

## NLPBackendError

Tagged schema union for every recoverable backend failure.

**Example**

```ts
import * as S from "effect/Schema"
import { notSupported, NLPBackendError } from "@beep/nlp/Backend/NLPBackend"

const error = notSupported("minimal", "ner")
console.log(S.is(NLPBackendError)(error)) // true
```

**Signature**

```ts
declare const NLPBackendError: AnnotatedSchema<S.Union<readonly [typeof BackendNotSupported, typeof BackendInitError, typeof BackendOperationError]> & TaggedUnionUtils<"_tag", readonly [typeof BackendNotSupported, typeof BackendInitError, typeof BackendOperationError], [typeof BackendNotSupported, typeof BackendInitError, typeof BackendOperationError]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Backend/NLPBackend.ts#L138)

Since v0.0.0

# models

## BackendCapabilities (class)

Capability bitmap that describes which operations a backend can perform.

**Example**

```ts
import type { BackendCapabilities } from "@beep/nlp/Backend/NLPBackend"

const capabilities: BackendCapabilities = {
  constituencyParsing: false,
  coreferenceResolution: false,
  dependencyParsing: false,
  lemmatization: true,
  ner: true,
  posTagging: true,
  relationExtraction: false,
  sentencization: true,
  tokenization: true
}
console.log(capabilities.tokenization) // true
```

**Signature**

```ts
declare class BackendCapabilities
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Backend/NLPBackend.ts#L185)

Since v0.0.0

## NLPBackendShape (interface)

Structural shape of the `NLPBackend` service.

Operations a backend does not support should fail with
`BackendNotSupported`. The annotation operations are functors over text:
`posTag`/`lemmatize` preserve token structure, `extractEntities`/
`extractRelations` surface semantic spans.

**Example**

```ts
import { Effect } from "effect"
import type { NLPBackendShape } from "@beep/nlp/Backend/NLPBackend"

const backend: NLPBackendShape = {
  name: "minimal",
  capabilities: {
    constituencyParsing: false,
    coreferenceResolution: false,
    dependencyParsing: false,
    lemmatization: false,
    ner: false,
    posTagging: false,
    relationExtraction: false,
    sentencization: true,
    tokenization: true
  },
  tokenize: (text) => Effect.succeed(text.split(" ")),
  sentencize: (text) => Effect.succeed([text]),
  posTag: () => Effect.succeed([]),
  lemmatize: () => Effect.succeed([]),
  extractEntities: () => Effect.succeed([]),
  parseDependencies: () => Effect.succeed([]),
  extractRelations: () => Effect.succeed([])
}
console.log(backend.name) // "minimal"
```

**Signature**

```ts
export interface NLPBackendShape {
  /** Capabilities this backend supports. */
  readonly capabilities: BackendCapabilities;
  /** Extract named entities (functor `Text -> [Entity]`). */
  readonly extractEntities: (text: string) => Effect.Effect<ReadonlyArray<GraphSchema.EntityNode>, NLPBackendError>;
  /** Extract semantic relations between entities. */
  readonly extractRelations: (text: string) => Effect.Effect<ReadonlyArray<GraphSchema.RelationNode>, NLPBackendError>;
  /** Lemmatize tokens to canonical forms (forgetful functor `[Token] -> [Lemma]`). */
  readonly lemmatize: (text: string) => Effect.Effect<ReadonlyArray<GraphSchema.LemmaNode>, NLPBackendError>;
  /** Backend name (e.g. `"wink-nlp"`, `"stanford-corenlp"`, `"spacy"`). */
  readonly name: string;
  /** Parse syntactic dependencies (functor `Sentence -> Graph<Token, Dependency>`). */
  readonly parseDependencies: (
    sentence: string
  ) => Effect.Effect<ReadonlyArray<GraphSchema.DependencyNode>, NLPBackendError>;
  /** Tag tokens with part-of-speech labels (functor `[Token] -> [POSNode]`). */
  readonly posTag: (text: string) => Effect.Effect<ReadonlyArray<GraphSchema.POSNode>, NLPBackendError>;
  /** Split text into sentences (free functor `Text -> [Sentence]`). */
  readonly sentencize: (text: string) => Effect.Effect<ReadonlyArray<string>, NLPBackendError>;
  /** Split text into tokens (free functor `Text -> [Token]`). */
  readonly tokenize: (text: string) => Effect.Effect<ReadonlyArray<string>, NLPBackendError>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Backend/NLPBackend.ts#L269)

Since v0.0.0

# services

## NLPBackend (class)

Service tag for the pluggable `NLPBackendShape` backend.

**Example**

```ts
import { NLPBackend } from "@beep/nlp/Backend/NLPBackend"

console.log(NLPBackend.key)
```

**Signature**

```ts
declare class NLPBackend
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Backend/NLPBackend.ts#L305)

Since v0.0.0

# type-level

## NLPBackendError (type alias)

Runtime TypeScript type represented by the `NLPBackendError` schema.

**Example**

```ts
import type { NLPBackendError } from "@beep/nlp/Backend/NLPBackend"

const tag = (error: NLPBackendError) => error._tag
console.log(tag)
```

**Signature**

```ts
type NLPBackendError = typeof NLPBackendError.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Backend/NLPBackend.ts#L159)

Since v0.0.0

# utilities

## getSupportedCapabilities

List supported capability keys in schema order.

**Example**

```ts
import { Effect } from "effect"
import { getSupportedCapabilities } from "@beep/nlp/Backend/NLPBackend"
import type { NLPBackendShape } from "@beep/nlp/Backend/NLPBackend"

const backend: NLPBackendShape = {
  name: "minimal",
  capabilities: {
    constituencyParsing: false,
    coreferenceResolution: false,
    dependencyParsing: false,
    lemmatization: false,
    ner: false,
    posTagging: false,
    relationExtraction: false,
    sentencization: true,
    tokenization: true
  },
  tokenize: (text) => Effect.succeed(text.split(" ")),
  sentencize: (text) => Effect.succeed([text]),
  posTag: () => Effect.succeed([]),
  lemmatize: () => Effect.succeed([]),
  extractEntities: () => Effect.succeed([]),
  parseDependencies: () => Effect.succeed([]),
  extractRelations: () => Effect.succeed([])
}
console.log(getSupportedCapabilities(backend)) // ["tokenization"]
```

**Signature**

```ts
declare const getSupportedCapabilities: (backend: NLPBackendShape) => ReadonlyArray<keyof BackendCapabilities>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Backend/NLPBackend.ts#L382)

Since v0.0.0

## supportsCapability

Check whether a backend advertises support for a single capability.

**Example**

```ts
import { Effect } from "effect"
import { supportsCapability } from "@beep/nlp/Backend/NLPBackend"
import type { NLPBackendShape } from "@beep/nlp/Backend/NLPBackend"

const backend: NLPBackendShape = {
  name: "minimal",
  capabilities: {
    constituencyParsing: false,
    coreferenceResolution: false,
    dependencyParsing: false,
    lemmatization: false,
    ner: false,
    posTagging: false,
    relationExtraction: false,
    sentencization: true,
    tokenization: true
  },
  tokenize: (text) => Effect.succeed(text.split(" ")),
  sentencize: (text) => Effect.succeed([text]),
  posTag: () => Effect.succeed([]),
  lemmatize: () => Effect.succeed([]),
  extractEntities: () => Effect.succeed([]),
  parseDependencies: () => Effect.succeed([]),
  extractRelations: () => Effect.succeed([])
}
console.log(supportsCapability(backend, "tokenization")) // true
```

**Signature**

```ts
declare const supportsCapability: (backend: NLPBackendShape, capability: keyof BackendCapabilities) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Backend/NLPBackend.ts#L343)

Since v0.0.0