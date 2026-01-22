/**
 * @fileoverview
 * SSO sign-in contract schemas for the IAM client.
 *
 * Defines the payload and success response schemas for SSO authentication.
 *
 * @module @beep/iam-client/sign-in/sso/contract
 * @category SignIn/SSO
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("sign-in/sso");

/**
 * Payload for SSO sign-in.
 *
 * @example
 * ```typescript
 * import { Sso } from "@beep/iam-client/sign-in"
 *
 * // Sign in via email domain lookup
 * const payload1 = Sso.Payload.make({
 *   email: "user@acme.com",
 *   callbackURL: "/dashboard"
 * })
 *
 * // Sign in via specific provider
 * const payload2 = Sso.Payload.make({
 *   providerId: "acme-corp",
 *   callbackURL: "/dashboard"
 * })
 * ```
 *
 * @category SignIn/SSO/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    email: S.optional(S.String),
    organizationSlug: S.optional(S.String),
    providerId: S.optional(S.String),
    domain: S.optional(S.String),
    callbackURL: S.String,
    errorCallbackURL: S.optional(S.String),
    newUserCallbackURL: S.optional(S.String),
    scopes: S.optional(S.mutable(S.Array(S.String))),
    loginHint: S.optional(S.String),
    requestSignUp: S.optional(S.Boolean),
  },
  formValuesAnnotation({
    callbackURL: "",
  })
) {}

/**
 * Success response containing the SSO redirect URL.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { Sso } from "@beep/iam-client/sign-in"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* Sso.Handler({
 *     email: "user@acme.com",
 *     callbackURL: "/dashboard"
 *   })
 *   // Redirect user to SSO provider
 *   window.location.href = result.url
 * })
 * ```
 *
 * @category SignIn/SSO/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    url: S.String,
  },
  $I.annotations("Success", {
    description: "Success response containing the SSO redirect URL.",
  })
) {}

/**
 * Contract wrapper for SSO sign-in operations.
 *
 * @example
 * ```typescript
 * import { Sso } from "@beep/iam-client/sign-in"
 *
 * const handler = Sso.Wrapper.implement((payload) => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category SignIn/SSO/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("SignInSso", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
