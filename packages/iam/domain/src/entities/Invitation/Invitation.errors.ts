import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("entities/Invitation/Invitation.errors");

export class InvitationNotFoundError extends S.TaggedError<InvitationNotFoundError>()(
  $I`InvitationNotFoundError`,
  {
    id: IamEntityIds.InvitationId,
  },
  $I.annotationsHttp("InvitationNotFoundError", {
    status: 404,
    description: "Error when an invitation with the specified ID cannot be found.",
  })
) {}

export class InvitationPermissionDeniedError extends S.TaggedError<InvitationPermissionDeniedError>()(
  $I`InvitationPermissionDeniedError`,
  {
    id: IamEntityIds.InvitationId,
  },
  $I.annotationsHttp("InvitationPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the invitation.",
  })
) {}

export const Errors = S.Union(InvitationNotFoundError, InvitationPermissionDeniedError);
export type Errors = typeof Errors.Type;
