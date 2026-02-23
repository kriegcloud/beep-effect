/**
 * @fileoverview SSO callback endpoint contract.
 *
 * Handles OIDC callback from SSO providers. This endpoint is auto-handled by
 * Better Auth's sso() plugin and processes the authorization code exchange.
 *
 * @category IAM API
 * @subcategory SSO
 * @since 1.0.0
 *
 * @see {@link https://www.better-auth.com/docs/plugins/sso | Better Auth SSO Plugin}
 */
import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/sso/callback");

/**
 * Path parameters for SSO callback.
 *
 * @since 1.0.0
 */
export class PathParams extends S.Class<PathParams>($I`PathParams`)(
  {
    /** The SSO provider ID */
    providerId: S.String.annotations({
      description: "The SSO provider ID",
    }),
  },
  $I.annotations("SSOCallbackPathParams", {
    description: "Path parameters for SSO callback endpoint.",
  })
) {}

/**
 * URL parameters for SSO callback.
 *
 * These are the standard OIDC callback parameters.
 * Note: UrlParams must be string-encodeable, so we use S.optional instead of S.optionalWith.
 *
 * @since 1.0.0
 */
export class UrlParams extends S.Class<UrlParams>($I`UrlParams`)(
  {
    /** Authorization code from the SSO provider */
    code: S.optional(S.String).annotations({
      description: "Authorization code from the SSO provider",
    }),
    /** State parameter for CSRF protection */
    state: S.optional(S.String).annotations({
      description: "State parameter for CSRF protection",
    }),
    /** Error code if authorization failed */
    error: S.optional(S.String).annotations({
      description: "Error code if authorization failed",
    }),
    /** Human-readable error description */
    error_description: S.optional(S.String).annotations({
      description: "Human-readable error description",
    }),
  },
  $I.annotations("SSOCallbackUrlParams", {
    description: "URL parameters for SSO callback endpoint.",
  })
) {}

/**
 * Success response for SSO callback.
 *
 * @since 1.0.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /** Redirect URL after successful SSO callback */
    url: S.optionalWith(BS.URLString, { nullable: true }).annotations({
      description: "Redirect URL after successful SSO callback",
    }),
  },
  $I.annotations("SSOCallbackSuccess", {
    description: "SSO callback success response.",
  })
) {}

/**
 * SSO callback endpoint contract.
 *
 * GET /sso/callback/:providerId
 *
 * Handles OIDC authorization code callback from SSO providers.
 * Auto-handled by Better Auth's sso() plugin.
 *
 * @since 1.0.0
 */
export const Contract = HttpApiEndpoint.get("callback", "/callback/:providerId")
  .setPath(PathParams)
  .setUrlParams(UrlParams)
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error during SSO callback processing.",
      })
    )
  );
