import { EmbeddingRateLimitError } from "@beep/knowledge-domain/errors";
import { EmbeddingRateLimiter, makeEmbeddingRateLimiter } from "@beep/knowledge-server/EmbeddingRateLimiter";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as Deferred from "effect/Deferred";
import * as Effect from "effect/Effect";
import * as Fiber from "effect/Fiber";

describe("EmbeddingRateLimiter", () => {
  effect(
    "enforces RPM atomically under concurrency",
    Effect.fn(function* () {
      const limiter = yield* EmbeddingRateLimiter;
      const start = yield* Deferred.make<void>();

      const attemptAcquire = Deferred.await(start).pipe(
        Effect.zipRight(
          limiter.acquire().pipe(
            Effect.matchEffect({
              onFailure: (error) => Effect.succeed({ _tag: "Left" as const, error }),
              onSuccess: () => limiter.release().pipe(Effect.as({ _tag: "Right" as const })),
            })
          )
        )
      );

      const f1 = yield* Effect.fork(attemptAcquire);
      const f2 = yield* Effect.fork(attemptAcquire);
      yield* Deferred.succeed(start, undefined);

      const r1 = yield* Fiber.join(f1);
      const r2 = yield* Fiber.join(f2);

      const results = [r1, r2] as const;
      const successes = results.filter((r) => r._tag === "Right");
      const failures = results.filter((r) => r._tag === "Left");

      strictEqual(successes.length, 1);
      strictEqual(failures.length, 1);

      const error = failures[0]!.error;
      assertTrue(error instanceof EmbeddingRateLimitError);
      strictEqual(error.provider, "test");
      assertTrue(typeof error.retryAfterMs === "number" && error.retryAfterMs > 0 && error.retryAfterMs <= 60_000);
    }, Effect.provide(makeEmbeddingRateLimiter({ provider: "test", requestsPerMinute: 1, maxConcurrent: 10 })))
  );
});
