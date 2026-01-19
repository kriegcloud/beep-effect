/**
 * Mention table definition for Knowledge slice
 *
 * Stores individual entity mentions in source text with
 * character-level provenance tracking.
 *
 * @module knowledge-tables/tables/mention
 * @since 0.1.0
 */

import { KnowledgeEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

/**
 * Mention table for the knowledge slice.
 *
 * Tracks individual mentions of entities with exact text spans
 * and character offsets for provenance.
 *
 * @since 0.1.0
 * @category tables
 */
export const mention = OrgTable.make(KnowledgeEntityIds.MentionId)(
  {
    // Entity this mention refers to
    entityId: pg.text("entity_id").notNull(),

    // Exact text span from source document
    text: pg.text("text").notNull(),

    // Character offset start (0-indexed)
    startChar: pg.integer("start_char").notNull(),

    // Character offset end (exclusive)
    endChar: pg.integer("end_char").notNull(),

    // Source document ID
    documentId: pg.text("document_id").notNull(),

    // Chunk index within the document
    chunkIndex: pg.integer("chunk_index"),

    // Extraction run ID that created this mention
    extractionId: pg.text("extraction_id"),

    // Extraction confidence (0-1)
    confidence: pg.real("confidence"),

    // Whether this is the primary/canonical mention
    isPrimary: pg.boolean("is_primary").notNull().default(false),

    // Surrounding context text for disambiguation
    context: pg.text("context"),
  },
  (t) => [
    // Organization ID index for RLS filtering
    pg
      .index("mention_organization_id_idx")
      .on(t.organizationId),
    // Entity index for finding all mentions of an entity
    pg
      .index("mention_entity_id_idx")
      .on(t.entityId),
    // Document index for finding mentions in a document
    pg
      .index("mention_document_id_idx")
      .on(t.documentId),
    // Extraction index for grouping by extraction run
    pg
      .index("mention_extraction_id_idx")
      .on(t.extractionId),
    // Character offset index for text position queries
    pg
      .index("mention_char_range_idx")
      .on(t.documentId, t.startChar, t.endChar),
    // Primary mention index
    pg
      .index("mention_primary_idx")
      .on(t.entityId, t.isPrimary),
  ]
);
