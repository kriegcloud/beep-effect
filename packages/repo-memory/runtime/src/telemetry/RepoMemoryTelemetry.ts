/**
 * Repo-memory runtime metrics and phase profiling helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoMemoryRuntimeId } from "@beep/identity";
import { measureElapsedMillis as measureElapsedMillisShared, profilePhase } from "@beep/observability";
import { LiteralKit } from "@beep/schema";
import { Duration, Effect, Metric } from "effect";
import { dual } from "effect/Function";

const $I = $RepoMemoryRuntimeId.create("telemetry/RepoMemoryTelemetry");
/**
 * Metric label for the two public repo-memory workflow families.
 *
 * @example
 * ```ts
 * import { RepoRunKindMetric } from "@beep/repo-memory-runtime"
 *
 * const schema = RepoRunKindMetric
 * ```
 *
 * @since 0.0.0
 * @category cross cutting
 */
export const RepoRunKindMetric = LiteralKit(["index", "query"]).pipe(
  $I.annoteSchema("RepoRunKindMetric", {
    description: "Metric label for the two public repo-memory workflow families.",
  })
);
/**
 * Runtime type for the repo-memory workflow metric label schema.
 *
 * @example
 * ```ts
 * import type { RepoRunKindMetric } from "@beep/repo-memory-runtime"
 *
 * const kind: RepoRunKindMetric = "index"
 * ```
 *
 * @since 0.0.0
 * @category observability
 */
export type RepoRunKindMetric = typeof RepoRunKindMetric.Type;

/**
 * Metric label for deterministic grounded query interpretations.
 *
 * @example
 * ```ts
 * import { QueryKindMetric } from "@beep/repo-memory-runtime"
 *
 * const schema = QueryKindMetric
 * ```
 *
 * @since 0.0.0
 * @category cross cutting
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
  "listSymbolImporters",
  "listFileDependencies",
  "listFileDependents",
  "keywordSearch",
  "unsupported",
]).pipe(
  $I.annoteSchema("QueryKindMetric", {
    description: "Metric label for deterministic grounded query interpretations.",
  })
);
/**
 * Runtime type for the grounded query kind metric label schema.
 *
 * @example
 * ```ts
 * import type { QueryKindMetric } from "@beep/repo-memory-runtime"
 *
 * const kind: QueryKindMetric = "keywordSearch"
 * ```
 *
 * @since 0.0.0
 * @category observability
 */
export type QueryKindMetric = typeof QueryKindMetric.Type;

/**
 * Metric label for terminal workflow outcomes.
 *
 * @example
 * ```ts
 * import { RunOutcomeMetric } from "@beep/repo-memory-runtime"
 *
 * const schema = RunOutcomeMetric
 * ```
 *
 * @since 0.0.0
 * @category cross cutting
 */
export const RunOutcomeMetric = LiteralKit(["completed", "failed", "interrupted"]).pipe(
  $I.annoteSchema("RunOutcomeMetric", {
    description: "Metric label for terminal workflow outcomes.",
  })
);
/**
 * Runtime type for the terminal workflow outcome metric label schema.
 *
 * @example
 * ```ts
 * import type { RunOutcomeMetric } from "@beep/repo-memory-runtime"
 *
 * const outcome: RunOutcomeMetric = "completed"
 * ```
 *
 * @since 0.0.0
 * @category observability
 */
export type RunOutcomeMetric = typeof RunOutcomeMetric.Type;

/**
 * Metric label for grounded query result quality.
 *
 * @example
 * ```ts
 * import { QueryOutcomeMetric } from "@beep/repo-memory-runtime"
 *
 * const schema = QueryOutcomeMetric
 * ```
 *
 * @since 0.0.0
 * @category cross cutting
 */
export const QueryOutcomeMetric = LiteralKit(["cited", "notCited", "unsupported"]).pipe(
  $I.annoteSchema("QueryOutcomeMetric", {
    description: "Metric label for grounded query result quality.",
  })
);
/**
 * Runtime type for the grounded query result outcome metric label schema.
 *
 * @example
 * ```ts
 * import type { QueryOutcomeMetric } from "@beep/repo-memory-runtime"
 *
 * const outcome: QueryOutcomeMetric = "cited"
 * ```
 *
 * @since 0.0.0
 * @category observability
 */
export type QueryOutcomeMetric = typeof QueryOutcomeMetric.Type;

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
const phasesStartedTotal = Metric.counter("beep_repo_memory_phase_started_total", {
  description: "Total repo-memory phases that started execution.",
  incremental: true,
});
const phasesCompletedTotal = Metric.counter("beep_repo_memory_phase_completed_total", {
  description: "Total repo-memory phases that completed successfully.",
  incremental: true,
});
const phasesFailedTotal = Metric.counter("beep_repo_memory_phase_failed_total", {
  description: "Total repo-memory phases that failed.",
  incremental: true,
});
const phasesInterruptedTotal = Metric.counter("beep_repo_memory_phase_interrupted_total", {
  description: "Total repo-memory phases that were interrupted.",
  incremental: true,
});
const phaseDuration = Metric.timer("beep_repo_memory_phase_duration_ms", {
  description: "Duration for named repo-memory phases.",
});

const metricAttributes = (attributes: Record<string, string>) => attributes;

type ProfileRunPhaseOptions = {
  readonly runKind: RepoRunKindMetric;
  readonly phase: string;
};

/**
 * Record that one repo-memory run started.
 *
 * @example
 * ```ts
 * import { recordRunStarted } from "@beep/repo-memory-runtime"
 *
 * const record = recordRunStarted
 * ```
 *
 * @since 0.0.0
 * @category cross cutting
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
 * @example
 * ```ts
 * import { recordRunFinished } from "@beep/repo-memory-runtime"
 *
 * const record = recordRunFinished
 * ```
 *
 * @since 0.0.0
 * @category cross cutting
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
 * @example
 * ```ts
 * import { recordQueryInterpretation } from "@beep/repo-memory-runtime"
 *
 * const record = recordQueryInterpretation
 * ```
 *
 * @since 0.0.0
 * @category cross cutting
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
 * @example
 * ```ts
 * import { recordQueryResult } from "@beep/repo-memory-runtime"
 *
 * const record = recordQueryResult
 * ```
 *
 * @since 0.0.0
 * @category cross cutting
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
 * @example
 * ```ts
 * import { recordIndexedFileCount } from "@beep/repo-memory-runtime"
 *
 * const record = recordIndexedFileCount
 * ```
 *
 * @since 0.0.0
 * @category cross cutting
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
 * @example
 * ```ts
 * import { measureElapsedMillis } from "@beep/repo-memory-runtime"
 * import { Effect } from "effect"
 *
 * const measured = measureElapsedMillis(Effect.succeed("ok"))
 * ```
 *
 * @since 0.0.0
 * @category cross cutting
 */
export const measureElapsedMillis = <A, E, R>(
  effect: Effect.Effect<A, E, R>
): Effect.Effect<readonly [A, number], E, R> => measureElapsedMillisShared(effect);

/**
 * Profile one repo-memory phase with shared phase metrics.
 *
 * @example
 * ```ts
 * import { profileRunPhase } from "@beep/repo-memory-runtime"
 * import { Effect } from "effect"
 *
 * const profiled = profileRunPhase(Effect.succeed("ok"), {
 *   runKind: "index",
 *   phase: "indexing"
 * })
 * ```
 *
 * @since 0.0.0
 * @category cross cutting
 */
export const profileRunPhase: {
  (options: ProfileRunPhaseOptions): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
  <A, E, R>(effect: Effect.Effect<A, E, R>, options: ProfileRunPhaseOptions): Effect.Effect<A, E, R>;
} = dual(
  2,
  <A, E, R>(effect: Effect.Effect<A, E, R>, options: ProfileRunPhaseOptions): Effect.Effect<A, E, R> =>
    profilePhase(effect, {
      phase: options.phase,
      attributes: metricAttributes({
        run_kind: options.runKind,
      }),
      started: phasesStartedTotal,
      completed: phasesCompletedTotal,
      failed: phasesFailedTotal,
      interrupted: phasesInterruptedTotal,
      duration: phaseDuration,
    })
);
