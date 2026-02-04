import * as EventJournal from "@effect/experimental/EventJournal"
import { KeyValueStore, MsgPack } from "@effect/platform"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as PubSub from "effect/PubSub"
import * as Schema from "effect/Schema"
import { ConflictPolicy } from "../Sync/ConflictPolicy.js"
import type { ConflictResolution } from "../Sync/ConflictPolicy.js"
import { SyncAudit } from "../Sync/SyncAudit.js"
import { defaultAuditEventJournalKey } from "./defaults.js"

const defaultKey = defaultAuditEventJournalKey

const toJournalError = (method: string, cause: unknown) =>
  new EventJournal.EventJournalError({ method, cause })

const EntryArray = Schema.Array(EventJournal.Entry)
const EntryArrayMsgPack = MsgPack.schema(EntryArray)
const decodeEntries = Schema.decode(EntryArrayMsgPack)
const encodeEntries = Schema.encode(EntryArrayMsgPack)

const loadEntries = (kv: KeyValueStore.KeyValueStore, key: string) =>
  kv.getUint8Array(key).pipe(
    Effect.mapError((cause) => toJournalError("entries", cause)),
    Effect.flatMap((maybe) =>
      Option.isNone(maybe)
        ? Effect.succeed([])
        : decodeEntries(maybe.value).pipe(
            Effect.mapError((cause) => toJournalError("entries", cause))
          )
    )
  )

const persistEntries = (
  kv: KeyValueStore.KeyValueStore,
  key: string,
  entries: ReadonlyArray<EventJournal.Entry>
) =>
  encodeEntries(entries).pipe(
    Effect.mapError((cause) => toJournalError("persist", cause)),
    Effect.flatMap((payload) =>
      kv.set(key, payload).pipe(
        Effect.mapError((cause) => toJournalError("persist", cause))
      )
    )
  )

const resolveDefaultConflict = (
  entry: EventJournal.Entry,
  conflicts: ReadonlyArray<EventJournal.Entry>
): ConflictResolution => {
  let latest = entry
  for (const conflict of conflicts) {
    if (conflict.createdAtMillis >= latest.createdAtMillis) {
      latest = conflict
    }
  }
  return { _tag: "accept", entry: latest }
}

export const make = (options?: { readonly key?: string }) =>
  Effect.gen(function*() {
    const kv = yield* KeyValueStore.KeyValueStore
    const key = options?.key ?? defaultKey
    const pubsub = yield* PubSub.unbounded<EventJournal.Entry>()
    const journal = [...(yield* loadEntries(kv, key))]
    const byId = new Map(journal.map((entry) => [entry.idString, entry]))
    const remotes = new Map<string, { sequence: number; missing: Array<EventJournal.Entry> }>()
    const journalSemaphore = yield* Effect.makeSemaphore(1)

    const withLock = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
      journalSemaphore.withPermits(1)(effect)

    const remoteIdToString = (remoteId: EventJournal.RemoteId) =>
      Array.from(remoteId)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("")

    const ensureRemote = (remoteId: EventJournal.RemoteId) => {
      const remoteIdString = remoteIdToString(remoteId)
      let remote = remotes.get(remoteIdString)
      if (remote) return remote
      remote = { sequence: 0, missing: journal.slice() }
      remotes.set(remoteIdString, remote)
      return remote
    }

    return EventJournal.EventJournal.of({
      entries: withLock(Effect.sync(() => journal.slice())),
      write({ effect, event, payload, primaryKey }) {
        return Effect.acquireUseRelease(
          Effect.sync(() =>
            new EventJournal.Entry({
              id: EventJournal.makeEntryId(),
              event,
              primaryKey,
              payload
            }, { disableValidation: true })
          ),
          effect,
          (entry, exit) =>
            withLock(
              Effect.suspend(() => {
                if (exit._tag === "Failure" || byId.has(entry.idString)) return Effect.void
                journal.push(entry)
                byId.set(entry.idString, entry)
                remotes.forEach((remote) => {
                  remote.missing.push(entry)
                })
                return persistEntries(kv, key, journal).pipe(
                  Effect.zipRight(pubsub.publish(entry))
                )
              })
            ).pipe(Effect.catchAll(() => Effect.void))
        )
      },
      writeFromRemote: (options) =>
        withLock(Effect.gen(function*() {
          const remote = ensureRemote(options.remoteId)
          const uncommittedRemotes: Array<EventJournal.RemoteEntry> = []
          const uncommitted: Array<EventJournal.Entry> = []
          for (const remoteEntry of options.entries) {
            if (byId.has(remoteEntry.entry.idString)) {
              if (remoteEntry.remoteSequence > remote.sequence) {
                remote.sequence = remoteEntry.remoteSequence
              }
              continue
            }
            uncommittedRemotes.push(remoteEntry)
            uncommitted.push(remoteEntry.entry)
          }

          const brackets = options.compact
            ? yield* options.compact(uncommittedRemotes)
            : [[uncommitted, uncommittedRemotes]] as const

          const policyOption = yield* Effect.serviceOption(ConflictPolicy)
          const auditOption = yield* Effect.serviceOption(SyncAudit)
          const remoteIdString = remoteIdToString(options.remoteId)

          const resolveConflict = (
            entry: EventJournal.Entry,
            conflicts: ReadonlyArray<EventJournal.Entry>
          ) =>
            Option.match(policyOption, {
              onNone: () => Effect.succeed(resolveDefaultConflict(entry, conflicts)),
              onSome: (policy) => policy.resolve({ entry, conflicts })
            })

          const emitConflict = (
            entry: EventJournal.Entry,
            conflicts: ReadonlyArray<EventJournal.Entry>,
            resolution: ConflictResolution
          ) =>
            Option.match(auditOption, {
              onNone: () => Effect.void,
              onSome: (audit) =>
                audit.conflict({
                  remoteId: remoteIdString,
                  entry,
                  conflicts,
                  resolution
                })
            })

          const emitCompaction = (
            before: number,
            after: number,
            events: ReadonlyArray<string>
          ) =>
            Option.match(auditOption, {
              onNone: () => Effect.void,
              onSome: (audit) =>
                audit.compaction({
                  remoteId: remoteIdString,
                  before,
                  after,
                  events
                })
            })

          for (const [compacted, remoteEntries] of brackets) {
            if (remoteEntries.length > compacted.length) {
              const events = Array.from(
                new Set(remoteEntries.map((remoteEntry) => remoteEntry.entry.event))
              )
              yield* emitCompaction(remoteEntries.length, compacted.length, events)
            }
            const accepted: Array<EventJournal.Entry> = []
            for (const originEntry of compacted) {
              const conflicts: Array<EventJournal.Entry> = []
              for (const check of journal) {
                if (check.event === originEntry.event && check.primaryKey === originEntry.primaryKey) {
                  conflicts.push(check)
                }
              }
              for (const check of accepted) {
                if (check.event === originEntry.event && check.primaryKey === originEntry.primaryKey) {
                  conflicts.push(check)
                }
              }
              let resolution = resolveDefaultConflict(originEntry, conflicts)
              if (conflicts.length > 0) {
                resolution = yield* resolveConflict(originEntry, conflicts)
                yield* emitConflict(originEntry, conflicts, resolution)
              }
              if (resolution._tag !== "reject") {
                const resolvedEntry = resolution.entry
                if (!byId.has(resolvedEntry.idString)) {
                  yield* options.effect({ entry: resolvedEntry, conflicts })
                  accepted.push(resolvedEntry)
                }
              }
            }
            for (const entry of accepted) {
              journal.push(entry)
              byId.set(entry.idString, entry)
            }
            for (const remoteEntry of remoteEntries) {
              if (remoteEntry.remoteSequence > remote.sequence) {
                remote.sequence = remoteEntry.remoteSequence
              }
            }
            if (accepted.length > 0) {
              journal.sort((a, b) => a.createdAtMillis - b.createdAtMillis)
            }
          }

          yield* persistEntries(kv, key, journal)
        })),
      withRemoteUncommited: (remoteId, f) =>
        Effect.acquireUseRelease(
          withLock(Effect.sync(() => ensureRemote(remoteId).missing.slice())),
          f,
          (entries, exit) =>
            withLock(Effect.sync(() => {
              if (exit._tag === "Failure") return
              const last = entries[entries.length - 1]
              if (!last) return
              const remote = ensureRemote(remoteId)
              for (let i = remote.missing.length - 1; i >= 0; i--) {
                const missing = remote.missing[i]
                if (missing && missing.id === last.id) {
                  remote.missing = remote.missing.slice(i + 1)
                  break
                }
              }
            }))
        ),
      nextRemoteSequence: (remoteId) =>
        withLock(Effect.sync(() => ensureRemote(remoteId).sequence)),
      changes: PubSub.subscribe(pubsub),
      destroy: withLock(
        kv.remove(key).pipe(
          Effect.mapError((cause) => toJournalError("destroy", cause)),
          Effect.tap(() =>
            Effect.sync(() => {
              journal.length = 0
              byId.clear()
              remotes.clear()
            })
          )
        )
      )
    })
  })

export const layerKeyValueStore = (options?: { readonly key?: string }) =>
  Layer.scoped(EventJournal.EventJournal, make(options))
