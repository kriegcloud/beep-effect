/**
 * CRDT Sync Server
 *
 * HTTP server that syncs CRDT state across multiple clients.
 * Demonstrates real network synchronization between processes.
 */

import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as HttpServer from "@effect/platform/HttpServer"
import * as HttpRouter from "@effect/platform/HttpRouter"
import * as HttpServerResponse from "@effect/platform/HttpServerResponse"
import * as HttpServerRequest from "@effect/platform/HttpServerRequest"
import * as KeyValueStore from "@effect/platform/KeyValueStore"
import * as BunHttpServer from "@effect/platform-bun/BunHttpServer"
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem"
import * as BunPath from "@effect/platform-bun/BunPath"
import * as BunRuntime from "@effect/platform-bun/BunRuntime"
import * as Console from "effect/Console"
import { ReplicaId } from "../src/CRDT.js"
import { PNCounterState } from "../src/CRDTCounter.js"

// API routes
const router = HttpRouter.empty.pipe(
  // Health check
  HttpRouter.get("/health",
    Effect.succeed(HttpServerResponse.text("OK"))
  ),

  // Get counter state for a replica
  HttpRouter.get("/counter/:replicaId",
    Effect.gen(function* () {
      const params = yield* HttpRouter.params
      const replicaId = ReplicaId(params.replicaId!)

      const store = yield* KeyValueStore.KeyValueStore
      const schemaStore = store.forSchema(PNCounterState)
      const state = yield* schemaStore.get(replicaId)

      return yield* HttpServerResponse.json({
        replicaId,
        state
      })
    })
  ),

  // Update counter state for a replica
  HttpRouter.post("/counter/:replicaId",
    Effect.gen(function* () {
      const params = yield* HttpRouter.params
      const request = yield* HttpServerRequest.HttpServerRequest
      const body = yield* request.json

      const replicaId = ReplicaId(params.replicaId!)
      const state = body as PNCounterState

      const store = yield* KeyValueStore.KeyValueStore
      const schemaStore = store.forSchema(PNCounterState)
      yield* schemaStore.set(replicaId, state)

      yield* Console.log(`📥 Received state from ${replicaId}`)

      return yield* HttpServerResponse.json({ success: true })
    })
  ),

  // Sync: merge states from all replicas
  HttpRouter.post("/sync",
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest
      const body = yield* request.json

      const { replicaId, state } = body as { replicaId: string; state: PNCounterState }

      yield* Console.log(`🔄 Sync request from ${replicaId}`)

      const store = yield* KeyValueStore.KeyValueStore
      const schemaStore = store.forSchema(PNCounterState)
      yield* schemaStore.set(ReplicaId(replicaId), state)

      // TODO: Get all other replica states and return them for merging
      // For now, just acknowledge

      return yield* HttpServerResponse.json({
        success: true,
        message: "State synced"
      })
    })
  )
)

// Set up the application with logging
const app = router.pipe(
  HttpServer.serve(),
  HttpServer.withLogAddress
)

// Build the dependency layers in the correct order
// FileSystem layers are needed by KeyValueStore
const fileSystemLayers = Layer.mergeAll(BunFileSystem.layer, BunPath.layer)

const keyValueStoreLayer = KeyValueStore.layerFileSystem("./data/server").pipe(
  Layer.provide(fileSystemLayers)
)

// Combine all dependency layers
const dependencies = Layer.mergeAll(
  BunHttpServer.layer({ port: 3001 }),
  keyValueStoreLayer,
  fileSystemLayers
)

// Main program with startup messages
const program = Effect.gen(function* () {
  yield* Console.log("🚀 CRDT Sync Server starting...")
  yield* Console.log("")
  yield* Console.log("Available endpoints:")
  yield* Console.log("  GET  /health")
  yield* Console.log("  GET  /counter/:replicaId")
  yield* Console.log("  POST /counter/:replicaId")
  yield* Console.log("  POST /sync")
  yield* Console.log("")
  yield* Console.log("💾 Persistence: ./data/server/")
  yield* Console.log("")
}).pipe(Effect.provide(dependencies))

// Launch the server
BunRuntime.runMain(
  program.pipe(
    Effect.andThen(Layer.launch(Layer.provide(app, dependencies)))
  )
)
