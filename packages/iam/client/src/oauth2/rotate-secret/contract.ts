/**
 * @fileoverview
 * Rotate OAuth2 client secret contract schemas for the IAM client.
 *
 * Defines the payload and success response schemas for rotating an OAuth2 client secret.
 * This is an admin endpoint.
 *
 * @module @beep/iam-client/oauth2/rotate-secret/contract
 * @category OAuth2/RotateSecret
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("oauth2/rotate-secret");

/**
 * Payload for rotating an OAuth2 client secret.
 *
 * @example
 * ```typescript
 * import { RotateSecret } from "@beep/iam-client/oauth2"
 *
 * const payload = RotateSecret.Payload.make({
 *   client_id: "my-oauth-client"
 * })
 * ```
 *
 * @category OAuth2/RotateSecret/Schemas
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
 * Success response with new client secret.
 *
 * Note: The client secret is sensitive and only shown once.
 *
 * @category OAuth2/RotateSecret/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    clientId: IamEntityIds.OAuthClientId,
    clientSecret: S.Redacted(S.String),
  },
  $I.annotations("Success", {
    description: "New OAuth2 client credentials with rotated secret.",
  })
) {}

/**
 * Contract wrapper for rotate OAuth2 client secret operations.
 *
 * @category OAuth2/RotateSecret/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("RotateOAuth2ClientSecret", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
