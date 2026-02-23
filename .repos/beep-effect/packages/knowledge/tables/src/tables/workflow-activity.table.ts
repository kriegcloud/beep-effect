import { KnowledgeEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import { datetime } from "@beep/shared-tables/columns";
import * as pg from "drizzle-orm/pg-core";

export const workflowActivity = OrgTable.make(KnowledgeEntityIds.WorkflowActivityId)(
  {
    executionId: pg.text("execution_id").notNull().$type<KnowledgeEntityIds.WorkflowExecutionId.Type>(),
    activityName: pg.text("activity_name").notNull(),
    status: pg.text("status").notNull().default("pending"),
    input: pg.jsonb("input").$type<Record<string, unknown>>(),
    output: pg.jsonb("output").$type<Record<string, unknown>>(),
    error: pg.text("error"),
    startedAt: datetime("started_at"),
    completedAt: datetime("completed_at"),
    attempt: pg.integer("attempt").notNull().default(1),
    durationMs: pg.integer("duration_ms"),
  },
  (t) => [
    pg.index("workflow_activity_organization_id_idx").on(t.organizationId),
    pg.index("workflow_activity_execution_id_idx").on(t.executionId),
    pg.index("workflow_activity_execution_name_idx").on(t.executionId, t.activityName),
    pg.index("workflow_activity_status_idx").on(t.status),
  ]
);
