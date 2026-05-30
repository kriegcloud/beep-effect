/**
 * GraphOperations/ResultStore - caching of operation results.
 *
 * Caches {@link OperationResult}s keyed by operation name + node id so
 * expensive operations are not recomputed. The default implementation is an
 * in-memory `Ref<HashMap>`.
 *
 * Ported from the `adjunct` repo (Effect v3) to Effect v4 / `@beep/nlp`:
 * - `Context.GenericTag` becomes the `Context.Service` class form.
 * - `Ref<Map<...>>` becomes `Ref<HashMap<...>>`; native `Map` ops become `HashMap`.
 * - `Date.now()` becomes `Clock.currentTimeMillis`.
 * - the heterogeneous store value is `unknown`-typed and SOUND: results are stored
 *   as {@link AnyOperationResult} (`OperationResult<unknown, unknown>`) and read back
 *   as such (callers decode at their known types), so there are no type assertions.
 *   The in-memory implementation is total, so {@link StorageError} appears only on the
 *   interface for future fallible backends.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { $NlpId } from "@beep/identity";
import { A } from "@beep/utils";
import { Clock, Context, Effect, HashMap, Layer, Ref } from "effect";
import * as O from "effect/Option";
import type { NodeId } from "../EffectGraph.ts";
import type { StorageError } from "./Errors.ts";
import type { OperationResult } from "./Types.ts";

const $I = $NlpId.create("Graph/GraphOperations/ResultStore");

/**
 * An {@link OperationResult} with its concrete type parameters erased, as stored
 * in the cache. Callers re-decode the payload at their known types.
 *
 * @since 0.0.0
 * @category models
 */
export type AnyOperationResult = OperationResult<unknown, unknown>;

// =============================================================================
// Keys & Stored Values
// =============================================================================

/**
 * Cache key: an operation name paired with a node id.
 *
 * @since 0.0.0
 * @category models
 */
export interface ResultKey {
  readonly nodeId: NodeId;
  readonly operationName: string;
}

/**
 * Constructors for {@link ResultKey}.
 *
 * @example
 * ```ts
 * import { ResultKey } from "@beep/nlp/Graph/GraphOperations/ResultStore"
 * import { makeNodeId } from "@beep/nlp/Graph/EffectGraph"
 *
 * console.log(ResultKey.toString(ResultKey.make("op", makeNodeId("n1"))))
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const ResultKey = {
  make: (operationName: string, nodeId: NodeId): ResultKey => ({ nodeId, operationName }),
  toString: (key: ResultKey): string => `${key.operationName}:${key.nodeId}`,
};

/**
 * A cached result with metadata.
 *
 * @since 0.0.0
 * @category models
 */
export interface StoredResult {
  readonly hits: number;
  readonly key: ResultKey;
  readonly result: AnyOperationResult;
  readonly timestamp: number;
}

/**
 * Cache statistics.
 *
 * @since 0.0.0
 * @category models
 */
export interface CacheStats {
  readonly newestEntry: O.Option<number>;
  readonly oldestEntry: O.Option<number>;
  readonly size: number;
  readonly totalHits: number;
}

// =============================================================================
// Service Shape & Tag
// =============================================================================

/**
 * Structural shape of the {@link ResultStore} service.
 *
 * @since 0.0.0
 * @category models
 */
export interface ResultStoreShape {
  readonly clear: Effect.Effect<void, StorageError>;
  readonly delete: (key: ResultKey) => Effect.Effect<void, StorageError>;
  /** Drop entries older than `olderThanMs`, returning the count removed. */
  readonly gc: (olderThanMs: number) => Effect.Effect<number, StorageError>;
  readonly get: (key: ResultKey) => Effect.Effect<O.Option<AnyOperationResult>, StorageError>;
  readonly has: (key: ResultKey) => Effect.Effect<boolean>;
  readonly stats: Effect.Effect<CacheStats>;
  readonly store: (key: ResultKey, result: AnyOperationResult) => Effect.Effect<void, StorageError>;
}

/**
 * Service tag for the {@link ResultStoreShape} cache.
 *
 * @example
 * ```ts
 * import { ResultStore } from "@beep/nlp/Graph/GraphOperations/ResultStore"
 *
 * console.log(ResultStore.key)
 * ```
 *
 * @since 0.0.0
 * @category services
 */
export class ResultStore extends Context.Service<ResultStore, ResultStoreShape>()($I`ResultStore`) {}

// =============================================================================
// In-Memory Implementation
// =============================================================================

const makeResultStore = Effect.gen(function* () {
  const storeRef = yield* Ref.make<HashMap.HashMap<string, StoredResult>>(HashMap.empty());

  return ResultStore.of({
    clear: Ref.set(storeRef, HashMap.empty()),

    delete: Effect.fn("ResultStore.delete")(function* (key: ResultKey) {
      yield* Ref.update(storeRef, (map) => HashMap.remove(map, ResultKey.toString(key)));
    }),

    gc: Effect.fn("ResultStore.gc")(function* (olderThanMs: number) {
      const cutoff = (yield* Clock.currentTimeMillis) - olderThanMs;
      const map = yield* Ref.get(storeRef);
      const kept = HashMap.filter(map, (value) => value.timestamp >= cutoff);
      yield* Ref.set(storeRef, kept);
      return HashMap.size(map) - HashMap.size(kept);
    }),

    get: Effect.fn("ResultStore.get")(function* (key: ResultKey) {
      const keyStr = ResultKey.toString(key);
      const map = yield* Ref.get(storeRef);
      return yield* O.match(HashMap.get(map, keyStr), {
        onNone: () => Effect.succeed(O.none<AnyOperationResult>()),
        onSome: (stored) =>
          Effect.as(
            Ref.update(storeRef, (m) => HashMap.set(m, keyStr, { ...stored, hits: stored.hits + 1 })),
            O.some(stored.result)
          ),
      });
    }),

    has: Effect.fn("ResultStore.has")(function* (key: ResultKey) {
      const map = yield* Ref.get(storeRef);
      return HashMap.has(map, ResultKey.toString(key));
    }),

    stats: Effect.gen(function* () {
      const map = yield* Ref.get(storeRef);
      const entries = A.fromIterable(HashMap.values(map));
      const timestamps = A.map(entries, (e) => e.timestamp);
      return {
        newestEntry: A.match(timestamps, {
          onEmpty: O.none<number>,
          onNonEmpty: (ts) => O.some(Math.max(...ts)),
        }),
        oldestEntry: A.match(timestamps, {
          onEmpty: O.none<number>,
          onNonEmpty: (ts) => O.some(Math.min(...ts)),
        }),
        size: HashMap.size(map),
        totalHits: A.reduce(entries, 0, (sum, e) => sum + e.hits),
      };
    }),

    store: Effect.fn("ResultStore.store")(function* (key: ResultKey, result: AnyOperationResult) {
      const timestamp = yield* Clock.currentTimeMillis;
      const stored: StoredResult = { hits: 0, key, result, timestamp };
      yield* Ref.update(storeRef, (map) => HashMap.set(map, ResultKey.toString(key), stored));
    }),
  });
});

/**
 * Live in-memory {@link ResultStore} layer.
 *
 * @example
 * ```ts
 * import { ResultStoreLive } from "@beep/nlp/Graph/GraphOperations/ResultStore"
 *
 * console.log(ResultStoreLive)
 * ```
 *
 * @since 0.0.0
 * @category layers
 */
export const ResultStoreLive: Layer.Layer<ResultStore> = Layer.effect(ResultStore, makeResultStore);

/**
 * Test {@link ResultStore} layer (starts empty; same as {@link ResultStoreLive}).
 *
 * @example
 * ```ts
 * import { ResultStoreTest } from "@beep/nlp/Graph/GraphOperations/ResultStore"
 *
 * console.log(ResultStoreTest)
 * ```
 *
 * @since 0.0.0
 * @category layers
 */
export const ResultStoreTest: Layer.Layer<ResultStore> = ResultStoreLive;
