/**
 * @fileoverview
 * Social sign-in contract schemas for the IAM client.
 *
 * Defines the payload and success response schemas for social provider sign-in.
 *
 * @module @beep/iam-client/sign-in/social/contract
 * @category SignIn/Social
 * @since 0.1.0
 */

import { AuthProviderNameValue } from "@beep/constants";
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("sign-in/social");

/**
 * Payload for social provider sign-in.
 *
 * @example
 * ```typescript
 * import { Social } from "@beep/iam-client/sign-in"
 *
 * const payload = Social.Payload.make({
 *   provider: "google",
 *   callbackURL: "/dashboard"
 * })
 * ```
 *
 * @category SignIn/Social/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    provider: AuthProviderNameValue,
    callbackURL: S.optional(BS.URLString),
    errorCallbackURL: S.optional(BS.URLString),
    newUserCallbackURL: S.optional(BS.URLString),
    disableRedirect: S.optional(S.Boolean),
  },
  formValuesAnnotation({
    provider: "",
    callbackURL: undefined,
    errorCallbackURL: undefined,
    newUserCallbackURL: undefined,
    disableRedirect: undefined,
  })
) {}

/**
 * Success response with authorization URL.
 *
 * Note: When disableRedirect is false (default), the browser redirects.
 * When disableRedirect is true, this response contains the URL.
 *
 * @category SignIn/Social/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    url: S.optional(S.String),
    redirect: S.optional(S.Boolean),
  },
  $I.annotations("Success", {
    description: "Social sign-in response with optional redirect URL.",
  })
) {}

/**
 * Contract wrapper for social sign-in operations.
 *
 * Note: This operation mutates session state after the OAuth flow completes.
 *
 * @category SignIn/Social/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("SignInSocial", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
