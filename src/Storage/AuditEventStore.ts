import * as EventLogModule from "@effect/experimental/EventLog"
import * as EventJournal from "@effect/experimental/EventJournal"
import { KeyValueStore } from "@effect/platform"
import { BunKeyValueStore } from "@effect/platform-bun"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import type { HookEvent } from "../Schema/Hooks.js"
import { AuditEventSchema, layerAuditHandlers } from "../experimental/EventLog.js"
import { Compaction, compactEntries } from "../Sync/Compaction.js"
import type { CompactionStrategy } from "../Sync/Compaction.js"
import { ConflictPolicy } from "../Sync/ConflictPolicy.js"
import {
  defaultAuditEventJournalKey,
  defaultAuditIdentityKey,
  defaultStorageDirectory
} from "./defaults.js"
import { StorageConfig } from "./StorageConfig.js"
import { StorageError, toStorageError } from "./StorageError.js"
import { layerKeyValueStore as layerEventJournalKeyValueStore } from "./EventJournalKeyValueStore.js"

export type AuditEventInput =
  | {
      readonly event: "tool_use"
      readonly payload: {
        readonly sessionId: string
        readonly toolName: string
        readonly toolUseId?: string
        readonly status: "start" | "success" | "failure"
        readonly durationMs?: number
      }
    }
  | {
      readonly event: "permission_decision"
      readonly payload: {
        readonly sessionId: string
        readonly toolName: string
        readonly decision: "allow" | "deny" | "prompt"
        readonly reason?: string
      }
    }
  | {
      readonly event: "hook_event"
      readonly payload: {
        readonly sessionId?: string
        readonly hook: HookEvent
        readonly toolUseId?: string
        readonly outcome: "success" | "failure"
      }
    }
  | {
      readonly event: "sync_conflict"
      readonly payload: {
        readonly remoteId: string
        readonly event: string
        readonly primaryKey: string
        readonly entryId: string
        readonly conflictCount: number
        readonly resolution: "accept" | "merge" | "reject"
        readonly resolvedEntryId?: string
      }
    }
  | {
      readonly event: "sync_compaction"
      readonly payload: {
        readonly remoteId: string
        readonly before: number
        readonly after: number
        readonly events?: ReadonlyArray<string>
        readonly timestamp: number
      }
    }

const storeName = "AuditEventStore"

const mapError = (operation: string, cause: unknown) =>
  toStorageError(storeName, operation, cause)

const resolveEnabled = Effect.gen(function*() {
  const config = yield* Effect.serviceOption(StorageConfig)
  return Option.isNone(config) ? true : config.value.settings.enabled.auditLog
})

const resolveAuditKeys = (options?: {
  readonly journalKey?: string
  readonly identityKey?: string
  readonly prefix?: string
}) => ({
  journalKey:
    options?.journalKey ??
    (options?.prefix
      ? `${options.prefix}/event-journal`
      : defaultAuditEventJournalKey),
  identityKey:
    options?.identityKey ??
    (options?.prefix
      ? `${options.prefix}/event-log-identity`
      : defaultAuditIdentityKey)
})

const auditEventTags = [
  "tool_use",
  "permission_decision",
  "hook_event",
  "sync_conflict",
  "sync_compaction"
] as const

const layerAuditJournalCompaction = Layer.scopedDiscard(
  Effect.gen(function*() {
    const config = yield* Effect.serviceOption(StorageConfig)
    if (Option.isNone(config)) return
    const retention = config.value.settings.retention.audit
    const strategies: Array<CompactionStrategy> = []
    strategies.push(Compaction.byAge(retention.maxAge))
    strategies.push(Compaction.byCount(retention.maxEntries))
    const strategy = Compaction.composite(...strategies)
    const log = yield* EventLogModule.EventLog
    yield* log.registerCompaction({
      events: auditEventTags,
      effect: ({ entries, write }) =>
        compactEntries(strategy, entries).pipe(
          Effect.flatMap((kept) => Effect.forEach(kept, write, { discard: true }))
        )
    })
  })
)

const makeStore = Effect.gen(function*() {
  const log = yield* EventLogModule.EventLog

  const write = Effect.fn("AuditEventStore.write")((input: AuditEventInput) =>
    Effect.gen(function*() {
      const enabled = yield* resolveEnabled
      if (!enabled) return
      yield* log.write({
        schema: AuditEventSchema,
        event: input.event,
        payload: input.payload
      }).pipe(
        Effect.mapError((cause) => mapError("write", cause))
      )
    })
  )

  const entries = log.entries.pipe(
    Effect.mapError((cause) => mapError("entries", cause))
  )

  return AuditEventStore.of({ write, entries })
})

export class AuditEventStore extends Context.Tag("@effect/claude-agent-sdk/AuditEventStore")<
  AuditEventStore,
  {
    readonly write: (input: AuditEventInput) => Effect.Effect<void, StorageError>
    readonly entries: Effect.Effect<ReadonlyArray<EventJournal.Entry>, StorageError>
    readonly cleanup?: () => Effect.Effect<void, StorageError>
  }
>() {
  static readonly layerMemory = Layer.effect(
    AuditEventStore,
    makeStore
  ).pipe(
    Layer.provide(
      (() => {
        const baseLayer = EventLogModule.layerEventLog.pipe(
          Layer.provide(EventJournal.layerMemory),
          Layer.provide(Layer.sync(EventLogModule.Identity, () => EventLogModule.Identity.makeRandom())),
          Layer.provide(layerAuditHandlers)
        )
        const compactionLayer = layerAuditJournalCompaction.pipe(Layer.provide(baseLayer))
        return Layer.merge(baseLayer, compactionLayer)
      })()
    )
  )

  static readonly layerKeyValueStore = (options?: {
    readonly journalKey?: string
    readonly identityKey?: string
    readonly conflictPolicy?: Layer.Layer<ConflictPolicy>
  }) =>
    Layer.effect(AuditEventStore, makeStore).pipe(
      Layer.provide(
        (() => {
          const conflictPolicyLayer =
            options?.conflictPolicy ?? ConflictPolicy.layerLastWriteWins
          const baseLayer = EventLogModule.layerEventLog.pipe(
            Layer.provide(
              layerEventJournalKeyValueStore(
                options?.journalKey ? { key: options.journalKey } : undefined
              )
            ),
            Layer.provide(EventLogModule.layerIdentityKvs({
              key: options?.identityKey ?? defaultAuditIdentityKey
            })),
            Layer.provide(layerAuditHandlers),
            Layer.provide(conflictPolicyLayer)
          )
          const compactionLayer = layerAuditJournalCompaction.pipe(Layer.provide(baseLayer))
          return Layer.merge(baseLayer, compactionLayer)
        })()
      )
    )

  static readonly layerFileSystem = (options?: {
    readonly directory?: string
    readonly journalKey?: string
    readonly identityKey?: string
    readonly prefix?: string
    readonly conflictPolicy?: Layer.Layer<ConflictPolicy>
  }) =>
    AuditEventStore.layerKeyValueStore({
      ...resolveAuditKeys(options),
      ...(options?.conflictPolicy !== undefined
        ? { conflictPolicy: options.conflictPolicy }
        : {})
    }).pipe(
      Layer.provide(
        KeyValueStore.layerFileSystem(
          options?.directory ?? defaultStorageDirectory
        )
      )
    )

  static readonly layerFileSystemBun = (options?: {
    readonly directory?: string
    readonly journalKey?: string
    readonly identityKey?: string
    readonly prefix?: string
    readonly conflictPolicy?: Layer.Layer<ConflictPolicy>
  }) =>
    AuditEventStore.layerKeyValueStore({
      ...resolveAuditKeys(options),
      ...(options?.conflictPolicy !== undefined
        ? { conflictPolicy: options.conflictPolicy }
        : {})
    }).pipe(
      Layer.provide(
        BunKeyValueStore.layerFileSystem(
          options?.directory ?? defaultStorageDirectory
        )
      )
    )
}
