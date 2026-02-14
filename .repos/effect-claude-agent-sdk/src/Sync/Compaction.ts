import * as EventJournal from "@effect/experimental/EventJournal"
import * as Clock from "effect/Clock"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"

export type CompactionBracket = [
  ReadonlyArray<EventJournal.Entry>,
  ReadonlyArray<EventJournal.RemoteEntry>
]

export type CompactionStrategy = (
  entries: ReadonlyArray<EventJournal.RemoteEntry>
) => Effect.Effect<ReadonlyArray<CompactionBracket>>

const toBracket = (
  compacted: ReadonlyArray<EventJournal.RemoteEntry>,
  remoteEntries: ReadonlyArray<EventJournal.RemoteEntry> = compacted
): Array<CompactionBracket> => [
  [compacted.map((entry) => entry.entry), remoteEntries]
]

const toRemoteEntries = (entries: ReadonlyArray<EventJournal.Entry>) =>
  entries.map((entry, index) =>
    new EventJournal.RemoteEntry({
      remoteSequence: index + 1,
      entry
    })
  )

export const compactEntries = (
  strategy: CompactionStrategy,
  entries: ReadonlyArray<EventJournal.Entry>
) =>
  strategy(toRemoteEntries(entries)).pipe(
    Effect.map((brackets) => {
      const last = brackets[brackets.length - 1]
      return last ? last[0] : []
    })
  )

const estimateEntrySize = (entry: EventJournal.Entry) =>
  entry.payload.byteLength +
  entry.event.length +
  entry.primaryKey.length +
  entry.id.byteLength

export const Compaction = {
  byAge: (maxAge: Duration.DurationInput): CompactionStrategy => (entries) =>
    Effect.gen(function*() {
      const maxAgeMs = Duration.toMillis(maxAge)
      if (maxAgeMs <= 0) return toBracket([], entries)
      const now = yield* Clock.currentTimeMillis
      const cutoff = now - maxAgeMs
      const filtered = entries.filter((entry) => entry.entry.createdAtMillis >= cutoff)
      return toBracket(filtered, entries)
    }),

  byCount: (maxEntries: number): CompactionStrategy => (entries) =>
    Effect.sync(() => {
      if (maxEntries <= 0) return toBracket([], entries)
      if (entries.length <= maxEntries) return toBracket(entries, entries)
      return toBracket(entries.slice(entries.length - maxEntries), entries)
    }),

  bySize: (maxBytes: number): CompactionStrategy => (entries) =>
    Effect.sync(() => {
      if (maxBytes <= 0) return toBracket([], entries)
      let total = 0
      const kept: Array<EventJournal.RemoteEntry> = []
      for (let i = entries.length - 1; i >= 0; i -= 1) {
        const entry = entries[i]!
        const size = estimateEntrySize(entry.entry)
        if (total + size > maxBytes) break
        total += size
        kept.push(entry)
      }
      kept.reverse()
      return toBracket(kept, entries)
    }),

  composite: (...strategies: ReadonlyArray<CompactionStrategy>): CompactionStrategy => (entries) =>
    Effect.gen(function*() {
      let current = entries
      for (const strategy of strategies) {
        const brackets = yield* strategy(current)
        const next = brackets[brackets.length - 1]
        if (!next) {
          current = []
          continue
        }
        const compactedIds = new Set(next[0].map((entry) => entry.idString))
        current = current.filter((remoteEntry) => compactedIds.has(remoteEntry.entry.idString))
      }
      return toBracket(current, entries)
    })
}
