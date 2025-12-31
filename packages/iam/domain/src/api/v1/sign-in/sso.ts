/**
 * @fileoverview SSO (Single Sign-On) sign-in endpoint contract.
 *
 * Allows users to authenticate using an SSO provider (SAML/OIDC). This endpoint
 * redirects to the provider's authorization URL for enterprise SSO flows.
 *
 * @category IAM API
 * @subcategory Sign In
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * import { V1 } from "@beep/iam-domain/api";
 *
 * // Sign in with email to auto-detect SSO provider
 * const payload = V1.SignIn.SSO.Payload.make({
 *   email: "user@company.com",
 *   callbackURL: "/dashboard",
 * });
 *
 * // Or sign in with explicit issuer
 * const payloadWithIssuer = V1.SignIn.SSO.Payload.make({
 *   issuer: "https://idp.company.com",
 *   callbackURL: "/dashboard",
 * });
 * ```
 *
 * @see {@link https://www.better-auth.com/docs/plugins/sso | Better Auth SSO Plugin}
 */
import { CommonHeaders, IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/sign-in/sso");

// TODO: Consider making email/issuer/providerId a discriminated union
// since at least one must be provided

/**
 * Request payload for SSO sign-in.
 *
 * At least one of `email`, `issuer`, or `providerId` must be provided to
 * identify the SSO provider.
 *
 * @since 1.0.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    /**
     * The email address to sign in with.
     * Used to identify the issuer. Optional if issuer or providerId is provided.
     */
    email: S.optionalWith(S.Redacted(S.String), { as: "Option", exact: true }).annotations({
      description:
        "The email address to sign in with. This is used to identify the issuer to sign in with. It's optional if the issuer is provided",
    }),
    /**
     * The issuer identifier (URL of the identity provider).
     * Optional if email or providerId is provided.
     */
    issuer: S.optionalWith(BS.URLString, { as: "Option", exact: true }).annotations({
      description:
        "The issuer identifier, this is the URL of the provider and can be used to verify the provider and identify the provider during login. It's optional if the email is provided",
    }),
    /**
     * The ID of the SSO provider.
     * Can be provided instead of email or issuer.
     */
    providerId: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "The ID of the provider to sign in with. This can be provided instead of email or issuer",
    }),
    /** The URL to redirect to after login (required) */
    callbackURL: BS.URLPath.annotations({
      description: "The URL to redirect to after login",
    }),
    /** The URL to redirect to if an error occurs */
    errorCallbackURL: S.optionalWith(BS.URLPath, { as: "Option", exact: true }).annotations({
      description: "The URL to redirect to after login",
    }),
    /** The URL to redirect to if the user is new */
    newUserCallbackURL: S.optionalWith(BS.URLPath, { as: "Option", exact: true }).annotations({
      description: "The URL to redirect to after login if the user is new",
    }),
    /** Login hint to send to the identity provider */
    loginHint: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description:
        "Login hint to send to the identity provider (e.g., email or identifier). If supported, sent as 'login_hint'.",
    }),
  },
  $I.annotations("SignInSSOPayload", {
    description: "Sign in with an SSO provider. At least one of email, issuer, or providerId must be provided.",
  })
) {}

/**
 * Success response for SSO sign-in.
 *
 * Returns the authorization URL to redirect the user to.
 *
 * @since 1.0.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /** The authorization URL to redirect the user to for SSO sign-in */
    url: BS.URLString.annotations({
      description: "The authorization URL to redirect the user to for SSO sign-in",
    }),
    /** Indicates that the client should redirect to the provided URL (always true for SSO) */
    redirect: S.Literal(true).annotations({
      description: "Indicates that the client should redirect to the provided URL",
    }),
  },
  $I.annotations("SignInSSOSuccess", {
    description: "SSO sign-in response with authorization URL.",
  })
) {}

/**
 * SSO sign-in endpoint contract.
 *
 * POST /sign-in/sso
 *
 * Initiates SSO authentication flow. Redirects to the provider's authorization URL.
 *
 * @since 1.0.0
 */
export const Contract = HttpApiEndpoint.post("sso", "/sso")
  .setPayload(Payload)
  .addSuccess(Success)
  .setHeaders(CommonHeaders.CaptchaRequestHeaders)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to sign in with SSO.",
      })
    )
  );
