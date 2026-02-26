import { expect, test } from "bun:test"
import * as EventJournal from "@effect/experimental/EventJournal"
import * as EventLog from "@effect/experimental/EventLog"
import * as EventLogEncryption from "@effect/experimental/EventLogEncryption"
import { KeyValueStore } from "@effect/platform"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { runEffect } from "./effect-test.js"
import { Sync } from "../src/index.js"

test("SyncService.layer builds without WebSocketConstructor", async () => {
  const eventLogLayer = EventLog.layerEventLog.pipe(
    Layer.provide(EventJournal.layerMemory),
    Layer.provide(EventLog.layerIdentityKvs({ key: "sync-test-identity" })),
    Layer.provide(KeyValueStore.layerMemory)
  )

  const layer = Sync.SyncService.layer.pipe(
    Layer.provide(eventLogLayer),
    Layer.provide(EventLogEncryption.layerSubtle)
  )

  const statuses = await runEffect(
    Effect.scoped(
      Effect.gen(function*() {
        const context = yield* Layer.build(layer)
        const service = Context.get(context, Sync.SyncService)
        return yield* service.status()
      })
    )
  )

  expect(statuses).toEqual([])
})
