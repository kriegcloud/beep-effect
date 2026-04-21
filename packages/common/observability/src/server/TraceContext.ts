import { Effect } from "effect";
import * as O from "effect/Option";
import type * as Tracer from "effect/Tracer";
import * as Headers from "effect/unstable/http/Headers";
import * as HttpTraceContext from "effect/unstable/http/HttpTraceContext";

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
export const withIncomingTraceContext = <A, E, R>(
  headers: Headers.Input | undefined,
  effect: Effect.Effect<A, E, R>
): Effect.Effect<A, E, R> =>
  extractTraceContextHeaders(headers).pipe(
    O.match({
      onNone: () => effect,
      onSome: (span) => Effect.withParentSpan(effect, span, { captureStackTrace: false }),
    })
  );
