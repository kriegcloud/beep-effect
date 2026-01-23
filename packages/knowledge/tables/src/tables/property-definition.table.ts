/**
 * PropertyDefinition table definition for Knowledge slice
 *
 * Stores OWL/RDFS property definitions extracted from ontology files.
 *
 * @module knowledge-tables/tables/propertyDefinition
 * @since 0.1.0
 */

import { KnowledgeEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { foreignKey } from "drizzle-orm/pg-core";
import { ontology } from "./ontology.table";

/**
 * PropertyDefinition table for the knowledge slice.
 *
 * Stores property metadata extracted from OWL/RDFS ontologies.
 *
 * @since 0.1.0
 * @category tables
 */
export const propertyDefinition = OrgTable.make(KnowledgeEntityIds.PropertyDefinitionId)(
  {
    // Reference to parent ontology
    // Note: FK constraint is added via foreignKey() in extraConfig to use custom short name
    ontologyId: pg.text("ontology_id").notNull().$type<KnowledgeEntityIds.OntologyId.Type>(),

    // Full IRI of the property
    iri: pg.text("iri").notNull(),

    // Human-readable label (rdfs:label)
    label: pg.text("label").notNull(),

    // Description (rdfs:comment)
    comment: pg.text("comment"),

    // Local name extracted from IRI
    localName: pg.text("local_name"),

    // Domain class IRIs (rdfs:domain)
    domain: pg.jsonb("domain").$type<string[]>(),

    // Range class IRIs or datatype (rdfs:range)
    range: pg.jsonb("range").$type<string[]>(),

    // Property type: object or datatype
    rangeType: pg.text("range_type").notNull().default("object").$type<"object" | "datatype">(),

    // Whether property is functional (owl:FunctionalProperty)
    isFunctional: pg.boolean("is_functional").notNull().default(false),

    // Inverse property IRIs (owl:inverseOf)
    inverseOf: pg.jsonb("inverse_of").$type<string[]>(),

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

    // Parent property IRIs (rdfs:subPropertyOf)
    broader: pg.jsonb("broader").$type<string[]>(),

    // Child property IRIs
    narrower: pg.jsonb("narrower").$type<string[]>(),

    // Related property IRIs
    related: pg.jsonb("related").$type<string[]>(),

    // SKOS exact match
    exactMatch: pg.jsonb("exact_match").$type<string[]>(),

    // SKOS close match
    closeMatch: pg.jsonb("close_match").$type<string[]>(),
  },
  (t) => [
    // Organization ID index for RLS filtering
    pg
      .index("property_definition_organization_id_idx")
      .on(t.organizationId),
    // Ontology ID index for filtering by ontology
    pg
      .index("property_definition_ontology_id_idx")
      .on(t.ontologyId),
    // IRI index for lookups
    pg
      .index("property_definition_iri_idx")
      .on(t.iri),
    // Label index for text search
    pg
      .index("property_definition_label_idx")
      .on(t.label),
    // Range type index for filtering
    pg
      .index("property_definition_range_type_idx")
      .on(t.rangeType),
    // Unique constraint on IRI per ontology
    pg
      .uniqueIndex("property_definition_ontology_iri_idx")
      .on(t.ontologyId, t.iri),
    // FK with short custom name to avoid PostgreSQL 63-char limit
    foreignKey({
      name: "prop_def_ontology_fk",
      columns: [t.ontologyId],
      foreignColumns: [ontology.id],
    }).onDelete("cascade"),
  ]
);
