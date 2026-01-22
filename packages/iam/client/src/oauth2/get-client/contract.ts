/**
 * @fileoverview
 * Get OAuth2 client contract schemas for the IAM client.
 *
 * Defines the payload and success response schemas for retrieving an OAuth2 client by ID.
 * This is an admin endpoint.
 *
 * @module @beep/iam-client/oauth2/get-client/contract
 * @category OAuth2/GetClient
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("oauth2/get-client");

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
 * @category OAuth2/GetClient/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    client_id: S.String,
  },
  formValuesAnnotation({
    client_id: "",
  })
) {}

/**
 * OAuth2 client schema representing a registered OAuth2 application.
 *
 * @category OAuth2/GetClient/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    id: S.String,
    clientId: S.String,
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
 * @category OAuth2/GetClient/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("GetOAuth2Client", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
