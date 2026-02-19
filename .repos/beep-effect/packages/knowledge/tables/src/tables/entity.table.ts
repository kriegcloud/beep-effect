import type { Entity } from "@beep/knowledge-domain/entities";
import { KnowledgeEntityIds, type WorkspacesEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
export const entity = OrgTable.make(KnowledgeEntityIds.KnowledgeEntityId)(
  {
    mention: pg.text("mention").notNull(),
    types: pg.jsonb("types").notNull().$type<(typeof Entity.Model.Encoded)["types"]>(),
    attributes: pg.jsonb("attributes").notNull().$type<(typeof Entity.Model.Encoded)["attributes"]>(),
    ontologyId: pg.text("ontology_id").$type<KnowledgeEntityIds.OntologyId.Encoded>(),
    documentId: pg.text("document_id").$type<WorkspacesEntityIds.DocumentId.Encoded>(),
    sourceUri: pg.text("source_uri"),
    extractionId: pg.text("extraction_id").$type<KnowledgeEntityIds.ExtractionId.Encoded>(),
    groundingConfidence: pg.real("grounding_confidence"),
    mentions: pg.jsonb("mentions").$type<(typeof Entity.Model.Encoded)["mentions"]>(),
  },
  (t) => [
    pg.index("entity_organization_id_idx").on(t.organizationId),
    pg.index("entity_ontology_id_idx").on(t.ontologyId),
    pg.index("entity_document_id_idx").on(t.documentId),
    pg.index("entity_extraction_id_idx").on(t.extractionId),
  ]
);
