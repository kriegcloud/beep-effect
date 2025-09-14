import { Common, IamEntityIds } from "@beep/shared-domain";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

export const WalletAddressModelSchemaId = Symbol.for("@beep/iam-domain/WalletAddressModel");
/**
 * Wallet address model representing blockchain wallet addresses linked to users.
 * Maps to the `verification` table in the database (note: table name appears to be misnamed).
 */
export class Model extends M.Class<Model>(`WalletAddressModel`)(
  {
    /** Primary key identifier for the wallet address */
    id: M.Generated(IamEntityIds.WalletAddressId),
    _rowId: M.Generated(IamEntityIds.WalletAddressId.privateSchema),
    /** Reference to the user this wallet address belongs to */
    userId: IamEntityIds.UserId.annotations({
      description: "The userId of the user this wallet address belongs to",
    }),

    /** The blockchain wallet address */
    address: M.Generated(
      S.NonEmptyString.annotations({
        description: "The blockchain wallet address",
      })
    ),

    /** The blockchain network chain ID */
    chainId: S.Int.annotations({
      description: "The blockchain network chain ID",
    }),

    /** Whether this is the user's primary wallet address */
    isPrimary: M.FieldOption(
      S.Boolean.annotations({
        description: "Whether this is the user's primary wallet address",
      })
    ),

    // Audit and tracking columns
    ...Common.globalColumns,
  },
  {
    schemaId: WalletAddressModelSchemaId,
    title: "Wallet Address Model",
    description: "Wallet address model representing blockchain wallet addresses linked to users.",
  }
) {}

export namespace Model {
  export type Type = S.Schema.Type<typeof Model>;
  export type Encoded = S.Schema.Encoded<typeof Model>;
}
