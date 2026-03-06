import { DateTime, Duration, Effect, Metric } from "effect";

export type RepoRunKindMetric = "index" | "query";
export type QueryKindMetric =
  | "countFiles"
  | "countSymbols"
  | "locateSymbol"
  | "describeSymbol"
  | "listFileExports"
  | "listFileImports"
  | "listFileImporters"
  | "keywordSearch"
  | "unsupported";
export type RunOutcomeMetric = "completed" | "failed";
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
    Metric.withAttributes(outcome === "completed" ? runsCompletedTotal : runsFailedTotal, attributes),
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
