import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import * as Fiber from "effect/Fiber"
import * as Stream from "effect/Stream"
import type { QuerySupervisorStats } from "../src/index.js"
import { AgentRuntime, runtimeLayer } from "../src/index.js"

const printStats = (label: string, s: QuerySupervisorStats) =>
  Console.log(
    `${label}: active=${s.active} pending=${s.pending} ` +
    `limit=${s.concurrencyLimit} queueCapacity=${s.pendingQueueCapacity} ` +
    `strategy=${s.pendingQueueStrategy}`
  )

const layer = runtimeLayer({
  model: "haiku",
  concurrency: 2,
  supervisor: {
    emitEvents: true,
    pendingQueueCapacity: 16,
    pendingQueueStrategy: "suspend"
  },
  persistence: "memory"
})

const program = Effect.scoped(
  Effect.gen(function*() {
    const runtime = yield* AgentRuntime

    const before = yield* runtime.stats
    yield* printStats("Stats before", before)
    yield* Console.log("")

    const eventFiber = yield* runtime.events.pipe(
      Stream.tap((event) =>
        Console.log(`[event] ${event._tag}: queryId=${event.queryId}`)
      ),
      Stream.runDrain,
      Effect.forkScoped
    )

    const prompts = [
      "What is 2+2? Reply with just the number.",
      "What is 3+3? Reply with just the number.",
      "What is 4+4? Reply with just the number."
    ] as const

    const handles = yield* Effect.forEach(
      prompts,
      (prompt) => runtime.query(prompt),
      { concurrency: "unbounded" }
    )

    yield* Effect.forEach(
      handles,
      (handle) => handle.stream.pipe(Stream.runDrain),
      { concurrency: "unbounded", discard: true }
    )

    const after = yield* runtime.stats
    yield* Console.log("")
    yield* printStats("Stats after", after)

    yield* Effect.sleep("200 millis")
    yield* Fiber.interrupt(eventFiber)
  }).pipe(Effect.provide(layer))
)

Effect.runPromise(program).then(
  () => console.log("\nDone."),
  (err) => console.error("Failed:", err)
)
