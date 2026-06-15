---
title: Catalog.ts
nav_order: 20
parent: "@beep/nlp"
---

## Catalog.ts overview

GraphOperations/Catalog - a library of standard NLP graph operations.

Ready-to-use `GraphOperation`s that the
`GraphExecutor` can apply to a text graph. The linguistic
operations are backed by the pluggable `Backend.NLPBackend` (so they
require it in their context `R` and fail with `Backend.NLPBackendError`);
the pure string operations are context-free transformations.

Effect v4 `@beep/nlp` implementation notes:
- operations are backed by `Backend.NLPBackend` (the granular linguistic
  contract); the thin facade `NLPService` delegates to the same backend.
- node creation is EFFECTFUL (`EffectGraph.makeNode` reads `Clock`/`Random`), so
  `apply` uses `Effect.forEach`.
- text-utility operations (paragraphize/normalizeWhitespace/
  removePunctuation/removeStopWords/stem/ngrams) are NOT backend operations; they
  live on the existing Core, driver, and tool layers.
- `Object.keys` becomes `Struct.keys`; the cast-based `getOperation(name)` lookup
  is dropped (it required `as any`).

Since v0.0.0

---
## Exports Grouped by Category
- [constants](#constants)
  - [StandardOperations](#standardoperations)
  - [getOperationNames](#getoperationnames)
- [use-cases](#use-cases)
  - [extractEntities](#extractentities)
  - [extractRelations](#extractrelations)
  - [lemmatize](#lemmatize)
  - [parseDependencies](#parsedependencies)
  - [posTag](#postag)
  - [sentencize](#sentencize)
  - [toLowerCase](#tolowercase)
  - [toUpperCase](#touppercase)
  - [tokenize](#tokenize)
  - [trim](#trim)
---

# constants

## StandardOperations

Standard operations keyed by their public catalog names.

**Example**

```ts
import { StandardOperations } from "@beep/nlp/Graph/GraphOperations/Catalog"

console.log(StandardOperations.tokenize.name) // "tokenize"
```

**Signature**

```ts
declare const StandardOperations: { readonly extractEntities: Op.GraphOperation<string, EntityNode, Backend.NLPBackend, Backend.BackendNotSupported | Backend.BackendInitError | Backend.BackendOperationError>; readonly extractRelations: Op.GraphOperation<string, RelationNode, Backend.NLPBackend, Backend.BackendNotSupported | Backend.BackendInitError | Backend.BackendOperationError>; readonly lemmatize: Op.GraphOperation<string, LemmaNode, Backend.NLPBackend, Backend.BackendNotSupported | Backend.BackendInitError | Backend.BackendOperationError>; readonly parseDependencies: Op.GraphOperation<string, DependencyNode, Backend.NLPBackend, Backend.BackendNotSupported | Backend.BackendInitError | Backend.BackendOperationError>; readonly posTag: Op.GraphOperation<string, POSNode, Backend.NLPBackend, Backend.BackendNotSupported | Backend.BackendInitError | Backend.BackendOperationError>; readonly sentencize: Op.GraphOperation<string, string, Backend.NLPBackend, Backend.BackendNotSupported | Backend.BackendInitError | Backend.BackendOperationError>; readonly toLowerCase: Op.GraphOperation<string, string, never, never>; readonly toUpperCase: Op.GraphOperation<string, string, never, never>; readonly tokenize: Op.GraphOperation<string, string, Backend.NLPBackend, Backend.BackendNotSupported | Backend.BackendInitError | Backend.BackendOperationError>; readonly trim: Op.GraphOperation<string, string, never, never>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Catalog.ts#L310)

Since v0.0.0

## getOperationNames

List the stable operation names exposed by `StandardOperations`.

**Example**

```ts
import { getOperationNames } from "@beep/nlp/Graph/GraphOperations/Catalog"

console.log(getOperationNames().includes("tokenize")) // true
```

**Signature**

```ts
declare const getOperationNames: () => ReadonlyArray<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Catalog.ts#L336)

Since v0.0.0

# use-cases

## extractEntities

Backend-backed operation that emits named-entity annotation nodes.

**Example**

```ts
import { extractEntities } from "@beep/nlp/Graph/GraphOperations/Catalog"

console.log(extractEntities.name) // "extractEntities"
```

**Signature**

```ts
declare const extractEntities: Op.GraphOperation<string, EntityNode, Backend.NLPBackend, Backend.BackendNotSupported | Backend.BackendInitError | Backend.BackendOperationError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Catalog.ts#L163)

Since v0.0.0

## extractRelations

Backend-backed operation that emits semantic relation annotations.

**Example**

```ts
import { extractRelations } from "@beep/nlp/Graph/GraphOperations/Catalog"

console.log(extractRelations.name) // "extractRelations"
```

**Signature**

```ts
declare const extractRelations: Op.GraphOperation<string, RelationNode, Backend.NLPBackend, Backend.BackendNotSupported | Backend.BackendInitError | Backend.BackendOperationError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Catalog.ts#L222)

Since v0.0.0

## lemmatize

Backend-backed operation that emits canonical lemma nodes.

**Example**

```ts
import { lemmatize } from "@beep/nlp/Graph/GraphOperations/Catalog"

console.log(lemmatize.name) // "lemmatize"
```

**Signature**

```ts
declare const lemmatize: Op.GraphOperation<string, LemmaNode, Backend.NLPBackend, Backend.BackendNotSupported | Backend.BackendInitError | Backend.BackendOperationError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Catalog.ts#L136)

Since v0.0.0

## parseDependencies

Backend-backed operation that emits syntactic dependency arcs for a sentence.

**Example**

```ts
import { parseDependencies } from "@beep/nlp/Graph/GraphOperations/Catalog"

console.log(parseDependencies.name) // "parseDependencies"
```

**Signature**

```ts
declare const parseDependencies: Op.GraphOperation<string, DependencyNode, Backend.NLPBackend, Backend.BackendNotSupported | Backend.BackendInitError | Backend.BackendOperationError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Catalog.ts#L192)

Since v0.0.0

## posTag

Backend-backed operation that emits part-of-speech annotation nodes.

**Example**

```ts
import { posTag } from "@beep/nlp/Graph/GraphOperations/Catalog"

console.log(posTag.name) // "posTag"
```

**Signature**

```ts
declare const posTag: Op.GraphOperation<string, POSNode, Backend.NLPBackend, Backend.BackendNotSupported | Backend.BackendInitError | Backend.BackendOperationError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Catalog.ts#L108)

Since v0.0.0

## sentencize

Backend-backed operation that splits document text into sentence children.

**Example**

```ts
import { sentencize } from "@beep/nlp/Graph/GraphOperations/Catalog"

console.log(sentencize.category) // "expansion"
```

**Signature**

```ts
declare const sentencize: Op.GraphOperation<string, string, Backend.NLPBackend, Backend.BackendNotSupported | Backend.BackendInitError | Backend.BackendOperationError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Catalog.ts#L51)

Since v0.0.0

## toLowerCase

Pure transformation that lowercases each source leaf.

**Example**

```ts
import { toLowerCase } from "@beep/nlp/Graph/GraphOperations/Catalog"

console.log(toLowerCase.category) // "transformation"
```

**Signature**

```ts
declare const toLowerCase: Op.GraphOperation<string, string, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Catalog.ts#L249)

Since v0.0.0

## toUpperCase

Pure transformation that uppercases each source leaf.

**Example**

```ts
import { toUpperCase } from "@beep/nlp/Graph/GraphOperations/Catalog"

console.log(toUpperCase.category) // "transformation"
```

**Signature**

```ts
declare const toUpperCase: Op.GraphOperation<string, string, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Catalog.ts#L268)

Since v0.0.0

## tokenize

Backend-backed operation that splits text into token children.

**Example**

```ts
import { tokenize } from "@beep/nlp/Graph/GraphOperations/Catalog"

console.log(tokenize.category) // "expansion"
```

**Signature**

```ts
declare const tokenize: Op.GraphOperation<string, string, Backend.NLPBackend, Backend.BackendNotSupported | Backend.BackendInitError | Backend.BackendOperationError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Catalog.ts#L79)

Since v0.0.0

## trim

Pure transformation that trims leading and trailing whitespace.

**Example**

```ts
import { trim } from "@beep/nlp/Graph/GraphOperations/Catalog"

console.log(trim.category) // "transformation"
```

**Signature**

```ts
declare const trim: Op.GraphOperation<string, string, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Catalog.ts#L287)

Since v0.0.0