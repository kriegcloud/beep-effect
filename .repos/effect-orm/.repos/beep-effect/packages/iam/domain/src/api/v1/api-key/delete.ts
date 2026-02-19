/**
 * @module delete
 *
 * Domain contract for deleting an API key.
 *
 * @category API/V1/ApiKey
 * @since 1.0.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/api-key/delete");

/**
 * Payload for deleting an API key.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    keyId: S.String.annotations({
      description: "ID of the API key to delete.",
    }),
  },
  $I.annotations("ApiKeyDeletePayload", {
    description: "Payload for deleting an API key.",
  })
) {}

/**
 * Success response after deleting an API key.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    success: S.Boolean.annotations({
      description: "Whether the deletion was successful.",
    }),
  },
  $I.annotations("ApiKeyDeleteSuccess", {
    description: "Success response after deleting an API key.",
  })
) {}

/**
 * Delete API key endpoint contract.
 *
 * POST /api-key/delete
 *
 * Deletes an existing API key.
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("delete", "/delete")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to delete API key.",
      })
    )
  )
  .addSuccess(Success);
