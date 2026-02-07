import { $KnowledgeServerId } from "@beep/identity/packages";
import { BatchNotFoundError, WorkflowNotFoundError } from "@beep/knowledge-domain/errors";
import type { WorkflowExecutionStatus, WorkflowType } from "@beep/knowledge-domain/value-objects";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as SqlClient from "@effect/sql/SqlClient";
import type * as SqlError from "@effect/sql/SqlError";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $KnowledgeServerId.create("Workflow/WorkflowPersistence");

const JsonRecord = S.Record({ key: S.String, value: S.Unknown });
const toJsonb = S.encodeSync(S.parseJson(JsonRecord));

const executionTable = KnowledgeEntityIds.WorkflowExecutionId.tableName;

export interface WorkflowExecutionRecord {
  readonly id: KnowledgeEntityIds.WorkflowExecutionId.Type;
  readonly organizationId: string;
  readonly workflowType: WorkflowType.Type;
  readonly status: WorkflowExecutionStatus.Type;
  readonly input: Record<string, unknown> | null;
  readonly output: Record<string, unknown> | null;
  readonly error: string | null;
  readonly startedAt: Date | null;
  readonly completedAt: Date | null;
  readonly lastActivityName: string | null;
  readonly retryCount: number;
}

export interface WorkflowPersistenceShape {
  readonly createExecution: (params: {
    readonly id: KnowledgeEntityIds.WorkflowExecutionId.Type;
    readonly organizationId: string;
    readonly workflowType: WorkflowType.Type;
    readonly input?: Record<string, unknown>;
  }) => Effect.Effect<void, SqlError.SqlError>;

  readonly updateExecutionStatus: (
    id: KnowledgeEntityIds.WorkflowExecutionId.Type,
    status: WorkflowExecutionStatus.Type,
    updates?: {
      readonly output?: Record<string, unknown>;
      readonly error?: string;
      readonly lastActivityName?: string;
    }
  ) => Effect.Effect<void, SqlError.SqlError>;

  readonly getExecution: (
    id: KnowledgeEntityIds.WorkflowExecutionId.Type
  ) => Effect.Effect<WorkflowExecutionRecord, WorkflowNotFoundError | SqlError.SqlError>;

  readonly findLatestBatchExecutionByBatchId: (
    batchId: KnowledgeEntityIds.BatchExecutionId.Type
  ) => Effect.Effect<O.Option<WorkflowExecutionRecord>, SqlError.SqlError>;

  readonly cancelExecution: (
    id: KnowledgeEntityIds.WorkflowExecutionId.Type,
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

  const updateExecutionRunning = (
    id: KnowledgeEntityIds.WorkflowExecutionId.Type,
    nowStr: string,
    lastActivityName?: string
  ) =>
    lastActivityName
      ? sql`
                UPDATE ${sql(executionTable)}
                SET status = 'running',
                    started_at = COALESCE(started_at, ${nowStr}),
                    last_activity_name = ${lastActivityName}
                WHERE id = ${id}
      `.pipe(Effect.asVoid)
      : sql`
                UPDATE ${sql(executionTable)}
                SET status = 'running',
                    started_at = COALESCE(started_at, ${nowStr})
                WHERE id = ${id}
      `.pipe(Effect.asVoid);

  const updateExecutionCompleted = (
    id: KnowledgeEntityIds.WorkflowExecutionId.Type,
    nowStr: string,
    output?: Record<string, unknown>,
    lastActivityName?: string
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

  const updateExecutionFailed = (id: KnowledgeEntityIds.WorkflowExecutionId.Type, nowStr: string, error?: string) =>
    error
      ? sql`
                UPDATE ${sql(executionTable)}
                SET status = 'failed',
                    completed_at = ${nowStr},
                    error = ${error}
                WHERE id = ${id}
      `.pipe(Effect.asVoid)
      : sql`
                UPDATE ${sql(executionTable)}
                SET status = 'failed',
                    completed_at = ${nowStr}
                WHERE id = ${id}
      `.pipe(Effect.asVoid);

  const updateExecutionGeneric = (
    id: KnowledgeEntityIds.WorkflowExecutionId.Type,
    status: WorkflowExecutionStatus.Type
  ) =>
    sql`
        UPDATE ${sql(executionTable)}
        SET status = ${status}
        WHERE id = ${id}
    `.pipe(Effect.asVoid);

  const updateExecutionStatus: WorkflowPersistenceShape["updateExecutionStatus"] = (id, status, updates) =>
    Effect.gen(function* () {
      const now = yield* DateTime.now;
      const nowStr = DateTime.formatIso(now);

      if (status === "running") {
        yield* updateExecutionRunning(id, nowStr, updates?.lastActivityName);
      } else if (status === "completed") {
        yield* updateExecutionCompleted(id, nowStr, updates?.output, updates?.lastActivityName);
      } else if (status === "failed") {
        yield* updateExecutionFailed(id, nowStr, updates?.error);
      } else {
        yield* updateExecutionGeneric(id, status);
      }
    });

  const getExecution: WorkflowPersistenceShape["getExecution"] = (id) =>
    Effect.gen(function* () {
      const rows = yield* sql<WorkflowExecutionRecord>`
          SELECT *
          FROM ${sql(executionTable)}
          WHERE id = ${id}
      `;
      const row = A.head(rows);
      if (O.isNone(row)) {
        return yield* new WorkflowNotFoundError({ executionId: id });
      }
      return row.value;
    });

  const findLatestBatchExecutionByBatchId: WorkflowPersistenceShape["findLatestBatchExecutionByBatchId"] = (batchId) =>
    Effect.gen(function* () {
      const rows = yield* sql<WorkflowExecutionRecord>`
          SELECT *
          FROM ${sql(executionTable)}
          WHERE workflow_type = 'batch_extraction'
            AND input ->> 'batchId' = ${batchId}
          ORDER BY created_at DESC
          LIMIT 1
      `;
      return A.head(rows);
    });

  const cancelExecution: WorkflowPersistenceShape["cancelExecution"] = (id, error) =>
    Effect.gen(function* () {
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
          SET status = 'cancelled',
              completed_at = ${nowStr},
              error = ${error}
          WHERE id = ${id}
      `.pipe(Effect.asVoid);
    });

  const requireBatchExecutionByBatchId: WorkflowPersistenceShape["requireBatchExecutionByBatchId"] = (batchId) =>
    findLatestBatchExecutionByBatchId(batchId).pipe(
      Effect.flatMap(
        O.match({
          onNone: () => Effect.fail(new BatchNotFoundError({ batchId })),
          onSome: (execution) => Effect.succeed(execution),
        })
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
