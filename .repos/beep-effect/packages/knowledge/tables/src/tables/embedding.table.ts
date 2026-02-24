import type { Embedding } from "@beep/knowledge-domain/entities";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import { vector768 } from "@beep/shared-tables/columns";
import * as pg from "drizzle-orm/pg-core";

export const embedding = OrgTable.make(KnowledgeEntityIds.EmbeddingId)(
  {
    entityType: pg.text("entity_type").notNull().$type<Embedding.EntityType.Type>(),
    entityId: pg
      .text("entity_id")
      .notNull()
      .$type<
        | KnowledgeEntityIds.ClassDefinitionId.Type
        | KnowledgeEntityIds.KnowledgeEntityId.Type
        | KnowledgeEntityIds.RelationId.Type
      >(),
    ontologyId: pg.text("ontology_id").$type<KnowledgeEntityIds.OntologyId.Type>(),
    embedding: vector768("embedding").notNull(),
    contentText: pg.text("content_text"),
    model: pg.text("model").notNull().default("nomic-embed-text-v1.5"),
  },
  (t) => [pg.index("embedding_organization_id_idx").on(t.organizationId)]
);
