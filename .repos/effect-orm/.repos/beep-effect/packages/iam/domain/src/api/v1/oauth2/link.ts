/**
 * @module link
 *
 * OAuth2 link endpoint contract.
 * Links an OAuth2 provider account to the current user.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/oauth2/link");

/**
 * Payload for the link endpoint.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    /**
     * The OAuth2 provider identifier to link.
     */
    providerId: S.String.annotations({
      description: "The OAuth2 provider identifier to link.",
    }),

    /**
     * The URL to redirect to after linking is complete.
     */
    callbackURL: BS.URLString.annotations({
      description: "The URL to redirect to after linking is complete.",
    }),

    /**
     * Additional scopes to request from the provider.
     */
    scopes: S.optionalWith(S.mutable(S.Array(S.String)), { nullable: true }).annotations({
      description: "Additional scopes to request from the provider.",
    }),

    /**
     * URL to redirect to if an error occurs during linking.
     */
    errorCallbackURL: S.optionalWith(BS.URLString, { nullable: true }).annotations({
      description: "URL to redirect to if an error occurs during linking.",
    }),
  },
  $I.annotations("OAuth2LinkPayload", {
    description: "Payload for the OAuth2 link endpoint.",
  })
) {}

/**
 * Success response from the link endpoint.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * The URL to redirect the user to for OAuth2 provider authorization.
     */
    url: BS.URLString.annotations({
      description: "The URL to redirect the user to for OAuth2 provider authorization.",
    }),

    /**
     * Whether to perform a redirect.
     */
    redirect: S.Boolean.annotations({
      description: "Whether to perform a redirect.",
    }),
  },
  $I.annotations("OAuth2LinkSuccess", {
    description: "Success response from the OAuth2 link endpoint.",
  })
) {}

/**
 * OAuth2 link endpoint contract.
 *
 * POST /oauth2/link
 *
 * Initiates the process of linking an OAuth2 provider account to the
 * currently authenticated user.
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("link", "/link")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to initiate account linking.",
      })
    )
  )
  .addSuccess(Success);
