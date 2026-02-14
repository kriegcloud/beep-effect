/**
 * KV Storage Backend Example (Workers-only)
 *
 * Shows how to use Cloudflare KV as the storage backend for
 * ChatHistoryStore, ArtifactStore, AuditEventStore, and SessionIndexStore.
 *
 * IMPORTANT: KV has a 1 write/sec/key limit and CANNOT be used
 * with storageMode 'journaled'. Only 'standard' mode is supported.
 * QuickConfig validates this at construction time.
 *
 * Requires a Worker with a KV namespace binding.
 * This file is a reference — it cannot run locally.
 */
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
import { AgentRuntime, Storage, runtimeLayer } from "../src/index.js"

type Env = {
  readonly ANTHROPIC_API_KEY: string
  readonly STORAGE: Storage.KVNamespace
}

export const handleRequest = (env: Env) => {
  const layer = runtimeLayer({
    apiKey: env.ANTHROPIC_API_KEY,
    model: "sonnet",
    storageBackend: "kv",
    storageMode: "standard", // 'journaled' is NOT supported with KV
    storageBindings: { kvNamespace: env.STORAGE },
    persistence: { directory: "agent-data" }
  })

  return Effect.runPromise(
    Effect.scoped(
      Effect.gen(function*() {
        const runtime = yield* AgentRuntime
        const handle = yield* runtime.query("Hello from KV-backed storage!")

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
