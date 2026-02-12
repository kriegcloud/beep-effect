import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/Relation/Relation.errors");

export class RelationNotFoundError extends S.TaggedError<RelationNotFoundError>()(
  $I`RelationNotFoundError`,
  {
    id: KnowledgeEntityIds.RelationId,
  },
  $I.annotationsHttp("RelationNotFoundError", {
    status: 404,
    description: "Error when a relation with the specified ID cannot be found.",
  })
) {}

export class RelationPermissionDeniedError extends S.TaggedError<RelationPermissionDeniedError>()(
  $I`RelationPermissionDeniedError`,
  {
    id: KnowledgeEntityIds.RelationId,
  },
  $I.annotationsHttp("RelationPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the relation.",
  })
) {}

export const Errors = S.Union(RelationNotFoundError, RelationPermissionDeniedError);
export type Errors = typeof Errors.Type;
