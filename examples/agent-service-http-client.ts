import { BunRuntime } from "@effect/platform-bun"
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import { Service } from "../src/index.js"

const program = Effect.gen(function*() {
  const client = yield* Service.makeHttpClientDefault({
    baseUrl: "http://localhost:3000"
  })

  const result = yield* client.query({
    payload: { prompt: "Explain Effect in one sentence." }
  })
  yield* Console.log(`Result: ${result.result}`)

  const stats = yield* client.stats()
  yield* Console.log(`Active queries: ${stats.active}`)
})

BunRuntime.runMain(program)
