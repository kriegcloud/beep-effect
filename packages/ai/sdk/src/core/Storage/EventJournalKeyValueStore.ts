import * as EventJournal from "@effect/experimental/EventJournal"
import { KeyValueStore, MsgPack } from "@effect/platform"
import * as Context from "effect/Context"
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
const EntryEnvelope = Schema.Struct({
  version: Schema.Literal(1),
  entries: EntryArray
})
const EntryEnvelopeMsgPack = MsgPack.schema(EntryEnvelope)
const decodeEntries = Schema.decode(EntryArrayMsgPack)
const decodeEntryEnvelope = Schema.decode(EntryEnvelopeMsgPack)
const encodeEntryEnvelope = Schema.encode(EntryEnvelopeMsgPack)

const decodeStoredEntries = (payload: Uint8Array) =>
  decodeEntryEnvelope(payload).pipe(
    Effect.map((envelope) => envelope.entries),
    Effect.catchAll(() => decodeEntries(payload))
  )

const loadEntries = (kv: KeyValueStore.KeyValueStore, key: string) =>
  kv.getUint8Array(key).pipe(
    Effect.mapError((cause) => toJournalError("entries", cause)),
    Effect.flatMap((maybe) =>
      Option.isNone(maybe)
        ? Effect.succeed([])
        : decodeStoredEntries(maybe.value).pipe(
            Effect.mapError((cause) => toJournalError("entries", cause))
          )
    )
  )

const persistEntries = (
  kv: KeyValueStore.KeyValueStore,
  key: string,
  entries: ReadonlyArray<EventJournal.Entry>
) =>
  encodeEntryEnvelope({
    version: 1,
    entries
  }).pipe(
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
    const conflictKey = (entry: EventJournal.Entry) => `${entry.event}\u0000${entry.primaryKey}`
    const conflictIndex = new Map<string, Array<EventJournal.Entry>>()
    for (const entry of journal) {
      const key = conflictKey(entry)
      const existing = conflictIndex.get(key)
      if (existing) {
        existing.push(entry)
      } else {
        conflictIndex.set(key, [entry])
      }
    }

    const insertSorted = (
      entries: Array<EventJournal.Entry>,
      entry: EventJournal.Entry
    ) => {
      let low = 0
      let high = entries.length
      while (low < high) {
        const mid = Math.floor((low + high) / 2)
        const current = entries[mid]!
        if (current.createdAtMillis <= entry.createdAtMillis) {
          low = mid + 1
        } else {
          high = mid
        }
      }
      entries.splice(low, 0, entry)
    }

    const addConflictIndex = (entry: EventJournal.Entry) => {
      const key = conflictKey(entry)
      const existing = conflictIndex.get(key)
      if (existing) {
        existing.push(entry)
      } else {
        conflictIndex.set(key, [entry])
      }
    }

    const withLock = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
      journalSemaphore.withPermits(1)(effect)

    const commitEntry = (entry: EventJournal.Entry) => {
      insertSorted(journal, entry)
      byId.set(entry.idString, entry)
      addConflictIndex(entry)
    }

    const publishChange = (entry: EventJournal.Entry) =>
      pubsub.publish(entry).pipe(Effect.asVoid)

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

    const withRemoteUncommitted = <A, E, R>(
      remoteId: EventJournal.RemoteId,
      f: (entries: Array<EventJournal.Entry>) => Effect.Effect<A, E, R>
    ) =>
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
      )

    const service = EventJournal.EventJournal.of({
      entries: withLock(Effect.sync(() => journal.slice())),
      write({ effect, event, payload, primaryKey }) {
        return Effect.gen(function*() {
          const entry = yield* Effect.sync(
            () =>
              new EventJournal.Entry({
                id: EventJournal.makeEntryId(),
                event,
                primaryKey,
                payload
              }, { disableValidation: true })
          )
          const value = yield* effect(entry)
          yield* withLock(
            Effect.suspend(() => {
              if (byId.has(entry.idString)) return Effect.void
              const persistedJournal = journal.slice()
              insertSorted(persistedJournal, entry)
              return persistEntries(kv, key, persistedJournal).pipe(
                Effect.tap(() =>
                  Effect.sync(() => {
                    commitEntry(entry)
                    remotes.forEach((remote) => {
                      remote.missing.push(entry)
                    })
                  })
                ),
                Effect.zipRight(publishChange(entry))
              )
            })
          )
          return value
        })
      },
      writeFromRemote: (options) =>
        withLock(Effect.gen(function*() {
          const remote = ensureRemote(options.remoteId)
          const uncommittedRemotes: Array<EventJournal.RemoteEntry> = []
          const uncommitted: Array<EventJournal.Entry> = []
          let nextRemoteSequence = remote.sequence
          for (const remoteEntry of options.entries) {
            if (remoteEntry.remoteSequence > nextRemoteSequence) {
              nextRemoteSequence = remoteEntry.remoteSequence
            }
            if (!byId.has(remoteEntry.entry.idString)) {
              uncommittedRemotes.push(remoteEntry)
              uncommitted.push(remoteEntry.entry)
            }
          }

          const brackets = options.compact
            ? yield* options.compact(uncommittedRemotes)
            : [[uncommitted, uncommittedRemotes]] as const

          const policy = yield* ConflictPolicy
          const audit = yield* SyncAudit
          const remoteIdString = remoteIdToString(options.remoteId)

          const resolveConflict = (
            entry: EventJournal.Entry,
            conflicts: ReadonlyArray<EventJournal.Entry>
          ) =>
            policy.resolve({ entry, conflicts })

          const emitConflict = (
            entry: EventJournal.Entry,
            conflicts: ReadonlyArray<EventJournal.Entry>,
            resolution: ConflictResolution
          ) =>
            audit.conflict({
              remoteId: remoteIdString,
              entry,
              conflicts,
              resolution
            })

          const emitCompaction = (
            before: number,
            after: number,
            events: ReadonlyArray<string>
          ) =>
            audit.compaction({
              remoteId: remoteIdString,
              before,
              after,
              events
            })

          const acceptedAll: Array<EventJournal.Entry> = []
          for (const [compacted, remoteEntries] of brackets) {
            if (remoteEntries.length > compacted.length) {
              const events = Array.from(
                new Set(remoteEntries.map((remoteEntry) => remoteEntry.entry.event))
              )
              yield* emitCompaction(remoteEntries.length, compacted.length, events)
            }
            const accepted: Array<EventJournal.Entry> = []
            const acceptedIndex = new Map<string, Array<EventJournal.Entry>>()
            for (const originEntry of compacted) {
              const conflicts: Array<EventJournal.Entry> = []
              const key = conflictKey(originEntry)
              const existing = conflictIndex.get(key)
              if (existing) conflicts.push(...existing)
              const local = acceptedIndex.get(key)
              if (local) conflicts.push(...local)
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
                  const acceptedKey = conflictKey(resolvedEntry)
                  const acceptedEntries = acceptedIndex.get(acceptedKey)
                  if (acceptedEntries) {
                    acceptedEntries.push(resolvedEntry)
                  } else {
                    acceptedIndex.set(acceptedKey, [resolvedEntry])
                  }
                }
              }
            }
            acceptedAll.push(...accepted)
          }

          if (acceptedAll.length > 0) {
            const persistedJournal = journal.slice()
            for (const entry of acceptedAll) {
              insertSorted(persistedJournal, entry)
            }
            yield* persistEntries(kv, key, persistedJournal)
            for (const entry of acceptedAll) {
              commitEntry(entry)
            }
          }

          if (nextRemoteSequence > remote.sequence) {
            remote.sequence = nextRemoteSequence
          }
        })),
      // Deprecated misspelling retained for compatibility.
      withRemoteUncommited: withRemoteUncommitted,
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
              conflictIndex.clear()
            })
          )
        )
      )
    })
    return Object.assign(service, { withRemoteUncommitted })
  })

export const layerKeyValueStore = (options?: { readonly key?: string }) =>
  Layer.scoped(EventJournal.EventJournal, make(options))

export const withRemoteUncommitted = <A, E, R>(
  journal: Context.Tag.Service<typeof EventJournal.EventJournal>,
  remoteId: EventJournal.RemoteId,
  f: (entries: ReadonlyArray<EventJournal.Entry>) => Effect.Effect<A, E, R>
) => {
  const anyJournal = journal as typeof journal & {
    readonly withRemoteUncommitted?: typeof journal.withRemoteUncommited
  }
  return (anyJournal.withRemoteUncommitted ?? journal.withRemoteUncommited)(remoteId, f)
}
