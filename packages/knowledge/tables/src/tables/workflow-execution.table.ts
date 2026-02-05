import { KnowledgeEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import { datetime } from "@beep/shared-tables/columns";
import * as pg from "drizzle-orm/pg-core";

export const workflowExecution = OrgTable.make(KnowledgeEntityIds.WorkflowExecutionId)(
  {
    workflowType: pg.text("workflow_type").notNull(),
    status: pg.text("status").notNull().default("pending"),
    input: pg.jsonb("input").$type<Record<string, unknown>>(),
    output: pg.jsonb("output").$type<Record<string, unknown>>(),
    error: pg.text("error"),
    startedAt: datetime("started_at"),
    completedAt: datetime("completed_at"),
    lastActivityName: pg.text("last_activity_name"),
    retryCount: pg.integer("retry_count").notNull().default(0),
  },
  (t) => [
    pg.index("workflow_execution_organization_id_idx").on(t.organizationId),
    pg.index("workflow_execution_status_idx").on(t.status),
    pg.index("workflow_execution_type_status_idx").on(t.workflowType, t.status),
  ]
);
