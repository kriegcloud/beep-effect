import { KnowledgeEntityIds, type WorkspacesEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { meetingPrepBullet } from "./meeting-prep-bullet.table";
import { mention } from "./mention.table";
import { relationEvidence } from "./relation-evidence.table";

export const meetingPrepEvidence = OrgTable.make(KnowledgeEntityIds.MeetingPrepEvidenceId)(
  {
    bulletId: pg
      .text("bullet_id")
      .notNull()
      .references(() => meetingPrepBullet.id, { onDelete: "cascade" })
      .$type<KnowledgeEntityIds.MeetingPrepBulletId.Type>(),

    // One of: "mention" | "relation" | "document_span"
    sourceType: pg.text("source_type").notNull().$type<"mention" | "relation" | "document_span">(),

    mentionId: pg
      .text("mention_id")
      .references(() => mention.id, { onDelete: "cascade" })
      .$type<KnowledgeEntityIds.MentionId.Type>(),

    relationEvidenceId: pg
      .text("relation_evidence_id")
      .references(() => relationEvidence.id, { onDelete: "cascade" })
      .$type<KnowledgeEntityIds.RelationEvidenceId.Type>(),

    documentId: pg.text("document_id").$type<WorkspacesEntityIds.DocumentId.Type>(),
    documentVersionId: pg.text("document_version_id").$type<WorkspacesEntityIds.DocumentVersionId.Type>(),
    startChar: pg.integer("start_char"),
    endChar: pg.integer("end_char"),
    text: pg.text("text"),
    confidence: pg.real("confidence"),
    extractionId: pg.text("extraction_id").$type<KnowledgeEntityIds.ExtractionId.Type>(),
  },
  (t) => [
    pg.index("meeting_prep_evidence_organization_id_idx").on(t.organizationId),
    pg.index("meeting_prep_evidence_bullet_id_idx").on(t.bulletId),
    pg.index("meeting_prep_evidence_source_type_idx").on(t.sourceType),
    pg.index("meeting_prep_evidence_mention_id_idx").on(t.mentionId),
    pg.index("meeting_prep_evidence_relation_evidence_id_idx").on(t.relationEvidenceId),
    pg.index("meeting_prep_evidence_document_id_idx").on(t.documentId),
    pg.index("meeting_prep_evidence_extraction_id_idx").on(t.extractionId),
  ]
);
