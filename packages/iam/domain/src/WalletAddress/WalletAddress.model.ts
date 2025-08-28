import { Common, IamEntityIds } from "@beep/shared-domain";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

/**
 * Wallet address model representing blockchain wallet addresses linked to users.
 * Maps to the `verification` table in the database (note: table name appears to be misnamed).
 */
export class Model extends M.Class<Model>(`WalletAddress.Model`)({
  /** Primary key identifier for the wallet address */
  id: M.Generated(IamEntityIds.WalletAddressId),

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
}) {}
