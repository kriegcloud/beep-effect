/**
 * @fileoverview
 * Delete OAuth2 client contract schemas for the IAM client.
 *
 * Defines the payload and success response schemas for deleting an OAuth2 client.
 * This is an admin endpoint.
 *
 * @module @beep/iam-client/oauth2/delete-client/contract
 * @category OAuth2/DeleteClient
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("oauth2/delete-client");

/**
 * Payload for deleting an OAuth2 client.
 *
 * @example
 * ```typescript
 * import { DeleteClient } from "@beep/iam-client/oauth2"
 *
 * const payload = DeleteClient.Payload.make({
 *   client_id: "my-oauth-client"
 * })
 * ```
 *
 * @category OAuth2/DeleteClient/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    client_id: IamEntityIds.OAuthClientId,
  },
  formValuesAnnotation({
    client_id: "",
  })
) {}

/**
 * Success response confirming deletion.
 *
 * @category OAuth2/DeleteClient/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    success: S.Boolean,
  },
  $I.annotations("Success", {
    description: "Status response confirming OAuth2 client deletion.",
  })
) {}

/**
 * Contract wrapper for delete OAuth2 client operations.
 *
 * @category OAuth2/DeleteClient/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("DeleteOAuth2Client", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
