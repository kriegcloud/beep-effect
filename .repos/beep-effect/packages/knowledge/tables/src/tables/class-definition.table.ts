import { KnowledgeEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { foreignKey } from "drizzle-orm/pg-core";
import { ontology } from "./ontology.table";

export const classDefinition = OrgTable.make(KnowledgeEntityIds.ClassDefinitionId)(
  {
    ontologyId: pg.text("ontology_id").notNull().$type<KnowledgeEntityIds.OntologyId.Type>(),
    iri: pg.text("iri").notNull(),
    label: pg.text("label").notNull(),
    comment: pg.text("comment"),
    localName: pg.text("local_name"),
    properties: pg.jsonb("properties").$type<string[]>(),
    prefLabels: pg.jsonb("pref_labels").$type<string[]>(),
    altLabels: pg.jsonb("alt_labels").$type<string[]>(),
    hiddenLabels: pg.jsonb("hidden_labels").$type<string[]>(),
    definition: pg.text("definition"),
    scopeNote: pg.text("scope_note"),
    example: pg.text("example"),
    broader: pg.jsonb("broader").$type<string[]>(),
    narrower: pg.jsonb("narrower").$type<string[]>(),
    related: pg.jsonb("related").$type<string[]>(),
    equivalentClass: pg.jsonb("equivalent_class").$type<string[]>(),
    exactMatch: pg.jsonb("exact_match").$type<string[]>(),
    closeMatch: pg.jsonb("close_match").$type<string[]>(),
  },
  (t) => [
    pg.index("class_definition_organization_id_idx").on(t.organizationId),
    pg.index("class_definition_ontology_id_idx").on(t.ontologyId),
    pg.index("class_definition_iri_idx").on(t.iri),
    pg.index("class_definition_label_idx").on(t.label),
    pg.uniqueIndex("class_definition_ontology_iri_idx").on(t.ontologyId, t.iri),
    foreignKey({
      name: "class_def_ontology_fk",
      columns: [t.ontologyId],
      foreignColumns: [ontology.id],
    }).onDelete("cascade"),
  ]
);
