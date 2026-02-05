import { KnowledgeEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const relation = OrgTable.make(KnowledgeEntityIds.RelationId)(
  {
    subjectId: pg.text("subject_id").notNull().$type<KnowledgeEntityIds.KnowledgeEntityId.Type>(),
    predicate: pg.text("predicate").notNull(),
    objectId: pg.text("object_id").$type<KnowledgeEntityIds.KnowledgeEntityId.Type>(),
    literalValue: pg.text("literal_value"),
    literalType: pg.text("literal_type"),
    ontologyId: pg.text("ontology_id").notNull().default("default").$type<KnowledgeEntityIds.OntologyId.Type>(),
    extractionId: pg.text("extraction_id").$type<KnowledgeEntityIds.ExtractionId.Type>(),
    evidence: pg.jsonb("evidence").$type<{
      text: string;
      startChar: number;
      endChar: number;
      confidence?: number;
    }>(),
    groundingConfidence: pg.real("grounding_confidence"),
  },
  (t) => [
    pg.index("relation_organization_id_idx").on(t.organizationId),
    pg.index("relation_subject_id_idx").on(t.subjectId),
    pg.index("relation_object_id_idx").on(t.objectId),
    pg.index("relation_predicate_idx").on(t.predicate),
    pg.index("relation_ontology_id_idx").on(t.ontologyId),
    pg.index("relation_extraction_id_idx").on(t.extractionId),
    pg.index("relation_triple_idx").on(t.subjectId, t.predicate, t.objectId),
  ]
);
