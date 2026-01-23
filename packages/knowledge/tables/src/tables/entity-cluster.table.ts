/**
 * EntityCluster table definition for Knowledge slice
 *
 * Stores entity resolution clusters grouping entities that refer
 * to the same real-world entity.
 *
 * @module knowledge-tables/tables/entityCluster
 * @since 0.1.0
 */

import { KnowledgeEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { foreignKey } from "drizzle-orm/pg-core";
import { entity } from "./entity.table.ts";

/**
 * EntityCluster table for the knowledge slice.
 *
 * Uses OrgTable.make factory to include standard audit columns
 * and organization scoping.
 *
 * @since 0.1.0
 * @category tables
 */
export const entityCluster = OrgTable.make(KnowledgeEntityIds.EntityClusterId)(
  {
    // Canonical entity ID (the representative of this cluster)
    // Note: FK constraint is added via foreignKey() in extraConfig to use custom short name
    canonicalEntityId: pg.text("canonical_entity_id").notNull().$type<KnowledgeEntityIds.KnowledgeEntityId.Type>(),

    // Member entity IDs in this cluster (JSON array)
    memberIds: pg.jsonb("member_ids").notNull().$type<ReadonlyArray<KnowledgeEntityIds.KnowledgeEntityId.Type>>(),

    // Internal cluster cohesion score (average pairwise similarity)
    cohesion: pg.real("cohesion").notNull(),

    // Shared type IRIs across cluster members (JSON array)
    sharedTypes: pg.jsonb("shared_types").notNull().$type<ReadonlyArray<string>>(),

    // Ontology scoping (optional - null means default ontology)
    ontologyId: pg.text("ontology_id").$type<KnowledgeEntityIds.OntologyId.Type>(),
  },
  (t) => [
    // Index for looking up clusters by canonical entity
    pg
      .index("entity_cluster_canonical_idx")
      .on(t.canonicalEntityId),
    // Organization ID index for RLS filtering
    pg
      .index("entity_cluster_org_idx")
      .on(t.organizationId),
    // Ontology index for filtering
    pg
      .index("entity_cluster_ontology_idx")
      .on(t.ontologyId),
    // FK with short custom name to avoid PostgreSQL 63-char limit
    foreignKey({
      name: "entity_cluster_canonical_fk",
      columns: [t.canonicalEntityId],
      foreignColumns: [entity.id],
    }),
  ]
);
