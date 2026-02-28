import * as RateLimiter from "@beep/ai-sdk/experimental/RateLimiter";
import { expect, test } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Result from "effect/Result";

test("RateLimiter.rateLimitHandler fails when limit exceeded", async () => {
  const handler = RateLimiter.rateLimitHandler((value: string) => Effect.succeed(value), {
    key: RateLimiter.keyForTool("echo"),
    limit: 1,
    window: "1 hour",
    onExceeded: "fail",
  });

  const program = Effect.gen(function* () {
    yield* handler("first");
    return yield* Effect.result(handler("second"));
  }).pipe(Effect.provide(RateLimiter.layerMemory));

  const result = await Effect.runPromise(program);
  expect(Result.isFailure(result)).toBe(true);
  if (Result.isFailure(result)) {
    expect(result.failure._tag).toBe("RateLimiterError");
    expect(result.failure.reason).toBe("Exceeded");
  }
});

test("RateLimiter.rateLimitHandlers scopes limits per handler name", async () => {
  const handlers = {
    alpha: (_: void) => Effect.succeed("alpha"),
    beta: (_: void) => Effect.succeed("beta"),
  };

  const limited = RateLimiter.rateLimitHandlers(
    handlers,
    {
      limit: 1,
      window: "1 hour",
      onExceeded: "fail",
    },
    { keyPrefix: "tools" }
  );

  const program = Effect.gen(function* () {
    yield* limited.alpha(undefined);
    const second = yield* Effect.result(limited.alpha(undefined));
    const beta = yield* limited.beta(undefined);
    return { second, beta };
  }).pipe(Effect.provide(RateLimiter.layerMemory));

  const result = await Effect.runPromise(program);
  expect(result.beta).toBe("beta");
  expect(Result.isFailure(result.second)).toBe(true);
});
