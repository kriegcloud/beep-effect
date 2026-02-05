/**
 * Stage Timeout Service
 *
 * Provides soft and hard timeouts for extraction stages:
 * - Soft timeout: Emit warning, continue execution
 * - Hard timeout: Fail with TimeoutError
 *
 * Timeout configuration by stage:
 * - Chunking: 3s soft / 5s hard
 * - Entity extraction: 45s soft / 60s hard
 * - Relation extraction: 45s soft / 60s hard
 * - Grounding: 20s soft / 30s hard
 * - Entity verification: 30s soft / 45s hard
 * - Serialization: 7s soft / 10s hard
 *
 * @since 2.0.0
 * @module Service/LlmControl/StageTimeout
 */

import { $KnowledgeServerId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { Context, Duration, Effect, Fiber, Layer } from "effect";
import * as S from "effect/Schema";

const $I = $KnowledgeServerId.create("LlmControl/StageTimeout");

/**
 * Stage names with timeout configuration
 */
export class TimedStage extends BS.StringLiteralKit(
  "chunking",
  "entity_extraction",
  "relation_extraction",
  "grounding",
  "entity_verification",
  "serialization"
).annotations(
  $I.annotations("TimedStage", {
    description: "Stage names with timeout configuration",
  })
) {}

declare namespace TimedStage {
  export type Type = typeof TimedStage.Type;
}

/**
 * Timeout configuration for a stage
 */
export class StageTimeoutConfig extends S.Class<StageTimeoutConfig>($I`StageTimeoutConfig`)(
  {
    /** Soft timeout in milliseconds - warning emitted but continues */
    softMs: S.DurationFromMillis,
    /** Hard timeout in milliseconds - fails with TimeoutError */
    hardMs: S.DurationFromMillis,
  },
  $I.annotations("StageTimeoutConfig", {
    description: "Timeout configuration for a stage",
  })
) {}

/**
 * Stage timeout configuration map
 */
const STAGE_TIMEOUTS: Record<TimedStage.Type, StageTimeoutConfig> = {
  chunking: { softMs: Duration.millis(3000), hardMs: Duration.millis(5000) },
  entity_extraction: { softMs: Duration.millis(45000), hardMs: Duration.millis(60000) },
  relation_extraction: { softMs: Duration.millis(45000), hardMs: Duration.millis(60000) },
  grounding: { softMs: Duration.millis(20000), hardMs: Duration.millis(30000) },
  entity_verification: { softMs: Duration.millis(30000), hardMs: Duration.millis(45000) },
  serialization: { softMs: Duration.millis(7000), hardMs: Duration.millis(10000) },
};

/**
 * Default timeout for unknown stages
 */
const DEFAULT_TIMEOUT: StageTimeoutConfig = { softMs: Duration.millis(10000), hardMs: Duration.millis(15000) };

// =============================================================================
// Errors
// =============================================================================

/**
 * Error thrown when a stage exceeds its hard timeout
 */
export class TimeoutError extends S.TaggedError<TimeoutError>($I`TimeoutError`)(
  "TimeoutError",
  {
    stage: S.String,
    timeoutMs: S.DurationFromMillis,
  },
  $I.annotations("TimeoutError", {
    description: "Error thrown when a stage exceeds its hard timeout",
  })
) {
  override get message() {
    return `Stage "${this.stage}" timed out after ${this.timeoutMs}ms`;
  }
}

// =============================================================================
// Service
// =============================================================================

/**
 * Stage timeout management for extraction stages
 *
 * Provides dual-timeout strategy:
 * 1. Soft timeout emits a warning callback (for logging, metrics)
 * 2. Hard timeout fails the effect with TimeoutError
 *
 * @example
 * ```typescript
 * Effect.gen(function*() {
 *   const timeout = yield* StageTimeoutService
 *
 *   const result = yield* timeout.withTimeout(
 *     "entity_extraction",
 *     extractEntities(text),
 *     () => Effect.logWarning("Entity extraction is taking longer than expected")
 *   )
 * })
 * ```
 */
export interface StageTimeoutServiceShape {
  /**
   * Wrap an effect with soft and hard timeouts
   *
   * @param stage - Stage name for timeout lookup
   * @param effect - Effect to wrap
   * @param onSoftTimeout - Optional callback when soft timeout is reached
   * @returns Effect that fails with TimeoutError on hard timeout
   */
  readonly withTimeout: <A, E, R>(
    stage: TimedStage.Type,
    effect: Effect.Effect<A, E, R>,
    onSoftTimeout?: undefined | (() => Effect.Effect<void>)
  ) => Effect.Effect<A, E | TimeoutError, R>;

  /**
   * Get timeout configuration for a stage
   *
   * @param stage - Stage name
   * @returns Timeout configuration
   */
  readonly getConfig: (stage: TimedStage.Type) => Effect.Effect<StageTimeoutConfig>;

  /**
   * Check if an effect would timeout
   *
   * @param stage - Stage name
   * @param durationMs - Estimated duration in milliseconds
   * @returns true if duration exceeds hard timeout
   */
  readonly wouldTimeout: (stage: TimedStage.Type, durationMs: number) => Effect.Effect<boolean>;
}

export class StageTimeoutService extends Context.Tag($I`StageTimeoutService`)<
  StageTimeoutService,
  StageTimeoutServiceShape
>() {}

// =============================================================================
// Implementation
// =============================================================================

/**
 * Default implementation
 */
const make = Effect.gen(function* () {
  const withTimeout = Effect.fn(function* <A, E, R>(
    stage: TimedStage.Type,
    effect: Effect.Effect<A, E, R>,
    onSoftTimeout?: () => Effect.Effect<void>
  ) {
    const config = STAGE_TIMEOUTS[stage] ?? DEFAULT_TIMEOUT;

    // Start soft timeout watcher in background
    const softTimeoutFiber = yield* Effect.sleep(config.softMs).pipe(
      Effect.flatMap(() => onSoftTimeout?.() ?? Effect.void),
      Effect.fork
    );

    // Run the effect with hard timeout
    const result = yield* effect.pipe(
      Effect.timeoutFail({
        duration: config.hardMs,
        onTimeout: () => new TimeoutError({ stage, timeoutMs: config.hardMs }),
      })
    );

    // Cancel soft timeout watcher if we completed in time
    yield* Fiber.interrupt(softTimeoutFiber);

    return result;
  });

  const getConfig = Effect.fn(function* (stage: TimedStage.Type) {
    return yield* Effect.succeed(STAGE_TIMEOUTS[stage]);
  });

  const wouldTimeout = Effect.fn(function* (stage: TimedStage.Type, durationMs: number) {
    const config = STAGE_TIMEOUTS[stage] ?? DEFAULT_TIMEOUT;
    return Duration.greaterThan(Duration.millis(durationMs), config.hardMs);
  });
  return {
    withTimeout,
    getConfig,
    wouldTimeout,
  };
});

/**
 * Default layer providing StageTimeoutService
 */
export const StageTimeoutServiceLive = Layer.effect(StageTimeoutService, make);

/**
 * Test layer with configurable timeouts (useful for faster tests)
 */
export const StageTimeoutServiceTest = (
  overrides: Partial<Record<TimedStage.Type, StageTimeoutConfig>> = {}
): Layer.Layer<StageTimeoutService> => {
  const testTimeouts = { ...STAGE_TIMEOUTS, ...overrides };

  return Layer.succeed(StageTimeoutService, {
    withTimeout: <A, E, R>(
      stage: TimedStage.Type,
      effect: Effect.Effect<A, E, R>,
      onSoftTimeout?: () => Effect.Effect<void>
    ): Effect.Effect<A, E | TimeoutError, R> => {
      const config = testTimeouts[stage] ?? DEFAULT_TIMEOUT;

      return Effect.gen(function* () {
        const softTimeoutFiber = yield* Effect.sleep(config.softMs).pipe(
          Effect.flatMap(() => onSoftTimeout?.() ?? Effect.void),
          Effect.fork
        );

        const result = yield* effect.pipe(
          Effect.timeoutFail({
            duration: config.hardMs,
            onTimeout: () => new TimeoutError({ stage, timeoutMs: config.hardMs }),
          })
        );

        yield* Fiber.interrupt(softTimeoutFiber);
        return result;
      });
    },

    getConfig: (stage: TimedStage.Type) => Effect.succeed(testTimeouts[stage] ?? DEFAULT_TIMEOUT),

    wouldTimeout: (stage: TimedStage.Type, durationMs: number) => {
      const config = testTimeouts[stage] ?? DEFAULT_TIMEOUT;
      return Effect.succeed(Duration.greaterThan(Duration.millis(durationMs), config.hardMs));
    },
  });
};
