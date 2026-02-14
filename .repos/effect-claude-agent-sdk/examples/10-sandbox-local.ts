import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
import { AgentRuntime, Sandbox, runtimeLayer } from "../src/index.js"

const layer = runtimeLayer({
  model: "sonnet",
  sandbox: "local",
  persistence: "memory"
})

const program = Effect.scoped(
  Effect.gen(function*() {
    const sandbox = yield* Sandbox.SandboxService
    yield* Console.log(`Provider: ${sandbox.provider}, Isolated: ${sandbox.isolated}`)

    const result = yield* sandbox.exec("echo", ["hello", "from", "sandbox"])
    yield* Console.log(`exec stdout: ${result.stdout.trim()}`)

    yield* sandbox.writeFile("/tmp/demo.txt", "sandbox payload")
    const content = yield* sandbox.readFile("/tmp/demo.txt")
    yield* Console.log(`readFile: ${content}`)

    const runtime = yield* AgentRuntime
    const handle = yield* runtime.query("What is 1+1? Reply with just the number.")
    yield* handle.stream.pipe(
      Stream.filter((msg) => msg.type === "result"),
      Stream.runForEach((msg) =>
        Console.log(`Result: ${msg.subtype}`)
      )
    )
  }).pipe(Effect.provide(layer))
)

Effect.runPromise(program).then(
  () => console.log("\nDone."),
  (err) => console.error("Failed:", err)
)
