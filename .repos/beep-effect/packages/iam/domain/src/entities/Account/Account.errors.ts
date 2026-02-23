import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("entities/Account/Account.errors");

export class AccountNotFoundError extends S.TaggedError<AccountNotFoundError>()(
  $I`AccountNotFoundError`,
  {
    id: IamEntityIds.AccountId,
  },
  $I.annotationsHttp("AccountNotFoundError", {
    status: 404,
    description: "Error when an account with the specified ID cannot be found.",
  })
) {}

export class AccountPermissionDeniedError extends S.TaggedError<AccountPermissionDeniedError>()(
  $I`AccountPermissionDeniedError`,
  {
    id: IamEntityIds.AccountId,
  },
  $I.annotationsHttp("AccountPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the account.",
  })
) {}

export const Errors = S.Union(AccountNotFoundError, AccountPermissionDeniedError);
export type Errors = typeof Errors.Type;
