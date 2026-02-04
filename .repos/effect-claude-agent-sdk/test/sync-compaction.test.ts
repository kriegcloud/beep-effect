import { expect, test } from "bun:test"
import * as EventJournal from "@effect/experimental/EventJournal"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as TestClock from "effect/TestClock"
import { runEffect } from "./effect-test.js"
import { Sync } from "../src/index.js"

const makeEntry = (
  msecs: number,
  options?: {
    readonly event?: string
    readonly primaryKey?: string
    readonly payload?: Uint8Array
  }
) =>
  new EventJournal.Entry({
    id: EventJournal.makeEntryId({ msecs }),
    event: options?.event ?? "event",
    primaryKey: options?.primaryKey ?? "pk",
    payload: options?.payload ?? new TextEncoder().encode(`payload-${msecs}`)
  })

const makeRemoteEntry = (sequence: number, msecs: number, payloadSize = 4) => {
  const payload = new Uint8Array(payloadSize)
  const entry = makeEntry(msecs, { payload })
  return new EventJournal.RemoteEntry({ remoteSequence: sequence, entry })
}

const entrySize = (entry: EventJournal.Entry) =>
  entry.payload.byteLength + entry.event.length + entry.primaryKey.length + entry.id.byteLength

const extractEntries = (brackets: ReadonlyArray<Sync.CompactionBracket>) => {
  const first = brackets[0]
  return first ? first[1] : []
}

test("Compaction.byAge keeps entries within max age", async () => {
  const entries = [
    makeRemoteEntry(1, 1000),
    makeRemoteEntry(2, 6000),
    makeRemoteEntry(3, 9000)
  ]

  const program = Effect.gen(function*() {
    yield* TestClock.adjust("10 seconds")
    const brackets = yield* Sync.Compaction.byAge(Duration.seconds(5))(entries)
    return extractEntries(brackets)
  })

  const kept = await runEffect(program)
  expect(kept.map((entry) => entry.entry.createdAtMillis)).toEqual([6000, 9000])
})

test("Compaction.byCount keeps the latest entries", async () => {
  const entries = [
    makeRemoteEntry(1, 1000),
    makeRemoteEntry(2, 2000),
    makeRemoteEntry(3, 3000),
    makeRemoteEntry(4, 4000),
    makeRemoteEntry(5, 5000)
  ]

  const kept = await runEffect(
    Sync.Compaction.byCount(2)(entries).pipe(
      Effect.map(extractEntries)
    )
  )

  expect(kept.map((entry) => entry.entry.createdAtMillis)).toEqual([4000, 5000])
})

test("Compaction.bySize trims to the most recent entries within the limit", async () => {
  const entries = [
    makeRemoteEntry(1, 1000, 4),
    makeRemoteEntry(2, 2000, 8),
    makeRemoteEntry(3, 3000, 12)
  ]

  const last = entries[2]!.entry
  const secondLast = entries[1]!.entry
  const maxBytes = entrySize(last) + entrySize(secondLast) - 1

  const kept = await runEffect(
    Sync.Compaction.bySize(maxBytes)(entries).pipe(
      Effect.map(extractEntries)
    )
  )

  expect(kept.map((entry) => entry.entry.createdAtMillis)).toEqual([3000])
})

test("Compaction.composite applies strategies in order", async () => {
  const entries = [
    makeRemoteEntry(1, 1000, 2),
    makeRemoteEntry(2, 2000, 2),
    makeRemoteEntry(3, 3000, 2),
    makeRemoteEntry(4, 4000, 20),
    makeRemoteEntry(5, 5000, 20)
  ]

  const last = entries[4]!.entry
  const secondLast = entries[3]!.entry
  const maxBytes = entrySize(last) + entrySize(secondLast)

  const kept = await runEffect(
    Sync.Compaction.composite(
      Sync.Compaction.byCount(4),
      Sync.Compaction.bySize(maxBytes)
    )(entries).pipe(
      Effect.map(extractEntries)
    )
  )

  expect(kept.map((entry) => entry.entry.createdAtMillis)).toEqual([4000, 5000])
})
