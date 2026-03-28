import { Struct } from "@beep/utils";
import { Clock, Duration, Effect, HashSet } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as EventJournal from "effect/unstable/eventlog/EventJournal";

/**
 * @since 0.0.0
 * @category DomainLogic
 */
export type CompactionBracket = [ReadonlyArray<EventJournal.Entry>, ReadonlyArray<EventJournal.RemoteEntry>];

/**
 * @since 0.0.0
 * @category DomainLogic
 */
export type CompactionStrategy = (
  entries: ReadonlyArray<EventJournal.RemoteEntry>
) => Effect.Effect<ReadonlyArray<CompactionBracket>>;

const toBracket = (
  compacted: ReadonlyArray<EventJournal.RemoteEntry>,
  remoteEntries: ReadonlyArray<EventJournal.RemoteEntry> = compacted
): Array<CompactionBracket> => A.of([A.map(compacted, Struct.get("entry")), remoteEntries]);

const toRemoteEntries = (entries: ReadonlyArray<EventJournal.Entry>) =>
  A.map(
    entries,
    (entry, index) =>
      new EventJournal.RemoteEntry({
        remoteSequence: index + 1,
        entry,
      })
  );

/**
 * @since 0.0.0
 * @category DomainLogic
 */
export const compactEntries = (strategy: CompactionStrategy, entries: ReadonlyArray<EventJournal.Entry>) =>
  strategy(toRemoteEntries(entries)).pipe(
    Effect.map((brackets) => {
      const last = brackets[brackets.length - 1];
      return last === undefined ? A.empty() : last[0];
    })
  );

const estimateEntrySize = (entry: EventJournal.Entry) =>
  entry.payload.byteLength + entry.event.length + entry.primaryKey.length + entry.id.byteLength;

/**
 * @since 0.0.0
 * @category DomainLogic
 */
export const Compaction = {
  byAge: (maxAge: Duration.Input): CompactionStrategy =>
    Effect.fn("Compaction.byAge")(function* (entries) {
      const maxAgeDuration = Duration.fromInput(maxAge);
      if (O.isNone(maxAgeDuration)) return toBracket(A.empty(), entries);
      const maxAgeMs = Duration.toMillis(maxAgeDuration.value);
      if (maxAgeMs <= 0) return toBracket(A.empty(), entries);
      const now = yield* Clock.currentTimeMillis;
      const cutoff = now - maxAgeMs;
      const filtered = entries.filter((entry) => entry.entry.createdAtMillis >= cutoff);
      return toBracket(filtered, entries);
    }),

  byCount:
    (maxEntries: number): CompactionStrategy =>
    (entries) =>
      Effect.sync(() => {
        if (maxEntries <= 0) return toBracket(A.empty(), entries);
        if (entries.length <= maxEntries) return toBracket(entries, entries);
        return toBracket(entries.slice(entries.length - maxEntries), entries);
      }),

  bySize:
    (maxBytes: number): CompactionStrategy =>
    (entries) =>
      Effect.sync(() => {
        if (maxBytes <= 0) return toBracket(A.empty(), entries);
        let total = 0;
        const kept = A.empty<EventJournal.RemoteEntry>();
        for (let i = entries.length - 1; i >= 0; i -= 1) {
          const entry = entries[i]!;
          const size = estimateEntrySize(entry.entry);
          if (total + size > maxBytes) break;
          total += size;
          kept.push(entry);
        }
        kept.reverse();
        return toBracket(kept, entries);
      }),

  composite: (...strategies: ReadonlyArray<CompactionStrategy>): CompactionStrategy =>
    Effect.fn("Compaction.composite")(function* (entries) {
      let current = entries;
      for (const strategy of strategies) {
        const brackets = yield* strategy(current);
        const next = brackets[brackets.length - 1];
        if (next === undefined) {
          current = A.empty();
          continue;
        }
        const compactedIds = HashSet.fromIterable(A.map(next[0], Struct.get("idString")));
        current = A.filter(current, (remoteEntry) => HashSet.has(compactedIds, remoteEntry.entry.idString));
      }
      return toBracket(current, entries);
    }),
};
