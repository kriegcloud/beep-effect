/**
 * MentionRecord table definition for Knowledge slice
 *
 * Stores immutable mention extraction records preserving LLM output provenance.
 * MentionRecords serve as the evidence layer for entity resolution.
 *
 * @module knowledge-tables/tables/mention-record
 * @since 0.1.0
 */

import { type DocumentsEntityIds, KnowledgeEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import { datetime } from "@beep/shared-tables/columns";
import * as pg from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm/sql";

/**
 * MentionRecord table for the knowledge slice.
 *
 * Tracks immutable mention extraction records with full provenance metadata.
 * The only mutable field is `resolved_entity_id`, which links to the canonical entity.
 *
 * @since 0.1.0
 * @category tables
 */
export const mentionRecord = OrgTable.make(KnowledgeEntityIds.MentionRecordId)(
  {
    // Extraction run that produced this mention
    extractionId: pg.text("extraction_id").notNull().$type<KnowledgeEntityIds.ExtractionId.Type>(),

    // Source document ID for provenance tracking
    documentId: pg.text("document_id").notNull().$type<DocumentsEntityIds.DocumentId.Type>(),

    // Chunk index within the document
    chunkIndex: pg.integer("chunk_index").notNull(),

    // Raw extracted text from LLM
    rawText: pg.text("raw_text").notNull(),

    // Ontology type URI for this mention
    mentionType: pg.text("mention_type").notNull(),

    // LLM confidence score (0-1)
    confidence: pg.real("confidence").notNull(),

    // SHA256 hash of the LLM response for audit trails
    responseHash: pg.text("response_hash").notNull(),

    // When the mention was extracted by the LLM
    extractedAt: datetime("extracted_at").notNull().default(sql`now()`),

    // Resolved entity ID after clustering/resolution (MUTABLE)
    resolvedEntityId: pg.text("resolved_entity_id").$type<KnowledgeEntityIds.KnowledgeEntityId.Type>(),
  },
  (t) => [
    // Organization ID index for RLS filtering
    pg.index("mention_record_organization_id_idx").on(t.organizationId),

    // Extraction index for finding all mentions from an extraction run
    pg.index("mention_record_extraction_id_idx").on(t.extractionId),

    // Document index for provenance queries
    pg.index("mention_record_document_id_idx").on(t.documentId),

    // Resolved entity index for finding unresolved mentions and reverse lookups
    pg.index("mention_record_resolved_entity_id_idx").on(t.resolvedEntityId),

    // Compound index for multi-tenant extraction queries
    pg.index("mention_record_org_extraction_idx").on(t.organizationId, t.extractionId),

    // Text search index on rawText (requires pg_trgm extension)
    // NOTE: This index enables fast similarity searches on mention text
    pg.index("mention_record_raw_text_idx").using("gin", sql`${t.rawText} gin_trgm_ops`),

    // Chunk position index for ordered retrieval
    pg.index("mention_record_document_chunk_idx").on(t.documentId, t.chunkIndex),
  ]
);
