/**
 * @module token
 *
 * OAuth2 token endpoint contract.
 * Exchanges authorization codes for access tokens.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/oauth2/token");

/**
 * Payload for the token endpoint.
 * Follows RFC 6749 - OAuth 2.0 Token Endpoint.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    /**
     * The grant type being requested.
     * Typically 'authorization_code' or 'refresh_token'.
     */
    grant_type: S.String.annotations({
      description: "The grant type being requested (e.g., 'authorization_code', 'refresh_token').",
    }),

    /**
     * The authorization code received from the authorize endpoint.
     * Required when grant_type is 'authorization_code'.
     */
    code: S.optionalWith(S.String, { nullable: true }).annotations({
      description: "The authorization code received from the authorize endpoint.",
    }),

    /**
     * The redirect URI used in the authorization request.
     * Required when grant_type is 'authorization_code'.
     */
    redirect_uri: S.optionalWith(S.String, { nullable: true }).annotations({
      description: "The redirect URI used in the authorization request.",
    }),

    /**
     * The client identifier.
     */
    client_id: S.optionalWith(S.String, { nullable: true }).annotations({
      description: "The client identifier.",
    }),

    /**
     * The client secret.
     */
    client_secret: S.optionalWith(S.String, { nullable: true }).annotations({
      description: "The client secret.",
    }),

    /**
     * The refresh token for obtaining a new access token.
     * Required when grant_type is 'refresh_token'.
     */
    refresh_token: S.optionalWith(S.String, { nullable: true }).annotations({
      description: "The refresh token for obtaining a new access token.",
    }),

    /**
     * PKCE code verifier.
     * Required when code_challenge was used in authorization.
     */
    code_verifier: S.optionalWith(S.String, { nullable: true }).annotations({
      description: "PKCE code verifier.",
    }),
  },
  $I.annotations("OAuth2TokenPayload", {
    description: "Payload for the OAuth2 token endpoint.",
  })
) {}

/**
 * Success response containing the access token.
 * Follows RFC 6749 - OAuth 2.0 Token Response.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * The access token issued by the authorization server.
     */
    access_token: S.String.annotations({
      description: "The access token issued by the authorization server.",
    }),

    /**
     * The type of the token issued (typically 'Bearer').
     */
    token_type: S.String.annotations({
      description: "The type of the token issued (typically 'Bearer').",
    }),

    /**
     * The lifetime in seconds of the access token.
     */
    expires_in: S.optionalWith(S.Number, { nullable: true }).annotations({
      description: "The lifetime in seconds of the access token.",
    }),

    /**
     * The refresh token for obtaining new access tokens.
     */
    refresh_token: S.optionalWith(S.String, { nullable: true }).annotations({
      description: "The refresh token for obtaining new access tokens.",
    }),

    /**
     * The scope of the access token.
     */
    scope: S.optionalWith(S.String, { nullable: true }).annotations({
      description: "The scope of the access token.",
    }),

    /**
     * OpenID Connect ID token (if openid scope was requested).
     */
    id_token: S.optionalWith(S.String, { nullable: true }).annotations({
      description: "OpenID Connect ID token (if openid scope was requested).",
    }),
  },
  $I.annotations("OAuth2TokenSuccess", {
    description: "Success response containing the OAuth2 access token.",
  })
) {}

/**
 * OAuth2 token endpoint contract.
 *
 * POST /oauth2/token
 *
 * Exchanges an authorization code for an access token, or refreshes
 * an existing access token using a refresh token.
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("token", "/token")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure during token exchange.",
      })
    )
  )
  .addSuccess(Success);
