import { test, expect } from "bun:test"
import * as Effect from "effect/Effect"
import * as Either from "effect/Either"
import * as RateLimiter from "../src/experimental/RateLimiter.js"

test("RateLimiter.rateLimitHandler fails when limit exceeded", async () => {
  const handler = RateLimiter.rateLimitHandler(
    (value: string) => Effect.succeed(value),
    {
      key: RateLimiter.keyForTool("echo"),
      limit: 1,
      window: "1 hour",
      onExceeded: "fail"
    }
  )

  const program = Effect.gen(function*() {
    yield* handler("first")
    return yield* Effect.either(handler("second"))
  }).pipe(Effect.provide(RateLimiter.layerMemory))

  const result = await Effect.runPromise(program)
  expect(Either.isLeft(result)).toBe(true)
  if (Either.isLeft(result)) {
    expect(result.left._tag).toBe("RateLimiterError")
    expect(result.left.reason).toBe("Exceeded")
  }
})

test("RateLimiter.rateLimitHandlers scopes limits per handler name", async () => {
  const handlers = {
    alpha: (_: void) => Effect.succeed("alpha"),
    beta: (_: void) => Effect.succeed("beta")
  }

  const limited = RateLimiter.rateLimitHandlers(
    handlers,
    {
      limit: 1,
      window: "1 hour",
      onExceeded: "fail"
    },
    { keyPrefix: "tools" }
  )

  const program = Effect.gen(function*() {
    yield* limited.alpha(undefined)
    const second = yield* Effect.either(limited.alpha(undefined))
    const beta = yield* limited.beta(undefined)
    return { second, beta }
  }).pipe(Effect.provide(RateLimiter.layerMemory))

  const result = await Effect.runPromise(program)
  expect(result.beta).toBe("beta")
  expect(Either.isLeft(result.second)).toBe(true)
})
