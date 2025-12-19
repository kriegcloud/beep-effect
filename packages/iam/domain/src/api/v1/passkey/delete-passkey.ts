import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/passkey/delete-passkey");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: S.String.annotations({ description: "The passkey ID to delete" }),
  },
  $I.annotations("DeletePasskeyPayload", {
    description: "Payload for deleting a passkey credential.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    status: S.Boolean.annotations({ description: "Deletion status" }),
  },
  $I.annotations("DeletePasskeySuccess", {
    description: "Successful passkey deletion response.",
  })
) {}

export const Contract = HttpApiEndpoint.post("delete-passkey", "/delete-passkey")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to delete the passkey.",
      })
    )
  )
  .addSuccess(Success);
