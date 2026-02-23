/**
 * Client-safe entry point for `@beep/errors` (no Node APIs).
 *
 * @example
 * import * as Effect from "effect/Effect";
 * import { accumulateEffectsAndReport } from "@beep/errors/client";
 *
 * const effects = [Effect.succeed("ok")];
 * export const run = accumulateEffectsAndReport(effects, { spanLabel: "example" });
 *
 * @category Documentation/Modules
 * @since 0.1.0
 */
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import type { AccumulateOptions, AccumulateResult } from "./shared";
import { accumulateEffects } from "./shared";

/**
 * Re-export shared helpers for client bundles.
 *
 * @example
 * import * as Effect from "effect/Effect";
 * import { withLogContext } from "@beep/errors/shared";
 * import { withEnvLogging } from "@beep/errors/client";
 *
 * const clientSharedExample = withEnvLogging(
 *   Effect.succeed("ok").pipe(withLogContext({ service: "demo" }))
 * );
 * void clientSharedExample;
 *
 * @category Documentation/Reexports
 * @since 0.1.0
 */
export * from "./shared";

// =========================
// Client-specific wrappers
// =========================

/**
 * Client-safe noop for env-driven logging hooks.
 *
 * @category Documentation/Functions
 * @since 0.1.0
 */
export const withEnvLogging = <A, E, R>(self: Effect.Effect<A, E, R>) => self;

/**
 * Accumulate successes/errors with client-safe reporting.
 *
 * @category Documentation/Functions
 * @since 0.1.0
 */
export const accumulateEffectsAndReport: <A, E, R>(
  effects: ReadonlyArray<Effect.Effect<A, E, R>>,
  options?: AccumulateOptions | undefined
) => Effect.Effect<AccumulateResult<A, E>, never, R> = Effect.fn(function* (effects, options) {
  const res = yield* accumulateEffects(effects, { concurrency: options?.concurrency });

  yield* Effect.logInfo("accumulate summary", {
    successes: res.successes.length,
    errors: res.errors.length,
  });

  for (const [i, cause] of res.errors.entries()) {
    yield* Effect.logError(`accumulate error[${i}]`);
    // Pretty print cause without server-only extras
    yield* Effect.sync(() => console.error(Cause.pretty(cause)));
  }

  return yield* Effect.succeed(res).pipe(
    options?.annotations ? Effect.annotateLogs(options.annotations) : (eff) => eff,
    options?.spanLabel ? Effect.withLogSpan(options.spanLabel) : (eff) => eff
  );
});
