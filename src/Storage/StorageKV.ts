import { KeyValueStore } from "@effect/platform"
import * as PlatformError from "@effect/platform/Error"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"

// Same storageError helper as StorageR2 (could be shared in a common file)
const storageError = (method: string, description: string, cause?: unknown) =>
  new PlatformError.SystemError({
    reason: "Unknown",
    module: "KeyValueStore",
    method,
    description,
    ...(cause !== undefined ? { cause } : {})
  })

/**
 * KVNamespace binding type.
 *
 * Minimal subset of the actual `KVNamespace` interface from
 * `@cloudflare/workers-types` (v4.20260203.0). At implementation time,
 * consider using `import type { KVNamespace } from "@cloudflare/workers-types"`
 * directly instead of this local type.
 *
 * Full reference: https://developers.cloudflare.com/kv/api/
 *
 * Key differences from naive types:
 * - `KVNamespace<Key extends string = string>` is generic
 * - `get()` has many overloads for "text", "json", "arrayBuffer", "stream"
 * - `list()` returns a discriminated union: `cursor` only exists when `list_complete: false`
 * - `put()` accepts `string | ArrayBuffer | ArrayBufferView | ReadableStream`
 */
export type KVNamespace = {
  get(key: string, type?: "text"): Promise<string | null>
  put(key: string, value: string | ArrayBuffer | ArrayBufferView | ReadableStream, options?: {
    expiration?: number
    expirationTtl?: number
    metadata?: unknown | null
  }): Promise<void>
  delete(key: string): Promise<void>
  list(options?: {
    prefix?: string | null
    limit?: number
    cursor?: string | null
  }): Promise<KVListResult>
}

// Discriminated union matching @cloudflare/workers-types KVNamespaceListResult.
// `cursor` only exists when `list_complete: false`.
type KVListResult =
  | { keys: Array<{ name: string; expiration?: number; metadata?: unknown }>; list_complete: false; cursor: string; cacheStatus: string | null }
  | { keys: Array<{ name: string; expiration?: number; metadata?: unknown }>; list_complete: true; cacheStatus: string | null }

/**
 * KeyValueStore implementation backed by Cloudflare KV.
 *
 * Uses `KeyValueStore.makeStringOnly()` (same rationale as R2 -- see above).
 * Binary methods are auto-derived via base64 encoding/decoding.
 *
 * Suitable for: SessionIndexStore (small metadata), ChatHistoryStore
 * (when individual events are < 25 MiB), AuditEventStore.
 *
 * Characteristics:
 * - Eventually consistent reads (up to 60s propagation)
 * - 1 write per second per key limit
 * - Max value size: 25 MiB
 * - Max key length: 512 bytes
 * - Global distribution with edge caching
 *
 * NOT suitable for: Large artifacts, high-write-rate stores,
 * or stores requiring strong consistency.
 * NOT compatible with journaled mode (blocked at config validation).
 */
export const layerKV = (namespace: KVNamespace): Layer.Layer<KeyValueStore.KeyValueStore> =>
  Layer.succeed(
    KeyValueStore.KeyValueStore,
    KeyValueStore.makeStringOnly({
      get: (key) =>
        Effect.tryPromise({
          try: async () => {
            const value = await namespace.get(key, "text")
            return value === null ? Option.none() : Option.some(value)
          },
          catch: (cause) => storageError("get", "KV get failed", cause)
        }),

      set: (key, value) =>
        Effect.tryPromise({
          try: () => namespace.put(key, value),
          catch: (cause) => storageError("set", "KV set failed", cause)
        }),

      remove: (key) =>
        Effect.tryPromise({
          try: () => namespace.delete(key),
          catch: (cause) => storageError("remove", "KV remove failed", cause)
        }),

      has: (key) =>
        Effect.tryPromise({
          try: async () => {
            const value = await namespace.get(key, "text")
            return value !== null
          },
          catch: (cause) => storageError("has", "KV has failed", cause)
        }),

      isEmpty:
        Effect.tryPromise({
          try: async () => {
            const result = await namespace.list({ limit: 1 })
            return result.keys.length === 0
          },
          catch: (cause) => storageError("isEmpty", "KV isEmpty failed", cause)
        }),

      // KV list() returns a discriminated union: cursor only exists when list_complete === false.
      // Use type narrowing via `!result.list_complete` check before accessing `result.cursor`.
      size:
        Effect.tryPromise({
          try: async () => {
            let count = 0
            let cursor: string | undefined
            do {
              const opts = cursor !== undefined
                ? { limit: 1000, cursor }
                : { limit: 1000 }
              const result = await namespace.list(opts)
              count += result.keys.length
              cursor = !result.list_complete ? result.cursor : undefined
            } while (cursor)
            return count
          },
          catch: (cause) => storageError("size", "KV size failed", cause)
        }),

      // Deletes sequentially within each batch to avoid hitting KV rate limits.
      // KV does not support batch delete, so each key is deleted individually.
      clear:
        Effect.tryPromise({
          try: async () => {
            let cursor: string | undefined
            do {
              const opts = cursor !== undefined
                ? { limit: 1000, cursor }
                : { limit: 1000 }
              const result = await namespace.list(opts)
              for (const k of result.keys) {
                await namespace.delete(k.name)
              }
              cursor = !result.list_complete ? result.cursor : undefined
            } while (cursor)
          },
          catch: (cause) => storageError("clear", "KV clear failed", cause)
        })
    })
  )
