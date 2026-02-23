import { KnowledgeEntityIds, type WorkspacesEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import { datetime } from "@beep/shared-tables/columns";
import * as pg from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm/sql";

export const mentionRecord = OrgTable.make(KnowledgeEntityIds.MentionRecordId)(
  {
    extractionId: pg.text("extraction_id").notNull().$type<KnowledgeEntityIds.ExtractionId.Type>(),
    documentId: pg.text("document_id").notNull().$type<WorkspacesEntityIds.DocumentId.Type>(),
    chunkIndex: pg.integer("chunk_index").notNull(),
    rawText: pg.text("raw_text").notNull(),
    mentionType: pg.text("mention_type").notNull(),
    confidence: pg.real("confidence").notNull(),
    responseHash: pg.text("response_hash").notNull(),
    extractedAt: datetime("extracted_at").notNull(),
    resolvedEntityId: pg.text("resolved_entity_id").$type<KnowledgeEntityIds.KnowledgeEntityId.Type>(),
  },
  (t) => [
    pg.index("mention_record_organization_id_idx").on(t.organizationId),
    pg.index("mention_record_extraction_id_idx").on(t.extractionId),
    pg.index("mention_record_document_id_idx").on(t.documentId),
    pg.index("mention_record_resolved_entity_id_idx").on(t.resolvedEntityId),
    pg.index("mention_record_org_extraction_idx").on(t.organizationId, t.extractionId),
    pg.index("mention_record_raw_text_idx").using("gin", sql`${t.rawText} gin_trgm_ops`),
    pg.index("mention_record_document_chunk_idx").on(t.documentId, t.chunkIndex),
  ]
);
