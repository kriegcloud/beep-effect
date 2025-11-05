import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import type { AccumulateOptions, AccumulateResult } from "./shared";
import { accumulateEffects } from "./shared";

// Re-export shared, Node-free helpers
export * from "./shared";

// =========================
// Client-specific wrappers
// =========================

export const withEnvLogging = <A, E, R>(self: Effect.Effect<A, E, R>) => self;

export const accumulateEffectsAndReport = <A, E, R>(
  effects: ReadonlyArray<Effect.Effect<A, E, R>>,
  options?: AccumulateOptions | undefined
): Effect.Effect<AccumulateResult<A, E>, never, R> =>
  Effect.gen(function* () {
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

    let eff: Effect.Effect<AccumulateResult<A, E>, never, R> = Effect.succeed(res);
    if (options?.annotations) eff = eff.pipe(Effect.annotateLogs(options.annotations));
    if (options?.spanLabel) eff = eff.pipe(Effect.withLogSpan(options.spanLabel));
    return yield* eff;
  });
