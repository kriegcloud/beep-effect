import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/Mention/Mention.errors");

export class MentionNotFoundError extends S.TaggedError<MentionNotFoundError>()(
  $I`MentionNotFoundError`,
  {
    id: KnowledgeEntityIds.MentionId,
  },
  $I.annotationsHttp("MentionNotFoundError", {
    status: 404,
    description: "Error when a mention with the specified ID cannot be found.",
  })
) {}

export class MentionPermissionDeniedError extends S.TaggedError<MentionPermissionDeniedError>()(
  $I`MentionPermissionDeniedError`,
  {
    id: KnowledgeEntityIds.MentionId,
  },
  $I.annotationsHttp("MentionPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the mention.",
  })
) {}

export const Errors = S.Union(MentionNotFoundError, MentionPermissionDeniedError);
export type Errors = typeof Errors.Type;
