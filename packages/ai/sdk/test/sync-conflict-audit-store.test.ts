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

test("SyncAuditEventStore records conflict events", async () => {
  const auditLayer = Storage.AuditEventStore.layerMemory
  const syncAuditLayer = Sync.layerAuditEventStore.pipe(
    Layer.provide(auditLayer)
  )
  const journalLayer = Storage.layerKeyValueStore().pipe(
    Layer.provide(KeyValueStore.layerMemory)
  )

  const layer = Layer.mergeAll(
    journalLayer,
    Sync.ConflictPolicy.layerReject("reject"),
    syncAuditLayer,
    auditLayer
  )

  const entries = await runEffect(
    Effect.gen(function*() {
      const journal = yield* EventJournal.EventJournal
      const audit = yield* Storage.AuditEventStore
      const remoteId = EventJournal.makeRemoteId()
      const first = makeEntry(1000, "first")
      const second = makeEntry(2000, "second")

      yield* journal.writeFromRemote({
        remoteId,
        entries: [
          new EventJournal.RemoteEntry({
            remoteSequence: 1,
            entry: first
          })
        ],
        effect: () => Effect.void
      })

      yield* journal.writeFromRemote({
        remoteId,
        entries: [
          new EventJournal.RemoteEntry({
            remoteSequence: 2,
            entry: second
          })
        ],
        effect: () => Effect.void
      })

      return yield* audit.entries
    }).pipe(Effect.provide(layer))
  )

  expect(entries.some((entry) => entry.event === "sync_conflict")).toBe(true)
})
