// Scratchpad for quick experiments
import { Console, Effect } from "effect";

const program = Effect.gen(function* () {
  yield* Console.log("Hello from scratchpad!");
});

Effect.runPromise(program);
