import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

export const TwoFactorModelSchemaId = Symbol.for("@beep/iam-domain/TwoFactorModel");

/**
 * TwoFactor model representing two-factor authentication settings.
 * Maps to the `twoFactor` table in the database.
 */
export class Model extends M.Class<Model>(`TwoFactorModel`)(
  makeFields(IamEntityIds.TwoFactorId, {
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
    userId: SharedEntityIds.UserId.annotations({
      description: "ID of the user this 2FA setup belongs to",
    }),
  }),
  {
    title: "TwoFactor Model",
    description: "TwoFactor model representing two-factor authentication settings.",
    schemaId: TwoFactorModelSchemaId,
  }
) {
  static readonly utils = modelKit(Model);
}
