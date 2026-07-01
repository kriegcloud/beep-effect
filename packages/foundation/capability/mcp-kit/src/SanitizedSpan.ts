/**
 * Sanitized-span wrapper.
 *
 * Upstream `Toolkit.ts:263-265` annotates the current span with the tool's
 * raw, undecoded call `parameters` before decoding or validation runs:
 * `Effect.annotateCurrentSpan({ tool: name, parameters: params })`. Doctrine
 * `standards/architecture/12-observability.md` §3 forbids raw user input on
 * spans. `Effect.annotateCurrentSpan` mutates whatever `Tracer.Span` object
 * is already the fiber's current span (`fiber.currentSpanLocal`) — it does
 * not re-resolve the `Tracer` service — so suppressing the attribute
 * requires the current span itself to already be a filtering wrapper by the
 * time `Toolkit`'s dispatch runs.
 *
 * {@link withSanitizedToolSpan} does exactly that: it wraps the ambient
 * `Tracer` in a filtering proxy and opens a **new** span through that proxy
 * around the wrapped effect, so the span that becomes current for the
 * toolkit dispatch is already filtering.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Effect } from "effect";
import type * as Tracer from "effect/Tracer";

/**
 * Span attribute keys suppressed by default: the raw, undecoded tool call
 * parameters set by upstream `Toolkit.ts:263-265`.
 *
 * @example
 * ```ts
 * import { defaultSanitizedSpanKeys } from "@beep/mcp-kit"
 *
 * console.log(defaultSanitizedSpanKeys)
 * // ["parameters"]
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const defaultSanitizedSpanKeys: ReadonlyArray<string> = ["parameters"];

/**
 * Wraps a `Tracer` so that any span it creates suppresses attribute values
 * set under the given keys, while every other attribute passes through
 * unchanged.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { sanitizeTracerAttributes } from "@beep/mcp-kit"
 *
 * const program = Effect.gen(function* () {
 *   const tracer = yield* Effect.tracer
 *   const sanitized = sanitizeTracerAttributes(tracer, ["parameters"])
 *   return typeof sanitized.span
 * })
 * console.log(Effect.runSync(program))
 * // "function"
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const sanitizeTracerAttributes = (
  tracer: Tracer.Tracer,
  sanitizedKeys: ReadonlyArray<string> = defaultSanitizedSpanKeys
): Tracer.Tracer => ({
  ...tracer,
  span(options) {
    const span = tracer.span(options);
    // Span implementations (e.g. `NativeSpan`) define their methods on the
    // class prototype, so a shallow `{ ...span }` spread would silently drop
    // `end`/`event`/`addLinks` (only own instance fields survive a spread).
    // Every member below is an explicit delegate so the wrapper stays a
    // fully conformant `Span`, with `attribute` the only overridden method.
    return {
      get _tag() {
        return span._tag;
      },
      get name() {
        return span.name;
      },
      get spanId() {
        return span.spanId;
      },
      get traceId() {
        return span.traceId;
      },
      get parent() {
        return span.parent;
      },
      get annotations() {
        return span.annotations;
      },
      get status() {
        return span.status;
      },
      get attributes() {
        return span.attributes;
      },
      get links() {
        return span.links;
      },
      get sampled() {
        return span.sampled;
      },
      get kind() {
        return span.kind;
      },
      end: (endTime: bigint, exit) => span.end(endTime, exit),
      attribute: (key: string, value: unknown) => {
        if (sanitizedKeys.includes(key)) {
          return;
        }
        span.attribute(key, value);
      },
      event: (name: string, startTime: bigint, attributes?: Record<string, unknown>) =>
        span.event(name, startTime, attributes),
      addLinks: (links) => span.addLinks(links),
    };
  },
});

/**
 * Runs `effect` inside a freshly opened span named `spanName`, created
 * through a sanitizing tracer that suppresses `sanitizedKeys` (default:
 * {@link defaultSanitizedSpanKeys}) on every attribute set during the span's
 * lifetime — including the raw `parameters` attribute upstream `Toolkit`
 * dispatch sets via `Effect.annotateCurrentSpan`.
 *
 * **When to use**
 *
 * Wrap MCP `tools/call` dispatch (e.g. around `built.handle(name, params)`
 * or `McpServer.callTool(...)`) with this combinator so tool parameters
 * never reach exported span attributes.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { withSanitizedToolSpan } from "@beep/mcp-kit"
 *
 * const program = withSanitizedToolSpan("mcp.tool.call", Effect.annotateCurrentSpan({ parameters: { secret: "x" } }))
 * Effect.runSync(program)
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const withSanitizedToolSpan = <A, E, R>(
  spanName: string,
  effect: Effect.Effect<A, E, R>,
  options?: { readonly sanitizedKeys?: ReadonlyArray<string> }
): Effect.Effect<A, E, R> =>
  Effect.flatMap(Effect.tracer, (tracer) =>
    Effect.withTracer(
      Effect.withSpan(effect, spanName),
      sanitizeTracerAttributes(tracer, options?.sanitizedKeys ?? defaultSanitizedSpanKeys)
    )
  );
