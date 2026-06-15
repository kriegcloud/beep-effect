---
title: ResultStore.ts
nav_order: 25
parent: "@beep/nlp"
---

## ResultStore.ts overview

GraphOperations/ResultStore - caching of operation results.

Caches `OperationResult`s keyed by operation name + node id so
expensive operations are not recomputed. The default implementation is an
in-memory `Ref<HashMap>`.

Effect v4 `@beep/nlp` implementation notes:
- `Context.GenericTag` becomes the `Context.Service` class form.
- keyed cache storage becomes `Ref<HashMap<...>>`; cache operations use `HashMap`.
- `Date.now()` becomes `Clock.currentTimeMillis`.
- the heterogeneous store value is `unknown`-typed and SOUND: results are stored
  as `AnyOperationResult` (`OperationResult<unknown, unknown>`) and read back
  as such (callers decode at their known types), so there are no type assertions.
  The in-memory implementation is total, so `StorageError` appears only on the
  interface for future fallible backends.

Since v0.0.0

---
## Exports Grouped by Category
- [layers](#layers)
  - [ResultStoreLive](#resultstorelive)
  - [ResultStoreTest](#resultstoretest)
- [models](#models)
  - [AnyOperationResult (type alias)](#anyoperationresult-type-alias)
  - [CacheStats (class)](#cachestats-class)
  - [ResultKey (class)](#resultkey-class)
  - [ResultStoreShape (interface)](#resultstoreshape-interface)
  - [StoredResult (interface)](#storedresult-interface)
- [services](#services)
  - [ResultStore (class)](#resultstore-class)
---

# layers

## ResultStoreLive

Live in-memory `ResultStore` layer.

**Example**

```ts
import { ResultStoreLive } from "@beep/nlp/Graph/GraphOperations/ResultStore"

console.log(ResultStoreLive)
```

**Signature**

```ts
declare const ResultStoreLive: Layer.Layer<ResultStore, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/ResultStore.ts#L299)

Since v0.0.0

## ResultStoreTest

Test `ResultStore` layer backed by the same empty in-memory store.

**Example**

```ts
import { ResultStoreTest } from "@beep/nlp/Graph/GraphOperations/ResultStore"

console.log(ResultStoreTest)
```

**Signature**

```ts
declare const ResultStoreTest: Layer.Layer<ResultStore, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/ResultStore.ts#L314)

Since v0.0.0

# models

## AnyOperationResult (type alias)

Type-erased operation result stored in the cache.

**Example**

```ts
import type { AnyOperationResult } from "@beep/nlp/Graph/GraphOperations/ResultStore"

const countErrors = (result: AnyOperationResult) => result.errors.length
console.log(countErrors)
```

**Signature**

```ts
type AnyOperationResult = OperationResult<unknown, unknown>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/ResultStore.ts#L54)

Since v0.0.0

## CacheStats (class)

Snapshot of the in-memory result-store cache.

**Example**

```ts
import { CacheStats } from "@beep/nlp/Graph/GraphOperations/ResultStore"
import * as O from "effect/Option"

const emptyStats = CacheStats.make({
  size: 0,
  totalHits: 0,
  oldestEntry: O.none(),
  newestEntry: O.none()
})

console.log(emptyStats.size) // 0
```

**Signature**

```ts
declare class CacheStats
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/ResultStore.ts#L141)

Since v0.0.0

## ResultKey (class)

Cache key pairing the operation name with the source node id.

**Example**

```ts
import { NodeId } from "@beep/nlp/Graph/EffectGraph"
import { ResultKey } from "@beep/nlp/Graph/GraphOperations/ResultStore"

const nodeId = NodeId.make("node-example")
const key = ResultKey.new("tokenize", nodeId)

console.log(ResultKey.toString(key)) // "tokenize:node-example"
```

**Signature**

```ts
declare class ResultKey
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/ResultStore.ts#L82)

Since v0.0.0

## ResultStoreShape (interface)

Structural service contract for caching graph-operation results.

**Example**

```ts
import type { ResultStoreShape } from "@beep/nlp/Graph/GraphOperations/ResultStore"

const hasCacheEntry = (store: ResultStoreShape, key: Parameters<ResultStoreShape["has"]>[0]) =>
  store.has(key)

console.log(hasCacheEntry)
```

**Signature**

```ts
export interface ResultStoreShape {
  readonly clear: Effect.Effect<void, StorageError>;
  readonly delete: (key: ResultKey) => Effect.Effect<void, StorageError>;
  /** Drop entries older than `olderThanMs`, returning the count removed. */
  readonly gc: (olderThanMs: number) => Effect.Effect<number, StorageError>;
  readonly get: (key: ResultKey) => Effect.Effect<O.Option<AnyOperationResult>, StorageError>;
  readonly has: (key: ResultKey) => Effect.Effect<boolean>;
  readonly stats: Effect.Effect<CacheStats>;
  readonly store: {
    (key: ResultKey, result: AnyOperationResult): Effect.Effect<void, StorageError>;
    (result: AnyOperationResult): (key: ResultKey) => Effect.Effect<void, StorageError>;
  };
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/ResultStore.ts#L178)

Since v0.0.0

## StoredResult (interface)

Stored cache entry plus hit-count and insertion timestamp metadata.

**Example**

```ts
import type { StoredResult } from "@beep/nlp/Graph/GraphOperations/ResultStore"

const hits = (entry: StoredResult) => entry.hits
console.log(hits)
```

**Signature**

```ts
export interface StoredResult {
  readonly hits: number;
  readonly key: ResultKey;
  readonly result: AnyOperationResult;
  readonly timestamp: number;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/ResultStore.ts#L113)

Since v0.0.0

# services

## ResultStore (class)

Service tag for retrieving the result cache from an Effect environment.

**Example**

```ts
import { ResultStore } from "@beep/nlp/Graph/GraphOperations/ResultStore"

console.log(ResultStore.key)
```

**Signature**

```ts
declare class ResultStore
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/ResultStore.ts#L205)

Since v0.0.0