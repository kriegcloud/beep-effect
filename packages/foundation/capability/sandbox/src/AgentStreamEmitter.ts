/**
 * Agent stream event emitter service.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $SandboxId } from "@beep/identity";
import { Context, Effect, Layer } from "effect";
import * as S from "effect/Schema";
import { redactSensitiveText } from "./Sandbox.observability.ts";

const $I = $SandboxId.create("AgentStreamEmitter");

/**
 * A single event in the agent's output stream, surfaced to callers of `run()`
 * so they can forward it to their own observability system.
 *
 * Emitted only in log-to-file mode when an `onAgentStreamEvent` callback is
 * provided via `logging`. See `run()`.
 *
 * @example
 * ```ts
 * import { AgentStreamEvent } from "@beep/sandbox/AgentStreamEmitter"
 *
 * console.log(AgentStreamEvent)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const AgentStreamEvent = S.TaggedUnion({
  Text: {
    message: S.String,
    iteration: S.Finite,
    timestamp: S.DateTimeUtcFromDate,
  },
  ToolCall: {
    name: S.String,
    formattedArgs: S.String,
    iteration: S.Finite,
    timestamp: S.DateTimeUtcFromDate,
  },
}).pipe(
  $I.annoteSchema("AgentStreamEvent", {
    description:
      "A single event in the agent's output stream, surfaced to callers of `run()`\nso they can forward it to their own observability system.",
    documentation:
      "Emitted only in log-to-file mode when an `onAgentStreamEvent` callback is\nprovided via `logging`. See `run()`.",
  })
);

/**
 * Runtime type for {@link AgentStreamEvent}.
 *
 * @category models
 * @since 0.0.0
 */
export type AgentStreamEvent = typeof AgentStreamEvent.Type;

/**
 * Encoded agent stream event helpers.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace AgentStreamEvent {
  /**
   * Encoded representation of {@link AgentStreamEvent}.
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof AgentStreamEvent.Encoded;
}

/**
 * Agent stream emitter service shape.
 *
 * @example
 * ```ts
 * import type { AgentStreamEmitterShape } from "@beep/sandbox/AgentStreamEmitter"
 *
 * const value = {} as AgentStreamEmitterShape
 * console.log(value)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export interface AgentStreamEmitterShape {
  readonly emit: (event: AgentStreamEvent) => Effect.Effect<void>;
}

/**
 * Agent stream emitter service.
 *
 * @example
 * ```ts
 * import { AgentStreamEmitter } from "@beep/sandbox/AgentStreamEmitter"
 *
 * console.log(AgentStreamEmitter)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class AgentStreamEmitter extends Context.Service<AgentStreamEmitter, AgentStreamEmitterShape>()(
  $I`AgentStreamEmitter`
) {}

/**
 * Agent stream emitter layer that discards events.
 *
 * @example
 * ```ts
 * import { noopAgentStreamEmitterLayer } from "@beep/sandbox/AgentStreamEmitter"
 *
 * console.log(noopAgentStreamEmitterLayer)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const noopAgentStreamEmitterLayer: Layer.Layer<AgentStreamEmitter> = Layer.succeed(AgentStreamEmitter, {
  emit: Effect.fnUntraced(function* () {
    return yield* Effect.void;
  }),
});

/**
 * Build a layer that forwards each event to the provided callback.
 * The callback is invoked synchronously inside an `Effect.sync`; any error
 * thrown by the callback is caught and discarded so observability failures
 * cannot kill the run.
 *
 * @example
 * ```ts
 * import { callbackAgentStreamEmitterLayer } from "@beep/sandbox/AgentStreamEmitter"
 *
 * console.log(callbackAgentStreamEmitterLayer)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const callbackAgentStreamEmitterLayer = (
  onEvent: (event: AgentStreamEvent) => void
): Layer.Layer<AgentStreamEmitter> =>
  Layer.succeed(AgentStreamEmitter, {
    emit: Effect.fn("AgentStreamEmitter.emit")(function* (event) {
      const safeEvent =
        event._tag === "Text"
          ? {
              ...event,
              message: redactSensitiveText(event.message),
            }
          : {
              ...event,
              formattedArgs: redactSensitiveText(event.formattedArgs),
            };

      yield* Effect.sync(() => onEvent(safeEvent)).pipe(
        Effect.catchCause(() =>
          Effect.logWarning({
            message: "agent stream callback failed",
          })
        )
      );
    }),
  });
