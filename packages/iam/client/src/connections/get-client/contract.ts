/**
 * @fileoverview
 * Get OAuth2 client contract schemas for the IAM client.
 *
 * Defines the payload and success response schemas for retrieving an OAuth2 client by ID.
 * This is an admin endpoint.
 *
 * @module @beep/iam-client/connections/get-client/contract
 * @category Connections/GetClient
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds } from "@beep/shared-domain";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("connections/get-client");

/**
 * Payload for getting an OAuth2 client.
 *
 * @example
 * ```typescript
 * import { GetClient } from "@beep/iam-client/oauth2"
 *
 * const payload = GetClient.Payload.make({
 *   client_id: "my-oauth-client"
 * })
 * ```
 *
 * @category Connections/GetClient/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    client_id: IamEntityIds.OAuthClientId,
  },
  $I.annotations("Payload", {
    description: "Payload schema for this operation.",
  })
) {}

/**
 * OAuth2 client schema representing a registered OAuth2 application.
 *
 * @category Connections/GetClient/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    id: IamEntityIds.OAuthClientId,
    clientId: IamEntityIds.OAuthClientId,
    name: S.String,
    icon: S.NullOr(S.String),
    metadata: S.NullOr(S.Record({ key: S.String, value: S.Unknown })),
    redirectURLs: S.Array(S.String),
    disabled: S.Boolean,
    type: S.Literal("public", "confidential"),
    createdAt: BS.DateFromAllAcceptable,
  },
  $I.annotations("Success", {
    description: "OAuth2 client details.",
  })
) {}

/**
 * Contract wrapper for get OAuth2 client operations.
 *
 * @example
 * ```typescript
 * import { GetClient } from "@beep/iam-client/oauth2"
 *
 * const handler = GetClient.Wrapper.implement((payload) => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category Connections/GetClient/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("GetOAuth2Client", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
