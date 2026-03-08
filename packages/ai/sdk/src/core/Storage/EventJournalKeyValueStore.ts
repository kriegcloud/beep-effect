import type { ServiceMap } from "effect";
import { Effect, Layer, MutableHashMap, PubSub, Semaphore } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as EventJournal from "effect/unstable/eventlog/EventJournal";
import { KeyValueStore } from "effect/unstable/persistence";
import type { ConflictResolution } from "../Sync/index.js";
import { ConflictPolicy, SyncAudit } from "../Sync/index.js";
import { defaultAuditEventJournalKey } from "./defaults.js";

const defaultKey = defaultAuditEventJournalKey;

const toJournalError = (method: string, cause: unknown) => new EventJournal.EventJournalError({ method, cause });

const resolveDefaultConflict = (
  entry: EventJournal.Entry,
  conflicts: ReadonlyArray<EventJournal.Entry>
): ConflictResolution => {
  let latest = entry;
  for (const conflict of conflicts) {
    if (conflict.createdAtMillis >= latest.createdAtMillis) {
      latest = conflict;
    }
  }
  return { _tag: "accept", entry: latest };
};

const loadEntries = (store: KeyValueStore.SchemaStore<typeof EventJournal.Entry.arrayMsgpack>, key: string) =>
  store.get(key).pipe(
    Effect.mapError((cause) => toJournalError("entries", cause)),
    Effect.map((maybe) => O.getOrElse(maybe, () => [] as ReadonlyArray<EventJournal.Entry>))
  );

const persistEntries = (
  store: KeyValueStore.SchemaStore<typeof EventJournal.Entry.arrayMsgpack>,
  key: string,
  entries: ReadonlyArray<EventJournal.Entry>
) => store.set(key, entries).pipe(Effect.mapError((cause) => toJournalError("persist", cause)));

/**
 * @since 0.0.0
 * @category DataAccess
 */
export const make = (options?: { readonly key?: string }) =>
  Effect.gen(function* () {
    const kv = yield* KeyValueStore.KeyValueStore;
    const entryStore = KeyValueStore.toSchemaStore(kv, EventJournal.Entry.arrayMsgpack);
    const key = options?.key ?? defaultKey;
    const pubsub = yield* PubSub.unbounded<EventJournal.Entry>();
    const journal = [...(yield* loadEntries(entryStore, key))];
    const byId = MutableHashMap.fromIterable(journal.map((entry) => [entry.idString, entry] as const));
    const remotes = MutableHashMap.empty<string, { sequence: number; missing: Array<EventJournal.Entry> }>();
    const journalSemaphore = yield* Semaphore.make(1);
    const conflictKey = (entry: EventJournal.Entry) => `${entry.event}\u0000${entry.primaryKey}`;
    const conflictIndex = MutableHashMap.empty<string, Array<EventJournal.Entry>>();
    for (const entry of journal) {
      const key = conflictKey(entry);
      const existing = MutableHashMap.get(conflictIndex, key);
      if (O.isSome(existing)) {
        existing.value.push(entry);
      } else {
        MutableHashMap.set(conflictIndex, key, [entry]);
      }
    }

    const insertSorted = (entries: Array<EventJournal.Entry>, entry: EventJournal.Entry) => {
      let low = 0;
      let high = entries.length;
      while (low < high) {
        const mid = Math.floor((low + high) / 2);
        const current = entries[mid];
        if (current && current.createdAtMillis <= entry.createdAtMillis) {
          low = mid + 1;
        } else {
          high = mid;
        }
      }
      entries.splice(low, 0, entry);
    };

    const addConflictIndex = (entry: EventJournal.Entry) => {
      const key = conflictKey(entry);
      const existing = MutableHashMap.get(conflictIndex, key);
      if (O.isSome(existing)) {
        existing.value.push(entry);
      } else {
        MutableHashMap.set(conflictIndex, key, [entry]);
      }
    };

    const withLock = <A, E, R>(effect: Effect.Effect<A, E, R>) => journalSemaphore.withPermits(1)(effect);

    const commitEntry = (entry: EventJournal.Entry) => {
      insertSorted(journal, entry);
      MutableHashMap.set(byId, entry.idString, entry);
      addConflictIndex(entry);
    };

    const publishChange = (entry: EventJournal.Entry) => PubSub.publish(pubsub, entry).pipe(Effect.asVoid);

    const remoteIdToString = (remoteId: EventJournal.RemoteId) =>
      [...remoteId].map((byte) => byte.toString(16).padStart(2, "0")).join("");

    const ensureRemote = (remoteId: EventJournal.RemoteId) => {
      const remoteIdString = remoteIdToString(remoteId);
      const existing = MutableHashMap.get(remotes, remoteIdString);
      if (O.isSome(existing)) return existing.value;
      const created = { sequence: 0, missing: journal.slice() };
      MutableHashMap.set(remotes, remoteIdString, created);
      return created;
    };

    const withRemoteUncommited = <A, E, R>(
      remoteId: EventJournal.RemoteId,
      f: (entries: Array<EventJournal.Entry>) => Effect.Effect<A, E, R>
    ) =>
      Effect.acquireUseRelease(
        withLock(Effect.sync(() => ensureRemote(remoteId).missing.slice())),
        f,
        (entries, exit) =>
          withLock(
            Effect.sync(() => {
              if (exit._tag === "Failure") return;
              const last = entries[entries.length - 1];
              if (!last) return;
              const remote = ensureRemote(remoteId);
              for (let i = remote.missing.length - 1; i >= 0; i -= 1) {
                const missing = remote.missing[i];
                if (missing && missing.idString === last.idString) {
                  remote.missing = remote.missing.slice(i + 1);
                  break;
                }
              }
            })
          )
      );

    return EventJournal.EventJournal.of({
      entries: withLock(Effect.sync(() => journal.slice())),
      write({ effect, event, payload, primaryKey }) {
        return Effect.gen(function* () {
          const entry = yield* Effect.sync(
            () =>
              new EventJournal.Entry(
                {
                  id: EventJournal.makeEntryIdUnsafe(),
                  event,
                  primaryKey,
                  payload,
                },
                { disableValidation: true }
              )
          );
          const value = yield* effect(entry);
          yield* withLock(
            Effect.suspend(() => {
              if (MutableHashMap.has(byId, entry.idString)) return Effect.void;
              const persistedJournal = journal.slice();
              insertSorted(persistedJournal, entry);
              return persistEntries(entryStore, key, persistedJournal).pipe(
                Effect.tap(() =>
                  Effect.sync(() => {
                    commitEntry(entry);
                    for (const [, remote] of remotes) {
                      remote.missing.push(entry);
                    }
                  })
                ),
                Effect.andThen(publishChange(entry))
              );
            })
          );
          return value;
        });
      },
      writeFromRemote: (options) =>
        withLock(
          Effect.gen(function* () {
            const remote = ensureRemote(options.remoteId);
            const uncommittedRemotes: Array<EventJournal.RemoteEntry> = [];
            const uncommitted: Array<EventJournal.Entry> = [];
            let nextRemoteSequence = remote.sequence;
            for (const remoteEntry of options.entries) {
              if (remoteEntry.remoteSequence > nextRemoteSequence) {
                nextRemoteSequence = remoteEntry.remoteSequence;
              }
              if (!MutableHashMap.has(byId, remoteEntry.entry.idString)) {
                uncommittedRemotes.push(remoteEntry);
                uncommitted.push(remoteEntry.entry);
              }
            }

            const brackets: ReadonlyArray<
              readonly [ReadonlyArray<EventJournal.Entry>, ReadonlyArray<EventJournal.RemoteEntry>]
            > = options.compact ? yield* options.compact(uncommittedRemotes) : [[uncommitted, uncommittedRemotes]];

            const policyOption = yield* Effect.serviceOption(ConflictPolicy);
            const auditOption = yield* Effect.serviceOption(SyncAudit);
            const remoteIdString = remoteIdToString(options.remoteId);

            const resolveConflict = (entry: EventJournal.Entry, conflicts: ReadonlyArray<EventJournal.Entry>) =>
              O.isSome(policyOption)
                ? policyOption.value.resolve({
                    entry,
                    conflicts,
                  })
                : Effect.succeed(resolveDefaultConflict(entry, conflicts));

            const emitConflict = (
              entry: EventJournal.Entry,
              conflicts: ReadonlyArray<EventJournal.Entry>,
              resolution: ConflictResolution
            ) =>
              O.isSome(auditOption)
                ? auditOption.value.conflict({
                    remoteId: remoteIdString,
                    entry,
                    conflicts,
                    resolution,
                  })
                : Effect.void;

            const emitCompaction = (before: number, after: number, events: ReadonlyArray<string>) =>
              O.isSome(auditOption)
                ? auditOption.value.compaction({
                    remoteId: remoteIdString,
                    before,
                    after,
                    events,
                  })
                : Effect.void;

            const acceptedAll: Array<EventJournal.Entry> = [];
            for (const [compacted, remoteEntries] of brackets) {
              if (remoteEntries.length > compacted.length) {
                const events = A.dedupe(remoteEntries.map((remoteEntry) => remoteEntry.entry.event));
                yield* emitCompaction(remoteEntries.length, compacted.length, events);
              }

              const accepted: Array<EventJournal.Entry> = [];
              const acceptedIndex = MutableHashMap.empty<string, Array<EventJournal.Entry>>();
              for (const originEntry of compacted) {
                const conflicts: Array<EventJournal.Entry> = [];
                const key = conflictKey(originEntry);
                const existing = MutableHashMap.get(conflictIndex, key);
                if (O.isSome(existing)) conflicts.push(...existing.value);
                const local = MutableHashMap.get(acceptedIndex, key);
                if (O.isSome(local)) conflicts.push(...local.value);

                let resolution = resolveDefaultConflict(originEntry, conflicts);
                if (conflicts.length > 0) {
                  resolution = yield* resolveConflict(originEntry, conflicts);
                  yield* emitConflict(originEntry, conflicts, resolution);
                }

                if (resolution._tag !== "reject") {
                  const resolvedEntry = resolution.entry;
                  if (!MutableHashMap.has(byId, resolvedEntry.idString)) {
                    yield* options.effect({
                      entry: resolvedEntry,
                      conflicts,
                    });
                    accepted.push(resolvedEntry);
                    const acceptedKey = conflictKey(resolvedEntry);
                    const acceptedEntries = MutableHashMap.get(acceptedIndex, acceptedKey);
                    if (O.isSome(acceptedEntries)) {
                      acceptedEntries.value.push(resolvedEntry);
                    } else {
                      MutableHashMap.set(acceptedIndex, acceptedKey, [resolvedEntry]);
                    }
                  }
                }
              }

              acceptedAll.push(...accepted);
            }

            if (acceptedAll.length > 0) {
              const persistedJournal = journal.slice();
              for (const entry of acceptedAll) {
                insertSorted(persistedJournal, entry);
              }
              yield* persistEntries(entryStore, key, persistedJournal);
              for (const entry of acceptedAll) {
                commitEntry(entry);
              }
            }

            if (nextRemoteSequence > remote.sequence) {
              remote.sequence = nextRemoteSequence;
            }
          })
        ),
      withRemoteUncommited,
      nextRemoteSequence: (remoteId) => withLock(Effect.sync(() => ensureRemote(remoteId).sequence)),
      changes: PubSub.subscribe(pubsub),
      destroy: withLock(
        entryStore.remove(key).pipe(
          Effect.mapError((cause) => toJournalError("destroy", cause)),
          Effect.tap(() =>
            Effect.sync(() => {
              journal.length = 0;
              MutableHashMap.clear(byId);
              MutableHashMap.clear(remotes);
              MutableHashMap.clear(conflictIndex);
            })
          )
        )
      ),
    });
  });

/**
 * @since 0.0.0
 * @category DataAccess
 */
export const layerKeyValueStore = (options?: { readonly key?: string }) =>
  Layer.effect(EventJournal.EventJournal, make(options));

/**
 * @since 0.0.0
 * @category DataAccess
 */
export const withRemoteUncommitted = <A, E, R>(
  journal: ServiceMap.Service.Shape<typeof EventJournal.EventJournal>,
  remoteId: EventJournal.RemoteId,
  f: (entries: ReadonlyArray<EventJournal.Entry>) => Effect.Effect<A, E, R>
) => journal.withRemoteUncommited(remoteId, f);
