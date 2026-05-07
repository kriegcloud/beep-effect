/**
 * OTLP span projections for redacted AI metrics derived storage.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { DuckDb } from "@beep/duckdb";
import { $RepoAiMetricsId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { Effect, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { AiMetricsDeployTarget, AiMetricsOtlpEndpointSpec, AiMetricsTranscriptSource } from "./models.ts";

const $I = $RepoAiMetricsId.create("otlp");

/**
 * Attribute value variants allowed on redacted AI metrics OTLP spans.
 *
 * @example
 * ```ts
 * import { AiMetricsOtlpAttributeValue } from "@beep/repo-ai-metrics"
 * console.log(AiMetricsOtlpAttributeValue)
 * ```
 * @category schemas
 * @since 0.0.0
 */
export const AiMetricsOtlpAttributeValue = S.Union([S.String, S.Number, S.Boolean]).pipe(
  $I.annoteSchema("AiMetricsOtlpAttributeValue", {
    description: "Low-cardinality or hashed attribute value emitted on AI metrics OTLP spans.",
  })
);

/**
 * Runtime type for {@link AiMetricsOtlpAttributeValue}.
 *
 * @example
 * ```ts
 * import type { AiMetricsOtlpAttributeValue } from "@beep/repo-ai-metrics"
 * const value: AiMetricsOtlpAttributeValue = "hash-only"
 * console.log(value)
 * ```
 * @category models
 * @since 0.0.0
 */
export type AiMetricsOtlpAttributeValue = typeof AiMetricsOtlpAttributeValue.Type;

/**
 * Error raised by AI metrics OTLP projection or export.
 *
 * @example
 * ```ts
 * import { AiMetricsOtlpExportError } from "@beep/repo-ai-metrics"
 * console.log(AiMetricsOtlpExportError)
 * ```
 * @category errors
 * @since 0.0.0
 */
export class AiMetricsOtlpExportError extends TaggedErrorClass<AiMetricsOtlpExportError>($I`AiMetricsOtlpExportError`)(
  "AiMetricsOtlpExportError",
  {
    cause: S.Unknown,
    message: S.String,
  },
  $I.annote("AiMetricsOtlpExportError", {
    description: "Typed failure raised while projecting or exporting redacted AI metrics OTLP spans.",
  })
) {}

/**
 * Input for exporting one derived ingest run as OTLP spans.
 *
 * @example
 * ```ts
 * import { AiMetricsOtlpExportInput, AiMetricsOtlpEndpointSpec } from "@beep/repo-ai-metrics"
 *
 * const input = new AiMetricsOtlpExportInput({
 *   duckDbPath: ".beep/ai-metrics/derived/ai-metrics.duckdb",
 *   endpoint: new AiMetricsOtlpEndpointSpec({
 *     baseUrl: "http://127.0.0.1:6006",
 *     protocol: "http/protobuf",
 *     resourceAttributes: {},
 *     signalScope: "traces_only",
 *     traceUrl: "http://127.0.0.1:6006/v1/traces"
 *   }),
 *   target: "local"
 * })
 * void input
 * ```
 * @category models
 * @since 0.0.0
 */
export class AiMetricsOtlpExportInput extends S.Class<AiMetricsOtlpExportInput>($I`AiMetricsOtlpExportInput`)(
  {
    duckDbPath: S.String,
    endpoint: AiMetricsOtlpEndpointSpec,
    ingestRunId: S.optionalKey(S.String),
    target: AiMetricsDeployTarget,
  },
  $I.annote("AiMetricsOtlpExportInput", {
    description: "DuckDB source and OTLP endpoint for one redacted AI metrics export run.",
  })
) {}

/**
 * One span projection ready to be emitted through Effect tracing.
 *
 * @example
 * ```ts
 * import { AiMetricsOtlpSpanProjection } from "@beep/repo-ai-metrics"
 * console.log(AiMetricsOtlpSpanProjection)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AiMetricsOtlpSpanProjection extends S.Class<AiMetricsOtlpSpanProjection>($I`AiMetricsOtlpSpanProjection`)(
  {
    attributes: S.Record(S.String, AiMetricsOtlpAttributeValue),
    spanName: S.String,
  },
  $I.annote("AiMetricsOtlpSpanProjection", {
    description: "Redacted span name and bounded attributes derived from AI metrics DuckDB storage.",
  })
) {}

/**
 * Span projection batch resolved for one derived ingest run.
 *
 * @example
 * ```ts
 * import { AiMetricsOtlpSpanProjectionBatch } from "@beep/repo-ai-metrics"
 * console.log(AiMetricsOtlpSpanProjectionBatch)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AiMetricsOtlpSpanProjectionBatch extends S.Class<AiMetricsOtlpSpanProjectionBatch>(
  $I`AiMetricsOtlpSpanProjectionBatch`
)(
  {
    ingestRunId: S.String,
    projections: S.Array(AiMetricsOtlpSpanProjection),
    sessionSpanCount: S.Number,
    turnSpanCount: S.Number,
  },
  $I.annote("AiMetricsOtlpSpanProjectionBatch", {
    description: "Redacted OTLP span projections grouped by one AI metrics ingest run.",
  })
) {}

/**
 * Result of a redacted AI metrics OTLP export attempt.
 *
 * @example
 * ```ts
 * import { AiMetricsOtlpExportResult } from "@beep/repo-ai-metrics"
 * console.log(AiMetricsOtlpExportResult)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AiMetricsOtlpExportResult extends S.Class<AiMetricsOtlpExportResult>($I`AiMetricsOtlpExportResult`)(
  {
    endpointTraceUrl: S.String,
    ingestRunId: S.String,
    sessionSpanCount: S.Number,
    spanCount: S.Number,
    target: AiMetricsDeployTarget,
    turnSpanCount: S.Number,
  },
  $I.annote("AiMetricsOtlpExportResult", {
    description: "Safe counts returned after emitting redacted AI metrics spans to the active tracer.",
  })
) {}

class LatestIngestRunRow extends S.Class<LatestIngestRunRow>($I`LatestIngestRunRow`)(
  {
    ingestRunId: S.String,
  },
  $I.annote("LatestIngestRunRow", {
    description: "Latest AI metrics ingest run selected from derived DuckDB storage.",
  })
) {}

class AiMetricsOtlpTurnExportRow extends S.Class<AiMetricsOtlpTurnExportRow>($I`AiMetricsOtlpTurnExportRow`)(
  {
    agentSessionId: S.String,
    configSnapshotId: S.String,
    eventName: S.String,
    ingestRunId: S.String,
    lineNumber: S.Number,
    rawEventHash: S.String,
    sourceKind: AiMetricsTranscriptSource,
    sourcePathHash: S.String,
    timestamp: S.NullOr(S.String),
    turnId: S.String,
  },
  $I.annote("AiMetricsOtlpTurnExportRow", {
    description: "DuckDB turn row shape projected into redacted AI metrics OTLP spans.",
  })
) {}

const decodeLatestRows = S.decodeUnknownEffect(S.Array(LatestIngestRunRow));
const decodeTurnRows = S.decodeUnknownEffect(S.Array(AiMetricsOtlpTurnExportRow));
const encodeOtlpExportJson = S.encodeUnknownEffect(S.fromJsonString(AiMetricsOtlpExportResult));

const exportFailure = (message: string, cause: unknown): AiMetricsOtlpExportError =>
  new AiMetricsOtlpExportError({ cause, message });

const unknownMetadata = "unknown";

const providerFor = (row: AiMetricsOtlpTurnExportRow): string => {
  if (row.sourceKind === AiMetricsTranscriptSource.Enum.openclaw) {
    return "openclaw";
  }

  return unknownMetadata;
};

const toolNameFor = (row: AiMetricsOtlpTurnExportRow): O.Option<string> =>
  pipe(row.eventName, Str.toLowerCase, Str.includes("tool")) ? O.some(row.eventName) : O.none();

const openInferenceSpanKindFor = (row: AiMetricsOtlpTurnExportRow): string =>
  O.isSome(toolNameFor(row)) ? "TOOL" : "CHAIN";

const resolveIngestRunId = Effect.fn("AiMetrics.otlp.resolveIngestRunId")(function* (ingestRunId: string | undefined) {
  if (ingestRunId !== undefined && Str.trim(ingestRunId) !== "latest") {
    return ingestRunId;
  }

  const duckdb = yield* DuckDb;
  const rows = yield* duckdb
    .query(
      `SELECT ingest_run_id AS "ingestRunId"
       FROM ai_metrics_ingest_runs
       ORDER BY started_at_epoch_ms DESC
       LIMIT 1`
    )
    .pipe(Effect.mapError((cause) => exportFailure("Failed to select the latest AI metrics ingest run.", cause)));
  const decoded = yield* decodeLatestRows(rows).pipe(
    Effect.mapError((cause) => exportFailure("Failed to decode the latest AI metrics ingest run row.", cause))
  );
  const latest = A.head(decoded);

  if (O.isNone(latest)) {
    return yield* exportFailure("No AI metrics ingest runs are available for OTLP export.", {
      ingestRunId: ingestRunId ?? "latest",
    });
  }

  return latest.value.ingestRunId;
});

const readTurnRows = Effect.fn("AiMetrics.otlp.readTurnRows")(function* (ingestRunId: string) {
  const duckdb = yield* DuckDb;
  const rows = yield* duckdb
    .query(
      `SELECT
         t.turn_id AS "turnId",
         t.ingest_run_id AS "ingestRunId",
         t.agent_session_id AS "agentSessionId",
         t.source_kind AS "sourceKind",
         t.source_path_hash AS "sourcePathHash",
         t.line_number AS "lineNumber",
         t.event_name AS "eventName",
         t.raw_event_hash AS "rawEventHash",
         t.timestamp AS "timestamp",
         s.config_snapshot_id AS "configSnapshotId"
       FROM ai_metrics_turns t
       JOIN ai_metrics_sessions s ON s.agent_session_id = t.agent_session_id
       WHERE t.ingest_run_id = $ingestRunId
       ORDER BY t.agent_session_id, t.line_number`,
      { ingestRunId }
    )
    .pipe(Effect.mapError((cause) => exportFailure("Failed to read AI metrics turn rows for OTLP export.", cause)));

  return yield* decodeTurnRows(rows).pipe(
    Effect.mapError((cause) => exportFailure("Failed to decode AI metrics turn rows for OTLP export.", cause))
  );
});

const sessionProjection = (row: AiMetricsOtlpTurnExportRow): AiMetricsOtlpSpanProjection =>
  new AiMetricsOtlpSpanProjection({
    attributes: {
      "ai_metrics.config_snapshot_id": row.configSnapshotId,
      "ai_metrics.ingest_run_id": row.ingestRunId,
      "ai_metrics.source_kind": row.sourceKind,
      "ai_metrics.source_path_hash": row.sourcePathHash,
      "openinference.span.kind": "CHAIN",
      "session.id": row.agentSessionId,
    },
    spanName: "ai_metrics.agent.session",
  });

const turnProjection = (row: AiMetricsOtlpTurnExportRow): AiMetricsOtlpSpanProjection => {
  const toolName = toolNameFor(row);

  return new AiMetricsOtlpSpanProjection({
    attributes: {
      ...R.getSomes({
        "ai_metrics.timestamp": O.fromNullishOr(row.timestamp),
        "ai_metrics.tool_name": toolName,
        "tool.name": toolName,
      }),
      "ai_metrics.config_snapshot_id": row.configSnapshotId,
      "ai_metrics.event_name": row.eventName,
      "ai_metrics.ingest_run_id": row.ingestRunId,
      "ai_metrics.line_number": row.lineNumber,
      "ai_metrics.provider": providerFor(row),
      "ai_metrics.raw_event_hash": row.rawEventHash,
      "ai_metrics.source_kind": row.sourceKind,
      "ai_metrics.source_path_hash": row.sourcePathHash,
      "ai_metrics.turn_id": row.turnId,
      "openinference.span.kind": openInferenceSpanKindFor(row),
      "session.id": row.agentSessionId,
    },
    spanName: "ai_metrics.agent.turn",
  });
};

const spanProjectionsFor = (
  ingestRunId: string,
  rows: ReadonlyArray<AiMetricsOtlpTurnExportRow>
): AiMetricsOtlpSpanProjectionBatch => {
  const sessionRows = pipe(
    rows,
    A.dedupeWith((left, right) => left.agentSessionId === right.agentSessionId)
  );
  const sessionProjections = A.map(sessionRows, sessionProjection);
  const turnProjections = A.map(rows, turnProjection);

  return new AiMetricsOtlpSpanProjectionBatch({
    ingestRunId,
    projections: A.appendAll(sessionProjections, turnProjections),
    sessionSpanCount: A.length(sessionProjections),
    turnSpanCount: A.length(turnProjections),
  });
};

/**
 * Read derived DuckDB rows and build redacted OTLP span projections.
 *
 * @example
 * ```ts
 * import { readAiMetricsOtlpSpanProjections } from "@beep/repo-ai-metrics"
 * console.log(readAiMetricsOtlpSpanProjections)
 * ```
 * @category services
 * @since 0.0.0
 */
export const readAiMetricsOtlpSpanProjections: (
  input: AiMetricsOtlpExportInput
) => Effect.Effect<AiMetricsOtlpSpanProjectionBatch, AiMetricsOtlpExportError, DuckDb> = Effect.fn(
  "AiMetrics.readAiMetricsOtlpSpanProjections"
)(function* (input) {
  const ingestRunId = yield* resolveIngestRunId(input.ingestRunId);
  const rows = yield* readTurnRows(ingestRunId);

  return spanProjectionsFor(ingestRunId, rows);
});

const emitSpanProjection = Effect.fn("AiMetrics.otlp.emitSpanProjection")((projection: AiMetricsOtlpSpanProjection) =>
  Effect.void.pipe(
    Effect.withSpan(projection.spanName, {
      attributes: projection.attributes,
    })
  )
);

/**
 * Emit redacted AI metrics derived spans through the active Effect tracer.
 *
 * @example
 * ```ts
 * import { runAiMetricsOtlpExport } from "@beep/repo-ai-metrics"
 * console.log(runAiMetricsOtlpExport)
 * ```
 * @category services
 * @since 0.0.0
 */
export const runAiMetricsOtlpExport: (
  input: AiMetricsOtlpExportInput
) => Effect.Effect<AiMetricsOtlpExportResult, AiMetricsOtlpExportError, DuckDb> = Effect.fn(
  "AiMetrics.runAiMetricsOtlpExport"
)(
  function* (input) {
    const batch = yield* readAiMetricsOtlpSpanProjections(input);
    yield* Effect.forEach(batch.projections, emitSpanProjection, { discard: true, concurrency: 8 });

    return new AiMetricsOtlpExportResult({
      endpointTraceUrl: input.endpoint.traceUrl,
      ingestRunId: batch.ingestRunId,
      sessionSpanCount: batch.sessionSpanCount,
      spanCount: A.length(batch.projections),
      target: input.target,
      turnSpanCount: batch.turnSpanCount,
    });
  },
  (effect, input) =>
    effect.pipe(
      Effect.withSpan("repo_ai_metrics.otlp.export", {
        attributes: {
          "ai_metrics.otlp.signal_scope": input.endpoint.signalScope,
          "ai_metrics.otlp.trace_url": input.endpoint.traceUrl,
          "ai_metrics.target": input.target,
        },
      })
    )
);

/**
 * Render an OTLP export result as JSON.
 *
 * @example
 * ```ts
 * import { otlpExportResultToJson } from "@beep/repo-ai-metrics"
 * console.log(otlpExportResultToJson)
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const otlpExportResultToJson: (
  result: AiMetricsOtlpExportResult
) => Effect.Effect<string, AiMetricsOtlpExportError> = Effect.fn("AiMetrics.otlpExportResultToJson")(
  function* (result) {
    return yield* encodeOtlpExportJson(result).pipe(
      Effect.mapError((cause) => exportFailure("Failed to encode AI metrics OTLP export result as JSON.", cause))
    );
  }
);
