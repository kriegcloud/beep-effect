import { BunRuntime } from "@effect/platform-bun"
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
import { Service } from "../src/index.js"

const program = Effect.scoped(
  Effect.gen(function*() {
    const client = yield* Service.makeRpcClient({
      url: "http://localhost:3000/rpc"
    })

    const result = yield* client.QueryResult({
      prompt: "Summarize the changelog."
    })
    yield* Console.log(`Result: ${result.result}`)

    const stream = client.QueryStream({
      prompt: "Stream a short haiku about code."
    })
    const messages = yield* Stream.runCollect(stream)
    yield* Console.log(`Streamed ${messages.length} messages`)
  })
)

BunRuntime.runMain(program)
