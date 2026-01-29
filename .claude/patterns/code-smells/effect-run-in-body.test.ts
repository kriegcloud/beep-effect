import { testPattern } from "../../test/pattern-test-harness.ts"

testPattern({
  name: "effect-run-in-body",
  tag: "effect-run-in-body",
  shouldMatch: [
    "Effect.runSync(effect)",
    "Effect.runPromise(effect)",
    "const result = Effect.runSync(getUser())",
    "await Effect.runPromise(fetchData())",
    "Effect.runSync(program)",
    "Effect.runPromise(workflow)",
    "return Effect.runSync(computation)",
    "const value = Effect.runSync(Effect.succeed(42))",
    "pipe(someEffect, Effect.runSync)",
    "Effect.runSync(\n      Effect.gen(function* () {\n        yield* doSomething\n      })\n    )",
  ],
  shouldNotMatch: [
    "effectRunSync(program)",
    "runSync(effect)",
    "Effect.run(program)",
    "yield* someEffect",
    "const effect = createEffect()",
    "Effect.gen(function* () { yield* myEffect })",
    "pipe(effect1, Effect.flatMap(effect2))",
    "function runSync() {}",
    "function runPromise() {}",
  ],
})
