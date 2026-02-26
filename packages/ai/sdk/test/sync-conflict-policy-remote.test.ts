import { expect, test } from "bun:test"
import * as EventJournal from "@effect/experimental/EventJournal"
import { KeyValueStore } from "@effect/platform"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { runEffect } from "./effect-test.js"
import { Storage, Sync } from "../src/index.js"

const makeEntry = (msecs: number, label: string) =>
  new EventJournal.Entry({
    id: EventJournal.makeEntryId({ msecs }),
    event: "event-conflict",
    primaryKey: "pk",
    payload: new TextEncoder().encode(label)
  })

const writeConflict = (
  layer: Layer.Layer<Sync.ConflictPolicy>,
  order: "ascending" | "descending" = "ascending"
) =>
  runEffect(
    Effect.gen(function*() {
      const journal = yield* EventJournal.EventJournal
      const remoteId = EventJournal.makeRemoteId()
      const first = makeEntry(1000, "first")
      const second = makeEntry(2000, "second")

      const ordered =
        order === "ascending"
          ? [first, second]
          : [second, first]

      for (const [index, entry] of ordered.entries()) {
        yield* journal.writeFromRemote({
          remoteId,
          entries: [
            new EventJournal.RemoteEntry({
              remoteSequence: index + 1,
              entry
            })
          ],
          effect: () => Effect.void
        })
      }

      return yield* journal.entries
    }).pipe(
      Effect.provide(
        Layer.mergeAll(
          Storage.layerKeyValueStore().pipe(
            Layer.provide(KeyValueStore.layerMemory)
          ),
          layer
        )
      )
    )
  )

test("ConflictPolicy.lastWriteWins applies during remote writes", async () => {
  const entries = await writeConflict(Sync.ConflictPolicy.layerLastWriteWins, "descending")
  expect(entries).toHaveLength(1)
  expect(entries[0]?.payload).toBeDefined()
  expect(new TextDecoder().decode(entries[0]!.payload)).toBe("second")
})

test("ConflictPolicy.firstWriteWins applies during remote writes", async () => {
  const entries = await writeConflict(Sync.ConflictPolicy.layerFirstWriteWins)
  expect(entries).toHaveLength(1)
  expect(new TextDecoder().decode(entries[0]!.payload)).toBe("first")
})

test("ConflictPolicy.merge applies during remote writes", async () => {
  const entries = await writeConflict(
    Sync.ConflictPolicy.layerMerge((_entry, conflicts) => conflicts[0] ?? _entry)
  )
  expect(entries).toHaveLength(1)
  expect(new TextDecoder().decode(entries[0]!.payload)).toBe("first")
})
