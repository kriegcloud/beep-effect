/**
 * HTTP trace context extraction and injection helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { Effect } from "effect";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import type * as Tracer from "effect/Tracer";
import * as Headers from "effect/unstable/http/Headers";
import * as HttpTraceContext from "effect/unstable/http/HttpTraceContext";

const isTraceContextDataFirst = (args: IArguments): boolean => args.length >= 2 || Effect.isEffect(args[0]);

/**
 * Extract an incoming parent span from trace headers.
 *
 * @example
 * ```typescript
 * import { extractTraceContextHeaders } from "@beep/observability/server"
 *
 * const parentSpan = extractTraceContextHeaders({ traceparent: "00-abc-def-01" })
 * ```
 *
 * @since 0.0.0
 * @category observability
 */
export const extractTraceContextHeaders = (headers?: Headers.Input): O.Option<Tracer.ExternalSpan> =>
  HttpTraceContext.fromHeaders(Headers.fromInput(headers));

/**
 * Inject the current Effect span into outbound trace headers.
 *
 * @example
 * ```typescript
 * import { Effect } from "effect"
 * import { injectTraceContextHeaders } from "@beep/observability/server"
 *
 * const program = injectTraceContextHeaders().pipe(
 *
 * )
 * ```
 *
 * @since 0.0.0
 * @category observability
 */
export const injectTraceContextHeaders = (headers?: Headers.Input): Effect.Effect<Headers.Headers> =>
  Effect.currentSpan.pipe(
    Effect.map((span) => Headers.setAll(Headers.fromInput(headers), HttpTraceContext.toHeaders(span))),
    Effect.catch(() => Effect.succeed(Headers.fromInput(headers)))
  );

/**
 * Apply an incoming parent span, if present, to one effect.
 *
 * @example
 * ```typescript
 * import { Effect } from "effect"
 * import { withIncomingTraceContext } from "@beep/observability/server"
 *
 * const program = withIncomingTraceContext(
 *
 *
 * )
 * ```
 *
 * @since 0.0.0
 * @category observability
 */
const withIncomingTraceContextImpl = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
  headers: Headers.Input | undefined
): Effect.Effect<A, E, R> =>
  extractTraceContextHeaders(headers).pipe(
    O.match({
      onNone: () => effect,
      onSome: (span) => Effect.withParentSpan(effect, span, { captureStackTrace: false }),
    })
  );

/**
 * Runs an Effect with trace context extracted from incoming headers.
 *
 * @category observability
 * @since 0.0.0
 */
export const withIncomingTraceContext: {
  <A, E, R>(effect: Effect.Effect<A, E, R>, headers: Headers.Input | undefined): Effect.Effect<A, E, R>;
  <A, E, R>(headers: Headers.Input | undefined, effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R>;
  (headers: Headers.Input | undefined): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
} = dual(
  isTraceContextDataFirst,
  <A, E, R>(
    effect: Effect.Effect<A, E, R> | Headers.Input | undefined,
    headers: Headers.Input | Effect.Effect<A, E, R> | undefined
  ): Effect.Effect<A, E, R> => {
    if (Effect.isEffect(effect) && !Effect.isEffect(headers)) {
      return withIncomingTraceContextImpl(effect, headers);
    }

    if (P.isNotUndefined(effect) && !Effect.isEffect(effect) && Effect.isEffect(headers)) {
      return withIncomingTraceContextImpl(headers, effect);
    }

    if (P.isUndefined(effect) && Effect.isEffect(headers)) {
      return withIncomingTraceContextImpl(headers, undefined);
    }

    return Effect.die("Invalid withIncomingTraceContext arguments");
  }
);
