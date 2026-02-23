import { $KnowledgeServerId } from "@beep/identity/packages";
import { CircuitOpenError } from "@beep/knowledge-domain/errors";
import { withLlmResilience } from "@beep/knowledge-server/LlmControl/LlmResilience";
import {
  CentralRateLimiterService,
  CentralRateLimiterServiceTest,
} from "@beep/knowledge-server/LlmControl/RateLimiter";
import { StageTimeoutService, TimeoutError } from "@beep/knowledge-server/LlmControl/StageTimeout";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import { LanguageModel, Prompt } from "@effect/ai";
import * as AiError from "@effect/ai/AiError";
import type * as Response from "@effect/ai/Response";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Ref from "effect/Ref";
import * as S from "effect/Schema";
import * as Stream from "effect/Stream";

const $I = $KnowledgeServerId.create("test/Resilience/LlmResilience.test");

const TEST_TIMEOUT = 60_000;

const NoopLimiterLayer = Layer.succeed(
  CentralRateLimiterService,
  CentralRateLimiterService.of({
    acquire: () => Effect.void,
    release: () => Effect.void,
    getMetrics: () => Effect.die("not implemented"),
    getResetTime: () => Effect.succeed(0),
    setCircuitState: () => Effect.void,
  })
);

const BreakerTestLayer = CentralRateLimiterServiceTest({
  requestsPerMinute: 100,
  tokensPerMinute: 100_000,
  maxConcurrent: 2,
  failureThreshold: 1,
  recoveryTimeoutMs: Duration.seconds(60),
  successThreshold: 1,
});

const TimeoutTestLayer = Layer.mergeAll(
  NoopLimiterLayer,
  Layer.succeed(StageTimeoutService, {
    withTimeout: (_stage, _operation) =>
      Effect.fail(new TimeoutError({ stage: "entity_extraction", timeoutMs: Duration.millis(25) })),
    getConfig: () =>
      Effect.succeed({
        softMs: Duration.millis(5),
        hardMs: Duration.millis(25),
      }),
    wouldTimeout: (_stage, durationMs) => Effect.succeed(durationMs > 25),
  })
);

describe("LlmResilience", () => {
  effect(
    "retries once and succeeds on second attempt",
    Effect.fn(function* () {
      const attempts = yield* Ref.make(0);

      const flaky = Effect.gen(function* () {
        const current = yield* Ref.updateAndGet(attempts, (n) => n + 1);
        if (current === 1) {
          return yield* new AiError.UnknownError({
            module: "test",
            method: "retry",
            description: "first attempt fails",
          });
        }
        return "ok";
      });

      const result = yield* withLlmResilience(flaky, {
        stage: "entity_extraction",
        maxRetries: 2,
        baseRetryDelay: Duration.zero,
      });

      strictEqual(result, "ok");
      strictEqual(yield* Ref.get(attempts), 2);
    }, Effect.provide(NoopLimiterLayer)),
    TEST_TIMEOUT
  );

  effect(
    "returns CircuitOpenError after failure feedback opens breaker",
    Effect.fn(function* () {
      const failedCall = withLlmResilience(
        Effect.fail(
          new AiError.UnknownError({
            module: "test",
            method: "breaker",
            description: "fail to open circuit",
          })
        ),
        {
          stage: "entity_extraction",
          maxRetries: 0,
        }
      );

      yield* Effect.either(failedCall);

      const nextCall = withLlmResilience(Effect.succeed("ok"), {
        stage: "entity_extraction",
        maxRetries: 0,
      });

      const error = yield* Effect.flip(nextCall);
      assertTrue(error instanceof CircuitOpenError);
    }, Effect.provide(BreakerTestLayer)),
    TEST_TIMEOUT
  );

  effect(
    "fails with TimeoutError when stage exceeds hard timeout",
    Effect.fn(function* () {
      const error = yield* Effect.flip(
        withLlmResilience(Effect.succeed("late"), {
          stage: "entity_extraction",
          maxRetries: 0,
        })
      );

      assertTrue(error instanceof TimeoutError);
      strictEqual(error.stage, "entity_extraction");
    }, Effect.provide(TimeoutTestLayer)),
    TEST_TIMEOUT
  );

  effect(
    "retries can wrap a LanguageModel operation",
    Effect.fn(function* () {
      const buildProviderResponse = (value: unknown): Array<Response.PartEncoded> => [
        { type: "text", text: JSON.stringify(value) },
        {
          type: "finish",
          reason: "stop",
          usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
        },
      ];

      const attempts = yield* Ref.make(0);

      const flaky = yield* LanguageModel.make({
        generateText: () =>
          Effect.gen(function* () {
            const current = yield* Ref.updateAndGet(attempts, (n) => n + 1);
            if (current === 1) {
              return yield* new AiError.UnknownError({
                module: "test",
                method: "primary",
                description: "first attempt fails",
              });
            }
            return buildProviderResponse({ ok: true });
          }),
        streamText: () => Stream.empty,
      });

      class Result extends S.Class<Result>($I`Result`)(
        { ok: S.Boolean },
        $I.annotations("Result", { description: "Test-only schema for JSON decode." })
      ) {}

      const response = yield* withLlmResilience(
        flaky.generateObject({
          prompt: Prompt.make("hi"),
          schema: Result,
          objectName: "Result",
        }),
        {
          stage: "entity_extraction",
          maxRetries: 1,
          baseRetryDelay: Duration.zero,
        }
      );

      const decoded = yield* S.decodeUnknown(Result)(response.value);
      strictEqual(decoded.ok, true);
      strictEqual(yield* Ref.get(attempts), 2);
    }, Effect.provide(NoopLimiterLayer)),
    TEST_TIMEOUT
  );
});
