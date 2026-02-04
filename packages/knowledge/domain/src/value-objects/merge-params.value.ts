/**
 * MergeParams value object for Knowledge slice
 *
 * Parameters for recording an entity merge operation.
 *
 * @module knowledge-domain/value-objects/merge-params
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";
import { MergeReason } from "../entities/merge-history/merge-history.model";

const $I = $KnowledgeDomainId.create("value-objects/MergeParams");

/**
 * MergeParams - Parameters for recording an entity merge
 *
 * Contains all necessary information to record a merge decision
 * in the MergeHistory audit trail.
 *
 * @since 0.1.0
 * @category value-objects
 */
export class MergeParams extends S.Class<MergeParams>($I`MergeParams`)(
  {
    organizationId: SharedEntityIds.OrganizationId,
    sourceEntityId: KnowledgeEntityIds.KnowledgeEntityId.annotations({
      description: "ID of the entity being merged into another",
    }),
    targetEntityId: KnowledgeEntityIds.KnowledgeEntityId.annotations({
      description: "ID of the canonical entity (merge target)",
    }),
    mergeReason: MergeReason.annotations({
      description: "Reason for the merge decision",
    }),
    confidence: S.Number.pipe(S.between(0, 1)).annotations({
      description: "Confidence score for the merge decision",
    }),
    mergedBy: BS.FieldOptionOmittable(
      SharedEntityIds.UserId.annotations({
        description: "User ID who approved the merge (undefined for automatic)",
      })
    ),
  },
  $I.annotations("MergeParams", {
    description: "Parameters for recording an entity merge",
  })
) {}
