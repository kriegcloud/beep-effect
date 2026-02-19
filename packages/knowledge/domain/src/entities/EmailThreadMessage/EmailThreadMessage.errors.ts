import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/EmailThreadMessage/EmailThreadMessage.errors");

export class EmailThreadMessageNotFoundError extends S.TaggedError<EmailThreadMessageNotFoundError>()(
  $I`EmailThreadMessageNotFoundError`,
  {
    id: KnowledgeEntityIds.EmailThreadMessageId,
  },
  $I.annotationsHttp("EmailThreadMessageNotFoundError", {
    status: 404,
    description: "Error when an email thread message with the specified ID cannot be found.",
  })
) {}

export class EmailThreadMessagePermissionDeniedError extends S.TaggedError<EmailThreadMessagePermissionDeniedError>()(
  $I`EmailThreadMessagePermissionDeniedError`,
  {
    id: KnowledgeEntityIds.EmailThreadMessageId,
  },
  $I.annotationsHttp("EmailThreadMessagePermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the email thread message.",
  })
) {}

export const Errors = S.Union(EmailThreadMessageNotFoundError, EmailThreadMessagePermissionDeniedError);
export type Errors = typeof Errors.Type;
