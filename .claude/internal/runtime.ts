import { Effect, Layer } from "effect";

export const provideLayerScoped = Effect.fn("ClaudeRuntime.provideLayerScoped")(function* <
  A,
  E,
  R,
  ROut extends R,
  LE,
  LR,
>(effect: Effect.Effect<A, E, R>, layer: Layer.Layer<ROut, LE, LR>) {
  const context = yield* Layer.build(layer);
  return yield* effect.pipe(Effect.provide(context));
});
