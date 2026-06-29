/**
 * Observability helpers for the wink NLP driver.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { $WinkId } from "@beep/identity";
import { AiToolError } from "@beep/nlp-processing/Tools";
import { observeWorkflow, summarizeCause } from "@beep/observability";
import { Str } from "@beep/utils";
import { Effect, Inspectable, Metric } from "effect";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import type { Cause } from "effect";

const $I = $WinkId.create("Wink/WinkObservability");

const winkWorkflowStarted = Metric.counter("wink_workflow_started_total");
const winkWorkflowCompleted = Metric.counter("wink_workflow_completed_total");
const winkWorkflowFailed = Metric.counter("wink_workflow_failed_total");
const winkWorkflowInterrupted = Metric.counter("wink_workflow_interrupted_total");
const winkWorkflowDuration = Metric.timer("wink_workflow_duration");

const packageAttributes = {
  driver: "wink",
  package: "@beep/wink",
} as const;

const stringProperty = (value: unknown, key: string): O.Option<string> => {
  if (!P.isObject(value) || !P.hasProperty(value, key)) {
    return O.none();
  }

  const field = value[key];
  return P.isString(field) ? O.some(field) : O.none();
};

const errorMessage = (error: unknown): string =>
  stringProperty(error, "message").pipe(O.getOrElse(() => Inspectable.toStringUnknown(error)));

const errorReason = (error: unknown): O.Option<string> =>
  stringProperty(error, "_tag").pipe(O.orElse(() => stringProperty(error, "name")));

const mergeAttributes = (
  left: Record<string, string> | undefined,
  right: Record<string, string> | undefined
): Record<string, string> => ({
  ...packageAttributes,
  ...(left ?? {}),
  ...(right ?? {}),
});

/**
 * Workflow observation options shared by wink services and tool handlers.
 *
 * Use `attributes` for span/log detail and `metricAttributes` for
 * low-cardinality metric dimensions.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { observeWinkWorkflow } from "@beep/wink"
 *
 * const observed = Effect.succeed("ok").pipe(
 *   observeWinkWorkflow({ name: "tokenize" })
 * )
 *
 * console.log(observed)
 * ```
 *
 * @category observability
 * @since 0.0.0
 */
export class WinkWorkflowObservationOptions extends S.Class<WinkWorkflowObservationOptions>(
  $I`WinkWorkflowObservationOptions`
)(
  {
    attributes: S.optionalKey(S.Record(S.String, S.String)),
    metricAttributes: S.optionalKey(S.Record(S.String, S.String)),
    name: S.String,
  },
  $I.annote("WinkWorkflowObservationOptions", {
    description: "Options used to observe one wink workflow with spans, logs, and metrics.",
  })
) {}

/**
 * Tool observation options used when mapping driver failures to AI tool errors.
 *
 * @example
 * ```ts
 * import { WinkToolObservationOptions } from "@beep/wink"
 *
 * const options = WinkToolObservationOptions.make({
 *   operation: "query",
 *   toolName: "QueryCorpus"
 * })
 *
 * console.log(options.toolName)
 * ```
 *
 * @category observability
 * @since 0.0.0
 */
export class WinkToolObservationOptions extends S.Class<WinkToolObservationOptions>($I`WinkToolObservationOptions`)(
  {
    attributes: S.optionalKey(S.Record(S.String, S.String)),
    operation: S.String,
    retryable: S.optionalKey(S.Boolean),
    toolName: S.String,
  },
  $I.annote("WinkToolObservationOptions", {
    description: "Options used to observe a wink-backed AI tool handler.",
  })
) {}

/**
 * Build a span-safe text length annotation without recording raw text.
 *
 * @example
 * ```ts
 * import { textLengthAttribute } from "@beep/wink"
 *
 * console.log(textLengthAttribute("query", "refund policy"))
 * ```
 *
 * @category observability
 * @since 0.0.0
 */
export const textLengthAttribute = (name: string, text: string): Record<string, string> => ({
  [`${name}_length`]: `${Str.length(text)}`,
});

/**
 * Merge extra string attributes into a wink observability attribute record.
 *
 * @example
 * ```ts
 * import { withWinkAttributes } from "@beep/wink"
 *
 * const attrs = withWinkAttributes(
 *   { tool_name: "Tokenize" },
 *   { operation: "tokenize" }
 * )
 *
 * console.log(attrs.operation)
 * ```
 *
 * @category observability
 * @since 0.0.0
 */
export const withWinkAttributes: {
  (attributes: Record<string, string>, extra: Record<string, string>): Record<string, string>;
  (extra: Record<string, string>): (attributes: Record<string, string>) => Record<string, string>;
} = dual(
  2,
  (attributes: Record<string, string>, extra: Record<string, string>): Record<string, string> =>
    mergeAttributes(attributes, extra)
);

/**
 * Observe a wink workflow with standard metrics and span annotations.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { observeWinkWorkflow } from "@beep/wink"
 *
 * const program = Effect.succeed(1).pipe(
 *   observeWinkWorkflow({ name: "vectorize" })
 * )
 *
 * console.log(program)
 * ```
 *
 * @category observability
 * @since 0.0.0
 */
export const observeWinkWorkflow: {
  <A, E, R>(effect: Effect.Effect<A, E, R>, options: WinkWorkflowObservationOptions): Effect.Effect<A, E, R>;
  (options: WinkWorkflowObservationOptions): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
} = dual(
  2,
  <A, E, R>(effect: Effect.Effect<A, E, R>, options: WinkWorkflowObservationOptions): Effect.Effect<A, E, R> => {
    const spanAttributes = mergeAttributes(options.attributes, {
      workflow_name: options.name,
    });
    const metricAttributes = mergeAttributes(options.metricAttributes, {
      workflow_name: options.name,
    });

    return observeWorkflow(Effect.annotateCurrentSpan(spanAttributes).pipe(Effect.andThen(effect)), {
      attributes: metricAttributes,
      completed: winkWorkflowCompleted,
      duration: winkWorkflowDuration,
      failed: winkWorkflowFailed,
      interrupted: winkWorkflowInterrupted,
      name: `wink.${options.name}`,
      started: winkWorkflowStarted,
    }).pipe(Effect.withSpan(`Wink.${options.name}`));
  }
);

/**
 * Convert an expected wink driver failure into an AI tool error payload.
 *
 * @example
 * ```ts
 * import { makeWinkToolError } from "@beep/wink"
 *
 * const error = makeWinkToolError({
 *   operation: "query",
 *   toolName: "QueryCorpus"
 * }, new Error("Corpus not found"))
 *
 * console.log(error.retryable)
 * ```
 *
 * @category observability
 * @since 0.0.0
 */
export const makeWinkToolError = (options: WinkToolObservationOptions, error: unknown): typeof AiToolError.Type => {
  const reason = errorReason(error);
  return AiToolError.make({
    message: errorMessage(error),
    operation: options.operation,
    ...(O.isSome(reason) ? { reason: reason.value } : {}),
    retryable: options.retryable ?? false,
    toolName: options.toolName,
  });
};

const logWinkToolFailure =
  (options: WinkToolObservationOptions) =>
  (cause: Cause.Cause<unknown>): Effect.Effect<void> => {
    const summary = summarizeCause(cause);

    return Effect.logWarning("wink tool failed").pipe(
      Effect.annotateLogs({
        errorClassification: summary.classification,
        errorFingerprint: summary.fingerprint.value,
        errorMessage: summary.primaryMessage,
        operation: options.operation,
        retryable: `${options.retryable ?? false}`,
        toolName: options.toolName,
      })
    );
  };

/**
 * Map the error channel of a wink-backed tool effect to {@link AiToolError}.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { mapWinkToolError } from "@beep/wink"
 *
 * const program = Effect.fail(new Error("bad corpus")).pipe(
 *   mapWinkToolError({ operation: "query", toolName: "QueryCorpus" })
 * )
 *
 * console.log(program)
 * ```
 *
 * @category observability
 * @since 0.0.0
 */
export const mapWinkToolError: {
  <A, E, R>(
    effect: Effect.Effect<A, E, R>,
    options: WinkToolObservationOptions
  ): Effect.Effect<A, typeof AiToolError.Type, R>;
  (
    options: WinkToolObservationOptions
  ): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, typeof AiToolError.Type, R>;
} = dual(
  2,
  <A, E, R>(
    effect: Effect.Effect<A, E, R>,
    options: WinkToolObservationOptions
  ): Effect.Effect<A, typeof AiToolError.Type, R> =>
    effect.pipe(
      Effect.tapCause(logWinkToolFailure(options)),
      Effect.mapError((error) => makeWinkToolError(options, error))
    )
);

/**
 * Observe a wink-backed AI tool and surface expected failures as structured
 * tool errors.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { observeWinkTool } from "@beep/wink"
 *
 * const observed = Effect.succeed("ok").pipe(
 *   observeWinkTool({ operation: "tokenize", toolName: "Tokenize" })
 * )
 *
 * console.log(observed)
 * ```
 *
 * @category observability
 * @since 0.0.0
 */
export const observeWinkTool: {
  <A, E, R>(
    effect: Effect.Effect<A, E, R>,
    options: WinkToolObservationOptions
  ): Effect.Effect<A, typeof AiToolError.Type, R>;
  (
    options: WinkToolObservationOptions
  ): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, typeof AiToolError.Type, R>;
} = dual(
  2,
  <A, E, R>(
    effect: Effect.Effect<A, E, R>,
    options: WinkToolObservationOptions
  ): Effect.Effect<A, typeof AiToolError.Type, R> =>
    effect.pipe(
      observeWinkWorkflow({
        attributes: mergeAttributes(options.attributes, {
          operation: options.operation,
          tool_name: options.toolName,
        }),
        metricAttributes: {
          operation: options.operation,
          tool_name: options.toolName,
        },
        name: `tool.${options.toolName}`,
      }),
      mapWinkToolError(options)
    )
);
