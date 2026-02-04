/**
 * Relation table definition for Knowledge slice
 *
 * Stores knowledge graph relations (subject-predicate-object triples)
 * with evidence and provenance information.
 *
 * @module knowledge-tables/tables/relation
 * @since 0.1.0
 */

import { KnowledgeEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

/**
 * Relation table for the knowledge slice.
 *
 * Stores RDF-like triples connecting entities via ontology properties.
 *
 * @since 0.1.0
 * @category tables
 */
export const relation = OrgTable.make(KnowledgeEntityIds.RelationId)(
  {
    // Subject entity ID (required)
    subjectId: pg.text("subject_id").notNull().$type<KnowledgeEntityIds.KnowledgeEntityId.Type>(),

    // Predicate (ontology property URI)
    predicate: pg.text("predicate").notNull(),

    // Object entity ID (for object properties, mutually exclusive with literalValue)
    objectId: pg.text("object_id").$type<KnowledgeEntityIds.KnowledgeEntityId.Type>(),

    // Literal value (for datatype properties, mutually exclusive with objectId)
    literalValue: pg.text("literal_value"),

    // Literal type (XSD datatype or language tag)
    literalType: pg.text("literal_type"),

    // Ontology scoping
    ontologyId: pg.text("ontology_id").notNull().default("default").$type<KnowledgeEntityIds.OntologyId.Type>(),

    // Extraction run ID that created this relation
    extractionId: pg.text("extraction_id").$type<KnowledgeEntityIds.ExtractionId.Type>(),

    // Evidence span (JSON object with text and offsets)
    evidence: pg.jsonb("evidence").$type<{
      text: string;
      startChar: number;
      endChar: number;
      confidence?: number;
    }>(),

    // System-generated grounding confidence (0-1)
    groundingConfidence: pg.real("grounding_confidence"),
  },
  (t) => [
    // Organization ID index for RLS filtering
    pg.index("relation_organization_id_idx").on(t.organizationId),
    // Subject index for querying outgoing relations
    pg.index("relation_subject_id_idx").on(t.subjectId),
    // Object index for querying incoming relations
    pg.index("relation_object_id_idx").on(t.objectId),
    // Predicate index for querying by property type
    pg.index("relation_predicate_idx").on(t.predicate),
    // Ontology index for filtering by ontology
    pg.index("relation_ontology_id_idx").on(t.ontologyId),
    // Extraction index for grouping by extraction run
    pg.index("relation_extraction_id_idx").on(t.extractionId),
    // Composite index for triple lookups
    pg.index("relation_triple_idx").on(t.subjectId, t.predicate, t.objectId),
  ]
);
