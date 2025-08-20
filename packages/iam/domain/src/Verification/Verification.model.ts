import {Common, IamEntityIds} from "@beep/shared-domain";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

/**
 * Verification model representing email verification codes and tokens.
 * Maps to the `verification` table in the database.
 */
export class Model extends M.Class<Model>(`Verification.Model`)({
  /** Primary key identifier for the verification */
  id: M.Generated(IamEntityIds.VerificationId),

  /** Verification identifier (email or phone) */
  identifier: S.NonEmptyString.annotations({
    description:
      "The identifier being verified (email address, phone number, etc.)",
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
}) {

}
