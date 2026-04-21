import { Effect, Layer, Match, Tracer } from "effect";
import * as O from "effect/Option";
import * as DevToolsClient from "effect/unstable/devtools/DevToolsClient";
import type * as DevToolsSchema from "effect/unstable/devtools/DevToolsSchema";
import * as Socket from "effect/unstable/socket/Socket";

/**
 * Predicate used to decide whether a span should be mirrored to Effect devtools.
 *
 * @example
 * ```typescript
 * import type { DevToolsSpanFilter } from "@beep/observability/server"
 *
 * const filter: DevToolsSpanFilter = (name) => name.startsWith("Http.")
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type DevToolsSpanFilter = (name: string) => boolean;

const toDevToolsSpanStatus = Match.type<Tracer.SpanStatus>().pipe(
  Match.withReturnType<DevToolsSchema.SpanStatus>(),
  Match.tagsExhaustive({
    Started: ({ startTime }) => ({ _tag: "Started", startTime }),
    Ended: ({ startTime, endTime, exit }) => ({ _tag: "Ended", startTime, endTime, exit }),
  })
);

const toDevToolsParentSpan = (parent: O.Option<Tracer.AnySpan>): O.Option<DevToolsSchema.ParentSpan> =>
  O.match(parent, {
    onNone: O.none,
    onSome: (value) =>
      O.some(
        Match.value(value).pipe(
          Match.withReturnType<DevToolsSchema.ParentSpan>(),
          Match.tagsExhaustive({
            ExternalSpan: ({ spanId, traceId, sampled }) => ({ _tag: "ExternalSpan", spanId, traceId, sampled }),
            Span: ({ spanId, traceId, name, sampled, attributes, status, parent }) => ({
              _tag: "Span",
              spanId,
              traceId,
              name,
              sampled,
              attributes,
              status: toDevToolsSpanStatus(status),
              parent: toDevToolsParentSpan(parent),
            }),
          })
        )
      ),
  });

const toDevToolsSpan = (span: Tracer.Span): DevToolsSchema.Span => ({
  _tag: "Span",
  spanId: span.spanId,
  traceId: span.traceId,
  name: span.name,
  sampled: span.sampled,
  attributes: span.attributes,
  status: toDevToolsSpanStatus(span.status),
  parent: toDevToolsParentSpan(span.parent),
});

/**
 * Mirror only selected spans to the Effect devtools websocket.
 *
 * @example
 * ```typescript
 * import { layerFilteredDevTools } from "@beep/observability/server"
 *
 * const DevToolsLive = layerFilteredDevTools({
 * 
 * 
 * })
 * ```
 *
 * @since 0.0.0
 * @category layers
 */
export const layerFilteredDevTools = (options: {
  readonly url: string;
  readonly shouldPublish: DevToolsSpanFilter;
}): Layer.Layer<never> => {
  const socketClientLayer = DevToolsClient.layer.pipe(
    Layer.provide(Socket.layerWebSocket(options.url)),
    Layer.provide(Socket.layerWebSocketConstructorGlobal)
  );

  return Layer.effect(
    Tracer.Tracer,
    Effect.gen(function* () {
      const client = yield* DevToolsClient.DevToolsClient;
      const currentTracer = yield* Effect.tracer;

      return Tracer.make({
        span(spanOptions) {
          const span = currentTracer.span(spanOptions);

          if (!options.shouldPublish(span.name)) {
            return span;
          }

          client.sendUnsafe(toDevToolsSpan(span));

          return span;
        },
        context: currentTracer.context,
      });
    })
  ).pipe(Layer.provide(socketClientLayer));
};
