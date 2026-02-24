import type * as Duration from "effect/Duration";
import type * as Effect from "effect/Effect";
import type * as O from "effect/Option";
import type * as Scope from "effect/Scope";
import type * as Types from "effect/Types";
import * as internal from "./_internal/manual-cache";

/**
 * A `ManualCache` is a key-value store with a specified capacity and time to live for entries,
 * requiring manual population via `set`.
 *
 * When the cache is at capacity, the least recently accessed entries will be removed.
 * Entries older than the specified time to live will be automatically removed when accessed or
 * periodically via a background process.
 *
 * The cache is safe for concurrent access.
 *
 * @since 0.1.0
 * @category models
 */
export interface ManualCache<in out Key, in out Value> extends ManualCache.Variance<Key, Value> {
  /**
   * Retrieves the value associated with the specified key if it exists and is not expired.
   * Otherwise returns O.none. Updates LRU status on hit.
   */
  readonly get: (key: Key) => Effect.Effect<O.Option<Value>>;

  /**
   * Associates the specified value with the specified key in the cache. Resets TTL.
   * Updates LRU status. May evict LRU entry if capacity is exceeded.
   */
  readonly set: (key: Key, value: Value) => Effect.Effect<void>;

  /**
   * Returns whether a non-expired value associated with the specified key exists in the cache.
   */
  readonly contains: (key: Key) => Effect.Effect<boolean>;

  /**
   * Invalidates the value associated with the specified key, removing it from the cache.
   */
  readonly invalidate: (key: Key) => Effect.Effect<void>;

  /**
   * Invalidates all values in the cache. Resets state including LRU list.
   */
  readonly invalidateAll: Effect.Effect<void>;

  /**
   * Returns the number of non-expired entries in the cache.
   */
  readonly size: Effect.Effect<number>;

  /**
   * Returns an array of non-expired keys currently in the cache. Order is not guaranteed.
   */
  readonly keys: Effect.Effect<Array<Key>>;

  /**
   * Returns an array of non-expired values currently in the cache. Order is not guaranteed.
   */
  readonly values: Effect.Effect<Array<Value>>;

  /**
   * Returns an array of non-expired [key, value] entries currently in the cache. Order is not guaranteed.
   */
  readonly entries: Effect.Effect<Array<[Key, Value]>>;

  /**
   * Manually triggers the removal of expired entries. The cache also does this periodically.
   */
  readonly evictExpired: () => Effect.Effect<void>;

  /**
   * Returns cache statistics (hits, misses, approximate total size).
   */
  readonly cacheStats: Effect.Effect<ManualCacheStats>;
}

/**
 * @since 0.1.0
 */
export declare namespace ManualCache {
  /**
   * Variance annotation for ManualCache.
   * @since 0.1.0
   * @category models
   */
  export interface Variance<in out Key, in out Value> {
    readonly [internal.ManualCacheTypeId]: {
      readonly _Key: Types.Invariant<Key>;
      readonly _Value: Types.Invariant<Value>;
    };
  }
}

/**
 * Statistics for a ManualCache instance.
 * @since 0.1.0
 * @category models
 */
export interface ManualCacheStats {
  readonly hits: number;
  readonly misses: number;
  readonly currentSize: number;
}

/**
 * Statistics for a specific entry within the ManualCache.
 * @since 0.1.0
 * @category models
 */
export interface EntryStats {
  readonly loadedMillis: number;
}

/**
 * Creates a new Manual Cache with the specified capacity and time to live.
 * Automatically starts a background fiber to periodically evict expired entries.
 *
 * The returned cache requires a `Scope` to manage the background eviction fiber.
 *
 * @param options Configuration options for the cache.
 * @param options.capacity The maximum number of entries the cache can hold. Must be >= 0.
 * @param options.timeToLive The duration for which entries are valid after being set.
 * @since 0.1.0
 * @category constructors
 */
export const make = <Key, Value = never>(options: {
  readonly capacity: number;
  readonly timeToLive: Duration.DurationInput;
}): Effect.Effect<ManualCache<Key, Value>, never, Scope.Scope> => internal.make(options);
