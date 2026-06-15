---
title: Composition.ts
nav_order: 4
parent: "@beep/nlp"
---

## Composition.ts overview

Backend composition - combinators that treat `NLPBackend`s as composable
morphisms.

- `withFallback`: try a primary backend, fall back to a secondary on
  failure (per operation); the composed capabilities are the union.
- `withCaching`: memoize each text-keyed operation behind an `effect/Cache`
  with a capacity bound and TTL.
- `selectByCapability`: pick the first backend supporting a capability.

Effect v4 `@beep/nlp` implementation notes:
`withCaching` is a real per-operation `effect/Cache`. `backends.find(...)`
becomes `effect/Array` `A.findFirst` (returning `Option`).

Since v0.0.0

---
## Exports Grouped by Category
- [combinators](#combinators)
  - [selectByCapability](#selectbycapability)
  - [withCaching](#withcaching)
  - [withFallback](#withfallback)
- [models](#models)
  - [CachingOptions (class)](#cachingoptions-class)
---

# combinators

## selectByCapability

Select the first backend whose capability bitmap enables a requested feature.

**Example**

```ts
import { Effect } from "effect"
import * as O from "effect/Option"
import { selectByCapability } from "@beep/nlp/Backend/Composition"
import type { NLPBackendShape } from "@beep/nlp/Backend/NLPBackend"

const backend: NLPBackendShape = {
  name: "tokenizer",
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
console.log(O.map(selectByCapability("tokenization", [backend]), (selected) => selected.name))
```

**Signature**

```ts
declare const selectByCapability: (capability: keyof BackendCapabilities, backends: ReadonlyArray<NLPBackendShape>) => O.Option<NLPBackendShape>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Backend/Composition.ts#L347)

Since v0.0.0

## withCaching

Wrap a backend with per-operation `effect/Cache` memoization.

**Example**

```ts
import { Effect } from "effect"
import { withCaching } from "@beep/nlp/Backend/Composition"
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
const program = Effect.flatMap(withCaching(backend, { capacity: 16 }), (cached) => cached.tokenize("typed effects"))
Effect.runPromise(program).then(console.log) // ["typed", "effects"]
```

**Signature**

```ts
declare const withCaching: (backend: NLPBackendShape, options?: CachingOptions | undefined) => Effect.Effect<NLPBackendShape, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Backend/Composition.ts#L264)

Since v0.0.0

## withFallback

Compose two backends so each operation falls back to a secondary backend.

**Example**

```ts
import { Effect } from "effect"
import { withFallback } from "@beep/nlp/Backend/Composition"
import { notSupported } from "@beep/nlp/Backend/NLPBackend"
import type { NLPBackendShape } from "@beep/nlp/Backend/NLPBackend"

const capabilities = {
  constituencyParsing: false,
  coreferenceResolution: false,
  dependencyParsing: false,
  lemmatization: false,
  ner: false,
  posTagging: false,
  relationExtraction: false,
  sentencization: false,
  tokenization: true
}
const primary: NLPBackendShape = {
  name: "primary",
  capabilities,
  tokenize: () => Effect.fail(notSupported("primary", "tokenize")),
  sentencize: () => Effect.succeed([]),
  posTag: () => Effect.succeed([]),
  lemmatize: () => Effect.succeed([]),
  extractEntities: () => Effect.succeed([]),
  parseDependencies: () => Effect.succeed([]),
  extractRelations: () => Effect.succeed([])
}
const secondary: NLPBackendShape = { ...primary, name: "secondary", tokenize: (text) => Effect.succeed([text]) }
console.log(withFallback(primary, secondary).name) // "primary+secondary"
```

**Signature**

```ts
declare const withFallback: (primary: NLPBackendShape, secondary: NLPBackendShape) => NLPBackendShape
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Backend/Composition.ts#L123)

Since v0.0.0

# models

## CachingOptions (class)

Cache settings for memoized backend composition.

**Example**

```ts
import { Duration } from "effect"
import type { CachingOptions } from "@beep/nlp/Backend/Composition"

const options: CachingOptions = { capacity: 64, timeToLive: Duration.minutes(5) }
console.log(options.capacity) // 64
```

**Signature**

```ts
declare class CachingOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Backend/Composition.ts#L208)

Since v0.0.0