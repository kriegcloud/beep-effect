import { DocumentsEntityIds, KnowledgeEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import { datetime } from "@beep/shared-tables/columns";
import * as pg from "drizzle-orm/pg-core";

export const batchExecution = OrgTable.make(KnowledgeEntityIds.BatchExecutionId)(
  {
    ontologyId: pg.text("ontology_id").notNull().$type<KnowledgeEntityIds.OntologyId.Type>(),
    status: pg.text("status").notNull().default("pending"),
    documentIds: pg.jsonb("document_ids").notNull().$type<ReadonlyArray<DocumentsEntityIds.DocumentId.Type>>(),
    totalDocuments: pg.integer("total_documents").notNull(),
    completedDocuments: pg.integer("completed_documents").notNull().default(0),
    failedDocuments: pg.integer("failed_documents").notNull().default(0),
    entityCount: pg.integer("entity_count"),
    relationCount: pg.integer("relation_count"),
    concurrency: pg.integer("concurrency").notNull().default(3),
    failurePolicy: pg.text("failure_policy").notNull().default("continue-on-failure"),
    maxRetries: pg.integer("max_retries").notNull().default(2),
    enableEntityResolution: pg.boolean("enable_entity_resolution").notNull().default(true),
    startedAt: datetime("started_at"),
    completedAt: datetime("completed_at"),
    error: pg.text("error"),
    config: pg.jsonb("config").$type<Record<string, unknown>>(),
  },
  (t) => [
    pg.index("batch_execution_organization_id_idx").on(t.organizationId),
    pg.index("batch_execution_status_idx").on(t.status),
    pg.index("batch_execution_org_status_idx").on(t.organizationId, t.status),
  ]
);
