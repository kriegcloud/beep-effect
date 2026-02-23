import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/relation.errors");

export class RelationNotFoundError extends S.TaggedError<RelationNotFoundError>($I`RelationNotFoundError`)(
  "RelationNotFoundError",
  {
    id: KnowledgeEntityIds.RelationId,
    message: S.String,
  },
  $I.annotations("RelationNotFoundError", {
    description: "Requested knowledge relation not found",
  })
) {}
