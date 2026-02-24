import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("entities/Member/Member.errors");

export class MemberNotFoundError extends S.TaggedError<MemberNotFoundError>()(
  $I`MemberNotFoundError`,
  {
    id: IamEntityIds.MemberId,
  },
  $I.annotationsHttp("MemberNotFoundError", {
    status: 404,
    description: "Error when a member with the specified ID cannot be found.",
  })
) {}

export class MemberPermissionDeniedError extends S.TaggedError<MemberPermissionDeniedError>()(
  $I`MemberPermissionDeniedError`,
  {
    id: IamEntityIds.MemberId,
  },
  $I.annotationsHttp("MemberPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the member.",
  })
) {}

export const Errors = S.Union(MemberNotFoundError, MemberPermissionDeniedError);
export type Errors = typeof Errors.Type;
