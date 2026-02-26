import { KeyValueStore } from "@effect/platform"
import { BunKeyValueStore } from "@effect/platform-bun"
import * as EventLogModule from "@effect/experimental/EventLog"
import * as Clock from "effect/Clock"
import * as Context from "effect/Context"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as Schema from "effect/Schema"
import * as SynchronizedRef from "effect/SynchronizedRef"
import { ArtifactRecord } from "../Schema/Storage.js"
import { SyncConfig, SyncService } from "../Sync/SyncService.js"
import { Compaction, compactEntries } from "../Sync/Compaction.js"
import type { CompactionStrategy } from "../Sync/Compaction.js"
import { ConflictPolicy } from "../Sync/ConflictPolicy.js"
import {
  defaultArtifactEventJournalKey,
  defaultArtifactIdentityKey,
  defaultArtifactPrefix,
  defaultStorageDirectory
} from "./defaults.js"
import { StorageConfig } from "./StorageConfig.js"
import { StorageError, toStorageError } from "./StorageError.js"
import { SessionIndexStore } from "./SessionIndexStore.js"
import { layerKeyValueStore as layerEventJournalKeyValueStore } from "./EventJournalKeyValueStore.js"
import {
  ArtifactDelete,
  ArtifactDeleteTag,
  ArtifactEventGroup,
  ArtifactEventSchema,
  ArtifactEventTag
} from "./StorageEventGroups.js"

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
  readonly syncInterval?: Duration.DurationInput
}

const storeName = "ArtifactStore"

const mapError = (operation: string, cause: unknown) =>
  toStorageError(storeName, operation, cause)

const resolveJournalKeys = (options?: {
  readonly journalKey?: string
  readonly identityKey?: string
  readonly prefix?: string
}) => ({
  journalKey:
    options?.journalKey ??
    (options?.prefix
      ? `${options.prefix}/event-journal`
      : defaultArtifactEventJournalKey),
  identityKey:
    options?.identityKey ??
    (options?.prefix
      ? `${options.prefix}/event-log-identity`
      : defaultArtifactIdentityKey)
})

const resolveJournaledOptions = <R = never>(options?: ArtifactJournaledOptions<R>) => ({
  ...(options?.prefix !== undefined ? { prefix: options.prefix } : {}),
  ...(options?.journalKey !== undefined ? { journalKey: options.journalKey } : {}),
  ...(options?.identityKey !== undefined ? { identityKey: options.identityKey } : {}),
  ...(options?.conflictPolicy !== undefined ? { conflictPolicy: options.conflictPolicy } : {})
})

const ArtifactIndex = Schema.Struct({
  ids: Schema.Array(Schema.String),
  updatedAt: Schema.Number
})

type ArtifactIndex = typeof ArtifactIndex.Type

type ArtifactState = {
  readonly byId: Map<string, ArtifactRecord>
  readonly bySession: Map<string, ReadonlyArray<string>>
}

const emptyState: ArtifactState = {
  byId: new Map(),
  bySession: new Map()
}

const updateIndex = (ids: ReadonlyArray<string>, id: string) => {
  if (ids.includes(id)) return ids
  return ids.concat(id)
}

const resolveListLimit = (options: ArtifactListOptions | undefined, fallback?: number) =>
  options?.limit ?? fallback

type ArtifactRetention = {
  readonly maxArtifacts?: number
  readonly maxArtifactBytes?: number
  readonly maxAgeMs?: number
}

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

const resolveEnabled = Effect.gen(function*() {
  const config = yield* Effect.serviceOption(StorageConfig)
  return Option.isNone(config) ? true : config.value.settings.enabled.artifacts
})

const logIndexWarning = (operation: string, sessionId: string, cause: unknown) =>
  Effect.logWarning(
    `[ArtifactStore] session index ${operation} failed for session=${sessionId}: ${String(cause)}`
  )

const touchSessionIndex = (sessionId: string, timestamp: number) =>
  Effect.flatMap(SessionIndexStore, (store) =>
    store.touch(sessionId, { updatedAt: timestamp }).pipe(Effect.asVoid)
  ).pipe(
    Effect.catchAll((cause) =>
      logIndexWarning("touch", sessionId, cause).pipe(Effect.asVoid)
    )
  )

const removeSessionIndex = (sessionId: string) =>
  Effect.flatMap(SessionIndexStore, (store) =>
    store.remove(sessionId).pipe(Effect.asVoid)
  ).pipe(
    Effect.catchAll((cause) =>
      logIndexWarning("remove", sessionId, cause).pipe(Effect.asVoid)
    )
  )

const sizeOfRecord = (record: ArtifactRecord) =>
  record.sizeBytes ?? new TextEncoder().encode(record.content).length

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

const layerArtifactJournalHandlers = (options?: {
  readonly prefix?: string
}) =>
  EventLogModule.group(ArtifactEventGroup, (handlers) =>
    handlers
      .handle(ArtifactEventTag, ({ payload }) =>
        Effect.gen(function*() {
          const enabled = yield* resolveEnabled
          if (!enabled) return
          const kv = yield* KeyValueStore.KeyValueStore
          const prefix = options?.prefix ?? defaultArtifactPrefix
          const recordStore = kv.forSchema(ArtifactRecord)
          const indexStore = kv.forSchema(ArtifactIndex)

          const recordKey = (id: string) => `${prefix}/by-id/${id}`
          const indexKey = (sessionId: string) => `${prefix}/by-session/${sessionId}`

          const loadIndex = (sessionId: string) =>
            indexStore.get(indexKey(sessionId)).pipe(
              Effect.mapError((cause) => mapError("loadIndex", cause)),
              Effect.map((maybe) =>
                Option.getOrElse(maybe, () => ({
                  ids: [],
                  updatedAt: 0
                } satisfies ArtifactIndex))
              )
            )

          const saveIndex = (sessionId: string, index: ArtifactIndex) =>
            indexStore.set(indexKey(sessionId), index).pipe(
              Effect.mapError((cause) => mapError("saveIndex", cause))
            )

          const applyRetentionKv = (
            sessionId: string,
            ids: ReadonlyArray<string>,
            now: number,
            retention: ArtifactRetention | undefined
          ) =>
            Effect.gen(function*() {
              if (!retention) return ids

              let filteredIds = ids.slice()

              if (retention.maxAgeMs !== undefined) {
                const cutoff = now - retention.maxAgeMs
                const records = yield* Effect.forEach(
                  filteredIds,
                  (id) =>
                    recordStore.get(recordKey(id)).pipe(
                      Effect.mapError((cause) => mapError("retention", cause))
                    ),
                  { discard: false }
                )
                filteredIds = filteredIds.filter((id, index) => {
                  const recordOption = records[index]
                  return recordOption
                    ? Option.isSome(recordOption) && recordOption.value.createdAt >= cutoff
                    : false
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
                  const records = yield* Effect.forEach(
                    filteredIds,
                    (id) =>
                      recordStore.get(recordKey(id)).pipe(
                        Effect.mapError((cause) => mapError("retention", cause))
                      ),
                    { discard: false }
                  )
                  let total = 0
                  const kept: Array<string> = []
                  for (let index = filteredIds.length - 1; index >= 0; index -= 1) {
                    const id = filteredIds[index]
                    if (!id) continue
                    const recordOption = records[index]
                    if (!recordOption || Option.isNone(recordOption)) continue
                    const size = sizeOfRecord(recordOption.value)
                    if (total + size > maxBytes) continue
                    total += size
                    kept.push(id)
                  }
                  kept.reverse()
                  filteredIds = kept
                }
              }

              return filteredIds
            })

          const record = payload
          const now = yield* Clock.currentTimeMillis
          const retention = yield* resolveRetention

          yield* recordStore.set(recordKey(record.id), record).pipe(
            Effect.mapError((cause) => mapError("put", cause))
          )
          const index = yield* loadIndex(record.sessionId)
          const ids = updateIndex(index.ids, record.id)
          const retained = yield* applyRetentionKv(record.sessionId, ids, now, retention)
          const dropped = ids.filter((id) => !retained.includes(id))
          if (dropped.length > 0) {
            yield* Effect.forEach(
              dropped,
              (id) =>
                recordStore.remove(recordKey(id)).pipe(
                  Effect.mapError((cause) => mapError("retention", cause))
                ),
              { discard: true }
            )
          }
          yield* saveIndex(record.sessionId, { ids: retained, updatedAt: now }).pipe(
            Effect.catchAll((error) =>
              recordStore.remove(recordKey(record.id)).pipe(
                Effect.catchAll((cleanupCause) =>
                  Effect.logWarning(
                    `[ArtifactStore] journal put compensation failed while removing artifact=${record.id} session=${record.sessionId}: ${String(cleanupCause)}`
                  ).pipe(Effect.asVoid)
                ),
                Effect.zipRight(
                  Effect.logWarning(
                    `[ArtifactStore] journal put compensation removed artifact=${record.id} after index save failure for session=${record.sessionId}`
                  )
                ),
                Effect.zipRight(Effect.fail(error))
              )
            )
          )
          yield* touchSessionIndex(record.sessionId, now)
        }).pipe(
          Effect.mapError((cause) => mapError("journalHandler", cause))
        )
      )
      .handle(ArtifactDeleteTag, ({ payload }) =>
        Effect.gen(function*() {
          const enabled = yield* resolveEnabled
          if (!enabled) return
          const kv = yield* KeyValueStore.KeyValueStore
          const prefix = options?.prefix ?? defaultArtifactPrefix
          const recordStore = kv.forSchema(ArtifactRecord)
          const indexStore = kv.forSchema(ArtifactIndex)

          const recordKey = (id: string) => `${prefix}/by-id/${id}`
          const indexKey = (sessionId: string) => `${prefix}/by-session/${sessionId}`

          const deletedRecord = yield* recordStore.get(recordKey(payload.id)).pipe(
            Effect.mapError((cause) => mapError("loadRecord", cause))
          )

          yield* recordStore.remove(recordKey(payload.id)).pipe(
            Effect.mapError((cause) => mapError("delete", cause))
          )

          const indexOption = yield* indexStore.get(indexKey(payload.sessionId)).pipe(
            Effect.mapError((cause) => mapError("loadIndex", cause))
          )
          if (Option.isNone(indexOption)) return
          const ids = indexOption.value.ids.filter((id) => id !== payload.id)
          const saveDeleteIndex = ids.length === 0
            ? indexStore.remove(indexKey(payload.sessionId)).pipe(
              Effect.mapError((cause) => mapError("deleteIndex", cause))
            )
            : indexStore.set(indexKey(payload.sessionId), {
              ids,
              updatedAt: payload.deletedAt
            }).pipe(
              Effect.mapError((cause) => mapError("saveIndex", cause))
            )

          yield* saveDeleteIndex.pipe(
            Effect.catchAll((error) => {
              const restoreDeletedRecord = Option.isNone(deletedRecord)
                ? Effect.void
                : recordStore.set(recordKey(payload.id), deletedRecord.value).pipe(
                  Effect.catchAll((cleanupCause) =>
                    Effect.logWarning(
                      `[ArtifactStore] journal delete compensation failed while restoring artifact=${payload.id} session=${payload.sessionId}: ${String(cleanupCause)}`
                    ).pipe(Effect.asVoid)
                  )
                )
              return restoreDeletedRecord.pipe(
                Effect.zipRight(
                  Effect.logWarning(
                    `[ArtifactStore] journal delete compensation restored artifact=${payload.id} after index save failure for session=${payload.sessionId}`
                  )
                ),
                Effect.zipRight(Effect.fail(error))
              )
            })
          )
          yield* touchSessionIndex(payload.sessionId, payload.deletedAt)
        }).pipe(
          Effect.mapError((cause) => mapError("journalHandler", cause))
        )
      )
  )

const layerArtifactJournalCompaction = Layer.scopedDiscard(
  Effect.gen(function*() {
    const retention = yield* resolveRetention
    if (!retention) return
    const strategies: Array<CompactionStrategy> = []
    if (retention.maxAgeMs !== undefined) {
      strategies.push(Compaction.byAge(retention.maxAgeMs))
    }
    if (retention.maxArtifacts !== undefined) {
      strategies.push(Compaction.byCount(retention.maxArtifacts))
    }
    if (retention.maxArtifactBytes !== undefined) {
      strategies.push(Compaction.bySize(retention.maxArtifactBytes))
    }
    if (strategies.length === 0) return
    const strategy =
      strategies.length === 1 ? strategies[0]! : Compaction.composite(...strategies)
    const log = yield* EventLogModule.EventLog
    yield* log.registerCompaction({
      events: [ArtifactEventTag, ArtifactDeleteTag],
      effect: ({ entries, write }) =>
        compactEntries(strategy, entries).pipe(
          Effect.flatMap((kept) => Effect.forEach(kept, write, { discard: true }))
        )
    })
  })
)

const journaledEventLogLayer = <R = never>(
  options?: ArtifactJournaledOptions<R>
): Layer.Layer<EventLogModule.EventLog, unknown, KeyValueStore.KeyValueStore | R> => {
  const keys = resolveJournalKeys(options)
  const conflictPolicyLayer =
    options?.conflictPolicy ?? ConflictPolicy.layerLastWriteWins
  const baseLayer = EventLogModule.layerEventLog.pipe(
    Layer.provide(
      layerEventJournalKeyValueStore(
        { key: keys.journalKey }
      )
    ),
    Layer.provide(EventLogModule.layerIdentityKvs({
      key: keys.identityKey
    })),
    Layer.provide(layerArtifactJournalHandlers(options)),
    Layer.provide(conflictPolicyLayer)
  )
  const compactionLayer = layerArtifactJournalCompaction.pipe(Layer.provide(baseLayer))
  return Layer.merge(baseLayer, compactionLayer)
}

const makeJournaledStore = (options?: {
  readonly prefix?: string
  readonly journalKey?: string
  readonly identityKey?: string
}) =>
  Effect.gen(function*() {
    const kv = yield* KeyValueStore.KeyValueStore
    const log = yield* EventLogModule.EventLog
    const prefix = options?.prefix ?? defaultArtifactPrefix
    const recordStore = kv.forSchema(ArtifactRecord)
    const indexStore = kv.forSchema(ArtifactIndex)

    const recordKey = (id: string) => `${prefix}/by-id/${id}`
    const indexKey = (sessionId: string) => `${prefix}/by-session/${sessionId}`

    const loadIndex = (sessionId: string) =>
      indexStore.get(indexKey(sessionId)).pipe(
        Effect.mapError((cause) => toStorageError(storeName, "loadIndex", cause)),
        Effect.map((maybe) =>
          Option.getOrElse(maybe, () => ({
            ids: [],
            updatedAt: 0
          } satisfies ArtifactIndex))
        )
      )

    const saveIndex = (sessionId: string, index: ArtifactIndex) =>
      indexStore.set(indexKey(sessionId), index).pipe(
        Effect.mapError((cause) => toStorageError(storeName, "saveIndex", cause))
      )

    const applyRetentionKv = (
      sessionId: string,
      ids: ReadonlyArray<string>,
      now: number,
      retention: ArtifactRetention | undefined
    ) =>
      Effect.gen(function*() {
        if (!retention) return ids

        let filteredIds = ids.slice()

        if (retention.maxAgeMs !== undefined) {
          const cutoff = now - retention.maxAgeMs
          const records = yield* Effect.forEach(
            filteredIds,
            (id) =>
              recordStore.get(recordKey(id)).pipe(
                Effect.mapError((cause) => toStorageError(storeName, "retention", cause))
              ),
            { discard: false }
          )
          filteredIds = filteredIds.filter((id, index) => {
            const recordOption = records[index]
            return recordOption
              ? Option.isSome(recordOption) && recordOption.value.createdAt >= cutoff
              : false
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
            const records = yield* Effect.forEach(
              filteredIds,
              (id) =>
                recordStore.get(recordKey(id)).pipe(
                  Effect.mapError((cause) => toStorageError(storeName, "retention", cause))
                ),
              { discard: false }
            )
            let total = 0
            const kept: Array<string> = []
            for (let index = filteredIds.length - 1; index >= 0; index -= 1) {
              const id = filteredIds[index]
              if (!id) continue
              const recordOption = records[index]
              if (!recordOption || Option.isNone(recordOption)) continue
              const size = sizeOfRecord(recordOption.value)
              if (total + size > maxBytes) continue
              total += size
              kept.push(id)
            }
            kept.reverse()
            filteredIds = kept
          }
        }

        return filteredIds
      })

    const put = Effect.fn("ArtifactStore.put")((record: ArtifactRecord) =>
      Effect.gen(function*() {
        const enabled = yield* resolveEnabled
        if (!enabled) return
        yield* log.write({
          schema: ArtifactEventSchema,
          event: ArtifactEventTag,
          payload: record
        }).pipe(
          Effect.mapError((cause) => toStorageError(storeName, "put", cause))
        )
      })
    )

    const get = Effect.fn("ArtifactStore.get")((id: string) =>
      recordStore.get(recordKey(id)).pipe(
        Effect.mapError((cause) => toStorageError(storeName, "get", cause))
      )
    )

    const list = Effect.fn("ArtifactStore.list")((sessionId: string, options?: ArtifactListOptions) =>
      Effect.gen(function*() {
        const config = yield* Effect.serviceOption(StorageConfig)
        const defaultLimit = Option.getOrUndefined(
          Option.map(config, (value) => value.settings.pagination.artifactPageSize)
        )
        const limit = resolveListLimit(options, defaultLimit)
        const indexOption = yield* indexStore.get(indexKey(sessionId)).pipe(
          Effect.mapError((cause) => toStorageError(storeName, "list", cause))
        )
        if (Option.isNone(indexOption)) return []
        const ids = indexOption.value.ids
        const records = yield* Effect.forEach(
          ids,
          (id) => recordStore.get(recordKey(id)).pipe(
            Effect.mapError((cause) => toStorageError(storeName, "list", cause))
          ),
          { discard: false }
        )
        const retainedIds: Array<string> = []
        const byId = new Map<string, ArtifactRecord>()
        for (let index = 0; index < ids.length; index += 1) {
          const id = ids[index]
          const record = records[index]
          if (!id || !record || Option.isNone(record)) continue
          retainedIds.push(id)
          byId.set(id, record.value)
        }
        if (retainedIds.length !== ids.length) {
          const now = yield* Clock.currentTimeMillis
          yield* saveIndex(sessionId, { ids: retainedIds, updatedAt: now })
          yield* Effect.logWarning(
            `[ArtifactStore] repaired stale artifact index for session=${sessionId}; removed ${ids.length - retainedIds.length} missing references`
          )
        }

        const offset = Math.max(0, options?.offset ?? 0)
        const slice = limit === undefined
          ? retainedIds.slice(offset)
          : retainedIds.slice(offset, offset + limit)
        return slice.flatMap((id) => {
          const record = byId.get(id)
          return record ? [record] : []
        })
      })
    )

    const deleteArtifact = Effect.fn("ArtifactStore.delete")((id: string) =>
      Effect.gen(function*() {
        const recordOption = yield* recordStore.get(recordKey(id)).pipe(
          Effect.mapError((cause) => toStorageError(storeName, "delete", cause))
        )
        if (Option.isNone(recordOption)) return
        const record = recordOption.value
        const now = yield* Clock.currentTimeMillis
        const payload: ArtifactDelete = {
          id: record.id,
          sessionId: record.sessionId,
          deletedAt: now
        }
        yield* log.write({
          schema: ArtifactEventSchema,
          event: ArtifactDeleteTag,
          payload
        }).pipe(
          Effect.mapError((cause) => toStorageError(storeName, "delete", cause))
        )
      })
    )

    const purgeSession = Effect.fn("ArtifactStore.purgeSession")((sessionId: string) =>
      Effect.gen(function*() {
        const indexOption = yield* indexStore.get(indexKey(sessionId)).pipe(
          Effect.mapError((cause) => toStorageError(storeName, "purgeSession", cause))
        )
        if (Option.isNone(indexOption)) return
        const ids = indexOption.value.ids
        const now = yield* Clock.currentTimeMillis
        yield* Effect.forEach(
          ids,
          (id) =>
            log.write({
              schema: ArtifactEventSchema,
              event: ArtifactDeleteTag,
              payload: {
                id,
                sessionId,
                deletedAt: now
              }
            }).pipe(
              Effect.mapError((cause) => toStorageError(storeName, "purgeSession", cause))
            ),
          { discard: true }
        )
      })
    )

    const cleanup = Effect.fn("ArtifactStore.cleanup")(function*() {
      const enabled = yield* resolveEnabled
      if (!enabled) return
      const retention = yield* resolveRetention
      if (!retention) return
      const index = yield* SessionIndexStore
      const sessionIds = yield* index.listIds()
      if (sessionIds.length === 0) return
      const now = yield* Clock.currentTimeMillis

      yield* Effect.forEach(
        sessionIds,
        (sessionId) =>
          Effect.gen(function*() {
            const index = yield* loadIndex(sessionId)
            const retained = yield* applyRetentionKv(sessionId, index.ids, now, retention)
            const dropped = index.ids.filter((id) => !retained.includes(id))
            if (dropped.length > 0) {
              yield* Effect.forEach(
                dropped,
                (id) =>
                  recordStore.remove(recordKey(id)).pipe(
                    Effect.mapError((cause) => toStorageError(storeName, "retention", cause))
                  ),
                { discard: true }
              )
            }
            if (retained.length !== index.ids.length) {
                yield* saveIndex(sessionId, { ids: retained, updatedAt: now })
              }
            }),
        { discard: true, concurrency: 1 }
      )
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

export class ArtifactStore extends Context.Tag("@effect/claude-agent-sdk/ArtifactStore")<
  ArtifactStore,
  {
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
>() {
  static readonly layerMemory = Layer.effect(
    ArtifactStore,
    Effect.gen(function*() {
      const stateRef = yield* SynchronizedRef.make(emptyState)

      const put = Effect.fn("ArtifactStore.put")((record: ArtifactRecord) =>
        Effect.gen(function*() {
          const enabled = yield* resolveEnabled
          if (!enabled) return
          const now = yield* Clock.currentTimeMillis
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
          }).pipe(Effect.asVoid)
          yield* touchSessionIndex(record.sessionId, now)
        })
      )

      const get = Effect.fn("ArtifactStore.get")((id: string) =>
        SynchronizedRef.get(stateRef).pipe(
          Effect.map((state) => Option.fromNullable(state.byId.get(id)))
        )
      )

      const list = Effect.fn("ArtifactStore.list")((sessionId: string, options?: ArtifactListOptions) =>
        Effect.gen(function*() {
          const config = yield* Effect.serviceOption(StorageConfig)
          const defaultLimit = Option.getOrUndefined(
            Option.map(config, (value) => value.settings.pagination.artifactPageSize)
          )
          const limit = resolveListLimit(options, defaultLimit)
          const state = yield* SynchronizedRef.get(stateRef)
            const ids = state.bySession.get(sessionId) ?? []
            const offset = Math.max(0, options?.offset ?? 0)
          const slice = limit === undefined ? ids.slice(offset) : ids.slice(offset, offset + limit)
          return slice.flatMap((id) => {
            const record = state.byId.get(id)
            return record ? [record] : []
          })
        })
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
          next.bySession.set(
            record.sessionId,
            ids.filter((existing) => existing !== id)
          )
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
  )

  static readonly layerKeyValueStore = (options?: { readonly prefix?: string }) =>
    Layer.effect(
      ArtifactStore,
      Effect.gen(function*() {
        const kv = yield* KeyValueStore.KeyValueStore
        const prefix = options?.prefix ?? defaultArtifactPrefix
        const recordStore = kv.forSchema(ArtifactRecord)
        const indexStore = kv.forSchema(ArtifactIndex)

        const recordKey = (id: string) => `${prefix}/by-id/${id}`
        const indexKey = (sessionId: string) => `${prefix}/by-session/${sessionId}`

        const loadIndex = (sessionId: string) =>
          indexStore.get(indexKey(sessionId)).pipe(
            Effect.mapError((cause) => toStorageError(storeName, "loadIndex", cause)),
            Effect.map((maybe) =>
              Option.getOrElse(maybe, () => ({
                ids: [],
                updatedAt: 0
              } satisfies ArtifactIndex))
            )
          )

        const saveIndex = (sessionId: string, index: ArtifactIndex) =>
          indexStore.set(indexKey(sessionId), index).pipe(
            Effect.mapError((cause) => toStorageError(storeName, "saveIndex", cause))
          )

        const applyRetentionKv = (
          sessionId: string,
          ids: ReadonlyArray<string>,
          now: number,
          retention: ArtifactRetention | undefined
        ) =>
          Effect.gen(function*() {
            if (!retention) return ids

            let filteredIds = ids.slice()

            if (retention.maxAgeMs !== undefined) {
              const cutoff = now - retention.maxAgeMs
              const records = yield* Effect.forEach(
                filteredIds,
                (id) =>
                  recordStore.get(recordKey(id)).pipe(
                    Effect.mapError((cause) => toStorageError(storeName, "retention", cause))
                  ),
                { discard: false }
              )
              filteredIds = filteredIds.filter((id, index) => {
                const recordOption = records[index]
                return recordOption
                  ? Option.isSome(recordOption) && recordOption.value.createdAt >= cutoff
                  : false
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
                const records = yield* Effect.forEach(
                  filteredIds,
                  (id) =>
                    recordStore.get(recordKey(id)).pipe(
                      Effect.mapError((cause) => toStorageError(storeName, "retention", cause))
                    ),
                  { discard: false }
                )
                let total = 0
                const kept: Array<string> = []
                for (let index = filteredIds.length - 1; index >= 0; index -= 1) {
                  const id = filteredIds[index]
                  if (!id) continue
                  const recordOption = records[index]
                  if (!recordOption || Option.isNone(recordOption)) continue
                  const size = sizeOfRecord(recordOption.value)
                  if (total + size > maxBytes) continue
                  total += size
                  kept.push(id)
                }
                kept.reverse()
                filteredIds = kept
              }
            }

            return filteredIds
          })

        const put = Effect.fn("ArtifactStore.put")((record: ArtifactRecord) =>
          Effect.gen(function*() {
            const enabled = yield* resolveEnabled
            if (!enabled) return
            const now = yield* Clock.currentTimeMillis
            const retention = yield* resolveRetention
            yield* recordStore.set(recordKey(record.id), record).pipe(
              Effect.mapError((cause) => toStorageError(storeName, "put", cause))
            )
            const index = yield* loadIndex(record.sessionId)
            const ids = updateIndex(index.ids, record.id)
            const retained = yield* applyRetentionKv(record.sessionId, ids, now, retention)
            const dropped = ids.filter((id) => !retained.includes(id))
            if (dropped.length > 0) {
              yield* Effect.forEach(
                dropped,
                (id) =>
                  recordStore.remove(recordKey(id)).pipe(
                    Effect.mapError((cause) => toStorageError(storeName, "retention", cause))
                  ),
                { discard: true }
              )
            }
            yield* saveIndex(record.sessionId, { ids: retained, updatedAt: now }).pipe(
              Effect.catchAll((error) =>
                recordStore.remove(recordKey(record.id)).pipe(
                  Effect.catchAll((cleanupCause) =>
                    Effect.logWarning(
                      `[ArtifactStore] put compensation failed while removing artifact=${record.id} session=${record.sessionId}: ${String(cleanupCause)}`
                    ).pipe(Effect.asVoid)
                  ),
                  Effect.zipRight(
                    Effect.logWarning(
                      `[ArtifactStore] put compensation removed artifact=${record.id} after index save failure for session=${record.sessionId}`
                    )
                  ),
                  Effect.zipRight(Effect.fail(error))
                )
              )
            )
            yield* touchSessionIndex(record.sessionId, now)
          })
        )

        const get = Effect.fn("ArtifactStore.get")((id: string) =>
          recordStore.get(recordKey(id)).pipe(
            Effect.mapError((cause) => toStorageError(storeName, "get", cause))
          )
        )

        const list = Effect.fn("ArtifactStore.list")((sessionId: string, options?: ArtifactListOptions) =>
          Effect.gen(function*() {
            const config = yield* Effect.serviceOption(StorageConfig)
            const defaultLimit = Option.getOrUndefined(
              Option.map(config, (value) => value.settings.pagination.artifactPageSize)
            )
            const limit = resolveListLimit(options, defaultLimit)
            const indexOption = yield* indexStore.get(indexKey(sessionId)).pipe(
              Effect.mapError((cause) => toStorageError(storeName, "list", cause))
            )
            if (Option.isNone(indexOption)) return []
            const ids = indexOption.value.ids
            const records = yield* Effect.forEach(
              ids,
              (id) => recordStore.get(recordKey(id)).pipe(
                Effect.mapError((cause) => toStorageError(storeName, "list", cause))
              ),
              { discard: false }
            )
            const retainedIds: Array<string> = []
            const byId = new Map<string, ArtifactRecord>()
            for (let index = 0; index < ids.length; index += 1) {
              const id = ids[index]
              const record = records[index]
              if (!id || !record || Option.isNone(record)) continue
              retainedIds.push(id)
              byId.set(id, record.value)
            }
            if (retainedIds.length !== ids.length) {
              const now = yield* Clock.currentTimeMillis
              yield* saveIndex(sessionId, { ids: retainedIds, updatedAt: now })
              yield* Effect.logWarning(
                `[ArtifactStore] repaired stale artifact index for session=${sessionId}; removed ${ids.length - retainedIds.length} missing references`
              )
            }

            const offset = Math.max(0, options?.offset ?? 0)
            const slice = limit === undefined
              ? retainedIds.slice(offset)
              : retainedIds.slice(offset, offset + limit)
            return slice.flatMap((id) => {
              const record = byId.get(id)
              return record ? [record] : []
            })
          })
        )

        const deleteArtifact = Effect.fn("ArtifactStore.delete")((id: string) =>
          Effect.gen(function*() {
            const recordOption = yield* recordStore.get(recordKey(id)).pipe(
              Effect.mapError((cause) => toStorageError(storeName, "delete", cause))
            )
            if (Option.isNone(recordOption)) return
            const record = recordOption.value
            yield* recordStore.remove(recordKey(id)).pipe(
              Effect.mapError((cause) => toStorageError(storeName, "delete", cause))
            )
            const index = yield* loadIndex(record.sessionId)
            const ids = index.ids.filter((existing) => existing !== id)
            yield* saveIndex(record.sessionId, { ids, updatedAt: index.updatedAt }).pipe(
              Effect.catchAll((error) =>
                recordStore.set(recordKey(record.id), record).pipe(
                  Effect.catchAll((cleanupCause) =>
                    Effect.logWarning(
                      `[ArtifactStore] delete compensation failed while restoring artifact=${record.id} session=${record.sessionId}: ${String(cleanupCause)}`
                    ).pipe(Effect.asVoid)
                  ),
                  Effect.zipRight(
                    Effect.logWarning(
                      `[ArtifactStore] delete compensation restored artifact=${record.id} after index save failure for session=${record.sessionId}`
                    )
                  ),
                  Effect.zipRight(Effect.fail(error))
                )
              )
            )
          })
        )

        const purgeSession = Effect.fn("ArtifactStore.purgeSession")((sessionId: string) =>
          Effect.gen(function*() {
            const indexOption = yield* indexStore.get(indexKey(sessionId)).pipe(
              Effect.mapError((cause) => toStorageError(storeName, "purgeSession", cause))
            )
            if (Option.isNone(indexOption)) return
            const ids = indexOption.value.ids
            yield* Effect.forEach(
              ids,
              (id) => recordStore.remove(recordKey(id)).pipe(
                Effect.mapError((cause) => toStorageError(storeName, "purgeSession", cause))
              ),
              { discard: true }
            )
            yield* indexStore.remove(indexKey(sessionId)).pipe(
              Effect.mapError((cause) => toStorageError(storeName, "purgeSession", cause))
            )
            yield* removeSessionIndex(sessionId)
          })
        )

        const cleanup = Effect.fn("ArtifactStore.cleanup")(function*() {
          const enabled = yield* resolveEnabled
          if (!enabled) return
          const retention = yield* resolveRetention
          if (!retention) return
          const index = yield* SessionIndexStore
          const sessionIds = yield* index.listIds()
          if (sessionIds.length === 0) return
          const now = yield* Clock.currentTimeMillis

          yield* Effect.forEach(
            sessionIds,
            (sessionId) =>
              Effect.gen(function*() {
                const index = yield* loadIndex(sessionId)
                const retained = yield* applyRetentionKv(sessionId, index.ids, now, retention)
                const dropped = index.ids.filter((id) => !retained.includes(id))
                if (dropped.length > 0) {
                  yield* Effect.forEach(
                    dropped,
                    (id) =>
                      recordStore.remove(recordKey(id)).pipe(
                        Effect.mapError((cause) => toStorageError(storeName, "retention", cause))
                      ),
                    { discard: true }
                  )
                }
                if (retained.length !== index.ids.length) {
                  yield* saveIndex(sessionId, { ids: retained, updatedAt: now })
                }
              }),
            { discard: true, concurrency: 1 }
          )
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
    )

  static readonly layerJournaled = <R = never>(options?: ArtifactJournaledOptions<R>) =>
    Layer.effect(ArtifactStore, makeJournaledStore(options)).pipe(
      Layer.provide(journaledEventLogLayer(options))
    )

  static readonly layerJournaledWithEventLog: <R = never>(
    options?: ArtifactJournaledOptions<R>
  ) => Layer.Layer<
    ArtifactStore | EventLogModule.EventLog,
    unknown,
    KeyValueStore.KeyValueStore | R
  > = (options) =>
    {
      const eventLogLayer = journaledEventLogLayer(options)
      const storeLayer = Layer.effect(ArtifactStore, makeJournaledStore(options)).pipe(
        Layer.provide(eventLogLayer)
      )
      return Layer.merge(eventLogLayer, storeLayer)
    }

  static readonly layerJournaledWithSyncWebSocket: <R = never>(
    url: string,
    options?: ArtifactSyncOptions<R>
  ) => Layer.Layer<ArtifactStore, unknown, KeyValueStore.KeyValueStore | R> = (url, options) => {
    const baseLayer = ArtifactStore.layerJournaledWithEventLog(resolveJournaledOptions(options))
    const syncOptions =
      options?.disablePing !== undefined || options?.protocols !== undefined
        ? {
            ...(options?.disablePing !== undefined ? { disablePing: options.disablePing } : {}),
            ...(options?.protocols !== undefined ? { protocols: options.protocols } : {})
          }
        : undefined
    let syncLayer = SyncService.layerWebSocket(
      url,
      syncOptions
    ).pipe(
      Layer.provide(baseLayer)
    )
    if (options?.syncInterval !== undefined) {
      syncLayer = syncLayer.pipe(
        Layer.provide(SyncConfig.layer({ syncInterval: options.syncInterval }))
      )
    }
    const combined = Layer.merge(baseLayer, syncLayer)
    return Layer.project(
      combined,
      ArtifactStore,
      ArtifactStore,
      (store) => store
    )
  }

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
    ArtifactStore.layerKeyValueStore({
      prefix: options?.prefix ?? defaultArtifactPrefix
    }).pipe(
      Layer.provide(
        BunKeyValueStore.layerFileSystem(
          options?.directory ?? defaultStorageDirectory
        )
      )
    )

  static readonly layerJournaledFileSystem = (options?: {
    readonly directory?: string
    readonly prefix?: string
    readonly journalKey?: string
    readonly identityKey?: string
  }) =>
    ArtifactStore.layerJournaled(
      resolveJournaledOptions(options)
    ).pipe(
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
    ArtifactStore.layerJournaled(
      resolveJournaledOptions(options)
    ).pipe(
      Layer.provide(
        BunKeyValueStore.layerFileSystem(
          options?.directory ?? defaultStorageDirectory
        )
      )
    )
}
