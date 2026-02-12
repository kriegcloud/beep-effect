import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/SameAsLink/SameAsLink.errors");

export class SameAsLinkNotFoundError extends S.TaggedError<SameAsLinkNotFoundError>()(
  $I`SameAsLinkNotFoundError`,
  {
    id: KnowledgeEntityIds.SameAsLinkId,
  },
  $I.annotationsHttp("SameAsLinkNotFoundError", {
    status: 404,
    description: "Error when a same-as link with the specified ID cannot be found.",
  })
) {}

export class SameAsLinkPermissionDeniedError extends S.TaggedError<SameAsLinkPermissionDeniedError>()(
  $I`SameAsLinkPermissionDeniedError`,
  {
    id: KnowledgeEntityIds.SameAsLinkId,
  },
  $I.annotationsHttp("SameAsLinkPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the same-as link.",
  })
) {}

export const Errors = S.Union(SameAsLinkNotFoundError, SameAsLinkPermissionDeniedError);
export type Errors = typeof Errors.Type;
