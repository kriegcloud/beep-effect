import { KeyValueStore } from "@effect/platform"
import * as PlatformError from "@effect/platform/Error"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as Schedule from "effect/Schedule"

/**
 * Helper to create PlatformError.SystemError for KVS operations.
 * Matches the internal pattern from @effect/platform's layerStorage.
 * All KeyValueStore methods must return PlatformError.PlatformError
 * (not a custom error type).
 */
const storageError = (method: string, description: string, cause?: unknown) =>
  new PlatformError.SystemError({
    reason: "Unknown",
    module: "KeyValueStore",
    method,
    description,
    ...(cause !== undefined ? { cause } : {})
  })

const r2RetrySchedule = Schedule.exponential("100 millis").pipe(
  Schedule.compose(Schedule.recurs(3))
)

const tryR2 = <A>(
  method: string,
  description: string,
  run: () => Promise<A>
) =>
  Effect.tryPromise({
    try: run,
    catch: (cause) => storageError(method, description, cause)
  }).pipe(Effect.retry(r2RetrySchedule))

/**
 * R2Bucket binding type.
 *
 * Minimal subset of the actual `R2Bucket` abstract class from
 * `@cloudflare/workers-types` (v4.20260203.0). At implementation time,
 * consider using `import type { R2Bucket } from "@cloudflare/workers-types"`
 * directly instead of this local type.
 *
 * Full reference: https://developers.cloudflare.com/r2/api/workers/workers-api-reference/
 *
 * Key differences from naive types:
 * - `get()` returns `R2ObjectBody | null` (has `.text()`, `.json()`, `.arrayBuffer()`)
 * - `list()` returns a discriminated union: `cursor` only exists when `truncated: true`
 * - `put()` accepts `ReadableStream | ArrayBuffer | ArrayBufferView | string | null | Blob`
 */
export type R2Bucket = {
  put(key: string, value: string | ArrayBuffer | ArrayBufferView | ReadableStream | null | Blob,
    options?: Record<string, unknown>): Promise<unknown>
  get(key: string, options?: Record<string, unknown>): Promise<{
    text(): Promise<string>
    json<T>(): Promise<T>
    arrayBuffer(): Promise<ArrayBuffer>
  } | null>
  head(key: string): Promise<{ key: string; size: number; etag: string } | null>
  delete(keys: string | string[]): Promise<void>
  list(options?: {
    prefix?: string
    limit?: number
    cursor?: string
    delimiter?: string
  }): Promise<R2ListResult>
}

// Discriminated union matching @cloudflare/workers-types R2Objects type.
// `cursor` only exists when `truncated: true`.
type R2ListResult =
  | { objects: Array<{ key: string }>; truncated: true; cursor: string; delimitedPrefixes: string[] }
  | { objects: Array<{ key: string }>; truncated: false; delimitedPrefixes: string[] }

/**
 * KeyValueStore implementation backed by Cloudflare R2.
 *
 * Key mapping: keys are stored as R2 object keys directly.
 * Values are stored as UTF-8 text objects.
 *
 * Uses `KeyValueStore.makeStringOnly()` which auto-derives binary methods
 * (`getUint8Array`, `modifyUint8Array`) from string `get`/`set` via base64
 * encoding. This is required because `EventJournalKeyValueStore` (used by
 * journaled mode) reads via `getUint8Array()` and writes `Uint8Array` to `set()`.
 * `makeStringOnly` handles this transparently:
 *   - `getUint8Array`: tries base64 decode first, falls back to UTF-8 encode
 *   - `set(key, Uint8Array)`: base64 encodes before storing as string
 *
 * Suitable for: ArtifactStore (large tool results), ChatHistoryStore,
 * AuditEventStore. R2 has no size limit per object (up to 5 TB),
 * making it ideal for artifact storage.
 *
 * Limits:
 * - Key max length: 1024 bytes
 * - No per-key rate limit (unlike KV's 1 write/sec/key)
 * - Strongly consistent within a region
 */
export const layerR2 = (bucket: R2Bucket): Layer.Layer<KeyValueStore.KeyValueStore> =>
  Layer.succeed(
    KeyValueStore.KeyValueStore,
    KeyValueStore.makeStringOnly({
      get: (key) =>
        tryR2("get", "R2 get failed", async () => {
          const obj = await bucket.get(key)
          if (!obj) return Option.none()
          return Option.some(await obj.text())
        }),

      set: (key, value) =>
        tryR2("set", "R2 set failed", () => bucket.put(key, value)).pipe(
          Effect.asVoid
        ),

      remove: (key) =>
        tryR2("remove", "R2 remove failed", () => bucket.delete(key)),

      // Uses head() instead of get() to avoid downloading the full object body.
      // R2 head() returns metadata only, which is more efficient for large artifacts.
      has: (key) =>
        tryR2("has", "R2 has failed", async () => {
          const obj = await bucket.head(key)
          return obj !== null
        }),

      isEmpty:
        tryR2("isEmpty", "R2 isEmpty failed", async () => {
          const result = await bucket.list({ limit: 1 })
          return result.objects.length === 0
        }),

      // R2 list() returns a discriminated union: cursor only exists when truncated === true.
      // Use type narrowing via `result.truncated` check before accessing `result.cursor`.
      size:
        tryR2("size", "R2 size failed", async () => {
          let count = 0
          let cursor: string | undefined
          do {
            const opts = cursor !== undefined
              ? { limit: 1000, cursor }
              : { limit: 1000 }
            const result = await bucket.list(opts)
            count += result.objects.length
            cursor = result.truncated ? result.cursor : undefined
          } while (cursor)
          return count
        }),

      clear:
        tryR2("clear", "R2 clear failed", async () => {
          let cursor: string | undefined
          do {
            const opts = cursor !== undefined
              ? { limit: 1000, cursor }
              : { limit: 1000 }
            const result = await bucket.list(opts)
            const keys = result.objects.map((o) => o.key)
            if (keys.length > 0) await bucket.delete(keys)
            cursor = result.truncated ? result.cursor : undefined
          } while (cursor)
        })
    })
  )
