/**
 * ClassDefinition table definition for Knowledge slice
 *
 * Stores OWL/RDFS class definitions extracted from ontology files.
 *
 * @module knowledge-tables/tables/classDefinition
 * @since 0.1.0
 */

import { KnowledgeEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { foreignKey } from "drizzle-orm/pg-core";
import { ontology } from "./ontology.table";

/**
 * ClassDefinition table for the knowledge slice.
 *
 * Stores class metadata extracted from OWL/RDFS ontologies.
 *
 * @since 0.1.0
 * @category tables
 */
export const classDefinition = OrgTable.make(KnowledgeEntityIds.ClassDefinitionId)(
  {
    // Reference to parent ontology
    // Note: FK constraint is added via foreignKey() in extraConfig to use custom short name
    ontologyId: pg.text("ontology_id").notNull(),

    // Full IRI of the class
    iri: pg.text("iri").notNull(),

    // Human-readable label (rdfs:label)
    label: pg.text("label").notNull(),

    // Description (rdfs:comment)
    comment: pg.text("comment"),

    // Local name extracted from IRI
    localName: pg.text("local_name"),

    // Property IRIs applicable to this class (JSON array)
    properties: pg.jsonb("properties").$type<string[]>(),

    // SKOS preferred labels
    prefLabels: pg.jsonb("pref_labels").$type<string[]>(),

    // SKOS alternative labels (synonyms)
    altLabels: pg.jsonb("alt_labels").$type<string[]>(),

    // SKOS hidden labels (misspellings, abbreviations)
    hiddenLabels: pg.jsonb("hidden_labels").$type<string[]>(),

    // SKOS definition
    definition: pg.text("definition"),

    // SKOS scope note
    scopeNote: pg.text("scope_note"),

    // SKOS example
    example: pg.text("example"),

    // Parent class IRIs (rdfs:subClassOf)
    broader: pg.jsonb("broader").$type<string[]>(),

    // Child class IRIs
    narrower: pg.jsonb("narrower").$type<string[]>(),

    // Related class IRIs
    related: pg.jsonb("related").$type<string[]>(),

    // Equivalent class IRIs (owl:equivalentClass)
    equivalentClass: pg.jsonb("equivalent_class").$type<string[]>(),

    // SKOS exact match
    exactMatch: pg.jsonb("exact_match").$type<string[]>(),

    // SKOS close match
    closeMatch: pg.jsonb("close_match").$type<string[]>(),
  },
  (t) => [
    // Organization ID index for RLS filtering
    pg
      .index("class_definition_organization_id_idx")
      .on(t.organizationId),
    // Ontology ID index for filtering by ontology
    pg
      .index("class_definition_ontology_id_idx")
      .on(t.ontologyId),
    // IRI index for lookups
    pg
      .index("class_definition_iri_idx")
      .on(t.iri),
    // Label index for text search
    pg
      .index("class_definition_label_idx")
      .on(t.label),
    // Unique constraint on IRI per ontology
    pg
      .uniqueIndex("class_definition_ontology_iri_idx")
      .on(t.ontologyId, t.iri),
    // FK with short custom name to avoid PostgreSQL 63-char limit
    foreignKey({
      name: "class_def_ontology_fk",
      columns: [t.ontologyId],
      foreignColumns: [ontology.id],
    }).onDelete("cascade"),
  ]
);
