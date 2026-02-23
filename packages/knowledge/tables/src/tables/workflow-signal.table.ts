import { KnowledgeEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import { datetime } from "@beep/shared-tables/columns";
import * as pg from "drizzle-orm/pg-core";

export const workflowSignal = OrgTable.make(KnowledgeEntityIds.WorkflowSignalId)(
  {
    executionId: pg.text("execution_id").notNull().$type<KnowledgeEntityIds.WorkflowExecutionId.Type>(),
    signalName: pg.text("signal_name").notNull(),
    payload: pg.jsonb("payload").$type<Record<string, unknown>>(),
    deliveredAt: datetime("delivered_at"),
    acknowledged: pg.boolean("acknowledged").notNull().default(false),
  },
  (t) => [
    pg.index("workflow_signal_organization_id_idx").on(t.organizationId),
    pg.index("workflow_signal_execution_id_idx").on(t.executionId),
    pg.index("workflow_signal_execution_name_idx").on(t.executionId, t.signalName),
    pg.index("workflow_signal_undelivered_idx").on(t.executionId, t.acknowledged),
  ]
);
