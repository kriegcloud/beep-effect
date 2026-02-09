import type { Extraction } from "@beep/knowledge-domain/entities";
import { type DocumentsEntityIds, KnowledgeEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import { datetime } from "@beep/shared-tables/columns";
import * as pg from "drizzle-orm/pg-core";

export const extraction = OrgTable.make(KnowledgeEntityIds.ExtractionId)(
  {
    documentId: pg.text("document_id").notNull().$type<DocumentsEntityIds.DocumentId.Type>(),
    // Version pinning for evidence integrity. Existing rows may be NULL until backfilled.
    documentVersionId: pg.text("document_version_id").$type<DocumentsEntityIds.DocumentVersionId.Type>(),
    sourceUri: pg.text("source_uri"),
    ontologyId: pg.text("ontology_id").notNull().$type<KnowledgeEntityIds.OntologyId.Type>(),
    status: pg.text("status").notNull().default("pending").$type<Extraction.ExtractionStatus.Type>(),
    startedAt: datetime("started_at"),
    completedAt: datetime("completed_at"),
    entityCount: pg.integer("entity_count"),
    relationCount: pg.integer("relation_count"),
    chunkCount: pg.integer("chunk_count"),
    totalTokens: pg.integer("total_tokens"),
    errorMessage: pg.text("error_message"),
    config: pg.jsonb("config").$type<Record<string, unknown>>(),
  },
  (t) => [
    pg.index("extraction_organization_id_idx").on(t.organizationId),
    pg.index("extraction_document_id_idx").on(t.documentId),
    pg.index("extraction_document_version_id_idx").on(t.documentVersionId),
    pg.index("extraction_ontology_id_idx").on(t.ontologyId),
    pg.index("extraction_status_idx").on(t.status),
    pg.index("extraction_status_created_at_idx").on(t.status, t.createdAt),
  ]
);
