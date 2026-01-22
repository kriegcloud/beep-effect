import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("entities/Verification/Verification.model");

/**
 * Verification model representing email verification codes and tokens.
 * Maps to the `verification` table in the database.
 */
export class Model extends M.Class<Model>($I`VerificationModel`)(
  makeFields(IamEntityIds.VerificationId, {
    /** Verification identifier (email or phone) */
    identifier: S.NonEmptyString.annotations({
      description: "The identifier being verified (email address, phone number, etc.)",
    }),

    /** Verification value/code */
    value: S.NonEmptyString.annotations({
      description: "The verification code or token",
    }),

    /** When the verification expires */
    expiresAt: BS.FieldOptionOmittable(
      BS.DateTimeUtcFromAllAcceptable.annotations({
        description: "When this verification code expires",
      })
    ),
  }),
  $I.annotations("VerificationModel", {
    title: "Verification Model",
    description: "Verification model representing email verification codes and tokens.",
  })
) {
  static readonly utils = modelKit(Model);
}
