import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("entities/Verification/Verification.model");

export class Model extends M.Class<Model>($I`VerificationModel`)(
  makeFields(IamEntityIds.VerificationId, {
    identifier: S.NonEmptyString.annotations({
      description: "The identifier being verified (email address, phone number, etc.)",
    }),
    value: S.NonEmptyString.annotations({
      description: "The verification code or token",
    }),
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
