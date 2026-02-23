/**
 * CRDT Sync Utility
 *
 * Manually syncs CRDTs between different data directories.
 * Run this to see CRDTs merge across processes.
 */

import * as Effect from "effect/Effect"
import * as Console from "effect/Console"
import * as Layer from "effect/Layer"
import * as KeyValueStore from "@effect/platform/KeyValueStore"
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem"
import * as BunPath from "@effect/platform-bun/BunPath"
import * as BunRuntime from "@effect/platform-bun/BunRuntime"
import * as PNCounter from "../src/PNCounter.js"
import * as Persistence from "../src/Persistence.js"
import { ReplicaId } from "../src/CRDT.js"

// No need for separate schema - we'll use the one from PNCounter module

// Load counter from directory
const loadCounter = (replicaName: string, dataDir: string) =>
  Effect.gen(function* () {
    const counter = yield* PNCounter.Tag
    const value = yield* PNCounter.value(counter)
    const state = yield* PNCounter.query(counter)

    return { counter, value, state }
  }).pipe(
    Effect.provide(
      PNCounter.withPersistence(ReplicaId(replicaName)).pipe(
        Layer.provide(Persistence.layer),
        Layer.provide(KeyValueStore.layerFileSystem(dataDir)),
        Layer.provide(Layer.mergeAll(BunFileSystem.layer, BunPath.layer))
      )
    )
  )

// Main sync program
const program = Effect.gen(function* () {
  yield* Console.log("")
  yield* Console.log("🔄 CRDT Sync Utility")
  yield* Console.log("=" .repeat(60))
  yield* Console.log("")

  // Get replicas to sync
  const replicas = [
    { name: "replica-1", dir: "./data/replica-1" },
    { name: "replica-2", dir: "./data/replica-2" },
    { name: "replica-3", dir: "./data/replica-3" }
  ]

  yield* Console.log("📊 Loading replicas...")
  yield* Console.log("")

  // Load all replicas
  const loaded = yield* Effect.forEach(replicas, ({ name, dir }) =>
    Effect.gen(function* () {
      const result = yield* loadCounter(name, dir)
      yield* Console.log(`  ${name.padEnd(12)} = ${result.value}`)
      return { name, dir, ...result }
    })
  )

  yield* Console.log("")
  yield* Console.log("🔀 Merging states...")
  yield* Console.log("")

  // Merge all states into each replica
  for (const replica of loaded) {
    for (const other of loaded) {
      if (replica.name !== other.name) {
        yield* PNCounter.merge(replica.counter, other.state)
      }
    }
  }

  // Show final values
  yield* Console.log("✅ Sync complete! Final values:")
  yield* Console.log("")

  for (const replica of loaded) {
    const finalValue = yield* PNCounter.value(replica.counter)
    yield* Console.log(`  ${replica.name.padEnd(12)} = ${finalValue}`)
  }

  yield* Console.log("")
  yield* Console.log("💾 Changes saved to disk")
  yield* Console.log("")
})

BunRuntime.runMain(program)
