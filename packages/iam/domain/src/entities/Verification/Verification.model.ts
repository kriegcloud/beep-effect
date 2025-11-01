import { BS } from "@beep/schema";
import { IamEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

export const VerificationModelSchemaId = Symbol.for("@beep/iam-domain/VerificationModel");

/**
 * Verification model representing email verification codes and tokens.
 * Maps to the `verification` table in the database.
 */
export class Model extends M.Class<Model>(`VerificationModel`)(
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
      BS.DateTimeFromDate({
        description: "When this verification code expires",
      })
    ),
  }),
  {
    title: "Verification Model",
    description: "Verification model representing email verification codes and tokens.",
    schemaId: VerificationModelSchemaId,
  }
) {
  static readonly utils = modelKit(Model);
}
