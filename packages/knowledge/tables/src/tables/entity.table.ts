/**
 * Entity table definition for Knowledge slice
 *
 * Stores extracted knowledge graph entities with types,
 * attributes, and provenance information.
 *
 * @module knowledge-tables/tables/entity
 * @since 0.1.0
 */

import { KnowledgeEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

/**
 * Entity table for the knowledge slice.
 *
 * Uses OrgTable.make factory to include standard audit columns
 * and organization scoping.
 *
 * @since 0.1.0
 * @category tables
 */
export const entity = OrgTable.make(KnowledgeEntityIds.KnowledgeEntityId)(
  {
    // Original text mention from source
    mention: pg.text("mention").notNull(),

    // Ontology class URIs this entity instantiates (JSON array)
    types: pg.jsonb("types").notNull().$type<ReadonlyArray<string>>(),

    // Entity attributes as property-value pairs (JSON object)
    attributes: pg.jsonb("attributes").notNull().default({}).$type<Record<string, string | number | boolean>>(),

    // Ontology scoping
    ontologyId: pg.text("ontology_id").notNull().default("default"),

    // Source document ID for provenance
    documentId: pg.text("document_id"),

    // Source URI where document was loaded from
    sourceUri: pg.text("source_uri"),

    // Extraction run ID that created this entity
    extractionId: pg.text("extraction_id"),

    // System-generated grounding confidence (0-1)
    groundingConfidence: pg.real("grounding_confidence"),

    // Evidence spans (JSON array of EvidenceSpan objects)
    mentions: pg.jsonb("mentions").$type<
      ReadonlyArray<{
        text: string;
        startChar: number;
        endChar: number;
        confidence?: number;
      }>
    >(),
  },
  (t) => [
    // Organization ID index for RLS filtering
    pg
      .index("entity_organization_id_idx")
      .on(t.organizationId),
    // Ontology index for filtering by ontology
    pg
      .index("entity_ontology_id_idx")
      .on(t.ontologyId),
    // Document index for provenance queries
    pg
      .index("entity_document_id_idx")
      .on(t.documentId),
    // Extraction index for grouping by extraction run
    pg
      .index("entity_extraction_id_idx")
      .on(t.extractionId),
  ]
);
