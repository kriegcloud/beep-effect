import { CircuitOpenError } from "@beep/knowledge-domain/errors";
import { CentralRateLimiterServiceTest } from "@beep/knowledge-server/LlmControl";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as AiError from "@effect/ai/AiError";
import type * as EmbeddingModel from "@effect/ai/EmbeddingModel";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as Ref from "effect/Ref";
import { EmbeddingError } from "../../src/Embedding/EmbeddingProvider";
import { withEmbeddingResilienceWithFallback } from "../../src/Embedding/EmbeddingResilience";

describe("Embedding resilience fallback", () => {
  effect(
    "falls back to backup model on terminal primary failure",
    Effect.fn(
      function* () {
        const primaryCalls = yield* Ref.make(0);
        const fallbackCalls = yield* Ref.make(0);

        const primary: EmbeddingModel.Service = {
          embed: () =>
            Effect.gen(function* () {
              yield* Ref.update(primaryCalls, (n) => n + 1);
              return yield* new AiError.HttpRequestError({
                module: "EmbeddingFallbackTest",
                method: "embed",
                reason: "Transport",
                request: {
                  method: "POST",
                  url: "http://example.invalid",
                  urlParams: [],
                  hash: O.none(),
                  headers: {},
                },
              });
            }),
          embedMany: () => Effect.succeed([]),
        };

        const fallback: EmbeddingModel.Service = {
          embed: () =>
            Effect.gen(function* () {
              yield* Ref.update(fallbackCalls, (n) => n + 1);
              return [1, 2, 3] as const;
            }),
          embedMany: () => Effect.succeed([]),
        };

        const mapToNonRetryableEmbeddingError = (error: AiError.AiError) =>
          new EmbeddingError({
            message: error.message,
            provider: "primary",
            retryable: false,
          });

        const result = yield* withEmbeddingResilienceWithFallback(
          primary,
          O.some(fallback),
          (m: EmbeddingModel.Service) => m.embed("hello").pipe(Effect.mapError(mapToNonRetryableEmbeddingError)),
          {
            estimatedTokens: 10,
            maxRetries: 0,
          }
        );

        strictEqual(result.length, 3);
        strictEqual(result[0], 1);

        strictEqual(yield* Ref.get(primaryCalls), 1);
        strictEqual(yield* Ref.get(fallbackCalls), 1);
      },
      Effect.provide(CentralRateLimiterServiceTest({ requestsPerMinute: 10_000, tokensPerMinute: 10_000_000 }))
    )
  );

  effect(
    "does not trigger fallback when primary succeeds",
    Effect.fn(
      function* () {
        const primaryCalls = yield* Ref.make(0);
        const fallbackCalls = yield* Ref.make(0);

        const primary: EmbeddingModel.Service = {
          embed: () =>
            Effect.gen(function* () {
              yield* Ref.update(primaryCalls, (n) => n + 1);
              return [9, 9, 9] as const;
            }),
          embedMany: () => Effect.succeed([]),
        };

        const fallback: EmbeddingModel.Service = {
          embed: () =>
            Effect.gen(function* () {
              yield* Ref.update(fallbackCalls, (n) => n + 1);
              return [1, 2, 3] as const;
            }),
          embedMany: () => Effect.succeed([]),
        };

        const result = yield* withEmbeddingResilienceWithFallback(
          primary,
          O.some(fallback),
          (m: EmbeddingModel.Service) => m.embed("ok"),
          {
            estimatedTokens: 10,
            maxRetries: 0,
          }
        );

        strictEqual(result[0], 9);
        strictEqual(yield* Ref.get(primaryCalls), 1);
        strictEqual(yield* Ref.get(fallbackCalls), 0);
      },
      Effect.provide(CentralRateLimiterServiceTest({ requestsPerMinute: 10_000, tokensPerMinute: 10_000_000 }))
    )
  );

  effect(
    "retries primary on retryable error and succeeds without fallback",
    Effect.fn(
      function* () {
        const primaryCalls = yield* Ref.make(0);
        const fallbackCalls = yield* Ref.make(0);

        const primary: EmbeddingModel.Service = {
          embed: () =>
            Effect.gen(function* () {
              const call = yield* Ref.updateAndGet(primaryCalls, (n) => n + 1);
              if (call === 1) {
                return yield* new AiError.HttpRequestError({
                  module: "EmbeddingFallbackTest",
                  method: "embed",
                  reason: "Transport",
                  request: {
                    method: "POST",
                    url: "http://example.invalid",
                    urlParams: [],
                    hash: O.none(),
                    headers: {},
                  },
                });
              }
              return [4, 5, 6] as const;
            }),
          embedMany: () => Effect.succeed([]),
        };

        const fallback: EmbeddingModel.Service = {
          embed: () =>
            Effect.gen(function* () {
              yield* Ref.update(fallbackCalls, (n) => n + 1);
              return [1, 2, 3] as const;
            }),
          embedMany: () => Effect.succeed([]),
        };

        const mapToRetryableEmbeddingError = (error: AiError.AiError) =>
          new EmbeddingError({
            message: error.message,
            provider: "primary",
            retryable: error._tag === "HttpRequestError" || error._tag === "HttpResponseError",
          });

        const result = yield* withEmbeddingResilienceWithFallback(
          primary,
          O.some(fallback),
          (m: EmbeddingModel.Service) => m.embed("retry").pipe(Effect.mapError(mapToRetryableEmbeddingError)),
          {
            estimatedTokens: 10,
            maxRetries: 2,
            // Tests run on Effect's TestClock, so non-zero sleeps can hang unless we adjust time.
            baseRetryDelay: Duration.zero,
          }
        );

        strictEqual(result[0], 4);
        strictEqual(yield* Ref.get(primaryCalls), 2);
        strictEqual(yield* Ref.get(fallbackCalls), 0);
      },
      Effect.provide(CentralRateLimiterServiceTest({ requestsPerMinute: 10_000, tokensPerMinute: 10_000_000 }))
    )
  );

  effect(
    "does not fall back on central circuit open errors",
    Effect.fn(
      function* () {
        const primaryCalls = yield* Ref.make(0);
        const fallbackCalls = yield* Ref.make(0);

        const primary: EmbeddingModel.Service = {
          embed: () =>
            Effect.gen(function* () {
              yield* Ref.update(primaryCalls, (n) => n + 1);
              return yield* new AiError.HttpRequestError({
                module: "EmbeddingFallbackTest",
                method: "embed",
                reason: "Transport",
                request: {
                  method: "POST",
                  url: "http://example.invalid",
                  urlParams: [],
                  hash: O.none(),
                  headers: {},
                },
              });
            }),
          embedMany: () => Effect.succeed([]),
        };

        const fallback: EmbeddingModel.Service = {
          embed: () =>
            Effect.gen(function* () {
              yield* Ref.update(fallbackCalls, (n) => n + 1);
              return [1, 2, 3] as const;
            }),
          embedMany: () => Effect.succeed([]),
        };

        const mapToNonRetryableEmbeddingError = (error: AiError.AiError) =>
          new EmbeddingError({
            message: error.message,
            provider: "primary",
            retryable: false,
          });

        // First call fails and opens the central circuit.
        yield* withEmbeddingResilienceWithFallback(
          primary,
          O.some(fallback),
          (m: EmbeddingModel.Service) => m.embed("boom").pipe(Effect.mapError(mapToNonRetryableEmbeddingError)),
          {
            estimatedTokens: 10,
            maxRetries: 0,
          }
        ).pipe(Effect.either);

        // Second call should fail fast with CircuitOpenError before hitting the embedding model.
        const result = yield* withEmbeddingResilienceWithFallback(
          primary,
          O.some(fallback),
          (m: EmbeddingModel.Service) => m.embed("boom2").pipe(Effect.mapError(mapToNonRetryableEmbeddingError)),
          {
            estimatedTokens: 10,
            maxRetries: 0,
          }
        ).pipe(Effect.either);

        assertTrue(result._tag === "Left");
        assertTrue(result.left instanceof CircuitOpenError);
        strictEqual(yield* Ref.get(primaryCalls), 1);
        strictEqual(yield* Ref.get(fallbackCalls), 0);
      },
      Effect.provide(
        CentralRateLimiterServiceTest({
          requestsPerMinute: 10_000,
          tokensPerMinute: 10_000_000,
          failureThreshold: 1,
          recoveryTimeoutMs: Duration.millis(60_000),
        })
      )
    )
  );
});
