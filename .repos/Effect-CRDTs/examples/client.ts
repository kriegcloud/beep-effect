/**
 * CRDT Client
 *
 * Connects to sync server and demonstrates real persistence across processes.
 * Run multiple instances to see CRDTs sync across different processes.
 */

import * as Effect from "effect/Effect"
import * as Schedule from "effect/Schedule"
import * as Duration from "effect/Duration"
import * as Console from "effect/Console"
import * as Random from "effect/Random"
import * as Layer from "effect/Layer"
import * as KeyValueStore from "@effect/platform/KeyValueStore"
import * as HttpClient from "@effect/platform/HttpClient"
import * as HttpClientRequest from "@effect/platform/HttpClientRequest"
import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import * as BunRuntime from "@effect/platform-bun/BunRuntime"
import * as PNCounter from "../src/PNCounter.js"
import * as Persistence from "../src/Persistence.js"
import { ReplicaId } from "../src/CRDT.js"
import { BunContext } from "@effect/platform-bun"

// Get config from command line args
const getConfig = () => {
  const args = process.argv.slice(2)
  const replicaName = args[0] || "replica-1"
  const dataDir = args[1] || `./data/${replicaName}`
  const serverUrl = args[2] || "http://localhost:3001"

  return { replicaName, dataDir, serverUrl }
}

// Simulate activity
const simulateActivity = (counter: PNCounter.PNCounter) =>
  Effect.gen(function* () {
    const value = yield* Random.nextIntBetween(1, 10)
    const isIncrement = yield* Random.nextBoolean

    if (isIncrement) {
      yield* PNCounter.increment(counter, value)
      yield* Console.log(`  📈 +${value}`)
    } else {
      yield* PNCounter.decrement(counter, value)
      yield* Console.log(`  📉 -${value}`)
    }

    const currentValue = yield* PNCounter.value(counter)
    yield* Console.log(`  💰 Current value: ${currentValue}`)
  })

// Sync with server: push local state and pull/merge other states
const syncWithServer = (counter: PNCounter.PNCounter, replicaName: string, serverUrl: string) =>
  Effect.gen(function* () {
    yield* Console.log(`🔄 Syncing with server...`)

    const client = yield* HttpClient.HttpClient

    // Get our current state
    const state = yield* PNCounter.query(counter)

    // Push our state to the server
    const pushRequest = yield* HttpClientRequest.post(`${serverUrl}/sync`).pipe(
      HttpClientRequest.bodyJson({ replicaId: replicaName, state })
    )

    yield* client.execute(pushRequest).pipe(
      Effect.flatMap((response) => response.json),
      Effect.tap(() => Console.log(`  ✓ State pushed to server`)),
      Effect.catchAll((error) =>
        Console.log(`  ⚠️ Failed to sync: ${error}`).pipe(Effect.as(undefined))
      )
    )

    // TODO: Pull and merge states from other replicas
    // For now, the server just acknowledges
  })

// Main program
const program = Effect.gen(function* () {
  const { replicaName, dataDir, serverUrl } = getConfig()

  yield* Console.log("")
  yield* Console.log("=".repeat(60))
  yield* Console.log(`🚀 Starting CRDT Client: ${replicaName}`)
  yield* Console.log("=".repeat(60))
  yield* Console.log(`💾 Data directory: ${dataDir}`)
  yield* Console.log(`🆔 Replica ID: ${replicaName}`)
  yield* Console.log(`🌐 Server URL: ${serverUrl}`)
  yield* Console.log("")

  // Yield the counter from the service
  const counter = yield* PNCounter.Tag

  // Check if we have existing state
  const initialValue = yield* PNCounter.value(counter)
  yield* Console.log(`✅ Counter loaded: ${initialValue}`)
  yield* Console.log("")

  // Initial sync with server
  yield* syncWithServer(counter, replicaName, serverUrl)
  yield* Console.log("")

  // Run activity loop with periodic syncing
  yield* Console.log("🎯 Starting activity (syncs every 10 seconds, press Ctrl+C to stop)...")
  yield* Console.log("")

  let round = 1
  let syncCounter = 0

  yield* Effect.repeat(
    Effect.gen(function* () {
      yield* Console.log(`📍 Round ${round}:`)
      yield* simulateActivity(counter)

      // Sync every 3 rounds (approximately 10 seconds)
      syncCounter++
      if (syncCounter >= 3) {
        yield* syncWithServer(counter, replicaName, serverUrl)
        syncCounter = 0
      }

      yield* Console.log("")
      round++
    }),
    Schedule.spaced(Duration.seconds(3))
  )
})

// Run with all layers provided
const { replicaName, dataDir } = getConfig()



const persistenceLayer = Persistence.layer.pipe(
  Layer.provide(KeyValueStore.layerFileSystem(dataDir)),
  Layer.provide(BunContext.layer),
)

const counterLayer = PNCounter.withPersistence(ReplicaId(replicaName)).pipe(
  Layer.provide(persistenceLayer)
)

const appLayer = Layer.mergeAll(
  counterLayer,
  FetchHttpClient.layer
)

const runnable = program.pipe(
  Effect.provide(appLayer),
  Effect.catchAll((error) =>
    Console.log(`❌ Error: ${error}`)
  )
)

BunRuntime.runMain(runnable)
