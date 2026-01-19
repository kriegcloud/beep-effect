/**
 * SameAsLink domain model for Knowledge slice
 *
 * Represents an owl:sameAs provenance link between entities
 * that refer to the same real-world entity.
 *
 * @module knowledge-domain/entities/SameAsLink
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/SameAsLink");

/**
 * SameAsLink model for the knowledge slice.
 *
 * Represents an owl:sameAs link between two entities, indicating that
 * a member entity refers to the same real-world entity as the canonical
 * entity. Provides provenance tracking for entity resolution decisions.
 *
 * @example
 * ```ts
 * import { Entities } from "@beep/knowledge-domain";
 * import * as DateTime from "effect/DateTime";
 *
 * const link = Entities.SameAsLink.Model.insert.make({
 *   id: KnowledgeEntityIds.SameAsLinkId.make("knowledge_same_as_link__uuid"),
 *   organizationId: SharedEntityIds.OrganizationId.make("shared_organization__uuid"),
 *   canonicalId: KnowledgeEntityIds.KnowledgeEntityId.make("knowledge_entity__canonical"),
 *   memberId: KnowledgeEntityIds.KnowledgeEntityId.make("knowledge_entity__member"),
 *   confidence: 0.95,
 *   createdAt: DateTime.unsafeNow(),
 *   updatedAt: DateTime.unsafeNow(),
 * });
 * ```
 *
 * @since 0.1.0
 * @category models
 */
export class Model extends M.Class<Model>($I`SameAsLinkModel`)(
  makeFields(KnowledgeEntityIds.SameAsLinkId, {
    organizationId: SharedEntityIds.OrganizationId,

    /**
     * Canonical entity ID - the authoritative entity in this link
     */
    canonicalId: KnowledgeEntityIds.KnowledgeEntityId.annotations({
      description: "ID of the canonical (authoritative) entity",
    }),

    /**
     * Member entity ID - the entity that is "same as" the canonical
     */
    memberId: KnowledgeEntityIds.KnowledgeEntityId.annotations({
      description: "ID of the member entity that is same-as canonical",
    }),

    /**
     * Confidence score for this sameAs link (0-1)
     */
    confidence: S.Number.pipe(
      S.greaterThanOrEqualTo(0),
      S.lessThanOrEqualTo(1),
      S.annotations({
        description: "Confidence score for this same-as determination (0-1)",
      })
    ),

    /**
     * Source extraction/document ID that produced the member entity
     */
    sourceId: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Source extraction or document ID for provenance",
      })
    ),
  }),
  $I.annotations("SameAsLinkModel", {
    description: "owl:sameAs provenance link between resolved entities",
  })
) {
  static readonly utils = modelKit(Model);
}
