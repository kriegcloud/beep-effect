import { DateTime, Duration, Effect, Metric } from "effect";
import { dual } from "effect/Function";

const driverOperationDuration = Metric.timer("beep_repo_memory_driver_operation_duration_ms", {
  description: "Duration of public local repo-memory driver operations.",
});

const currentTimeMillis = DateTime.now.pipe(Effect.map(DateTime.toEpochMillis));

const metricAttributes = (attributes: Record<string, string>) => attributes;

const recordDriverOperationDuration = Effect.fn("RepoMemorySql.recordOperationDuration")(function* (
  operation: string,
  outcome: "success" | "failure",
  durationMs: number
) {
  const normalizedDurationMs = Math.max(0, durationMs);

  yield* Effect.annotateCurrentSpan({
    operation,
    outcome,
    driver_operation_duration_ms: normalizedDurationMs,
  });
  yield* Metric.update(
    Metric.withAttributes(
      driverOperationDuration,
      metricAttributes({
        operation,
        outcome,
      })
    ),
    Duration.millis(normalizedDurationMs)
  );
});

/**
 * Observe one public repo-memory sqlite operation with success/failure timing.
 *
 * @since 0.0.0
 * @category CrossCutting
 */
export const observeDriverOperation: {
  <A, E, R>(effect: Effect.Effect<A, E, R>): (operation: string) => Effect.Effect<A, E, R>;
  <A, E, R>(operation: string, effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R>;
} = dual(
  2,
  <A, E, R>(operation: string, effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> =>
    currentTimeMillis.pipe(
      Effect.flatMap((startedAt) =>
        effect.pipe(
          Effect.matchEffect({
            onFailure: (error) =>
              currentTimeMillis.pipe(
                Effect.flatMap((endedAt) =>
                  recordDriverOperationDuration(operation, "failure", endedAt - startedAt).pipe(
                    Effect.andThen(Effect.fail(error))
                  )
                )
              ),
            onSuccess: (value) =>
              currentTimeMillis.pipe(
                Effect.flatMap((endedAt) =>
                  recordDriverOperationDuration(operation, "success", endedAt - startedAt).pipe(Effect.as(value))
                )
              ),
          })
        )
      )
    )
);
