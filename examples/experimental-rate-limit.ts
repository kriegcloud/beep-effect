import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { Experimental, Tools } from "../src/index.js"

const Echo = Tools.Tool.make("echo", {
  description: "Echo a string",
  parameters: {
    text: Schema.String
  },
  success: Schema.String
})

const handlers = {
  echo: ({ text }: { readonly text: string }) => Effect.succeed(text)
}

const limited = Experimental.RateLimiter.rateLimitHandlers(
  handlers,
  {
    limit: 5,
    window: "1 minute"
  },
  { keyPrefix: "tools" }
)

const program = Effect.gen(function*() {
  const result = yield* limited.echo({ text: "hello" })
  yield* Effect.log(result)
}).pipe(Effect.provide(Experimental.RateLimiter.layerMemory))

Effect.runPromise(program)
