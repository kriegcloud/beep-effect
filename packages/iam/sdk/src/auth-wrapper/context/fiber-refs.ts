import * as Effect from "effect/Effect";
import * as FiberRef from "effect/FiberRef";

export interface HandlerFiberContext {
  readonly annotations: Readonly<Record<string, unknown>>;
  readonly metricTags: Readonly<Record<string, string>>;
}

export type HandlerFiberRef = FiberRef.FiberRef<HandlerFiberContext>;

export const emptyHandlerContext: HandlerFiberContext = {
  annotations: {},
  metricTags: {},
};

export const mergeHandlerContext = (
  base: HandlerFiberContext,
  patch: Partial<HandlerFiberContext>
): HandlerFiberContext => ({
  annotations: {
    ...base.annotations,
    ...(patch.annotations ?? {}),
  },
  metricTags: {
    ...base.metricTags,
    ...(patch.metricTags ?? {}),
  },
});

export const handlerFiberRef: HandlerFiberRef = Effect.runSync(
  Effect.scoped(
    Effect.gen(function* () {
      return yield* FiberRef.make(emptyHandlerContext, {
        fork: (value) => value,
        join: mergeHandlerContext,
      });
    })
  )
);
