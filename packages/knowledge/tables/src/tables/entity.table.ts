import { KnowledgeEntityIds, type WorkspacesEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const entity = OrgTable.make(KnowledgeEntityIds.KnowledgeEntityId)(
  {
    mention: pg.text("mention").notNull(),
    types: pg.jsonb("types").notNull().$type<readonly [string, ...string[]]>(),
    attributes: pg.jsonb("attributes").notNull().$type<Record<string, string | number | boolean>>(),
    ontologyId: pg.text("ontology_id").$type<KnowledgeEntityIds.OntologyId.Type>(),
    documentId: pg.text("document_id").$type<WorkspacesEntityIds.DocumentId.Type>(),
    sourceUri: pg.text("source_uri"),
    extractionId: pg.text("extraction_id").$type<KnowledgeEntityIds.ExtractionId.Type>(),
    groundingConfidence: pg.real("grounding_confidence"),
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
    pg.index("entity_organization_id_idx").on(t.organizationId),
    pg.index("entity_ontology_id_idx").on(t.ontologyId),
    pg.index("entity_document_id_idx").on(t.documentId),
    pg.index("entity_extraction_id_idx").on(t.extractionId),
  ]
);
