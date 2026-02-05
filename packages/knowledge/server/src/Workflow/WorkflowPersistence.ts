import {$KnowledgeServerId} from "@beep/identity/packages";
import {WorkflowNotFoundError} from "@beep/knowledge-domain/errors";
import type {
  WorkflowActivityStatus,
  WorkflowExecutionStatus,
  WorkflowType,
} from "@beep/knowledge-domain/value-objects";
import {KnowledgeEntityIds} from "@beep/shared-domain";
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

const JsonRecord = S.Record({key: S.String, value: S.Unknown});
const toJsonb = S.encodeSync(S.parseJson(JsonRecord));

const executionTable = KnowledgeEntityIds.WorkflowExecutionId.tableName;
const activityTable = KnowledgeEntityIds.WorkflowActivityId.tableName;

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

export interface WorkflowActivityRecord {
  readonly id: KnowledgeEntityIds.WorkflowActivityId.Type;
  readonly organizationId: string;
  readonly executionId: KnowledgeEntityIds.WorkflowExecutionId.Type;
  readonly activityName: string;
  readonly status: WorkflowActivityStatus.Type;
  readonly input: Record<string, unknown> | null;
  readonly output: Record<string, unknown> | null;
  readonly error: string | null;
  readonly startedAt: Date | null;
  readonly completedAt: Date | null;
  readonly attempt: number;
  readonly durationMs: number | null;
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

  readonly recordActivityStart: (params: {
    readonly id: KnowledgeEntityIds.WorkflowActivityId.Type;
    readonly executionId: KnowledgeEntityIds.WorkflowExecutionId.Type;
    readonly organizationId: string;
    readonly activityName: string;
    readonly attempt: number;
    readonly input?: Record<string, unknown>;
  }) => Effect.Effect<void, SqlError.SqlError>;

  readonly recordActivityComplete: (
    id: KnowledgeEntityIds.WorkflowActivityId.Type,
    output?: Record<string, unknown>,
    durationMs?: number
  ) => Effect.Effect<void, SqlError.SqlError>;

  readonly recordActivityFailed: (
    id: KnowledgeEntityIds.WorkflowActivityId.Type,
    error: string,
    durationMs?: number
  ) => Effect.Effect<void, SqlError.SqlError>;

  readonly findCompletedActivity: (
    executionId: KnowledgeEntityIds.WorkflowExecutionId.Type,
    activityName: string
  ) => Effect.Effect<O.Option<WorkflowActivityRecord>, SqlError.SqlError>;
}

export class WorkflowPersistence extends Context.Tag($I`WorkflowPersistence`)<
  WorkflowPersistence,
  WorkflowPersistenceShape
>() {
}

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
                    started_at = ${nowStr},
                    last_activity_name = ${lastActivityName}
                WHERE id = ${id}
      `.pipe(Effect.asVoid)
      : sql`
                UPDATE ${sql(executionTable)}
                SET status = 'running',
                    started_at = ${nowStr}
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
        return yield* new WorkflowNotFoundError({executionId: id});
      }
      return row.value;
    });

  const recordActivityStart: WorkflowPersistenceShape["recordActivityStart"] = (params) =>
    Effect.gen(function* () {
      const now = yield* DateTime.now;
      const nowStr = DateTime.formatIso(now);
      yield* sql`
          INSERT INTO ${sql(activityTable)}
          (id, organization_id, execution_id, activity_name, status, attempt, started_at, input)
          VALUES (${params.id}, ${params.organizationId}, ${params.executionId},
                  ${params.activityName}, 'running', ${params.attempt},
                  ${nowStr}, ${toJsonb(params.input ?? {})}::jsonb)
      `.pipe(Effect.asVoid);
    });

  const recordActivityComplete: WorkflowPersistenceShape["recordActivityComplete"] = (id, output, durationMs) =>
    Effect.gen(function* () {
      const now = yield* DateTime.now;
      const nowStr = DateTime.formatIso(now);

      if (output !== undefined && durationMs !== undefined) {
        yield* sql`
            UPDATE ${sql(activityTable)}
            SET status       = 'completed',
                completed_at = ${nowStr},
                output       = ${toJsonb(output)}::jsonb, duration_ms = ${durationMs}
            WHERE id = ${id}
        `.pipe(Effect.asVoid);
      } else if (output !== undefined) {
        yield* sql`
            UPDATE ${sql(activityTable)}
            SET status       = 'completed',
                completed_at = ${nowStr},
                output       = ${toJsonb(output)}::jsonb
            WHERE id = ${id}
        `.pipe(Effect.asVoid);
      } else if (durationMs !== undefined) {
        yield* sql`
            UPDATE ${sql(activityTable)}
            SET status       = 'completed',
                completed_at = ${nowStr},
                duration_ms  = ${durationMs}
            WHERE id = ${id}
        `.pipe(Effect.asVoid);
      } else {
        yield* sql`
            UPDATE ${sql(activityTable)}
            SET status       = 'completed',
                completed_at = ${nowStr}
            WHERE id = ${id}
        `.pipe(Effect.asVoid);
      }
    });

  const recordActivityFailed: WorkflowPersistenceShape["recordActivityFailed"] = (id, error, durationMs) =>
    Effect.gen(function* () {
      const now = yield* DateTime.now;
      const nowStr = DateTime.formatIso(now);

      if (durationMs !== undefined) {
        yield* sql`
            UPDATE ${sql(activityTable)}
            SET status       = 'failed',
                completed_at = ${nowStr},
                error        = ${error},
                duration_ms  = ${durationMs}
            WHERE id = ${id}
        `.pipe(Effect.asVoid);
      } else {
        yield* sql`
            UPDATE ${sql(activityTable)}
            SET status       = 'failed',
                completed_at = ${nowStr},
                error        = ${error}
            WHERE id = ${id}
        `.pipe(Effect.asVoid);
      }
    });

  const findCompletedActivity: WorkflowPersistenceShape["findCompletedActivity"] = (executionId, activityName) =>
    Effect.gen(function* () {
      const rows = yield* sql<WorkflowActivityRecord>`
          SELECT *
          FROM ${sql(activityTable)}
          WHERE execution_id = ${executionId}
            AND activity_name = ${activityName}
            AND status = 'completed'
          ORDER BY attempt DESC LIMIT 1
      `;
      return A.head(rows);
    });

  return WorkflowPersistence.of({
    createExecution,
    updateExecutionStatus,
    getExecution,
    recordActivityStart,
    recordActivityComplete,
    recordActivityFailed,
    findCompletedActivity,
  });
});

export const WorkflowPersistenceLive = Layer.effect(WorkflowPersistence, serviceEffect);
