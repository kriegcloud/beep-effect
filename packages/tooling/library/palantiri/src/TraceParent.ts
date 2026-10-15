/**
 * W3C `TRACEPARENT` handling, so a parcel read nests under the caller's
 * trace.
 *
 * **Details**
 *
 * A caller that holds a trace (an agent harness, a hook, CI) passes its
 * context through the `TRACEPARENT` and `TRACESTATE` environment variables,
 * the process-level form of the W3C `traceparent` and `tracestate` headers.
 * Hosts wrap their read in {@link withTraceParent}; an absent or malformed
 * value leaves the read a root span.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import { dual } from "effect/Function";
import * as Headers from "effect/http/Headers";
import * as HttpTraceContext from "effect/http/HttpTraceContext";
import * as O from "effect/Option";
import type * as Tracer from "effect/Tracer";

/**
 * Parse a W3C `traceparent` value, with an optional `tracestate`, into an
 * external parent span.
 *
 * **Example** (Parse a traceparent)
 *
 * ```ts
 * import { parseTraceParent } from "@beep/palantiri/TraceParent"
 * import * as O from "effect/Option"
 *
 * const parent = parseTraceParent("00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ca902c7-01", O.none())
 * console.log(O.getOrElse(O.map(parent, (span) => span.traceId), () => "none")) // "4bf92f3577b34da6a3ce929d0e0e4736"
 * console.log(O.isNone(parseTraceParent("not-a-traceparent", O.none()))) // true
 * ```
 *
 * @param traceparent - The `traceparent` value.
 * @param tracestate - The `tracestate` value, if any.
 * @returns The parent span, or none when the value is malformed.
 * @category parsing
 * @since 0.0.0
 */
export const parseTraceParent: {
  (tracestate: O.Option<string>): (traceparent: string) => O.Option<Tracer.ExternalSpan>;
  (traceparent: string, tracestate: O.Option<string>): O.Option<Tracer.ExternalSpan>;
} = dual(
  2,
  (traceparent: string, tracestate: O.Option<string>): O.Option<Tracer.ExternalSpan> =>
    tracestate.pipe(
      O.match({
        onNone: () => ({ traceparent }),
        onSome: (state) => ({ traceparent, tracestate: state }),
      }),
      Headers.fromInput,
      HttpTraceContext.w3c
    )
);

/**
 * The parent span named by `TRACEPARENT` (and `TRACESTATE`), if set and
 * well formed.
 *
 * **Example** (Read the parent from config)
 *
 * ```ts
 * import { traceParentFromConfig } from "@beep/palantiri/TraceParent"
 * import * as ConfigProvider from "effect/ConfigProvider"
 * import * as Effect from "effect/Effect"
 * import * as O from "effect/Option"
 *
 * const parent = await Effect.runPromise(
 *   traceParentFromConfig.pipe(
 *     Effect.provideService(
 *       ConfigProvider.ConfigProvider,
 *       ConfigProvider.fromEnv({ env: { TRACEPARENT: "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ca902c7-01" } })
 *     )
 *   )
 * )
 * console.log(O.isSome(parent)) // true
 * ```
 *
 * @category getters
 * @since 0.0.0
 */
export const traceParentFromConfig: Effect.Effect<O.Option<Tracer.ExternalSpan>> = Effect.gen(function* () {
  const traceparent = yield* Config.option(Config.String("TRACEPARENT"));
  const tracestate = yield* Config.option(Config.String("TRACESTATE"));
  return O.flatMap(traceparent, (value) => parseTraceParent(value, tracestate));
}).pipe(Effect.orElseSucceed(O.none));

/**
 * Run an effect under an explicit parent span, or as-is when there is none.
 *
 * **Example** (Parent a read explicitly)
 *
 * ```ts
 * import { parseTraceParent, withOptionalParent } from "@beep/palantiri/TraceParent"
 * import * as Effect from "effect/Effect"
 * import * as O from "effect/Option"
 *
 * const parent = parseTraceParent("00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ca902c7-01", O.none())
 * const traceId = Effect.currentSpan.pipe(Effect.map((span) => span.traceId), Effect.withSpan("Parcels.read"))
 * console.log(await Effect.runPromise(withOptionalParent(traceId, parent))) // "4bf92f3577b34da6a3ce929d0e0e4736"
 * ```
 *
 * @param effect - The effect to parent.
 * @param parent - The parent span, if any.
 * @returns The parented effect.
 * @category combinators
 * @since 0.0.0
 */
export const withOptionalParent: {
  (parent: O.Option<Tracer.AnySpan>): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
  <A, E, R>(effect: Effect.Effect<A, E, R>, parent: O.Option<Tracer.AnySpan>): Effect.Effect<A, E, R>;
} = dual(
  2,
  <A, E, R>(effect: Effect.Effect<A, E, R>, parent: O.Option<Tracer.AnySpan>): Effect.Effect<A, E, R> =>
    O.match(parent, {
      onNone: () => effect,
      onSome: (span) => Effect.withParentSpan(effect, span),
    })
);

/**
 * Run an effect under the `TRACEPARENT` parent span when one is set.
 *
 * **Example** (Wrap a read)
 *
 * ```ts
 * import { withTraceParent } from "@beep/palantiri/TraceParent"
 * import * as Effect from "effect/Effect"
 *
 * const read = Effect.succeed("parcel").pipe(Effect.withSpan("Parcels.read"), withTraceParent)
 * console.log(await Effect.runPromise(read)) // "parcel"
 * ```
 *
 * @param effect - The effect to nest under the caller's trace.
 * @returns The same effect, parented when `TRACEPARENT` is set.
 * @category combinators
 * @since 0.0.0
 */
export const withTraceParent = <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> =>
  Effect.flatMap(traceParentFromConfig, (parent) => withOptionalParent(effect, parent));
