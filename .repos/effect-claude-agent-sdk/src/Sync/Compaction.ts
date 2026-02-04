import * as EventJournal from "@effect/experimental/EventJournal"
import * as Clock from "effect/Clock"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"

export type CompactionBracket = readonly [
  ReadonlyArray<EventJournal.Entry>,
  ReadonlyArray<EventJournal.RemoteEntry>
]

export type CompactionStrategy = (
  entries: ReadonlyArray<EventJournal.RemoteEntry>
) => Effect.Effect<ReadonlyArray<CompactionBracket>>

const toBracket = (entries: ReadonlyArray<EventJournal.RemoteEntry>): ReadonlyArray<CompactionBracket> => [
  [entries.map((entry) => entry.entry), entries]
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
      const first = brackets[0]
      return first ? first[0] : []
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
      if (maxAgeMs <= 0) return toBracket([])
      const now = yield* Clock.currentTimeMillis
      const cutoff = now - maxAgeMs
      const filtered = entries.filter((entry) => entry.entry.createdAtMillis >= cutoff)
      return toBracket(filtered)
    }),

  byCount: (maxEntries: number): CompactionStrategy => (entries) =>
    Effect.sync(() => {
      if (maxEntries <= 0) return toBracket([])
      if (entries.length <= maxEntries) return toBracket(entries)
      return toBracket(entries.slice(entries.length - maxEntries))
    }),

  bySize: (maxBytes: number): CompactionStrategy => (entries) =>
    Effect.sync(() => {
      if (maxBytes <= 0) return toBracket([])
      let total = 0
      const kept: Array<EventJournal.RemoteEntry> = []
      for (let i = entries.length - 1; i >= 0; i -= 1) {
        const entry = entries[i]!
        const size = estimateEntrySize(entry.entry)
        if (kept.length > 0 && total + size > maxBytes) break
        total += size
        kept.push(entry)
      }
      kept.reverse()
      return toBracket(kept)
    }),

  composite: (...strategies: ReadonlyArray<CompactionStrategy>): CompactionStrategy => (entries) =>
    Effect.gen(function*() {
      let current = entries
      for (const strategy of strategies) {
        const brackets = yield* strategy(current)
        const next = brackets[brackets.length - 1]
        current = next ? next[1] : []
      }
      return toBracket(current)
    })
}
