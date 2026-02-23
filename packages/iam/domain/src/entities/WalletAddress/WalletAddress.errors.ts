import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("entities/WalletAddress/WalletAddress.errors");

export class WalletAddressNotFoundError extends S.TaggedError<WalletAddressNotFoundError>()(
  $I`WalletAddressNotFoundError`,
  { id: IamEntityIds.WalletAddressId },
  $I.annotationsHttp("WalletAddressNotFoundError", {
    status: 404,
    description: "Error when a wallet address with the specified ID cannot be found.",
  })
) {}

export class WalletAddressPermissionDeniedError extends S.TaggedError<WalletAddressPermissionDeniedError>()(
  $I`WalletAddressPermissionDeniedError`,
  { id: IamEntityIds.WalletAddressId },
  $I.annotationsHttp("WalletAddressPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the wallet address.",
  })
) {}

export const Errors = S.Union(WalletAddressNotFoundError, WalletAddressPermissionDeniedError);
export type Errors = typeof Errors.Type;
