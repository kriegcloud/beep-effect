import { $CommsDomainId } from "@beep/identity/packages";
import { CommsEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("entities/EmailTemplate/EmailTemplate.errors");

export class EmailTemplateNotFoundError extends S.TaggedError<EmailTemplateNotFoundError>()(
  $I`EmailTemplateNotFoundError`,
  { id: CommsEntityIds.EmailTemplateId },
  $I.annotationsHttp("EmailTemplateNotFoundError", {
    status: 404,
    description: "Error when an email template with the specified ID cannot be found.",
  })
) {}

export class EmailTemplatePermissionDeniedError extends S.TaggedError<EmailTemplatePermissionDeniedError>()(
  $I`EmailTemplatePermissionDeniedError`,
  { id: CommsEntityIds.EmailTemplateId },
  $I.annotationsHttp("EmailTemplatePermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the email template.",
  })
) {}

export const Errors = S.Union(EmailTemplateNotFoundError, EmailTemplatePermissionDeniedError);
export type Errors = typeof Errors.Type;
