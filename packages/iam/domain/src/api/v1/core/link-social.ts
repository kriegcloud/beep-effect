/**
 * @module link-social
 *
 * Domain contract for linking a social provider account to an existing user.
 *
 * @category exports
 * @since 0.1.0
 */

import { AuthProviderNameValue } from "@beep/constants";
import { CommonFields, IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/core/link-social");

/**
 * Payload for linking a social provider account.
 *
 * @since 0.1.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    /**
     * The OAuth provider name to link.
     */
    provider: AuthProviderNameValue.annotations({
      description: "The OAuth provider name to link.",
    }),

    /**
     * URL to redirect after successful linking.
     */
    callbackURL: S.optionalWith(BS.URLPath, { as: "Option", exact: true }).annotations({
      description: "URL to redirect after successful linking.",
    }),

    /**
     * URL to redirect on error.
     */
    errorCallbackURL: S.optionalWith(BS.URLPath, { as: "Option", exact: true }).annotations({
      description: "URL to redirect on error.",
    }),

    /**
     * Disable automatic redirect to provider.
     */
    disableRedirect: S.optionalWith(S.Boolean, { as: "Option", exact: true }).annotations({
      description: "Disable automatic redirect to provider.",
    }),

    /**
     * Request sign up flow.
     */
    requestSignUp: S.optionalWith(S.Boolean, { as: "Option", exact: true }).annotations({
      description: "Request sign up flow.",
    }),

    /**
     * Additional OAuth scopes to request.
     */
    scopes: S.optionalWith(S.mutable(S.Array(S.String)), { as: "Option", exact: true }).annotations({
      description: "Additional OAuth scopes to request.",
    }),

    /**
     * ID token for verification when using token-based linking.
     */
    idToken: S.optionalWith(
      S.Struct({
        token: S.Redacted(S.String).annotations({
          description: "ID token from the provider",
        }),
        accessToken: S.optionalWith(S.Redacted(S.String), { as: "Option", exact: true }).annotations({
          description: "Access token from the provider",
        }),
        expiresAt: S.optionalWith(BS.EpochMillisFromAllAcceptable, { as: "Option", exact: true }).annotations({
          description: "Expiry date of the token",
        }),
        nonce: S.optionalWith(S.Redacted(S.String), { as: "Option", exact: true }).annotations({
          description: "Nonce used to generate the token",
        }),
        refreshToken: S.optionalWith(S.Redacted(S.String), { as: "Option", exact: true }).annotations({
          description: "Refresh token from the provider",
        }),
      }),
      { as: "Option", exact: true }
    ).annotations({
      description: "ID token for verification when using token-based linking.",
    }),

    /**
     * Additional provider-specific data.
     */
    additionalData: S.optionalWith(S.Record({ key: S.String, value: S.Unknown }), {
      as: "Option",
      exact: true,
    }).annotations({
      description: "Additional provider-specific data.",
    }),
  },
  $I.annotations("LinkSocialPayload", {
    description: "Payload for linking a social provider account to an existing user.",
  })
) {}

/**
 * Success response after initiating social account linking.
 *
 * @since 0.1.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * Whether the user should be redirected.
     */
    redirect: CommonFields.Redirect.annotations({
      description: "Whether the user should be redirected.",
    }),

    /**
     * Authorization URL to redirect to.
     */
    url: CommonFields.RedirectURL.annotations({
      description: "Authorization URL to redirect to.",
    }),

    /**
     * Operation status.
     */
    status: S.optionalWith(S.Boolean, { as: "Option", nullable: true }).annotations({
      description: "Operation status.",
    }),
  },
  $I.annotations("LinkSocialSuccess", {
    description: "Success response after initiating social account linking.",
  })
) {}

/**
 * Link social endpoint contract.
 *
 * POST /link-social
 *
 * Links a social provider account to the authenticated user.
 *
 * @since 0.1.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("link-social", "/link-social")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to link social account.",
      })
    )
  )
  .addSuccess(Success);
