import { Common, IamEntityIds } from "@beep/shared-domain";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

/**
 * TwoFactor model representing two-factor authentication settings.
 * Maps to the `twoFactor` table in the database.
 */
export class Model extends M.Class<Model>(`TwoFactor.Model`)({
  /** Primary key identifier for the 2FA record */
  id: M.Generated(IamEntityIds.TwoFactorId),

  /** Encrypted secret key for TOTP */
  secret: M.Sensitive(
    S.NonEmptyString.annotations({
      description: "Encrypted secret key for TOTP generation",
    })
  ),

  /** Encrypted backup codes */
  backupCodes: M.Sensitive(
    S.String.annotations({
      description: "Encrypted backup codes for account recovery",
    })
  ),

  /** User this 2FA setup belongs to */
  userId: IamEntityIds.UserId.annotations({
    description: "ID of the user this 2FA setup belongs to",
  }),

  // Simple audit columns
  createdAt: Common.DateTimeInsertFromDate(),
  updatedAt: Common.DateTimeUpdateFromDate(),
}) {}
