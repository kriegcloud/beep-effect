/**
 * Ontology table definition for Knowledge slice
 *
 * Stores OWL/RDFS ontology definitions used for knowledge extraction.
 *
 * @module knowledge-tables/tables/ontology
 * @since 0.1.0
 */

import { KnowledgeEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

/**
 * Ontology table for the knowledge slice.
 *
 * Stores ontology metadata and references to ontology files.
 *
 * @since 0.1.0
 * @category tables
 */
export const ontology = OrgTable.make(KnowledgeEntityIds.OntologyId)(
  {
    // Human-readable name
    name: pg.text("name").notNull(),

    // Namespace URI
    namespace: pg.text("namespace").notNull(),

    // Semantic version (ontologyVersion to avoid conflict with audit version)
    ontologyVersion: pg.text("ontology_version").notNull().default("1.0.0"),

    // Human-readable description
    description: pg.text("description"),

    // Status (draft, active, deprecated)
    status: pg.text("status").notNull().default("active").$type<"draft" | "active" | "deprecated">(),

    // Serialization format (turtle, rdfxml, jsonld, ntriples)
    format: pg.text("format").notNull().default("turtle").$type<"turtle" | "rdfxml" | "jsonld" | "ntriples">(),

    // Content hash for versioning and deduplication
    contentHash: pg.text("content_hash"),

    // Storage path to ontology file
    storagePath: pg.text("storage_path"),

    // Number of OWL/RDFS classes
    classCount: pg.integer("class_count"),

    // Number of OWL/RDFS properties
    propertyCount: pg.integer("property_count"),

    // Ontology-level metadata (JSON object)
    metadata: pg.jsonb("metadata").$type<Record<string, string>>(),
  },
  (t) => [
    // Organization ID index for RLS filtering
    pg
      .index("ontology_organization_id_idx")
      .on(t.organizationId),
    // Name index for lookups
    pg
      .index("ontology_name_idx")
      .on(t.name),
    // Namespace index for lookups
    pg
      .index("ontology_namespace_idx")
      .on(t.namespace),
    // Status index for filtering active ontologies
    pg
      .index("ontology_status_idx")
      .on(t.status),
    // Unique constraint on namespace + name + ontologyVersion per org
    pg
      .uniqueIndex("ontology_org_namespace_name_version_idx")
      .on(t.organizationId, t.namespace, t.name, t.ontologyVersion),
  ]
);
