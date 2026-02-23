import { testPattern } from "../../test/pattern-test-harness.ts"

testPattern({
  name: "effect-catchall-default",
  tag: "avoid-catchall-default",
  shouldMatch: [
    "Effect.catchAll(() => Effect.succeed(defaultValue))",
    "Effect.catchAll((_) => Effect.succeed(defaultUser))",
    "Effect.catchAll(e => Effect.succeed({}))",
    "Effect.catchAll(() => succeed(null))",
    "Effect.catchAll(_ => sync(() => defaultValue))",
    "pipe(effect, Effect.catchAll(() => Effect.succeed(0)))",
    "Effect.catchAll((error) => Effect.succeed(fallback))",
    "Effect.catchAll(() => Effect.sync(() => defaultUser))",
    "Effect.catchAll(() =>\n      Effect.succeed(defaultValue)\n    )",
    "Effect.catchAll((error) => succeed(fallback))",
    "Effect.catchAll(()=> Effect.succeed(null))",
  ],
  shouldNotMatch: [
    "Effect.catchTag('NotFound', () => Effect.succeed(default))",
    "Effect.catchAll(() => Effect.fail(error))",
    "Effect.catchAll(() => processError())",
    "catchAllDefect(() => Effect.succeed(default))",
    "effect.catchAll",
    "const catchAll = () => succeed(default)",
    "Effect.catchAll(() => pipe(log('error'), Effect.flatMap(() => Effect.fail(error))))",
    "catchTag('NotFound', () => createDefaultUser())",
    "Effect.catchAll(() => Effect.gen(function*() { yield* log('error'); return yield* Effect.fail(error) }))",
  ],
})
