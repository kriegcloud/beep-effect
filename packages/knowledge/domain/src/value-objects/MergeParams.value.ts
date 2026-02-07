import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";
import { MergeReason } from "../entities/MergeHistory/MergeHistory.model";

const $I = $KnowledgeDomainId.create("value-objects/MergeParams");

export class MergeParams extends S.Class<MergeParams>($I`MergeParams`)(
  {
    sourceEntityId: KnowledgeEntityIds.KnowledgeEntityId,
    targetEntityId: KnowledgeEntityIds.KnowledgeEntityId,
    mergeReason: MergeReason,
    confidence: S.Number.pipe(S.between(0, 1)),
    mergedBy: S.optional(SharedEntityIds.UserId),
  },
  $I.annotations("MergeParams", {
    description: "Parameters for recording an entity merge",
  })
) {}
