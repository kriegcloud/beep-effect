/**
 * Effect metric observation helpers for duration tracking, workflow profiling,
 * and HTTP request instrumentation.
 *
 * All helpers wrap an inner `Effect` and transparently record metrics and span
 * annotations without altering the original success/failure semantics.
 *
 * @example
 * ```typescript
 * import { Effect, Metric, Duration } from "effect"
 * import { measureElapsedMillis, trackDuration } from "@beep/observability"
 *
 * const timer = Metric.timer("my_op_duration")
 *
 * const program = trackDuration(
 *
 *
 * )
 *
 * void Effect.runPromise(program)
 * ```
 *
 * @module
 * @since 0.0.0
 */

import { Clock, Duration, Effect, Exit, Metric, pipe } from "effect";
import { dual } from "effect/Function";
import * as P from "effect/Predicate";

interface TrackDurationOptions {
  readonly attributes?: Record<string, string> | undefined;
}

interface ObserveWorkflowOptions {
  readonly attributes?: Record<string, string> | undefined;
  readonly completed?: Metric.Counter<number> | undefined;
  readonly duration?: Metric.Metric<Duration.Duration, unknown> | undefined;
  readonly failed?: Metric.Counter<number> | undefined;
  readonly interrupted?: Metric.Counter<number> | undefined;
  readonly name: string;
  readonly started?: Metric.Counter<number> | undefined;
}

interface ObserveHttpRequestOptions {
  readonly method: string;
  readonly requestDuration: Metric.Metric<Duration.Duration, unknown>;
  readonly requestsTotal: Metric.Counter<number>;
  readonly route: string;
  readonly successStatus: number;
}

const defaultTrackDurationOptions: TrackDurationOptions = { attributes: undefined };

const isTrackDurationOptions = (
  options: TrackDurationOptions | Record<string, string>
): options is TrackDurationOptions => P.hasProperty(options, "attributes");

const normalizeTrackDurationOptions = (options: TrackDurationOptions | Record<string, string>): TrackDurationOptions =>
  isTrackDurationOptions(options) ? options : { attributes: options };

const isTrackDurationDataFirst = (args: IArguments): boolean => Effect.isEffect(args[0]) || Effect.isEffect(args[1]);

const isEffectPairDataFirst = (args: IArguments): boolean => args.length >= 2 || Effect.isEffect(args[0]);

const withMetricAttributes = <Input, State>(
  metric: Metric.Metric<Input, State>,
  attributes: undefined | Record<string, string>
): Metric.Metric<Input, State> => (P.isUndefined(attributes) ? metric : Metric.withAttributes(metric, attributes));

const incrementCounter = (
  counter: undefined | Metric.Counter<number>,
  attributes: undefined | Record<string, string>
): Effect.Effect<void> =>
  counter === undefined ? Effect.void : Metric.update(withMetricAttributes(counter, attributes), 1);

/**
 * Normalize an HTTP status code to its class label (e.g. `"2xx"`, `"4xx"`).
 *
 * Returns `"unknown"` for status codes outside the 100-599 range.
 *
 * @example
 * ```typescript
 * import { statusClass } from "@beep/observability"
 *
 * console.log(statusClass(200)) // "2xx"
 * console.log(statusClass(404)) // "4xx"
 * console.log(statusClass(503)) // "5xx"
 * console.log(statusClass(999)) // "unknown"
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const statusClass = (status: number): string => {
  if (status >= 100 && status < 600) {
    return `${Math.trunc(status / 100)}xx`;
  }

  return "unknown";
};

/**
 * Measure wall-clock elapsed milliseconds for an effect.
 *
 * Returns a tuple of `[result, elapsedMs]` without altering the inner
 * effect's success or failure semantics.
 *
 * @example
 * ```typescript
 * import { Effect } from "effect"
 * import { measureElapsedMillis } from "@beep/observability"
 *
 * const program = measureElapsedMillis(
 *
 * ).pipe(
 *
 *
 *
 * )
 *
 * void Effect.runPromise(program)
 * ```
 *
 * @since 0.0.0
 * @category observability
 */
export const measureElapsedMillis = <A, E, R>(
  effect: Effect.Effect<A, E, R>
): Effect.Effect<readonly [A, number], E, R> =>
  pipe(
    Clock.currentTimeMillis,
    Effect.flatMap((startedAt) =>
      effect.pipe(
        Effect.flatMap((value) =>
          Clock.currentTimeMillis.pipe(Effect.map((endedAt) => [value, Math.max(0, endedAt - startedAt)] as const))
        )
      )
    )
  );

/**
 * Track one timer metric around an effect.
 *
 * Records the wall-clock elapsed duration into the provided metric and
 * annotates the current span with `duration_ms`.
 *
 * @example
 * ```typescript
 * import { Effect, Metric } from "effect"
 * import { trackDuration } from "@beep/observability"
 *
 * const timer = Metric.timer("user_create_duration")
 *
 * const createUser = Effect.succeed({ id: "user__1", name: "Alice" })
 *
 * const tracked = trackDuration(timer, createUser, { service: "iam" })
 *
 * void Effect.runPromise(tracked)
 * ```
 *
 * @since 0.0.0
 * @category observability
 */
const trackDurationImpl = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
  metric: Metric.Metric<Duration.Duration, unknown>,
  options: TrackDurationOptions
): Effect.Effect<A, E, R> =>
  measureElapsedMillis(effect).pipe(
    Effect.tap(([_, elapsedMs]) =>
      Metric.update(withMetricAttributes(metric, options.attributes), Duration.millis(elapsedMs)).pipe(
        Effect.andThen(Effect.annotateCurrentSpan("duration_ms", elapsedMs))
      )
    ),
    Effect.map(([value]) => value)
  );

/**
 * Tracks the elapsed duration of an Effect with a metric.
 *
 * @category observability
 * @since 0.0.0
 */
export const trackDuration: {
  <A, E, R>(
    effect: Effect.Effect<A, E, R>,
    metric: Metric.Metric<Duration.Duration, unknown>,
    options: TrackDurationOptions
  ): Effect.Effect<A, E, R>;
  <A, E, R>(effect: Effect.Effect<A, E, R>, metric: Metric.Metric<Duration.Duration, unknown>): Effect.Effect<A, E, R>;
  (
    metric: Metric.Metric<Duration.Duration, unknown>,
    options: TrackDurationOptions
  ): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
  (
    metric: Metric.Metric<Duration.Duration, unknown>
  ): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
  <A, E, R>(
    metric: Metric.Metric<Duration.Duration, unknown>,
    effect: Effect.Effect<A, E, R>,
    attributes?: Record<string, string>
  ): Effect.Effect<A, E, R>;
} = dual(
  isTrackDurationDataFirst,
  <A, E, R>(
    effect: Effect.Effect<A, E, R> | Metric.Metric<Duration.Duration, unknown>,
    metric: Metric.Metric<Duration.Duration, unknown> | Effect.Effect<A, E, R>,
    options: TrackDurationOptions | Record<string, string> = defaultTrackDurationOptions
  ): Effect.Effect<A, E, R> => {
    const normalizedOptions = normalizeTrackDurationOptions(options);

    if (Effect.isEffect(effect) && !Effect.isEffect(metric)) {
      return trackDurationImpl(effect, metric, normalizedOptions);
    }

    if (Effect.isEffect(metric) && !Effect.isEffect(effect)) {
      return trackDurationImpl(metric, effect, normalizedOptions);
    }

    return Effect.die("Invalid trackDuration arguments");
  }
);

/**
 * Observe one workflow with start, terminal outcome, and duration metrics.
 *
 * Wraps an effect and records lifecycle counters (`started`, `completed`,
 * `failed`, `interrupted`) plus an optional duration metric. The current
 * span is annotated with `workflow_name`, `workflow_duration_ms`, and
 * `workflow_outcome`.
 *
 * @example
 * ```typescript
 * import { Effect, Metric } from "effect"
 * import { observeWorkflow } from "@beep/observability"
 *
 * const started = Metric.counter("workflow_started_total")
 * const completed = Metric.counter("workflow_completed_total")
 * const failed = Metric.counter("workflow_failed_total")
 * const duration = Metric.timer("workflow_duration")
 *
 * const myWorkflow = Effect.succeed("result")
 *
 * const observed = observeWorkflow(
 *
 *
 *
 *
 *
 *
 *
 *
 *
 * )
 *
 * void Effect.runPromise(observed)
 * ```
 *
 * @since 0.0.0
 * @category observability
 */
const observeWorkflowImpl = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
  options: ObserveWorkflowOptions
): Effect.Effect<A, E, R> =>
  Clock.currentTimeMillis.pipe(
    Effect.flatMap((startedAt) =>
      incrementCounter(options.started, options.attributes).pipe(
        Effect.andThen(Effect.annotateCurrentSpan("workflow_name", options.name)),
        Effect.andThen(effect),
        Effect.onExit((exit) =>
          Clock.currentTimeMillis.pipe(
            Effect.flatMap((endedAt) => {
              const durationMs = Math.max(0, endedAt - startedAt);
              const outcome = Exit.isSuccess(exit) ? "completed" : Exit.hasInterrupts(exit) ? "interrupted" : "failed";
              const outcomeEffect =
                outcome === "completed"
                  ? incrementCounter(options.completed, options.attributes)
                  : outcome === "interrupted"
                    ? incrementCounter(options.interrupted, options.attributes)
                    : incrementCounter(options.failed, options.attributes);
              const durationEffect =
                options.duration === undefined
                  ? Effect.void
                  : Metric.update(
                      withMetricAttributes(options.duration, options.attributes),
                      Duration.millis(durationMs)
                    );

              return Effect.annotateCurrentSpan({
                workflow_duration_ms: durationMs,
                workflow_outcome: outcome,
              }).pipe(Effect.andThen(durationEffect), Effect.andThen(outcomeEffect));
            })
          )
        )
      )
    )
  );

/**
 * Observes workflow duration and outcome metrics for an Effect.
 *
 * @category observability
 * @since 0.0.0
 */
export const observeWorkflow: {
  <A, E, R>(effect: Effect.Effect<A, E, R>, options: ObserveWorkflowOptions): Effect.Effect<A, E, R>;
  <A, E, R>(options: ObserveWorkflowOptions, effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R>;
  (options: ObserveWorkflowOptions): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
} = dual(
  isEffectPairDataFirst,
  <A, E, R>(
    effect: Effect.Effect<A, E, R> | ObserveWorkflowOptions,
    options: ObserveWorkflowOptions | Effect.Effect<A, E, R> | undefined
  ): Effect.Effect<A, E, R> => {
    if (Effect.isEffect(effect) && P.isNotUndefined(options) && !Effect.isEffect(options)) {
      return observeWorkflowImpl(effect, options);
    }

    if (!Effect.isEffect(effect) && Effect.isEffect(options)) {
      return observeWorkflowImpl(options, effect);
    }

    return Effect.die("Invalid observeWorkflow arguments");
  }
);

/**
 * Observe one HTTP request with success and failure metrics.
 *
 * Wraps an effect whose error type carries a `status` field. Records
 * `requestsTotal` and `requestDuration` metrics with `method`, `route`,
 * and `status_class` attributes. The current span is annotated with
 * `http_status`, `http_status_class`, and `http_request_duration_ms`.
 *
 * @example
 * ```typescript
 * import { Effect, Metric } from "effect"
 * import { observeHttpRequest } from "@beep/observability"
 *
 * const requestsTotal = Metric.counter("http_requests_total")
 * const requestDuration = Metric.timer("http_request_duration")
 *
 * const handler = Effect.succeed({ id: 1, name: "Alice" })
 *
 * const observed = observeHttpRequest(
 *
 *
 *
 *
 *
 *
 *
 *
 * )
 *
 * void Effect.runPromise(observed)
 * ```
 *
 * @since 0.0.0
 * @category observability
 */
const observeHttpRequestImpl = <A, E extends { readonly status: number }, R>(
  effect: Effect.Effect<A, E, R>,
  options: ObserveHttpRequestOptions
): Effect.Effect<A, E, R> =>
  Clock.currentTimeMillis.pipe(
    Effect.flatMap((startedAt) =>
      effect.pipe(
        Effect.matchEffect({
          onFailure: (error) =>
            Clock.currentTimeMillis.pipe(
              Effect.flatMap((endedAt) => {
                const durationMs = Math.max(0, endedAt - startedAt);
                const attributes = {
                  method: options.method,
                  route: options.route,
                  status_class: statusClass(error.status),
                };

                return Effect.annotateCurrentSpan({
                  http_status: error.status,
                  http_status_class: statusClass(error.status),
                  http_request_duration_ms: durationMs,
                }).pipe(
                  Effect.andThen(Metric.update(Metric.withAttributes(options.requestsTotal, attributes), 1)),
                  Effect.andThen(
                    Metric.update(
                      Metric.withAttributes(options.requestDuration, attributes),
                      Duration.millis(durationMs)
                    )
                  ),
                  Effect.andThen(Effect.fail(error))
                );
              })
            ),
          onSuccess: (value) =>
            Clock.currentTimeMillis.pipe(
              Effect.flatMap((endedAt) => {
                const durationMs = Math.max(0, endedAt - startedAt);
                const attributes = {
                  method: options.method,
                  route: options.route,
                  status_class: statusClass(options.successStatus),
                };

                return Effect.annotateCurrentSpan({
                  http_status: options.successStatus,
                  http_status_class: statusClass(options.successStatus),
                  http_request_duration_ms: durationMs,
                }).pipe(
                  Effect.andThen(Metric.update(Metric.withAttributes(options.requestsTotal, attributes), 1)),
                  Effect.andThen(
                    Metric.update(
                      Metric.withAttributes(options.requestDuration, attributes),
                      Duration.millis(durationMs)
                    )
                  ),
                  Effect.as(value)
                );
              })
            ),
        })
      )
    )
  );

/**
 * Observes HTTP request duration and status metrics for an Effect.
 *
 * @category observability
 * @since 0.0.0
 */
export const observeHttpRequest: {
  <A, E extends { readonly status: number }, R>(
    effect: Effect.Effect<A, E, R>,
    options: ObserveHttpRequestOptions
  ): Effect.Effect<A, E, R>;
  <A, E extends { readonly status: number }, R>(
    options: ObserveHttpRequestOptions,
    effect: Effect.Effect<A, E, R>
  ): Effect.Effect<A, E, R>;
  (
    options: ObserveHttpRequestOptions
  ): <A, E extends { readonly status: number }, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
} = dual(
  isEffectPairDataFirst,
  <A, E extends { readonly status: number }, R>(
    effect: Effect.Effect<A, E, R> | ObserveHttpRequestOptions,
    options: ObserveHttpRequestOptions | Effect.Effect<A, E, R> | undefined
  ): Effect.Effect<A, E, R> => {
    if (Effect.isEffect(effect) && P.isNotUndefined(options) && !Effect.isEffect(options)) {
      return observeHttpRequestImpl(effect, options);
    }

    if (!Effect.isEffect(effect) && Effect.isEffect(options)) {
      return observeHttpRequestImpl(options, effect);
    }

    return Effect.die("Invalid observeHttpRequest arguments");
  }
);
