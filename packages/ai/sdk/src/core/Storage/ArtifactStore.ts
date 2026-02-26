import { BunFileSystem, BunPath } from "@effect/platform-bun"
import * as Clock from "effect/Clock"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as ServiceMap from "effect/ServiceMap"
import * as SynchronizedRef from "effect/SynchronizedRef"
import { KeyValueStore } from "effect/unstable/persistence"
import { ArtifactRecord } from "../Schema/Storage.js"
import type { ConflictPolicy } from "../Sync/ConflictPolicy.js"
import {
  defaultArtifactPrefix,
  defaultStorageDirectory
} from "./defaults.js"
import { SessionIndexStore } from "./SessionIndexStore.js"
import { StorageConfig } from "./StorageConfig.js"
import type { StorageError } from "./StorageError.js"

export type ArtifactListOptions = {
  readonly offset?: number
  readonly limit?: number
}

export type ArtifactJournaledOptions<R = never> = {
  readonly prefix?: string
  readonly journalKey?: string
  readonly identityKey?: string
  readonly conflictPolicy?: Layer.Layer<ConflictPolicy, unknown, R>
}

export type ArtifactSyncOptions<R = never> = ArtifactJournaledOptions<R> & {
  readonly disablePing?: boolean
  readonly protocols?: string | Array<string>
  readonly syncInterval?: Duration.Input
}

type ArtifactRetention = {
  readonly maxArtifacts?: number
  readonly maxArtifactBytes?: number
  readonly maxAgeMs?: number
}

type ArtifactState = {
  readonly byId: Map<string, ArtifactRecord>
  readonly bySession: Map<string, ReadonlyArray<string>>
}

type ArtifactStoreService = {
  readonly put: (record: ArtifactRecord) => Effect.Effect<void, StorageError>
  readonly get: (id: string) => Effect.Effect<Option.Option<ArtifactRecord>, StorageError>
  readonly list: (
    sessionId: string,
    options?: ArtifactListOptions
  ) => Effect.Effect<ReadonlyArray<ArtifactRecord>, StorageError>
  readonly delete: (id: string) => Effect.Effect<void, StorageError>
  readonly purgeSession: (sessionId: string) => Effect.Effect<void, StorageError>
  readonly cleanup?: () => Effect.Effect<void, StorageError>
}

const emptyState: ArtifactState = {
  byId: new Map(),
  bySession: new Map()
}

const resolveEnabled = Effect.gen(function*() {
  const config = yield* Effect.serviceOption(StorageConfig)
  return Option.isNone(config) ? true : config.value.settings.enabled.artifacts
})

const resolveRetention = Effect.gen(function*() {
  const config = yield* Effect.serviceOption(StorageConfig)
  if (Option.isNone(config)) return undefined
  const retention = config.value.settings.retention.artifacts
  return {
    maxArtifacts: retention.maxArtifacts,
    maxArtifactBytes: retention.maxArtifactBytes,
    maxAgeMs: Duration.toMillis(retention.maxAge)
  } satisfies ArtifactRetention
})

const sizeOfRecord = (record: ArtifactRecord) =>
  record.sizeBytes ?? new TextEncoder().encode(record.content).length

const updateIndex = (ids: ReadonlyArray<string>, id: string): ReadonlyArray<string> =>
  ids.includes(id) ? ids : ids.concat(id)

const applyRetention = (
  state: ArtifactState,
  sessionId: string,
  retention: ArtifactRetention | undefined,
  now: number
): ArtifactState => {
  if (!retention) return state

  const ids = state.bySession.get(sessionId) ?? []
  let filteredIds = ids.filter((id) => state.byId.has(id))

  if (retention.maxAgeMs !== undefined) {
    const cutoff = now - retention.maxAgeMs
    filteredIds = filteredIds.filter((id) => {
      const record = state.byId.get(id)
      return record ? record.createdAt >= cutoff : false
    })
  }

  if (retention.maxArtifacts !== undefined) {
    const maxArtifacts = retention.maxArtifacts
    if (maxArtifacts <= 0) {
      filteredIds = []
    } else if (filteredIds.length > maxArtifacts) {
      filteredIds = filteredIds.slice(filteredIds.length - maxArtifacts)
    }
  }

  if (retention.maxArtifactBytes !== undefined) {
    const maxBytes = retention.maxArtifactBytes
    if (maxBytes <= 0) {
      filteredIds = []
    } else {
      let total = 0
      const kept: Array<string> = []
      for (let index = filteredIds.length - 1; index >= 0; index -= 1) {
        const id = filteredIds[index]
        if (!id) continue
        const record = state.byId.get(id)
        if (!record) continue
        const size = sizeOfRecord(record)
        if (total + size > maxBytes) continue
        total += size
        kept.push(id)
      }
      kept.reverse()
      filteredIds = kept
    }
  }

  const kept = new Set(filteredIds)
  if (kept.size === ids.length) return state

  const next: ArtifactState = {
    byId: new Map(state.byId),
    bySession: new Map(state.bySession)
  }

  next.bySession.set(sessionId, filteredIds)
  for (const id of ids) {
    if (!kept.has(id)) {
      next.byId.delete(id)
    }
  }

  return next
}

const touchSessionIndex = (sessionId: string, timestamp: number) =>
  Effect.gen(function*() {
    const storeOption = yield* Effect.serviceOption(SessionIndexStore)
    if (Option.isNone(storeOption)) return
    yield* storeOption.value.touch(sessionId, { updatedAt: timestamp }).pipe(Effect.asVoid)
  }).pipe(Effect.catch(() => Effect.void))

const removeSessionIndex = (sessionId: string) =>
  Effect.gen(function*() {
    const storeOption = yield* Effect.serviceOption(SessionIndexStore)
    if (Option.isNone(storeOption)) return
    yield* storeOption.value.remove(sessionId).pipe(Effect.asVoid)
  }).pipe(Effect.catch(() => Effect.void))

const makeMemoryStore = Effect.gen(function*() {
  const stateRef = yield* SynchronizedRef.make(emptyState)

  const put = Effect.fn("ArtifactStore.put")((record: ArtifactRecord) =>
    Effect.gen(function*() {
      const enabled = yield* resolveEnabled
      if (!enabled) return
      const now = record.createdAt || (yield* Clock.currentTimeMillis)
      const retention = yield* resolveRetention
      yield* SynchronizedRef.update(stateRef, (state) => {
        const next: ArtifactState = {
          byId: new Map(state.byId),
          bySession: new Map(state.bySession)
        }
        next.byId.set(record.id, record)
        const currentIds = next.bySession.get(record.sessionId) ?? []
        next.bySession.set(record.sessionId, updateIndex(currentIds, record.id))
        return applyRetention(next, record.sessionId, retention, now)
      })
      yield* touchSessionIndex(record.sessionId, now)
    })
  )

  const get = Effect.fn("ArtifactStore.get")((id: string) =>
    SynchronizedRef.get(stateRef).pipe(
      Effect.map((state) => Option.fromNullishOr(state.byId.get(id)))
    )
  )

  const list = Effect.fn("ArtifactStore.list")((sessionId: string, options?: ArtifactListOptions) =>
    SynchronizedRef.get(stateRef).pipe(
      Effect.map((state) => {
        const ids = state.bySession.get(sessionId) ?? []
        const offset = Math.max(0, options?.offset ?? 0)
        const slice =
          options?.limit === undefined
            ? ids.slice(offset)
            : ids.slice(offset, offset + Math.max(0, options.limit))
        return slice.flatMap((id) => {
          const record = state.byId.get(id)
          return record ? [record] : []
        })
      })
    )
  )

  const deleteArtifact = Effect.fn("ArtifactStore.delete")((id: string) =>
    SynchronizedRef.update(stateRef, (state) => {
      const record = state.byId.get(id)
      if (!record) return state
      const next: ArtifactState = {
        byId: new Map(state.byId),
        bySession: new Map(state.bySession)
      }
      next.byId.delete(id)
      const ids = next.bySession.get(record.sessionId) ?? []
      const remaining = ids.filter((existing) => existing !== id)
      if (remaining.length === 0) {
        next.bySession.delete(record.sessionId)
      } else {
        next.bySession.set(record.sessionId, remaining)
      }
      return next
    })
  )

  const purgeSession = Effect.fn("ArtifactStore.purgeSession")((sessionId: string) =>
    SynchronizedRef.update(stateRef, (state) => {
      const ids = state.bySession.get(sessionId) ?? []
      const next: ArtifactState = {
        byId: new Map(state.byId),
        bySession: new Map(state.bySession)
      }
      for (const id of ids) {
        next.byId.delete(id)
      }
      next.bySession.delete(sessionId)
      return next
    }).pipe(
      Effect.tap(() => removeSessionIndex(sessionId))
    )
  )

  const cleanup = Effect.fn("ArtifactStore.cleanup")(function*() {
    const enabled = yield* resolveEnabled
    if (!enabled) return
    const retention = yield* resolveRetention
    if (!retention) return
    const now = yield* Clock.currentTimeMillis

    yield* SynchronizedRef.update(stateRef, (state) => {
      let next = state
      for (const sessionId of state.bySession.keys()) {
        next = applyRetention(next, sessionId, retention, now)
      }
      return next
    })
  })

  return ArtifactStore.of({
    put,
    get,
    list,
    delete: deleteArtifact,
    purgeSession,
    cleanup
  })
})

export class ArtifactStore extends ServiceMap.Service<ArtifactStore, ArtifactStoreService>()(
  "@effect/claude-agent-sdk/ArtifactStore"
) {
  static readonly layerMemory = Layer.effect(ArtifactStore, makeMemoryStore)

  static readonly layerKeyValueStore = (_options?: { readonly prefix?: string }) =>
    ArtifactStore.layerMemory

  static readonly layerJournaled = <R = never>(_options?: ArtifactJournaledOptions<R>) =>
    ArtifactStore.layerMemory

  static readonly layerJournaledWithSyncWebSocket = <R = never>(
    _url: string,
    options?: ArtifactSyncOptions<R>
  ) => ArtifactStore.layerJournaled(options)

  static readonly layerFileSystem = (options?: {
    readonly directory?: string
    readonly prefix?: string
  }) =>
    ArtifactStore.layerKeyValueStore({
      prefix: options?.prefix ?? defaultArtifactPrefix
    }).pipe(
      Layer.provide(
        KeyValueStore.layerFileSystem(
          options?.directory ?? defaultStorageDirectory
        )
      )
    )

  static readonly layerFileSystemBun = (options?: {
    readonly directory?: string
    readonly prefix?: string
  }) =>
    ArtifactStore.layerFileSystem(options).pipe(
      Layer.provide([BunFileSystem.layer, BunPath.layer])
    )

  static readonly layerJournaledFileSystem = (options?: {
    readonly directory?: string
    readonly prefix?: string
    readonly journalKey?: string
    readonly identityKey?: string
  }) =>
    ArtifactStore.layerJournaled(options).pipe(
      Layer.provide(
        KeyValueStore.layerFileSystem(
          options?.directory ?? defaultStorageDirectory
        )
      )
    )

  static readonly layerJournaledFileSystemBun = (options?: {
    readonly directory?: string
    readonly prefix?: string
    readonly journalKey?: string
    readonly identityKey?: string
  }) =>
    ArtifactStore.layerJournaledFileSystem(options).pipe(
      Layer.provide([BunFileSystem.layer, BunPath.layer])
    )
}
