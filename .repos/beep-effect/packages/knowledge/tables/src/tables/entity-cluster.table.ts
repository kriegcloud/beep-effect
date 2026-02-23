import { KnowledgeEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { foreignKey } from "drizzle-orm/pg-core";
import { entity } from "./entity.table";

export const entityCluster = OrgTable.make(KnowledgeEntityIds.EntityClusterId)(
  {
    canonicalEntityId: pg.text("canonical_entity_id").notNull().$type<KnowledgeEntityIds.KnowledgeEntityId.Type>(),
    memberIds: pg
      .jsonb("member_ids")
      .notNull()
      .$type<readonly [KnowledgeEntityIds.KnowledgeEntityId.Type, ...KnowledgeEntityIds.KnowledgeEntityId.Type[]]>(),
    cohesion: pg.real("cohesion").notNull(),
    sharedTypes: pg.jsonb("shared_types").notNull().$type<ReadonlyArray<string>>(),
    ontologyId: pg.text("ontology_id").$type<KnowledgeEntityIds.OntologyId.Type>(),
  },
  (t) => [
    pg.index("entity_cluster_canonical_idx").on(t.canonicalEntityId),
    pg.index("entity_cluster_org_idx").on(t.organizationId),
    pg.index("entity_cluster_ontology_idx").on(t.ontologyId),
    foreignKey({
      name: "entity_cluster_canonical_fk",
      columns: [t.canonicalEntityId],
      foreignColumns: [entity.id],
    }),
  ]
);
