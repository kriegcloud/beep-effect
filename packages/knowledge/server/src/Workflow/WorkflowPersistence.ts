import { $KnowledgeServerId } from "@beep/identity/packages";
import { BatchNotFoundError, WorkflowNotFoundError } from "@beep/knowledge-domain/errors";
import { WorkflowExecutionStatus, WorkflowType } from "@beep/knowledge-domain/values";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as SqlClient from "@effect/sql/SqlClient";
import * as SqlError from "@effect/sql/SqlError";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $KnowledgeServerId.create("Workflow/WorkflowPersistence");

const JsonRecord = S.Record({ key: S.String, value: S.Unknown });
const toJsonb = S.encodeSync(S.parseJson(JsonRecord));

const executionTable = KnowledgeEntityIds.WorkflowExecutionId.tableName;

export class WorkflowExecutionRecord extends S.Class<WorkflowExecutionRecord>($I`WorkflowExecutionRecord`)(
  {
    id: S.String,
    organizationId: S.String,
    workflowType: WorkflowType,
    status: WorkflowExecutionStatus,
    input: S.optionalWith(S.NullOr(S.parseJson(JsonRecord)), { default: () => null }),
    output: S.optionalWith(S.NullOr(S.parseJson(JsonRecord)), { default: () => null }),
    error: S.optionalWith(S.NullOr(S.String), { default: () => null }),
    startedAt: S.optionalWith(S.NullOr(BS.DateFromAllAcceptable), { default: () => null }),
    completedAt: S.optionalWith(S.NullOr(BS.DateFromAllAcceptable), { default: () => null }),
    lastActivityName: S.optionalWith(S.NullOr(S.String), { default: () => null }),
    retryCount: S.optionalWith(S.Int, { default: () => 0 }),
  },
  $I.annotations("WorkflowExecutionRecord", {
    description: "Persisted workflow execution row representation (decoded from SQL results).",
  })
) {}

export const decodeWorkflowExecutionRecord = (u: unknown): Effect.Effect<WorkflowExecutionRecord, SqlError.SqlError> =>
  S.decodeUnknown(WorkflowExecutionRecord)(u).pipe(
    Effect.mapError(
      (cause) =>
        new SqlError.SqlError({
          message: `Failed to decode workflow execution row: ${String(cause)}`,
          cause,
        })
    )
  );

export class CreateExcecutionParams extends S.Class<CreateExcecutionParams>($I`CreateExcecutionParams`)(
  {
    id: S.String,
    organizationId: S.String,
    workflowType: WorkflowType,
    input: S.optional(JsonRecord),
  },
  $I.annotations("CreateExcecutionParams", {
    description: "Parameters used when inserting a new workflow execution record.",
  })
) {}

export class UpdateExecutionStatusUpdates extends S.Class<UpdateExecutionStatusUpdates>(
  $I`UpdateExecutionStatusUpdates`
)(
  {
    output: S.optional(JsonRecord),
    error: S.optional(S.String),
    lastActivityName: S.optional(S.String),
  },
  $I.annotations("UpdateExecutionStatusUpdates", {
    description: "Optional update payload for workflow execution status updates.",
  })
) {}

export interface WorkflowPersistenceShape {
  readonly createExecution: (params: CreateExcecutionParams) => Effect.Effect<void, SqlError.SqlError>;

  readonly updateExecutionStatus: (
    id: string,
    status: WorkflowExecutionStatus.Type,
    updates?: undefined | UpdateExecutionStatusUpdates
  ) => Effect.Effect<void, SqlError.SqlError>;

  readonly getExecution: (
    id: string
  ) => Effect.Effect<WorkflowExecutionRecord, WorkflowNotFoundError | SqlError.SqlError>;

  readonly findLatestBatchExecutionByBatchId: (
    batchId: KnowledgeEntityIds.BatchExecutionId.Type
  ) => Effect.Effect<O.Option<WorkflowExecutionRecord>, SqlError.SqlError>;

  readonly cancelExecution: (
    id: string,
    error: string
  ) => Effect.Effect<void, WorkflowNotFoundError | SqlError.SqlError>;

  readonly requireBatchExecutionByBatchId: (
    batchId: KnowledgeEntityIds.BatchExecutionId.Type
  ) => Effect.Effect<WorkflowExecutionRecord, BatchNotFoundError | SqlError.SqlError>;
}

export class WorkflowPersistence extends Context.Tag($I`WorkflowPersistence`)<
  WorkflowPersistence,
  WorkflowPersistenceShape
>() {}

const serviceEffect = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

  const createExecution: WorkflowPersistenceShape["createExecution"] = (params) =>
    sql`
        INSERT INTO ${sql(executionTable)}
            (id, organization_id, workflow_type, status, input)
        VALUES (${params.id}, ${params.organizationId}, ${params.workflowType}, 'pending',
                ${toJsonb(params.input ?? {})}::jsonb)
		`.pipe(Effect.asVoid);

  const updateExecutionRunning = (id: string, nowStr: string, lastActivityName?: undefined | string) =>
    lastActivityName
      ? sql`
                UPDATE ${sql(executionTable)}
                SET status             = 'running',
                    started_at         = COALESCE(started_at, ${nowStr}),
                    last_activity_name = ${lastActivityName}
                WHERE id = ${id}
			`.pipe(Effect.asVoid)
      : sql`
                UPDATE ${sql(executionTable)}
                SET status     = 'running',
                    started_at = COALESCE(started_at, ${nowStr})
                WHERE id = ${id}
			`.pipe(Effect.asVoid);

  const updateExecutionCompleted = (
    id: string,
    nowStr: string,
    output?: undefined | Record<string, unknown>,
    lastActivityName?: undefined | string
  ) => {
    if (output && lastActivityName) {
      return sql`
          UPDATE ${sql(executionTable)}
          SET status       = 'completed',
              completed_at = ${nowStr},
              output       = ${toJsonb(output)}::jsonb, last_activity_name = ${lastActivityName}
          WHERE id = ${id}
			`.pipe(Effect.asVoid);
    }
    if (output) {
      return sql`
          UPDATE ${sql(executionTable)}
          SET status       = 'completed',
              completed_at = ${nowStr},
              output       = ${toJsonb(output)}::jsonb
          WHERE id = ${id}
			`.pipe(Effect.asVoid);
    }
    if (lastActivityName) {
      return sql`
          UPDATE ${sql(executionTable)}
          SET status             = 'completed',
              completed_at       = ${nowStr},
              last_activity_name = ${lastActivityName}
          WHERE id = ${id}
			`.pipe(Effect.asVoid);
    }
    return sql`
        UPDATE ${sql(executionTable)}
        SET status       = 'completed',
            completed_at = ${nowStr}
        WHERE id = ${id}
		`.pipe(Effect.asVoid);
  };

  const updateExecutionFailed = (id: string, nowStr: string, error?: undefined | string) =>
    error
      ? sql`
                UPDATE ${sql(executionTable)}
                SET status       = 'failed',
                    completed_at = ${nowStr},
                    error        = ${error}
                WHERE id = ${id}
			`.pipe(Effect.asVoid)
      : sql`
                UPDATE ${sql(executionTable)}
                SET status       = 'failed',
                    completed_at = ${nowStr}
                WHERE id = ${id}
			`.pipe(Effect.asVoid);

  const updateExecutionGeneric = (id: string, status: WorkflowExecutionStatus.Type) =>
    sql`
        UPDATE ${sql(executionTable)}
        SET status = ${status}
        WHERE id = ${id}
		`.pipe(Effect.asVoid);

  const updateExecutionStatus: WorkflowPersistenceShape["updateExecutionStatus"] = Effect.fn(
    "WorkflowPersistence.updateExecutionStatus"
  )(function* (id, status, updates) {
    const now = yield* DateTime.now;
    const nowStr = DateTime.formatIso(now);

    yield* Match.value(status).pipe(
      Match.when("running", () => updateExecutionRunning(id, nowStr, updates?.lastActivityName)),
      Match.when("completed", () => updateExecutionCompleted(id, nowStr, updates?.output, updates?.lastActivityName)),
      Match.when("failed", () => updateExecutionFailed(id, nowStr, updates?.error)),
      Match.orElse(() => updateExecutionGeneric(id, status))
    );
  });

  const getExecution: WorkflowPersistenceShape["getExecution"] = Effect.fn("WorkflowPersistence.getExecution")(
    function* (id) {
      const rows = yield* sql<WorkflowExecutionRecord>`
          SELECT *
          FROM ${sql(executionTable)}
          WHERE id = ${id}
			`;
      const row = A.head(rows);
      if (O.isNone(row)) {
        return yield* new WorkflowNotFoundError({ executionId: id });
      }
      return yield* decodeWorkflowExecutionRecord(row.value);
    }
  );

  const findLatestBatchExecutionByBatchId: WorkflowPersistenceShape["findLatestBatchExecutionByBatchId"] = Effect.fn(
    "WorkflowPersistence.findLatestBatchExecutionByBatchId"
  )(function* (batchId) {
    const rows = yield* sql<WorkflowExecutionRecord>`
          SELECT *
          FROM ${sql(executionTable)}
          WHERE workflow_type = 'batch_extraction'
            AND input ->> 'batchId' = ${batchId}
          ORDER BY created_at DESC
              LIMIT 1
			`;
    const row = A.head(rows);
    if (O.isNone(row)) {
      return O.none();
    }
    const decoded = yield* decodeWorkflowExecutionRecord(row.value);
    return O.some(decoded);
  });

  const cancelExecution: WorkflowPersistenceShape["cancelExecution"] = Effect.fn("WorkflowPersistence.cancelExecution")(
    function* (id, error) {
      const existing = yield* getExecution(id);
      const disallowTerminal =
        existing.status === "completed" || existing.status === "failed" || existing.status === "cancelled";
      if (disallowTerminal) {
        return;
      }
      const now = yield* DateTime.now;
      const nowStr = DateTime.formatIso(now);
      yield* sql`
          UPDATE ${sql(executionTable)}
          SET status       = 'cancelled',
              completed_at = ${nowStr},
              error        = ${error}
          WHERE id = ${id}
			`.pipe(Effect.asVoid);
    }
  );

  const requireBatchExecutionByBatchId: WorkflowPersistenceShape["requireBatchExecutionByBatchId"] = F.flow((batchId) =>
    F.pipe(
      batchId,
      findLatestBatchExecutionByBatchId,
      Effect.flatMap(
        O.match({
          onNone: BatchNotFoundError.newThunk(batchId),
          onSome: Effect.succeed,
        })
      )
    )
  );

  return WorkflowPersistence.of({
    createExecution,
    updateExecutionStatus,
    getExecution,
    findLatestBatchExecutionByBatchId,
    cancelExecution,
    requireBatchExecutionByBatchId,
  });
});

export const WorkflowPersistenceLive = Layer.effect(WorkflowPersistence, serviceEffect);
