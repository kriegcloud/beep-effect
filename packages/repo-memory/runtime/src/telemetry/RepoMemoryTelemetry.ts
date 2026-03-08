import { $RepoMemoryRuntimeId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import { DateTime, Duration, Effect, Metric } from "effect";

const $I = $RepoMemoryRuntimeId.create("telemetry/RepoMemoryTelemetry");
/**
 * Metric label for the two public repo-memory workflow families.
 *
 * @since 0.0.0
 * @category Observability
 */
export const RepoRunKindMetric = LiteralKit(["index", "query"]).pipe(
  $I.annoteSchema("RepoRunKindMetric", {
    description: "Metric label for the two public repo-memory workflow families.",
  })
);
export type RepoRunKindMetric = typeof RepoRunKindMetric.Type;

/**
 * Metric label for deterministic grounded query interpretations.
 *
 * @since 0.0.0
 * @category Observability
 */
export const QueryKindMetric = LiteralKit([
  "countFiles",
  "countSymbols",
  "locateSymbol",
  "describeSymbol",
  "symbolParams",
  "symbolReturns",
  "symbolThrows",
  "symbolDeprecation",
  "listFileExports",
  "listFileImports",
  "listFileImporters",
  "listFileDependencies",
  "listFileDependents",
  "keywordSearch",
  "unsupported",
]).pipe(
  $I.annoteSchema("QueryKindMetric", {
    description: "Metric label for deterministic grounded query interpretations.",
  })
);
export type QueryKindMetric = typeof QueryKindMetric.Type;

/**
 * Metric label for terminal workflow outcomes.
 *
 * @since 0.0.0
 * @category Observability
 */
export type RunOutcomeMetric = "completed" | "failed" | "interrupted";

/**
 * Metric label for grounded query result quality.
 *
 * @since 0.0.0
 * @category Observability
 */
export type QueryOutcomeMetric = "cited" | "notCited" | "unsupported";

const runsStartedTotal = Metric.counter("beep_repo_memory_runs_started_total", {
  description: "Total repo-memory runs that started execution.",
  incremental: true,
});

const runsCompletedTotal = Metric.counter("beep_repo_memory_runs_completed_total", {
  description: "Total repo-memory runs that completed successfully.",
  incremental: true,
});

const runsFailedTotal = Metric.counter("beep_repo_memory_runs_failed_total", {
  description: "Total repo-memory runs that failed during execution.",
  incremental: true,
});

const runsInterruptedTotal = Metric.counter("beep_repo_memory_runs_interrupted_total", {
  description: "Total repo-memory runs that were interrupted during execution.",
  incremental: true,
});

const runDuration = Metric.timer("beep_repo_memory_run_duration_ms", {
  description: "Run duration for repo-memory workflows.",
});

const queryInterpretationsTotal = Metric.counter("beep_repo_memory_query_interpretations_total", {
  description: "Total grounded query interpretations resolved by kind.",
  incremental: true,
});

const queryResultsTotal = Metric.counter("beep_repo_memory_query_results_total", {
  description: "Total grounded query results emitted by kind and outcome.",
  incremental: true,
});

const indexedFileCount = Metric.gauge("beep_repo_memory_indexed_file_count", {
  description: "Latest indexed file count produced by the TypeScript indexer.",
});

const currentTimeMillis = DateTime.now.pipe(Effect.map(DateTime.toEpochMillis));

const metricAttributes = (attributes: Record<string, string>) => attributes;

/**
 * Record that one repo-memory run started.
 *
 * @since 0.0.0
 * @category Observability
 */
export const recordRunStarted = Effect.fn("RepoMemoryMetrics.recordRunStarted")(function* (runKind: RepoRunKindMetric) {
  yield* Effect.annotateCurrentSpan({
    run_kind: runKind,
  });
  yield* Metric.update(
    Metric.withAttributes(
      runsStartedTotal,
      metricAttributes({
        run_kind: runKind,
      })
    ),
    1
  );
});

/**
 * Record one terminal repo-memory run outcome.
 *
 * @since 0.0.0
 * @category Observability
 */
export const recordRunFinished = Effect.fn("RepoMemoryMetrics.recordRunFinished")(function* (
  runKind: RepoRunKindMetric,
  outcome: RunOutcomeMetric,
  durationMs?: number
) {
  const attributes = metricAttributes({
    run_kind: runKind,
    outcome,
  });

  yield* Effect.annotateCurrentSpan({
    run_kind: runKind,
    outcome,
  });

  yield* Metric.update(
    Metric.withAttributes(
      outcome === "completed" ? runsCompletedTotal : outcome === "failed" ? runsFailedTotal : runsInterruptedTotal,
      attributes
    ),
    1
  );

  if (durationMs !== undefined) {
    const normalizedDurationMs = Math.max(0, durationMs);

    yield* Effect.annotateCurrentSpan({
      run_duration_ms: normalizedDurationMs,
    });
    yield* Metric.update(Metric.withAttributes(runDuration, attributes), Duration.millis(normalizedDurationMs));
  }
});

/**
 * Record that one deterministic grounded query interpretation was selected.
 *
 * @since 0.0.0
 * @category Observability
 */
export const recordQueryInterpretation = Effect.fn("RepoMemoryMetrics.recordQueryInterpretation")(function* (
  queryKind: QueryKindMetric
) {
  yield* Effect.annotateCurrentSpan({
    query_kind: queryKind,
  });
  yield* Metric.update(
    Metric.withAttributes(
      queryInterpretationsTotal,
      metricAttributes({
        query_kind: queryKind,
      })
    ),
    1
  );
});

/**
 * Record the final observable quality of one grounded query result.
 *
 * @since 0.0.0
 * @category Observability
 */
export const recordQueryResult = Effect.fn("RepoMemoryMetrics.recordQueryResult")(function* (
  queryKind: QueryKindMetric,
  outcome: QueryOutcomeMetric,
  citationCount: number
) {
  yield* Effect.annotateCurrentSpan({
    query_kind: queryKind,
    outcome,
    citation_count: citationCount,
  });
  yield* Metric.update(
    Metric.withAttributes(
      queryResultsTotal,
      metricAttributes({
        query_kind: queryKind,
        outcome,
      })
    ),
    1
  );
});

/**
 * Record the latest indexed file count emitted by the TypeScript indexer.
 *
 * @since 0.0.0
 * @category Observability
 */
export const recordIndexedFileCount = Effect.fn("RepoMemoryMetrics.recordIndexedFileCount")(function* (
  fileCount: number,
  phase = "completed"
) {
  const normalizedFileCount = Math.max(0, fileCount);

  yield* Effect.annotateCurrentSpan({
    indexed_file_count: normalizedFileCount,
    phase,
  });
  yield* Metric.update(
    Metric.withAttributes(
      indexedFileCount,
      metricAttributes({
        phase,
      })
    ),
    normalizedFileCount
  );
});

/**
 * Measure elapsed wall-clock milliseconds for one effect.
 *
 * @since 0.0.0
 * @category Observability
 */
export const measureElapsedMillis = <A, E, R>(
  effect: Effect.Effect<A, E, R>
): Effect.Effect<readonly [A, number], E, R> =>
  currentTimeMillis.pipe(
    Effect.flatMap((startedAt) =>
      effect.pipe(
        Effect.flatMap((value) =>
          currentTimeMillis.pipe(Effect.map((endedAt) => [value, Math.max(0, endedAt - startedAt)] as const))
        )
      )
    )
  );
