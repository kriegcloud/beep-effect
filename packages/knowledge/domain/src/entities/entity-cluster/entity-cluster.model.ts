/**
 * EntityCluster domain model for Knowledge slice
 *
 * Represents a cluster of entities identified as referring to
 * the same real-world entity through entity resolution.
 *
 * @module knowledge-domain/entities/EntityCluster
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/EntityCluster");

/**
 * EntityCluster model for the knowledge slice.
 *
 * Represents a cluster of entities that have been identified as referring
 * to the same real-world entity. One entity is selected as the canonical
 * representative, and all members are linked via owl:sameAs semantics.
 *
 * @example
 * ```ts
 * import { Entities } from "@beep/knowledge-domain";
 * import * as DateTime from "effect/DateTime";
 *
 * const cluster = Entities.EntityCluster.Model.insert.make({
 *   id: KnowledgeEntityIds.EntityClusterId.make("knowledge_entity_cluster__uuid"),
 *   organizationId: SharedEntityIds.OrganizationId.make("shared_organization__uuid"),
 *   canonicalEntityId: KnowledgeEntityIds.KnowledgeEntityId.make("knowledge_entity__uuid"),
 *   memberIds: [
 *     KnowledgeEntityIds.KnowledgeEntityId.make("knowledge_entity__uuid1"),
 *     KnowledgeEntityIds.KnowledgeEntityId.make("knowledge_entity__uuid2"),
 *   ],
 *   cohesion: 0.92,
 *   sharedTypes: ["http://schema.org/Person"],
 *   createdAt: DateTime.unsafeNow(),
 *   updatedAt: DateTime.unsafeNow(),
 * });
 * ```
 *
 * @since 0.1.0
 * @category models
 */
export class Model extends M.Class<Model>($I`EntityClusterModel`)(
  makeFields(KnowledgeEntityIds.EntityClusterId, {
    organizationId: SharedEntityIds.OrganizationId,

    /**
     * Canonical entity ID - the selected representative of this cluster
     */
    canonicalEntityId: KnowledgeEntityIds.KnowledgeEntityId.annotations({
      description: "ID of the canonical (representative) entity for this cluster",
    }),

    /**
     * Member entity IDs - all entities in this cluster (including canonical)
     */
    memberIds: S.Array(KnowledgeEntityIds.KnowledgeEntityId).pipe(
      S.minItems(1),
      S.annotations({
        description: "IDs of all member entities in this cluster",
      })
    ),

    /**
     * Internal cluster cohesion score (average pairwise similarity)
     */
    cohesion: S.Number.pipe(
      S.greaterThanOrEqualTo(0),
      S.lessThanOrEqualTo(1),
      S.annotations({
        description: "Average pairwise similarity within the cluster (0-1)",
      })
    ),

    /**
     * Shared type IRIs across all cluster members
     */
    sharedTypes: S.Array(S.String).annotations({
      description: "Ontology type IRIs shared by all cluster members",
    }),

    /**
     * Ontology scoping - which ontology context this cluster belongs to
     */
    ontologyId: BS.FieldOptionOmittable(
      KnowledgeEntityIds.OntologyId.annotations({
        description: "Ontology scope for this cluster (omit for default ontology)",
      })
    ),
  }),
  $I.annotations("EntityClusterModel", {
    description: "Entity resolution cluster grouping same-entity references",
  })
) {
  static readonly utils = modelKit(Model);
}
