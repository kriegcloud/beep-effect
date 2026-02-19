import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/Entity/Entity.errors");

export class KnowledgeEntityNotFoundError extends S.TaggedError<KnowledgeEntityNotFoundError>()(
  $I`KnowledgeEntityNotFoundError`,
  {
    id: KnowledgeEntityIds.KnowledgeEntityId,
  },
  $I.annotationsHttp("KnowledgeEntityNotFoundError", {
    status: 404,
    description: "Error when a knowledge entity with the specified ID cannot be found.",
  })
) {}

export class KnowledgeEntityPermissionDeniedError extends S.TaggedError<KnowledgeEntityPermissionDeniedError>()(
  $I`KnowledgeEntityPermissionDeniedError`,
  {
    id: KnowledgeEntityIds.KnowledgeEntityId,
  },
  $I.annotationsHttp("KnowledgeEntityPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the knowledge entity.",
  })
) {}

export const Errors = S.Union(KnowledgeEntityNotFoundError, KnowledgeEntityPermissionDeniedError);
export type Errors = typeof Errors.Type;
