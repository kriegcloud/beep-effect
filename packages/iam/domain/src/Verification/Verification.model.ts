import { Common, IamEntityIds } from "@beep/shared-domain";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

export const VerificationModelSchemaId = Symbol.for("@beep/iam-domain/VerificationModel");

/**
 * Verification model representing email verification codes and tokens.
 * Maps to the `verification` table in the database.
 */
export class Model extends M.Class<Model>(`VerificationModel`)(
  {
    /** Primary key identifier for the verification */
    id: M.Generated(IamEntityIds.VerificationId),

    /** Verification identifier (email or phone) */
    identifier: S.NonEmptyString.annotations({
      description: "The identifier being verified (email address, phone number, etc.)",
    }),

    /** Verification value/code */
    value: S.NonEmptyString.annotations({
      description: "The verification code or token",
    }),

    /** When the verification expires */
    expiresAt: Common.DateTimeFromDate({
      description: "When this verification code expires",
    }),

    // Simple audit columns
    createdAt: Common.DateTimeInsertFromDate(),
    updatedAt: Common.DateTimeUpdateFromDate(),
  },
  {
    title: "Verification Model",
    description: "Verification model representing email verification codes and tokens.",
    schemaId: VerificationModelSchemaId,
  }
) {}
export namespace Model {
  export type Type = S.Schema.Type<typeof Model>;
  export type Encoded = S.Schema.Encoded<typeof Model>;
}
