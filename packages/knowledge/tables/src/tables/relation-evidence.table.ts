import { type DocumentsEntityIds, KnowledgeEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { relation } from "./relation.table";

export const relationEvidence = OrgTable.make(KnowledgeEntityIds.RelationEvidenceId)(
  {
    relationId: pg
      .text("relation_id")
      .notNull()
      .references(() => relation.id, { onDelete: "cascade" })
      .$type<KnowledgeEntityIds.RelationId.Type>(),

    documentId: pg.text("document_id").notNull().$type<DocumentsEntityIds.DocumentId.Type>(),
    documentVersionId: pg.text("document_version_id").notNull().$type<DocumentsEntityIds.DocumentVersionId.Type>(),

    startChar: pg.integer("start_char").notNull(),
    endChar: pg.integer("end_char").notNull(),

    text: pg.text("text").notNull(),
    confidence: pg.real("confidence"),

    extractionId: pg.text("extraction_id").$type<KnowledgeEntityIds.ExtractionId.Type>(),
  },
  (t) => [
    pg.index("relation_evidence_organization_id_idx").on(t.organizationId),
    pg.index("relation_evidence_relation_id_idx").on(t.relationId),
    pg.index("relation_evidence_document_id_idx").on(t.documentId),
    pg.index("relation_evidence_document_version_id_idx").on(t.documentVersionId),
    pg.index("relation_evidence_extraction_id_idx").on(t.extractionId),
    pg.index("relation_evidence_char_range_idx").on(t.documentId, t.startChar, t.endChar),
  ]
);
