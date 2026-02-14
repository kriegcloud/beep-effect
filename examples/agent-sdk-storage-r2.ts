/**
 * R2 Storage Backend Example (Workers-only)
 *
 * Shows how to use Cloudflare R2 as the storage backend for
 * ChatHistoryStore, ArtifactStore, AuditEventStore, and SessionIndexStore.
 *
 * R2 supports both 'standard' and 'journaled' storage modes.
 * Objects are stored under the `persistence.directory` prefix
 * inside the R2 bucket.
 *
 * Requires a Worker with an R2 bucket binding.
 * This file is a reference — it cannot run locally.
 */
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
import { AgentRuntime, Storage, runtimeLayer } from "../src/index.js"

type Env = {
  readonly ANTHROPIC_API_KEY: string
  readonly STORAGE: Storage.R2Bucket
}

export const handleRequest = (env: Env) => {
  const layer = runtimeLayer({
    apiKey: env.ANTHROPIC_API_KEY,
    model: "sonnet",
    storageBackend: "r2",
    storageMode: "standard",
    storageBindings: { r2Bucket: env.STORAGE },
    persistence: { directory: "agent-data" }
  })

  return Effect.runPromise(
    Effect.scoped(
      Effect.gen(function*() {
        const runtime = yield* AgentRuntime
        const handle = yield* runtime.query("Hello from R2-backed storage!")

        yield* handle.stream.pipe(
          Stream.filter((msg) => msg.type === "result"),
          Stream.runForEach((msg) =>
            Console.log(`Result: ${msg.subtype}`)
          )
        )
      }).pipe(Effect.provide(layer))
    )
  )
}
