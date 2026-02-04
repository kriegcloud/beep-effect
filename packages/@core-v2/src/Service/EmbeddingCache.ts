/**
 * Service: Embedding Cache
 *
 * Content-addressable cache for embedding vectors with TTL and LRU eviction.
 *
 * @since 2.0.0
 * @module Service/EmbeddingCache
 */

import { Clock, Context, Duration, Effect, HashMap, Layer, Option, Ref } from "effect"
import type { ConfigService } from "./Config.js"
import { StorageService } from "./Storage.js"

/**
 * Embedding vector type
 *
 * @since 2.0.0
 * @category Model
 */
export type Embedding = ReadonlyArray<number>

/**
 * Cache entry with embedding and access timestamp for LRU eviction
 *
 * @since 2.0.0
 * @category Model
 */
interface CacheEntry {
  readonly embedding: Embedding
  readonly createdAt: number
  readonly lastAccessedAt: number
}

/**
 * Cache configuration
 *
 * @since 2.0.0
 * @category Config
 */
export interface EmbeddingCacheConfig {
  readonly ttlMs: number
  readonly maxEntries: number
}

/**
 * Default cache configuration
 *
 * @since 2.0.0
 * @category Config
 */
export const defaultCacheConfig: EmbeddingCacheConfig = {
  ttlMs: Duration.toMillis(Duration.hours(1)),
  maxEntries: 10000
}

/**
 * EmbeddingCache service interface
 *
 * @since 2.0.0
 * @category Service
 */
export interface EmbeddingCacheService {
  readonly get: (hash: string) => Effect.Effect<Option.Option<Embedding>>
  readonly set: (hash: string, embedding: Embedding) => Effect.Effect<void>
  readonly has: (hash: string) => Effect.Effect<boolean>
  readonly size: () => Effect.Effect<number>
  readonly clear: () => Effect.Effect<void>
}

/**
 * EmbeddingCache service tag
 *
 * @since 2.0.0
 * @category Service
 */
export class EmbeddingCache extends Context.Tag("@core-v2/EmbeddingCache")<
  EmbeddingCache,
  EmbeddingCacheService
>() {
  /**
   * In-memory implementation with TTL and LRU eviction
   *
   * @since 2.0.0
   * @category Layers
   */
  static readonly InMemory = (
    config: EmbeddingCacheConfig = defaultCacheConfig
  ): Layer.Layer<EmbeddingCache> =>
    Layer.effect(
      EmbeddingCache,
      Effect.gen(function*() {
        const cache = yield* Ref.make(HashMap.empty<string, CacheEntry>())

        const isExpired = (entry: CacheEntry, now: number): boolean => now - entry.createdAt > config.ttlMs

        const evictLRU = (
          map: HashMap.HashMap<string, CacheEntry>
        ): HashMap.HashMap<string, CacheEntry> => {
          if (HashMap.size(map) < config.maxEntries) return map

          // Find the LRU entry
          let lruKey: string | null = null
          let lruTime = Infinity

          for (const [key, entry] of map) {
            if (entry.lastAccessedAt < lruTime) {
              lruTime = entry.lastAccessedAt
              lruKey = key
            }
          }

          return lruKey ? HashMap.remove(map, lruKey) : map
        }

        return {
          get: (hash: string) =>
            Effect.gen(function*() {
              const now = yield* Clock.currentTimeMillis
              const map = yield* Ref.get(cache)
              const entry = HashMap.get(map, hash)

              if (Option.isNone(entry)) {
                return Option.none()
              }

              // Check TTL expiration
              if (isExpired(entry.value, now)) {
                yield* Ref.update(cache, HashMap.remove(hash))
                return Option.none()
              }

              // Update last accessed time for LRU
              yield* Ref.update(cache, (m) =>
                HashMap.set(m, hash, {
                  ...entry.value,
                  lastAccessedAt: now
                }))

              return Option.some(entry.value.embedding)
            }),

          set: (hash: string, embedding: Embedding) =>
            Effect.gen(function*() {
              const now = yield* Clock.currentTimeMillis
              yield* Ref.update(cache, (map) => {
                // Evict if at capacity
                const evicted = evictLRU(map)
                return HashMap.set(evicted, hash, {
                  embedding,
                  createdAt: now,
                  lastAccessedAt: now
                })
              })
            }),

          has: (hash: string) =>
            Effect.gen(function*() {
              const now = yield* Clock.currentTimeMillis
              const map = yield* Ref.get(cache)
              const entry = HashMap.get(map, hash)

              if (Option.isNone(entry)) return false

              // Expired entries don't count as "has"
              if (isExpired(entry.value, now)) {
                yield* Ref.update(cache, HashMap.remove(hash))
                return false
              }

              return true
            }),

          size: () => Ref.get(cache).pipe(Effect.map(HashMap.size)),

          clear: () => Ref.set(cache, HashMap.empty())
        }
      })
    )

  /**
   * Default in-memory implementation with standard config
   *
   * @since 2.0.0
   * @category Layers
   */
  static readonly Default: Layer.Layer<EmbeddingCache> = EmbeddingCache.InMemory()
}

/**
 * Test layer that always misses cache
 *
 * @since 2.0.0
 * @category Layers
 */
export const EmbeddingCacheTest: Layer.Layer<EmbeddingCache> = Layer.succeed(EmbeddingCache, {
  get: (_hash: string) => Effect.succeed(Option.none()),
  set: (_hash: string, _embedding: Embedding) => Effect.void,
  has: (_hash: string) => Effect.succeed(false),
  size: () => Effect.succeed(0),
  clear: () => Effect.void
})

// =============================================================================
// Persistent Embedding Cache Types
// =============================================================================

/**
 * Extended cache interface with persistence and warm-up capabilities
 *
 * @since 2.0.0
 * @category Service
 */
export interface PersistentEmbeddingCacheService extends EmbeddingCacheService {
  /**
   * Warm up the cache by loading embeddings from persistent storage
   * @returns Number of embeddings loaded
   */
  readonly warmUp: () => Effect.Effect<number>

  /**
   * Flush all in-memory embeddings to persistent storage
   * @returns Number of embeddings persisted
   */
  readonly flush: () => Effect.Effect<number>

  /**
   * Get cache statistics
   */
  readonly stats: () => Effect.Effect<{
    readonly memorySize: number
    readonly memoryHits: number
    readonly memoryMisses: number
    readonly persistentHits: number
    readonly persistentMisses: number
  }>
}

/**
 * PersistentEmbeddingCache service tag
 *
 * @since 2.0.0
 * @category Service
 */
export class PersistentEmbeddingCache extends Context.Tag("@core-v2/PersistentEmbeddingCache")<
  PersistentEmbeddingCache,
  PersistentEmbeddingCacheService
>() {}

/**
 * Embedding blob format for storage
 *
 * @since 2.0.0
 * @category Model
 */
interface EmbeddingBlob {
  readonly version: 1
  readonly embeddings: Record<string, {
    readonly vector: ReadonlyArray<number>
    readonly createdAt: number
  }>
}

/**
 * Create persistent embedding cache with GCS backing
 *
 * Architecture:
 * - Uses in-memory HashMap for fast lookups
 * - Falls back to GCS on memory miss
 * - Writes to both memory and GCS on set
 * - Batch writes use a single blob per batch to minimize GCS operations
 *
 * @since 2.0.0
 * @category Layers
 */
export const makePersistentEmbeddingCache = (
  storage: StorageService,
  cachePath: string,
  config: EmbeddingCacheConfig = defaultCacheConfig
): Effect.Effect<PersistentEmbeddingCacheService> =>
  Effect.gen(function*() {
    // In-memory cache for fast lookups
    const memoryCache = yield* Ref.make(HashMap.empty<string, CacheEntry>())

    // Statistics tracking
    const stats = yield* Ref.make({
      memoryHits: 0,
      memoryMisses: 0,
      persistentHits: 0,
      persistentMisses: 0
    })

    const isExpired = (entry: CacheEntry, now: number): boolean => now - entry.createdAt > config.ttlMs

    const evictLRU = (
      map: HashMap.HashMap<string, CacheEntry>
    ): HashMap.HashMap<string, CacheEntry> => {
      if (HashMap.size(map) < config.maxEntries) return map

      let lruKey: string | null = null
      let lruTime = Infinity

      for (const [key, entry] of map) {
        if (entry.lastAccessedAt < lruTime) {
          lruTime = entry.lastAccessedAt
          lruKey = key
        }
      }

      return lruKey ? HashMap.remove(map, lruKey) : map
    }

    // Load embedding from GCS
    const loadFromStorage = (hash: string): Effect.Effect<Option.Option<Embedding>> =>
      Effect.gen(function*() {
        const blobPath = `${cachePath}/${hash.slice(0, 2)}/${hash}.json`
        const content = yield* storage.get(blobPath).pipe(
          Effect.catchAll(() => Effect.succeed(Option.none<string>()))
        )

        if (Option.isNone(content)) {
          return Option.none()
        }

        try {
          const blob: EmbeddingBlob = JSON.parse(content.value)
          const entry = blob.embeddings[hash]
          if (!entry) return Option.none()

          const now = Date.now()
          if (now - entry.createdAt > config.ttlMs) {
            // Expired in storage too
            return Option.none()
          }

          return Option.some(entry.vector)
        } catch {
          return Option.none()
        }
      })

    // Save embedding to GCS
    const saveToStorage = (hash: string, embedding: Embedding): Effect.Effect<void> =>
      Effect.gen(function*() {
        const blobPath = `${cachePath}/${hash.slice(0, 2)}/${hash}.json`
        const now = Date.now()

        const blob: EmbeddingBlob = {
          version: 1,
          embeddings: {
            [hash]: {
              vector: embedding,
              createdAt: now
            }
          }
        }

        yield* storage.set(blobPath, JSON.stringify(blob)).pipe(
          Effect.catchAll((error) =>
            Effect.logWarning("Failed to persist embedding to storage", { hash, error: String(error) })
          )
        )
      })

    return {
      get: (hash: string) =>
        Effect.gen(function*() {
          const now = yield* Clock.currentTimeMillis
          const map = yield* Ref.get(memoryCache)
          const entry = HashMap.get(map, hash)

          // Check in-memory cache first
          if (Option.isSome(entry)) {
            if (isExpired(entry.value, now)) {
              yield* Ref.update(memoryCache, HashMap.remove(hash))
            } else {
              // Memory hit - update access time
              yield* Ref.update(memoryCache, (m) => HashMap.set(m, hash, { ...entry.value, lastAccessedAt: now }))
              yield* Ref.update(stats, (s) => ({ ...s, memoryHits: s.memoryHits + 1 }))
              return Option.some(entry.value.embedding)
            }
          }

          // Memory miss - check persistent storage
          yield* Ref.update(stats, (s) => ({ ...s, memoryMisses: s.memoryMisses + 1 }))

          const persisted = yield* loadFromStorage(hash)
          if (Option.isSome(persisted)) {
            // Persistent hit - add to memory cache
            yield* Ref.update(stats, (s) => ({ ...s, persistentHits: s.persistentHits + 1 }))
            yield* Ref.update(memoryCache, (m) => {
              const evicted = evictLRU(m)
              return HashMap.set(evicted, hash, {
                embedding: persisted.value,
                createdAt: now,
                lastAccessedAt: now
              })
            })
            return persisted
          }

          // Complete miss
          yield* Ref.update(stats, (s) => ({ ...s, persistentMisses: s.persistentMisses + 1 }))
          return Option.none()
        }),

      set: (hash: string, embedding: Embedding) =>
        Effect.gen(function*() {
          const now = yield* Clock.currentTimeMillis

          // Store in memory
          yield* Ref.update(memoryCache, (map) => {
            const evicted = evictLRU(map)
            return HashMap.set(evicted, hash, {
              embedding,
              createdAt: now,
              lastAccessedAt: now
            })
          })

          // Persist to storage (fire-and-forget with error logging)
          yield* Effect.forkDaemon(saveToStorage(hash, embedding))
        }),

      has: (hash: string) =>
        Effect.gen(function*() {
          const now = yield* Clock.currentTimeMillis
          const map = yield* Ref.get(memoryCache)
          const entry = HashMap.get(map, hash)

          if (Option.isSome(entry)) {
            if (isExpired(entry.value, now)) {
              yield* Ref.update(memoryCache, HashMap.remove(hash))
              return false
            }
            return true
          }

          // Check persistent storage
          const persisted = yield* loadFromStorage(hash)
          return Option.isSome(persisted)
        }),

      size: () => Ref.get(memoryCache).pipe(Effect.map(HashMap.size)),

      clear: () =>
        Effect.gen(function*() {
          yield* Ref.set(memoryCache, HashMap.empty())
          // Note: Does not clear GCS - that would need storage.clear
        }),

      warmUp: () =>
        Effect.gen(function*() {
          // List all embedding blobs in the cache path
          const files = yield* storage.list(cachePath).pipe(
            Effect.catchAll(() => Effect.succeed([] as Array<string>))
          )

          let loaded = 0
          const now = Date.now()

          // Load each blob (limit concurrency to avoid overwhelming storage)
          yield* Effect.forEach(
            files.filter((f) => f.endsWith(".json")),
            (file) =>
              Effect.gen(function*() {
                const content = yield* storage.get(file).pipe(
                  Effect.catchAll(() => Effect.succeed(Option.none<string>()))
                )

                if (Option.isNone(content)) return

                try {
                  const blob: EmbeddingBlob = JSON.parse(content.value)
                  for (const [hash, entry] of Object.entries(blob.embeddings)) {
                    // Skip expired entries
                    if (now - entry.createdAt > config.ttlMs) continue

                    yield* Ref.update(memoryCache, (map) => {
                      if (HashMap.size(map) >= config.maxEntries) return map
                      return HashMap.set(map, hash, {
                        embedding: entry.vector,
                        createdAt: entry.createdAt,
                        lastAccessedAt: now
                      })
                    })
                    loaded++
                  }
                } catch {
                  // Skip malformed blobs
                }
              }),
            { concurrency: 10 }
          )

          yield* Effect.logInfo("Embedding cache warmed up", { loaded, files: files.length })
          return loaded
        }),

      flush: () =>
        Effect.gen(function*() {
          const map = yield* Ref.get(memoryCache)
          let persisted = 0

          yield* Effect.forEach(
            HashMap.entries(map),
            ([hash, entry]) =>
              Effect.gen(function*() {
                yield* saveToStorage(hash, entry.embedding)
                persisted++
              }),
            { concurrency: 20 }
          )

          yield* Effect.logInfo("Embedding cache flushed", { persisted })
          return persisted
        }),

      stats: () =>
        Effect.gen(function*() {
          const memorySize = yield* Ref.get(memoryCache).pipe(Effect.map(HashMap.size))
          const s = yield* Ref.get(stats)
          return { memorySize, ...s }
        })
    }
  })

/**
 * Layer that provides PersistentEmbeddingCache when EMBEDDING_CACHE_PATH is configured,
 * otherwise provides standard in-memory EmbeddingCache.
 *
 * Dependencies:
 * - ConfigService (for embedding.cachePath, cacheTtlHours, cacheMaxEntries)
 * - StorageService (for GCS persistence when cachePath is set)
 *
 * @since 2.0.0
 * @category Layers
 */
export const EmbeddingCacheWithPersistence: Layer.Layer<
  EmbeddingCache | PersistentEmbeddingCache,
  never,
  ConfigService | StorageService
> = Layer.effect(
  PersistentEmbeddingCache,
  Effect.gen(function*() {
    // Import dynamically to avoid circular dependency
    const { ConfigService: ConfigSvc } = yield* Effect.promise(() => import("./Config.js"))
    const config = yield* ConfigSvc
    const storage = yield* StorageService

    const cachePath = Option.getOrUndefined(config.embedding.cachePath)

    if (!cachePath) {
      // No persistence path configured - return in-memory only
      yield* Effect.logDebug("Embedding cache: in-memory only (no EMBEDDING_CACHE_PATH set)")
      const inMemoryCache = yield* Effect.gen(function*() {
        const cache = yield* Ref.make(HashMap.empty<string, CacheEntry>())
        const cacheConfig: EmbeddingCacheConfig = {
          ttlMs: Duration.toMillis(Duration.hours(config.embedding.cacheTtlHours)),
          maxEntries: config.embedding.cacheMaxEntries
        }

        const isExpired = (entry: CacheEntry, now: number): boolean => now - entry.createdAt > cacheConfig.ttlMs

        const evictLRU = (map: HashMap.HashMap<string, CacheEntry>): HashMap.HashMap<string, CacheEntry> => {
          if (HashMap.size(map) < cacheConfig.maxEntries) return map
          let lruKey: string | null = null
          let lruTime = Infinity
          for (const [key, entry] of map) {
            if (entry.lastAccessedAt < lruTime) {
              lruTime = entry.lastAccessedAt
              lruKey = key
            }
          }
          return lruKey ? HashMap.remove(map, lruKey) : map
        }

        return {
          get: (hash: string) =>
            Effect.gen(function*() {
              const now = yield* Clock.currentTimeMillis
              const map = yield* Ref.get(cache)
              const entry = HashMap.get(map, hash)
              if (Option.isNone(entry)) return Option.none()
              if (isExpired(entry.value, now)) {
                yield* Ref.update(cache, HashMap.remove(hash))
                return Option.none()
              }
              yield* Ref.update(cache, (m) => HashMap.set(m, hash, { ...entry.value, lastAccessedAt: now }))
              return Option.some(entry.value.embedding)
            }),
          set: (hash: string, embedding: Embedding) =>
            Effect.gen(function*() {
              const now = yield* Clock.currentTimeMillis
              yield* Ref.update(cache, (map) => {
                const evicted = evictLRU(map)
                return HashMap.set(evicted, hash, { embedding, createdAt: now, lastAccessedAt: now })
              })
            }),
          has: (hash: string) =>
            Effect.gen(function*() {
              const now = yield* Clock.currentTimeMillis
              const map = yield* Ref.get(cache)
              const entry = HashMap.get(map, hash)
              if (Option.isNone(entry)) return false
              if (isExpired(entry.value, now)) {
                yield* Ref.update(cache, HashMap.remove(hash))
                return false
              }
              return true
            }),
          size: () => Ref.get(cache).pipe(Effect.map(HashMap.size)),
          clear: () => Ref.set(cache, HashMap.empty()),
          warmUp: () => Effect.succeed(0),
          flush: () => Effect.succeed(0),
          stats: () =>
            Effect.gen(function*() {
              const memorySize = yield* Ref.get(cache).pipe(Effect.map(HashMap.size))
              return { memorySize, memoryHits: 0, memoryMisses: 0, persistentHits: 0, persistentMisses: 0 }
            })
        } as PersistentEmbeddingCacheService
      })
      return inMemoryCache
    }

    // Persistence enabled - create persistent cache
    yield* Effect.logInfo("Embedding cache: GCS-backed persistence enabled", { cachePath })
    const cacheConfig: EmbeddingCacheConfig = {
      ttlMs: Duration.toMillis(Duration.hours(config.embedding.cacheTtlHours)),
      maxEntries: config.embedding.cacheMaxEntries
    }

    return yield* makePersistentEmbeddingCache(storage, cachePath, cacheConfig)
  })
).pipe(
  // Also provide the base EmbeddingCache interface by mapping PersistentEmbeddingCache
  Layer.map((ctx) => {
    const persistent = Context.get(ctx, PersistentEmbeddingCache)
    return Context.make(EmbeddingCache, persistent).pipe(
      Context.merge(ctx)
    )
  })
)
