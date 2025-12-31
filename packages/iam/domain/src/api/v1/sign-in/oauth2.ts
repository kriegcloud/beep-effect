/**
 * @fileoverview OAuth2 sign-in endpoint contract.
 *
 * Allows users to authenticate using a generic OAuth2 provider. This is used
 * for custom OAuth2 providers that are not covered by the built-in social
 * providers.
 *
 * @category IAM API
 * @subcategory Sign In
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * import { V1 } from "@beep/iam-domain/api";
 *
 * const payload = V1.SignIn.OAuth2.Payload.make({
 *   providerId: "custom-oauth",
 *   callbackURL: "/dashboard",
 * });
 * ```
 *
 * @see {@link https://www.better-auth.com/docs/concepts/oauth2 | Better Auth OAuth2}
 */
import { CommonFields, CommonHeaders, IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/sign-in/oauth2");

// TODO: Consider reusing social.ts patterns for shared OAuth fields

/**
 * Request payload for OAuth2 sign-in.
 *
 * @since 1.0.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    /** The provider ID for the OAuth provider */
    providerId: S.String.annotations({
      description: "The provider ID for the OAuth provider",
    }),
    /** The URL to redirect to after sign in */
    callbackURL: CommonFields.CallbackURL,
    /** The URL to redirect to if an error occurs */
    errorCallbackURL: S.optionalWith(BS.URLPath, { as: "Option", exact: true }).annotations({
      description: "The URL to redirect to if an error occurs",
    }),
    /** The URL to redirect to after login if the user is new */
    newUserCallbackURL: S.optionalWith(BS.URLString, { as: "Option", exact: true }).annotations({
      description: 'The URL to redirect to after login if the user is new. Eg: "/welcome"',
    }),
    /** Disable automatic redirection */
    disableRedirect: BS.BoolWithDefault(false).annotations({
      description: "Disable redirect",
    }),
    /** Scopes to request from the provider */
    scopes: S.optionalWith(S.mutable(S.Array(S.String)), { as: "Option", exact: true }).annotations({
      description: "Scopes to be passed to the provider authorization request.",
    }),
    /** Request sign-up explicitly */
    requestSignUp: S.optionalWith(S.Boolean, { as: "Option", exact: true }).annotations({
      description: "Explicitly request sign-up. Useful when disableImplicitSignUp is true for this provider. Eg: false",
    }),
    /** Additional data to pass to the provider */
    additionalData: S.optionalWith(S.Record({ key: S.String, value: S.Unknown }), {
      as: "Option",
      exact: true,
    }).annotations({
      description: "Additional data to pass to the OAuth provider",
    }),
  },
  $I.annotations("SignInOAuth2Payload", {
    description: "Sign in with OAuth2 provider.",
  })
) {}

/**
 * Success response for OAuth2 sign-in.
 *
 * @since 1.0.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /** The authorization URL to redirect to (if redirect is enabled) */
    url: CommonFields.RedirectURL,
    /** Whether the client should redirect */
    redirect: CommonFields.Redirect,
  },
  $I.annotations("SignInOAuth2Success", {
    description: "OAuth2 sign-in response with redirect URL.",
  })
) {}

/**
 * OAuth2 sign-in endpoint contract.
 *
 * POST /sign-in/oauth2
 *
 * Initiates OAuth2 authentication flow with a custom provider.
 *
 * @since 1.0.0
 */
export const Contract = HttpApiEndpoint.post("oauth2", "/oauth2")
  .setPayload(Payload)
  .addSuccess(Success)
  .setHeaders(CommonHeaders.CaptchaRequestHeaders)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to sign in with OAuth2.",
      })
    )
  );
