/**
 * @fileoverview
 * Get public OAuth2 client info contract schemas for the IAM client.
 *
 * Defines the payload and success response schemas for retrieving public info
 * about an OAuth2 client. This is a public endpoint (no auth required).
 *
 * @module @beep/iam-client/oauth2/public-client/contract
 * @category OAuth2/PublicClient
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("oauth2/public-client");

/**
 * Payload for getting public OAuth2 client info.
 *
 * @example
 * ```typescript
 * import { PublicClient } from "@beep/iam-client/oauth2"
 *
 * const payload = PublicClient.Payload.make({
 *   client_id: "my-oauth-client"
 * })
 * ```
 *
 * @category OAuth2/PublicClient/Schemas
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
 * Public OAuth2 client info (limited fields).
 *
 * @category OAuth2/PublicClient/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    id: IamEntityIds.OAuthClientId,
    clientId: IamEntityIds.OAuthClientId,
    name: S.String,
    icon: S.NullOr(S.String),
  },
  $I.annotations("Success", {
    description: "Public OAuth2 client information.",
  })
) {}

/**
 * Contract wrapper for get public OAuth2 client operations.
 *
 * @category OAuth2/PublicClient/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("GetPublicOAuth2Client", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
