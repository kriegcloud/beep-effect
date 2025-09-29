import * as Effect from "effect/Effect";
import * as FiberRef from "effect/FiberRef";
import type { HandlerFiberContext } from "./fiber-refs";
import { handlerFiberRef, mergeHandlerContext } from "./fiber-refs";

export interface RequestContextOptions {
  readonly annotations?: Readonly<Record<string, unknown>>;
  readonly fiberContext?: Partial<HandlerFiberContext>;
  readonly metricTags?: Readonly<Record<string, string>>;
}

export const withRequestContext =
  (options: RequestContextOptions) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> =>
    Effect.gen(function* () {
      const current = yield* FiberRef.get(handlerFiberRef);
      const baseFiberContext = options.fiberContext ?? {};
      const annotationPatch =
        options.annotations && Object.keys(options.annotations).length > 0
          ? {
              annotations: {
                ...(baseFiberContext.annotations ?? {}),
                ...options.annotations,
              },
            }
          : {};

      const metricTagsPatch =
        options.metricTags && Object.keys(options.metricTags).length > 0
          ? {
              metricTags: {
                ...(baseFiberContext.metricTags ?? {}),
                ...options.metricTags,
              },
            }
          : {};

      const patch: Partial<HandlerFiberContext> = {
        ...baseFiberContext,
        ...annotationPatch,
        ...metricTagsPatch,
      };

      const merged = mergeHandlerContext(current, patch);

      const logAnnotations = {
        ...merged.annotations,
      };

      const metricTags = {
        ...merged.metricTags,
      };

      const scoped = Effect.locally(handlerFiberRef, merged)(effect);
      const annotated = Object.keys(logAnnotations).length > 0 ? Effect.annotateLogs(logAnnotations)(scoped) : scoped;
      const tagged = Object.keys(metricTags).length > 0 ? Effect.tagMetrics(metricTags)(annotated) : annotated;

      return yield* tagged;
    });
