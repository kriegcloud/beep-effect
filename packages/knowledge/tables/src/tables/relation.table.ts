import { KnowledgeEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import type { Relation } from "@beep/knowledge-domain/entities";
export const relation = OrgTable.make(KnowledgeEntityIds.RelationId)(
  {
    subjectId: pg.text("subject_id").notNull().$type<KnowledgeEntityIds.KnowledgeEntityId.Encoded>(),
    predicate: pg.text("predicate").notNull(),
    objectId: pg.text("object_id").$type<KnowledgeEntityIds.KnowledgeEntityId.Encoded>(),
    literalValue: pg.text("literal_value"),
    literalType: pg.text("literal_type"),
    ontologyId: pg.text("ontology_id").notNull().default("default").$type<KnowledgeEntityIds.OntologyId.Encoded>(),
    extractionId: pg.text("extraction_id"),
    evidence: pg.jsonb("evidence").$type<typeof Relation.Model.fields.evidence.Encoded>(),
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
