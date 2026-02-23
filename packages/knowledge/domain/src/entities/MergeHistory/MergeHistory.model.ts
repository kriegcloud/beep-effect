import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/MergeHistory");

export class MergeReason extends BS.StringLiteralKit(
  "embedding_similarity",
  "manual_override",
  "text_exact_match"
).annotations(
  $I.annotations("MergeReason", {
    description: "Reason for an entity merge decision (automatic similarity, manual override, exact text match).",
  })
) {}

export declare namespace MergeReason {
  export type Type = typeof MergeReason.Type;
  export type Encoded = typeof MergeReason.Encoded;
}

export class Model extends M.Class<Model>($I`MergeHistoryModel`)(
  makeFields(KnowledgeEntityIds.MergeHistoryId, {
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
        description: "User ID who approved the merge (null for automatic)",
      })
    ),

    mergedAt: BS.DateTimeUtcFromAllAcceptable.annotations({
      description: "Timestamp when the merge was executed",
    }),
  }),
  $I.annotations("MergeHistoryModel", {
    description: "Audit record of entity merge decisions for provenance tracking.",
  })
) {
  static readonly utils = modelKit(Model);

  get isManualMerge(): boolean {
    return this.mergedBy !== undefined;
  }

  get isAutomaticMerge(): boolean {
    return this.mergedBy === undefined;
  }
}
