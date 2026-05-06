/**
 * DuckDB-derived storage projection for repo AI metrics.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { DuckDb, DuckDbParquetExport } from "@beep/duckdb";
import { $RepoAiMetricsId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { Clock, Effect, FileSystem, flow, Path } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import { AiMetricsRawArchiveObject } from "./archive.ts";
import { AiMetricsStorageLayout } from "./install.ts";
import { AiMetricsDeployTarget, ConfigSnapshot } from "./models.ts";
import { AiMetricsPrivacyCheckResult, hashPublicTextSha256 } from "./privacy.ts";

const $I = $RepoAiMetricsId.create("derived-storage");

const DERIVED_TABLES = [
  "ai_metrics_ingest_runs",
  "ai_metrics_source_files",
  "ai_metrics_raw_archive_objects",
  "ai_metrics_sessions",
  "ai_metrics_turns",
  "ai_metrics_model_calls",
  "ai_metrics_tool_invocations",
  "ai_metrics_outcome_labels",
  "ai_metrics_benchmark_runs",
  "ai_metrics_scorecards",
] as const;

const createTableStatements = [
  `CREATE TABLE IF NOT EXISTS ai_metrics_ingest_runs (
    ingest_run_id VARCHAR PRIMARY KEY,
    target VARCHAR NOT NULL,
    config_snapshot_id VARCHAR NOT NULL,
    config_hash VARCHAR NOT NULL,
    started_at_epoch_ms BIGINT NOT NULL,
    completed_at_epoch_ms BIGINT NOT NULL,
    source_file_count INTEGER NOT NULL,
    archive_object_count INTEGER NOT NULL,
    turn_count INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS ai_metrics_source_files (
    source_file_id VARCHAR PRIMARY KEY,
    ingest_run_id VARCHAR NOT NULL,
    source_kind VARCHAR NOT NULL,
    source_path_hash VARCHAR NOT NULL,
    total_lines INTEGER NOT NULL,
    accepted_events INTEGER NOT NULL,
    rejected_lines INTEGER NOT NULL,
    first_timestamp VARCHAR,
    last_timestamp VARCHAR,
    event_names_json VARCHAR NOT NULL,
    redaction_safe_for_derived_ui BOOLEAN NOT NULL,
    config_snapshot_id VARCHAR NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS ai_metrics_raw_archive_objects (
    archive_run_object_id VARCHAR PRIMARY KEY,
    archive_object_id VARCHAR NOT NULL,
    ingest_run_id VARCHAR NOT NULL,
    source_kind VARCHAR NOT NULL,
    source_path_hash VARCHAR NOT NULL,
    plaintext_content_hash VARCHAR NOT NULL,
    archive_path VARCHAR NOT NULL,
    algorithm VARCHAR NOT NULL,
    encrypted_at_epoch_ms BIGINT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS ai_metrics_sessions (
    agent_session_id VARCHAR PRIMARY KEY,
    ingest_run_id VARCHAR NOT NULL,
    source_kind VARCHAR NOT NULL,
    source_path_hash VARCHAR NOT NULL,
    started_at VARCHAR,
    config_snapshot_id VARCHAR NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS ai_metrics_turns (
    turn_id VARCHAR PRIMARY KEY,
    ingest_run_id VARCHAR NOT NULL,
    agent_session_id VARCHAR NOT NULL,
    source_kind VARCHAR NOT NULL,
    source_path_hash VARCHAR NOT NULL,
    line_number INTEGER NOT NULL,
    event_name VARCHAR NOT NULL,
    raw_event_hash VARCHAR NOT NULL,
    timestamp VARCHAR
  )`,
  `CREATE TABLE IF NOT EXISTS ai_metrics_model_calls (
    call_id VARCHAR PRIMARY KEY,
    ingest_run_id VARCHAR,
    provider VARCHAR,
    model VARCHAR,
    total_tokens INTEGER,
    latency_ms DOUBLE
  )`,
  `CREATE TABLE IF NOT EXISTS ai_metrics_tool_invocations (
    tool_run_id VARCHAR PRIMARY KEY,
    ingest_run_id VARCHAR,
    tool_name VARCHAR,
    duration_ms DOUBLE,
    exit_code INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS ai_metrics_outcome_labels (
    label_id VARCHAR PRIMARY KEY,
    agent_task_id VARCHAR,
    rating DOUBLE,
    passed BOOLEAN,
    reason VARCHAR
  )`,
  `CREATE TABLE IF NOT EXISTS ai_metrics_benchmark_runs (
    benchmark_run_id VARCHAR PRIMARY KEY,
    benchmark_case_id VARCHAR,
    config_snapshot_id VARCHAR,
    elapsed_ms DOUBLE,
    passed BOOLEAN
  )`,
  `CREATE TABLE IF NOT EXISTS ai_metrics_scorecards (
    scorecard_id VARCHAR PRIMARY KEY,
    total_score DOUBLE,
    outcome_score DOUBLE,
    flow_score DOUBLE,
    cost_score DOUBLE
  )`,
] as const;

/**
 * Error raised by the DuckDB derived storage projection.
 *
 * @example
 * ```ts
 * import { AiMetricsDerivedStorageError } from "@beep/repo-ai-metrics"
 * const error = new AiMetricsDerivedStorageError({
 *   cause: "boom",
 *   message: "Projection failed."
 * })
 * void error
 * ```
 * @category errors
 * @since 0.0.0
 */
export class AiMetricsDerivedStorageError extends TaggedErrorClass<AiMetricsDerivedStorageError>(
  $I`AiMetricsDerivedStorageError`
)(
  "AiMetricsDerivedStorageError",
  {
    cause: S.Unknown,
    message: S.String,
  },
  $I.annote("AiMetricsDerivedStorageError", {
    description: "Typed failure raised while projecting AI metrics records into DuckDB derived storage.",
  })
) {}

/**
 * One sanitized transcript ready for derived storage projection.
 *
 * @example
 * ```ts
 * import { AiMetricsDerivedTranscriptRecord } from "@beep/repo-ai-metrics"
 * console.log(AiMetricsDerivedTranscriptRecord)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AiMetricsDerivedTranscriptRecord extends S.Class<AiMetricsDerivedTranscriptRecord>(
  $I`AiMetricsDerivedTranscriptRecord`
)(
  {
    archiveObject: AiMetricsRawArchiveObject,
    privacy: AiMetricsPrivacyCheckResult,
  },
  $I.annote("AiMetricsDerivedTranscriptRecord", {
    description: "Sanitized transcript projection plus encrypted raw archive metadata.",
  })
) {}

/**
 * Input for a derived DuckDB storage write.
 *
 * @example
 * ```ts
 * import { AiMetricsDerivedStorageWriteInput } from "@beep/repo-ai-metrics"
 * console.log(AiMetricsDerivedStorageWriteInput)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AiMetricsDerivedStorageWriteInput extends S.Class<AiMetricsDerivedStorageWriteInput>(
  $I`AiMetricsDerivedStorageWriteInput`
)(
  {
    configSnapshot: ConfigSnapshot,
    ingestRunId: S.String,
    records: S.Array(AiMetricsDerivedTranscriptRecord),
    startedAtEpochMillis: S.Number,
    storage: AiMetricsStorageLayout,
    target: AiMetricsDeployTarget,
  },
  $I.annote("AiMetricsDerivedStorageWriteInput", {
    description: "DuckDB derived storage write request for one AI metrics forwarder run.",
  })
) {}

/**
 * Result of a derived DuckDB storage write.
 *
 * @example
 * ```ts
 * import { AiMetricsDerivedStorageWriteResult } from "@beep/repo-ai-metrics"
 * console.log(AiMetricsDerivedStorageWriteResult)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AiMetricsDerivedStorageWriteResult extends S.Class<AiMetricsDerivedStorageWriteResult>(
  $I`AiMetricsDerivedStorageWriteResult`
)(
  {
    archiveObjectCount: S.Number,
    duckDbPath: S.String,
    ingestRunId: S.String,
    parquetExportDir: S.String,
    parquetTables: S.Array(S.String),
    sourceFileCount: S.Number,
    turnCount: S.Number,
  },
  $I.annote("AiMetricsDerivedStorageWriteResult", {
    description: "Safe counts and export paths produced by one DuckDB derived storage write.",
  })
) {}

const encodeJson = S.encodeUnknownEffect(S.UnknownFromJsonString);

const derivedFailure = (message: string, cause: unknown): AiMetricsDerivedStorageError =>
  new AiMetricsDerivedStorageError({ cause, message });

const jsonString = (value: unknown): Effect.Effect<string> => encodeJson(value).pipe(Effect.orDie);

const rowId = Effect.fn("AiMetrics.derivedStorage.rowId")(function* (
  prefix: string,
  parts: ReadonlyArray<string | number>
) {
  const textParts = A.map(parts, globalThis.String);
  const digest = yield* hashPublicTextSha256(`${prefix}\u0000${A.join(textParts, "\u0000")}`).pipe(Effect.orDie);
  return `${prefix}-${digest}`;
});

const optionalStringOrNull = (value: string | undefined): string | null => value ?? null;

const countCreatedArchiveObjects = (records: ReadonlyArray<AiMetricsDerivedTranscriptRecord>): number =>
  A.filter(records, (record) => record.archiveObject.created).length;

const upsertRun = Effect.fn("AiMetrics.derivedStorage.upsertRun")(function* (
  input: AiMetricsDerivedStorageWriteInput,
  completedAtEpochMillis: number,
  turnCount: number
) {
  const duckdb = yield* DuckDb;
  const archiveObjectCount = countCreatedArchiveObjects(input.records);
  yield* duckdb.run(
    `INSERT OR REPLACE INTO ai_metrics_ingest_runs (
      ingest_run_id,
      target,
      config_snapshot_id,
      config_hash,
      started_at_epoch_ms,
      completed_at_epoch_ms,
      source_file_count,
      archive_object_count,
      turn_count
    ) VALUES (
      $ingestRunId,
      $target,
      $configSnapshotId,
      $configHash,
      $startedAtEpochMillis,
      $completedAtEpochMillis,
      $sourceFileCount,
      $archiveObjectCount,
      $turnCount
    )`,
    {
      archiveObjectCount,
      completedAtEpochMillis,
      configHash: input.configSnapshot.configHash,
      configSnapshotId: input.configSnapshot.snapshotId,
      ingestRunId: input.ingestRunId,
      sourceFileCount: input.records.length,
      startedAtEpochMillis: input.startedAtEpochMillis,
      target: input.target,
      turnCount,
    }
  );
});

const upsertSourceFile = Effect.fn("AiMetrics.derivedStorage.upsertSourceFile")(function* (
  input: AiMetricsDerivedStorageWriteInput,
  record: AiMetricsDerivedTranscriptRecord
) {
  const duckdb = yield* DuckDb;
  const sanitized = record.privacy.sanitized;
  const sourceFileId = yield* rowId("source-file", [input.ingestRunId, sanitized.sourceKind, sanitized.sourcePathHash]);
  const eventNamesJson = yield* jsonString(sanitized.eventNames);

  yield* duckdb.run(
    `INSERT OR REPLACE INTO ai_metrics_source_files (
      source_file_id,
      ingest_run_id,
      source_kind,
      source_path_hash,
      total_lines,
      accepted_events,
      rejected_lines,
      first_timestamp,
      last_timestamp,
      event_names_json,
      redaction_safe_for_derived_ui,
      config_snapshot_id
    ) VALUES (
      $sourceFileId,
      $ingestRunId,
      $sourceKind,
      $sourcePathHash,
      $totalLines,
      $acceptedEvents,
      $rejectedLines,
      $firstTimestamp,
      $lastTimestamp,
      $eventNamesJson,
      $redactionSafeForDerivedUi,
      $configSnapshotId
    )`,
    {
      acceptedEvents: sanitized.acceptedEvents,
      configSnapshotId: input.configSnapshot.snapshotId,
      eventNamesJson,
      firstTimestamp: optionalStringOrNull(sanitized.firstTimestamp),
      ingestRunId: input.ingestRunId,
      lastTimestamp: optionalStringOrNull(sanitized.lastTimestamp),
      redactionSafeForDerivedUi: record.privacy.redaction.safeForDerivedUi,
      rejectedLines: sanitized.rejectedLines,
      sourceFileId,
      sourceKind: sanitized.sourceKind,
      sourcePathHash: sanitized.sourcePathHash,
      totalLines: sanitized.totalLines,
    }
  );
});

const upsertArchiveObject = Effect.fn("AiMetrics.derivedStorage.upsertArchiveObject")(function* (
  input: AiMetricsDerivedStorageWriteInput,
  record: AiMetricsDerivedTranscriptRecord
) {
  const duckdb = yield* DuckDb;
  const archive = record.archiveObject;
  const archiveRunObjectId = yield* rowId("archive-object", [input.ingestRunId, archive.archiveObjectId]);
  yield* duckdb.run(
    `INSERT OR REPLACE INTO ai_metrics_raw_archive_objects (
      archive_run_object_id,
      archive_object_id,
      ingest_run_id,
      source_kind,
      source_path_hash,
      plaintext_content_hash,
      archive_path,
      algorithm,
      encrypted_at_epoch_ms
    ) VALUES (
      $archiveRunObjectId,
      $archiveObjectId,
      $ingestRunId,
      $sourceKind,
      $sourcePathHash,
      $plaintextContentHash,
      $archivePath,
      $algorithm,
      $encryptedAtEpochMillis
    )`,
    {
      algorithm: archive.algorithm,
      archiveObjectId: archive.archiveObjectId,
      archiveRunObjectId,
      archivePath: archive.archivePath,
      encryptedAtEpochMillis: archive.encryptedAtEpochMillis,
      ingestRunId: input.ingestRunId,
      plaintextContentHash: archive.plaintextContentHash,
      sourceKind: archive.sourceKind,
      sourcePathHash: archive.sourcePathHash,
    }
  );
});

const upsertSessionAndTurns = Effect.fn("AiMetrics.derivedStorage.upsertSessionAndTurns")(function* (
  input: AiMetricsDerivedStorageWriteInput,
  record: AiMetricsDerivedTranscriptRecord
) {
  const duckdb = yield* DuckDb;
  const sanitized = record.privacy.sanitized;
  const agentSessionId = yield* rowId("session", [input.ingestRunId, sanitized.sourceKind, sanitized.sourcePathHash]);
  yield* duckdb.run(
    `INSERT OR REPLACE INTO ai_metrics_sessions (
      agent_session_id,
      ingest_run_id,
      source_kind,
      source_path_hash,
      started_at,
      config_snapshot_id
    ) VALUES (
      $agentSessionId,
      $ingestRunId,
      $sourceKind,
      $sourcePathHash,
      $startedAt,
      $configSnapshotId
    )`,
    {
      agentSessionId,
      configSnapshotId: input.configSnapshot.snapshotId,
      ingestRunId: input.ingestRunId,
      sourceKind: sanitized.sourceKind,
      sourcePathHash: sanitized.sourcePathHash,
      startedAt: optionalStringOrNull(sanitized.firstTimestamp),
    }
  );

  yield* Effect.forEach(
    sanitized.rawEventEnvelopes,
    Effect.fnUntraced(function* (envelope) {
      const turnId = yield* rowId("turn", [
        input.ingestRunId,
        envelope.sourceKind,
        envelope.sourcePathHash,
        envelope.lineNumber,
        envelope.rawEventHash,
      ]);
      yield* duckdb.run(
        `INSERT OR REPLACE INTO ai_metrics_turns (
          turn_id,
          ingest_run_id,
          agent_session_id,
          source_kind,
          source_path_hash,
          line_number,
          event_name,
          raw_event_hash,
          timestamp
        ) VALUES (
          $turnId,
          $ingestRunId,
          $agentSessionId,
          $sourceKind,
          $sourcePathHash,
          $lineNumber,
          $eventName,
          $rawEventHash,
          $timestamp
        )`,
        {
          agentSessionId,
          eventName: envelope.eventName,
          ingestRunId: input.ingestRunId,
          lineNumber: envelope.lineNumber,
          rawEventHash: envelope.rawEventHash,
          sourceKind: envelope.sourceKind,
          sourcePathHash: envelope.sourcePathHash,
          timestamp: optionalStringOrNull(envelope.timestamp),
          turnId,
        }
      );
    }),
    { discard: true }
  );
});

const recordTurnCount: (records: ReadonlyArray<AiMetricsDerivedTranscriptRecord>) => number = flow(
  A.map((record) => record.privacy.sanitized.rawEventEnvelopes.length),
  A.reduce(0, (left, right) => left + right)
);

/**
 * Project sanitized AI metrics records into DuckDB and export Parquet snapshots.
 *
 * @example
 * ```ts
 * import {
 *   AiMetricsDerivedStorageWriteInput,
 *   writeAiMetricsDerivedStorage
 * } from "@beep/repo-ai-metrics"
 * const input = AiMetricsDerivedStorageWriteInput
 * const write = writeAiMetricsDerivedStorage
 * void input
 * void write
 * ```
 * @category services
 * @since 0.0.0
 */
export const writeAiMetricsDerivedStorage = Effect.fn("AiMetrics.writeAiMetricsDerivedStorage")(
  function* (input: AiMetricsDerivedStorageWriteInput) {
    const fs = yield* FileSystem.FileSystem;
    const pathApi = yield* Path.Path;
    const duckdb = yield* DuckDb;
    const parquetExportDir = pathApi.join(input.storage.parquetDir, input.ingestRunId);
    yield* fs
      .makeDirectory(pathApi.dirname(input.storage.duckDbPath), { recursive: true })
      .pipe(Effect.mapError((cause) => derivedFailure("Failed to create AI metrics DuckDB storage directory.", cause)));
    yield* fs
      .makeDirectory(parquetExportDir, { recursive: true })
      .pipe(Effect.mapError((cause) => derivedFailure("Failed to create AI metrics Parquet export directory.", cause)));
    const completedAtEpochMillis = yield* Clock.currentTimeMillis;
    const turnCount = recordTurnCount(input.records);
    const archiveObjectCount = countCreatedArchiveObjects(input.records);

    yield* duckdb
      .withTransaction(
        Effect.fn(function* (transaction) {
          yield* transaction.runMany(createTableStatements);
          yield* upsertRun(input, completedAtEpochMillis, turnCount).pipe(Effect.provideService(DuckDb, transaction));
          yield* Effect.forEach(
            input.records,
            Effect.fnUntraced(function* (record) {
              yield* upsertSourceFile(input, record).pipe(Effect.provideService(DuckDb, transaction));
              yield* upsertArchiveObject(input, record).pipe(Effect.provideService(DuckDb, transaction));
              yield* upsertSessionAndTurns(input, record).pipe(Effect.provideService(DuckDb, transaction));
            }),
            { discard: true }
          );
        })
      )
      .pipe(Effect.mapError((cause) => derivedFailure("Failed to write AI metrics derived DuckDB tables.", cause)));

    yield* Effect.forEach(
      DERIVED_TABLES,
      (tableName) =>
        duckdb.copyTableToParquet(
          new DuckDbParquetExport({
            filePath: pathApi.join(parquetExportDir, `${tableName}.parquet`),
            tableName,
          })
        ),
      { discard: true }
    ).pipe(Effect.mapError((cause) => derivedFailure("Failed to export AI metrics derived tables to Parquet.", cause)));

    return new AiMetricsDerivedStorageWriteResult({
      archiveObjectCount,
      duckDbPath: input.storage.duckDbPath,
      ingestRunId: input.ingestRunId,
      parquetExportDir,
      parquetTables: DERIVED_TABLES,
      sourceFileCount: input.records.length,
      turnCount,
    });
  },
  (effect, input) =>
    effect.pipe(
      Effect.withSpan("repo_ai_metrics.derived_storage.write", {
        attributes: {
          "ai_metrics.record_count": input.records.length,
          "ai_metrics.target": input.target,
        },
      })
    )
);
