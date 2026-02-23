import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/EmailThread/EmailThread.errors");

export class EmailThreadNotFoundError extends S.TaggedError<EmailThreadNotFoundError>()(
  $I`EmailThreadNotFoundError`,
  {
    id: KnowledgeEntityIds.EmailThreadId,
  },
  $I.annotationsHttp("EmailThreadNotFoundError", {
    status: 404,
    description: "Error when an email thread with the specified ID cannot be found.",
  })
) {}

export class EmailThreadPermissionDeniedError extends S.TaggedError<EmailThreadPermissionDeniedError>()(
  $I`EmailThreadPermissionDeniedError`,
  {
    id: KnowledgeEntityIds.EmailThreadId,
  },
  $I.annotationsHttp("EmailThreadPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the email thread.",
  })
) {}

export const Errors = S.Union(EmailThreadNotFoundError, EmailThreadPermissionDeniedError);
export type Errors = typeof Errors.Type;
