import { EmbeddingRateLimitError } from "@beep/knowledge-domain/errors";
import { EmbeddingRateLimiter, makeEmbeddingRateLimiter } from "@beep/knowledge-server/EmbeddingRateLimiter";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as Deferred from "effect/Deferred";
import * as Effect from "effect/Effect";
import * as Fiber from "effect/Fiber";

type AcquireResult = { readonly _tag: "Right" } | { readonly _tag: "Left"; readonly error: EmbeddingRateLimitError };

const isRight = (r: AcquireResult): r is Extract<AcquireResult, { _tag: "Right" }> => r._tag === "Right";
const isLeft = (r: AcquireResult): r is Extract<AcquireResult, { _tag: "Left" }> => r._tag === "Left";

describe("EmbeddingRateLimiter", () => {
  effect(
    "enforces RPM atomically under concurrency",
    Effect.fn(
      function* () {
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

        const r1: AcquireResult = yield* Fiber.join(f1);
        const r2: AcquireResult = yield* Fiber.join(f2);

        const results = [r1, r2] as const;
        const successes = results.filter(isRight);
        const failures = results.filter(isLeft);

        strictEqual(successes.length, 1);
        strictEqual(failures.length, 1);

        const error = failures[0]!.error;
        assertTrue(error instanceof EmbeddingRateLimitError);
        strictEqual(error.provider, "test");
        assertTrue(typeof error.retryAfterMs === "number" && error.retryAfterMs > 0 && error.retryAfterMs <= 60_000);
      },
      Effect.provide(makeEmbeddingRateLimiter({ provider: "test", requestsPerMinute: 1, maxConcurrent: 10 }))
    )
  );
});
