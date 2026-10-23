import * as Effect from "effect/Effect";
import { dual } from "effect/Function";
import * as Layer from "effect/Layer";

/**
 * Build a layer in a fresh scope before providing its context to the effect.
 * @category utils
 * @since 0.0.0
 */
export const provideBuilt: {
  <A, E, R, Out, E2, In>(
    self: Effect.Effect<A, E, R>,
    layer: Layer.Layer<Out, E2, In>
  ): Effect.Effect<A, E | E2, In | Exclude<R, Out>>;
  <Out, E2, In>(
    layer: Layer.Layer<Out, E2, In>
  ): <A, E, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E | E2, In | Exclude<R, Out>>;
} = dual(2, <A, E, R, Out, E2, In>(self: Effect.Effect<A, E, R>, layer: Layer.Layer<Out, E2, In>) =>
  Effect.scopedWith((scope) =>
    Effect.flatMap(Layer.buildWithScope(layer, scope), (context) => Effect.provideContext(self, context))
  )
);
