import * as KeyValueStore from "@effect/platform/KeyValueStore"
import { Clock, Effect, Layer, Option, Ref, Schema } from "effect"

import { PrimedCacheError } from "./Errors.js"
import { FormatType, ScoredOutput } from "./FormatType.js"
import { errorMessage } from "./internal/errorMessage.js"
import { fnv1aHash } from "./internal/hash.js"

export class PrimedCacheKey extends Schema.Class<PrimedCacheKey>("PrimedCacheKey")({
  provider: Schema.String,
  modelId: Schema.String,
  promptFingerprint: Schema.String,
  schemaFingerprint: Schema.optionalWith(Schema.String, { exact: true }),
  temperature: Schema.optionalWith(Schema.Number, { exact: true }),
  formatType: Schema.optionalWith(FormatType, { exact: true }),
  promptVersion: Schema.String,
  namespace: Schema.optionalWith(Schema.String, {
    default: () => "langextract"
  })
}) {}

export class PrimedCachePolicy extends Schema.Class<PrimedCachePolicy>("PrimedCachePolicy")({
  enabled: Schema.optionalWith(Schema.Boolean, { default: () => true }),
  ttlSeconds: Schema.optionalWith(Schema.Int, {
    default: () => 60 * 60 * 24
  }),
  namespace: Schema.optionalWith(Schema.String, {
    default: () => "langextract"
  }),
  deterministicOnly: Schema.optionalWith(Schema.Boolean, {
    default: () => true
  }),
  allowStreamingWrites: Schema.optionalWith(Schema.Boolean, {
    default: () => false
  }),
  maxEntries: Schema.optionalWith(Schema.Int, {
    default: () => 10_000
  })
}) {}

export interface CacheAccessOptions {
  readonly policy?: PrimedCachePolicy | undefined
  readonly isDeterministic?: boolean | undefined
}

export interface PrimedCacheLayerOptions {
  readonly enableSessionStore?: boolean | undefined
  readonly enableRequestStore?: boolean | undefined
  readonly keyValueStoreLayer?: Layer.Layer<KeyValueStore.KeyValueStore> | undefined
}

export interface PrimedCacheService {
  readonly get: (
    key: PrimedCacheKey,
    options?: CacheAccessOptions
  ) => Effect.Effect<ReadonlyArray<ScoredOutput> | undefined, PrimedCacheError>

  readonly put: (
    key: PrimedCacheKey,
    value: ReadonlyArray<ScoredOutput>,
    options?: CacheAccessOptions
  ) => Effect.Effect<void, PrimedCacheError>

  readonly invalidate: (
    key: PrimedCacheKey,
    options?: CacheAccessOptions
  ) => Effect.Effect<void, PrimedCacheError>

  readonly clearNamespace: (
    namespace: string
  ) => Effect.Effect<void, PrimedCacheError>
}

const NamespaceIndexEntry = Schema.Struct({
  storageKey: Schema.String,
  createdAtMs: Schema.Number,
  expiresAtMs: Schema.Number
})

type NamespaceIndexEntry = typeof NamespaceIndexEntry.Type

const NamespaceIndexJson = Schema.parseJson(Schema.Array(NamespaceIndexEntry))

const CacheRecord = Schema.Struct({
  key: PrimedCacheKey,
  keyString: Schema.String,
  createdAtMs: Schema.Number,
  expiresAtMs: Schema.Number,
  value: Schema.Array(ScoredOutput)
})

type CacheRecord = typeof CacheRecord.Type

const CacheRecordJson = Schema.parseJson(CacheRecord)

type RequestStoreRecord = {
  readonly value: ReadonlyArray<ScoredOutput>
  readonly expiresAtMs: number
  readonly createdAtMs: number
  readonly namespace: string
}

const sanitizeSegment = (value: string): string => encodeURIComponent(value)

const toKeyString = (key: PrimedCacheKey): string =>
  [
    key.namespace,
    key.provider,
    key.modelId,
    key.promptFingerprint,
    key.promptVersion,
    key.schemaFingerprint ?? "",
    key.temperature !== undefined ? `${key.temperature}` : "",
    key.formatType ?? ""
  ]
    .map(sanitizeSegment)
    .join("|")

const toStorageKey = (key: PrimedCacheKey, keyString: string): string =>
  [
    "entry",
    sanitizeSegment(key.namespace),
    sanitizeSegment(key.provider),
    sanitizeSegment(key.modelId),
    fnv1aHash(keyString)
  ].join(":")

const toNamespaceIndexKey = (namespace: string): string =>
  `index:${sanitizeSegment(namespace)}`

const toPrimedCacheError = (
  message: string,
  key?: string
): PrimedCacheError =>
  new PrimedCacheError({
    message,
    ...(key !== undefined ? { key } : {})
  })

const resolvePolicy = (
  options?: CacheAccessOptions
): PrimedCachePolicy =>
  options?.policy ?? new PrimedCachePolicy({})

const resolveNamespace = (
  key: PrimedCacheKey,
  options?: CacheAccessOptions
): string =>
  options?.policy?.namespace ?? key.namespace

const canUseCache = (
  policy: PrimedCachePolicy,
  options?: CacheAccessOptions
): boolean => {
  if (!policy.enabled) {
    return false
  }
  if (policy.deterministicOnly && options?.isDeterministic === false) {
    return false
  }
  return true
}

const copyKey = (
  key: PrimedCacheKey,
  namespace: string
): PrimedCacheKey =>
  new PrimedCacheKey({
    provider: key.provider,
    modelId: key.modelId,
    promptFingerprint: key.promptFingerprint,
    promptVersion: key.promptVersion,
    namespace,
    ...(key.schemaFingerprint !== undefined
      ? { schemaFingerprint: key.schemaFingerprint }
      : {}),
    ...(key.temperature !== undefined
      ? { temperature: key.temperature }
      : {}),
    ...(key.formatType !== undefined
      ? { formatType: key.formatType }
      : {})
  })

const encodeNamespaceIndex = (
  entries: ReadonlyArray<NamespaceIndexEntry>,
  namespace: string
): Effect.Effect<string, PrimedCacheError> =>
  Schema.encode(NamespaceIndexJson)(entries).pipe(
    Effect.mapError((error) =>
      toPrimedCacheError(
        `Failed to encode cache namespace index: ${String(error)}`,
        toNamespaceIndexKey(namespace)
      )
    )
  )

const decodeNamespaceIndex = (
  value: string,
  namespace: string
): Effect.Effect<ReadonlyArray<NamespaceIndexEntry>, PrimedCacheError> =>
  Schema.decode(NamespaceIndexJson)(value).pipe(
    Effect.mapError((error) =>
      toPrimedCacheError(
        `Failed to decode cache namespace index: ${String(error)}`,
        toNamespaceIndexKey(namespace)
      )
    )
  )

const encodeCacheRecord = (
  record: CacheRecord,
  storageKey: string
): Effect.Effect<string, PrimedCacheError> =>
  Schema.encode(CacheRecordJson)(record).pipe(
    Effect.mapError((error) =>
      toPrimedCacheError(
        `Failed to encode cache entry: ${String(error)}`,
        storageKey
      )
    )
  )

const decodeCacheRecord = (
  value: string,
  storageKey: string
): Effect.Effect<CacheRecord, PrimedCacheError> =>
  Schema.decode(CacheRecordJson)(value).pipe(
    Effect.mapError((error) =>
      toPrimedCacheError(
        `Failed to decode cache entry: ${String(error)}`,
        storageKey
      )
    )
  )

const makeCompositeCache = (
  options?: PrimedCacheLayerOptions
): Effect.Effect<PrimedCacheService, never, KeyValueStore.KeyValueStore> =>
  Effect.gen(function* () {
    const store = yield* KeyValueStore.KeyValueStore
    const requestEnabled = options?.enableRequestStore ?? true
    const sessionEnabled = options?.enableSessionStore ?? true
    const requestStoreRef = yield* Ref.make(new Map<string, RequestStoreRecord>())

    const removeStoreKey = (
      storageKey: string,
      message: string
    ): Effect.Effect<void, PrimedCacheError> =>
      store.remove(storageKey).pipe(
        Effect.catchTag("SystemError", (error) =>
          error.reason === "NotFound" ? Effect.void : Effect.fail(error)
        ),
        Effect.mapError((error) =>
          toPrimedCacheError(`${message}: ${errorMessage(error)}`, storageKey)
        )
      )

    const readNamespaceIndex = (
      namespace: string
    ): Effect.Effect<ReadonlyArray<NamespaceIndexEntry>, PrimedCacheError> =>
      store.get(toNamespaceIndexKey(namespace)).pipe(
        Effect.mapError((error) =>
          toPrimedCacheError(
            `Failed to read cache namespace index: ${errorMessage(error)}`,
            toNamespaceIndexKey(namespace)
          )
        ),
        Effect.flatMap(
          Option.match({
            onNone: () => Effect.succeed([] as const),
            onSome: (value) =>
              decodeNamespaceIndex(value, namespace).pipe(
                Effect.catchAll(() => Effect.succeed([] as const))
              )
          })
        )
      )

    const writeNamespaceIndex = (
      namespace: string,
      entries: ReadonlyArray<NamespaceIndexEntry>
    ): Effect.Effect<void, PrimedCacheError> =>
      entries.length === 0
        ? removeStoreKey(
            toNamespaceIndexKey(namespace),
            "Failed to clear empty cache namespace index"
          )
        : encodeNamespaceIndex(entries, namespace).pipe(
            Effect.flatMap((encoded) =>
              store.set(toNamespaceIndexKey(namespace), encoded)
            ),
            Effect.mapError((error) =>
              toPrimedCacheError(
                `Failed to write cache namespace index: ${errorMessage(error)}`,
                toNamespaceIndexKey(namespace)
              )
            )
          )

    const removeEntryFromIndex = (
      namespace: string,
      storageKey: string
    ): Effect.Effect<void, PrimedCacheError> =>
      Effect.gen(function* () {
        const entries = yield* readNamespaceIndex(namespace)
        const next = entries.filter((entry) => entry.storageKey !== storageKey)
        yield* writeNamespaceIndex(namespace, next)
      })

    const requestGet = (
      storageKey: string,
      now: number
    ): Effect.Effect<RequestStoreRecord | undefined> => {
      if (!requestEnabled) {
        return Effect.void.pipe(
          Effect.as(undefined as RequestStoreRecord | undefined)
        )
      }

      return Ref.modify(requestStoreRef, (state) => {
        const entry = state.get(storageKey)
        if (entry === undefined) {
          return [undefined, state] as const
        }

        if (entry.expiresAtMs <= now) {
          const next = new Map(state)
          next.delete(storageKey)
          return [undefined, next] as const
        }

        return [entry, state] as const
      })
    }

    const requestSet = (
      storageKey: string,
      value: ReadonlyArray<ScoredOutput>,
      namespace: string,
      createdAtMs: number,
      expiresAtMs: number,
      maxEntries: number
    ): Effect.Effect<void> => {
      if (!requestEnabled) {
        return Effect.void
      }

      return Ref.update(requestStoreRef, (state) => {
        const next = new Map(state)
        next.set(storageKey, {
          value,
          namespace,
          createdAtMs,
          expiresAtMs
        })

        const max = Math.max(0, maxEntries)
        if (next.size <= max) {
          return next
        }

        const overflow = next.size - max
        const orderedKeys = [...next.entries()]
          .sort((left, right) => left[1].createdAtMs - right[1].createdAtMs)
          .map(([key]) => key)

        for (let index = 0; index < overflow; index += 1) {
          const key = orderedKeys[index]
          if (key !== undefined) {
            next.delete(key)
          }
        }

        return next
      })
    }

    const requestInvalidate = (storageKey: string): Effect.Effect<void> => {
      if (!requestEnabled) {
        return Effect.void
      }

      return Ref.update(requestStoreRef, (state) => {
        if (!state.has(storageKey)) {
          return state
        }
        const next = new Map(state)
        next.delete(storageKey)
        return next
      })
    }

    const clearRequestNamespace = (namespace: string): Effect.Effect<void> => {
      if (!requestEnabled) {
        return Effect.void
      }

      return Ref.update(requestStoreRef, (state) => {
        const next = new Map(state)
        for (const [storageKey, entry] of next.entries()) {
          if (entry.namespace === namespace) {
            next.delete(storageKey)
          }
        }
        return next
      })
    }

    const upsertNamespaceIndex = (
      namespace: string,
      entry: NamespaceIndexEntry,
      maxEntries: number
    ): Effect.Effect<void, PrimedCacheError> =>
      Effect.gen(function* () {
        const existing = yield* readNamespaceIndex(namespace)
        const merged = [
          entry,
          ...existing.filter((item) => item.storageKey !== entry.storageKey)
        ].sort((left, right) => right.createdAtMs - left.createdAtMs)

        const max = Math.max(0, maxEntries)
        const retained = merged.slice(0, max)
        const dropped = merged.slice(max)

        yield* writeNamespaceIndex(namespace, retained)

        yield* Effect.forEach(
          dropped,
          (item) =>
            Effect.gen(function* () {
              yield* removeStoreKey(item.storageKey, "Failed to prune cache entry")
              yield* requestInvalidate(item.storageKey)
            }),
          { discard: true }
        )
      })

    const removeSessionEntry = (
      namespace: string,
      storageKey: string
    ): Effect.Effect<void, PrimedCacheError> =>
      Effect.gen(function* () {
        if (!sessionEnabled) {
          return
        }

        yield* removeStoreKey(storageKey, "Failed to remove cache entry")
        yield* removeEntryFromIndex(namespace, storageKey).pipe(
          Effect.catchAll(() => Effect.void)
        )
      })

    const readSessionRecord = (
      storageKey: string,
      now: number
    ): Effect.Effect<CacheRecord | undefined, PrimedCacheError> =>
      Effect.gen(function* () {
        if (!sessionEnabled) {
          return undefined
        }

        const maybeRaw = yield* store.get(storageKey).pipe(
          Effect.mapError((error) =>
            toPrimedCacheError(
              `Failed to read cache entry: ${errorMessage(error)}`,
              storageKey
            )
          )
        )

        if (Option.isNone(maybeRaw)) {
          return undefined
        }

        const decoded = yield* decodeCacheRecord(maybeRaw.value, storageKey).pipe(
          Effect.catchAll(() =>
            Effect.void.pipe(
              Effect.as(undefined as CacheRecord | undefined)
            )
          )
        )

        if (decoded === undefined) {
          yield* removeStoreKey(storageKey, "Failed to remove invalid cache entry").pipe(
            Effect.catchAll(() => Effect.void)
          )
          return undefined
        }

        if (decoded.expiresAtMs <= now) {
          yield* removeSessionEntry(decoded.key.namespace, storageKey).pipe(
            Effect.catchAll(() => Effect.void)
          )
          return undefined
        }

        return decoded
      })

    return {
      get: (inputKey, accessOptions) =>
        Effect.gen(function* () {
          const policy = resolvePolicy(accessOptions)
          if (!canUseCache(policy, accessOptions)) {
            return undefined
          }

          const key = copyKey(inputKey, resolveNamespace(inputKey, accessOptions))
          const keyString = toKeyString(key)
          const storageKey = toStorageKey(key, keyString)
          const now = yield* Clock.currentTimeMillis

          const requestEntry = yield* requestGet(storageKey, now)
          if (requestEntry !== undefined) {
            return requestEntry.value
          }

          const sessionEntry = yield* readSessionRecord(storageKey, now)
          if (sessionEntry === undefined) {
            return undefined
          }

          yield* requestSet(
            storageKey,
            sessionEntry.value,
            key.namespace,
            sessionEntry.createdAtMs,
            sessionEntry.expiresAtMs,
            policy.maxEntries
          )

          return sessionEntry.value
        }),
      put: (inputKey, value, accessOptions) =>
        Effect.gen(function* () {
          const policy = resolvePolicy(accessOptions)
          if (!canUseCache(policy, accessOptions)) {
            return
          }

          const key = copyKey(inputKey, resolveNamespace(inputKey, accessOptions))
          const keyString = toKeyString(key)
          const storageKey = toStorageKey(key, keyString)

          const now = yield* Clock.currentTimeMillis
          const ttlMillis = Math.max(0, policy.ttlSeconds) * 1000
          const expiresAtMs = now + ttlMillis

          yield* requestSet(
            storageKey,
            value,
            key.namespace,
            now,
            expiresAtMs,
            policy.maxEntries
          )

          if (!sessionEnabled) {
            return
          }

          const record: CacheRecord = {
            key,
            keyString,
            createdAtMs: now,
            expiresAtMs,
            value
          }

          const encodedRecord = yield* encodeCacheRecord(record, storageKey)

          yield* store.set(storageKey, encodedRecord).pipe(
            Effect.mapError((error) =>
              toPrimedCacheError(
                `Failed to write cache entry: ${errorMessage(error)}`,
                storageKey
              )
            )
          )

          yield* upsertNamespaceIndex(
            key.namespace,
            {
              storageKey,
              createdAtMs: now,
              expiresAtMs
            },
            policy.maxEntries
          )
        }),
      invalidate: (inputKey, accessOptions) =>
        Effect.gen(function* () {
          const key = copyKey(inputKey, resolveNamespace(inputKey, accessOptions))
          const keyString = toKeyString(key)
          const storageKey = toStorageKey(key, keyString)

          yield* requestInvalidate(storageKey)
          yield* removeSessionEntry(key.namespace, storageKey)
        }),
      clearNamespace: (namespace) =>
        Effect.gen(function* () {
          const entries = yield* readNamespaceIndex(namespace).pipe(
            Effect.catchAll(() => Effect.succeed([] as const))
          )

          yield* Effect.forEach(
            entries,
            (entry) =>
              removeStoreKey(
                entry.storageKey,
                "Failed to clear namespace cache entry"
              ).pipe(Effect.catchAll(() => Effect.void)),
            { discard: true }
          )

          yield* removeStoreKey(
            toNamespaceIndexKey(namespace),
            "Failed to clear namespace index"
          ).pipe(Effect.catchAll(() => Effect.void))

          yield* clearRequestNamespace(namespace)
        })
    } satisfies PrimedCacheService
  })

export class PrimedCache extends Effect.Service<PrimedCache>()(
  "@effect-langextract/PrimedCache",
  {
    dependencies: [KeyValueStore.layerMemory],
    effect: makeCompositeCache()
  }
) {
  static testLayer = (options?: PrimedCacheLayerOptions): Layer.Layer<PrimedCache> =>
    makePrimedCacheLayer({
      ...options,
      enableSessionStore: options?.enableSessionStore ?? false,
      enableRequestStore: options?.enableRequestStore ?? true
    })
}

export const makePrimedCacheLayer = (
  options?: PrimedCacheLayerOptions
): Layer.Layer<PrimedCache> => {
  const serviceLayer = Layer.effect(
    PrimedCache,
    makeCompositeCache(options).pipe(
      Effect.map((service) => PrimedCache.make(service))
    )
  )

  return Layer.provide(
    serviceLayer,
    options?.keyValueStoreLayer ?? KeyValueStore.layerMemory
  )
}

export const PrimedCacheLive: Layer.Layer<PrimedCache> = makePrimedCacheLayer()

export const PrimedCacheTest: Layer.Layer<PrimedCache> = PrimedCache.testLayer()
