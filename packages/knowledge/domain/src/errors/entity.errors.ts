import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/entity.errors");

export class EntityNotFoundError extends S.TaggedError<EntityNotFoundError>($I`EntityNotFoundError`)(
  "EntityNotFoundError",
  {
    id: KnowledgeEntityIds.KnowledgeEntityId,
    message: S.String,
  },
  $I.annotations("EntityNotFoundError", {
    description: "Requested knowledge entity not found",
  })
) {}
