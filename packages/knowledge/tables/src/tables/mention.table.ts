import { type DocumentsEntityIds, KnowledgeEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const mention = OrgTable.make(KnowledgeEntityIds.MentionId)(
  {
    entityId: pg.text("entity_id").notNull().$type<KnowledgeEntityIds.KnowledgeEntityId.Type>(),
    text: pg.text("text").notNull(),
    startChar: pg.integer("start_char").notNull(),
    endChar: pg.integer("end_char").notNull(),
    documentId: pg.text("document_id").notNull().$type<DocumentsEntityIds.DocumentId.Type>(),
    documentVersionId: pg.text("document_version_id").notNull().$type<DocumentsEntityIds.DocumentVersionId.Type>(),
    chunkIndex: pg.integer("chunk_index"),
    extractionId: pg.text("extraction_id").$type<KnowledgeEntityIds.ExtractionId.Type>(),
    confidence: pg.real("confidence"),
    isPrimary: pg.boolean("is_primary").notNull().default(false),
    context: pg.text("context"),
  },
  (t) => [
    pg.index("mention_organization_id_idx").on(t.organizationId),
    pg.index("mention_entity_id_idx").on(t.entityId),
    pg.index("mention_document_id_idx").on(t.documentId),
    pg.index("mention_document_version_id_idx").on(t.documentVersionId),
    pg.index("mention_extraction_id_idx").on(t.extractionId),
    pg.index("mention_char_range_idx").on(t.documentId, t.startChar, t.endChar),
    pg.index("mention_primary_idx").on(t.entityId, t.isPrimary),
  ]
);
