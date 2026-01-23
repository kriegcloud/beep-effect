/**
 * @fileoverview
 * Link OAuth2 account contract schemas for the IAM client.
 *
 * Defines the payload and success response schemas for linking an OAuth2 provider account.
 *
 * @module @beep/iam-client/oauth2/link/contract
 * @category OAuth2/Link
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("oauth2/link");

/**
 * Payload for linking an OAuth2 provider account.
 *
 * @example
 * ```typescript
 * import { Link } from "@beep/iam-client/oauth2"
 *
 * const payload = Link.Payload.make({
 *   providerId: "my-oauth-provider",
 *   callbackURL: "/settings/accounts"
 * })
 * ```
 *
 * @category OAuth2/Link/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    providerId: S.String, // External OAuth provider ID (e.g., "google", "github") - intentionally S.String
    callbackURL: S.String,
    scopes: S.optional(S.mutable(S.Array(S.String))),
    errorCallbackURL: S.optional(S.String),
  },
  formValuesAnnotation({
    providerId: "",
    callbackURL: "",
    scopes: undefined,
    errorCallbackURL: undefined,
  })
) {}

/**
 * Success response with authorization URL.
 *
 * @category OAuth2/Link/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    url: S.String,
  },
  $I.annotations("Success", {
    description: "Authorization URL for OAuth2 account linking.",
  })
) {}

/**
 * Contract wrapper for link OAuth2 account operations.
 *
 * Note: This operation mutates session state after the OAuth flow completes.
 *
 * @category OAuth2/Link/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("LinkOAuth2Account", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
