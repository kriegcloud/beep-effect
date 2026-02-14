/**
 * QuickConfig Deployment Profiles
 *
 * Shows three progressive configuration levels using `runtimeLayer()`:
 *
 *   1. Minimal — just a model override (everything else defaults)
 *   2. Filesystem persistence — session data written to disk
 *   3. Full profile — storage backend, mode, concurrency, and timeout
 *
 * Run: bun examples/09-quick-config.ts
 */
import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
import { AgentRuntime, runtimeLayer } from "../src/index.js"

// ---------------------------------------------------------------------------
// Level 1 – Minimal
// Only overrides the model; persistence defaults to in-memory,
// concurrency to 4, and timeout to 5 minutes.
// ---------------------------------------------------------------------------
const _minimal = runtimeLayer({ model: "sonnet" })

// ---------------------------------------------------------------------------
// Level 2 – Filesystem persistence
// Sessions, chat history, and artifacts are written to `.agent-data/`.
// ---------------------------------------------------------------------------
const _withPersistence = runtimeLayer({
  model: "sonnet",
  persistence: { directory: ".agent-data" },
  concurrency: 2
})

// ---------------------------------------------------------------------------
// Level 3 – Full deployment profile
// Explicit storage backend, journaling mode, higher concurrency, and
// a tighter timeout. This is the configuration we actually run below.
// ---------------------------------------------------------------------------
const fullProfile = runtimeLayer({
  model: "sonnet",
  persistence: { directory: ".agent-data" },
  storageBackend: "filesystem",
  storageMode: "journaled",
  concurrency: 4,
  timeout: "2 minutes"
})

// ---------------------------------------------------------------------------
// Program
// ---------------------------------------------------------------------------
const program = Effect.scoped(
  Effect.gen(function*() {
    const runtime = yield* AgentRuntime

    const handle = yield* runtime.query(
      "What are the three most popular programming languages? Be concise."
    )

    yield* handle.stream.pipe(
      Stream.filter((msg) => msg.type === "assistant"),
      Stream.runForEach((msg) =>
        Effect.sync(() => {
          const content = "content" in msg ? msg.content : ""
          process.stdout.write(String(content))
        })
      )
    )

    console.log("\n")
  }).pipe(Effect.provide(fullProfile))
)

Effect.runPromise(program).then(
  () => console.log("Done."),
  (err) => console.error("Failed:", err)
)
