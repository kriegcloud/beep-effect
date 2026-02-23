// Scratchpad for quick experiments
import { Effect, Console } from "effect"

const program = Effect.gen(function* () {
  yield* Console.log("Hello from scratchpad!")
})

Effect.runPromise(program)
