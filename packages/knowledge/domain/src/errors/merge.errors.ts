import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/merge");

export class MergeError extends S.TaggedError<MergeError>($I`MergeError`)(
  "MergeError",
  {
    message: S.String,
    sourceEntityId: S.optional(KnowledgeEntityIds.KnowledgeEntityId),
    targetEntityId: S.optional(KnowledgeEntityIds.KnowledgeEntityId),
  },
  $I.annotations("MergeError", {
    description: "Entity merge operation failed",
  })
) {}
