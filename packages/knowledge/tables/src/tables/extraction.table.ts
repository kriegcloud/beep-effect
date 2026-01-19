/**
 * Extraction table definition for Knowledge slice
 *
 * Stores knowledge extraction run records with status and statistics.
 *
 * @module knowledge-tables/tables/extraction
 * @since 0.1.0
 */

import type { Extraction } from "@beep/knowledge-domain/entities";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import { datetime } from "@beep/shared-tables/columns";
import * as pg from "drizzle-orm/pg-core";

/**
 * Extraction table for the knowledge slice.
 *
 * Tracks extraction runs with status, timing, and statistics.
 *
 * @since 0.1.0
 * @category tables
 */
export const extraction = OrgTable.make(KnowledgeEntityIds.ExtractionId)(
  {
    // Source document ID
    documentId: pg.text("document_id").notNull(),

    // Source document URI
    sourceUri: pg.text("source_uri"),

    // Ontology used for extraction
    ontologyId: pg.text("ontology_id").notNull(),

    // Extraction status
    status: pg.text("status").notNull().default("pending").$type<Extraction.ExtractionStatus.Type>(),

    // When extraction started
    startedAt: datetime("started_at"),

    // When extraction completed (or failed)
    completedAt: datetime("completed_at"),

    // Number of entities extracted
    entityCount: pg.integer("entity_count"),

    // Number of relations extracted
    relationCount: pg.integer("relation_count"),

    // Number of text chunks processed
    chunkCount: pg.integer("chunk_count"),

    // Total LLM tokens consumed
    totalTokens: pg.integer("total_tokens"),

    // Error message if extraction failed
    errorMessage: pg.text("error_message"),

    // Extraction configuration (JSON object)
    config: pg.jsonb("config").$type<Record<string, unknown>>(),
  },
  (t) => [
    // Organization ID index for RLS filtering
    pg
      .index("extraction_organization_id_idx")
      .on(t.organizationId),
    // Document index for finding extractions for a document
    pg
      .index("extraction_document_id_idx")
      .on(t.documentId),
    // Ontology index for filtering by ontology
    pg
      .index("extraction_ontology_id_idx")
      .on(t.ontologyId),
    // Status index for filtering by status
    pg
      .index("extraction_status_idx")
      .on(t.status),
    // Compound index for recent extractions
    pg
      .index("extraction_status_created_at_idx")
      .on(t.status, t.createdAt),
  ]
);
