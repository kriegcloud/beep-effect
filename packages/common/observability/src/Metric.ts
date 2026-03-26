import { Clock, Duration, Effect, Exit, Metric } from "effect";

const withMetricAttributes = <Input, State>(
  metric: Metric.Metric<Input, State>,
  attributes: undefined | Record<string, string>
): Metric.Metric<Input, State> => (attributes === undefined ? metric : Metric.withAttributes(metric, attributes));

const incrementCounter = (
  counter: undefined | Metric.Counter<number>,
  attributes: undefined | Record<string, string>
): Effect.Effect<void> =>
  counter === undefined ? Effect.void : Metric.update(withMetricAttributes(counter, attributes), 1);

/**
 * Normalize an HTTP status to its class label.
 *
 * @since 0.0.0
 * @category Observability
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
 * @since 0.0.0
 * @category Observability
 */
export const measureElapsedMillis = <A, E, R>(
  effect: Effect.Effect<A, E, R>
): Effect.Effect<readonly [A, number], E, R> =>
  Clock.currentTimeMillis.pipe(
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
 * @since 0.0.0
 * @category Observability
 */
export const trackDuration = <A, E, R>(
  metric: Metric.Metric<Duration.Duration, unknown>,
  effect: Effect.Effect<A, E, R>,
  attributes?: Record<string, string>
): Effect.Effect<A, E, R> =>
  measureElapsedMillis(effect).pipe(
    Effect.tap(([_, elapsedMs]) =>
      Metric.update(withMetricAttributes(metric, attributes), Duration.millis(elapsedMs)).pipe(
        Effect.andThen(Effect.annotateCurrentSpan("duration_ms", elapsedMs))
      )
    ),
    Effect.map(([value]) => value)
  );

/**
 * Observe one workflow with start, terminal outcome, and duration metrics.
 *
 * @since 0.0.0
 * @category Observability
 */
export const observeWorkflow = <A, E, R>(
  options: {
    readonly name: string;
    readonly started?: Metric.Counter<number> | undefined;
    readonly completed?: Metric.Counter<number> | undefined;
    readonly failed?: Metric.Counter<number> | undefined;
    readonly interrupted?: Metric.Counter<number> | undefined;
    readonly duration?: Metric.Metric<Duration.Duration, unknown> | undefined;
    readonly attributes?: Record<string, string> | undefined;
  },
  effect: Effect.Effect<A, E, R>
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
 * Observe one HTTP request with success and failure metrics.
 *
 * @since 0.0.0
 * @category Observability
 */
export const observeHttpRequest = <A, E extends { readonly status: number }, R>(
  options: {
    readonly method: string;
    readonly route: string;
    readonly successStatus: number;
    readonly requestsTotal: Metric.Counter<number>;
    readonly requestDuration: Metric.Metric<Duration.Duration, unknown>;
  },
  effect: Effect.Effect<A, E, R>
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
