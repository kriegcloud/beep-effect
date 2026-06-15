---
title: NLPService.ts
nav_order: 36
parent: "@beep/nlp"
---

## NLPService.ts overview

NLPService - high-level facade over a pluggable `Backend.NLPBackend`.

The main entry point for NLP in the categorical text-processing framework:
abstracts the backend behind a clean API (`NLPServiceShape.processText`
builds an annotated text graph; the other methods surface entities, relations,
and POS tags). The service depends on an `Backend.NLPBackend` provided via
a layer (e.g. `WinkBackendLive`).

Effect v4 `@beep/nlp` implementation notes:
`Context.GenericTag` becomes the `Context.Service` class form; `getBackend`
becomes a bare `Effect` (no zero-arg thunk).

Since v0.0.0

---
## Exports Grouped by Category
- [accessors](#accessors)
  - [extractEntities](#extractentities)
  - [extractRelations](#extractrelations)
  - [processText](#processtext)
  - [tagPartsOfSpeech](#tagpartsofspeech)
- [constructors](#constructors)
  - [make](#make)
- [layers](#layers)
  - [layer](#layer)
- [models](#models)
  - [NLPServiceShape (interface)](#nlpserviceshape-interface)
- [services](#services)
  - [NLPService (class)](#nlpservice-class)
---

# accessors

## extractEntities

Extract entity nodes using `NLPService` from context.

**Example**

```ts
import { Effect } from "effect"
import { empty } from "@beep/nlp/Graph/AnnotatedTextGraph"
import { NLPService, extractEntities } from "@beep/nlp/NLPService"
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
    sentencization: false,
    tokenization: false
  },
  tokenize: () => Effect.succeed([]),
  sentencize: () => Effect.succeed([]),
  posTag: () => Effect.succeed([]),
  lemmatize: () => Effect.succeed([]),
  extractEntities: () => Effect.succeed([]),
  parseDependencies: () => Effect.succeed([]),
  extractRelations: () => Effect.succeed([])
}
const service = NLPService.of({
  getBackend: Effect.succeed(backend),
  processText: () => Effect.succeed(empty()),
  extractEntities: () => Effect.succeed([]),
  extractRelations: () => Effect.succeed([]),
  tagPartsOfSpeech: () => Effect.succeed([])
})
const program = Effect.provideService(extractEntities("Acme hired Ada."), NLPService, service)
Effect.runPromise(program).then((entities) => console.log(entities.length)) // 0
```

**Signature**

```ts
declare const extractEntities: (text: string) => Effect.Effect<ReadonlyArray<EntityNode>, NLPBackendError, NLPService>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/NLPService.ts#L278)

Since v0.0.0

## extractRelations

Extract relation nodes using `NLPService` from context.

**Example**

```ts
import { Effect } from "effect"
import { empty } from "@beep/nlp/Graph/AnnotatedTextGraph"
import { NLPService, extractRelations } from "@beep/nlp/NLPService"
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
    sentencization: false,
    tokenization: false
  },
  tokenize: () => Effect.succeed([]),
  sentencize: () => Effect.succeed([]),
  posTag: () => Effect.succeed([]),
  lemmatize: () => Effect.succeed([]),
  extractEntities: () => Effect.succeed([]),
  parseDependencies: () => Effect.succeed([]),
  extractRelations: () => Effect.succeed([])
}
const service = NLPService.of({
  getBackend: Effect.succeed(backend),
  processText: () => Effect.succeed(empty()),
  extractEntities: () => Effect.succeed([]),
  extractRelations: () => Effect.succeed([]),
  tagPartsOfSpeech: () => Effect.succeed([])
})
const program = Effect.provideService(extractRelations("Ada founded Acme."), NLPService, service)
Effect.runPromise(program).then((relations) => console.log(relations.length)) // 0
```

**Signature**

```ts
declare const extractRelations: (text: string) => Effect.Effect<ReadonlyArray<RelationNode>, NLPBackendError, NLPService>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/NLPService.ts#L329)

Since v0.0.0

## processText

Process text into an annotated graph using `NLPService` from context.

**Example**

```ts
import { Effect } from "effect"
import { empty, nodeCount } from "@beep/nlp/Graph/AnnotatedTextGraph"
import { NLPService, processText } from "@beep/nlp/NLPService"
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
    sentencization: false,
    tokenization: false
  },
  tokenize: () => Effect.succeed([]),
  sentencize: () => Effect.succeed([]),
  posTag: () => Effect.succeed([]),
  lemmatize: () => Effect.succeed([]),
  extractEntities: () => Effect.succeed([]),
  parseDependencies: () => Effect.succeed([]),
  extractRelations: () => Effect.succeed([])
}
const service = NLPService.of({
  getBackend: Effect.succeed(backend),
  processText: () => Effect.succeed(empty()),
  extractEntities: () => Effect.succeed([]),
  extractRelations: () => Effect.succeed([]),
  tagPartsOfSpeech: () => Effect.succeed([])
})
const program = Effect.map(
  Effect.provideService(processText("Effect models typed failure."), NLPService, service),
  nodeCount
)
Effect.runPromise(program).then(console.log) // 0
```

**Signature**

```ts
declare const processText: (text: string) => Effect.Effect<AnnotatedTextGraph, NLPBackendError, NLPService>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/NLPService.ts#L227)

Since v0.0.0

## tagPartsOfSpeech

Tag parts of speech using `NLPService` from context.

**Example**

```ts
import { Effect } from "effect"
import { empty } from "@beep/nlp/Graph/AnnotatedTextGraph"
import { NLPService, tagPartsOfSpeech } from "@beep/nlp/NLPService"
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
    sentencization: false,
    tokenization: false
  },
  tokenize: () => Effect.succeed([]),
  sentencize: () => Effect.succeed([]),
  posTag: () => Effect.succeed([]),
  lemmatize: () => Effect.succeed([]),
  extractEntities: () => Effect.succeed([]),
  parseDependencies: () => Effect.succeed([]),
  extractRelations: () => Effect.succeed([])
}
const service = NLPService.of({
  getBackend: Effect.succeed(backend),
  processText: () => Effect.succeed(empty()),
  extractEntities: () => Effect.succeed([]),
  extractRelations: () => Effect.succeed([]),
  tagPartsOfSpeech: () => Effect.succeed([])
})
const program = Effect.provideService(tagPartsOfSpeech("Effect composes."), NLPService, service)
Effect.runPromise(program).then((tags) => console.log(tags.length)) // 0
```

**Signature**

```ts
declare const tagPartsOfSpeech: (text: string) => Effect.Effect<ReadonlyArray<POSNode>, NLPBackendError, NLPService>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/NLPService.ts#L382)

Since v0.0.0

# constructors

## make

Build an `NLPServiceShape` facade around a concrete backend.

**Example**

```ts
import { Effect } from "effect"
import { make } from "@beep/nlp/NLPService"
import type { NLPBackendShape } from "@beep/nlp/Backend/NLPBackend"

const backend: NLPBackendShape = {
  name: "minimal",
  capabilities: {
    constituencyParsing: false,
    coreferenceResolution: false,
    dependencyParsing: false,
    lemmatization: false,
    ner: false,
    posTagging: true,
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
Effect.runPromise(make(backend).getBackend).then((providedBackend) => console.log(providedBackend.name)) // "minimal"
```

**Signature**

```ts
declare const make: (backend: NLPBackendShape) => NLPServiceShape
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/NLPService.ts#L119)

Since v0.0.0

# layers

## layer

Lift a backend layer into the high-level `NLPService` layer.

**Example**

```ts
import { Effect, Layer } from "effect"
import { NLPService, layer } from "@beep/nlp/NLPService"
import { NLPBackend, notSupported } from "@beep/nlp/Backend/NLPBackend"

const backendLayer = Layer.succeed(NLPBackend, NLPBackend.of({
  name: "empty",
  capabilities: {
    constituencyParsing: false,
    coreferenceResolution: false,
    dependencyParsing: false,
    lemmatization: false,
    ner: false,
    posTagging: false,
    relationExtraction: false,
    sentencization: false,
    tokenization: false
  },
  tokenize: () => Effect.fail(notSupported("empty", "tokenize")),
  sentencize: () => Effect.fail(notSupported("empty", "sentencize")),
  posTag: () => Effect.fail(notSupported("empty", "posTag")),
  lemmatize: () => Effect.fail(notSupported("empty", "lemmatize")),
  extractEntities: () => Effect.fail(notSupported("empty", "extractEntities")),
  parseDependencies: () => Effect.fail(notSupported("empty", "parseDependencies")),
  extractRelations: () => Effect.fail(notSupported("empty", "extractRelations"))
}))
const program = Effect.flatMap(NLPService, (service) => service.getBackend)
Effect.runPromise(Effect.provide(program, layer(backendLayer))).then((backend) => console.log(backend.name)) // "empty"
```

**Signature**

```ts
declare const layer: <E, R>(backendLayer: Layer.Layer<Backend.NLPBackend, E, R>) => Layer.Layer<NLPService, E, R>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/NLPService.ts#L173)

Since v0.0.0

# models

## NLPServiceShape (interface)

High-level service facade over an `Backend.NLPBackend` implementation.

**Example**

```ts
import { Effect } from "effect"
import type { NLPServiceShape } from "@beep/nlp/NLPService"

const service: Pick<NLPServiceShape, "extractEntities"> = {
  extractEntities: () => Effect.succeed([])
}
Effect.runPromise(service.extractEntities("Effect")).then((entities) => console.log(entities.length)) // 0
```

**Signature**

```ts
export interface NLPServiceShape {
  /** Extract named entities from text. */
  readonly extractEntities: (text: string) => Effect.Effect<ReadonlyArray<EntityNode>, NLPBackendError>;
  /** Extract semantic relations from text. */
  readonly extractRelations: (text: string) => Effect.Effect<ReadonlyArray<RelationNode>, NLPBackendError>;
  /** The underlying backend. */
  readonly getBackend: Effect.Effect<NLPBackendShape>;
  /** Process text into an annotated text graph. */
  readonly processText: (text: string) => Effect.Effect<AnnotatedTextGraph, NLPBackendError>;
  /** Tag parts of speech. */
  readonly tagPartsOfSpeech: (text: string) => Effect.Effect<ReadonlyArray<POSNode>, NLPBackendError>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/NLPService.ts#L50)

Since v0.0.0

# services

## NLPService (class)

Service tag for the `NLPServiceShape` facade.

**Example**

```ts
import { NLPService } from "@beep/nlp/NLPService"

console.log(NLPService.key)
```

**Signature**

```ts
declare class NLPService
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/NLPService.ts#L76)

Since v0.0.0