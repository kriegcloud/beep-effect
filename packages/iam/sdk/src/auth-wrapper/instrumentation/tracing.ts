import * as Effect from "effect/Effect";
import type * as Tracer from "effect/Tracer";

export interface TracingOptions {
  readonly spanName: string;
  readonly options?: Tracer.SpanOptions;
}

export const withAuthSpan =
  ({ spanName, options }: TracingOptions) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> =>
    Effect.withSpan(spanName, options)(effect);
