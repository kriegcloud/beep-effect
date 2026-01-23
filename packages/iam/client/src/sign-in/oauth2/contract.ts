/**
 * @fileoverview
 * OAuth2 sign-in contract schemas for the IAM client.
 *
 * Defines the payload and success response schemas for OAuth2 provider sign-in.
 *
 * @module @beep/iam-client/sign-in/oauth2/contract
 * @category SignIn/OAuth2
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("sign-in/oauth2");

/**
 * Payload for OAuth2 provider sign-in.
 *
 * @example
 * ```typescript
 * import { OAuth2 } from "@beep/iam-client/sign-in"
 *
 * const payload = OAuth2.Payload.make({
 *   providerId: "custom-oauth-provider",
 *   callbackURL: "/dashboard"
 * })
 * ```
 *
 * @category SignIn/OAuth2/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    providerId: S.NonEmptyTrimmedString, // External OAuth provider ID (e.g., "google", "github") - intentionally S.String
    callbackURL: S.optional(BS.URLString),
    errorCallbackURL: S.optional(S.String),
    newUserCallbackURL: S.optional(S.String),
    disableRedirect: S.optional(S.Boolean),
    scopes: S.optional(S.mutable(S.Array(S.String))),
    requestSignUp: S.optional(S.Boolean),
    additionalData: S.optional(S.Record({ key: S.String, value: S.Unknown })),
  },
  formValuesAnnotation({
    providerId: "",
    callbackURL: undefined,
    errorCallbackURL: undefined,
    newUserCallbackURL: undefined,
    disableRedirect: undefined,
    scopes: undefined,
    requestSignUp: undefined,
    additionalData: undefined,
  })
) {}

/**
 * Success response with authorization URL.
 *
 * Note: When disableRedirect is false (default), the browser redirects.
 * When disableRedirect is true, this response contains the URL.
 *
 * @category SignIn/OAuth2/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    url: S.optional(S.String),
    redirect: S.optional(S.Boolean),
  },
  $I.annotations("Success", {
    description: "OAuth2 sign-in response with optional redirect URL.",
  })
) {}

/**
 * Contract wrapper for OAuth2 sign-in operations.
 *
 * Note: This operation mutates session state after the OAuth flow completes.
 *
 * @category SignIn/OAuth2/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("SignInOAuth2", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
