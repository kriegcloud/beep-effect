/**
 * @module authorize
 *
 * OAuth2 authorization endpoint contract.
 * Initiates the OAuth2 authorization code flow.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/oauth2/authorize");

/**
 * URL parameters for the OAuth2 authorize endpoint.
 *
 * @since 1.0.0
 * @category Schema
 */
export class UrlParams extends S.Class<UrlParams>($I`UrlParams`)(
  {
    /**
     * The client identifier issued to the client during the registration process.
     */
    client_id: S.String.annotations({
      description: "The client identifier issued to the client during registration.",
    }),

    /**
     * The URI to redirect the user-agent to after authorization.
     */
    redirect_uri: S.String.annotations({
      description: "The URI to redirect the user-agent to after authorization.",
    }),

    /**
     * The type of response expected. Typically 'code' for authorization code flow.
     */
    response_type: S.String.annotations({
      description: "The type of response expected (e.g., 'code').",
    }),

    /**
     * The scope of the access request.
     */
    scope: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "The scope of the access request.",
    }),

    /**
     * An opaque value used to maintain state between the request and callback.
     */
    state: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "An opaque value for maintaining state between request and callback.",
    }),

    /**
     * PKCE code challenge.
     */
    code_challenge: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "PKCE code challenge.",
    }),

    /**
     * PKCE code challenge method (e.g., 'S256').
     */
    code_challenge_method: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "PKCE code challenge method (e.g., 'S256').",
    }),

    /**
     * Nonce for OpenID Connect requests.
     */
    nonce: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "Nonce for OpenID Connect requests.",
    }),

    /**
     * Prompt parameter for OpenID Connect (e.g., 'login', 'consent', 'none').
     */
    prompt: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "Prompt parameter for OpenID Connect.",
    }),
  },
  $I.annotations("OAuth2AuthorizeUrlParams", {
    description: "URL parameters for the OAuth2 authorize endpoint.",
  })
) {}

/**
 * Success response from the authorize endpoint.
 * Returns a redirect URL to the consent page or directly to the callback.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * The URL to redirect the user to (consent page or callback).
     */
    url: S.optionalWith(BS.URLString, { nullable: true }).annotations({
      description: "The URL to redirect the user to.",
    }),

    /**
     * Whether to perform a redirect.
     */
    redirect: S.optionalWith(S.Boolean, { nullable: true }).annotations({
      description: "Whether to perform a redirect.",
    }),
  },
  $I.annotations("OAuth2AuthorizeSuccess", {
    description: "Success response from the OAuth2 authorize endpoint.",
  })
) {}

/**
 * OAuth2 authorize endpoint contract.
 *
 * GET /oauth2/authorize
 *
 * Initiates the OAuth2 authorization code flow. The client redirects the user
 * to this endpoint to request authorization.
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.get("authorize", "/authorize")
  .setUrlParams(UrlParams)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure during OAuth2 authorization.",
      })
    )
  )
  .addSuccess(Success);
