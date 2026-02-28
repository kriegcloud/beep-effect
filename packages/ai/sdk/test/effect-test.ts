import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ServiceMap from "effect/ServiceMap";
import { TestClock } from "effect/testing";

const failWithPrettyCause = (cause: Cause.Cause<unknown>) =>
  Effect.gen(function* () {
    if (Cause.hasInterruptsOnly(cause)) {
      return yield* Effect.die("All fibers interrupted without errors.");
    }
    const errors = Cause.prettyErrors(cause);
    for (let i = 1; i < errors.length; i++) {
      yield* Effect.logError(errors[i]);
    }
    const firstError = errors[0] ?? Cause.pretty(cause);
    return yield* Effect.die(firstError);
  });

export const runEffect = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  Effect.runPromiseWith(ServiceMap.makeUnsafe<R>(new Map()))(
    effect.pipe(
      Effect.provide(Layer.mergeAll(TestClock.layer())),
      Effect.matchCauseEffect({
        onSuccess: Effect.succeed,
        onFailure: failWithPrettyCause,
      })
    )
  );

export const runEffectLive = <A, E, R>(effect: Effect.Effect<A, E, R>) => runEffect(TestClock.withLive(effect));
