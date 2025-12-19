/**
 * @module callback
 *
 * OAuth2 callback endpoint contract.
 * Handles the OAuth2 callback from the authorization server.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/oauth2/callback");

/**
 * Path parameters for the OAuth2 callback endpoint.
 *
 * @since 1.0.0
 * @category Schema
 */
export class PathParams extends S.Class<PathParams>($I`PathParams`)(
  {
    /**
     * The OAuth2 provider identifier.
     */
    providerId: S.String.annotations({
      description: "The OAuth2 provider identifier.",
    }),
  },
  $I.annotations("OAuth2CallbackPathParams", {
    description: "Path parameters for the OAuth2 callback endpoint.",
  })
) {}

/**
 * URL parameters for the OAuth2 callback endpoint.
 *
 * @since 1.0.0
 * @category Schema
 */
export class UrlParams extends S.Class<UrlParams>($I`UrlParams`)(
  {
    /**
     * The authorization code returned by the authorization server.
     */
    code: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "The authorization code returned by the authorization server.",
    }),

    /**
     * Error code if the authorization failed.
     */
    error: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "Error code if the authorization failed.",
    }),

    /**
     * Human-readable error description.
     */
    error_description: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "Human-readable error description.",
    }),

    /**
     * The state parameter from the original authorization request.
     */
    state: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "The state parameter from the original authorization request.",
    }),
  },
  $I.annotations("OAuth2CallbackUrlParams", {
    description: "URL parameters for the OAuth2 callback endpoint.",
  })
) {}

/**
 * Success response from the callback endpoint.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * The URL to redirect the user to after processing the callback.
     */
    url: S.optionalWith(BS.URLString, { nullable: true }).annotations({
      description: "The URL to redirect the user to after processing the callback.",
    }),
  },
  $I.annotations("OAuth2CallbackSuccess", {
    description: "Success response from the OAuth2 callback endpoint.",
  })
) {}

/**
 * OAuth2 callback endpoint contract.
 *
 * GET /oauth2/callback/:providerId
 *
 * Handles the callback from an OAuth2 provider after the user has authorized
 * or denied the request.
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.get("callback", "/callback/:providerId")
  .setPath(PathParams)
  .setUrlParams(UrlParams)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure during OAuth2 callback processing.",
      })
    )
  )
  .addSuccess(Success);
