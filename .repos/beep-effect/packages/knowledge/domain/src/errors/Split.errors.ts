import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/split");

export class SplitError extends S.TaggedError<SplitError>($I`SplitError`)(
  "SplitError",
  {
    message: S.String,
    entityId: S.optional(KnowledgeEntityIds.KnowledgeEntityId),
    cause: S.optional(S.Defect),
  },
  $I.annotations("SplitError", {
    description: "Entity split or unmerge operation failed",
  })
) {}
