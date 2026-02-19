import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("entities/WalletAddress/WalletAddress.model");

export class Model extends M.Class<Model>($I`WalletAddressModel`)(
  makeFields(IamEntityIds.WalletAddressId, {
    userId: SharedEntityIds.UserId.annotations({
      description: "The userId of the user this wallet address belongs to",
    }),
    address: S.NonEmptyString.annotations({
      description: "The blockchain wallet address",
    }),
    chainId: S.Int.annotations({
      description: "The blockchain network chain ID",
    }),
    isPrimary: BS.BoolWithDefault(false).annotations({
      description: "Whether this is the user's primary wallet address",
    }),
  }),
  $I.annotations("WalletAddressModel", {
    title: "Wallet Address Model",
    description: "Wallet address model representing blockchain wallet addresses linked to users.",
  })
) {
  static readonly utils = modelKit(Model);
}
